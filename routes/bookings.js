const express = require('express');
const { body, query } = require('express-validator');
const BookingsController = require('../controllers/bookingsController');

const router = express.Router();

// Validazione per creazione prenotazione
const bookingValidation = [
    body('service_id')
        .isInt({ min: 1 })
        .withMessage('ID servizio non valido'),
    body('provider_id')
        .isInt({ min: 1 })
        .withMessage('ID provider non valido'),
    body('start_datetime')
        .isISO8601()
        .withMessage('Data/ora di inizio non valida (formato ISO8601 richiesto)'),
    body('customer_data')
        .isObject()
        .withMessage('Dati cliente obbligatori'),
    body('customer_data.first_name')
        .notEmpty()
        .withMessage('Nome cliente obbligatorio')
        .isLength({ min: 2, max: 100 })
        .withMessage('Nome deve essere tra 2 e 100 caratteri'),
    body('customer_data.last_name')
        .notEmpty()
        .withMessage('Cognome cliente obbligatorio')
        .isLength({ min: 2, max: 100 })
        .withMessage('Cognome deve essere tra 2 e 100 caratteri'),
    body('customer_data.email')
        .optional()
        .isEmail()
        .withMessage('Email non valida'),
    body('customer_data.phone')
        .optional()
        .isMobilePhone()
        .withMessage('Numero di telefono non valido'),
    body('location_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('ID location non valido'),
    body('persons')
        .optional()
        .isInt({ min: 1, max: 10 })
        .withMessage('Numero di persone deve essere tra 1 e 10')
];

// Validazione per aggiornamento prenotazione
const updateBookingValidation = [
    body('status')
        .optional()
        .isIn(['pending', 'confirmed', 'completed', 'cancelled', 'no_show'])
        .withMessage('Status non valido'),
    body('price')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Prezzo non valido'),
    body('persons')
        .optional()
        .isInt({ min: 1, max: 10 })
        .withMessage('Numero di persone deve essere tra 1 e 10'),
    body('payment_status')
        .optional()
        .isIn(['pending', 'paid', 'refunded'])
        .withMessage('Status pagamento non valido')
];

// Validazione per slot disponibili
const availableSlotsValidation = [
    query('provider_id')
        .isInt({ min: 1 })
        .withMessage('ID provider obbligatorio e valido'),
    query('service_id')
        .isInt({ min: 1 })
        .withMessage('ID servizio obbligatorio e valido'),
    query('date')
        .matches(/^\d{4}-\d{2}-\d{2}$/)
        .withMessage('Data deve essere in formato YYYY-MM-DD'),
    query('location_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('ID location non valido')
];

// Routes

/**
 * @route   GET /api/bookings
 * @desc    Ottenere tutte le prenotazioni
 * @access  Private
 * @params  ?customer_id=1&provider_id=2&status=confirmed&payment_status=paid&date_from=2025-01-01&date_to=2025-12-31&limit=20&offset=0
 */
router.get('/', BookingsController.getAllBookings);

/**
 * @route   GET /api/bookings/available-slots
 * @desc    Ottenere slot disponibili per un provider e servizio
 * @access  Public
 * @params  ?provider_id=1&service_id=2&date=2025-01-15&location_id=1
 */
router.get('/available-slots', availableSlotsValidation, BookingsController.getAvailableSlots);

/**
 * @route   GET /api/bookings/token/:token
 * @desc    Ottenere prenotazione per token
 * @access  Public
 */
router.get('/token/:token', BookingsController.getBookingByToken);

/**
 * @route   GET /api/bookings/:id
 * @desc    Ottenere prenotazione per ID
 * @access  Private
 */
router.get('/:id', BookingsController.getBookingById);

/**
 * @route   POST /api/bookings
 * @desc    Creare una nuova prenotazione
 * @access  Public
 * @body    { service_id, provider_id, location_id, customer_data, start_datetime, persons, custom_fields, notes }
 */
router.post('/', bookingValidation, BookingsController.createBooking);

/**
 * @route   PUT /api/bookings/:id
 * @desc    Aggiornare una prenotazione
 * @access  Private
 */
router.put('/:id', updateBookingValidation, BookingsController.updateBooking);

/**
 * @route   PATCH /api/bookings/:id/confirm
 * @desc    Confermare una prenotazione
 * @access  Private (Provider/Admin)
 */
router.patch('/:id/confirm', BookingsController.confirmBooking);

/**
 * @route   PATCH /api/bookings/:id/cancel
 * @desc    Cancellare una prenotazione
 * @access  Public (Customer) / Private (Provider/Admin)
 * @body    { reason?: string }
 */
router.patch('/:id/cancel', BookingsController.cancelBooking);

/**
 * @route   PATCH /api/bookings/:id/complete
 * @desc    Segnare prenotazione come completata
 * @access  Private (Provider/Admin)
 */
router.patch('/:id/complete', BookingsController.completeBooking);

/**
 * @route   PATCH /api/bookings/:id/no-show
 * @desc    Segnare prenotazione come no-show
 * @access  Private (Provider/Admin)
 */
router.patch('/:id/no-show', BookingsController.markAsNoShow);

/**
 * @route   PATCH /api/bookings/:id/payment
 * @desc    Aggiornare status pagamento
 * @access  Private (Provider/Admin)
 * @body    { payment_status: 'pending'|'paid'|'refunded' }
 */
router.patch('/:id/payment', [
    body('payment_status')
        .isIn(['pending', 'paid', 'refunded'])
        .withMessage('Status pagamento non valido')
], BookingsController.updatePaymentStatus);

module.exports = router;