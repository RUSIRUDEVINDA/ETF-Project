/**
 * ============================================================
 * FILE: routes/vehicleRoutes.js
 * PURPOSE: Express Router — maps HTTP endpoints to controllers
 * ============================================================
 *
 * BASE PATH: /api/vehicles  (mounted in server.js)
 *
 * ┌─────────────────────────────────────────────────────────┐
 * │  METHOD  │  ENDPOINT                    │  ACTION        │
 * ├──────────┼──────────────────────────────┼────────────────┤
 * │  POST    │  /                           │  Register      │
 * │  GET     │  /                           │  Get All       │
 * │  GET     │  /stats                      │  Dashboard Stats│
 * │  POST    │  /seed                       │  Seed Data     │
 * │  GET     │  /regno/:regNo               │  By RegNo      │
 * │  GET     │  /firstname/:firstName       │  By First Name │
 * │  GET     │  /lastname/:lastName         │  By Last Name  │
 * │  GET     │  /email/:email               │  By Email      │
 * │  GET     │  /station/:station           │  By Station    │
 * │  GET     │  /fueltype/:fuelType         │  By Fuel Type  │
 * │  GET     │  /nic/:nic                   │  By NIC        │
 * │  PUT     │  /regno/:regNo               │  Update by RegNo│
 * │  PUT     │  /firstname/:firstName       │  Update by Name│
 * │  DELETE  │  /regno/:regNo               │  Delete by RegNo│
 * └─────────────────────────────────────────────────────────┘
 */

const express = require('express');
const router  = express.Router();

// Import all controller functions
const {
    registerVehicle,
    getAllVehicles,
    getVehicleByRegNo,
    getVehicleByFirstName,
    getVehicleByLastName,
    getVehicleByEmail,
    getVehicleByStation,
    getVehicleByFuelType,
    getVehicleByNIC,
    updateByRegNo,
    updateByFirstName,
    deleteByRegNo,
    getVehicleStats
} = require('../controllers/vehicleController');

// ─────────────────────────────────────────────────────────────
// UTILITY / SPECIAL ROUTES  (must come before param routes)
// ─────────────────────────────────────────────────────────────

// GET  /api/vehicles/stats   → Dashboard statistics
router.get('/stats', getVehicleStats);

// ─────────────────────────────────────────────────────────────
// MAIN CRUD ROUTES
// ─────────────────────────────────────────────────────────────

// POST /api/vehicles          → Register a new vehicle
router.post('/', registerVehicle);

// GET  /api/vehicles          → Get all vehicles
router.get('/', getAllVehicles);

// ─────────────────────────────────────────────────────────────
// SEARCH / GET BY FIELD ROUTES
// ─────────────────────────────────────────────────────────────

// GET /api/vehicles/regno/:regNo         → Find by Registration Number
router.get('/regno/:regNo', getVehicleByRegNo);

// GET /api/vehicles/firstname/:firstName → Find by Owner First Name
router.get('/firstname/:firstName', getVehicleByFirstName);

// GET /api/vehicles/lastname/:lastName   → Find by Owner Last Name
router.get('/lastname/:lastName', getVehicleByLastName);

// GET /api/vehicles/email/:email         → Find by Owner Email
router.get('/email/:email', getVehicleByEmail);

// GET /api/vehicles/station/:station     → Find by Nearest Fuel Station
router.get('/station/:station', getVehicleByStation);

// GET /api/vehicles/fueltype/:fuelType   → Find by Fuel Type
router.get('/fueltype/:fuelType', getVehicleByFuelType);

// GET /api/vehicles/nic/:nic             → Find by Owner NIC
router.get('/nic/:nic', getVehicleByNIC);

// ─────────────────────────────────────────────────────────────
// UPDATE ROUTES
// ─────────────────────────────────────────────────────────────

// PUT /api/vehicles/regno/:regNo         → Update by Registration Number
router.put('/regno/:regNo', updateByRegNo);

// PUT /api/vehicles/firstname/:firstName → Update by Owner First Name
router.put('/firstname/:firstName', updateByFirstName);

// ─────────────────────────────────────────────────────────────
// DELETE ROUTES
// ─────────────────────────────────────────────────────────────

// DELETE /api/vehicles/regno/:regNo      → Delete by Registration Number
router.delete('/regno/:regNo', deleteByRegNo);

module.exports = router;
