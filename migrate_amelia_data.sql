-- Script di migrazione dai dati Amelia al nuovo sistema
-- Eseguire dopo aver creato lo schema del nuovo database

-- Inserimento delle categorie
INSERT INTO `categories` (`id`, `name`, `description`, `color`, `image_url`, `position`) VALUES
(7, 'Consulto online', 'Consulti medici effettuati online', '#1A84EE', 'https://www.centroinfertilita.it/wp-content/uploads/2022/12/telehealth-62.jpg', 3),
(8, 'Tamponi e PAP-TEST', 'Esami diagnostici specialistici', '#1A84EE', 'https://www.centroinfertilita.it/wp-content/uploads/2023/02/family-doctor-042-e1678177017573.jpg', 2),
(9, 'Analisi', 'Analisi cliniche e di laboratorio', '#1A84EE', 'https://www.centroinfertilita.it/wp-content/uploads/2022/12/rsz_progesterone.jpg', 4),
(12, 'Prestazioni specialistiche BIOFERTILITY', 'Prestazioni specialistiche del centro', '#1A84EE', 'https://www.centroinfertilita.it/wp-content/uploads/2024/11/Equipe-Biofertility.png', 1);

-- Inserimento delle location
INSERT INTO `locations` (`id`, `name`, `address`, `phone`, `latitude`, `longitude`, `image_url`) VALUES
(1, 'Sede Via Velletri', 'Via Velletri, 7, 00198 Roma RM', '+3968415269', 40.748441, -73.987853, 'https://www.centroinfertilita.it/wp-content/uploads/2024/04/android-chrome-512x512lll.png'),
(2, 'Sede Eroi di Rodi', 'Viale degli Eroi di Rodi, 214, 00128 Roma RM', '+3968415269', 40.748441, -73.987853, 'https://www.centroinfertilita.it/wp-content/uploads/2024/04/android-chrome-512x512-1.png');

-- Inserimento dei provider (dottori)
INSERT INTO `users` (`id`, `type`, `first_name`, `last_name`, `email`, `status`, `description`, `image_url`, `timezone`) VALUES
(2, 'provider', 'Dr. Claudio', 'Manna', 'centrimanna2@gmail.com', 'active', 'Esperto in: Biologia della riproduzione umana, Ecografia, Ginecologia e ostetricia, Endocrinologia, Biologia della riproduzione umana, Andrologia', 'https://www.centroinfertilita.it/wp-content/uploads/2023/03/foto-prof-10-scaled.jpeg', 'Europe/Rome'),
(11, 'provider', 'Dr.ssa Francesca', 'Sagnella', 'centrimanna2+2@gmail.com', 'active', '', 'https://www.centroinfertilita.it/wp-content/uploads/2022/12/sagnella.png', 'Europe/Rome'),
(13, 'provider', 'Dr. Michele', 'Guidotti', 'centrimanna2+3@gmail.com', 'active', '', 'https://www.centroinfertilita.it/wp-content/uploads/2024/11/PHOTO-2024-11-20-16-42-45.jpg', 'Europe/Rome'),
(15, 'provider', 'Dr. Giuseppe', 'Sorrenti', 'centrimanna2+1@gmail.com', 'active', '', 'https://www.centroinfertilita.it/wp-content/uploads/2025/05/Sorrenti.jpg', 'Europe/Rome'),
(17, 'provider', 'Dott.ssa Claudia', 'Taddei', 'centrimanna2+4@gmail.com', 'active', '', 'https://www.centroinfertilita.it/wp-content/uploads/2025/01/claudia-taddei.png', 'Europe/Rome'),
(18, 'provider', 'Dott.ssa Sara', 'Pinto', 'centrimanna2+5@gmail.com', 'active', '', '', 'Europe/Rome');

-- Inserimento dei clienti
INSERT INTO `users` (`id`, `type`, `first_name`, `last_name`, `email`, `phone`, `country_code`, `timezone`) VALUES
(8, 'customer', 'Gabriele', 'Cucinotta', 'gabrielecucinotta900@gmail.com', '+393513894406', 'it', 'Europe/Rome'),
(9, 'customer', 'admin', 'admin', 'aromando@gmail.com', '9090', 'it', 'Europe/Rome'),
(16, 'customer', 'Claudio', 'Manna', 'claudiomanna55@gmail.com', '(327) 165-7709', 'us', 'Europe/Rome'),
(19, 'customer', 'Maria Adelaide', 'Cecere', 'daniellovincenzo09@gmail.com', '+393899683138', 'it', 'Europe/Rome'),
(20, 'customer', 'Irene', 'Martini', 'iremart92@gmail.com', '+39347093605', 'it', 'Europe/Rome'),
(21, 'customer', 'Chiara', 'Greco', 'chiaragreek@gmail.com', '+393402647984', 'it', 'Europe/Malta'),
(22, 'customer', 'Norma', 'Bartolini', 'norma.bartolini94@gmail.com', '+393283978008', 'it', 'Europe/Rome'),
(23, 'customer', 'Serena', 'Comuniello', 'serenavoice@gmail.com', '+393496115900', 'it', 'Europe/Rome'),
(24, 'customer', 'ANTONELLA', 'TATARELLI', 'antonellatatarelli@gmail.com', '+393207272725', 'it', 'Europe/Rome');

