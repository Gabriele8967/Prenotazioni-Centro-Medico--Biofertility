-- Schema PostgreSQL per Centro Biofertility
-- Versione compatibile per Render.com

-- Creazione tabella categorie
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    service_count INTEGER DEFAULT 0,
    average_price DECIMAL(10,2) DEFAULT 0.00,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Creazione tabella servizi
CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    duration INTEGER DEFAULT 3600,
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'disabled')),
    priority VARCHAR(10) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
    color VARCHAR(7) DEFAULT '#3B82F6',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Creazione tabella providers/medici
CREATE TABLE IF NOT EXISTS providers (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    description TEXT,
    specializations JSONB,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Creazione tabella locations/sedi
CREATE TABLE IF NOT EXISTS locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Creazione tabella bookings/prenotazioni
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
    provider_id INTEGER REFERENCES providers(id) ON DELETE SET NULL,
    location_id INTEGER REFERENCES locations(id) ON DELETE SET NULL,
    customer_name VARCHAR(150) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20),
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration INTEGER DEFAULT 3600,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    notes TEXT,
    total_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    booking_reference VARCHAR(50) UNIQUE,
    google_calendar_event_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Creazione indici per performance
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category_id);
CREATE INDEX IF NOT EXISTS idx_services_status ON services(status);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(appointment_date);
CREATE INDEX IF NOT EXISTS idx_bookings_service ON bookings(service_id);
CREATE INDEX IF NOT EXISTS idx_bookings_provider ON bookings(provider_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_reference ON bookings(booking_reference);

-- Inserimento categorie
INSERT INTO categories (id, name, description, service_count, average_price, image_url) VALUES 
(1, 'Visite Specialistiche', 'Consulti medici specialistici per infertilità e salute riproduttiva', 8, 150.00, '/images/categories/visite.jpg'),
(2, 'Esami Diagnostici', 'Analisi e controlli diagnostici per valutazione fertilità', 12, 85.00, '/images/categories/esami.jpg'),
(3, 'Procreazione Assistita', 'Tecniche di PMA e trattamenti per la fertilità', 6, 800.00, '/images/categories/pma.jpg'),
(4, 'Chirurgia Specialistica', 'Interventi chirurgici per patologie della riproduzione', 5, 650.00, '/images/categories/chirurgia.jpg'),
(5, 'Consulenze Specialistiche', 'Supporto psicologico e consulenze genetiche', 4, 120.00, '/images/categories/consulenze.jpg')
ON CONFLICT (id) DO NOTHING;

-- Inserimento servizi completi
INSERT INTO services (id, category_id, name, description, duration, price) VALUES 
-- VISITE SPECIALISTICHE
(1, 1, 'Prima Visita Ginecologica', 'Prima visita specialistica ginecologica completa con anamnesi, esame obiettivo e valutazione fertilità', 3600, 120.00),
(2, 1, 'Visita di Controllo Ginecologica', 'Visita di controllo per pazienti già seguiti dal centro', 2400, 80.00),
(3, 1, 'Prima Visita Andrologica', 'Prima visita andrologica specialistica con valutazione completa della fertilità maschile', 3600, 150.00),
(4, 1, 'Visita di Controllo Andrologica', 'Visita di controllo andrologica per follow-up terapeutico', 2400, 100.00),
(5, 1, 'Visita Endocrinologica', 'Valutazione endocrinologica specialistica per disordini ormonali e fertilità', 3600, 180.00),
(6, 1, 'Visita Pre-Concezionale di Coppia', 'Consulto specialistico per coppia che desidera una gravidanza', 4200, 200.00),
(7, 1, 'Visita Post-Transfer', 'Visita di controllo dopo transfer embrionale', 1800, 100.00),
(8, 1, 'Visita Gravidanza PMA', 'Controllo specialistico gravidanza da procreazione assistita', 2400, 120.00),

-- ESAMI DIAGNOSTICI
(9, 2, 'Ecografia Pelvica Transvaginale', 'Ecografia transvaginale per valutazione anatomica utero e ovaie', 1800, 70.00),
(10, 2, 'Ecografia Pelvica 3D', 'Ecografia 3D per valutazione anatomica dettagliata', 2400, 120.00),
(11, 2, 'Ecografia Prostatica Transrettale', 'Ecografia prostatica per valutazione andrologica', 1800, 80.00),
(12, 2, 'Monitoraggio Follicolare', 'Controllo ecografico crescita follicolare durante stimolazione', 1200, 50.00),
(13, 2, 'Isterosalpingografia', 'Esame radiologico per valutazione pervietà tubarica', 3600, 150.00),
(14, 2, 'Sonoisterosalpingografia', 'Ecografia con contrasto per valutazione tube e cavità uterina', 2400, 120.00),
(15, 2, 'Spermiogramma Standard', 'Analisi completa del liquido seminale secondo OMS', 1800, 60.00),
(16, 2, 'Spermiocoltura', 'Esame microbiologico del liquido seminale', 1200, 45.00),
(17, 2, 'Test di Frammentazione DNA', 'Analisi frammentazione DNA spermatozoi', 1800, 180.00),
(18, 2, 'Dosaggi Ormonali Femminili', 'Pannello ormonale completo femminile', 900, 80.00),
(19, 2, 'Dosaggi Ormonali Maschili', 'Pannello ormonale andrologico', 900, 70.00),
(20, 2, 'Test Genetici Pre-Concezionali', 'Screening genetico per malattie ereditarie', 1800, 250.00),

-- PROCREAZIONE ASSISTITA
(21, 3, 'Inseminazione Intrauterina (IUI)', 'Procedura di inseminazione artificiale intrauterina', 1800, 450.00),
(22, 3, 'Fecondazione In Vitro (FIVET)', 'Ciclo FIVET completo con transfer fresco', 7200, 2500.00),
(23, 3, 'ICSI (Iniezione Intracitoplasmatica)', 'Fecondazione assistita con microiniezione spermatozoo', 7200, 3000.00),
(24, 3, 'Transfer di Embrioni Congelati (FET)', 'Trasferimento di embrioni crioconservati', 3600, 800.00),
(25, 3, 'Crioconservazione Embrioni', 'Congelamento e conservazione embrioni', 1800, 600.00),
(26, 3, 'Crioconservazione Ovociti', 'Social freezing - congelamento ovociti', 3600, 1200.00),

-- CHIRURGIA SPECIALISTICA
(27, 4, 'Isteroscopia Diagnostica', 'Esame endoscopico della cavità uterina', 2400, 250.00),
(28, 4, 'Isteroscopia Operativa', 'Rimozione polipi/fibromi per via isteroscopica', 4800, 800.00),
(29, 4, 'Laparoscopia Diagnostica', 'Esplorazione laparoscopica della pelvi', 5400, 1200.00),
(30, 4, 'Laparoscopia per Endometriosi', 'Trattamento chirurgico endometriosi', 7200, 2000.00),
(31, 4, 'Aspirazione Follicolare', 'Prelievo ovocitario ecoguidato per PMA', 3600, 800.00),

-- CONSULENZE SPECIALISTICHE
(32, 5, 'Consulenza Genetica', 'Consulenza genetica pre-concezionale specialistica', 3600, 150.00),
(33, 5, 'Consulenza Psicologica Individuale', 'Supporto psicologico per infertilità', 3000, 80.00),
(34, 5, 'Consulenza Psicologica di Coppia', 'Terapia di coppia per problemi di fertilità', 4200, 120.00),
(35, 5, 'Consulenza Nutrizionale', 'Consulenza nutrizionale per la fertilità', 2400, 90.00)
ON CONFLICT (id) DO NOTHING;

-- Inserimento medici/specialisti
INSERT INTO providers (id, first_name, last_name, email, phone, description, specializations) VALUES 
(1, 'Mario', 'Rossi', 'mario.rossi@centromedico.it', '+39 06 123 4567', 
 'Specialista in Ginecologia e Medicina della Riproduzione con oltre 15 anni di esperienza nel settore della fertilità', 
 '["Ginecologia", "Procreazione Medicalmente Assistita", "Endocrinologia Riproduttiva"]'::jsonb),
(2, 'Laura', 'Bianchi', 'laura.bianchi@centromedico.it', '+39 06 123 4568', 
 'Embriologa clinica specializzata in tecniche di fecondazione assistita e crioconservazione', 
 '["Embriologia Clinica", "PMA", "Genetica Riproduttiva"]'::jsonb),
(3, 'Giuseppe', 'Verdi', 'giuseppe.verdi@centromedico.it', '+39 06 123 4569', 
 'Andrologo e specialista in medicina della riproduzione maschile', 
 '["Andrologia", "Urologia", "Medicina della Riproduzione Maschile"]'::jsonb),
(4, 'Anna', 'Neri', 'anna.neri@centromedico.it', '+39 06 123 4570', 
 'Genetista medico specializzata in consulenze genetiche pre-concezionali e diagnosi prenatale', 
 '["Genetica Medica", "Consulenza Genetica", "Diagnostica Prenatale"]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Inserimento sedi/locations
INSERT INTO locations (id, name, address, phone) VALUES 
(1, 'Sede Principale Roma', 'Via Velletri 7, 00179 Roma RM', '+39 06 123 4567'),
(2, 'Sede Secondaria Milano', 'Via Milano 123, 20100 Milano MI', '+39 02 987 6543'),
(3, 'Clinica Day Surgery', 'Via Chirurgica 45, 00179 Roma RM', '+39 06 555 1234')
ON CONFLICT (id) DO NOTHING;

-- Aggiornamento sequenze per PostgreSQL
SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));
SELECT setval('services_id_seq', (SELECT MAX(id) FROM services));
SELECT setval('providers_id_seq', (SELECT MAX(id) FROM providers));
SELECT setval('locations_id_seq', (SELECT MAX(id) FROM locations));

-- Aggiornamento contatori servizi nelle categorie
UPDATE categories SET service_count = (
    SELECT COUNT(*) FROM services WHERE category_id = categories.id
);

-- Aggiornamento prezzi medi nelle categorie
UPDATE categories SET average_price = (
    SELECT COALESCE(AVG(price), 0) FROM services WHERE category_id = categories.id
);