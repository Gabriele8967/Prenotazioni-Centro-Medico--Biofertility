const Booking = require('../models/Booking');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Service = require('../models/Service');
const { validationResult } = require('express-validator');
const moment = require('moment-timezone');

class BookingsController {
    // Ottenere tutte le prenotazioni
    static async getAllBookings(req, res) {
        try {
            const { 
                customer_id, 
                provider_id, 
                status, 
                payment_status, 
                date_from, 
                date_to,
                limit,
                offset
            } = req.query;

            const filters = {};
            if (customer_id) filters.customer_id = customer_id;
            if (provider_id) filters.provider_id = provider_id;
            if (status) filters.status = status;
            if (payment_status) filters.payment_status = payment_status;
            if (date_from) filters.date_from = date_from;
            if (date_to) filters.date_to = date_to;

            const bookings = await Booking.findAll(filters);
            
            // Paginazione se richiesta
            let paginatedBookings = bookings;
            if (limit) {
                const limitNum = parseInt(limit);
                const offsetNum = parseInt(offset) || 0;
                paginatedBookings = bookings.slice(offsetNum, offsetNum + limitNum);
            }

            res.json({
                success: true,
                data: paginatedBookings,
                count: paginatedBookings.length,
                total: bookings.length
            });
        } catch (error) {
            console.error('Errore nel recuperare le prenotazioni:', error);
            res.status(500).json({
                success: false,
                message: 'Errore interno del server',
                error: error.message
            });
        }
    }

