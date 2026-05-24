/**
 * ============================================================
 * FILE: controllers/vehicleController.js
 * PURPOSE: Business logic for all Vehicle REST API operations
 * ============================================================
 *
 * CONTROLLER FUNCTIONS:
 *  1.  registerVehicle       — POST   /api/vehicles
 *  2.  getAllVehicles         — GET    /api/vehicles
 *  3.  getVehicleByRegNo     — GET    /api/vehicles/regno/:regNo
 *  4.  getVehicleByFirstName — GET    /api/vehicles/firstname/:firstName
 *  5.  getVehicleByLastName  — GET    /api/vehicles/lastname/:lastName
 *  6.  getVehicleByEmail     — GET    /api/vehicles/email/:email
 *  7.  getVehicleByStation   — GET    /api/vehicles/station/:station
 *  8.  getVehicleByFuelType  — GET    /api/vehicles/fueltype/:fuelType
 *  9.  getVehicleByNIC       — GET    /api/vehicles/nic/:nic
 *  10. updateByRegNo         — PUT    /api/vehicles/regno/:regNo
 *  11. updateByFirstName     — PUT    /api/vehicles/firstname/:firstName
 *  12. deleteByRegNo         — DELETE /api/vehicles/regno/:regNo
 *  13. seedSampleData        — POST   /api/vehicles/seed  (dev helper)
 *  14. getVehicleStats       — GET    /api/vehicles/stats
 */

const Vehicle = require('../models/Vehicle');
const QRCode  = require('qrcode');

// ─────────────────────────────────────────────────────────────
// HELPER: Generate QR Code as a Base64 Data URL
// ─────────────────────────────────────────────────────────────
/**
 * generateQRCode - Generates a QR code image (Base64 data URL) from
 * a given text string. Used to embed scannable QR images in responses.
 *
 * @param {string} text - Text to encode in the QR code
 * @returns {string} Base64 encoded PNG data URL
 */
const generateQRCode = async (text) => {
    try {
        const qrDataUrl = await QRCode.toDataURL(text, {
            errorCorrectionLevel: 'M',
            type: 'image/png',
            width: 300,
            margin: 2,
            color: {
                dark: '#1a1a2e',   // Dark navy QR dots
                light: '#ffffff'   // White background
            }
        });
        return qrDataUrl;
    } catch (err) {
        console.error('QR Code generation error:', err.message);
        return '';
    }
};

// ─────────────────────────────────────────────────────────────
// HELPER: Standard API Response Formatter
// ─────────────────────────────────────────────────────────────
const sendResponse = (res, statusCode, success, message, data = null) => {
    const response = { success, message };
    if (data !== null) response.data = data;
    return res.status(statusCode).json(response);
};

// ─────────────────────────────────────────────────────────────
// 1. REGISTER VEHICLE  —  POST /api/vehicles
// ─────────────────────────────────────────────────────────────
/**
 * registerVehicle
 * Creates a new vehicle record in the database.
 * Generates a QR code image from RegNo and stores it.
 * Returns 201 on success, 400 on validation failure, 409 on duplicate.
 */
const registerVehicle = async (req, res) => {
    try {
        const {
            RegNo, FirstName, LastName, Email,
            NearestStation, FuelType, OwnerNIC,
            VehicleModel, WeeklyQuota
        } = req.body;

        // Check if vehicle already exists with same RegNo, Email, or NIC
        const existingVehicle = await Vehicle.findOne({
            $or: [{ RegNo }, { Email }, { OwnerNIC }]
        });

        if (existingVehicle) {
            let duplicateField = 'RegNo';
            if (existingVehicle.Email === Email?.toLowerCase()) duplicateField = 'Email';
            if (existingVehicle.OwnerNIC === OwnerNIC) duplicateField = 'OwnerNIC';
            return sendResponse(res, 409, false,
                `A vehicle with this ${duplicateField} already exists.`
            );
        }

        // Generate QR code image as Base64 data URL from RegNo
        const qrText = `FUEL-QR|RegNo:${RegNo}|NIC:${OwnerNIC}|Fuel:${FuelType}`;
        const qrCodeDataUrl = await generateQRCode(qrText);

        // Create the new vehicle document
        const newVehicle = new Vehicle({
            RegNo,
            FirstName,
            LastName,
            Email,
            NearestStation,
            FuelType,
            OwnerNIC,
            VehicleModel,
            WeeklyQuota: WeeklyQuota || 20,
            QRCode: qrCodeDataUrl  // Store Base64 QR image
        });

        const savedVehicle = await newVehicle.save();

        return sendResponse(res, 201, true,
            `Vehicle "${RegNo}" registered successfully!`,
            savedVehicle
        );

    } catch (error) {
        // Handle Mongoose validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return sendResponse(res, 400, false, messages.join('. '));
        }
        // Handle duplicate key errors from MongoDB
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            return sendResponse(res, 409, false,
                `Duplicate value for field: ${field}`
            );
        }
        console.error('registerVehicle error:', error);
        return sendResponse(res, 500, false, 'Server error: ' + error.message);
    }
};

