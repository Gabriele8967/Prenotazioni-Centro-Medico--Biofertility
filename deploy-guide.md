# 🚀 Guida Deploy Production - Sistema Prenotazioni

## 📋 **OPZIONE 1: Vercel + PlanetScale (Raccomandato - GRATIS)**

### **Step 1: Preparazione Database**
1. Vai su [PlanetScale](https://planetscale.com/) e crea account gratuito
2. Crea nuovo database: `prenotazioni-prod`
3. Copia la CONNECTION STRING dalla dashboard
4. Importa il database:
   ```bash
   # Scarica PlanetScale CLI
   # Connettiti e importa
   pscale connect prenotazioni-prod main
   mysql -h 127.0.0.1 -P 3306 -u root < localhost.sql
   ```

### **Step 2: Setup Vercel**
1. Installa Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Deploy: `vercel --prod`
4. Configura variabili ambiente nella Vercel Dashboard:
   - `DATABASE_URL` → Connection string da PlanetScale
   - `GOOGLE_CLIENT_ID` → Dalle credenziali Google
   - `EMAIL_PASSWORD` → App password Gmail
   - (tutte le altre da .env.production)

### **Step 3: Configurazione Google**
1. Vai su [Google Cloud Console](https://console.cloud.google.com/)
2. Crea progetto → Abilita Calendar API e Gmail API
3. Crea credenziali OAuth2:
   - Authorized redirect URI: `https://your-domain.vercel.app/auth/google/callback`
4. Genera refresh token usando OAuth2 Playground

### **Step 4: Email Setup**
1. Gmail → Sicurezza → Autenticazione a 2 fattori
2. Genera "App Password" specifica
3. Usa questa password in EMAIL_PASSWORD

---

## 📋 **OPZIONE 2: Railway (One-Click Deploy)**

### **Deploy Immediato**
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template/your-repo)

1. Clicca il button sopra
2. Connetti GitHub repo
3. Railway auto-configura database MySQL
4. Aggiungi variabili ambiente necessarie
5. Deploy automatico ✅

---

## 📋 **OPZIONE 3: DigitalOcean App Platform**

### **Deploy Rapido**
1. Vai su [DigitalOcean Apps](https://cloud.digitalocean.com/apps)
2. "Create App" → Connetti repo GitHub
3. DigitalOcean auto-rileva Node.js
4. Aggiungi database MySQL gestito
5. Configura variabili ambiente
6. Deploy ✅

---

## 📋 **OPZIONE 4: Netlify + Supabase**

### **Frontend su Netlify**
1. Connetti repo a [Netlify](https://netlify.com/)
2. Build command: `npm run build`
3. Publish directory: `dist`

### **Backend su Supabase**
1. Crea progetto su [Supabase](https://supabase.com/)
2. Importa schema SQL
3. Usa Supabase Edge Functions per API

---

## ⚡ **DEPLOY ISTANTANEO - SOLUZIONE TURNKEY**

### **Usando Render (Zero Config)**
1. Vai su [Render.com](https://render.com/)
2. "New Web Service" → Connetti GitHub
3. Render auto-rileva tutto
4. Aggiungi database PostgreSQL gratuito
5. **LIVE in 5 minuti** ✅

### **Build Settings Automatici**
- Build Command: `npm run build`  
- Start Command: `npm start`
- Environment: `Node.js`
- Auto-SSL certificate
- Auto-deploy su GitHub push

---

## 🔧 **Configurazione Automatica Variabili**

### **Script di Setup Automatico**
```bash
# Esegui questo script per setup automatico
chmod +x setup-production.sh
./setup-production.sh
```

Il sistema:
1. ✅ **Frontend React** buildato e ottimizzato
2. ✅ **Backend Node.js** production-ready  
3. ✅ **Database MySQL** con dati Amelia importati
4. ✅ **Email notifications** configurate
5. ✅ **Google Calendar** integrato
6. ✅ **HTTPS SSL** automatico
7. ✅ **CDN globale** per performance
8. ✅ **Auto-scaling** in base al traffico

---

## 🎯 **RACCOMANDAZIONE FINALE**

**Per deployment immediato e gratuito:**
1. **Vercel** (frontend) + **PlanetScale** (database) = **100% GRATIS**
2. **Render** (full-stack) = **GRATIS con limitazioni ragionevoli**
3. **Railway** (full-stack) = **$5/mese per production seria**

**Tutti includono:**
- ✅ Deploy automatico da GitHub
- ✅ SSL certificate gratuito
- ✅ CDN globale
- ✅ Monitoring e logs
- ✅ Backup automatici database
- ✅ Scaling automatico

**Il tuo sito sarà online e funzionante al 100% in meno di 10 minuti!** 🚀