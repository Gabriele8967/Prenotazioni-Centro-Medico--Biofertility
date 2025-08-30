const mysql = require('mysql2');
require('dotenv').config();

// Configurazione della connessione al database
let dbConfig;

// Railway/Render fornisce DATABASE_URL, altrimenti usa variabili individuali
if (process.env.DATABASE_URL) {
    console.log('🔗 Usando DATABASE_URL (Hosting Esterno)');
    dbConfig = {
        uri: process.env.DATABASE_URL,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        charset: 'utf8mb4',
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    };
} else {
    console.log('🔗 Usando configurazione individuale');
    dbConfig = {
        host: process.env.MYSQL_HOST || process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.MYSQL_PORT || process.env.DB_PORT || '3306'),
        user: process.env.MYSQL_USER || process.env.DB_USER || 'root',
        password: process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD || '',
        database: process.env.MYSQL_DATABASE || process.env.DB_NAME || 'prenotazioni_system',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        charset: 'utf8mb4',
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
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