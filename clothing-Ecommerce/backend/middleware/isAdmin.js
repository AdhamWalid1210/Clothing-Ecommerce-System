const { pool, sql } = require('../db');

// Middleware to check if the user is an admin
const isAdmin = async (req, res, next) => {
    const userId = req.user?.UserID; // Access UserID from req.user (set by auth middleware)

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized: User not logged in.' });
    }

    try {
        const request = pool.request();
        const query = 'SELECT Role FROM Users WHERE UserID = @userId';
        request.input('userId', sql.Int, userId);
        const result = await request.query(query);

        // Check if the user exists and has the 'admin' role (case-insensitive)
        if (result.recordset.length === 0 || result.recordset[0].Role.toLowerCase() !== 'admin') {
            return res.status(403).json({ message: 'Forbidden: User is not an admin.' });
        }

        next(); // User is an admin, proceed to the next middleware/route
    } catch (err) {
        console.error('Error checking admin role:', err);
        res.status(500).json({ message: 'Failed to verify admin role. Please try again.' });
    }
};

module.exports = isAdmin;