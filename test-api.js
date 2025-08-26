#!/usr/bin/env node

/**
 * Script di test per verificare il funzionamento dell'API
 */

const http = require('http');

const API_BASE = 'http://localhost:3000';

function makeRequest(path, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, API_BASE);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };

        if (data && method !== 'GET') {
            const jsonData = JSON.stringify(data);
            options.headers['Content-Length'] = Buffer.byteLength(jsonData);
        }

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on('end', () => {
                try {
                    const jsonBody = JSON.parse(body);
                    resolve({ status: res.statusCode, data: jsonBody });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });

        req.on('error', reject);

        if (data && method !== 'GET') {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function testEndpoint(name, path, expectedStatus = 200) {
    try {
        const response = await makeRequest(path);
        if (response.status === expectedStatus) {
            console.log(`✅ ${name}: OK (${response.status})`);
            return true;
        } else {
            console.log(`❌ ${name}: FAIL (${response.status})`);
            return false;
        }
    } catch (error) {
        console.log(`❌ ${name}: ERROR (${error.message})`);
        return false;
    }
}

async function testPostEndpoint(name, path, data, expectedStatus = 201) {
    try {
        const response = await makeRequest(path, 'POST', data);
        if (response.status === expectedStatus) {
            console.log(`✅ ${name}: OK (${response.status})`);
            return response.data;
        } else {
            console.log(`❌ ${name}: FAIL (${response.status}) - ${JSON.stringify(response.data)}`);
            return null;
        }
    } catch (error) {
        console.log(`❌ ${name}: ERROR (${error.message})`);
        return null;
    }
}

async function main() {
    console.log('\n🧪 ===== TEST API SISTEMA PRENOTAZIONI =====\n');

    let passedTests = 0;
    let totalTests = 0;

    console.log('🔍 Test endpoints base...\n');

    // Test Health Check
    totalTests++;
    if (await testEndpoint('Health Check', '/health')) {
        passedTests++;
    }

    // Test API Info
    totalTests++;
    if (await testEndpoint('API Info', '/api')) {
        passedTests++;
    }

    console.log('\n🏥 Test endpoints prenotazioni...\n');

    // Test Categories
    totalTests++;
    if (await testEndpoint('Lista Categorie', '/api/categories')) {
        passedTests++;
    }

    // Test Services
    totalTests++;
    if (await testEndpoint('Lista Servizi', '/api/services')) {
        passedTests++;
    }

    // Test Providers
    totalTests++;
    if (await testEndpoint('Lista Provider', '/api/users/providers')) {
        passedTests++;
    }

    // Test Locations
    totalTests++;
    if (await testEndpoint('Lista Location', '/api/locations')) {
        passedTests++;
    }

    // Test Service Details
    totalTests++;
    if (await testEndpoint('Dettaglio Servizio', '/api/services/3')) {
        passedTests++;
    }

    // Test Provider Details
    totalTests++;
    if (await testEndpoint('Dettaglio Provider', '/api/users/2')) {
        passedTests++;
    }

    // Test Available Slots
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    
    totalTests++;
    if (await testEndpoint('Slot Disponibili', `/api/bookings/available-slots?provider_id=2&service_id=3&date=${dateStr}&location_id=1`)) {
        passedTests++;
    }

    console.log('\n📝 Test creazione prenotazione...\n');

    // Test Booking Creation
    const testBooking = {
        service_id: 17, // Consulto online
        provider_id: 2,
        location_id: 1,
        start_datetime: `${dateStr} 10:00:00`,
        customer_data: {
            first_name: 'Test',
            last_name: 'Cliente',
            email: 'test@example.com',
            phone: '+393331234567',
            country_code: 'it'
        },
        persons: 1,
        notes: 'Prenotazione di test'
    };

    totalTests++;
    const bookingResult = await testPostEndpoint('Creazione Prenotazione', '/api/bookings', testBooking);
    if (bookingResult) {
        passedTests++;
        
        // Test booking retrieval by token
        if (bookingResult.data && bookingResult.data.booking_token) {
            totalTests++;
            if (await testEndpoint('Recupero per Token', `/api/bookings/token/${bookingResult.data.booking_token}`)) {
                passedTests++;
            }
        }
    }

    console.log('\n📊 ===== RISULTATI TEST =====\n');
    console.log(`✅ Test Passati: ${passedTests}`);
    console.log(`❌ Test Falliti: ${totalTests - passedTests}`);
    console.log(`📈 Percentuale Successo: ${Math.round((passedTests / totalTests) * 100)}%\n`);

    if (passedTests === totalTests) {
        console.log('🎉 Tutti i test sono passati! Il sistema funziona correttamente.\n');
        console.log('🌐 Puoi aprire http://localhost:3000 per utilizzare l\'interfaccia web.');
    } else {
        console.log('⚠️  Alcuni test sono falliti. Verifica la configurazione del sistema.');
        if (passedTests === 0) {
            console.log('💡 Suggerimento: Assicurati che il server sia in esecuzione su porta 3000');
        }
    }

    console.log('\n📚 Per maggiori dettagli, consulta README.md\n');
}

// Controllo se il server è raggiungibile
makeRequest('/health')
    .then(() => {
        main();
    })
    .catch(() => {
        console.log('\n❌ Server non raggiungibile su http://localhost:3000');
        console.log('💡 Avvia il server con: npm start\n');
    });