-- Inserimento dei servizi
INSERT INTO `services` (`id`, `name`, `description`, `price`, `duration`, `category_id`, `color`, `requires_confirmation`, `min_booking_time`, `position`) VALUES
(3, 'Visita ginecologica', 'LA PRENOTAZIONE DEVE AVVENIRE CON UN PREAVVISO MINIMO DI 48 ORE. Include ecografia. Bisogna portare tutti gli esami fatti fino a quel momento', 180.00, 7200, 12, '#1788FB', false, 172800, 4),
(17, 'Consulto ginecologico - online', 'Visita ginecologica effettuata online. Nota : La scelta della sede è indifferente in questo caso, in quanto la visita verrà svolta online', 120.00, 5400, 7, '#1788FB', false, 0, 21),
(36, 'Ormonali', 'Tutte le analisi sono svolte dalle ostetriche del nostro centro', 15.00, 600, 9, '#1788FB', false, 0, 22),
(47, 'Pacchetto analisi pre ICSI', 'Tutte le analisi sono svolte dalle ostetriche del nostro centro', 650.00, 600, 9, '#1788FB', false, 0, 23),
(59, 'Altre analisi', '', 0.00, 600, 9, '#1788FB', false, 0, 19),
(60, 'Tampone germi comuni', 'si esegue in qualsiasi momento del ciclo eccetto in presenza delle mestruazioni', 50.00, 600, 8, '#1788FB', false, 0, 29),
(61, 'Tampone clamidia', 'si esegue in qualsiasi momento del ciclo eccetto in presenza delle mestruazioni', 45.00, 600, 8, '#1788FB', false, 0, 28),
(62, 'Tampone micoplasma', 'si esegue in qualsiasi momento del ciclo eccetto in presenza delle mestruazioni', 35.00, 600, 8, '#1788FB', false, 0, 30),
(63, 'PAP-TEST', '', 60.00, 1200, 8, '#1788FB', false, 0, 25),
(83, 'Aspirazione cisti ovariche', '', 250.00, 1800, 12, '#1788FB', false, 0, 27),
(84, 'ISTEROSCOPIA', 'Generalmente si esegue tra la fine delle mestruazioni e l\'ovulazione, assumere 1h prima dell\'esame 1 cp di buscopan e 1 di zitromax. Questa prenotazione è soggetta a conferma. Se prevista anche la biopsia endometriale per plasmacellule, si può abbinare all\'isteroscopia, lo stesso giorno ed ora. L\'isteroscopia si esegue esclusivamente nella sede di via Velletri 7.', 250.00, 1200, 12, '#1788FB', true, 604800, 5),
(85, 'Biopsia endometriale per plasmacellule', 'Generalmente si esegue tra la fine delle mestruazioni e l\'ovulazione, assumere 1h prima dell\'esame 1 cp di buscopan e 1 di zitromax, bisogna presentarsi all\'esame a vescica semipiena', 220.00, 900, 12, '#1788FB', false, 0, 6),
(86, 'Biopsia datazione endometrio (finestra di impianto)', 'Generalmente si esegue tra la fine delle mestruazioni e l\'ovulazione, assumere 1h prima dell\'esame 1 cp di buscopan e 1 di zitromax, bisogna presentarsi all\'esame a vescica semipiena.', 300.00, 1800, 12, '#1788FB', false, 0, 7),
(87, 'SCRATCH ENDOMETRIO', 'Generalmente si esegue tra la fine delle mestruazioni e l\'ovulazione, assumere 1h prima dell\'esame 1 cp di buscopan e 1 di zitromax, bisogna presentarsi all\'esame a vescica semipiena', 100.00, 900, 12, '#1788FB', false, 0, 8),
(88, 'MONITORAGGIO FOLLICOLARE', 'è prenotabile la prima ecografia, intorno circa al settimo giorno del ciclo, le altre ecografie dipendono dal risultato della prima e dalla lunghezza del ciclo mestruale, e consta in media di tre o quattro ecografie, entrambe le sedi, è utile una nostra conferma alla prenotazione', 200.00, 900, 12, '#1788FB', true, 0, 10),
(89, 'Monitoraggio ecografico per pazienti esterne', '', 350.00, 900, 12, '#1788FB', false, 0, 11),
(90, 'Ecografia ginecologica', '', 50.00, 1800, 12, '#1788FB', false, 0, 12),
(91, 'Ecografia ostetrica del primo trimestre', '', 100.00, 1800, 12, '#1788FB', false, 0, 13),
(92, 'ISTEROSONOSALPINGOGRAFIA', 'l\'esame si esegue generalmente tra la fine delle mestruazioni e l\'ovulazione (in un ciclo di 28 gg mediamente tra il settimo e il tredicesimo giorno del ciclo) 1 h prima dell\'appuntamento dovrai prendere 1 buscopan e 1 zitromax e di venire a vescica semipiena', 300.00, 1800, 12, '#1788FB', true, 0, 14),
(93, 'SPERMIOGRAMMA', 'LA PRENOTAZIONE DEVE AVVENIRE CON UN PREAVVISO MINIMO DI 48 ORE. Portare precedenti spermiogrammi. Astinenza sessuale di 2-7 giorni. Possibile eseguire il prelievo a casa ed il campione deve giungere in contenitore sterile per le urine entro due ore.', 80.00, 1800, 12, '#1788FB', false, 0, 15);

