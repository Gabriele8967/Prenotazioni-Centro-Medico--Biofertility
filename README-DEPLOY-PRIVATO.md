# 🏠 **Sistema Prenotazioni - Deploy Server Proprietario**

## 🎯 **Panoramica Sistema**

Sistema completo di prenotazioni per **Centro Infertilità Biofertility** configurato per deploy su server proprietario privato con:

- ✅ **Docker containerization** completa
- ✅ **Database MySQL** con 35+ servizi medici realistici
- ✅ **Nginx reverse proxy** con SSL
- ✅ **Google Calendar sync** bidirezionale 
- ✅ **Sistema backup automatico**
- ✅ **Monitoraggio integrato**
- ✅ **Installazione automatica**

---

## 🚀 **Installazione Rapida**

### **Prerequisiti**
- Server Linux (Ubuntu/Debian/CentOS)
- Accesso root (sudo)
- Connessione internet

### **Installazione con Un Comando**
```bash
curl -sSL https://raw.githubusercontent.com/Gabriele8967/Prenotazioni-Centro-Medico/main/install-server.sh | sudo bash -s https://github.com/Gabriele8967/Prenotazioni-Centro-Medico.git
```

### **Installazione Manuale**
```bash
# 1. Download del progetto
git clone https://github.com/Gabriele8967/Prenotazioni-Centro-Medico.git
cd Prenotazioni-Centro-Medico

# 2. Esegui installazione
sudo ./install-server.sh

# 3. Configurazione
sudo nano .env

# 4. Avvio sistema
docker-compose up -d
```

---

## ⚙️ **Configurazione**

### **File .env (Essenziale)**
Copia `.env.production.template` in `.env` e configura:

```bash
# === CONFIGURAZIONE MINIMA ===
FRONTEND_URL=https://prenotazioni.tuodominio.com
EMAIL_USER=tua-email@gmail.com  
EMAIL_PASSWORD=abcd-efgh-ijkl-mnop
COMPANY_EMAIL=tua-email@gmail.com

# === GOOGLE CALENDAR (Opzionale ma raccomandato) ===
GOOGLE_CLIENT_ID=123456-abc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123def456
GOOGLE_REFRESH_TOKEN=1//04abc123def456
GOOGLE_CALENDAR_ID=tuo-calendar@gmail.com
```

### **SSL Certificati**
```bash
# Certificati Let's Encrypt (Raccomandato)
certbot --nginx -d tuodominio.com

# O copia i tuoi certificati in:
nginx/ssl/cert.pem
nginx/ssl/key.pem
```

---

## 📋 **Servizi Inclusi nel Database**

### **35 Servizi Medici Specialistici**

#### **🔬 Visite Specialistiche (8 servizi)**
- Prima Visita Ginecologica (€120)
- Prima Visita Andrologica (€150) 
- Visita Endocrinologica (€180)
- Visita Pre-Concezionale Coppia (€200)
- Visita Post-Transfer (€100)
- Visita Gravidanza PMA (€120)
- Controlli di Follow-up

#### **🧪 Esami Diagnostici (12 servizi)**
- Ecografia Pelvica Transvaginale (€70)
- Ecografia 3D (€120)
- Monitoraggio Follicolare (€50)
- Spermiogramma Standard (€60)
- Test Frammentazione DNA (€180)
- Dosaggi Ormonali (€70-80)
- Test Genetici Pre-Concezionali (€250)

#### **🧬 Procreazione Assistita (6 servizi)**
- Inseminazione Intrauterina IUI (€450)
- Fecondazione In Vitro FIVET (€2500)
- ICSI Microiniezione (€3000)
- Transfer Embrioni Congelati (€800)
- Crioconservazione Ovociti (€1200)
- Social Freezing

#### **⚕️ Chirurgia Specialistica (5 servizi)**
- Isteroscopia Diagnostica (€250)
- Isteroscopia Operativa (€800)
- Laparoscopia (€1200-2000)
- Aspirazione Follicolare (€800)

#### **💬 Consulenze Specialistiche (4 servizi)**
- Consulenza Genetica (€150)
- Supporto Psicologico (€80-120)
- Consulenza Nutrizionale (€90)

---

## 🎮 **Gestione Sistema**

### **Comandi Base**
```bash
# Avvio sistema
docker-compose up -d

# Stop sistema  
docker-compose down

# Restart
docker-compose restart

# Logs in tempo reale
docker-compose logs -f

# Stato servizi
docker-compose ps
```

