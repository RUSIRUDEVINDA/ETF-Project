/**
 * ============================================================
 * FILE: config/db.js
 * PURPOSE: MongoDB database connection configuration
 * ============================================================
 */

const mongoose = require('mongoose');

/**
 * connectDB - Connects to MongoDB using the URI from .env file
 * Uses async/await for clean asynchronous handling
 */
const connectDB = async () => {
    try {
        // Attempt to connect to MongoDB
        const conn = await mongoose.connect(process.env.MONGO_URI);

        console.log('===========================================');
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`📂 Database: ${conn.connection.name}`);
        console.log('===========================================');
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error.message);
        // Exit process with failure if DB connection fails
        process.exit(1);
    }
};

module.exports = connectDB;