-- Associazione provider a tutti i servizi (dal sistema originale tutti i provider offrono tutti i servizi)
INSERT INTO `provider_services` (`provider_id`, `service_id`) 
SELECT p.id, s.id 
FROM `users` p 
CROSS JOIN `services` s 
WHERE p.type = 'provider';

-- Associazione provider a tutte le location (dal sistema originale tutti i provider lavorano in tutte le sedi)
INSERT INTO `provider_locations` (`provider_id`, `location_id`)
SELECT p.id, l.id 
FROM `users` p 
CROSS JOIN `locations` l 
WHERE p.type = 'provider';

-- Inserimento appuntamenti esistenti
INSERT INTO `appointments` (`id`, `service_id`, `provider_id`, `location_id`, `start_datetime`, `end_datetime`, `status`, `google_event_id`) VALUES
(15, 3, 2, 1, '2025-05-13 07:30:00', '2025-05-13 09:00:00', 'confirmed', 'clomhip4217e8gc2e0p572h6q4'),
(16, 3, 2, 1, '2025-05-15 09:00:00', '2025-05-15 10:30:00', 'confirmed', 'rha2ajdhla9alaeed80i2njv3s'),
(17, 17, 2, 1, '2025-05-16 08:00:00', '2025-05-16 09:00:00', 'confirmed', 'b19cqmlp79pt9ipuno032k7jrs'),
(22, 17, 2, 1, '2025-06-23 14:30:00', '2025-06-23 15:30:00', 'confirmed', NULL);

-- Inserimento prenotazioni clienti
INSERT INTO `bookings` (`id`, `appointment_id`, `customer_id`, `status`, `price`, `persons`, `booking_token`, `payment_status`) VALUES
(15, 15, 8, 'confirmed', 180.00, 1, '0cf2c6b5a3', 'paid'),
(16, 16, 16, 'confirmed', 180.00, 1, '4e5d2e894f', 'paid'),
(17, 17, 19, 'confirmed', 120.00, 1, 'bb57a18f8b', 'paid'),
(22, 22, 20, 'confirmed', 120.00, 1, 'a3d0aa4a8d', 'pending');

-- Inserimento orari di lavoro standard per tutti i provider (esempio: Lunedì-Venerdì 9:00-18:00)
INSERT INTO `provider_schedules` (`provider_id`, `location_id`, `day_of_week`, `start_time`, `end_time`)
SELECT p.id, l.id, dow.day, '09:00:00', '18:00:00'
FROM `users` p
CROSS JOIN `locations` l
CROSS JOIN (
    SELECT 1 as day UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5
) dow
WHERE p.type = 'provider';

-- Aggiornamento delle sequenze degli ID per evitare conflitti
ALTER TABLE `categories` AUTO_INCREMENT = 100;
ALTER TABLE `locations` AUTO_INCREMENT = 100;
ALTER TABLE `users` AUTO_INCREMENT = 100;
ALTER TABLE `services` AUTO_INCREMENT = 100;
ALTER TABLE `appointments` AUTO_INCREMENT = 100;
ALTER TABLE `bookings` AUTO_INCREMENT = 100;