### **Monitoraggio Avanzato**
```bash
# Script di monitoraggio incluso
./monitoring.sh status      # Stato generale
./monitoring.sh resources   # Utilizzo risorse
./monitoring.sh logs        # Visualizza logs
```

### **Sistema Backup**
```bash
# Script backup automatico incluso
./backup-restore.sh backup    # Crea backup
./backup-restore.sh list      # Lista backup
./backup-restore.sh restore   # Ripristina backup
./backup-restore.sh cleanup   # Pulizia vecchi backup
```

---

## 🌐 **URL e Endpoint**

### **Frontend**
- **Homepage**: `https://tuodominio.com`
- **Sistema Prenotazioni**: `https://tuodominio.com/booking`

### **API Disponibili** 
- **Health Check**: `https://tuodominio.com/health`
- **API Base**: `https://tuodominio.com/api`
- **Servizi**: `https://tuodominio.com/api/services`
- **Prenotazioni**: `https://tuodominio.com/api/bookings`
- **Google Calendar**: `https://tuodominio.com/api/calendar`

### **Admin/Debug**
- **Database**: Accessibile via Docker
- **Logs**: `/opt/prenotazioni/nginx/logs`
- **Backup**: `/opt/backups/prenotazioni`

---

## 🔧 **Manutenzione**

### **Modalità Manutenzione**
```bash
# Attiva manutenzione
./monitoring.sh maintenance on

# Disattiva manutenzione  
./monitoring.sh maintenance off
```

### **Aggiornamenti Sistema**
```bash
# Pull nuove immagini
docker-compose pull

# Aggiorna con zero downtime
docker-compose up -d
```

### **Backup Automatico**
```bash
# Configura backup automatico (crontab)
0 2 * * * /opt/prenotazioni/backup-restore.sh backup
0 3 * * 0 /opt/prenotazioni/backup-restore.sh cleanup
```

---

## 📊 **Caratteristiche Tecniche**

### **Stack Tecnologico**
- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Node.js 18 + Express + MySQL
- **Proxy**: Nginx con SSL/TLS
- **Containerization**: Docker + Docker Compose
- **Database**: MySQL 8.0 con full-text search

### **Sicurezza**
- ✅ SSL/TLS automatico
- ✅ Rate limiting integrato
- ✅ Headers di sicurezza
- ✅ Firewall configurato
- ✅ Backup crittografati
- ✅ Utenti non-root nei container

### **Performance**
- ✅ Cache intelligente
- ✅ Compressione gzip
- ✅ Connection pooling database
- ✅ Health checks automatici
- ✅ Auto-restart su failure

---

## 🆘 **Risoluzione Problemi**

### **Servizi Non Si Avviano**
```bash
# Controlla logs
docker-compose logs mysql
docker-compose logs app
docker-compose logs nginx

# Riavvio forzato
docker-compose down
docker-compose up -d --force-recreate
```

### **Database Non Raggiungibile**
```bash
# Controlla connessione
docker-compose exec mysql mysql -u root -p

# Reset database
docker-compose down -v
docker-compose up -d
```

### **SSL Non Funziona**
```bash
# Rigenera certificati
certbot renew --nginx

# O usa certificati self-signed per test
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/key.pem -out nginx/ssl/cert.pem
```

---

## 📞 **Supporto**

### **Logs Importanti**
- **Applicazione**: `docker-compose logs app`
- **Database**: `docker-compose logs mysql` 
- **Web Server**: `nginx/logs/access.log`
- **Errori**: `nginx/logs/error.log`

### **Configurazione**
- **Docker**: `docker-compose.yml`
- **Nginx**: `nginx/nginx.conf`
- **App**: `.env`
- **Database**: Schema automatico al primo avvio

---

## 🎉 **Sistema Pronto!**

Una volta completata l'installazione avrai:

- 🌐 **Sito web completo** online e funzionante
- 📅 **35+ servizi medici** configurati e prenotabili  
- 🔄 **Sincronizzazione Google Calendar** bidirezionale
- 📧 **Notifiche email** automatiche
- 🛡️ **Sistema sicuro** e protetto
- 📊 **Monitoring** e backup automatici
- ⚡ **Performance ottimali** con caching

**Il tuo centro medico è pronto per ricevere prenotazioni online!** 🚀