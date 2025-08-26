const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Dati demo (simulando il database)
const demoData = {
    categories: [
        {
            id: 7,
            name: "Consulto online",
            description: "Consulti medici effettuati online",
            color: "#1A84EE",
            image_url: "https://www.centroinfertilita.it/wp-content/uploads/2022/12/telehealth-62.jpg",
            position: 3,
            service_count: 1,
            average_price: 120
        },
        {
            id: 8,
            name: "Tamponi e PAP-TEST",
            description: "Esami diagnostici specialistici",
            color: "#1A84EE",
            image_url: "https://www.centroinfertilita.it/wp-content/uploads/2023/02/family-doctor-042-e1678177017573.jpg",
            position: 2,
            service_count: 4,
            average_price: 47.5
        },
        {
            id: 9,
            name: "Analisi",
            description: "Analisi cliniche e di laboratorio",
            color: "#1A84EE",
            image_url: "https://www.centroinfertilita.it/wp-content/uploads/2022/12/rsz_progesterone.jpg",
            position: 4,
            service_count: 3,
            average_price: 221.67
        },
        {
            id: 12,
            name: "Prestazioni specialistiche BIOFERTILITY",
            description: "Prestazioni specialistiche del centro",
            color: "#1A84EE",
            image_url: "https://www.centroinfertilita.it/wp-content/uploads/2024/11/Equipe-Biofertility.png",
            position: 1,
            service_count: 12,
            average_price: 175
        }
    ],
    
    services: {
        7: [{ // Consulto online
            id: 17,
            name: "Consulto ginecologico - online",
            description: "Visita ginecologica effettuata online. Nota: La scelta della sede è indifferente in questo caso, in quanto la visita verrà svolta online",
            price: 120.00,
            duration: 5400,
            category_id: 7,
            color: "#1788FB"
        }],
        8: [{ // Tamponi e PAP-TEST
            id: 60,
            name: "Tampone germi comuni",
            description: "si esegue in qualsiasi momento del ciclo eccetto in presenza delle mestruazioni",
            price: 50.00,
            duration: 600,
            category_id: 8,
            color: "#1788FB"
        }, {
            id: 61,
            name: "Tampone clamidia",
            description: "si esegue in qualsiasi momento del ciclo eccetto in presenza delle mestruazioni",
            price: 45.00,
            duration: 600,
            category_id: 8,
            color: "#1788FB"
        }, {
            id: 62,
            name: "Tampone micoplasma",
            description: "si esegue in qualsiasi momento del ciclo eccetto in presenza delle mestruazioni",
            price: 35.00,
            duration: 600,
            category_id: 8,
            color: "#1788FB"
        }, {
            id: 63,
            name: "PAP-TEST",
            description: "",
            price: 60.00,
            duration: 1200,
            category_id: 8,
            color: "#1788FB"
        }],
        9: [{ // Analisi
            id: 36,
            name: "Ormonali",
            description: "Tutte le analisi sono svolte dalle ostetriche del nostro centro",
            price: 15.00,
            duration: 600,
            category_id: 9,
            color: "#1788FB"
        }, {
            id: 47,
            name: "Pacchetto analisi pre ICSI",
            description: "Tutte le analisi sono svolte dalle ostetriche del nostro centro",
            price: 650.00,
            duration: 600,
            category_id: 9,
            color: "#1788FB"
        }, {
            id: 59,
            name: "Altre analisi",
            description: "",
            price: 0.00,
            duration: 600,
            category_id: 9,
            color: "#1788FB"
        }],
        12: [{ // Prestazioni specialistiche BIOFERTILITY
            id: 3,
            name: "Visita ginecologica",
            description: "LA PRENOTAZIONE DEVE AVVENIRE CON UN PREAVVISO MINIMO DI 48 ORE. Include ecografia. Bisogna portare tutti gli esami fatti fino a quel momento",
            price: 180.00,
            duration: 7200,
            category_id: 12,
            color: "#1788FB"
        }, {
            id: 83,
            name: "Aspirazione cisti ovariche",
            description: "",
            price: 250.00,
            duration: 1800,
            category_id: 12,
            color: "#1788FB"
        }, {
            id: 84,
            name: "ISTEROSCOPIA",
            description: "Generalmente si esegue tra la fine delle mestruazioni e l'ovulazione, assumere 1h prima dell'esame 1 cp di buscopan e 1 di zitromax",
            price: 250.00,
            duration: 1200,
            category_id: 12,
            color: "#1788FB"
        }, {
            id: 85,
            name: "Biopsia endometriale per plasmacellule",
            description: "Generalmente si esegue tra la fine delle mestruazioni e l'ovulazione, assumere 1h prima dell'esame 1 cp di buscopan e 1 di zitromax",
            price: 220.00,
            duration: 900,
            category_id: 12,
            color: "#1788FB"
        }, {
            id: 86,
            name: "Biopsia datazione endometrio (finestra di impianto)",
            description: "Generalmente si esegue tra la fine delle mestruazioni e l'ovulazione, assumere 1h prima dell'esame 1 cp di buscopan e 1 di zitromax",
            price: 300.00,
            duration: 1800,
            category_id: 12,
            color: "#1788FB"
        }, {
            id: 87,
            name: "SCRATCH ENDOMETRIO",
            description: "Generalmente si esegue tra la fine delle mestruazioni e l'ovulazione, assumere 1h prima dell'esame 1 cp di buscopan e 1 di zitromax",
            price: 100.00,
            duration: 900,
            category_id: 12,
            color: "#1788FB"
        }, {
            id: 88,
            name: "MONITORAGGIO FOLLICOLARE",
            description: "è prenotabile la prima ecografia, intorno circa al settimo giorno del ciclo, le altre ecografie dipendono dal risultato della prima",
            price: 200.00,
            duration: 900,
            category_id: 12,
            color: "#1788FB"
        }, {
            id: 89,
            name: "Monitoraggio ecografico per pazienti esterne",
            description: "",
            price: 350.00,
            duration: 900,
            category_id: 12,
            color: "#1788FB"
        }, {
            id: 90,
            name: "Ecografia ginecologica",
            description: "",
            price: 50.00,
            duration: 1800,
            category_id: 12,
            color: "#1788FB"
        }, {
            id: 91,
            name: "Ecografia ostetrica del primo trimestre",
            description: "",
            price: 100.00,
            duration: 1800,
            category_id: 12,
            color: "#1788FB"
        }, {
            id: 92,
            name: "ISTEROSONOSALPINGOGRAFIA",
            description: "l'esame si esegue generalmente tra la fine delle mestruazioni e l'ovulazione",
            price: 300.00,
            duration: 1800,
            category_id: 12,
            color: "#1788FB"
        }, {
            id: 93,
            name: "SPERMIOGRAMMA",
            description: "LA PRENOTAZIONE DEVE AVVENIRE CON UN PREAVVISO MINIMO DI 48 ORE. Portare precedenti spermiogrammi. Astinenza sessuale di 2-7 giorni",
            price: 80.00,
            duration: 1800,
            category_id: 12,
            color: "#1788FB"
        }]
    },
    
    providers: [
        {
            id: 2,
            first_name: "Dr. Claudio",
            last_name: "Manna",
            email: "centrimanna2@gmail.com",
            description: "Esperto in: Biologia della riproduzione umana, Ecografia, Ginecologia e ostetricia, Endocrinologia, Biologia della riproduzione umana, Andrologia",
            image_url: "https://www.centroinfertilita.it/wp-content/uploads/2023/03/foto-prof-10-scaled.jpeg",
            service_count: 20
        },
        {
            id: 11,
            first_name: "Dr.ssa Francesca",
            last_name: "Sagnella",
            email: "centrimanna2+2@gmail.com",
            description: "Specialista in Ginecologia e Ostetricia",
            image_url: "https://www.centroinfertilita.it/wp-content/uploads/2022/12/sagnella.png",
            service_count: 20
        },
        {
            id: 13,
            first_name: "Dr. Michele",
            last_name: "Guidotti",
            email: "centrimanna2+3@gmail.com",
            description: "Specialista in Medicina della Riproduzione",
            image_url: "https://www.centroinfertilita.it/wp-content/uploads/2024/11/PHOTO-2024-11-20-16-42-45.jpg",
            service_count: 20
        },
        {
            id: 15,
            first_name: "Dr. Giuseppe",
            last_name: "Sorrenti",
            email: "centrimanna2+1@gmail.com",
            description: "Specialista in Andrologia e Medicina della Riproduzione",
            image_url: "https://www.centroinfertilita.it/wp-content/uploads/2025/05/Sorrenti.jpg",
            service_count: 20
        },
        {
            id: 17,
            first_name: "Dott.ssa Claudia",
            last_name: "Taddei",
            email: "centrimanna2+4@gmail.com",
            description: "Specialista in Ginecologia e Medicina della Riproduzione",
            image_url: "https://www.centroinfertilita.it/wp-content/uploads/2025/01/claudia-taddei.png",
            service_count: 20
        },
        {
            id: 18,
            first_name: "Dott.ssa Sara",
            last_name: "Pinto",
            email: "centrimanna2+5@gmail.com",
            description: "Ostetrica specializzata in analisi e diagnostica",
            image_url: "",
            service_count: 20
        }
    ],
    
    locations: [
        {
            id: 1,
            name: "Via Velletri, 7, 00198 Roma RM",
            address: "Via Velletri, 7, 00198 Roma RM",
            phone: "+3968415269",
            status: "active"
        },
        {
            id: 2,
            name: "Viale degli Eroi di Rodi, 214, 00128 Roma RM",
            address: "Viale degli Eroi di Rodi, 214, 00128 Roma RM",
            phone: "+3968415269",
            status: "active"
        }
    ]
};

