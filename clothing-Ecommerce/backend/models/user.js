const { pool, sql } = require('../db');

// Register a new user with a default role of 'customer'
const registerUser = async (name, email, password, role = 'customer') => {
    try {
        const request = pool.request();
        const query = `
            INSERT INTO [dbo].[Users] (Name, Email, Password, Role)
            VALUES (@name, @email, @password, @role)
        `;
        request.input('name', sql.NVarChar, name);
        request.input('email', sql.NVarChar, email);
        request.input('password', sql.NVarChar, password);
        request.input('role', sql.NVarChar, role); // Include the role field
        await request.query(query);
    } catch (err) {
        console.error('Error registering user:', err);
        throw err;
    }
};

// Find a user by email
const findUserByEmail = async (email) => {
    try {
        const request = pool.request();
        const query = 'SELECT * FROM [dbo].[Users] WHERE Email = @email';
        request.input('email', sql.NVarChar, email);
        const result = await request.query(query);
        return result.recordset[0]; // Return the first matching user
    } catch (err) {
        console.error('Error finding user by email:', err);
        throw err;
    }
};

// Find a user by ID
const findById = async (userId) => {
    try {
        const request = pool.request();
        const query = 'SELECT * FROM [dbo].[Users] WHERE UserID = @userId';
        request.input('userId', sql.Int, userId);
        const result = await request.query(query);
        return result.recordset[0]; // Return the first matching user
    } catch (err) {
        console.error('Error finding user by ID:', err);
        throw err;
    }
};

module.exports = {
    registerUser,
    findUserByEmail,
    findById, // Export the findById function
};