const { pool } = require('../config/database');
const moment = require('moment-timezone');

class Appointment {
    constructor(data) {
        this.id = data.id;
        this.service_id = data.service_id;
        this.provider_id = data.provider_id;
        this.location_id = data.location_id;
        this.start_datetime = data.start_datetime;
        this.end_datetime = data.end_datetime;
        this.status = data.status;
        this.notes = data.notes;
        this.google_event_id = data.google_event_id;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    // Ottenere tutti gli appuntamenti
    static async findAll(filters = {}) {
        try {
            let query = `
                SELECT a.*, 
                       s.name as service_name, s.price as service_price, s.duration as service_duration,
                       u.first_name as provider_first_name, u.last_name as provider_last_name,
                       l.name as location_name,
                       COUNT(b.id) as booking_count
                FROM appointments a
                LEFT JOIN services s ON a.service_id = s.id
                LEFT JOIN users u ON a.provider_id = u.id
                LEFT JOIN locations l ON a.location_id = l.id
                LEFT JOIN bookings b ON a.id = b.appointment_id
                WHERE 1=1
            `;
            const params = [];

            if (filters.provider_id) {
                query += ' AND a.provider_id = ?';
                params.push(filters.provider_id);
            }

            if (filters.service_id) {
                query += ' AND a.service_id = ?';
                params.push(filters.service_id);
            }

            if (filters.location_id) {
                query += ' AND a.location_id = ?';
                params.push(filters.location_id);
            }

            if (filters.status) {
                query += ' AND a.status = ?';
                params.push(filters.status);
            }

            if (filters.date_from) {
                query += ' AND a.start_datetime >= ?';
                params.push(filters.date_from);
            }

            if (filters.date_to) {
                query += ' AND a.start_datetime <= ?';
                params.push(filters.date_to);
            }

            query += ' GROUP BY a.id ORDER BY a.start_datetime';

            const [rows] = await pool.execute(query, params);
            return rows.map(row => new Appointment(row));
        } catch (error) {
            throw new Error('Errore nel recuperare gli appuntamenti: ' + error.message);
        }
    }

    // Trovare un appuntamento per ID
    static async findById(id) {
        try {
            const query = `
                SELECT a.*, 
                       s.name as service_name, s.price as service_price, s.duration as service_duration,
                       s.requires_confirmation,
                       u.first_name as provider_first_name, u.last_name as provider_last_name,
                       l.name as location_name, l.address as location_address
                FROM appointments a
                LEFT JOIN services s ON a.service_id = s.id
                LEFT JOIN users u ON a.provider_id = u.id
                LEFT JOIN locations l ON a.location_id = l.id
                WHERE a.id = ?
            `;
            const [rows] = await pool.execute(query, [id]);
            
            if (rows.length === 0) {
                return null;
            }
            
            return new Appointment(rows[0]);
        } catch (error) {
            throw new Error('Errore nel recuperare l\'appuntamento: ' + error.message);
        }
    }

    // Trovare appuntamenti disponibili per un provider in un giorno
    static async findAvailableSlots(providerId, serviceId, date, locationId = null) {
        try {
            // Prima otteniamo il servizio per conoscere la durata
            const serviceQuery = 'SELECT duration, buffer_time_before, buffer_time_after FROM services WHERE id = ?';
            const [serviceRows] = await pool.execute(serviceQuery, [serviceId]);
            
            if (serviceRows.length === 0) {
                throw new Error('Servizio non trovato');
            }

            const service = serviceRows[0];
            const serviceDuration = service.duration; // in secondi
            const bufferBefore = service.buffer_time_before || 0;
            const bufferAfter = service.buffer_time_after || 0;

            // Otteniamo gli orari di lavoro del provider per il giorno specificato
            const dayOfWeek = moment(date).day(); // 0=Domenica, 1=Lunedì, ...
            
            const scheduleQuery = `
                SELECT start_time, end_time
                FROM provider_schedules
                WHERE provider_id = ? AND day_of_week = ? AND is_active = true
                ${locationId ? 'AND location_id = ?' : ''}
            `;
            const scheduleParams = [providerId, dayOfWeek];
            if (locationId) scheduleParams.push(locationId);

            const [scheduleRows] = await pool.execute(scheduleQuery, scheduleParams);

            if (scheduleRows.length === 0) {
                return []; // Il provider non lavora in questo giorno
            }

            // Otteniamo gli appuntamenti già prenotati per quel giorno
            const existingQuery = `
                SELECT start_datetime, end_datetime
                FROM appointments
                WHERE provider_id = ? 
                AND DATE(start_datetime) = ? 
                AND status NOT IN ('cancelled')
                ${locationId ? 'AND location_id = ?' : ''}
                ORDER BY start_datetime
            `;
            const existingParams = [providerId, date];
            if (locationId) existingParams.push(locationId);

            const [existingRows] = await pool.execute(existingQuery, existingParams);

            // Generiamo gli slot disponibili
            const availableSlots = [];
            
            for (const schedule of scheduleRows) {
                const workStart = moment.tz(`${date} ${schedule.start_time}`, 'Europe/Rome');
                const workEnd = moment.tz(`${date} ${schedule.end_time}`, 'Europe/Rome');
                
                let currentSlot = workStart.clone();
                
                while (currentSlot.clone().add(serviceDuration, 'seconds').isSameOrBefore(workEnd)) {
                    const slotStart = currentSlot.clone();
                    const slotEnd = currentSlot.clone().add(serviceDuration, 'seconds');
                    
                    // Controllo se lo slot è libero
                    const isSlotFree = !existingRows.some(existing => {
                        const existingStart = moment(existing.start_datetime);
                        const existingEnd = moment(existing.end_datetime);
                        
                        // Controllo overlap considerando i buffer time
                        const slotStartWithBuffer = slotStart.clone().subtract(bufferBefore, 'seconds');
                        const slotEndWithBuffer = slotEnd.clone().add(bufferAfter, 'seconds');
                        
                        return slotStartWithBuffer.isBefore(existingEnd) && slotEndWithBuffer.isAfter(existingStart);
                    });
                    
                    if (isSlotFree && slotStart.isAfter(moment())) {
                        availableSlots.push({
                            start_datetime: slotStart.format('YYYY-MM-DD HH:mm:ss'),
                            end_datetime: slotEnd.format('YYYY-MM-DD HH:mm:ss'),
                            formatted_time: slotStart.format('HH:mm')
                        });
                    }
                    
                    currentSlot.add(30, 'minutes'); // Slot ogni 30 minuti
                }
            }

            return availableSlots;
        } catch (error) {
            throw new Error('Errore nel recuperare gli slot disponibili: ' + error.message);
        }
    }

    // Verificare se un slot è disponibile
    static async isSlotAvailable(providerId, startDatetime, endDatetime, excludeAppointmentId = null) {
        try {
            let query = `
                SELECT COUNT(*) as count
                FROM appointments
                WHERE provider_id = ?
                AND status NOT IN ('cancelled')
                AND (
                    (start_datetime <= ? AND end_datetime > ?) OR
                    (start_datetime < ? AND end_datetime >= ?) OR
                    (start_datetime >= ? AND start_datetime < ?)
                )
            `;
            const params = [providerId, startDatetime, startDatetime, endDatetime, endDatetime, startDatetime, endDatetime];

            if (excludeAppointmentId) {
                query += ' AND id != ?';
                params.push(excludeAppointmentId);
            }

            const [rows] = await pool.execute(query, params);
            return rows[0].count === 0;
        } catch (error) {
            throw new Error('Errore nel verificare la disponibilità: ' + error.message);
        }
    }

    // Creare un nuovo appuntamento
    static async create(appointmentData) {
        try {
            // Verifico la disponibilità
            const isAvailable = await Appointment.isSlotAvailable(
                appointmentData.provider_id,
                appointmentData.start_datetime,
                appointmentData.end_datetime
            );

            if (!isAvailable) {
                throw new Error('Lo slot selezionato non è disponibile');
            }

            const query = `
                INSERT INTO appointments (service_id, provider_id, location_id, start_datetime, 
                                        end_datetime, status, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
            const params = [
                appointmentData.service_id,
                appointmentData.provider_id,
                appointmentData.location_id || null,
                appointmentData.start_datetime,
                appointmentData.end_datetime,
                appointmentData.status || 'pending',
                appointmentData.notes || null
            ];

            const [result] = await pool.execute(query, params);
            return await Appointment.findById(result.insertId);
        } catch (error) {
            throw new Error('Errore nella creazione dell\'appuntamento: ' + error.message);
        }
    }

    // Aggiornare un appuntamento
    static async update(id, appointmentData) {
        try {
            // Se stiamo cambiando orario, verifico la disponibilità
            if (appointmentData.start_datetime && appointmentData.end_datetime) {
                const isAvailable = await Appointment.isSlotAvailable(
                    appointmentData.provider_id,
                    appointmentData.start_datetime,
                    appointmentData.end_datetime,
                    id
                );

                if (!isAvailable) {
                    throw new Error('Lo slot selezionato non è disponibile');
                }
            }

            const query = `
                UPDATE appointments 
                SET service_id = ?, provider_id = ?, location_id = ?, start_datetime = ?, 
                    end_datetime = ?, status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `;
            const params = [
                appointmentData.service_id,
                appointmentData.provider_id,
                appointmentData.location_id,
                appointmentData.start_datetime,
                appointmentData.end_datetime,
                appointmentData.status,
                appointmentData.notes,
                id
            ];

            await pool.execute(query, params);
            return await Appointment.findById(id);
        } catch (error) {
            throw new Error('Errore nell\'aggiornamento dell\'appuntamento: ' + error.message);
        }
    }

    // Cancellare un appuntamento
    static async cancel(id, reason = null) {
        try {
            const query = `
                UPDATE appointments 
                SET status = 'cancelled', notes = CONCAT(IFNULL(notes, ''), ?, ?), 
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `;
            const cancelReason = reason ? `\nCancellato: ${reason}` : '\nAppuntamento cancellato';
            await pool.execute(query, [cancelReason.length > 1 ? '\n' : '', cancelReason, id]);
            
            // Cancello anche tutte le prenotazioni associate
            await pool.execute('UPDATE bookings SET status = ? WHERE appointment_id = ?', ['cancelled', id]);
            
            return true;
        } catch (error) {
            throw new Error('Errore nella cancellazione dell\'appuntamento: ' + error.message);
        }
    }

    // Ottenere le prenotazioni dell'appuntamento
    async getBookings() {
        try {
            const query = `
                SELECT b.*, u.first_name, u.last_name, u.email, u.phone
                FROM bookings b
                LEFT JOIN users u ON b.customer_id = u.id
                WHERE b.appointment_id = ?
                ORDER BY b.created_at
            `;
            const [rows] = await pool.execute(query, [this.id]);
            return rows;
        } catch (error) {
            throw new Error('Errore nel recuperare le prenotazioni: ' + error.message);
        }
    }

    // Formattare la data/ora per la visualizzazione
    getFormattedStartDate(format = 'DD/MM/YYYY HH:mm') {
        return moment(this.start_datetime).format(format);
    }

    getFormattedEndDate(format = 'DD/MM/YYYY HH:mm') {
        return moment(this.end_datetime).format(format);
    }

    // Verificare se l'appuntamento è nel passato
    isPast() {
        return moment(this.start_datetime).isBefore(moment());
    }

    // Verificare se l'appuntamento è oggi
    isToday() {
        return moment(this.start_datetime).isSame(moment(), 'day');
    }

    // Ottenere la durata in minuti
    getDurationMinutes() {
        return moment(this.end_datetime).diff(moment(this.start_datetime), 'minutes');
    }
}

module.exports = Appointment;