// Routes API Demo

app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Sistema di prenotazioni online - DEMO',
        timestamp: new Date().toISOString(),
        version: '1.0.0-demo'
    });
});

app.get('/api', (req, res) => {
    res.json({
        success: true,
        message: 'API Sistema di Prenotazioni - DEMO MODE',
        version: '1.0.0-demo',
        note: 'Dati simulati per dimostrazione'
    });
});

app.get('/api/categories/with-counts', (req, res) => {
    res.json({
        success: true,
        data: demoData.categories,
        count: demoData.categories.length
    });
});

app.get('/api/categories/:id/services', (req, res) => {
    const categoryId = parseInt(req.params.id);
    const services = demoData.services[categoryId] || [];
    res.json({
        success: true,
        data: services,
        count: services.length
    });
});

app.get('/api/services/:id', (req, res) => {
    const serviceId = parseInt(req.params.id);
    // Trova il servizio in tutte le categorie
    let foundService = null;
    for (let categoryServices of Object.values(demoData.services)) {
        const service = categoryServices.find(s => s.id === serviceId);
        if (service) {
            foundService = service;
            break;
        }
    }
    
    if (foundService) {
        res.json({
            success: true,
            data: foundService
        });
    } else {
        res.status(404).json({
            success: false,
            message: 'Servizio non trovato'
        });
    }
});

