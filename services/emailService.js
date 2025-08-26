const nodemailer = require('nodemailer');
const ical = require('ical-generator');
const moment = require('moment-timezone');
const sanitizeHtml = require('sanitize-html');
require('dotenv').config();

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransporter({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        // Verifica configurazione email
        this.transporter.verify((error, success) => {
            if (error) {
                console.error('❌ Configurazione email non valida:', error.message);
            } else {
                console.log('✅ Server email configurato correttamente');
            }
        });
    }

    // Genera evento calendario ICS
    generateCalendarEvent(bookingData) {
        const calendar = ical({
            name: 'Prenotazione Centro Infertilità',
            timezone: 'Europe/Rome'
        });

        calendar.createEvent({
            start: moment(bookingData.start_datetime).tz('Europe/Rome').toDate(),
            end: moment(bookingData.end_datetime).tz('Europe/Rome').toDate(),
            summary: `${bookingData.service_name} - ${process.env.COMPANY_NAME}`,
            description: this.generateEventDescription(bookingData),
            location: bookingData.location_address || process.env.COMPANY_ADDRESS,
            url: process.env.PAYMENT_URL,
            organizer: {
                name: process.env.COMPANY_NAME,
                email: process.env.COMPANY_EMAIL
            }
        });

        return calendar.toString();
    }

    // Genera descrizione evento
    generateEventDescription(bookingData) {
        return `
Prenotazione confermata presso ${process.env.COMPANY_NAME}

DETTAGLI APPUNTAMENTO:
• Servizio: ${bookingData.service_name}
• Medico: ${bookingData.provider_first_name} ${bookingData.provider_last_name}
• Data: ${moment(bookingData.start_datetime).tz('Europe/Rome').format('dddd DD/MM/YYYY')}
• Orario: ${moment(bookingData.start_datetime).tz('Europe/Rome').format('HH:mm')}
• Durata: ${Math.round(bookingData.service_duration / 60)} minuti
• Sede: ${bookingData.location_name}
• Codice: ${bookingData.booking_token}

Per il pagamento: ${process.env.PAYMENT_URL}

${process.env.COMPANY_NAME}
${process.env.COMPANY_ADDRESS}
Tel: ${process.env.COMPANY_PHONE}
        `.trim();
    }

    // Email di conferma per il paziente
    async sendCustomerConfirmation(bookingData) {
        try {
            const icsContent = this.generateCalendarEvent(bookingData);
            
            const mailOptions = {
                from: process.env.EMAIL_FROM,
                to: bookingData.customer_email,
                subject: `✅ Conferma prenotazione - ${bookingData.service_name}`,
                html: this.generateCustomerEmailHtml(bookingData),
                text: this.generateCustomerEmailText(bookingData),
                attachments: [
                    {
                        filename: 'prenotazione.ics',
                        content: icsContent,
                        contentType: 'text/calendar'
                    }
                ]
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log('✅ Email conferma paziente inviata:', result.messageId);
            return result;
        } catch (error) {
            console.error('❌ Errore invio email paziente:', error);
            throw error;
        }
    }

    // Email di notifica per l'azienda
    async sendAdminNotification(bookingData) {
        try {
            const mailOptions = {
                from: process.env.EMAIL_FROM,
                to: process.env.ADMIN_EMAIL,
                subject: `🆕 Nuova prenotazione - ${bookingData.service_name}`,
                html: this.generateAdminEmailHtml(bookingData),
                text: this.generateAdminEmailText(bookingData)
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log('✅ Email notifica admin inviata:', result.messageId);
            return result;
        } catch (error) {
            console.error('❌ Errore invio email admin:', error);
            throw error;
        }
    }

    // Template HTML email paziente
    generateCustomerEmailHtml(bookingData) {
        const formattedDate = moment(bookingData.start_datetime).tz('Europe/Rome').format('dddd DD MMMM YYYY');
        const formattedTime = moment(bookingData.start_datetime).tz('Europe/Rome').format('HH:mm');
        
        return `
        <!DOCTYPE html>
        <html lang="it">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Conferma Prenotazione</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #1788FB, #1A84EE); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
                .footer { background: #333; color: white; padding: 15px; text-align: center; font-size: 12px; border-radius: 0 0 8px 8px; }
                .info-box { background: white; border-left: 4px solid #1788FB; padding: 15px; margin: 10px 0; }
                .payment-box { background: #e8f5e8; border: 1px solid #4CAF50; padding: 15px; margin: 15px 0; text-align: center; border-radius: 5px; }
                .btn { display: inline-block; background: #1788FB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
                .privacy { font-size: 11px; color: #666; margin-top: 20px; padding: 10px; background: #f5f5f5; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>✅ Prenotazione Confermata</h1>
                <p>${process.env.COMPANY_NAME}</p>
            </div>
            
            <div class="content">
                <p>Gentile <strong>${bookingData.customer_first_name} ${bookingData.customer_last_name}</strong>,</p>
                
                <p>La sua prenotazione è stata <strong>confermata con successo</strong>.</p>
                
                <div class="info-box">
                    <h3>📋 Dettagli Appuntamento</h3>
                    <p><strong>Servizio:</strong> ${bookingData.service_name}</p>
                    <p><strong>Medico:</strong> ${bookingData.provider_first_name} ${bookingData.provider_last_name}</p>
                    <p><strong>Data:</strong> ${formattedDate}</p>
                    <p><strong>Orario:</strong> ${formattedTime}</p>
                    <p><strong>Durata:</strong> ${Math.round(bookingData.service_duration / 60)} minuti</p>
                    <p><strong>Sede:</strong> ${bookingData.location_name}</p>
                    <p><strong>Codice Prenotazione:</strong> <code>${bookingData.booking_token}</code></p>
                </div>

                <div class="payment-box">
                    <h3>💳 Pagamento</h3>
                    <p>Per completare la prenotazione, effettui il pagamento cliccando sul link seguente:</p>
                    <a href="${process.env.PAYMENT_URL}" class="btn" target="_blank">Effettua Pagamento</a>
                    <p><small>Importo: €${parseFloat(bookingData.price).toFixed(2)}</small></p>
                </div>

                <div class="info-box">
                    <h3>📍 Come Raggiungerci</h3>
                    <p>${bookingData.location_address || process.env.COMPANY_ADDRESS}</p>
                    <p><strong>Telefono:</strong> ${process.env.COMPANY_PHONE}</p>
                </div>

                <p><strong>Note importanti:</strong></p>
                <ul>
                    <li>Si presenti 10 minuti prima dell'orario previsto</li>
                    <li>Porti con sé un documento d'identità valido</li>
                    <li>Per disdire o modificare: contatti la segreteria</li>
                    <li>Ha allegato un file .ics per aggiungere l'appuntamento al suo calendario</li>
                </ul>
            </div>

            <div class="footer">
                <p><strong>${process.env.COMPANY_NAME}</strong></p>
                <p>${process.env.COMPANY_ADDRESS}</p>
                <p>Tel: ${process.env.COMPANY_PHONE} | Email: ${process.env.COMPANY_EMAIL}</p>
            </div>

            <div class="privacy">
                <p><strong>Informativa Privacy (Art. 13 GDPR):</strong> I suoi dati personali sono trattati dal ${process.env.COMPANY_NAME} 
                per la gestione della prenotazione e l'erogazione del servizio sanitario richiesto. 
                I dati saranno conservati per il tempo necessario alla prestazione e agli obblighi di legge. 
                Ha diritto di accesso, rettifica, cancellazione e opposizione. 
                Per maggiori informazioni: <a href="${process.env.PRIVACY_POLICY_URL || '#'}">${process.env.PRIVACY_POLICY_URL || 'Contatti la segreteria'}</a></p>
            </div>
        </body>
        </html>
        `;
    }

    // Template testo email paziente
    generateCustomerEmailText(bookingData) {
        const formattedDate = moment(bookingData.start_datetime).tz('Europe/Rome').format('dddd DD/MM/YYYY');
        const formattedTime = moment(bookingData.start_datetime).tz('Europe/Rome').format('HH:mm');
        
        return `
✅ PRENOTAZIONE CONFERMATA - ${process.env.COMPANY_NAME}

Gentile ${bookingData.customer_first_name} ${bookingData.customer_last_name},

La sua prenotazione è stata confermata con successo.

DETTAGLI APPUNTAMENTO:
• Servizio: ${bookingData.service_name}
• Medico: ${bookingData.provider_first_name} ${bookingData.provider_last_name}  
• Data: ${formattedDate}
• Orario: ${formattedTime}
• Durata: ${Math.round(bookingData.service_duration / 60)} minuti
• Sede: ${bookingData.location_name}
• Codice: ${bookingData.booking_token}

💳 PAGAMENTO:
Per completare la prenotazione: ${process.env.PAYMENT_URL}
Importo: €${parseFloat(bookingData.price).toFixed(2)}

📍 SEDE:
${bookingData.location_address || process.env.COMPANY_ADDRESS}
Tel: ${process.env.COMPANY_PHONE}

NOTE IMPORTANTI:
- Si presenti 10 minuti prima dell'orario
- Porti documento d'identità valido
- Per modifiche contatti la segreteria

${process.env.COMPANY_NAME}
${process.env.COMPANY_EMAIL}

Informativa Privacy: I suoi dati sono trattati per la gestione della prenotazione sanitaria. Info: ${process.env.PRIVACY_POLICY_URL || 'contatti segreteria'}
        `.trim();
    }

    // Template HTML email admin
    generateAdminEmailHtml(bookingData) {
        const formattedDate = moment(bookingData.start_datetime).tz('Europe/Rome').format('dddd DD/MM/YYYY');
        const formattedTime = moment(bookingData.start_datetime).tz('Europe/Rome').format('HH:mm');
        
        return `
        <!DOCTYPE html>
        <html lang="it">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Nuova Prenotazione</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 700px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; }
                .container { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
                .header { background: linear-gradient(135deg, #1788FB, #1A84EE); color: white; padding: 30px 20px; text-align: center; }
                .header h1 { margin: 0; font-size: 28px; font-weight: 300; }
                .header .subtitle { font-size: 16px; opacity: 0.9; margin-top: 8px; }
                .content { padding: 30px; }
                .section { margin-bottom: 25px; }
                .section-title { color: #1788FB; font-size: 18px; font-weight: 600; margin-bottom: 15px; display: flex; align-items: center; gap: 8px; }
                .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; }
                .info-item { background: #f8f9fa; padding: 12px; border-radius: 8px; border-left: 3px solid #1788FB; }
                .info-item .label { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
                .info-item .value { font-weight: 600; font-size: 14px; color: #333; }
                .customer-section { background: linear-gradient(135deg, #e3f2fd, #f0f8ff); padding: 20px; border-radius: 10px; margin: 20px 0; }
                .patient-info { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
                .patient-item { background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                .patient-item .icon { width: 40px; height: 40px; background: #1788FB; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 10px; color: white; font-size: 18px; }
                .summary-box { background: linear-gradient(135deg, #f0f8ff, #e8f5e8); border: 2px solid #1788FB; padding: 20px; border-radius: 12px; margin: 20px 0; text-align: center; }
                .price-highlight { font-size: 24px; font-weight: bold; color: #1788FB; margin: 10px 0; }
                .actions-list { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
                .actions-list ul { margin: 0; padding-left: 20px; }
                .actions-list li { margin: 8px 0; color: #856404; }
                .footer { background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #dee2e6; }
                .footer .timestamp { font-size: 12px; color: #666; }
                @media (max-width: 600px) {
                    .info-grid, .patient-info { grid-template-columns: 1fr; }
                    .container { margin: 10px; }
                    .content { padding: 20px; }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🆕 Nuova Prenotazione</h1>
                    <div class="subtitle">Sistema di Prenotazioni Online</div>
                </div>
                
                <div class="content">
                    <div class="section">
                        <div class="section-title">
                            📅 Dettagli Appuntamento
                        </div>
                        <div class="info-grid">
                            <div class="info-item">
                                <div class="label">Servizio</div>
                                <div class="value">${bookingData.service_name}</div>
                            </div>
                            <div class="info-item">
                                <div class="label">Tipo di Visita</div>
                                <div class="value">${bookingData.service_name}</div>
                            </div>
                            <div class="info-item">
                                <div class="label">Data</div>
                                <div class="value">${formattedDate}</div>
                            </div>
                            <div class="info-item">
                                <div class="label">Orario</div>
                                <div class="value">${formattedTime}</div>
                            </div>
                            <div class="info-item">
                                <div class="label">Medico</div>
                                <div class="value">Dr. ${bookingData.provider_first_name} ${bookingData.provider_last_name}</div>
                            </div>
                            <div class="info-item">
                                <div class="label">Durata</div>
                                <div class="value">${Math.round(bookingData.service_duration / 60)} minuti</div>
                            </div>
                            <div class="info-item">
                                <div class="label">Sede</div>
                                <div class="value">${bookingData.location_name}</div>
                            </div>
                            <div class="info-item">
                                <div class="label">Codice Prenotazione</div>
                                <div class="value" style="font-family: monospace; background: #e9ecef; padding: 4px 8px; border-radius: 4px;">${bookingData.booking_token}</div>
                            </div>
                        </div>
                    </div>

                    <div class="customer-section">
                        <div class="section-title">
                            👤 Informazioni Paziente Complete
                        </div>
                        <div class="patient-info">
                            <div class="patient-item">
                                <div class="icon">👤</div>
                                <div class="label">Nome Completo</div>
                                <div class="value">${bookingData.customer_first_name} ${bookingData.customer_last_name}</div>
                            </div>
                            <div class="patient-item">
                                <div class="icon">📧</div>
                                <div class="label">Email</div>
                                <div class="value">${bookingData.customer_email || 'Non fornita'}</div>
                            </div>
                            <div class="patient-item">
                                <div class="icon">📞</div>
                                <div class="label">Numero di Telefono</div>
                                <div class="value">${bookingData.customer_phone}</div>
                            </div>
                        </div>
                        ${bookingData.notes ? `
                        <div style="margin-top: 15px;">
                            <div class="label">📝 Note del Paziente</div>
                            <div style="background: white; padding: 12px; border-radius: 6px; border-left: 3px solid #1788FB; margin-top: 8px;">
                                ${bookingData.notes}
                            </div>
                        </div>
                        ` : ''}
                    </div>

                    <div class="summary-box">
                        <div class="section-title" style="justify-content: center;">
                            💰 Riepilogo Economico
                        </div>
                        <div class="price-highlight">€${parseFloat(bookingData.price).toFixed(2)}</div>
                        <div style="font-size: 14px; color: #666;">Importo da pagare</div>
                    </div>

                    <div class="actions-list">
                        <div class="section-title">
                            ✅ Azioni Automatiche Completate
                        </div>
                        <ul>
                            <li><strong>Email di conferma</strong> inviata automaticamente al paziente</li>
                            <li><strong>Calendario .ics</strong> allegato alla email del paziente</li>
                            <li><strong>Link pagamento</strong> inviato: <a href="${process.env.PAYMENT_URL}" style="color: #1788FB;">${process.env.PAYMENT_URL}</a></li>
                            <li><strong>Evento Google Calendar</strong> creato con tutti i dati del paziente (se configurato)</li>
                            <li><strong>Codice prenotazione</strong> generato: ${bookingData.booking_token}</li>
                        </ul>
                    </div>

                    <div class="actions-list" style="background: #ffe6e6; border-left: 4px solid #dc3545;">
                        <div class="section-title" style="color: #dc3545;">
                            📋 Azioni da Completare Manualmente
                        </div>
                        <ul style="color: #721c24;">
                            <li>Verificare disponibilità del medico nel calendario</li>
                            <li>Preparare la cartella clinica del paziente</li>
                            <li>Confermare la prenotazione della sala/ambulatorio</li>
                            <li>Aggiornare l'agenda personale del medico</li>
                        </ul>
                    </div>
                </div>

                <div class="footer">
                    <div style="font-weight: 600; margin-bottom: 8px;">${process.env.COMPANY_NAME}</div>
                    <div style="font-size: 14px; color: #666; margin-bottom: 12px;">${process.env.COMPANY_ADDRESS}</div>
                    <div style="font-size: 14px; color: #666;">📞 ${process.env.COMPANY_PHONE} | 📧 ${process.env.COMPANY_EMAIL}</div>
                    <div class="timestamp">Prenotazione ricevuta: ${moment().tz('Europe/Rome').format('DD/MM/YYYY HH:mm')}</div>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    // Template testo email admin
    generateAdminEmailText(bookingData) {
        const formattedDate = moment(bookingData.start_datetime).tz('Europe/Rome').format('dddd DD/MM/YYYY');
        const formattedTime = moment(bookingData.start_datetime).tz('Europe/Rome').format('HH:mm');
        
        return `
🆕 NUOVA PRENOTAZIONE RICEVUTA

DETTAGLI APPUNTAMENTO:
• Servizio: ${bookingData.service_name} (Tipo di Visita)
• Data: ${formattedDate}  
• Orario: ${formattedTime}
• Medico: Dr. ${bookingData.provider_first_name} ${bookingData.provider_last_name}
• Durata: ${Math.round(bookingData.service_duration / 60)} minuti
• Sede: ${bookingData.location_name}
• Prezzo: €${parseFloat(bookingData.price).toFixed(2)}
• Codice Prenotazione: ${bookingData.booking_token}

INFORMAZIONI PAZIENTE COMPLETE:
• Nome Completo: ${bookingData.customer_first_name} ${bookingData.customer_last_name}
• Email: ${bookingData.customer_email || 'Non fornita'}
• Numero di Telefono: ${bookingData.customer_phone}
${bookingData.notes ? `• Note del Paziente: ${bookingData.notes}` : ''}

AZIONI AUTOMATICHE COMPLETATE:
✅ Email di conferma inviata automaticamente al paziente
✅ Calendario .ics allegato alla email del paziente
✅ Link pagamento inviato: ${process.env.PAYMENT_URL}
✅ Evento Google Calendar creato con tutti i dati del paziente
✅ Codice prenotazione generato: ${bookingData.booking_token}

AZIONI DA COMPLETARE MANUALMENTE:
📋 Verificare disponibilità del medico nel calendario
📋 Preparare la cartella clinica del paziente
📋 Confermare la prenotazione della sala/ambulatorio
📋 Aggiornare l'agenda personale del medico

Sistema Prenotazioni - ${process.env.COMPANY_NAME}
Prenotazione ricevuta: ${moment().tz('Europe/Rome').format('DD/MM/YYYY HH:mm')}
        `.trim();
    }

    // Email di cancellazione
    async sendCancellationEmail(bookingData, reason = '') {
        try {
            const formattedDate = moment(bookingData.start_datetime).tz('Europe/Rome').format('dddd DD/MM/YYYY HH:mm');
            
            const mailOptions = {
                from: process.env.EMAIL_FROM,
                to: bookingData.customer_email,
                subject: `❌ Cancellazione prenotazione - ${bookingData.service_name}`,
                html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: #f44336; color: white; padding: 20px; text-align: center;">
                        <h1>❌ Prenotazione Cancellata</h1>
                    </div>
                    <div style="padding: 20px; background: #f9f9f9;">
                        <p>Gentile <strong>${bookingData.customer_first_name} ${bookingData.customer_last_name}</strong>,</p>
                        
                        <p>La sua prenotazione è stata <strong>cancellata</strong>.</p>
                        
                        <div style="background: white; padding: 15px; border-left: 4px solid #f44336;">
                            <h3>Dettagli Prenotazione Cancellata</h3>
                            <p><strong>Servizio:</strong> ${bookingData.service_name}</p>
                            <p><strong>Data/Ora:</strong> ${formattedDate}</p>
                            <p><strong>Codice:</strong> ${bookingData.booking_token}</p>
                            ${reason ? `<p><strong>Motivo:</strong> ${reason}</p>` : ''}
                        </div>

                        <p>Per riprogrammare l'appuntamento, la preghiamo di contattare la segreteria.</p>
                        
                        <p>Cordiali saluti,<br><strong>${process.env.COMPANY_NAME}</strong></p>
                    </div>
                </div>
                `
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log('✅ Email cancellazione inviata:', result.messageId);
            return result;
        } catch (error) {
            console.error('❌ Errore invio email cancellazione:', error);
            throw error;
        }
    }

    // Test connessione email
    async testConnection() {
        try {
            await this.transporter.verify();
            console.log('✅ Connessione email OK');
            return true;
        } catch (error) {
            console.error('❌ Errore connessione email:', error.message);
            return false;
        }
    }
}

module.exports = EmailService;