// ─────────────────────────────────────────────────────────────
// 2. GET ALL VEHICLES  —  GET /api/vehicles
// ─────────────────────────────────────────────────────────────
/**
 * getAllVehicles
 * Returns all registered vehicles, sorted by most recently added.
 * Supports optional query params: ?fuelType=Petrol&isActive=true
 */
const getAllVehicles = async (req, res) => {
    try {
        const filter = {};

        // Optional query filters
        if (req.query.fuelType)  filter.FuelType  = req.query.fuelType;
        if (req.query.isActive !== undefined)
            filter.IsActive = req.query.isActive === 'true';

        const vehicles = await Vehicle.find(filter).sort({ createdAt: -1 });

        return sendResponse(res, 200, true,
            `${vehicles.length} vehicle(s) found.`,
            vehicles
        );
    } catch (error) {
        console.error('getAllVehicles error:', error);
        return sendResponse(res, 500, false, 'Server error: ' + error.message);
    }
};

// ─────────────────────────────────────────────────────────────
// 3. FIND BY REGISTRATION NUMBER  —  GET /api/vehicles/regno/:regNo
// ─────────────────────────────────────────────────────────────
/**
 * getVehicleByRegNo
 * Returns a single vehicle document matching the given RegNo.
 */
const getVehicleByRegNo = async (req, res) => {
    try {
        const regNo = req.params.regNo.toUpperCase();
        const vehicle = await Vehicle.findOne({ RegNo: regNo });

        if (!vehicle) {
            return sendResponse(res, 404, false,
                `No vehicle found with registration number: ${regNo}`
            );
        }

        return sendResponse(res, 200, true,
            `Vehicle found: ${regNo}`, vehicle
        );
    } catch (error) {
        console.error('getVehicleByRegNo error:', error);
        return sendResponse(res, 500, false, 'Server error: ' + error.message);
    }
};

// ─────────────────────────────────────────────────────────────
// 4. FIND BY OWNER FIRST NAME  —  GET /api/vehicles/firstname/:firstName
// ─────────────────────────────────────────────────────────────
/**
 * getVehicleByFirstName
 * Returns all vehicles whose owner's FirstName matches (case-insensitive).
 */
const getVehicleByFirstName = async (req, res) => {
    try {
        const firstName = req.params.firstName;
        // Use regex for case-insensitive partial matching
        const vehicles = await Vehicle.find({
            FirstName: { $regex: new RegExp(firstName, 'i') }
        });

        if (vehicles.length === 0) {
            return sendResponse(res, 404, false,
                `No vehicles found for owner named: ${firstName}`
            );
        }

        return sendResponse(res, 200, true,
            `${vehicles.length} vehicle(s) found for first name: ${firstName}`,
            vehicles
        );
    } catch (error) {
        console.error('getVehicleByFirstName error:', error);
        return sendResponse(res, 500, false, 'Server error: ' + error.message);
    }
};

// ─────────────────────────────────────────────────────────────
// 5. FIND BY OWNER LAST NAME  —  GET /api/vehicles/lastname/:lastName
// ─────────────────────────────────────────────────────────────
/**
 * getVehicleByLastName
 * Returns all vehicles matching owner's LastName (case-insensitive).
 */
const getVehicleByLastName = async (req, res) => {
    try {
        const lastName = req.params.lastName;
        const vehicles = await Vehicle.find({
            LastName: { $regex: new RegExp(lastName, 'i') }
        });

        if (vehicles.length === 0) {
            return sendResponse(res, 404, false,
                `No vehicles found for last name: ${lastName}`
            );
        }

        return sendResponse(res, 200, true,
            `${vehicles.length} vehicle(s) found for last name: ${lastName}`,
            vehicles
        );
    } catch (error) {
        console.error('getVehicleByLastName error:', error);
        return sendResponse(res, 500, false, 'Server error: ' + error.message);
    }
};

// ─────────────────────────────────────────────────────────────
// 6. FIND BY OWNER EMAIL  —  GET /api/vehicles/email/:email
// ─────────────────────────────────────────────────────────────
/**
 * getVehicleByEmail
 * Returns a vehicle matching the provided email address.
 */
