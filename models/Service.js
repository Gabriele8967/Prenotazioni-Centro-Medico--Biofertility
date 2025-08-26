const { pool } = require('../config/database');

class Service {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.description = data.description;
        this.price = data.price;
        this.duration = data.duration;
        this.category_id = data.category_id;
        this.color = data.color;
        this.min_capacity = data.min_capacity;
        this.max_capacity = data.max_capacity;
        this.buffer_time_before = data.buffer_time_before;
        this.buffer_time_after = data.buffer_time_after;
        this.status = data.status;
        this.priority = data.priority;
        this.requires_confirmation = data.requires_confirmation;
        this.min_booking_time = data.min_booking_time;
        this.position = data.position;
    }

    // Ottenere tutti i servizi
    static async findAll(filters = {}) {
        try {
            let query = `
                SELECT s.*, c.name as category_name, c.color as category_color
                FROM services s
                LEFT JOIN categories c ON s.category_id = c.id
                WHERE s.status = 'active'
            `;
            const params = [];

            if (filters.category_id) {
                query += ' AND s.category_id = ?';
                params.push(filters.category_id);
            }

            if (filters.provider_id) {
                query += ' AND EXISTS (SELECT 1 FROM provider_services ps WHERE ps.service_id = s.id AND ps.provider_id = ?)';
                params.push(filters.provider_id);
            }

            query += ' ORDER BY s.position, s.name';

            const [rows] = await pool.execute(query, params);
            return rows.map(row => new Service(row));
        } catch (error) {
            throw new Error('Errore nel recuperare i servizi: ' + error.message);
        }
    }

    // Trovare un servizio per ID
    static async findById(id) {
        try {
            const query = `
                SELECT s.*, c.name as category_name, c.color as category_color
                FROM services s
                LEFT JOIN categories c ON s.category_id = c.id
                WHERE s.id = ? AND s.status = 'active'
            `;
            const [rows] = await pool.execute(query, [id]);
            
            if (rows.length === 0) {
                return null;
            }
            
            return new Service(rows[0]);
        } catch (error) {
            throw new Error('Errore nel recuperare il servizio: ' + error.message);
        }
    }

    // Trovare servizi per provider
    static async findByProvider(providerId) {
        try {
            const query = `
                SELECT s.*, c.name as category_name, c.color as category_color,
                       ps.custom_price
                FROM services s
                LEFT JOIN categories c ON s.category_id = c.id
                INNER JOIN provider_services ps ON s.id = ps.service_id
                WHERE ps.provider_id = ? AND s.status = 'active'
                ORDER BY s.position, s.name
            `;
            const [rows] = await pool.execute(query, [providerId]);
            return rows.map(row => {
                const service = new Service(row);
                if (row.custom_price) {
                    service.price = row.custom_price;
                }
                return service;
            });
        } catch (error) {
            throw new Error('Errore nel recuperare i servizi del provider: ' + error.message);
        }
    }

    // Creare un nuovo servizio
    static async create(serviceData) {
        try {
            const query = `
                INSERT INTO services (name, description, price, duration, category_id, color, 
                                    min_capacity, max_capacity, buffer_time_before, buffer_time_after, 
                                    status, priority, requires_confirmation, min_booking_time, position)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const params = [
                serviceData.name,
                serviceData.description || null,
                serviceData.price,
                serviceData.duration,
                serviceData.category_id || null,
                serviceData.color || '#1788FB',
                serviceData.min_capacity || 1,
                serviceData.max_capacity || 1,
                serviceData.buffer_time_before || 0,
                serviceData.buffer_time_after || 0,
                serviceData.status || 'active',
                serviceData.priority || 'normal',
                serviceData.requires_confirmation || false,
                serviceData.min_booking_time || 0,
                serviceData.position || 0
            ];

            const [result] = await pool.execute(query, params);
            return await Service.findById(result.insertId);
        } catch (error) {
            throw new Error('Errore nella creazione del servizio: ' + error.message);
        }
    }

    // Aggiornare un servizio
    static async update(id, serviceData) {
        try {
            const query = `
                UPDATE services 
                SET name = ?, description = ?, price = ?, duration = ?, category_id = ?, 
                    color = ?, min_capacity = ?, max_capacity = ?, buffer_time_before = ?, 
                    buffer_time_after = ?, status = ?, priority = ?, requires_confirmation = ?, 
                    min_booking_time = ?, position = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `;
            const params = [
                serviceData.name,
                serviceData.description,
                serviceData.price,
                serviceData.duration,
                serviceData.category_id,
                serviceData.color,
                serviceData.min_capacity,
                serviceData.max_capacity,
                serviceData.buffer_time_before,
                serviceData.buffer_time_after,
                serviceData.status,
                serviceData.priority,
                serviceData.requires_confirmation,
                serviceData.min_booking_time,
                serviceData.position,
                id
            ];

            await pool.execute(query, params);
            return await Service.findById(id);
        } catch (error) {
            throw new Error('Errore nell\'aggiornamento del servizio: ' + error.message);
        }
    }

    // Eliminare un servizio (soft delete)
    static async delete(id) {
        try {
            const query = 'UPDATE services SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
            await pool.execute(query, ['inactive', id]);
            return true;
        } catch (error) {
            throw new Error('Errore nell\'eliminazione del servizio: ' + error.message);
        }
    }

    // Verificare se un servizio richiede conferma
    async requiresConfirmation() {
        return this.requires_confirmation === 1 || this.requires_confirmation === true;
    }

    // Calcolare il tempo minimo richiesto per la prenotazione
    getMinBookingTimeHours() {
        return this.min_booking_time / 3600; // Converte da secondi a ore
    }

    // Ottenere la durata in minuti
    getDurationMinutes() {
        return this.duration / 60; // Converte da secondi a minuti
    }

    // Formattare il prezzo
    getFormattedPrice() {
        return `€${this.price.toFixed(2)}`;
    }
}

module.exports = Service;