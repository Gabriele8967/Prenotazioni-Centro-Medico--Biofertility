# 🌊 **Deploy DigitalOcean - Centro Biofertility**

## 🎯 **Panoramica**

Sistema completo di prenotazioni mediche configurato per **deploy automatico su DigitalOcean App Platform** con:

- ✅ **GitHub Actions CI/CD** automatizzato
- ✅ **Database MySQL Managed** DigitalOcean
- ✅ **SSL/TLS automatico** con certificati Let's Encrypt
- ✅ **Auto-scaling** e load balancing
- ✅ **Monitoraggio integrato** DigitalOcean
- ✅ **Backup automatici** database
- ✅ **Deploy con zero downtime**

---

## 🚀 **Setup Completo (5 minuti)**

### **Passo 1: Fork Repository**
```bash
# Fork questo repository su GitHub
https://github.com/Gabriele8967/Prenotazioni-Centro-Medico--Biofertility
```

### **Passo 2: Configurazione DigitalOcean**
1. **Crea account DigitalOcean** (se non ce l'hai)
2. **Vai su App Platform** → "Create App"
3. **Connetti GitHub** → Seleziona la tua repository forked
4. **Scegli branch** → `main` (deploy automatico)

### **Passo 3: Database Setup**
```bash
# In DigitalOcean Dashboard:
# 1. Crea "Managed Database" → MySQL 8.0
# 2. Scegli regione: Frankfurt (FRA1)
# 3. Piano: Development ($15/mese) o Production
# 4. Nome: biofertility-db
```

### **Passo 4: Variabili Ambiente**
Nella sezione **"Environment Variables"** dell'app:

```bash
# === CONFIGURAZIONE MINIMA ===
NODE_ENV=production
FRONTEND_URL=https://centro-biofertility-prenotazioni-xxxxx.ondigitalocean.app

# === EMAIL (Gmail) ===
EMAIL_USER=tua-email@gmail.com
EMAIL_PASSWORD=abcd-efgh-ijkl-mnop  # App Password Gmail
COMPANY_EMAIL=info@biofertility.it

# === GOOGLE CALENDAR (Opzionale) ===
GOOGLE_CLIENT_ID=123456-abc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123def456
GOOGLE_REFRESH_TOKEN=1//04abc123def456
GOOGLE_CALENDAR_ID=centro@biofertility.it

# === SICUREZZA ===
JWT_SECRET=super-secret-jwt-key-change-this-32-chars-minimum
```

---

## 📋 **Servizi Inclusi**

### **🏥 35 Servizi Medici Specialistici**
- **Visite Specialistiche**: Ginecologia, Andrologia, Endocrinologia
- **Esami Diagnostici**: Ecografie, Spermiogrammi, Test DNA
- **PMA**: FIVET, ICSI, Transfer embrioni, Social Freezing
- **Chirurgia**: Isteroscopia, Laparoscopia
- **Consulenze**: Genetica, Psicologia, Nutrizionale

---

## 🔧 **Configurazione Avanzata**

### **GitHub Secrets (Required)**
Nel repository GitHub → Settings → Secrets:

```bash
DIGITALOCEAN_ACCESS_TOKEN=dop_v1_abc123...  # Token DigitalOcean
SLACK_WEBHOOK_URL=https://hooks.slack.com/...  # Notifiche (opzionale)
```

### **Custom Domain (Opzionale)**
```bash
# 1. In DigitalOcean App Settings:
#    - Add Domain: www.biofertility.it
#    - SSL automatico: Let's Encrypt

# 2. DNS Records (nel tuo provider DNS):
CNAME  www  centro-biofertility-prenotazioni.ondigitalocean.app
```

### **Database Init Script**
```bash
# Il database viene inizializzato automaticamente con:
# - Schema completo (database_schema.sql)
# - 35 servizi medici (init-data.sql)
# - 4 medici specialisti
# - 3 sedi operative
```

---

## 🛠️ **GitHub Actions Workflow**

### **Pipeline Automatica**
```yaml
# Trigger: Push su main branch
1. ✅ Test Backend (Node.js + MySQL)
2. ✅ Test Frontend (React + TypeScript)
3. ✅ Security Check (Audit + Secrets)
4. 🚀 Deploy DigitalOcean (zero downtime)
```

### **Build Process**
```bash
# Backend:
npm ci → npm test → npm run build

# Frontend:
cd react-frontend → npm ci → npm run build → deploy

# Deploy:
DigitalOcean App Platform → Auto deploy
```

---

## 📊 **Monitoraggio & Logs**

### **DigitalOcean Dashboard**
- **Metrics**: CPU, RAM, Network, Response time
- **Logs**: Real-time application logs
- **Alerts**: Email/Slack notifications
- **Health Checks**: Endpoint `/health`

### **Database Monitoring**
```bash
# DigitalOcean Managed Database include:
- Connection pooling automatico
- Backup automatici (retention 7 giorni)
- SSL/TLS obbligatorio
- Monitoring CPU/RAM/Storage
```

---

## 🚀 **URL e Endpoint**

### **Produzione URLs**
```bash
# App principale
https://centro-biofertility-prenotazioni-xxxxx.ondigitalocean.app

# API Endpoint
https://centro-biofertility-prenotazioni-xxxxx.ondigitalocean.app/api/services
https://centro-biofertility-prenotazioni-xxxxx.ondigitalocean.app/api/bookings

# Health check
https://centro-biofertility-prenotazioni-xxxxx.ondigitalocean.app/health
```

### **Custom Domain (se configurato)**
```bash
https://www.biofertility.it
https://api.biofertility.it/services
```

---

## 💰 **Costi Stimati DigitalOcean**

### **Configurazione Raccomandata**
```bash
# App Platform:
Basic ($5/mese) → 512 MB RAM, 1 vCPU

# Database Managed MySQL:
Development ($15/mese) → 1 GB RAM, 1 vCPU, 10 GB storage
Production ($40/mese) → 2 GB RAM, 1 vCPU, 25 GB storage

# Totale: $20-45/mese
```

### **Scaling Automatico**
- **Traffic spike**: Auto-scale fino a 5 istanze
- **Database**: Scale verticale on-demand
- **CDN**: Includere $5/mese per performance globali

---

## 🔒 **Sicurezza Integrata**

### **App Platform Security**
- ✅ SSL/TLS automatico (Let's Encrypt)
- ✅ DDoS protection integrata
- ✅ Network isolation
- ✅ Security patches automatiche

### **Database Security**
- ✅ Connessioni SSL obbligatorie
- ✅ VPC network isolato
- ✅ Backup crittografati
- ✅ Access control (IP whitelist)

---

## 🆘 **Troubleshooting**

### **Deploy Fallisce**
```bash
# 1. Controlla GitHub Actions logs
# 2. Verifica variabili ambiente
# 3. Controlla connessione database:
https://cloud.digitalocean.com/apps → Logs tab
```

### **Database Connection Error**
```bash
# Verifica in DigitalOcean:
# 1. Database → Settings → Connection Details
# 2. App → Settings → Environment Variables
# 3. DATABASE_URL deve essere formato corretto
```

### **SSL Certificate Error**
```bash
# DigitalOcean gestisce SSL automaticamente
# Se hai problemi:
# 1. App Settings → Domains
# 2. Force HTTPS: Enabled
# 3. Attendere propagazione DNS (24h max)
```

---

## 🎉 **Risultato Finale**

Una volta completato il setup avrai:

- 🌐 **Sito web professionale** online 24/7
- 📅 **Sistema prenotazioni** completamente funzionale
- 🔄 **Sync Google Calendar** bidirezionale
- 📧 **Email notifications** automatiche
- 🛡️ **Sicurezza enterprise-grade**
- 📊 **Monitoring completo**
- 🚀 **Deploy automatico** ad ogni commit
- 💰 **Costi ottimizzati** ($20-45/mese)

**Il tuo centro medico è live e scalabile! 🚀**

---

## 📞 **Quick Links**

- **App Dashboard**: https://cloud.digitalocean.com/apps
- **Database**: https://cloud.digitalocean.com/databases
- **GitHub Actions**: https://github.com/tuorepo/actions
- **Documentazione DO**: https://docs.digitalocean.com/products/app-platform/