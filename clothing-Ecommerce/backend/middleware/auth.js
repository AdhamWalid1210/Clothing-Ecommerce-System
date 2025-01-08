const jwt = require('jsonwebtoken');
const { findById } = require('../models/user'); // Import the correct function

module.exports = async (req, res, next) => {
    // Extract the token from the Authorization header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    // If no token is provided, return a 401 Unauthorized error
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        // Verify the token using the JWT secret
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find the user by their ID (decoded.userId)
        const user = await findById(decoded.userId);

        // If the user is not found, return a 401 Unauthorized error
        if (!user) {
            return res.status(401).json({ message: 'Invalid token: User not found' });
        }

        // Attach the user object (including role) to the request
        req.user = user;

        // Proceed to the next middleware/route
        next();
    } catch (err) {
        console.error('Error verifying token:', err);

        // Handle specific JWT errors
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token: Token verification failed' });
        } else if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired. Please log in again.' });
        }

        // Generic error response
        res.status(500).json({ message: 'Something went wrong during authentication.' });
    }
};