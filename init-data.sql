-- Dati iniziali per il sistema di prenotazioni - Centro Infertilità Biofertility
-- Eseguito automaticamente al primo avvio

-- Inserimento categorie di servizi (basate su centro fertilità reale)
INSERT IGNORE INTO categories (id, name, description, service_count, average_price, image_url) VALUES 
(1, 'Visite Specialistiche', 'Consulti medici specialistici per infertilità e salute riproduttiva', 8, 150.00, '/images/categories/visite.jpg'),
(2, 'Esami Diagnostici', 'Analisi e controlli diagnostici per valutazione fertilità', 12, 85.00, '/images/categories/esami.jpg'),
(3, 'Procreazione Assistita', 'Tecniche di PMA e trattamenti per la fertilità', 6, 800.00, '/images/categories/pma.jpg'),
(4, 'Chirurgia Specialistica', 'Interventi chirurgici per patologie della riproduzione', 5, 650.00, '/images/categories/chirurgia.jpg'),
(5, 'Consulenze Specialistiche', 'Supporto psicologico e consulenze genetiche', 4, 120.00, '/images/categories/consulenze.jpg');

-- Inserimento servizi completi per Centro Infertilità
INSERT IGNORE INTO services (id, category_id, name, description, duration, price) VALUES 

-- === VISITE SPECIALISTICHE (category_id = 1) ===
(1, 1, 'Prima Visita Ginecologica', 'Prima visita specialistica ginecologica completa con anamnesi, esame obiettivo e valutazione fertilità', 3600, 120.00),
(2, 1, 'Visita di Controllo Ginecologica', 'Visita di controllo per pazienti già seguiti dal centro', 2400, 80.00),
(3, 1, 'Prima Visita Andrologica', 'Prima visita andrologica specialistica con valutazione completa della fertilità maschile', 3600, 150.00),
(4, 1, 'Visita di Controllo Andrologica', 'Visita di controllo andrologica per follow-up terapeutico', 2400, 100.00),
(5, 1, 'Visita Endocrinologica', 'Valutazione endocrinologica specialistica per disordini ormonali e fertilità', 3600, 180.00),
(6, 1, 'Visita Pre-Concezionale di Coppia', 'Consulto specialistico per coppia che desidera una gravidanza', 4200, 200.00),
(7, 1, 'Visita Post-Transfer', 'Visita di controllo dopo transfer embrionale', 1800, 100.00),
(8, 1, 'Visita Gravidanza PMA', 'Controllo specialistico gravidanza da procreazione assistita', 2400, 120.00),

-- === ESAMI DIAGNOSTICI (category_id = 2) ===
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

-- === PROCREAZIONE MEDICALMENTE ASSISTITA (category_id = 3) ===
(21, 3, 'Inseminazione Intrauterina (IUI)', 'Procedura di inseminazione artificiale intrauterina', 1800, 450.00),
(22, 3, 'Fecondazione In Vitro (FIVET)', 'Ciclo FIVET completo con transfer fresco', 7200, 2500.00),
(23, 3, 'ICSI (Iniezione Intracitoplasmatica)', 'Fecondazione assistita con microiniezione spermatozoo', 7200, 3000.00),
(24, 3, 'Transfer di Embrioni Congelati (FET)', 'Trasferimento di embrioni crioconservati', 3600, 800.00),
(25, 3, 'Crioconservazione Embrioni', 'Congelamento e conservazione embrioni', 1800, 600.00),
(26, 3, 'Crioconservazione Ovociti', 'Social freezing - congelamento ovociti', 3600, 1200.00),

-- === CHIRURGIA SPECIALISTICA (category_id = 4) ===
(27, 4, 'Isteroscopia Diagnostica', 'Esame endoscopico della cavità uterina', 2400, 250.00),
(28, 4, 'Isteroscopia Operativa', 'Rimozione polipi/fibromi per via isteroscopica', 4800, 800.00),
(29, 4, 'Laparoscopia Diagnostica', 'Esplorazione laparoscopica della pelvi', 5400, 1200.00),
(30, 4, 'Laparoscopia per Endometriosi', 'Trattamento chirurgico endometriosi', 7200, 2000.00),
(31, 4, 'Aspirazione Follicolare', 'Prelievo ovocitario ecoguidato per PMA', 3600, 800.00),

-- === CONSULENZE SPECIALISTICHE (category_id = 5) ===
(32, 5, 'Consulenza Genetica', 'Consulenza genetica pre-concezionale specialistica', 3600, 150.00),
(33, 5, 'Consulenza Psicologica Individuale', 'Supporto psicologico per infertilità', 3000, 80.00),
(34, 5, 'Consulenza Psicologica di Coppia', 'Terapia di coppia per problemi di fertilità', 4200, 120.00),
(35, 5, 'Consulenza Nutrizionale', 'Consulenza nutrizionale per la fertilità', 2400, 90.00);

-- Inserimento medici/specialisti
INSERT IGNORE INTO providers (id, first_name, last_name, email, phone, description, specializations) VALUES 
(1, 'Mario', 'Rossi', 'mario.rossi@centromedico.it', '+39 06 123 4567', 
 'Specialista in Ginecologia e Medicina della Riproduzione con oltre 15 anni di esperienza nel settore della fertilità', 
 JSON_ARRAY('Ginecologia', 'Procreazione Medicalmente Assistita', 'Endocrinologia Riproduttiva')),

(2, 'Laura', 'Bianchi', 'laura.bianchi@centromedico.it', '+39 06 123 4568', 
 'Embriologa clinica specializzata in tecniche di fecondazione assistita e crioconservazione', 
 JSON_ARRAY('Embriologia Clinica', 'PMA', 'Genetica Riproduttiva')),

(3, 'Giuseppe', 'Verdi', 'giuseppe.verdi@centromedico.it', '+39 06 123 4569', 
 'Andrologo e specialista in medicina della riproduzione maschile', 
 JSON_ARRAY('Andrologia', 'Urologia', 'Medicina della Riproduzione Maschile')),

(4, 'Anna', 'Neri', 'anna.neri@centromedico.it', '+39 06 123 4570', 
 'Genetista medico specializzata in consulenze genetiche pre-concezionali e diagnosi prenatale', 
 JSON_ARRAY('Genetica Medica', 'Consulenza Genetica', 'Diagnostica Prenatale'));

-- Inserimento sedi/locations
INSERT IGNORE INTO locations (id, name, address, phone) VALUES 
(1, 'Sede Principale Roma', 'Via Velletri 7, 00179 Roma RM', '+39 06 123 4567'),
(2, 'Sede Secondaria Milano', 'Via Milano 123, 20100 Milano MI', '+39 02 987 6543'),
(3, 'Clinica Day Surgery', 'Via Chirurgica 45, 00179 Roma RM', '+39 06 555 1234');

-- Aggiornamento contatori servizi nelle categorie
UPDATE categories SET service_count = (
    SELECT COUNT(*) FROM services WHERE category_id = categories.id
) WHERE id IN (1, 2, 3, 4);

-- Aggiornamento prezzi medi nelle categorie
UPDATE categories SET average_price = (
    SELECT AVG(price) FROM services WHERE category_id = categories.id
) WHERE id IN (1, 2, 3, 4);