// models/cart.js (SQL Server)
const { pool, sql } = require('../db');

// Get cart by user ID
const getCartByUserId = async (userId) => {
    try {
        const request = pool.request();
        const query = `
            SELECT CartItems.*, Products.Name, Products.Price, Products.ImageURL
            FROM CartItems
            INNER JOIN Products ON CartItems.ProductID = Products.ProductID
            WHERE CartItems.CartID IN (SELECT CartID FROM Cart WHERE UserID = @userId)
        `;
        request.input('userId', sql.Int, userId);
        const result = await request.query(query);
        return result.recordset;
    } catch (err) {
        console.error('Error fetching cart by user ID:', err);
        throw err;
    }
};

// Add item to cart
const addItemToCart = async (cartId, productId, quantity, size) => {
    try {
        const request = pool.request();
        const query = `
            INSERT INTO CartItems (CartID, ProductID, Quantity, Size)
            VALUES (@cartId, @productId, @quantity, @size)
        `;
        request.input('cartId', sql.Int, cartId);
        request.input('productId', sql.Int, productId);
        request.input('quantity', sql.Int, quantity);
        request.input('size', sql.NVarChar, size);
        await request.query(query);
    } catch (err) {
        console.error('Error adding item to cart:', err);
        throw err;
    }
};

// Remove item from cart
const removeItemFromCart = async (cartItemId) => {
    try {
        const request = pool.request();
        const query = 'DELETE FROM CartItems WHERE CartItemID = @cartItemId';
        request.input('cartItemId', sql.Int, cartItemId);
        await request.query(query);
    } catch (err) {
        console.error('Error removing item from cart:', err);
        throw err;
    }
};

module.exports = {
    getCartByUserId,
    addItemToCart,
    removeItemFromCart,
};