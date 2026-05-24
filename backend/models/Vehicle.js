/**
 * ============================================================
 * FILE: models/Vehicle.js
 * PURPOSE: Mongoose schema & model for Vehicle collection
 * ============================================================
 */

const mongoose = require('mongoose');

/**
 * vehicleSchema - Defines the shape of a Vehicle document in MongoDB.
 *
 * Fields:
 *  - RegNo         : Vehicle Registration Number (unique identifier)
 *  - FirstName     : Owner's first name
 *  - LastName      : Owner's last name
 *  - Email         : Owner's email address (unique)
 *  - NearestStation: Nearest fuel station to the owner
 *  - FuelType      : Type of fuel (Petrol / Diesel / Kerosene)
 *  - OwnerNIC      : National Identity Card number (unique)
 *  - VehicleModel  : Model/make of the vehicle
 *  - QRCode        : Auto-generated QR code string for this vehicle
 *  - WeeklyQuota   : Fuel quota allowed per week (in litres)
 *  - IsActive      : Whether the vehicle registration is active
 *  - timestamps    : Auto-managed createdAt & updatedAt fields
 */
const vehicleSchema = new mongoose.Schema(
    {
        // Registration number — must be unique across all vehicles
        RegNo: {
            type: String,
            required: [true, 'Registration number is required'],
            unique: true,
            trim: true,
            uppercase: true,
            match: [
                /^[A-Z]{2,3}-\d{4}$/,
                'RegNo must follow the format: ABC-1234'
            ]
        },

        // Owner first name
        FirstName: {
            type: String,
            required: [true, 'First name is required'],
            trim: true,
            minlength: [2, 'First name must be at least 2 characters'],
            maxlength: [50, 'First name cannot exceed 50 characters']
        },

        // Owner last name
        LastName: {
            type: String,
            required: [true, 'Last name is required'],
            trim: true,
            minlength: [2, 'Last name must be at least 2 characters'],
            maxlength: [50, 'Last name cannot exceed 50 characters']
        },

        // Owner email — must be unique
        Email: {
            type: String,
            required: [true, 'Email address is required'],
            unique: true,
            trim: true,
            lowercase: true,
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                'Please enter a valid email address'
            ]
        },

        // Nearest fuel station
        NearestStation: {
            type: String,
            required: [true, 'Nearest station is required'],
            trim: true
        },

        // Fuel type — only allowed values
        FuelType: {
            type: String,
            required: [true, 'Fuel type is required'],
            enum: {
                values: ['Petrol', 'Diesel', 'Kerosene'],
                message: 'Fuel type must be Petrol, Diesel, or Kerosene'
            }
        },

        // National Identity Card — must be unique
        OwnerNIC: {
            type: String,
            required: [true, 'Owner NIC is required'],
            unique: true,
            trim: true,
            match: [
                /^[0-9]{9}[vVxX]$|^[0-9]{12}$/,
                'NIC must be in format: 123456789V or 200012345678'
            ]
        },

        // Vehicle model/make
        VehicleModel: {
            type: String,
            required: [true, 'Vehicle model is required'],
            trim: true
        },

        // QR Code string — auto-generated from RegNo, stored as Base64 data URL
        QRCode: {
            type: String,
            default: ''
        },

        // Weekly fuel quota in litres
        WeeklyQuota: {
            type: Number,
            default: 20,
            min: [0, 'Weekly quota cannot be negative'],
            max: [200, 'Weekly quota cannot exceed 200 litres']
        },

        // Whether this registration is currently active
        IsActive: {
            type: Boolean,
            default: true
        }
    },
    {
        // Automatically add createdAt and updatedAt timestamps
        timestamps: true
    }
);

// ── Indexes ──────────────────────────────────────────────────
// Additional compound/text indexes for faster searching
vehicleSchema.index({ FirstName: 1 });
vehicleSchema.index({ LastName: 1 });
vehicleSchema.index({ NearestStation: 1 });
vehicleSchema.index({ FuelType: 1 });


/**
 * Pre-save hook — auto-generates QRCode string before saving.
 * Format: <RegNo>-<timestamp> (basic unique string; frontend renders actual QR image)
 */
vehicleSchema.pre('save', function (next) {
    if (!this.QRCode || this.QRCode === '') {
        // Generate a simple unique QR string from RegNo
        this.QRCode = `${this.RegNo.replace(/-/g, '')}QR${Date.now()}`;
    }
    next();
});

// Export the Vehicle model
const Vehicle = mongoose.model('Vehicle', vehicleSchema);
module.exports = Vehicle;