    // Ottenere una prenotazione per ID
    static async getBookingById(req, res) {
        try {
            const { id } = req.params;
            
            const booking = await Booking.findById(id);
            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: 'Prenotazione non trovata'
                });
            }

            res.json({
                success: true,
                data: booking
            });
        } catch (error) {
            console.error('Errore nel recuperare la prenotazione:', error);
            res.status(500).json({
                success: false,
                message: 'Errore interno del server',
                error: error.message
            });
        }
    }

    // Ottenere una prenotazione per token
    static async getBookingByToken(req, res) {
        try {
            const { token } = req.params;
            
            const booking = await Booking.findByToken(token);
            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: 'Prenotazione non trovata'
                });
            }

            res.json({
                success: true,
                data: booking
            });
        } catch (error) {
            console.error('Errore nel recuperare la prenotazione per token:', error);
            res.status(500).json({
                success: false,
                message: 'Errore interno del server',
                error: error.message
            });
        }
    }

    // Creare una nuova prenotazione
    static async createBooking(req, res) {
        try {
            // Validazione input
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Dati non validi',
                    errors: errors.array()
                });
            }

            const {
                service_id,
                provider_id,
                location_id,
                customer_data,
                start_datetime,
                persons,
                custom_fields,
                notes
            } = req.body;

            // Verifico che il servizio esista
            const service = await Service.findById(service_id);
            if (!service) {
                return res.status(404).json({
                    success: false,
                    message: 'Servizio non trovato'
                });
            }

            // Verifico che il provider esista
            const provider = await User.findById(provider_id);
            if (!provider || provider.type !== 'provider') {
                return res.status(404).json({
                    success: false,
                    message: 'Provider non trovato'
                });
            }

            // Calcolo la data/ora di fine basata sulla durata del servizio
            const startMoment = moment(start_datetime);
            const endMoment = startMoment.clone().add(service.duration, 'seconds');

            // Verifico se lo slot è disponibile
            const isAvailable = await Appointment.isSlotAvailable(
                provider_id,
                start_datetime,
                endMoment.format('YYYY-MM-DD HH:mm:ss')
            );

            if (!isAvailable) {
                return res.status(409).json({
                    success: false,
                    message: 'Lo slot selezionato non è disponibile'
                });
            }

            // Gestisco il cliente (creo nuovo o uso esistente)
            let customer;
            if (customer_data.id) {
                customer = await User.findById(customer_data.id);
                if (!customer) {
                    return res.status(404).json({
                        success: false,
                        message: 'Cliente non trovato'
                    });
                }
            } else {
                // Verifico se esiste già un cliente con la stessa email
                if (customer_data.email) {
                    customer = await User.findByEmail(customer_data.email);
                }
                
                if (!customer) {
                    // Creo un nuovo cliente
                    customer = await User.create({
                        type: 'customer',
                        first_name: customer_data.first_name,
                        last_name: customer_data.last_name,
                        email: customer_data.email,
                        phone: customer_data.phone,
                        country_code: customer_data.country_code || 'it',
                        timezone: customer_data.timezone || 'Europe/Rome'
                    });
                }
            }

            // Creo l'appuntamento
            const appointmentStatus = service.requiresConfirmation() ? 'pending' : 'confirmed';
            const appointment = await Appointment.create({
                service_id,
                provider_id,
                location_id,
                start_datetime,
                end_datetime: endMoment.format('YYYY-MM-DD HH:mm:ss'),
                status: appointmentStatus,
                notes
            });

            // Creo la prenotazione
            const bookingStatus = service.requiresConfirmation() ? 'pending' : 'confirmed';
            const booking = await Booking.create({
                appointment_id: appointment.id,
                customer_id: customer.id,
                status: bookingStatus,
                price: service.price * (persons || 1),
                persons: persons || 1,
                custom_fields,
                payment_status: 'pending'
            });

            // Recupero la prenotazione completa con tutti i dettagli
            const completeBooking = await Booking.findById(booking.id);

            res.status(201).json({
                success: true,
                message: service.requiresConfirmation() ? 
                    'Prenotazione creata, in attesa di conferma' : 
                    'Prenotazione confermata con successo',
                data: completeBooking
            });

        } catch (error) {
            console.error('Errore nella creazione della prenotazione:', error);
            res.status(500).json({
                success: false,
                message: 'Errore interno del server',
                error: error.message
            });
        }
    }

    // Aggiornare una prenotazione
    static async updateBooking(req, res) {
        try {
            const { id } = req.params;
            
            // Validazione input
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Dati non validi',
                    errors: errors.array()
                });
            }

            const bookingData = req.body;
            const booking = await Booking.update(id, bookingData);

            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: 'Prenotazione non trovata'
                });
            }

            res.json({
                success: true,
                message: 'Prenotazione aggiornata con successo',
                data: booking
            });
        } catch (error) {
            console.error('Errore nell\'aggiornamento della prenotazione:', error);
            res.status(500).json({
                success: false,
                message: 'Errore interno del server',
                error: error.message
            });
        }
    }

    // Confermare una prenotazione
    static async confirmBooking(req, res) {
        try {
            const { id } = req.params;
            
            const booking = await Booking.confirm(id);
            
            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: 'Prenotazione non trovata'
                });
            }

            res.json({
                success: true,
                message: 'Prenotazione confermata con successo',
                data: booking
            });
        } catch (error) {
            console.error('Errore nella conferma della prenotazione:', error);
            res.status(500).json({
                success: false,
                message: 'Errore interno del server',
                error: error.message
            });
        }
    }

    // Cancellare una prenotazione
    static async cancelBooking(req, res) {
        try {
            const { id } = req.params;
            const { reason } = req.body;
            
            const success = await Booking.cancel(id, reason);
            
            if (!success) {
                return res.status(404).json({
                    success: false,
                    message: 'Prenotazione non trovata'
                });
            }

            res.json({
                success: true,
                message: 'Prenotazione cancellata con successo'
            });
        } catch (error) {
            console.error('Errore nella cancellazione della prenotazione:', error);
            res.status(500).json({
                success: false,
                message: 'Errore interno del server',
                error: error.message
            });
        }
    }

    // Segnare come completata
    static async completeBooking(req, res) {
        try {
            const { id } = req.params;
            
            const booking = await Booking.complete(id);
            
            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: 'Prenotazione non trovata'
                });
            }

            res.json({
                success: true,
                message: 'Prenotazione completata con successo',
                data: booking
            });
        } catch (error) {
            console.error('Errore nel completamento della prenotazione:', error);
            res.status(500).json({
                success: false,
                message: 'Errore interno del server',
                error: error.message
            });
        }
    }

    // Segnare come no-show
    static async markAsNoShow(req, res) {
        try {
            const { id } = req.params;
            
            const booking = await Booking.markAsNoShow(id);
            
            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: 'Prenotazione non trovata'
                });
            }

            res.json({
                success: true,
                message: 'Prenotazione segnata come no-show',
                data: booking
            });
        } catch (error) {
            console.error('Errore nel segnare come no-show:', error);
            res.status(500).json({
                success: false,
                message: 'Errore interno del server',
                error: error.message
            });
        }
    }

    // Aggiornare lo status del pagamento
    static async updatePaymentStatus(req, res) {
        try {
            const { id } = req.params;
            const { payment_status } = req.body;
            
            if (!['pending', 'paid', 'refunded'].includes(payment_status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Status di pagamento non valido'
                });
            }

            const booking = await Booking.updatePaymentStatus(id, payment_status);
            
            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: 'Prenotazione non trovata'
                });
            }

            res.json({
                success: true,
                message: 'Status di pagamento aggiornato con successo',
                data: booking
            });
        } catch (error) {
            console.error('Errore nell\'aggiornamento del pagamento:', error);
            res.status(500).json({
                success: false,
                message: 'Errore interno del server',
                error: error.message
            });
        }
    }

    // Ottenere slot disponibili
    static async getAvailableSlots(req, res) {
        try {
            const { provider_id, service_id, date, location_id } = req.query;

            if (!provider_id || !service_id || !date) {
                return res.status(400).json({
                    success: false,
                    message: 'provider_id, service_id e date sono obbligatori'
                });
            }

            const slots = await Appointment.findAvailableSlots(
                provider_id,
                service_id,
                date,
                location_id || null
            );

            res.json({
                success: true,
                data: slots,
                count: slots.length
            });
        } catch (error) {
            console.error('Errore nel recuperare gli slot disponibili:', error);
            res.status(500).json({
                success: false,
                message: 'Errore interno del server',
                error: error.message
            });
        }
    }
}

module.exports = BookingsController;