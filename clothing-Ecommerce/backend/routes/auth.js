const express = require('express');
const { pool, sql } = require('../db');
const bcrypt = require('bcryptjs'); // For password hashing
const jwt = require('jsonwebtoken'); // For generating JWT tokens
const { findUserByEmail } = require('../models/user'); // Import the findUserByEmail function
const router = express.Router();

// Signup route
router.post('/signup', async (req, res) => {
    const { name, email, password, role = 'customer' } = req.body; // Default role is 'customer'

    // Validate input
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        // Check if the email already exists
        const checkRequest = pool.request();
        const checkEmailQuery = 'SELECT * FROM Users WHERE Email = @email';
        checkRequest.input('email', sql.NVarChar, email);
        const emailCheckResult = await checkRequest.query(checkEmailQuery);

        if (emailCheckResult.recordset.length > 0) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert the new user into the database
        const insertRequest = pool.request();
        const insertUserQuery = `
            INSERT INTO Users (Name, Email, Password, Role)
            VALUES (@name, @email, @password, @role)
        `;
        insertRequest.input('name', sql.NVarChar, name);
        insertRequest.input('email', sql.NVarChar, email);
        insertRequest.input('password', sql.NVarChar, hashedPassword);
        insertRequest.input('role', sql.NVarChar, role); // Include the role field
        await insertRequest.query(insertUserQuery);

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error('Error during signup:', err);
        res.status(500).json({ message: 'Database error', error: err.message });
    }
});

// Login route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        // Check if the user exists
        const user = await findUserByEmail(email);

        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        // Compare the provided password with the hashed password in the database
        const isPasswordValid = await bcrypt.compare(password, user.Password);

        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        // Generate a JWT token
        const token = jwt.sign(
            { userId: user.UserID, role: user.Role }, // Include userId and role in the payload
            process.env.JWT_SECRET,
            { expiresIn: '1h' } // Token expires in 1 hour
        );

        // Return the token and user details (excluding the password)
        res.status(200).json({
            token,
            user: {
                UserID: user.UserID,
                Name: user.Name,
                Email: user.Email,
                Role: user.Role,
            },
        });
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ message: 'Database error', error: err.message });
    }
});

module.exports = router;