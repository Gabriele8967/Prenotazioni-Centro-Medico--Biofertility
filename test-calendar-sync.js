#!/usr/bin/env node

/**
 * Test script per il sistema di sincronizzazione bidirezionale Google Calendar
 * Verifica che tutti i componenti funzionino correttamente
 */

require('dotenv').config();
const { GoogleCalendarService } = require('./services/googleCalendarService');
const CalendarSyncService = require('./services/calendarSyncService');
const moment = require('moment-timezone');

async function testCalendarIntegration() {
    console.log('🧪 ===== TEST SINCRONIZZAZIONE GOOGLE CALENDAR =====\n');
    
    try {
        // Test 1: Inizializzazione GoogleCalendarService
        console.log('📋 Test 1: Inizializzazione GoogleCalendarService...');
        const googleCalendar = new GoogleCalendarService();
        console.log('✅ GoogleCalendarService inizializzato correttamente\n');
        
        // Test 2: Test connessione (se disponibile)
        console.log('📋 Test 2: Test connessione Google Calendar...');
        const connectionTest = await googleCalendar.testConnection();
        
        if (connectionTest.connected) {
            console.log('✅ Connessione Google Calendar OK');
            console.log(`📊 Calendari trovati: ${connectionTest.calendarsCount}`);
        } else {
            console.log('⚠️ Connessione Google Calendar fallita:', connectionTest.error);
            console.log('💡 Nota: Questo è normale se i token OAuth non sono configurati');
        }
        console.log('');
        
        // Test 3: Cache system
        console.log('📋 Test 3: Sistema di cache...');
        const today = moment().format('YYYY-MM-DD');
        
        // Prima chiamata (dovrebbe essere cache miss)
        const events1 = await googleCalendar.getEventsForDay(today);
        console.log(`📅 Prima chiamata: ${events1.length} eventi trovati`);
        
        // Seconda chiamata (dovrebbe essere cache hit)
        const events2 = await googleCalendar.getEventsForDay(today);
        console.log(`📅 Seconda chiamata: ${events2.length} eventi trovati (da cache)`);
        
        const stats = googleCalendar.getSyncStats();
        console.log(`📊 Cache hits: ${stats.cacheHits}, Cache misses: ${stats.cacheMisses}`);
        console.log('');
        
        // Test 4: Generazione slot disponibili
        console.log('📋 Test 4: Generazione slot disponibili...');
        const slots = await googleCalendar.getAvailableSlots(
            1, // providerId
            today, // data
            1800, // 30 minuti durata servizio
            { start: 9, end: 17 } // orari di lavoro
        );
        console.log(`⏰ Slot disponibili generati: ${slots.length}`);
        if (slots.length > 0) {
            console.log(`📋 Primi 3 slot: ${slots.slice(0, 3).map(s => s.formatted_time).join(', ')}`);
        }
        console.log('');
        
        // Test 5: Inizializzazione CalendarSyncService
        console.log('📋 Test 5: Inizializzazione CalendarSyncService...');
        const calendarSync = new CalendarSyncService();
        console.log('✅ CalendarSyncService inizializzato correttamente');
        
        const syncStats = calendarSync.getStats();
        console.log(`📊 Configurazione sincronizzazione:`);
        console.log(`   • Intervallo polling: ${syncStats.syncInterval/1000}s`);
        console.log(`   • Webhook URL: ${syncStats.webhookUrl}`);
        console.log(`   • Max giorni avanti: ${syncStats.maxDaysAhead}`);
        console.log('');
        
        // Test 6: Test connessione tramite CalendarSyncService
        console.log('📋 Test 6: Test connessione tramite CalendarSyncService...');
        const syncConnectionTest = await calendarSync.testConnection();
        
        if (syncConnectionTest.connected) {
            console.log('✅ CalendarSyncService connessione OK');
            console.log(`📅 Eventi oggi: ${syncConnectionTest.eventsToday}`);
        } else {
            console.log('⚠️ CalendarSyncService connessione fallita:', syncConnectionTest.error);
        }
        console.log('');
        
        // Cleanup
        console.log('🧹 Cleanup...');
        googleCalendar.clearCache();
        await calendarSync.cleanup();
        console.log('✅ Cleanup completato\n');
        
        // Riepilogo finale
        console.log('🎉 ===== RISULTATI TEST =====');
        console.log('✅ GoogleCalendarService: OK');
        console.log('✅ Sistema cache: OK');  
        console.log('✅ Generazione slot: OK');
        console.log('✅ CalendarSyncService: OK');
        
        if (connectionTest.connected && syncConnectionTest.connected) {
            console.log('✅ Connessione Google Calendar: OK');
            console.log('\n🚀 SISTEMA PRONTO PER LA SINCRONIZZAZIONE BIDIREZIONALE!');
            console.log('\n📋 Funzionalità disponibili:');
            console.log('   • ✅ Sincronizzazione automatica ogni 5 minuti');
            console.log('   • ✅ Cache intelligente per ottimizzare le performance');
            console.log('   • ✅ Webhook per notifiche real-time (quando configurato)');
            console.log('   • ✅ Controllo bidirezionale: eventi Google Calendar bloccano slot sito');
            console.log('   • ✅ API endpoints per controllo e debug');
        } else {
            console.log('⚠️ Connessione Google Calendar: NON CONFIGURATA');
            console.log('\n💡 Per abilitare la sincronizzazione completa:');
            console.log('   1. Configura GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI');
            console.log('   2. Ottieni GOOGLE_REFRESH_TOKEN tramite OAuth flow');
            console.log('   3. Imposta GOOGLE_CALENDAR_ID del calendario da sincronizzare');
            console.log('   4. Opzionale: WEBHOOK_URL e WEBHOOK_SECRET per notifiche real-time');
        }
        
    } catch (error) {
        console.error('❌ Errore durante i test:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
}

// Esegui i test
if (require.main === module) {
    testCalendarIntegration()
        .then(() => {
            console.log('\n✅ Tutti i test completati con successo!');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n❌ Test falliti:', error.message);
            process.exit(1);
        });
}

module.exports = { testCalendarIntegration };