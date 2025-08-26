const express = require('express');
const { body } = require('express-validator');
const User = require('../models/User');

const router = express.Router();

// Validazione per creazione utente
const userValidation = [
    body('type')
        .isIn(['customer', 'provider', 'admin'])
        .withMessage('Tipo utente non valido'),
    body('first_name')
        .notEmpty()
        .withMessage('Nome obbligatorio')
        .isLength({ min: 2, max: 100 })
        .withMessage('Nome deve essere tra 2 e 100 caratteri'),
    body('last_name')
        .notEmpty()
        .withMessage('Cognome obbligatorio')
        .isLength({ min: 2, max: 100 })
        .withMessage('Cognome deve essere tra 2 e 100 caratteri'),
    body('email')
        .optional()
        .isEmail()
        .withMessage('Email non valida'),
    body('phone')
        .optional()
        .isMobilePhone()
        .withMessage('Numero di telefono non valido'),
    body('status')
        .optional()
        .isIn(['active', 'inactive', 'blocked'])
        .withMessage('Status non valido')
];

// Controller methods
const getAllUsers = async (req, res) => {
    try {
        const { type, status } = req.query;
        
        const filters = {};
        if (type) filters.type = type;
        if (status) filters.status = status;

        const users = await User.findAll(filters);
        
        res.json({
            success: true,
            data: users,
            count: users.length
        });
    } catch (error) {
        console.error('Errore nel recuperare gli utenti:', error);
        res.status(500).json({
            success: false,
            message: 'Errore interno del server',
            error: error.message
        });
    }
};

const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utente non trovato'
            });
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Errore nel recuperare l\'utente:', error);
        res.status(500).json({
            success: false,
            message: 'Errore interno del server',
            error: error.message
        });
    }
};

const getProviders = async (req, res) => {
    try {
        const { location_id, service_id } = req.query;
        
        const filters = {};
        if (location_id) filters.location_id = location_id;
        if (service_id) filters.service_id = service_id;

        const providers = await User.findProviders(filters);
        
        res.json({
            success: true,
            data: providers,
            count: providers.length
        });
    } catch (error) {
        console.error('Errore nel recuperare i provider:', error);
        res.status(500).json({
            success: false,
            message: 'Errore interno del server',
            error: error.message
        });
    }
};

const createUser = async (req, res) => {
    try {
        const userData = req.body;
        const user = await User.create(userData);

        res.status(201).json({
            success: true,
            message: 'Utente creato con successo',
            data: user
        });
    } catch (error) {
        console.error('Errore nella creazione dell\'utente:', error);
        res.status(500).json({
            success: false,
            message: error.message.includes('già esistente') ? error.message : 'Errore interno del server',
            error: error.message
        });
    }
};

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const userData = req.body;
        
        const user = await User.update(id, userData);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utente non trovato'
            });
        }

        res.json({
            success: true,
            message: 'Utente aggiornato con successo',
            data: user
        });
    } catch (error) {
        console.error('Errore nell\'aggiornamento dell\'utente:', error);
        res.status(500).json({
            success: false,
            message: error.message.includes('già esistente') ? error.message : 'Errore interno del server',
            error: error.message
        });
    }
};

const getProviderLocations = async (req, res) => {
    try {
        const { id } = req.params;
        
        const user = await User.findById(id);
        if (!user || !user.isProvider()) {
            return res.status(404).json({
                success: false,
                message: 'Provider non trovato'
            });
        }

        const locations = await user.getLocations();
        
        res.json({
            success: true,
            data: locations,
            count: locations.length
        });
    } catch (error) {
        console.error('Errore nel recuperare le location del provider:', error);
        res.status(500).json({
            success: false,
            message: 'Errore interno del server',
            error: error.message
        });
    }
};

const getProviderServices = async (req, res) => {
    try {
        const { id } = req.params;
        
        const user = await User.findById(id);
        if (!user || !user.isProvider()) {
            return res.status(404).json({
                success: false,
                message: 'Provider non trovato'
            });
        }

        const services = await user.getServices();
        
        res.json({
            success: true,
            data: services,
            count: services.length
        });
    } catch (error) {
        console.error('Errore nel recuperare i servizi del provider:', error);
        res.status(500).json({
            success: false,
            message: 'Errore interno del server',
            error: error.message
        });
    }
};

// Routes

/**
 * @route   GET /api/users
 * @desc    Ottenere tutti gli utenti
 * @access  Private (Admin)
 * @params  ?type=customer&status=active
 */
router.get('/', getAllUsers);

/**
 * @route   GET /api/users/providers
 * @desc    Ottenere tutti i provider
 * @access  Public
 * @params  ?location_id=1&service_id=2
 */
router.get('/providers', getProviders);

/**
 * @route   GET /api/users/:id
 * @desc    Ottenere utente per ID
 * @access  Private
 */
router.get('/:id', getUserById);

/**
 * @route   GET /api/users/:id/locations
 * @desc    Ottenere location di un provider
 * @access  Public
 */
router.get('/:id/locations', getProviderLocations);

/**
 * @route   GET /api/users/:id/services
 * @desc    Ottenere servizi di un provider
 * @access  Public
 */
router.get('/:id/services', getProviderServices);

/**
 * @route   POST /api/users
 * @desc    Creare nuovo utente
 * @access  Public (per clienti) / Private (per provider/admin)
 */
router.post('/', userValidation, createUser);

/**
 * @route   PUT /api/users/:id
 * @desc    Aggiornare utente
 * @access  Private
 */
router.put('/:id', userValidation, updateUser);

module.exports = router;