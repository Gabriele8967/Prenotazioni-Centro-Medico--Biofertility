const Service = require('../models/Service');
const { validationResult } = require('express-validator');

class ServicesController {
    // Ottenere tutti i servizi
    static async getAllServices(req, res) {
        try {
            const { category_id, provider_id } = req.query;
            
            const filters = {};
            if (category_id) filters.category_id = category_id;
            if (provider_id) filters.provider_id = provider_id;

            const services = await Service.findAll(filters);
            
            res.json({
                success: true,
                data: services,
                count: services.length
            });
        } catch (error) {
            console.error('Errore nel recuperare i servizi:', error);
            res.status(500).json({
                success: false,
                message: 'Errore interno del server',
                error: error.message
            });
        }
    }

    // Ottenere un servizio per ID
    static async getServiceById(req, res) {
        try {
            const { id } = req.params;
            
            const service = await Service.findById(id);
            if (!service) {
                return res.status(404).json({
                    success: false,
                    message: 'Servizio non trovato'
                });
            }

            res.json({
                success: true,
                data: service
            });
        } catch (error) {
            console.error('Errore nel recuperare il servizio:', error);
            res.status(500).json({
                success: false,
                message: 'Errore interno del server',
                error: error.message
            });
        }
    }

    // Ottenere servizi per provider
    static async getServicesByProvider(req, res) {
        try {
            const { providerId } = req.params;
            
            const services = await Service.findByProvider(providerId);
            
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
    }

    // Creare un nuovo servizio
    static async createService(req, res) {
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

            const serviceData = req.body;
            const service = await Service.create(serviceData);

            res.status(201).json({
                success: true,
                message: 'Servizio creato con successo',
                data: service
            });
        } catch (error) {
            console.error('Errore nella creazione del servizio:', error);
            res.status(500).json({
                success: false,
                message: 'Errore interno del server',
                error: error.message
            });
        }
    }

    // Aggiornare un servizio
    static async updateService(req, res) {
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

            const serviceData = req.body;
            const service = await Service.update(id, serviceData);

            if (!service) {
                return res.status(404).json({
                    success: false,
                    message: 'Servizio non trovato'
                });
            }

            res.json({
                success: true,
                message: 'Servizio aggiornato con successo',
                data: service
            });
        } catch (error) {
            console.error('Errore nell\'aggiornamento del servizio:', error);
            res.status(500).json({
                success: false,
                message: 'Errore interno del server',
                error: error.message
            });
        }
    }

    // Eliminare un servizio
    static async deleteService(req, res) {
        try {
            const { id } = req.params;
            
            const success = await Service.delete(id);
            
            if (!success) {
                return res.status(404).json({
                    success: false,
                    message: 'Servizio non trovato'
                });
            }

            res.json({
                success: true,
                message: 'Servizio eliminato con successo'
            });
        } catch (error) {
            console.error('Errore nell\'eliminazione del servizio:', error);
            res.status(500).json({
                success: false,
                message: 'Errore interno del server',
                error: error.message
            });
        }
    }

    // Ottenere statistiche sui servizi
    static async getServiceStats(req, res) {
        try {
            const { pool } = require('../config/database');
            
            const statsQuery = `
                SELECT 
                    COUNT(DISTINCT s.id) as total_services,
                    COUNT(DISTINCT CASE WHEN s.status = 'active' THEN s.id END) as active_services,
                    AVG(s.price) as average_price,
                    MAX(s.price) as max_price,
                    MIN(s.price) as min_price,
                    COUNT(DISTINCT c.id) as total_categories
                FROM services s
                LEFT JOIN categories c ON s.category_id = c.id
            `;

            const [statsRows] = await pool.execute(statsQuery);
            
            const categoryStatsQuery = `
                SELECT 
                    c.name as category_name,
                    COUNT(s.id) as service_count,
                    AVG(s.price) as average_price
                FROM categories c
                LEFT JOIN services s ON c.id = s.category_id AND s.status = 'active'
                GROUP BY c.id, c.name
                ORDER BY service_count DESC
            `;

            const [categoryRows] = await pool.execute(categoryStatsQuery);

            res.json({
                success: true,
                data: {
                    overall: statsRows[0],
                    by_category: categoryRows
                }
            });
        } catch (error) {
            console.error('Errore nel recuperare le statistiche:', error);
            res.status(500).json({
                success: false,
                message: 'Errore interno del server',
                error: error.message
            });
        }
    }
}

module.exports = ServicesController;