const getVehicleByEmail = async (req, res) => {
    try {
        const email = req.params.email.toLowerCase();
        const vehicle = await Vehicle.findOne({ Email: email });

        if (!vehicle) {
            return sendResponse(res, 404, false,
                `No vehicle found for email: ${email}`
            );
        }

        return sendResponse(res, 200, true,
            `Vehicle found for email: ${email}`, vehicle
        );
    } catch (error) {
        console.error('getVehicleByEmail error:', error);
        return sendResponse(res, 500, false, 'Server error: ' + error.message);
    }
};

// ─────────────────────────────────────────────────────────────
// 7. FIND BY NEAREST STATION  —  GET /api/vehicles/station/:station
// ─────────────────────────────────────────────────────────────
/**
 * getVehicleByStation
 * Returns all vehicles registered under a given fuel station.
 * Partial/case-insensitive match supported.
 */
const getVehicleByStation = async (req, res) => {
    try {
        const station = req.params.station;
        const vehicles = await Vehicle.find({
            NearestStation: { $regex: new RegExp(station, 'i') }
        });

        if (vehicles.length === 0) {
            return sendResponse(res, 404, false,
                `No vehicles found for station: ${station}`
            );
        }

        return sendResponse(res, 200, true,
            `${vehicles.length} vehicle(s) at station: ${station}`,
            vehicles
        );
    } catch (error) {
        console.error('getVehicleByStation error:', error);
        return sendResponse(res, 500, false, 'Server error: ' + error.message);
    }
};

// ─────────────────────────────────────────────────────────────
// 8. FIND BY FUEL TYPE  —  GET /api/vehicles/fueltype/:fuelType
// ─────────────────────────────────────────────────────────────
/**
 * getVehicleByFuelType
 * Returns all vehicles using a specific fuel type (Petrol/Diesel/Kerosene).
 */
const getVehicleByFuelType = async (req, res) => {
    try {
        const fuelType = req.params.fuelType;
        // Case-insensitive exact-ish match for fuel type
        const vehicles = await Vehicle.find({
            FuelType: { $regex: new RegExp(`^${fuelType}$`, 'i') }
        });

        if (vehicles.length === 0) {
            return sendResponse(res, 404, false,
                `No vehicles found using fuel type: ${fuelType}`
            );
        }

        return sendResponse(res, 200, true,
            `${vehicles.length} ${fuelType} vehicle(s) found.`,
            vehicles
        );
    } catch (error) {
        console.error('getVehicleByFuelType error:', error);
        return sendResponse(res, 500, false, 'Server error: ' + error.message);
    }
};

// ─────────────────────────────────────────────────────────────
// 9. FIND BY OWNER NIC  —  GET /api/vehicles/nic/:nic
// ─────────────────────────────────────────────────────────────
/**
 * getVehicleByNIC
 * Returns the vehicle registered to the owner with the given NIC number.
 */
const getVehicleByNIC = async (req, res) => {
    try {
        const nic = req.params.nic.toUpperCase();
        // NIC can end with 'V' or 'X', handle both cases
        const vehicle = await Vehicle.findOne({
            OwnerNIC: { $regex: new RegExp(`^${nic}$`, 'i') }
        });

        if (!vehicle) {
            return sendResponse(res, 404, false,
                `No vehicle found for NIC: ${nic}`
            );
        }

        return sendResponse(res, 200, true,
            `Vehicle found for NIC: ${nic}`, vehicle
        );
    } catch (error) {
        console.error('getVehicleByNIC error:', error);
        return sendResponse(res, 500, false, 'Server error: ' + error.message);
    }
};

// ─────────────────────────────────────────────────────────────
// 10. UPDATE BY REGISTRATION NUMBER  —  PUT /api/vehicles/regno/:regNo
// ─────────────────────────────────────────────────────────────
/**
 * updateByRegNo
 * Updates a vehicle's data by its RegNo.
 * RegNo itself cannot be changed (it's the primary identifier).
 * If FuelType changes, a new QR code is generated.
 */
