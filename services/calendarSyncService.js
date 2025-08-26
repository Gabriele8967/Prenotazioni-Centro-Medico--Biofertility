const { GoogleCalendarService } = require('./googleCalendarService');
const moment = require('moment-timezone');

class CalendarSyncService {
    constructor() {
        this.googleCalendar = new GoogleCalendarService();
        this.syncInterval = null;
        this.webhookUrl = process.env.WEBHOOK_URL || `${process.env.FRONTEND_URL}/api/calendar/webhook`;
        
        // Configurazioni
        this.SYNC_INTERVAL = 5 * 60 * 1000; // 5 minuti
        this.MAX_DAYS_AHEAD = 30; // Sincronizza eventi fino a 30 giorni nel futuro
    }

    // Avvia sincronizzazione automatica
    async startSync() {
        try {
            console.log('🔄 Avvio servizio sincronizzazione bidirezionale Google Calendar...');
            
            // Setup webhook per notifiche real-time
            if (this.webhookUrl && process.env.GOOGLE_CALENDAR_ID) {
                try {
                    await this.googleCalendar.setupCalendarWebhook(this.webhookUrl);
                    console.log('✅ Webhook Google Calendar configurato');
                } catch (error) {
                    console.warn('⚠️  Webhook non configurabile, uso polling:', error.message);
                }
            }
            
            // Sincronizzazione iniziale
            await this.fullSync();
            
            // Avvia polling di backup (nel caso il webhook fallisca)
            this.syncInterval = setInterval(() => {
                this.incrementalSync().catch(console.error);
            }, this.SYNC_INTERVAL);
            
            console.log(`✅ Sincronizzazione automatica attivata (polling ogni ${this.SYNC_INTERVAL/1000}s)`);
            
        } catch (error) {
            console.error('❌ Errore avvio sincronizzazione:', error.message);
            throw error;
        }
    }

    // Ferma sincronizzazione
    stopSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
            console.log('🛑 Sincronizzazione automatica fermata');
        }
    }

    // Sincronizzazione completa (primo avvio)
    async fullSync() {
        try {
            console.log('📅 Sincronizzazione completa Google Calendar...');
            
            const startDate = moment().format('YYYY-MM-DD');
            const endDate = moment().add(this.MAX_DAYS_AHEAD, 'days').format('YYYY-MM-DD');
            
            console.log(`📊 Sincronizzazione dal ${startDate} al ${endDate}`);
            
            // Per ogni giorno, verifica eventi e invalida cache
            const promises = [];
            for (let d = moment(); d.isSameOrBefore(moment().add(this.MAX_DAYS_AHEAD, 'days')); d.add(1, 'day')) {
                const dateStr = d.format('YYYY-MM-DD');
                promises.push(this.syncDay(dateStr));
            }
            
            await Promise.all(promises);
            console.log('✅ Sincronizzazione completa terminata');
            
        } catch (error) {
            console.error('❌ Errore sincronizzazione completa:', error.message);
            throw error;
        }
    }

    // Sincronizzazione incrementale (solo modifiche recenti)
    async incrementalSync() {
        try {
            console.log('🔄 Sincronizzazione incrementale Google Calendar...');
            
            // Ottieni eventi modificati di recente
            const modifiedEvents = await this.googleCalendar.syncCalendarToDatabase();
            
            if (modifiedEvents.length > 0) {
                console.log(`📝 Trovati ${modifiedEvents.length} eventi modificati`);
                
                // Invalida cache per le date modificate
                const modifiedDates = new Set();
                modifiedEvents.forEach(event => {
                    const eventDate = moment(event.start.dateTime || event.start.date).format('YYYY-MM-DD');
                    modifiedDates.add(eventDate);
                });
                
                // Refresh cache per date modificate
                for (const date of modifiedDates) {
                    await this.googleCalendar.refreshCacheForDate(date);
                    console.log(`🔄 Cache aggiornata per ${date}`);
                }
                
                console.log(`✅ Sincronizzazione incrementale completata - ${modifiedDates.size} date aggiornate`);
            } else {
                console.log('✅ Nessuna modifica rilevata');
            }
            
        } catch (error) {
            console.error('❌ Errore sincronizzazione incrementale:', error.message);
        }
    }

    // Sincronizza un singolo giorno
    async syncDay(date) {
        try {
            // Forza refresh cache per questa data
            await this.googleCalendar.refreshCacheForDate(date);
            return true;
        } catch (error) {
            console.error(`❌ Errore sincronizzazione giorno ${date}:`, error.message);
            return false;
        }
    }

    // Gestisce webhook da Google Calendar
    async handleWebhook(req, res) {
        try {
            const headers = req.headers;
            const body = req.body;
            
            console.log('🔔 Webhook Google Calendar ricevuto');
            
            // Verifica token di sicurezza
            const token = headers['x-goog-channel-token'];
            if (token && token !== (process.env.WEBHOOK_SECRET || 'sistema-prenotazioni')) {
                console.warn('⚠️  Token webhook non valido');
                return res.status(401).send('Unauthorized');
            }
            
            // Gestisci notifica
            const result = await this.googleCalendar.handleWebhookNotification(headers, body);
            
            if (result.status === 'synced') {
                console.log('✅ Sincronizzazione da webhook completata');
            }
            
            res.status(200).send('OK');
            
        } catch (error) {
            console.error('❌ Errore gestione webhook:', error.message);
            res.status(500).send('Error');
        }
    }

    // API per forzare sincronizzazione manuale
    async forcSync(date = null) {
        try {
            if (date) {
                console.log(`🔄 Sincronizzazione forzata per ${date}`);
                return await this.syncDay(date);
            } else {
                console.log('🔄 Sincronizzazione forzata completa');
                return await this.fullSync();
            }
        } catch (error) {
            console.error('❌ Errore sincronizzazione forzata:', error.message);
            throw error;
        }
    }

    // Ottieni statistiche sincronizzazione
    getStats() {
        return {
            ...this.googleCalendar.getSyncStats(),
            syncInterval: this.SYNC_INTERVAL,
            webhookUrl: this.webhookUrl,
            syncActive: !!this.syncInterval,
            maxDaysAhead: this.MAX_DAYS_AHEAD
        };
    }

    // Test connessione Google Calendar
    async testConnection() {
        try {
            const today = moment().format('YYYY-MM-DD');
            const events = await this.googleCalendar.getEventsForDay(today);
            
            return {
                connected: true,
                eventsToday: events.length,
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

    // Pulisce tutti i dati di sincronizzazione
    async cleanup() {
        try {
            this.stopSync();
            this.googleCalendar.clearCache();
            console.log('🧹 Cleanup sincronizzazione completato');
        } catch (error) {
            console.error('❌ Errore cleanup:', error.message);
        }
    }
}

module.exports = CalendarSyncService;