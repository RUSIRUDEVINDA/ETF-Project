/**
 * ============================================================
 * FILE: server.js
 * PURPOSE: Main Express application entry point
 * ============================================================
 *
 * Responsibilities:
 *  - Load environment variables from .env
 *  - Connect to MongoDB
 *  - Configure Express middleware (CORS, JSON parsing)
 *  - Mount API routes
 *  - Start the HTTP server
 *  - Handle unmatched routes (404)
 *  - Handle global errors (500)
 */

// ── Load environment variables FIRST (before anything else) ──
require('dotenv').config();

const express       = require('express');
const cors          = require('cors');
const connectDB     = require('./config/db');
const vehicleRoutes = require('./routes/vehicleRoutes');

// ─────────────────────────────────────────────────────────────
// CONNECT TO MONGODB
// ─────────────────────────────────────────────────────────────
connectDB();

// ─────────────────────────────────────────────────────────────
// INITIALIZE EXPRESS APP
// ─────────────────────────────────────────────────────────────
const app = express();

// ─────────────────────────────────────────────────────────────
// MIDDLEWARE
// ─────────────────────────────────────────────────────────────

/**
 * CORS — Allow requests from the frontend (open for dev).
 * In production, replace the origin with your actual frontend URL.
 */
app.use(cors({
    origin: '*',       // Allow all origins (change to specific URL in production)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

/**
 * JSON Body Parser — Parse incoming request bodies as JSON.
 * Required for reading req.body in POST and PUT requests.
 */
app.use(express.json({ limit: '10mb' }));  // 10mb limit to handle Base64 QR images

/**
 * URL-Encoded Body Parser — Parse URL-encoded form data.
 */
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─────────────────────────────────────────────────────────────
// REQUEST LOGGER (Development Middleware)
// ─────────────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
        next();
    });
}

// ─────────────────────────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────────────────────────

/**
 * Health Check Route
 * GET /api/health  → Quickly verify server is running
 */
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: '✅ Fuel QR System API is running!',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

/**
 * Root Route
 * GET /  → Welcome message with available endpoints
 */
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: '⛽ Welcome to the Fuel QR Registration System API',
        version: '1.0.0',
        endpoints: {
            health:       'GET  /api/health',
            vehicles:     'GET  /api/vehicles',
            stats:        'GET  /api/vehicles/stats',
            register:     'POST /api/vehicles',
            findByRegNo:  'GET  /api/vehicles/regno/:regNo',
            findByName:   'GET  /api/vehicles/firstname/:firstName',
            findByEmail:  'GET  /api/vehicles/email/:email',
            findByNIC:    'GET  /api/vehicles/nic/:nic',
            findByFuel:   'GET  /api/vehicles/fueltype/:fuelType',
            findByStation:'GET  /api/vehicles/station/:station',
            updateRegNo:  'PUT  /api/vehicles/regno/:regNo',
            deleteRegNo:  'DELETE /api/vehicles/regno/:regNo'
        }
    });
});

/**
 * Vehicle API Routes
 * All vehicle CRUD operations are handled under /api/vehicles
 */
app.use('/api/vehicles', vehicleRoutes);

// ─────────────────────────────────────────────────────────────
// 404 HANDLER — Unmatched Routes
// ─────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `❌ Route not found: ${req.method} ${req.originalUrl}`,
        hint: 'Check the API documentation at GET /'
    });
});

// ─────────────────────────────────────────────────────────────
// GLOBAL ERROR HANDLER
// ─────────────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    console.error('💥 Unhandled Error:', err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// ─────────────────────────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log('');
    console.log('╔═══════════════════════════════════════════╗');
    console.log('║    ⛽ FUEL QR REGISTRATION SYSTEM API     ║');
    console.log('╠═══════════════════════════════════════════╣');
    console.log(`║  🚀 Server   : http://localhost:${PORT}       ║`);
    console.log(`║  🌍 Env      : ${(process.env.NODE_ENV || 'development').padEnd(27)}║`);
    console.log('║  📋 Routes   : /api/vehicles              ║');
    console.log('║  ❤️  Health   : /api/health                ║');
    console.log('╚═══════════════════════════════════════════╝');
    console.log('');
});

module.exports = app;