app.get('/api/users/providers', (req, res) => {
    res.json({
        success: true,
        data: demoData.providers,
        count: demoData.providers.length
    });
});

app.get('/api/locations', (req, res) => {
    res.json({
        success: true,
        data: demoData.locations,
        count: demoData.locations.length
    });
});

app.get('/api/bookings/available-slots', (req, res) => {
    // Genera slot demo
    const slots = [];
    for (let hour = 9; hour <= 17; hour++) {
        for (let minute of [0, 30]) {
            const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            slots.push({
                start_datetime: `${req.query.date} ${timeStr}:00`,
                end_datetime: `${req.query.date} ${timeStr}:00`, // Semplificato
                formatted_time: timeStr
            });
        }
    }
    
    res.json({
        success: true,
        data: slots,
        count: slots.length
    });
});

app.post('/api/bookings', (req, res) => {
    // Simula creazione prenotazione con dati completi
    const serviceId = req.body.service_id;
    const providerId = req.body.provider_id;
    const locationId = req.body.location_id;
    
    // Trova servizio
    let service = null;
    for (let categoryServices of Object.values(demoData.services)) {
        const found = categoryServices.find(s => s.id === serviceId);
        if (found) {
            service = found;
            break;
        }
    }
    
    // Trova provider
    const provider = demoData.providers.find(p => p.id === providerId);
    const location = demoData.locations.find(l => l.id === locationId);
    
    const booking = {
        id: Math.floor(Math.random() * 1000),
        booking_token: Math.random().toString(36).substring(2, 12).toUpperCase(),
        status: service?.requires_confirmation ? 'pending' : 'confirmed',
        service_name: service?.name || 'Servizio',
        service_duration: service?.duration || 3600,
        price: service?.price || 0,
        provider_first_name: provider?.first_name || 'Dr.',
        provider_last_name: provider?.last_name || 'Medico',
        location_name: location?.name || 'Sede',
        location_address: location?.address || 'Roma',
        start_datetime: req.body.start_datetime,
        end_datetime: req.body.start_datetime, // Semplificato per demo
        customer_first_name: req.body.customer_data.first_name,
        customer_last_name: req.body.customer_data.last_name,
        customer_email: req.body.customer_data.email,
        customer_phone: req.body.customer_data.phone,
        notes: req.body.notes,
        payment_url: process.env.PAYMENT_URL || 'https://www.centroinfertilita.it/pagamento-personalizzato/',
        privacy_notice: 'I suoi dati sono trattati secondo il GDPR per la gestione della prenotazione sanitaria.'
    };
    
    // Simula invio email (in modalità demo)
    console.log('📧 [DEMO] Email di conferma inviata a:', booking.customer_email);
    console.log('📧 [DEMO] Notifica admin inviata a: centrimanna2@gmail.com');
    console.log('📅 [DEMO] Evento aggiunto a Google Calendar');
    
    res.status(201).json({
        success: true,
        message: service?.requires_confirmation ? 
            'Prenotazione creata, in attesa di conferma del centro medico' : 
            'Prenotazione confermata con successo! Controlla la tua email per i dettagli e il link di pagamento',
        data: booking,
        next_steps: [
            'Email di conferma inviata al paziente',
            'Notifica inviata al centro medico',
            'Link pagamento disponibile via email',
            'Appuntamento aggiunto al calendario'
        ]
    });
});

// Serve la homepage
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log('\n🚀 ===== SISTEMA DI PRENOTAZIONI - DEMO =====');
    console.log(`📍 Server demo in esecuzione su porta ${PORT}`);
    console.log(`🌍 URL: http://localhost:${PORT}`);
    console.log(`📚 API Base: http://localhost:${PORT}/api`);
    console.log('⚠️  MODALITÀ DEMO - Dati simulati');
    console.log('=====================================\n');
    console.log('🔧 Endpoints demo disponibili:');
    console.log('   • GET    /api/categories/with-counts');
    console.log('   • GET    /api/users/providers');
    console.log('   • GET    /api/locations');
    console.log('   • POST   /api/bookings');
    console.log('   • GET    /api/bookings/available-slots');
    console.log('\n🌐 Apri http://localhost:3000 nel browser per vedere l\'interfaccia!\n');
});