const express = require('express');
const { body } = require('express-validator');
const Appointment = require('../models/Appointment');

const router = express.Router();

// Controller methods
const getAllAppointments = async (req, res) => {
    try {
        const { 
            provider_id, 
            service_id, 
            location_id, 
            status, 
            date_from, 
            date_to 
        } = req.query;

        const filters = {};
        if (provider_id) filters.provider_id = provider_id;
        if (service_id) filters.service_id = service_id;
        if (location_id) filters.location_id = location_id;
        if (status) filters.status = status;
        if (date_from) filters.date_from = date_from;
        if (date_to) filters.date_to = date_to;

        const appointments = await Appointment.findAll(filters);
        
        res.json({
            success: true,
            data: appointments,
            count: appointments.length
        });
    } catch (error) {
        console.error('Errore nel recuperare gli appuntamenti:', error);
        res.status(500).json({
            success: false,
            message: 'Errore interno del server',
            error: error.message
        });
    }
};

const getAppointmentById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const appointment = await Appointment.findById(id);
        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appuntamento non trovato'
            });
        }

        res.json({
            success: true,
            data: appointment
        });
    } catch (error) {
        console.error('Errore nel recuperare l\'appuntamento:', error);
        res.status(500).json({
            success: false,
            message: 'Errore interno del server',
            error: error.message
        });
    }
};

const getAppointmentBookings = async (req, res) => {
    try {
        const { id } = req.params;
        
        const appointment = await Appointment.findById(id);
        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appuntamento non trovato'
            });
        }

        const bookings = await appointment.getBookings();
        
        res.json({
            success: true,
            data: bookings,
            count: bookings.length
        });
    } catch (error) {
        console.error('Errore nel recuperare le prenotazioni dell\'appuntamento:', error);
        res.status(500).json({
            success: false,
            message: 'Errore interno del server',
            error: error.message
        });
    }
};

const createAppointment = async (req, res) => {
    try {
        const appointmentData = req.body;
        const appointment = await Appointment.create(appointmentData);

        res.status(201).json({
            success: true,
            message: 'Appuntamento creato con successo',
            data: appointment
        });
    } catch (error) {
        console.error('Errore nella creazione dell\'appuntamento:', error);
        res.status(500).json({
            success: false,
            message: error.message.includes('non è disponibile') ? error.message : 'Errore interno del server',
            error: error.message
        });
    }
};

const updateAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const appointmentData = req.body;
        
        const appointment = await Appointment.update(id, appointmentData);
        
        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appuntamento non trovato'
            });
        }

        res.json({
            success: true,
            message: 'Appuntamento aggiornato con successo',
            data: appointment
        });
    } catch (error) {
        console.error('Errore nell\'aggiornamento dell\'appuntamento:', error);
        res.status(500).json({
            success: false,
            message: error.message.includes('non è disponibile') ? error.message : 'Errore interno del server',
            error: error.message
        });
    }
};

const cancelAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        
        const success = await Appointment.cancel(id, reason);
        
        if (!success) {
            return res.status(404).json({
                success: false,
                message: 'Appuntamento non trovato'
            });
        }

        res.json({
            success: true,
            message: 'Appuntamento cancellato con successo'
        });
    } catch (error) {
        console.error('Errore nella cancellazione dell\'appuntamento:', error);
        res.status(500).json({
            success: false,
            message: 'Errore interno del server',
            error: error.message
        });
    }
};

// Validazione per creazione/aggiornamento appuntamento
const appointmentValidation = [
    body('service_id')
        .isInt({ min: 1 })
        .withMessage('ID servizio non valido'),
    body('provider_id')
        .isInt({ min: 1 })
        .withMessage('ID provider non valido'),
    body('start_datetime')
        .isISO8601()
        .withMessage('Data/ora di inizio non valida (formato ISO8601 richiesto)'),
    body('end_datetime')
        .isISO8601()
        .withMessage('Data/ora di fine non valida (formato ISO8601 richiesto)'),
    body('location_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('ID location non valido'),
    body('status')
        .optional()
        .isIn(['pending', 'confirmed', 'completed', 'cancelled'])
        .withMessage('Status non valido')
];

// Routes

/**
 * @route   GET /api/appointments
 * @desc    Ottenere tutti gli appuntamenti
 * @access  Private
 * @params  ?provider_id=1&service_id=2&location_id=1&status=confirmed&date_from=2025-01-01&date_to=2025-12-31
 */
router.get('/', getAllAppointments);

/**
 * @route   GET /api/appointments/:id
 * @desc    Ottenere appuntamento per ID
 * @access  Private
 */
router.get('/:id', getAppointmentById);

/**
 * @route   GET /api/appointments/:id/bookings
 * @desc    Ottenere prenotazioni di un appuntamento
 * @access  Private
 */
router.get('/:id/bookings', getAppointmentBookings);

/**
 * @route   POST /api/appointments
 * @desc    Creare nuovo appuntamento
 * @access  Private (Provider/Admin)
 */
router.post('/', appointmentValidation, createAppointment);

/**
 * @route   PUT /api/appointments/:id
 * @desc    Aggiornare appuntamento
 * @access  Private (Provider/Admin)
 */
router.put('/:id', appointmentValidation, updateAppointment);

/**
 * @route   PATCH /api/appointments/:id/cancel
 * @desc    Cancellare appuntamento
 * @access  Private (Provider/Admin)
 * @body    { reason?: string }
 */
router.patch('/:id/cancel', cancelAppointment);

module.exports = router;