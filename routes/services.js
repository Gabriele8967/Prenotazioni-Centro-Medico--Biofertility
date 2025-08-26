const express = require('express');
const { body } = require('express-validator');
const ServicesController = require('../controllers/servicesController');

const router = express.Router();

// Validazione per creazione/aggiornamento servizio
const serviceValidation = [
    body('name')
        .notEmpty()
        .withMessage('Il nome del servizio è obbligatorio')
        .isLength({ min: 3, max: 255 })
        .withMessage('Il nome deve essere tra 3 e 255 caratteri'),
    body('price')
        .isFloat({ min: 0 })
        .withMessage('Il prezzo deve essere un numero positivo'),
    body('duration')
        .isInt({ min: 300 }) // Minimo 5 minuti
        .withMessage('La durata deve essere almeno 300 secondi (5 minuti)'),
    body('category_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('ID categoria non valido'),
    body('color')
        .optional()
        .matches(/^#[0-9A-Fa-f]{6}$/)
        .withMessage('Il colore deve essere in formato hex (#RRGGBB)'),
    body('status')
        .optional()
        .isIn(['active', 'inactive', 'disabled'])
        .withMessage('Status non valido'),
    body('priority')
        .optional()
        .isIn(['low', 'normal', 'high'])
        .withMessage('Priorità non valida')
];

// Routes

/**
 * @route   GET /api/services
 * @desc    Ottenere tutti i servizi
 * @access  Public
 * @params  ?category_id=1&provider_id=2
 */
router.get('/', ServicesController.getAllServices);

/**
 * @route   GET /api/services/stats
 * @desc    Ottenere statistiche sui servizi
 * @access  Public
 */
router.get('/stats', ServicesController.getServiceStats);

/**
 * @route   GET /api/services/:id
 * @desc    Ottenere un servizio per ID
 * @access  Public
 */
router.get('/:id', ServicesController.getServiceById);

/**
 * @route   GET /api/services/provider/:providerId
 * @desc    Ottenere servizi per provider
 * @access  Public
 */
router.get('/provider/:providerId', ServicesController.getServicesByProvider);

/**
 * @route   POST /api/services
 * @desc    Creare un nuovo servizio
 * @access  Private (Admin)
 */
router.post('/', serviceValidation, ServicesController.createService);

/**
 * @route   PUT /api/services/:id
 * @desc    Aggiornare un servizio
 * @access  Private (Admin)
 */
router.put('/:id', serviceValidation, ServicesController.updateService);

/**
 * @route   DELETE /api/services/:id
 * @desc    Eliminare un servizio (soft delete)
 * @access  Private (Admin)
 */
router.delete('/:id', ServicesController.deleteService);

module.exports = router;