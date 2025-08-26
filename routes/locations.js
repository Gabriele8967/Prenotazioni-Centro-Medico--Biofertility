const express = require('express');
const { pool } = require('../config/database');

const router = express.Router();

// Ottenere tutte le location
const getAllLocations = async (req, res) => {
    try {
        const { status } = req.query;
        
        let query = 'SELECT * FROM locations WHERE 1=1';
        const params = [];

        if (status) {
            query += ' AND status = ?';
            params.push(status);
        }

        query += ' ORDER BY name';

        const [rows] = await pool.execute(query, params);
        
        res.json({
            success: true,
            data: rows,
            count: rows.length
        });
    } catch (error) {
        console.error('Errore nel recuperare le location:', error);
        res.status(500).json({
            success: false,
            message: 'Errore interno del server',
            error: error.message
        });
    }
};

// Ottenere una location per ID
const getLocationById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const query = 'SELECT * FROM locations WHERE id = ?';
        const [rows] = await pool.execute(query, [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Location non trovata'
            });
        }

        res.json({
            success: true,
            data: rows[0]
        });
    } catch (error) {
        console.error('Errore nel recuperare la location:', error);
        res.status(500).json({
            success: false,
            message: 'Errore interno del server',
            error: error.message
        });
    }
};

// Ottenere provider per location
const getProvidersByLocation = async (req, res) => {
    try {
        const { id } = req.params;
        
        const query = `
            SELECT u.id, u.first_name, u.last_name, u.email, u.image_url, u.description
            FROM users u
            INNER JOIN provider_locations pl ON u.id = pl.provider_id
            WHERE pl.location_id = ? AND u.status = 'active' AND u.type = 'provider'
            ORDER BY u.first_name, u.last_name
        `;
        
        const [rows] = await pool.execute(query, [id]);
        
        res.json({
            success: true,
            data: rows,
            count: rows.length
        });
    } catch (error) {
        console.error('Errore nel recuperare i provider della location:', error);
        res.status(500).json({
            success: false,
            message: 'Errore interno del server',
            error: error.message
        });
    }
};

// Routes

/**
 * @route   GET /api/locations
 * @desc    Ottenere tutte le location
 * @access  Public
 * @params  ?status=active
 */
router.get('/', getAllLocations);

/**
 * @route   GET /api/locations/:id
 * @desc    Ottenere location per ID
 * @access  Public
 */
router.get('/:id', getLocationById);

/**
 * @route   GET /api/locations/:id/providers
 * @desc    Ottenere provider per location
 * @access  Public
 */
router.get('/:id/providers', getProvidersByLocation);

module.exports = router;