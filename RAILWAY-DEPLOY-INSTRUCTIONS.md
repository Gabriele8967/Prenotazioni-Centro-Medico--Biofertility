# 🚀 **ISTRUZIONI DEPLOY RAILWAY - Passo Passo**

## ✅ **REPOSITORY PRONTO**
- **GitHub**: https://github.com/Gabriele8967/Prenotazioni-Centro-Medico
- **Status**: Repository creato e codice pushato ✅
- **Configurazione**: Tutto pronto per Railway deploy ✅

---

## 🔧 **STEP 1: Deploy su Railway**

### **1.1 Accedi a Railway**
1. Vai su **[railway.app](https://railway.app)**
2. Clicca **"Login"** → **"Continue with GitHub"** 
3. Autorizza Railway ad accedere ai tuoi repository

### **1.2 Crea Nuovo Progetto**
1. Dashboard Railway → **"New Project"**
2. Seleziona **"Deploy from GitHub repo"**
3. Cerca e seleziona: **"Prenotazioni-Centro-Medico"**
4. **Deploy automatico inizia!** ⚡

### **1.3 Configura Database MySQL**
1. Nel progetto Railway, clicca **"+ New"** 
2. Seleziona **"Database"** → **"MySQL"**
3. Database viene creato automaticamente
4. Railway auto-configura `DATABASE_URL` ✅

---

## ⚙️ **STEP 2: Configurazione Variabili**

Nel dashboard Railway, vai in **"Variables"** e aggiungi:

### **Variabili Essenziali (MINIMO)**
```bash
NODE_ENV=production
FRONTEND_URL=https://[il-tuo-app-nome].up.railway.app
```

### **Variabili Email (Raccomandate)**
```bash
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=[app-password-gmail]  
COMPANY_EMAIL=your-company-email@gmail.com
COMPANY_PHONE=+39 06 123 4567
COMPANY_ADDRESS=Via Velletri 7, Roma, Italia
```

### **Variabili Business (Opzionali)**
```bash
PAYMENT_URL=https://www.centroinfertilita.it/pagamento-personalizzato/
```

### **Google Calendar (Configureremo dopo)**
```bash
# Lasciali vuoti per ora - li configureremo dopo il setup Google
# GOOGLE_CLIENT_ID=
# GOOGLE_CLIENT_SECRET=
# GOOGLE_REFRESH_TOKEN=
# GOOGLE_CALENDAR_ID=
```

---

## 🗄️ **STEP 3: Inizializzazione Database**

### **3.1 Accedi al Database Railway**
1. Nel dashboard, clicca sul **database MySQL**
2. Vai in **"Data"** tab
3. Clicca **"Query"** 

### **3.2 Esegui Script Inizializzazione**
Copia e incolla questo SQL:

```sql
-- Database initialization for Railway
-- Copy and paste this entire script

-- Create categories table
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    service_count INT DEFAULT 0,
    average_price DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create services table
CREATE TABLE services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    duration INT DEFAULT 1800,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Create providers table  
CREATE TABLE providers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    description TEXT,
    image_url TEXT,
    service_count INT DEFAULT 0,
    specializations JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create locations table
CREATE TABLE locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create bookings table
CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    service_id INT,
    provider_id INT,
    location_id INT,
    customer_first_name VARCHAR(255) NOT NULL,
    customer_last_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255),
    customer_phone VARCHAR(20) NOT NULL,
    start_datetime DATETIME NOT NULL,
    end_datetime DATETIME NOT NULL,
    notes TEXT,
    booking_token VARCHAR(255) UNIQUE,
    status VARCHAR(50) DEFAULT 'confirmed',
    google_event_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE SET NULL,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL
);

-- Insert sample data
INSERT INTO categories (name, description, service_count, average_price) VALUES 
('Visite Specialistiche', 'Consulti medici specialistici per la fertilità', 5, 150.00),
('Esami Diagnostici', 'Analisi e controlli per la diagnosi', 8, 80.00),
('Terapie e Trattamenti', 'Trattamenti terapeutici specializzati', 4, 200.00);

INSERT INTO services (category_id, name, description, duration, price) VALUES 
(1, 'Prima Visita Ginecologica', 'Visita specialistica ginecologica completa con anamnesi', 2700, 120.00),
(1, 'Visita di Controllo', 'Visita di controllo per pazienti già in cura', 1800, 80.00),
(1, 'Consulenza Genetica', 'Consulenza specialistica per valutazione genetica', 3600, 200.00),
(2, 'Ecografia Pelvica', 'Ecografia pelvica transvaginale per valutazione anatomica', 1800, 70.00),
(2, 'Spermiogramma', 'Analisi completa del liquido seminale', 1800, 60.00),
(3, 'Inseminazione Artificiale', 'Procedura di inseminazione intrauterina', 1800, 300.00);

INSERT INTO providers (first_name, last_name, email, phone, description, specializations) VALUES 
('Mario', 'Rossi', 'mario.rossi@centroinfertilita.it', '+39 06 123 4567', 'Specialista in Ginecologia e Medicina della Riproduzione', JSON_ARRAY('Ginecologia', 'PMA')),
('Laura', 'Bianchi', 'laura.bianchi@centroinfertilita.it', '+39 06 123 4568', 'Embriologa clinica specializzata in PMA', JSON_ARRAY('Embriologia', 'PMA'));

INSERT INTO locations (name, address, phone) VALUES 
('Sede Principale Roma', 'Via Velletri 7, 00179 Roma', '+39 06 123 4567');
```

Clicca **"Run"** per eseguire lo script.

---

## 🧪 **STEP 4: Test Deploy**

### **4.1 Verifica Deployment**
1. Vai nel dashboard Railway del tuo progetto
2. Clicca sul servizio web (non il database)
3. Vai in **"Deployments"** → dovrebbe essere "Success" ✅
4. Clicca su **"View Logs"** per vedere eventuali errori

### **4.2 Test Sito**
1. Copia l'URL del sito: `https://[nome-app].up.railway.app`
2. Apri in una nuova scheda
3. Dovresti vedere la home page del centro medico ✅

### **4.3 Test API**
Vai su: `https://[nome-app].up.railway.app/health`  
Dovresti vedere:
```json
{
  "success": true,
  "message": "Sistema di prenotazioni online",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0"
}
```

---

## 🎯 **RISULTATO FINALE**

Dopo questi step avrai:
- ✅ **Sito online e funzionante** su Railway
- ✅ **Database MySQL configurato** con dati di esempio
- ✅ **SSL certificato automatico** (https)
- ✅ **URL pubblico** per Google Calendar setup
- ✅ **Auto-deploy** da GitHub (ogni push aggiorna il sito)

---

## 📧 **Prossimi Passi: Google Calendar Setup**

Una volta che il sito è online, **inviami il tuo URL finale** e procederemo con:

1. **Google Cloud Console setup** con URI corretti
2. **OAuth2 configuration** per Google Calendar
3. **Test sincronizzazione bidirezionale**
4. **Configurazione email notifications**

**Il tuo URL sarà qualcosa come**: `https://prenotazioni-centro-medico-production.up.railway.app`

---

## 🆘 **Problemi Comuni**

### **Deploy Failed**
- Controlla i logs in Railway dashboard
- Verifica che tutte le variabili siano configurate
- Il primo deploy può richiedere 5-10 minuti

### **Database Connection Error**  
- Assicurati che il database MySQL sia creato
- Railway auto-configura `DATABASE_URL` 
- Controlla che lo script SQL sia stato eseguito

### **Site Not Loading**
- Aspetta 2-3 minuti per il primo deploy
- Controlla che `NODE_ENV=production` sia impostato
- Verifica i logs per errori specifici

---

**🚀 Pronto per il deploy! Seguendo questi passi il tuo centro medico sarà online in 10-15 minuti!**