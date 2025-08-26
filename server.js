const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import database connection
const { testConnection } = require('./config/database');

// Import calendar sync service
const CalendarSyncService = require('./services/calendarSyncService');

// Import routes
const servicesRoutes = require('./routes/services');
const bookingsRoutes = require('./routes/bookings');
const usersRoutes = require('./routes/users');
const appointmentsRoutes = require('./routes/appointments');
const locationsRoutes = require('./routes/locations');
const categoriesRoutes = require('./routes/categories');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize calendar sync service
let calendarSync = null;

// Security middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minuti
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Troppi richieste da questo IP, riprova più tardi.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api/', limiter);

// CORS configuration
const corsOptions = {
    origin: function (origin, callback) {
        // Consenti richieste senza origin (come app mobile o Postman)
        if (!origin) return callback(null, true);
        
        // Lista degli origin consentiti
        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:3001',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:3001',
            // Domini di produzione (Railway)
            process.env.FRONTEND_URL,
            process.env.RAILWAY_STATIC_URL,
            // Pattern per Railway domains
            ...((process.env.CORS_ORIGINS || '').split(',').filter(Boolean))
        ].filter(Boolean);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Non consentito dalla policy CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));

// Body parser middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use(express.static('public'));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Sistema di prenotazioni online',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// API routes
app.use('/api/services', servicesRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/locations', locationsRoutes);
app.use('/api/categories', categoriesRoutes);

// Calendar sync webhook endpoint
app.post('/api/calendar/webhook', async (req, res) => {
    if (calendarSync) {
        await calendarSync.handleWebhook(req, res);
    } else {
        console.warn('⚠️ Calendar sync service non inizializzato');
        res.status(503).send('Service Unavailable');
    }
});

// Calendar sync API endpoints
app.get('/api/calendar/status', (req, res) => {
    if (calendarSync) {
        res.json({
            success: true,
            ...calendarSync.getStats()
        });
    } else {
        res.status(503).json({
            success: false,
            message: 'Calendar sync service non disponibile'
        });
    }
});

app.post('/api/calendar/sync', async (req, res) => {
    try {
        if (!calendarSync) {
            return res.status(503).json({
                success: false,
                message: 'Calendar sync service non disponibile'
            });
        }

        const { date } = req.body;
        await calendarSync.forcSync(date);
        
        res.json({
            success: true,
            message: date ? `Sincronizzazione forzata per ${date}` : 'Sincronizzazione completa avviata'
        });
    } catch (error) {
        console.error('Errore sincronizzazione forzata:', error.message);
        res.status(500).json({
            success: false,
            message: 'Errore durante la sincronizzazione'
        });
    }
});

app.get('/api/calendar/test', async (req, res) => {
    try {
        if (!calendarSync) {
            return res.status(503).json({
                success: false,
                message: 'Calendar sync service non disponibile'
            });
        }

        const result = await calendarSync.testConnection();
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Errore test connessione'
        });
    }
});

// API info endpoint
app.get('/api', (req, res) => {
    res.json({
        success: true,
        message: 'API Sistema di Prenotazioni',
        version: '1.0.0',
        endpoints: {
            services: '/api/services',
            bookings: '/api/bookings',
            users: '/api/users',
            appointments: '/api/appointments',
            locations: '/api/locations',
            categories: '/api/categories',
            calendar: {
                webhook: '/api/calendar/webhook',
                status: '/api/calendar/status',
                sync: '/api/calendar/sync',
                test: '/api/calendar/test'
            }
        },
        documentation: '/api/docs'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Errore:', err);
    
    if (err.message === 'Non consentito dalla policy CORS') {
        return res.status(403).json({
            success: false,
            message: 'Accesso negato dalla policy CORS'
        });
    }
    
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Errore interno del server',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.originalUrl} non trovata`
    });
});

// Server startup
async function startServer() {
    try {
        // Test database connection
        const dbConnected = await testConnection();
        if (!dbConnected) {
            console.error('❌ Impossibile connettersi al database. Server non avviato.');
            process.exit(1);
        }

        // Initialize and start calendar sync service
        if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CALENDAR_ID) {
            try {
                calendarSync = new CalendarSyncService();
                await calendarSync.startSync();
                console.log('✅ Calendar sync service inizializzato e attivo');
            } catch (error) {
                console.warn('⚠️ Calendar sync non disponibile:', error.message);
                calendarSync = null;
            }
        } else {
            console.warn('⚠️ Calendar sync disabilitato - variabili GOOGLE_CLIENT_ID o GOOGLE_CALENDAR_ID mancanti');
        }

        // Start server
        app.listen(PORT, () => {
            console.log('\n🚀 ===== SISTEMA DI PRENOTAZIONI =====');
            console.log(`📍 Server in esecuzione su porta ${PORT}`);
            console.log(`🌍 URL: http://localhost:${PORT}`);
            console.log(`📚 API Base: http://localhost:${PORT}/api`);
            console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
            console.log(`🔧 Ambiente: ${process.env.NODE_ENV || 'development'}`);
            console.log('=====================================\n');
            
            if (process.env.NODE_ENV === 'development') {
                console.log('🔧 MODALITÀ SVILUPPO - Endpoints disponibili:');
                console.log('   • GET    /api/services - Lista servizi');
                console.log('   • GET    /api/users/providers - Lista provider');
                console.log('   • GET    /api/locations - Lista location');
                console.log('   • POST   /api/bookings - Nuova prenotazione');
                console.log('   • GET    /api/bookings/available-slots - Slot disponibili');
                console.log('   • GET    /api/bookings/token/:token - Prenotazione per token');
                console.log('   • POST   /api/calendar/webhook - Webhook Google Calendar');
                console.log('   • GET    /api/calendar/status - Stato sincronizzazione');
                console.log('   • POST   /api/calendar/sync - Sincronizzazione manuale');
                console.log('   • GET    /api/calendar/test - Test connessione Calendar\n');
            }
        });

    } catch (error) {
        console.error('❌ Errore nell\'avvio del server:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('\n🔄 Ricevuto SIGTERM, arresto del server...');
    if (calendarSync) {
        await calendarSync.cleanup();
    }
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('\n🔄 Ricevuto SIGINT, arresto del server...');
    if (calendarSync) {
        await calendarSync.cleanup();
    }
    process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Start the server
startServer();

module.exports = app;