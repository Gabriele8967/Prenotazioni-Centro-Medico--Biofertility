# 🔄 Sistema di Sincronizzazione Bidirezionale Google Calendar

## 📋 Panoramica

Il sistema implementa una sincronizzazione **bidirezionale** tra il sistema di prenotazioni e Google Calendar, permettendo al centro medico di gestire autonomamente i propri appuntamenti direttamente in Google Calendar. Quando il centro aggiunge manualmente slot nel proprio calendario, questi **spariscono automaticamente** dal sito di prenotazioni, evitando sovrapprenotazioni.

## 🎯 Funzionalità Principali

### ✅ Sincronizzazione Bidirezionale
- **Dal sito → Google Calendar**: Prenotazioni create sul sito vengono automaticamente aggiunte al calendario
- **Da Google Calendar → Sito**: Eventi aggiunti manualmente in Google Calendar bloccano gli slot corrispondenti sul sito

### ✅ Sistema di Cache Intelligente  
- Cache automatico degli eventi per 5 minuti per ottimizzare le performance
- Invalidazione automatica quando Google Calendar viene modificato
- Riduzione drastica delle chiamate API a Google

### ✅ Notifiche Real-time (Webhook)
- Webhook configurabile per ricevere notifiche immediate da Google Calendar
- Polling di backup ogni 5 minuti nel caso il webhook non sia disponibile
- Sincronizzazione automatica quando vengono rilevate modifiche

### ✅ API di Controllo e Debug
- Endpoint per verificare stato sincronizzazione
- Possibilità di forzare sincronizzazione manuale
- Test di connessione Google Calendar
- Statistiche dettagliate su cache e sincronizzazione

## 🏗️ Architettura

### File Principali

1. **`services/googleCalendarService.js`** (Enhanced)
   - Gestione connessione Google Calendar API
   - Sistema cache intelligente
   - Controllo bidirezionale disponibilità slot
   - Gestione webhook notifications

2. **`services/calendarSyncService.js`** (Nuovo)
   - Orchestratore della sincronizzazione
   - Gestione polling automatico
   - Setup e gestione webhook
   - API di controllo sincronizzazione

3. **`server.js`** (Aggiornato)
   - Integrazione CalendarSyncService
   - Endpoint API per webhook e controllo
   - Inizializzazione automatica al startup

## 🚀 API Endpoints

### Webhook Google Calendar
```
POST /api/calendar/webhook
```
Riceve notifiche da Google Calendar quando eventi vengono modificati.

### Stato Sincronizzazione
```
GET /api/calendar/status
```
Restituisce statistiche sulla sincronizzazione:
```json
{
  "success": true,
  "lastSync": "2024-01-15T10:30:00.000Z",
  "cacheHits": 45,
  "cacheMisses": 12,
  "syncActive": true,
  "webhookActive": true
}
```

### Sincronizzazione Manuale
```
POST /api/calendar/sync
Body: { "date": "2024-01-15" } // Opzionale per singola data
```
Forza una sincronizzazione completa o per data specifica.

### Test Connessione
```
GET /api/calendar/test
```
Testa la connessione a Google Calendar:
```json
{
  "connected": true,
  "eventsToday": 5,
  "message": "Connessione Google Calendar OK"
}
```

## ⚙️ Configurazione

### Variabili d'Ambiente Richieste

```bash
# Google Calendar API
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret  
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback
GOOGLE_REFRESH_TOKEN=your_refresh_token
GOOGLE_CALENDAR_ID=your_calendar_id

# Webhook (Opzionale per notifiche real-time)
WEBHOOK_URL=https://yourdomain.com/api/calendar/webhook
WEBHOOK_SECRET=your_secret_token
```

### Setup OAuth2

1. **Google Cloud Console**:
   - Crea progetto e abilita Calendar API
   - Configura OAuth2 credentials
   - Aggiungi redirect URI

2. **Ottenere Refresh Token**:
   - Usa il flusso OAuth2 per ottenere il refresh token
   - Salva il token in `GOOGLE_REFRESH_TOKEN`

3. **ID Calendar**:
   - Trova l'ID del calendario da sincronizzare
   - Imposta in `GOOGLE_CALENDAR_ID`

## 🔄 Flusso di Sincronizzazione

### Scenario 1: Centro medico aggiunge appuntamento manualmente
```
1. Centro aggiunge evento in Google Calendar (es. "Visita Dr. Rossi 10:00-11:00")
2. Google Calendar invia webhook al sistema (se configurato)
3. Sistema invalida cache e aggiorna slot disponibili
4. Slot 10:00-11:00 NON appare più nel sito come disponibile
5. Utenti non possono più prenotare in quell'orario
```

### Scenario 2: Prenotazione dal sito
```
1. Utente prenota slot 14:00-15:00 sul sito
2. Sistema crea prenotazione nel database
3. Sistema crea evento in Google Calendar automaticamente  
4. Google Calendar si sincronizza con altri dispositivi del centro
5. Centro vede subito l'appuntamento in tutti i suoi dispositivi
```

## 📊 Logging e Monitoraggio

Il sistema produce log dettagliati per tracking e debug:

```
✅ Calendar sync service inizializzato e attivo
📋 Cache HIT per 2024-01-15
🔄 Recupero eventi da Google Calendar per 2024-01-16
📅 Trovati 3 eventi per 2024-01-16
❌ Slot 10:00 occupato da: "Visita controllo Dr. Smith" (10:00 - 11:00)
✅ Slot 11:00 disponibile
🔔 Ricevuta notifica webhook Google Calendar
🔄 Evento modificato - invalidazione cache
```

## 🧪 Test e Debug

### Test Script
```bash
node test-calendar-sync.js
```
Esegue una suite completa di test per verificare:
- Inizializzazione servizi
- Connessione Google Calendar
- Sistema cache
- Generazione slot
- Webhook setup

### Debug in Produzione
- Consulta i log del server per tracciare sincronizzazione
- Usa `GET /api/calendar/status` per verificare stato sistema
- Forza sincronizzazione con `POST /api/calendar/sync`

## ✨ Benefici per il Centro Medico

1. **Autonomia Completa**: Il centro può gestire i propri appuntamenti direttamente in Google Calendar senza interferire con il sistema di prenotazioni

2. **Prevenzione Conflitti**: Impossibile creare sovrapprenotazioni - il sistema blocca automaticamente slot occupati

3. **Sincronizzazione Multi-device**: Gli appuntamenti sono visibili istantaneamente su tutti i dispositivi del centro (smartphone, tablet, computer)

4. **Flessibilità**: Il centro può bloccare orari per pause, emergenze, o appuntamenti speciali semplicemente aggiungendoli al calendario

5. **Performance Ottimizzate**: Il sistema cache riduce i tempi di caricamento e le chiamate API

## 🎯 Caso d'Uso Tipico

**Mattina**: Il centro medico apre Google Calendar sul proprio smartphone e vede che ha 3 appuntamenti prenotati online + decide di aggiungere una pausa pranzo dalle 12:30 alle 14:00.

**Risultato**: Sul sito di prenotazioni:
- Gli orari 9:00, 10:30, 15:00 (appuntamenti esistenti) non sono disponibili
- Gli orari 12:30-14:00 (pausa pranzo aggiunta manualmente) non sono disponibili  
- Tutti gli altri orari rimangono prenotabili

**Zero configurazione necessaria** - tutto automatico! 🚀