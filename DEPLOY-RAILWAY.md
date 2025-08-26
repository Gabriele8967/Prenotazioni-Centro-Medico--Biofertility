# 🚀 Deploy su Railway - Guida Rapida

## 📋 Informazioni Deploy

**Repository**: https://github.com/Gabriele8967/Prenotazioni-Centro-Medico  
**User**: Gabriele8967  
**Email**: gabrielecucinotta900@gmail.com

## 🔧 Step Deploy Railway

### 1. Accesso Railway
1. Vai su [railway.app](https://railway.app)
2. Login con GitHub (stesso account del repository)
3. Autorizza Railway ad accedere ai tuoi repository

### 2. Deploy Applicazione
1. **"New Project"** → **"Deploy from GitHub repo"**
2. Seleziona: **Prenotazioni-Centro-Medico**
3. Railway auto-rileva Node.js e configura tutto ✅
4. **Deploy automatico inizia!**

### 3. Configurazione Database
1. Nel dashboard Railway, clicca **"+ New"**
2. Seleziona **"Database"** → **"MySQL"**
3. Database viene creato automaticamente
4. Railway auto-configura `DATABASE_URL` per l'app ✅

### 4. Variabili d'Ambiente
Nel dashboard Railway, vai su **"Variables"** e aggiungi:

```bash
# FONDAMENTALI (Il resto può essere aggiunto dopo)
NODE_ENV=production
FRONTEND_URL=https://[nome-app].up.railway.app

# EMAIL (Opzionale, per notifiche)
EMAIL_USER=centrimanna2@gmail.com
EMAIL_PASSWORD=[app-password-gmail]
COMPANY_EMAIL=centrimanna2@gmail.com
COMPANY_PHONE=+39 06 123 4567

# PAYMENT (Opzionale)
PAYMENT_URL=https://www.centroinfertilita.it/pagamento-personalizzato/

# GOOGLE CALENDAR (Configureremo dopo)
# GOOGLE_CLIENT_ID=[da configurare]
# GOOGLE_CLIENT_SECRET=[da configurare]
# GOOGLE_REFRESH_TOKEN=[da configurare]
# GOOGLE_CALENDAR_ID=[da configurare]
```

### 5. Deploy Completion
- Railway compila e deploya automaticamente
- Tempo: ~3-5 minuti
- URL finale: `https://[nome-app].up.railway.app`

## ✅ Risultato

Dopo il deploy avrai:
- ✅ Sito live e funzionante
- ✅ Database MySQL configurato
- ✅ SSL certificato automatico  
- ✅ URL pubblico per Google Calendar setup
- ✅ Auto-deploy su push GitHub

## 🔧 Post-Deploy

Una volta online, useremo l'URL di produzione per:
1. Configurare Google Calendar OAuth2
2. Impostare webhook per sincronizzazione real-time
3. Test completo sistema di prenotazioni

## 📊 Monitoring

Railway dashboard fornisce:
- CPU/RAM usage
- Logs in tempo reale  
- Database metrics
- Deploy history

Il sistema è pronto per ricevere la configurazione Google Calendar! 🎯