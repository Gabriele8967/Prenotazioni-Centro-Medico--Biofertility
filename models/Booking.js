const { pool } = require('../config/database');
const crypto = require('crypto');

class Booking {
    constructor(data) {
        this.id = data.id;
        this.appointment_id = data.appointment_id;
        this.customer_id = data.customer_id;
        this.status = data.status;
        this.price = data.price;
        this.persons = data.persons;
        this.custom_fields = data.custom_fields;
        this.booking_token = data.booking_token;
        this.payment_status = data.payment_status;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    // Generare un token unico per la prenotazione
    static generateBookingToken() {
        return crypto.randomBytes(5).toString('hex').toLowerCase();
    }

    // Ottenere tutte le prenotazioni
    static async findAll(filters = {}) {
        try {
            let query = `
                SELECT b.*, 
                       u.first_name as customer_first_name, u.last_name as customer_last_name,
                       u.email as customer_email, u.phone as customer_phone,
                       a.start_datetime, a.end_datetime, a.status as appointment_status,
                       s.name as service_name, s.duration as service_duration,
                       p.first_name as provider_first_name, p.last_name as provider_last_name,
                       l.name as location_name
                FROM bookings b
                LEFT JOIN users u ON b.customer_id = u.id
                LEFT JOIN appointments a ON b.appointment_id = a.id
                LEFT JOIN services s ON a.service_id = s.id
                LEFT JOIN users p ON a.provider_id = p.id
                LEFT JOIN locations l ON a.location_id = l.id
                WHERE 1=1
            `;
            const params = [];

            if (filters.customer_id) {
                query += ' AND b.customer_id = ?';
                params.push(filters.customer_id);
            }

            if (filters.provider_id) {
                query += ' AND a.provider_id = ?';
                params.push(filters.provider_id);
            }

            if (filters.status) {
                query += ' AND b.status = ?';
                params.push(filters.status);
            }

            if (filters.payment_status) {
                query += ' AND b.payment_status = ?';
                params.push(filters.payment_status);
            }

            if (filters.date_from) {
                query += ' AND a.start_datetime >= ?';
                params.push(filters.date_from);
            }

            if (filters.date_to) {
                query += ' AND a.start_datetime <= ?';
                params.push(filters.date_to);
            }

            query += ' ORDER BY a.start_datetime DESC';

            const [rows] = await pool.execute(query, params);
            return rows.map(row => new Booking(row));
        } catch (error) {
            throw new Error('Errore nel recuperare le prenotazioni: ' + error.message);
        }
    }

    // Trovare una prenotazione per ID
    static async findById(id) {
        try {
            const query = `
                SELECT b.*, 
                       u.first_name as customer_first_name, u.last_name as customer_last_name,
                       u.email as customer_email, u.phone as customer_phone, u.timezone as customer_timezone,
                       a.start_datetime, a.end_datetime, a.status as appointment_status, a.notes as appointment_notes,
                       s.name as service_name, s.description as service_description, s.duration as service_duration,
                       p.first_name as provider_first_name, p.last_name as provider_last_name,
                       l.name as location_name, l.address as location_address
                FROM bookings b
                LEFT JOIN users u ON b.customer_id = u.id
                LEFT JOIN appointments a ON b.appointment_id = a.id
                LEFT JOIN services s ON a.service_id = s.id
                LEFT JOIN users p ON a.provider_id = p.id
                LEFT JOIN locations l ON a.location_id = l.id
                WHERE b.id = ?
            `;
            const [rows] = await pool.execute(query, [id]);
            
            if (rows.length === 0) {
                return null;
            }
            
            return new Booking(rows[0]);
        } catch (error) {
            throw new Error('Errore nel recuperare la prenotazione: ' + error.message);
        }
    }

    // Trovare una prenotazione per token
    static async findByToken(token) {
        try {
            const query = `
                SELECT b.*, 
                       u.first_name as customer_first_name, u.last_name as customer_last_name,
                       u.email as customer_email, u.phone as customer_phone,
                       a.start_datetime, a.end_datetime, a.status as appointment_status,
                       s.name as service_name, s.description as service_description,
                       p.first_name as provider_first_name, p.last_name as provider_last_name,
                       l.name as location_name, l.address as location_address
                FROM bookings b
                LEFT JOIN users u ON b.customer_id = u.id
                LEFT JOIN appointments a ON b.appointment_id = a.id
                LEFT JOIN services s ON a.service_id = s.id
                LEFT JOIN users p ON a.provider_id = p.id
                LEFT JOIN locations l ON a.location_id = l.id
                WHERE b.booking_token = ?
            `;
            const [rows] = await pool.execute(query, [token]);
            
            if (rows.length === 0) {
                return null;
            }
            
            return new Booking(rows[0]);
        } catch (error) {
            throw new Error('Errore nel recuperare la prenotazione per token: ' + error.message);
        }
    }

    // Creare una nuova prenotazione
    static async create(bookingData) {
        const connection = await pool.getConnection();
        
        try {
            await connection.beginTransaction();

            // Genero un token unico
            let token;
            let isTokenUnique = false;
            do {
                token = Booking.generateBookingToken();
                const [existingToken] = await connection.execute(
                    'SELECT id FROM bookings WHERE booking_token = ?', 
                    [token]
                );
                isTokenUnique = existingToken.length === 0;
            } while (!isTokenUnique);

            // Inserisco la prenotazione
            const query = `
                INSERT INTO bookings (appointment_id, customer_id, status, price, persons, 
                                    custom_fields, booking_token, payment_status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const params = [
                bookingData.appointment_id,
                bookingData.customer_id,
                bookingData.status || 'pending',
                bookingData.price,
                bookingData.persons || 1,
                bookingData.custom_fields ? JSON.stringify(bookingData.custom_fields) : null,
                token,
                bookingData.payment_status || 'pending'
            ];

            const [result] = await connection.execute(query, params);
            
            // Se la prenotazione viene confermata, aggiorno lo status dell'appuntamento
            if (bookingData.status === 'confirmed') {
                await connection.execute(
                    'UPDATE appointments SET status = ? WHERE id = ?',
                    ['confirmed', bookingData.appointment_id]
                );
            }

            await connection.commit();
            return await Booking.findById(result.insertId);
        } catch (error) {
            await connection.rollback();
            throw new Error('Errore nella creazione della prenotazione: ' + error.message);
        } finally {
            connection.release();
        }
    }

    // Aggiornare una prenotazione
    static async update(id, bookingData) {
        const connection = await pool.getConnection();
        
        try {
            await connection.beginTransaction();

            const query = `
                UPDATE bookings 
                SET status = ?, price = ?, persons = ?, custom_fields = ?, 
                    payment_status = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `;
            const params = [
                bookingData.status,
                bookingData.price,
                bookingData.persons,
                bookingData.custom_fields ? JSON.stringify(bookingData.custom_fields) : null,
                bookingData.payment_status,
                id
            ];

            await connection.execute(query, params);

            // Se necessario, aggiorno anche lo status dell'appuntamento
            if (bookingData.status === 'confirmed') {
                const booking = await Booking.findById(id);
                await connection.execute(
                    'UPDATE appointments SET status = ? WHERE id = ?',
                    ['confirmed', booking.appointment_id]
                );
            }

            await connection.commit();
            return await Booking.findById(id);
        } catch (error) {
            await connection.rollback();
            throw new Error('Errore nell\'aggiornamento della prenotazione: ' + error.message);
        } finally {
            connection.release();
        }
    }

    // Cancellare una prenotazione
    static async cancel(id, reason = null) {
        const connection = await pool.getConnection();
        
        try {
            await connection.beginTransaction();

            // Ottengo la prenotazione per avere l'appointment_id
            const booking = await Booking.findById(id);
            if (!booking) {
                throw new Error('Prenotazione non trovata');
            }

            // Cancello la prenotazione
            await connection.execute(
                'UPDATE bookings SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                ['cancelled', id]
            );

            // Verifico se ci sono altre prenotazioni attive per lo stesso appuntamento
            const [otherBookings] = await connection.execute(
                'SELECT COUNT(*) as count FROM bookings WHERE appointment_id = ? AND status NOT IN (?, ?)',
                [booking.appointment_id, 'cancelled', 'no_show']
            );

            // Se non ci sono altre prenotazioni, cancello anche l'appuntamento
            if (otherBookings[0].count === 0) {
                await connection.execute(
                    'UPDATE appointments SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                    ['cancelled', booking.appointment_id]
                );
            }

            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            throw new Error('Errore nella cancellazione della prenotazione: ' + error.message);
        } finally {
            connection.release();
        }
    }

    // Confermare una prenotazione
    static async confirm(id) {
        return await Booking.update(id, { status: 'confirmed' });
    }

    // Segnare come completata
    static async complete(id) {
        return await Booking.update(id, { status: 'completed' });
    }

    // Segnare come no-show
    static async markAsNoShow(id) {
        return await Booking.update(id, { status: 'no_show' });
    }

    // Aggiornare lo status del pagamento
    static async updatePaymentStatus(id, paymentStatus) {
        try {
            const query = `
                UPDATE bookings 
                SET payment_status = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `;
            await pool.execute(query, [paymentStatus, id]);
            return await Booking.findById(id);
        } catch (error) {
            throw new Error('Errore nell\'aggiornamento dello status di pagamento: ' + error.message);
        }
    }

    // Ottenere i dettagli completi della prenotazione
    async getDetails() {
        try {
            const query = `
                SELECT b.*, 
                       u.first_name as customer_first_name, u.last_name as customer_last_name,
                       u.email as customer_email, u.phone as customer_phone, u.timezone as customer_timezone,
                       a.start_datetime, a.end_datetime, a.status as appointment_status, a.notes as appointment_notes,
                       s.name as service_name, s.description as service_description, s.duration as service_duration,
                       p.first_name as provider_first_name, p.last_name as provider_last_name,
                       l.name as location_name, l.address as location_address, l.phone as location_phone
                FROM bookings b
                LEFT JOIN users u ON b.customer_id = u.id
                LEFT JOIN appointments a ON b.appointment_id = a.id
                LEFT JOIN services s ON a.service_id = s.id
                LEFT JOIN users p ON a.provider_id = p.id
                LEFT JOIN locations l ON a.location_id = l.id
                WHERE b.id = ?
            `;
            const [rows] = await pool.execute(query, [this.id]);
            return rows[0] || null;
        } catch (error) {
            throw new Error('Errore nel recuperare i dettagli della prenotazione: ' + error.message);
        }
    }

    // Verificare se è possibile cancellare la prenotazione
    canBeCancelled() {
        return this.status !== 'cancelled' && this.status !== 'completed' && this.status !== 'no_show';
    }

    // Verificare se è possibile modificare la prenotazione
    canBeModified() {
        return this.status === 'pending' || this.status === 'confirmed';
    }

    // Formattare il prezzo
    getFormattedPrice() {
        return `€${parseFloat(this.price).toFixed(2)}`;
    }

    // Parsare i custom fields
    getCustomFields() {
        if (!this.custom_fields) return {};
        try {
            return typeof this.custom_fields === 'string' ? 
                JSON.parse(this.custom_fields) : this.custom_fields;
        } catch (error) {
            return {};
        }
    }
}

module.exports = Booking;