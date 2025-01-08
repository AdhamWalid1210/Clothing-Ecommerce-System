const { pool, sql } = require('../db'); // Import the SQL Server connection

// Function to add an item to the wishlist
const addToWishlist = async (userId, productId) => {
    try {
        const request = pool.request();

        // Check if the item already exists in the wishlist
        const checkQuery = `
            SELECT * FROM Wishlist
            WHERE UserID = @userId AND ProductID = @productId
        `;
        request.input('userId', sql.Int, userId);
        request.input('productId', sql.Int, productId);
        const checkResult = await request.query(checkQuery);

        if (checkResult.recordset.length > 0) {
            throw new Error('Product already exists in the wishlist.');
        }

        // Add the item to the wishlist
        const insertQuery = `
            INSERT INTO Wishlist (UserID, ProductID)
            VALUES (@userId, @productId)
        `;
        await request.query(insertQuery);

        return { message: 'Item added to wishlist' };
    } catch (err) {
        console.error('Error adding to wishlist:', err);
        throw new Error('Failed to add item to wishlist. Please try again.');
    }
};

// Function to get wishlist items for a user
const getWishlistByUserId = async (userId) => {
    try {
        const request = pool.request();
        const query = `
            SELECT p.*
            FROM Wishlist w
            JOIN Products p ON w.ProductID = p.ProductID
            WHERE w.UserID = @userId
        `;
        request.input('userId', sql.Int, userId);
        const result = await request.query(query);
        return result.recordset; // Return the list of products in the wishlist
    } catch (err) {
        console.error('Error fetching wishlist:', err);
        throw new Error('Failed to fetch wishlist. Please try again.');
    }
};

// Function to remove an item from the wishlist
const removeFromWishlist = async (userId, productId) => {
    try {
        const request = pool.request();
        const query = `
            DELETE FROM Wishlist
            WHERE UserID = @userId AND ProductID = @productId
        `;
        request.input('userId', sql.Int, userId);
        request.input('productId', sql.Int, productId);
        await request.query(query);

        return { message: 'Item removed from wishlist' };
    } catch (err) {
        console.error('Error removing from wishlist:', err);
        throw new Error('Failed to remove item from wishlist. Please try again.');
    }
};

module.exports = {
    addToWishlist,
    getWishlistByUserId,
    removeFromWishlist,
};