const sql = require('mssql');
require('dotenv').config(); // Ensure this line is present

// Debug: Log the environment variables
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_SERVER:', process.env.DB_SERVER);
console.log('DB_DATABASE:', process.env.DB_DATABASE);

// Validate environment variables
const requiredEnvVars = ['DB_USER', 'DB_PASSWORD', 'DB_SERVER', 'DB_DATABASE'];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.error(`Missing required environment variable: ${envVar}`);
        process.exit(1); // Exit the application if any required variable is missing
    }
}

// SQL Server Configuration
const config = {
    user: process.env.DB_USER, // ecommerce_user
    password: process.env.DB_PASSWORD, // 0000
    server: process.env.DB_SERVER, // localhost
    database: process.env.DB_DATABASE, // clothing-ecommerce
    options: {
        encrypt: true, // For Azure SQL
        trustServerCertificate: true, // Trust self-signed certificates
    },
};

// Create a connection pool
const pool = new sql.ConnectionPool(config);

// Connect to the database
const poolConnect = pool.connect()
    .then(() => {
        console.log('Connected to SQL Server');
    })
    .catch((err) => {
        console.error('Database connection failed:', err);

        // Log detailed error information
        if (err.code === 'ELOGIN') {
            console.error('Login failed. Check your DB_USER and DB_PASSWORD.');
        } else if (err.code === 'ESOCKET') {
            console.error('Unable to connect to the server. Check your DB_SERVER.');
        } else if (err.code === 'EDESTDB') {
            console.error('Database not found. Check your DB_DATABASE.');
        } else {
            console.error('Unknown database connection error:', err.message);
        }

        process.exit(1); // Exit the application if the connection fails
    });

// Function to test the database connection
async function testConnection() {
    try {
        const request = pool.request();
        const result = await request.query('SELECT 1 AS test');
        console.log('Database connection test successful:', result.recordset);
    } catch (err) {
        console.error('Database connection test failed:', err);
        throw err; // Re-throw the error to handle it elsewhere if needed
    }
}

// Test the connection when the module is loaded
poolConnect
    .then(() => {
        testConnection();
    })
    .catch((err) => {
        console.error('Failed to initialize database connection:', err);
        process.exit(1); // Exit the application if the connection fails
    });

// Export the pool, sql, and poolConnect for use in other modules
module.exports = { pool, sql, poolConnect };