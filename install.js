#!/usr/bin/env node

/**
 * Script di installazione per il Sistema di Prenotazioni
 * Configura automaticamente database e dipendenze
 */

const { execSync } = require('child_process');
const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('\n🚀 ===== INSTALLAZIONE SISTEMA PRENOTAZIONI =====\n');

async function question(prompt) {
    return new Promise(resolve => {
        rl.question(prompt, resolve);
    });
}

async function main() {
    try {
        console.log('📋 Questo script configura automaticamente il sistema di prenotazioni.\n');

        // Verifica Node.js
        console.log('🔍 Verifica prerequisiti...');
        try {
            const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
            console.log(`✅ Node.js: ${nodeVersion}`);
        } catch (error) {
            console.error('❌ Node.js non trovato. Installa Node.js 16+ prima di continuare.');
            process.exit(1);
        }

        // Verifica MySQL
        try {
            execSync('mysql --version', { encoding: 'utf8' });
            console.log('✅ MySQL disponibile');
        } catch (error) {
            console.error('❌ MySQL non trovato. Installa MySQL 5.7+ prima di continuare.');
            process.exit(1);
        }

        console.log('\n📝 Configurazione database...\n');

        // Raccolta informazioni database
        const dbHost = await question('Host database [localhost]: ') || 'localhost';
        const dbPort = await question('Porta database [3306]: ') || '3306';
        const dbUser = await question('Username database [root]: ') || 'root';
        const dbPassword = await question('Password database: ');
        const dbName = await question('Nome database [prenotazioni_system]: ') || 'prenotazioni_system';

        console.log('\n📧 Configurazione email (opzionale)...\n');
        const emailHost = await question('SMTP Host [smtp.gmail.com]: ') || 'smtp.gmail.com';
        const emailPort = await question('SMTP Port [587]: ') || '587';
        const emailUser = await question('Email username (opzionale): ');
        const emailPassword = await question('Email password (opzionale): ');

        console.log('\n⚙️ Configurazione server...\n');
        const serverPort = await question('Porta server [3000]: ') || '3000';
        const nodeEnv = await question('Ambiente [development]: ') || 'development';

        // Creazione file .env
        console.log('\n📄 Creazione file di configurazione...');
        const envContent = `
# Configurazione Database
DB_HOST=${dbHost}
DB_PORT=${dbPort}
DB_USER=${dbUser}
DB_PASSWORD=${dbPassword}
DB_NAME=${dbName}

# Configurazione JWT
JWT_SECRET=${generateRandomString(64)}
JWT_EXPIRES_IN=24h

# Configurazione Server
PORT=${serverPort}
NODE_ENV=${nodeEnv}

# Configurazione Email
EMAIL_HOST=${emailHost}
EMAIL_PORT=${emailPort}
EMAIL_USER=${emailUser}
EMAIL_PASSWORD=${emailPassword}
EMAIL_FROM=Sistema Prenotazioni <noreply@prenotazioni.com>

# Configurazione Timezone
TIMEZONE=Europe/Rome

# Configurazione Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
`.trim();

        fs.writeFileSync('.env', envContent);
        console.log('✅ File .env creato');

        // Installazione dipendenze
        console.log('\n📦 Installazione dipendenze...');
        try {
            execSync('npm install', { stdio: 'inherit' });
            console.log('✅ Dipendenze installate');
        } catch (error) {
            console.error('❌ Errore installazione dipendenze:', error.message);
            process.exit(1);
        }

        // Creazione database
        console.log('\n🗄️ Configurazione database...');
        const createDbSql = `CREATE DATABASE IF NOT EXISTS ${dbName} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`;
        
        try {
            execSync(`mysql -h${dbHost} -P${dbPort} -u${dbUser} ${dbPassword ? `-p${dbPassword}` : ''} -e "${createDbSql}"`, { stdio: 'inherit' });
            console.log('✅ Database creato');
        } catch (error) {
            console.error('❌ Errore creazione database. Verifica le credenziali.');
            console.error('Puoi creare il database manualmente e importare lo schema con:');
            console.error(`mysql -u${dbUser} -p ${dbName} < database_schema.sql`);
        }

        // Importazione schema
        try {
            console.log('📋 Importazione schema database...');
            execSync(`mysql -h${dbHost} -P${dbPort} -u${dbUser} ${dbPassword ? `-p${dbPassword}` : ''} ${dbName} < database_schema.sql`, { stdio: 'inherit' });
            console.log('✅ Schema database importato');
        } catch (error) {
            console.error('❌ Errore importazione schema. Esegui manualmente:');
            console.error(`mysql -u${dbUser} -p ${dbName} < database_schema.sql`);
        }

        // Migrazione dati Amelia (opzionale)
        const migrateData = await question('\n🔄 Vuoi migrare i dati da Amelia? (y/N): ');
        if (migrateData.toLowerCase() === 'y' || migrateData.toLowerCase() === 'yes') {
            try {
                console.log('📥 Migrazione dati Amelia...');
                execSync(`mysql -h${dbHost} -P${dbPort} -u${dbUser} ${dbPassword ? `-p${dbPassword}` : ''} ${dbName} < migrate_amelia_data.sql`, { stdio: 'inherit' });
                console.log('✅ Dati Amelia migrati');
            } catch (error) {
                console.error('❌ Errore migrazione dati. Esegui manualmente:');
                console.error(`mysql -u${dbUser} -p ${dbName} < migrate_amelia_data.sql`);
            }
        }

        console.log('\n🎉 ===== INSTALLAZIONE COMPLETATA! =====\n');
        console.log('✅ Sistema di prenotazioni configurato e pronto all\'uso\n');
        
        console.log('🚀 Per avviare il sistema:');
        console.log('   npm start                 (produzione)');
        console.log('   npm run dev               (sviluppo)\n');
        
        console.log('🌐 URLs disponibili:');
        console.log(`   Frontend:     http://localhost:${serverPort}`);
        console.log(`   API:          http://localhost:${serverPort}/api`);
        console.log(`   Health Check: http://localhost:${serverPort}/health\n`);
        
        console.log('📚 Consulta README.md per documentazione completa');
        
        const startNow = await question('\n🎯 Vuoi avviare il sistema ora? (Y/n): ');
        if (startNow.toLowerCase() !== 'n' && startNow.toLowerCase() !== 'no') {
            console.log('\n🚀 Avvio del sistema...\n');
            execSync('npm start', { stdio: 'inherit' });
        }

    } catch (error) {
        console.error('\n❌ Errore durante l\'installazione:', error.message);
        process.exit(1);
    } finally {
        rl.close();
    }
}

function generateRandomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Avvia l'installazione
main();