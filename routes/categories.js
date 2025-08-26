const express = require('express');
const { pool } = require('../config/database');

const router = express.Router();

// Ottenere tutte le categorie
const getAllCategories = async (req, res) => {
    try {
        const { status } = req.query;
        
        let query = 'SELECT * FROM categories WHERE 1=1';
        const params = [];

        if (status) {
            query += ' AND status = ?';
            params.push(status);
        }

        query += ' ORDER BY position, name';

        const [rows] = await pool.execute(query, params);
        
        res.json({
            success: true,
            data: rows,
            count: rows.length
        });
    } catch (error) {
        console.error('Errore nel recuperare le categorie:', error);
        res.status(500).json({
            success: false,
            message: 'Errore interno del server',
            error: error.message
        });
    }
};

// Ottenere una categoria per ID
const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const query = 'SELECT * FROM categories WHERE id = ?';
        const [rows] = await pool.execute(query, [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Categoria non trovata'
            });
        }

        res.json({
            success: true,
            data: rows[0]
        });
    } catch (error) {
        console.error('Errore nel recuperare la categoria:', error);
        res.status(500).json({
            success: false,
            message: 'Errore interno del server',
            error: error.message
        });
    }
};

// Ottenere servizi per categoria
const getServicesByCategory = async (req, res) => {
    try {
        const { id } = req.params;
        
        const query = `
            SELECT s.*, c.name as category_name, c.color as category_color
            FROM services s
            INNER JOIN categories c ON s.category_id = c.id
            WHERE s.category_id = ? AND s.status = 'active'
            ORDER BY s.position, s.name
        `;
        
        const [rows] = await pool.execute(query, [id]);
        
        res.json({
            success: true,
            data: rows,
            count: rows.length
        });
    } catch (error) {
        console.error('Errore nel recuperare i servizi della categoria:', error);
        res.status(500).json({
            success: false,
            message: 'Errore interno del server',
            error: error.message
        });
    }
};

// Ottenere categorie con conteggio servizi
const getCategoriesWithCount = async (req, res) => {
    try {
        const query = `
            SELECT c.*, COUNT(s.id) as service_count,
                   AVG(s.price) as average_price
            FROM categories c
            LEFT JOIN services s ON c.id = s.category_id AND s.status = 'active'
            WHERE c.status = 'active'
            GROUP BY c.id
            ORDER BY c.position, c.name
        `;
        
        const [rows] = await pool.execute(query);
        
        res.json({
            success: true,
            data: rows,
            count: rows.length
        });
    } catch (error) {
        console.error('Errore nel recuperare le categorie con conteggi:', error);
        res.status(500).json({
            success: false,
            message: 'Errore interno del server',
            error: error.message
        });
    }
};

// Routes

/**
 * @route   GET /api/categories
 * @desc    Ottenere tutte le categorie
 * @access  Public
 * @params  ?status=active
 */
router.get('/', getAllCategories);

/**
 * @route   GET /api/categories/with-counts
 * @desc    Ottenere categorie con conteggio servizi
 * @access  Public
 */
router.get('/with-counts', getCategoriesWithCount);

/**
 * @route   GET /api/categories/:id
 * @desc    Ottenere categoria per ID
 * @access  Public
 */
router.get('/:id', getCategoryById);

/**
 * @route   GET /api/categories/:id/services
 * @desc    Ottenere servizi per categoria
 * @access  Public
 */
router.get('/:id/services', getServicesByCategory);

module.exports = router;