-- Schema del database per il sistema di prenotazioni proprietario
-- Basato sui dati estratti dal plugin Amelia

CREATE DATABASE IF NOT EXISTS `prenotazioni_system` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `prenotazioni_system`;

-- Tabella delle categorie di servizi
CREATE TABLE `categories` (
    `id` int PRIMARY KEY AUTO_INCREMENT,
    `name` varchar(255) NOT NULL,
    `description` text,
    `color` varchar(7) DEFAULT '#1A84EE',
    `image_url` varchar(500),
    `status` enum('active', 'inactive') DEFAULT 'active',
    `position` int DEFAULT 0,
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabella delle sedi/location
CREATE TABLE `locations` (
    `id` int PRIMARY KEY AUTO_INCREMENT,
    `name` varchar(255) NOT NULL,
    `address` varchar(500) NOT NULL,
    `phone` varchar(20),
    `description` text,
    `latitude` decimal(10,8),
    `longitude` decimal(11,8),
    `image_url` varchar(500),
    `status` enum('active', 'inactive') DEFAULT 'active',
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabella degli utenti (clienti e provider)
CREATE TABLE `users` (
    `id` int PRIMARY KEY AUTO_INCREMENT,
    `type` enum('customer', 'provider', 'admin') NOT NULL,
    `first_name` varchar(255) NOT NULL,
    `last_name` varchar(255) NOT NULL,
    `email` varchar(255) UNIQUE,
    `phone` varchar(20),
    `gender` enum('male', 'female'),
    `birthday` date,
    `password` varchar(255),
    `status` enum('active', 'inactive', 'blocked') DEFAULT 'active',
    `description` text,
    `image_url` varchar(500),
    `specialization` text,
    `country_code` varchar(2) DEFAULT 'it',
    `timezone` varchar(50) DEFAULT 'Europe/Rome',
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabella dei servizi
CREATE TABLE `services` (
    `id` int PRIMARY KEY AUTO_INCREMENT,
    `name` varchar(255) NOT NULL,
    `description` text,
    `price` decimal(10,2) NOT NULL,
    `duration` int NOT NULL COMMENT 'Durata in secondi',
    `category_id` int,
    `color` varchar(7) DEFAULT '#1788FB',
    `min_capacity` int DEFAULT 1,
    `max_capacity` int DEFAULT 1,
    `buffer_time_before` int DEFAULT 0 COMMENT 'Tempo buffer prima in secondi',
    `buffer_time_after` int DEFAULT 0 COMMENT 'Tempo buffer dopo in secondi',
    `status` enum('active', 'inactive', 'disabled') DEFAULT 'active',
    `priority` enum('low', 'normal', 'high') DEFAULT 'normal',
    `requires_confirmation` boolean DEFAULT false,
    `min_booking_time` int DEFAULT 0 COMMENT 'Tempo minimo prenotazione in secondi',
    `position` int DEFAULT 0,
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL
);

-- Tabella per associare provider ai servizi
CREATE TABLE `provider_services` (
    `id` int PRIMARY KEY AUTO_INCREMENT,
    `provider_id` int NOT NULL,
    `service_id` int NOT NULL,
    `custom_price` decimal(10,2),
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`provider_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `provider_service_unique` (`provider_id`, `service_id`)
);

-- Tabella per associare provider alle location
CREATE TABLE `provider_locations` (
    `id` int PRIMARY KEY AUTO_INCREMENT,
    `provider_id` int NOT NULL,
    `location_id` int NOT NULL,
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`provider_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `provider_location_unique` (`provider_id`, `location_id`)
);

-- Tabella degli orari di lavoro dei provider
CREATE TABLE `provider_schedules` (
    `id` int PRIMARY KEY AUTO_INCREMENT,
    `provider_id` int NOT NULL,
    `location_id` int,
    `day_of_week` tinyint NOT NULL COMMENT '0=Domenica, 1=Lunedì, ..., 6=Sabato',
    `start_time` time NOT NULL,
    `end_time` time NOT NULL,
    `is_active` boolean DEFAULT true,
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`provider_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`) ON DELETE SET NULL
);

-- Tabella dei giorni di chiusura/vacanze
CREATE TABLE `provider_time_off` (
    `id` int PRIMARY KEY AUTO_INCREMENT,
    `provider_id` int NOT NULL,
    `start_date` date NOT NULL,
    `end_date` date NOT NULL,
    `reason` varchar(255),
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`provider_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

-- Tabella degli appuntamenti
CREATE TABLE `appointments` (
    `id` int PRIMARY KEY AUTO_INCREMENT,
    `service_id` int NOT NULL,
    `provider_id` int NOT NULL,
    `location_id` int,
    `start_datetime` datetime NOT NULL,
    `end_datetime` datetime NOT NULL,
    `status` enum('pending', 'confirmed', 'completed', 'cancelled', 'no_show') DEFAULT 'pending',
    `notes` text,
    `google_event_id` varchar(255),
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`provider_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`) ON DELETE SET NULL
);

-- Tabella delle prenotazioni dei clienti
CREATE TABLE `bookings` (
    `id` int PRIMARY KEY AUTO_INCREMENT,
    `appointment_id` int NOT NULL,
    `customer_id` int NOT NULL,
    `status` enum('pending', 'confirmed', 'completed', 'cancelled', 'no_show') DEFAULT 'pending',
    `price` decimal(10,2) NOT NULL,
    `persons` int DEFAULT 1,
    `custom_fields` json,
    `booking_token` varchar(10) UNIQUE,
    `payment_status` enum('pending', 'paid', 'refunded') DEFAULT 'pending',
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`appointment_id`) REFERENCES `appointments`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`customer_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

-- Tabella dei pagamenti
CREATE TABLE `payments` (
    `id` int PRIMARY KEY AUTO_INCREMENT,
    `booking_id` int NOT NULL,
    `amount` decimal(10,2) NOT NULL,
    `currency` varchar(3) DEFAULT 'EUR',
    `payment_method` enum('cash', 'card', 'transfer', 'paypal') DEFAULT 'cash',
    `transaction_id` varchar(255),
    `status` enum('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    `payment_date` datetime,
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE CASCADE
);

-- Indici per le performance
CREATE INDEX `idx_appointments_datetime` ON `appointments`(`start_datetime`, `end_datetime`);
CREATE INDEX `idx_appointments_provider` ON `appointments`(`provider_id`);
CREATE INDEX `idx_appointments_service` ON `appointments`(`service_id`);
CREATE INDEX `idx_bookings_customer` ON `bookings`(`customer_id`);
CREATE INDEX `idx_bookings_appointment` ON `bookings`(`appointment_id`);
CREATE INDEX `idx_provider_schedules_provider` ON `provider_schedules`(`provider_id`);
CREATE INDEX `idx_provider_schedules_day` ON `provider_schedules`(`day_of_week`);