const updateByRegNo = async (req, res) => {
    try {
        const regNo = req.params.regNo.toUpperCase();

        // Prevent changing RegNo via update
        delete req.body.RegNo;

        // Find the vehicle first to verify it exists
        const existingVehicle = await Vehicle.findOne({ RegNo: regNo });
        if (!existingVehicle) {
            return sendResponse(res, 404, false,
                `No vehicle found with RegNo: ${regNo}`
            );
        }

        // If FuelType or NIC changed, regenerate QR code
        const updateData = { ...req.body };
        if (req.body.FuelType || req.body.OwnerNIC) {
            const newFuelType = req.body.FuelType || existingVehicle.FuelType;
            const newNIC     = req.body.OwnerNIC  || existingVehicle.OwnerNIC;
            const qrText = `FUEL-QR|RegNo:${regNo}|NIC:${newNIC}|Fuel:${newFuelType}`;
            updateData.QRCode = await generateQRCode(qrText);
        }

        const updatedVehicle = await Vehicle.findOneAndUpdate(
            { RegNo: regNo },
            { $set: updateData },
            { new: true, runValidators: true }
        );

        return sendResponse(res, 200, true,
            `Vehicle "${regNo}" updated successfully!`,
            updatedVehicle
        );
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return sendResponse(res, 400, false, messages.join('. '));
        }
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            return sendResponse(res, 409, false,
                `Duplicate value: ${field} already exists.`
            );
        }
        console.error('updateByRegNo error:', error);
        return sendResponse(res, 500, false, 'Server error: ' + error.message);
    }
};

// ─────────────────────────────────────────────────────────────
// 11. UPDATE BY FIRST NAME  —  PUT /api/vehicles/firstname/:firstName
// ─────────────────────────────────────────────────────────────
/**
 * updateByFirstName
 * Updates all vehicles matching the given FirstName.
 * Useful for bulk renaming an owner's records.
 */
const updateByFirstName = async (req, res) => {
    try {
        const firstName = req.params.firstName;

        // Prevent changing RegNo via update
        delete req.body.RegNo;

        const result = await Vehicle.updateMany(
            { FirstName: { $regex: new RegExp(`^${firstName}$`, 'i') } },
            { $set: req.body },
            { runValidators: true }
        );

        if (result.matchedCount === 0) {
            return sendResponse(res, 404, false,
                `No vehicles found for first name: ${firstName}`
            );
        }

        return sendResponse(res, 200, true,
            `${result.modifiedCount} vehicle(s) updated for first name: ${firstName}.`
        );
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return sendResponse(res, 400, false, messages.join('. '));
        }
        console.error('updateByFirstName error:', error);
        return sendResponse(res, 500, false, 'Server error: ' + error.message);
    }
};

// ─────────────────────────────────────────────────────────────
// 12. DELETE BY REGISTRATION NUMBER  —  DELETE /api/vehicles/regno/:regNo
// ─────────────────────────────────────────────────────────────
/**
 * deleteByRegNo
 * Permanently deletes a vehicle record from the database.
 * Returns 404 if the vehicle is not found.
 */
const deleteByRegNo = async (req, res) => {
    try {
        const regNo = req.params.regNo.toUpperCase();

        const deletedVehicle = await Vehicle.findOneAndDelete({ RegNo: regNo });

        if (!deletedVehicle) {
            return sendResponse(res, 404, false,
                `No vehicle found with RegNo: ${regNo}`
            );
        }

        return sendResponse(res, 200, true,
            `Vehicle "${regNo}" has been permanently deleted.`,
            { deletedVehicle }
        );
    } catch (error) {
        console.error('deleteByRegNo error:', error);
        return sendResponse(res, 500, false, 'Server error: ' + error.message);
    }
};

// ─────────────────────────────────────────────────────────────
// 14. GET VEHICLE STATS  —  GET /api/vehicles/stats
// ─────────────────────────────────────────────────────────────
/**
 * getVehicleStats
 * Returns summary statistics about the vehicle fleet.
 * Used by the Home Page dashboard cards.
 */
const getVehicleStats = async (req, res) => {
    try {
        const totalVehicles  = await Vehicle.countDocuments();
        const petrolCount    = await Vehicle.countDocuments({ FuelType: 'Petrol'   });
        const dieselCount    = await Vehicle.countDocuments({ FuelType: 'Diesel'   });
        const keroseneCount  = await Vehicle.countDocuments({ FuelType: 'Kerosene' });
        const activeCount    = await Vehicle.countDocuments({ IsActive: true       });

        // Aggregate total weekly quota across all vehicles
        const quotaResult = await Vehicle.aggregate([
            { $group: { _id: null, totalQuota: { $sum: '$WeeklyQuota' } } }
        ]);
        const totalWeeklyQuota = quotaResult.length > 0
            ? quotaResult[0].totalQuota
            : 0;

        const stats = {
            totalVehicles,
            activeVehicles : activeCount,
            petrolVehicles : petrolCount,
            dieselVehicles : dieselCount,
            keroseneVehicles: keroseneCount,
            totalWeeklyQuota
        };

        return sendResponse(res, 200, true, 'Vehicle statistics retrieved.', stats);
    } catch (error) {
        console.error('getVehicleStats error:', error);
        return sendResponse(res, 500, false, 'Server error: ' + error.message);
    }
};

// ─────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────
module.exports = {
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
};
