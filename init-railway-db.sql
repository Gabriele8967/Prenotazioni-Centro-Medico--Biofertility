-- Database initialization script for Railway MySQL
-- Creates tables and sample data for the medical booking system

-- Drop existing tables if they exist (for clean deployment)
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS services;
DROP TABLE IF EXISTS providers;
DROP TABLE IF EXISTS locations;
DROP TABLE IF EXISTS categories;

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

-- Insert sample categories
INSERT INTO categories (name, description, service_count, average_price) VALUES 
('Visite Specialistiche', 'Consulti medici specialistici per la fertilità', 5, 150.00),
('Esami Diagnostici', 'Analisi e controlli per la diagnosi', 8, 80.00),
('Terapie e Trattamenti', 'Trattamenti terapeutici specializzati', 4, 200.00),
('Chirurgia', 'Interventi chirurgici ambulatoriali', 3, 500.00);

-- Insert sample services
INSERT INTO services (category_id, name, description, duration, price) VALUES 
-- Visite Specialistiche (category_id = 1)
(1, 'Prima Visita Ginecologica', 'Visita specialistica ginecologica completa con anamnesi', 2700, 120.00),
(1, 'Visita di Controllo', 'Visita di controllo per pazienti già in cura', 1800, 80.00),
(1, 'Consulenza Genetica', 'Consulenza specialistica per valutazione genetica', 3600, 200.00),
(1, 'Visita Andrologica', 'Visita specialistica andrologica completa', 2700, 150.00),
(1, 'Visita Endocrinologica', 'Valutazione endocrinologica per infertilità', 3600, 180.00),

-- Esami Diagnostici (category_id = 2)  
(2, 'Ecografia Pelvica', 'Ecografia pelvica transvaginale per valutazione anatomica', 1800, 70.00),
(2, 'Ecografia Prostatica', 'Ecografia prostatica transrettale', 1800, 80.00),
(2, 'Isterosalpingografia', 'Esame radiologico delle tube di Falloppio', 3600, 150.00),
(2, 'Spermiogramma', 'Analisi completa del liquido seminale', 1800, 60.00),
(2, 'Dosaggi Ormonali', 'Prelievo per dosaggi ormonali fertilità', 900, 45.00),
(2, 'Test Genetici', 'Prelievo per test genetici specifici', 1800, 120.00),
(2, 'Ecografia Follicolare', 'Monitoraggio follicolare per stimolazione', 1200, 50.00),
(2, 'Test di Frammentazione DNA', 'Test avanzato qualità spermatozoi', 1800, 180.00),

-- Terapie e Trattamenti (category_id = 3)
(3, 'Inseminazione Artificiale', 'Procedura di inseminazione intrauterina', 1800, 300.00),
(3, 'Transfer Embrionale', 'Trasferimento di embrioni in utero', 3600, 800.00),
(3, 'Prelievo Ovocitario', 'Aspirazione follicolare per PMA', 3600, 1200.00),
(3, 'Crioconservazione', 'Congelamento gameti o embrioni', 1800, 400.00),

-- Chirurgia (category_id = 4)
(4, 'Isteroscopia Diagnostica', 'Isteroscopia per valutazione cavità uterina', 1800, 200.00),
(4, 'Isteroscopia Operativa', 'Isteroscopia con intervento correttivo', 3600, 600.00),
(4, 'Laparoscopia Diagnostica', 'Laparoscopia per valutazione pelvica', 3600, 800.00);

-- Insert sample providers
INSERT INTO providers (first_name, last_name, email, phone, description, specializations) VALUES 
('Mario', 'Rossi', 'mario.rossi@centroinfertilita.it', '+39 06 123 4567', 'Specialista in Ginecologia e Medicina della Riproduzione con 15 anni di esperienza', JSON_ARRAY('Ginecologia', 'PMA', 'Endocrinologia')),
('Laura', 'Bianchi', 'laura.bianchi@centroinfertilita.it', '+39 06 123 4568', 'Embriologa clinica specializzata in tecniche di fecondazione assistita', JSON_ARRAY('Embriologia', 'PMA', 'Genetica')),
('Giuseppe', 'Verdi', 'giuseppe.verdi@centroinfertilita.it', '+39 06 123 4569', 'Andrologo e specialista in medicina della riproduzione maschile', JSON_ARRAY('Andrologia', 'Urologia', 'PMA')),
('Anna', 'Neri', 'anna.neri@centroinfertilita.it', '+39 06 123 4570', 'Genetista medico specializzata in consulenze genetiche pre-concezionali', JSON_ARRAY('Genetica', 'Consulenza', 'Diagnostica'));

-- Insert sample locations
INSERT INTO locations (name, address, phone) VALUES 
('Sede Principale Roma', 'Via Velletri 7, 00179 Roma', '+39 06 123 4567'),
('Sede Milano', 'Via Milano 123, 20100 Milano', '+39 02 987 6543'),
('Clinica Day Surgery', 'Via Chirurgica 45, 00179 Roma', '+39 06 555 1234');

-- Update service counts in categories
UPDATE categories SET service_count = (
    SELECT COUNT(*) FROM services WHERE category_id = categories.id
);

-- Update service counts in providers (initially 0, will be updated as services are assigned)
UPDATE providers SET service_count = 0;