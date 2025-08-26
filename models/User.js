const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
    constructor(data) {
        this.id = data.id;
        this.type = data.type;
        this.first_name = data.first_name;
        this.last_name = data.last_name;
        this.email = data.email;
        this.phone = data.phone;
        this.gender = data.gender;
        this.birthday = data.birthday;
        this.status = data.status;
        this.description = data.description;
        this.image_url = data.image_url;
        this.specialization = data.specialization;
        this.country_code = data.country_code;
        this.timezone = data.timezone;
    }

    // Ottenere tutti gli utenti
    static async findAll(filters = {}) {
        try {
            let query = 'SELECT * FROM users WHERE 1=1';
            const params = [];

            if (filters.type) {
                query += ' AND type = ?';
                params.push(filters.type);
            }

            if (filters.status) {
                query += ' AND status = ?';
                params.push(filters.status);
            }

            query += ' ORDER BY first_name, last_name';

            const [rows] = await pool.execute(query, params);
            return rows.map(row => new User(row));
        } catch (error) {
            throw new Error('Errore nel recuperare gli utenti: ' + error.message);
        }
    }

    // Trovare un utente per ID
    static async findById(id) {
        try {
            const query = 'SELECT * FROM users WHERE id = ?';
            const [rows] = await pool.execute(query, [id]);
            
            if (rows.length === 0) {
                return null;
            }
            
            return new User(rows[0]);
        } catch (error) {
            throw new Error('Errore nel recuperare l\'utente: ' + error.message);
        }
    }

    // Trovare un utente per email
    static async findByEmail(email) {
        try {
            const query = 'SELECT * FROM users WHERE email = ?';
            const [rows] = await pool.execute(query, [email]);
            
            if (rows.length === 0) {
                return null;
            }
            
            return new User(rows[0]);
        } catch (error) {
            throw new Error('Errore nel recuperare l\'utente per email: ' + error.message);
        }
    }

    // Ottenere tutti i provider
    static async findProviders(filters = {}) {
        try {
            let query = `
                SELECT u.*, 
                       GROUP_CONCAT(DISTINCT l.name ORDER BY l.name SEPARATOR ', ') as locations,
                       COUNT(DISTINCT ps.service_id) as service_count
                FROM users u
                LEFT JOIN provider_locations pl ON u.id = pl.provider_id
                LEFT JOIN locations l ON pl.location_id = l.id
                LEFT JOIN provider_services ps ON u.id = ps.provider_id
                WHERE u.type = 'provider' AND u.status = 'active'
            `;
            const params = [];

            if (filters.location_id) {
                query += ' AND EXISTS (SELECT 1 FROM provider_locations pl2 WHERE pl2.provider_id = u.id AND pl2.location_id = ?)';
                params.push(filters.location_id);
            }

            if (filters.service_id) {
                query += ' AND EXISTS (SELECT 1 FROM provider_services ps2 WHERE ps2.provider_id = u.id AND ps2.service_id = ?)';
                params.push(filters.service_id);
            }

            query += ' GROUP BY u.id ORDER BY u.first_name, u.last_name';

            const [rows] = await pool.execute(query, params);
            return rows.map(row => new User(row));
        } catch (error) {
            throw new Error('Errore nel recuperare i provider: ' + error.message);
        }
    }

    // Creare un nuovo utente
    static async create(userData) {
        try {
            let hashedPassword = null;
            if (userData.password) {
                hashedPassword = await bcrypt.hash(userData.password, 12);
            }

            const query = `
                INSERT INTO users (type, first_name, last_name, email, phone, gender, 
                                 birthday, password, status, description, image_url, 
                                 specialization, country_code, timezone)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const params = [
                userData.type,
                userData.first_name,
                userData.last_name,
                userData.email || null,
                userData.phone || null,
                userData.gender || null,
                userData.birthday || null,
                hashedPassword,
                userData.status || 'active',
                userData.description || null,
                userData.image_url || null,
                userData.specialization || null,
                userData.country_code || 'it',
                userData.timezone || 'Europe/Rome'
            ];

            const [result] = await pool.execute(query, params);
            return await User.findById(result.insertId);
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('Email già esistente');
            }
            throw new Error('Errore nella creazione dell\'utente: ' + error.message);
        }
    }

    // Aggiornare un utente
    static async update(id, userData) {
        try {
            let hashedPassword = null;
            if (userData.password) {
                hashedPassword = await bcrypt.hash(userData.password, 12);
            }

            const query = `
                UPDATE users 
                SET first_name = ?, last_name = ?, email = ?, phone = ?, gender = ?, 
                    birthday = ?, ${hashedPassword ? 'password = ?, ' : ''} status = ?, 
                    description = ?, image_url = ?, specialization = ?, country_code = ?, 
                    timezone = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `;
            const params = [
                userData.first_name,
                userData.last_name,
                userData.email,
                userData.phone,
                userData.gender,
                userData.birthday,
                ...(hashedPassword ? [hashedPassword] : []),
                userData.status,
                userData.description,
                userData.image_url,
                userData.specialization,
                userData.country_code,
                userData.timezone,
                id
            ];

            await pool.execute(query, params);
            return await User.findById(id);
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('Email già esistente');
            }
            throw new Error('Errore nell\'aggiornamento dell\'utente: ' + error.message);
        }
    }

    // Verificare la password
    async comparePassword(candidatePassword) {
        if (!this.password) {
            return false;
        }
        return bcrypt.compare(candidatePassword, this.password);
    }

    // Ottenere il nome completo
    getFullName() {
        return `${this.first_name} ${this.last_name}`.trim();
    }

    // Verificare se è un provider
    isProvider() {
        return this.type === 'provider';
    }

    // Verificare se è un cliente
    isCustomer() {
        return this.type === 'customer';
    }

    // Verificare se è un admin
    isAdmin() {
        return this.type === 'admin';
    }

    // Ottenere le location del provider
    async getLocations() {
        if (!this.isProvider()) {
            return [];
        }

        try {
            const query = `
                SELECT l.*
                FROM locations l
                INNER JOIN provider_locations pl ON l.id = pl.location_id
                WHERE pl.provider_id = ? AND l.status = 'active'
                ORDER BY l.name
            `;
            const [rows] = await pool.execute(query, [this.id]);
            return rows;
        } catch (error) {
            throw new Error('Errore nel recuperare le location del provider: ' + error.message);
        }
    }

    // Ottenere i servizi del provider
    async getServices() {
        if (!this.isProvider()) {
            return [];
        }

        try {
            const query = `
                SELECT s.*, ps.custom_price, c.name as category_name
                FROM services s
                INNER JOIN provider_services ps ON s.id = ps.service_id
                LEFT JOIN categories c ON s.category_id = c.id
                WHERE ps.provider_id = ? AND s.status = 'active'
                ORDER BY s.position, s.name
            `;
            const [rows] = await pool.execute(query, [this.id]);
            return rows;
        } catch (error) {
            throw new Error('Errore nel recuperare i servizi del provider: ' + error.message);
        }
    }

    // Serializzare per JSON (escludendo la password)
    toJSON() {
        const user = { ...this };
        delete user.password;
        return user;
    }
}

module.exports = User;