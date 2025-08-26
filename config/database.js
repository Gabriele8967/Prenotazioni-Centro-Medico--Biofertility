const mysql = require('mysql2');
require('dotenv').config();

// Configurazione della connessione al database
let dbConfig;

// Railway fornisce DATABASE_URL, altrimenti usa variabili individuali
if (process.env.DATABASE_URL) {
    console.log('🔗 Usando DATABASE_URL (Railway/Produzione)');
    dbConfig = {
        uri: process.env.DATABASE_URL,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        acquireTimeout: 60000,
        timeout: 60000,
        reconnect: true,
        charset: 'utf8mb4'
    };
} else {
    console.log('🔗 Usando configurazione locale');
    dbConfig = {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'prenotazioni_system',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        acquireTimeout: 60000,
        timeout: 60000,
        reconnect: true,
        charset: 'utf8mb4'
    };
}

// Creazione del pool di connessioni
const pool = mysql.createPool(dbConfig);

// Creazione della promessa per le query
const promisePool = pool.promise();

// Test della connessione
const testConnection = async () => {
    try {
        const connection = await promisePool.getConnection();
        console.log('✅ Database connesso con successo');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Errore connessione database:', error);
        return false;
    }
};

module.exports = {
    pool: promisePool,
    testConnection
};