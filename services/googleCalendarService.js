const { google } = require('googleapis');
const moment = require('moment-timezone');
require('dotenv').config();

class GoogleCalendarService {
    constructor() {
        this.oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        );

        // Se hai già i token salvati, impostali qui
        // In produzione, dovresti salvare i token in database
        this.oauth2Client.setCredentials({
            refresh_token: process.env.GOOGLE_REFRESH_TOKEN
        });

        this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

        // Cache per ottimizzare le performance
        this.eventsCache = new Map();
        this.cacheExpiry = new Map();
        this.CACHE_DURATION = 5 * 60 * 1000; // 5 minuti

        // Webhook setup per notifiche real-time
        this.watchToken = null;
        this.webhookExpiry = null;
        
        // Sync statistics
        this.syncStats = {
            lastSync: null,
            eventsProcessed: 0,
            cacheHits: 0,
            cacheMisses: 0,
            webhookNotifications: 0
        };
    }

    // Genera URL per autorizzazione Google
    getAuthUrl() {
        const scopes = [
            'https://www.googleapis.com/auth/calendar',
            'https://www.googleapis.com/auth/calendar.events'
        ];

        return this.oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes,
            prompt: 'consent'
        });
    }

    // Imposta i token dopo l'autorizzazione
    async setCredentials(code) {
        try {
            const { tokens } = await this.oauth2Client.getToken(code);
            this.oauth2Client.setCredentials(tokens);
            return tokens;
        } catch (error) {
            throw new Error('Errore nell\'ottenere i token: ' + error.message);
        }
    }

    // Verifica disponibilità nel calendario
    async checkAvailability(startTime, endTime, calendarId = process.env.GOOGLE_CALENDAR_ID) {
        try {
            const response = await this.calendar.freebusy.query({
                requestBody: {
                    timeMin: moment(startTime).toISOString(),
                    timeMax: moment(endTime).toISOString(),
                    items: [{ id: calendarId }]
                }
            });

            const busy = response.data.calendars[calendarId]?.busy || [];
            return busy.length === 0; // true se libero, false se occupato
        } catch (error) {
            console.error('Errore controllo disponibilità:', error.message);
            return true; // In caso di errore, assumiamo sia disponibile
        }
    }

    // Ottieni eventi esistenti per un giorno con cache intelligente
    async getEventsForDay(date, calendarId = process.env.GOOGLE_CALENDAR_ID) {
        try {
            const cacheKey = `events_${date}_${calendarId}`;
            const now = Date.now();

            // Verifica cache
            if (this.eventsCache.has(cacheKey) && this.cacheExpiry.get(cacheKey) > now) {
                this.syncStats.cacheHits++;
                console.log(`📋 Cache HIT per ${date}`);
                return this.eventsCache.get(cacheKey);
            }

            // Cache miss - fetch da Google Calendar
            this.syncStats.cacheMisses++;
            console.log(`🔄 Recupero eventi da Google Calendar per ${date}`);

            const startOfDay = moment.tz(date, 'Europe/Rome').startOf('day').toISOString();
            const endOfDay = moment.tz(date, 'Europe/Rome').endOf('day').toISOString();

            const response = await this.calendar.events.list({
                calendarId: calendarId,
                timeMin: startOfDay,
                timeMax: endOfDay,
                singleEvents: true,
                orderBy: 'startTime'
            });

            const events = response.data.items || [];

            // Salva in cache
            this.eventsCache.set(cacheKey, events);
            this.cacheExpiry.set(cacheKey, now + this.CACHE_DURATION);

            console.log(`📅 Trovati ${events.length} eventi per ${date}`);
            this.syncStats.eventsProcessed += events.length;

            return events;
        } catch (error) {
            console.error('Errore recupero eventi:', error.message);
            return [];
        }
    }

    // Crea evento nel calendario con dati paziente dettagliati
    async createEvent(eventData) {
        try {
            // Costruisci il titolo con nome, cognome e tipo di visita
            const eventTitle = `${eventData.patientFirstName} ${eventData.patientLastName} - ${eventData.serviceName}`;
            
            // Costruisci la descrizione dettagliata con tutte le informazioni del paziente
            const eventDescription = `
PRENOTAZIONE APPUNTAMENTO MEDICO

👤 PAZIENTE:
• Nome Completo: ${eventData.patientFirstName} ${eventData.patientLastName}
• Email: ${eventData.patientEmail || 'Non fornita'}
• Numero di Telefono: ${eventData.patientPhone}

🏥 DETTAGLI VISITA:
• Tipo di Visita: ${eventData.serviceName}
• Durata: ${Math.round((eventData.serviceDuration || 1800) / 60)} minuti
• Medico: Dr. ${eventData.providerFirstName} ${eventData.providerLastName}
• Sede: ${eventData.locationName}

💰 INFORMAZIONI ECONOMICHE:
• Prezzo: €${parseFloat(eventData.price || 0).toFixed(2)}
• Codice Prenotazione: ${eventData.bookingToken}
• Link Pagamento: ${process.env.PAYMENT_URL}

${eventData.patientNotes ? `📝 NOTE PAZIENTE:\n${eventData.patientNotes}` : ''}

📍 INDIRIZZO:
${eventData.locationAddress || process.env.COMPANY_ADDRESS}
Tel: ${process.env.COMPANY_PHONE}

✉️ Sistema generato automaticamente
Centro Infertilità - Biofertility
            `.trim();

            const event = {
                summary: eventTitle,
                description: eventDescription,
                location: eventData.locationAddress || process.env.COMPANY_ADDRESS,
                start: {
                    dateTime: moment(eventData.startTime).toISOString(),
                    timeZone: 'Europe/Rome'
                },
                end: {
                    dateTime: moment(eventData.endTime).toISOString(),
                    timeZone: 'Europe/Rome'
                },
                attendees: [
                    ...(eventData.patientEmail ? [{
                        email: eventData.patientEmail,
                        displayName: `${eventData.patientFirstName} ${eventData.patientLastName}`,
                        responseStatus: 'accepted'
                    }] : []),
                    ...(eventData.attendees || [])
                ],
                reminders: {
                    useDefault: false,
                    overrides: [
                        { method: 'email', minutes: 24 * 60 }, // 1 giorno prima
                        { method: 'popup', minutes: 60 }, // 1 ora prima
                        { method: 'sms', minutes: 120 } // 2 ore prima (se abilitato)
                    ]
                },
                colorId: '9', // Blu per appuntamenti medici
                extendedProperties: {
                    private: {
                        bookingId: eventData.bookingId?.toString(),
                        serviceId: eventData.serviceId?.toString(),
                        providerId: eventData.providerId?.toString(),
                        patientFirstName: eventData.patientFirstName,
                        patientLastName: eventData.patientLastName,
                        patientEmail: eventData.patientEmail,
                        patientPhone: eventData.patientPhone,
                        serviceName: eventData.serviceName,
                        bookingToken: eventData.bookingToken,
                        source: 'sistema_prenotazioni'
                    }
                },
                // Aggiungi guest permissions
                guestsCanInviteOthers: false,
                guestsCanModify: false,
                guestsCanSeeOtherGuests: false
            };

            const response = await this.calendar.events.insert({
                calendarId: process.env.GOOGLE_CALENDAR_ID,
                requestBody: event,
                sendUpdates: 'all'
            });

            console.log(`✅ Evento Google Calendar creato: "${eventTitle}" - ${moment(eventData.startTime).format('DD/MM/YYYY HH:mm')}`);
            return response.data;
        } catch (error) {
            console.error('❌ Errore creazione evento Google Calendar:', error.message);
            throw new Error('Impossibile creare evento nel calendario: ' + error.message);
        }
    }

    // Aggiorna evento esistente con dati paziente dettagliati
    async updateEvent(eventId, eventData) {
        try {
            // Costruisci il titolo aggiornato con nome, cognome e tipo di visita
            const eventTitle = `${eventData.patientFirstName} ${eventData.patientLastName} - ${eventData.serviceName}`;
            
            // Costruisci la descrizione aggiornata con tutte le informazioni del paziente
            const eventDescription = `
PRENOTAZIONE APPUNTAMENTO MEDICO (AGGIORNATA)

👤 PAZIENTE:
• Nome Completo: ${eventData.patientFirstName} ${eventData.patientLastName}
• Email: ${eventData.patientEmail || 'Non fornita'}
• Numero di Telefono: ${eventData.patientPhone}

🏥 DETTAGLI VISITA:
• Tipo di Visita: ${eventData.serviceName}
• Durata: ${Math.round((eventData.serviceDuration || 1800) / 60)} minuti
• Medico: Dr. ${eventData.providerFirstName} ${eventData.providerLastName}
• Sede: ${eventData.locationName}

💰 INFORMAZIONI ECONOMICHE:
• Prezzo: €${parseFloat(eventData.price || 0).toFixed(2)}
• Codice Prenotazione: ${eventData.bookingToken}
• Link Pagamento: ${process.env.PAYMENT_URL}

${eventData.patientNotes ? `📝 NOTE PAZIENTE:\n${eventData.patientNotes}` : ''}

📍 INDIRIZZO:
${eventData.locationAddress || process.env.COMPANY_ADDRESS}
Tel: ${process.env.COMPANY_PHONE}

✉️ Sistema aggiornato automaticamente
Centro Infertilità - Biofertility
            `.trim();

            const event = {
                summary: eventTitle,
                description: eventDescription,
                location: eventData.locationAddress || process.env.COMPANY_ADDRESS,
                start: {
                    dateTime: moment(eventData.startTime).toISOString(),
                    timeZone: 'Europe/Rome'
                },
                end: {
                    dateTime: moment(eventData.endTime).toISOString(),
                    timeZone: 'Europe/Rome'
                },
                attendees: [
                    ...(eventData.patientEmail ? [{
                        email: eventData.patientEmail,
                        displayName: `${eventData.patientFirstName} ${eventData.patientLastName}`,
                        responseStatus: 'accepted'
                    }] : []),
                    ...(eventData.attendees || [])
                ],
                extendedProperties: {
                    private: {
                        bookingId: eventData.bookingId?.toString(),
                        serviceId: eventData.serviceId?.toString(),
                        providerId: eventData.providerId?.toString(),
                        patientFirstName: eventData.patientFirstName,
                        patientLastName: eventData.patientLastName,
                        patientEmail: eventData.patientEmail,
                        patientPhone: eventData.patientPhone,
                        serviceName: eventData.serviceName,
                        bookingToken: eventData.bookingToken,
                        source: 'sistema_prenotazioni'
                    }
                }
            };

            const response = await this.calendar.events.update({
                calendarId: process.env.GOOGLE_CALENDAR_ID,
                eventId: eventId,
                requestBody: event,
                sendUpdates: 'all'
            });

            console.log(`✅ Evento Google Calendar aggiornato: "${eventTitle}" - ${moment(eventData.startTime).format('DD/MM/YYYY HH:mm')}`);
            return response.data;
        } catch (error) {
            console.error('❌ Errore aggiornamento evento Google Calendar:', error.message);
            throw new Error('Impossibile aggiornare evento: ' + error.message);
        }
    }

    // Elimina evento
    async deleteEvent(eventId) {
        try {
            await this.calendar.events.delete({
                calendarId: process.env.GOOGLE_CALENDAR_ID,
                eventId: eventId,
                sendUpdates: 'all'
            });

            return true;
        } catch (error) {
            console.error('Errore eliminazione evento:', error.message);
            throw new Error('Impossibile eliminare evento: ' + error.message);
        }
    }

    // Genera slot disponibili considerando il calendario Google con controllo bidirezionale
    async getAvailableSlots(providerId, date, serviceDuration, workingHours) {
        try {
            console.log(`🔍 Generazione slot per ${date} - controllo bidirezionale...`);
            const existingEvents = await this.getEventsForDay(date);
            const slots = [];

            // Orari di lavoro standard (9:00 - 18:00)
            const startHour = workingHours?.start || 9;
            const endHour = workingHours?.end || 18;
            
            const dayStart = moment.tz(`${date} ${startHour}:00`, 'Europe/Rome');
            const dayEnd = moment.tz(`${date} ${endHour}:00`, 'Europe/Rome');

            console.log(`⏰ Orari di lavoro: ${dayStart.format('HH:mm')} - ${dayEnd.format('HH:mm')}`);
            console.log(`📅 Eventi esistenti trovati: ${existingEvents.length}`);

            // Log eventi per debug
            existingEvents.forEach(event => {
                const start = moment(event.start.dateTime || event.start.date);
                const end = moment(event.end.dateTime || event.end.date);
                console.log(`   📌 "${event.summary}" (${start.format('HH:mm')} - ${end.format('HH:mm')})`);
            });

            // Genera slot ogni 30 minuti
            let currentSlot = dayStart.clone();
            const now = moment();

            while (currentSlot.clone().add(serviceDuration, 'seconds').isSameOrBefore(dayEnd)) {
                const slotEnd = currentSlot.clone().add(serviceDuration, 'seconds');

                // Controlla se lo slot è nel futuro
                if (currentSlot.isAfter(now)) {
                    // CONTROLLO BIDIREZIONALE: verifica conflitti con TUTTI gli eventi Google Calendar
                    const hasConflict = existingEvents.some(event => {
                        const eventStart = moment(event.start.dateTime || event.start.date);
                        const eventEnd = moment(event.end.dateTime || event.end.date);
                        
                        const conflict = currentSlot.isBefore(eventEnd) && slotEnd.isAfter(eventStart);
                        
                        if (conflict) {
                            console.log(`❌ Slot ${currentSlot.format('HH:mm')} occupato da: "${event.summary}" (${eventStart.format('HH:mm')} - ${eventEnd.format('HH:mm')})`);
                        }
                        
                        return conflict;
                    });

                    if (!hasConflict) {
                        slots.push({
                            start_datetime: currentSlot.format('YYYY-MM-DD HH:mm:ss'),
                            end_datetime: slotEnd.format('YYYY-MM-DD HH:mm:ss'),
                            formatted_time: currentSlot.format('HH:mm'),
                            available: true
                        });
                        console.log(`✅ Slot ${currentSlot.format('HH:mm')} disponibile`);
                    }
                }

                currentSlot.add(30, 'minutes'); // Slot ogni 30 minuti
            }

            console.log(`📊 Totale slot disponibili: ${slots.length}`);
            return slots;
        } catch (error) {
            console.error('Errore generazione slot:', error.message);
            // Ritorna slot di fallback senza controllo calendario
            return this.generateFallbackSlots(date, serviceDuration, workingHours);
        }
    }

    // Genera slot di fallback senza controllo calendario
    generateFallbackSlots(date, serviceDuration, workingHours) {
        const slots = [];
        const startHour = workingHours?.start || 9;
        const endHour = workingHours?.end || 18;
        
        const dayStart = moment.tz(`${date} ${startHour}:00`, 'Europe/Rome');
        const dayEnd = moment.tz(`${date} ${endHour}:00`, 'Europe/Rome');

        let currentSlot = dayStart.clone();
        const now = moment();

        while (currentSlot.clone().add(serviceDuration, 'seconds').isSameOrBefore(dayEnd)) {
            if (currentSlot.isAfter(now)) {
                const slotEnd = currentSlot.clone().add(serviceDuration, 'seconds');
                slots.push({
                    start_datetime: currentSlot.format('YYYY-MM-DD HH:mm:ss'),
                    end_datetime: slotEnd.format('YYYY-MM-DD HH:mm:ss'),
                    formatted_time: currentSlot.format('HH:mm'),
                    available: true
                });
            }
            currentSlot.add(30, 'minutes');
        }

        return slots;
    }

    // Setup webhook per notifiche real-time da Google Calendar
    async setupCalendarWebhook(webhookUrl) {
        try {
            console.log(`🔗 Setup webhook Google Calendar: ${webhookUrl}`);
            
            const channelId = `sistema-prenotazioni-${Date.now()}`;
            const token = process.env.WEBHOOK_SECRET || 'sistema-prenotazioni';

            const response = await this.calendar.events.watch({
                calendarId: process.env.GOOGLE_CALENDAR_ID,
                requestBody: {
                    id: channelId,
                    type: 'web_hook',
                    address: webhookUrl,
                    token: token,
                    params: {
                        ttl: '86400' // 24 ore
                    }
                }
            });

            this.watchToken = response.data.id;
            this.webhookExpiry = new Date(parseInt(response.data.expiration));

            console.log(`✅ Webhook configurato - ID: ${channelId}, scade: ${this.webhookExpiry}`);
            return response.data;
        } catch (error) {
            console.error('❌ Errore setup webhook:', error.message);
            throw error;
        }
    }

    // Gestisce notifiche webhook da Google Calendar
    async handleWebhookNotification(headers, body) {
        try {
            console.log('🔔 Ricevuta notifica webhook Google Calendar');
            this.syncStats.webhookNotifications++;

            const resourceState = headers['x-goog-resource-state'];
            const resourceId = headers['x-goog-resource-id'];
            const channelId = headers['x-goog-channel-id'];

            console.log(`📡 Stato: ${resourceState}, Resource: ${resourceId}, Channel: ${channelId}`);

            if (resourceState === 'sync') {
                console.log('🔄 Sincronizzazione iniziale webhook - nessuna azione necessaria');
                return { status: 'sync', message: 'Sincronizzazione iniziale' };
            }

            // Per qualsiasi altro cambiamento, invalida cache e forza refresh
            if (resourceState === 'update' || resourceState === 'exists') {
                console.log('🔄 Evento modificato - invalidazione cache');
                
                // Invalida tutta la cache per sicurezza (events possono essere spostati tra giorni)
                this.clearCache();
                
                // Aggiorna timestamp ultima sincronizzazione
                this.syncStats.lastSync = new Date().toISOString();
                
                return { status: 'synced', message: 'Cache invalidata per modifica eventi' };
            }

            return { status: 'ignored', message: 'Notifica ignorata' };
        } catch (error) {
            console.error('❌ Errore gestione webhook:', error.message);
            return { status: 'error', message: error.message };
        }
    }

    // Sincronizza calendario con database (per sincronizzazione incrementale)
    async syncCalendarToDatabase() {
        try {
            console.log('🔄 Sincronizzazione Google Calendar verso database...');
            
            const now = moment();
            const endDate = moment().add(30, 'days');
            
            const response = await this.calendar.events.list({
                calendarId: process.env.GOOGLE_CALENDAR_ID,
                timeMin: now.toISOString(),
                timeMax: endDate.toISOString(),
                singleEvents: true,
                orderBy: 'startTime',
                updatedMin: this.syncStats.lastSync || moment().subtract(1, 'hour').toISOString()
            });

            const events = response.data.items || [];
            console.log(`📅 Trovati ${events.length} eventi modificati di recente`);

            this.syncStats.lastSync = new Date().toISOString();
            this.syncStats.eventsProcessed += events.length;

            return events;
        } catch (error) {
            console.error('❌ Errore sincronizzazione calendario:', error.message);
            return [];
        }
    }

    // Refresh cache per una data specifica
    async refreshCacheForDate(date) {
        try {
            const calendarId = process.env.GOOGLE_CALENDAR_ID;
            const cacheKey = `events_${date}_${calendarId}`;
            
            // Rimuovi dalla cache
            this.eventsCache.delete(cacheKey);
            this.cacheExpiry.delete(cacheKey);
            
            // Ricarica eventi (che saranno automaticamente messi in cache)
            const events = await this.getEventsForDay(date);
            console.log(`🔄 Cache refreshed per ${date} - ${events.length} eventi`);
            
            return events;
        } catch (error) {
            console.error(`❌ Errore refresh cache per ${date}:`, error.message);
            return [];
        }
    }

    // Pulisce tutta la cache
    clearCache() {
        const cacheSize = this.eventsCache.size;
        this.eventsCache.clear();
        this.cacheExpiry.clear();
        console.log(`🧹 Cache pulita - ${cacheSize} voci rimosse`);
    }

    // Ottieni statistiche sincronizzazione
    getSyncStats() {
        return {
            ...this.syncStats,
            cacheSize: this.eventsCache.size,
            webhookActive: !!this.watchToken,
            webhookExpiry: this.webhookExpiry
        };
    }

    // Test connessione Google Calendar
    async testConnection() {
        try {
            const response = await this.calendar.calendarList.list();
            return {
                connected: true,
                calendarsCount: response.data.items?.length || 0,
                message: 'Connessione Google Calendar OK'
            };
        } catch (error) {
            return {
                connected: false,
                error: error.message,
                message: 'Errore connessione Google Calendar'
            };
        }
    }
}

// Funzione helper per inizializzare il servizio
function createCalendarService() {
    try {
        const service = new GoogleCalendarService();
        console.log('✅ Google Calendar Service inizializzato');
        return service;
    } catch (error) {
        console.error('❌ Errore inizializzazione Google Calendar:', error.message);
        return null;
    }
}

module.exports = { GoogleCalendarService, createCalendarService };