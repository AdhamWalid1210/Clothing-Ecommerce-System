const express = require('express');
const router = express.Router();
const { pool, sql } = require('../db'); // Import the SQL Server connection pool

// Get cart by user ID
router.get('/:userId', async (req, res) => {
    const userId = req.params.userId;

    try {
        const request = pool.request();
        const query = `
            SELECT 
                CartItems.CartItemID,
                CartItems.ProductID,
                Products.Name AS ProductName,
                Products.Price,
                CartItems.Quantity,
                CartItems.Size
            FROM CartItems
            INNER JOIN Products ON CartItems.ProductID = Products.ProductID
            WHERE CartItems.CartID = (
                SELECT CartID FROM Cart WHERE UserID = @userId
            )
        `;
        request.input('userId', sql.Int, userId);
        const result = await request.query(query);

        res.status(200).json(result.recordset);
    } catch (err) {
        console.error('Error fetching cart:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Add item to cart
router.post('/add', async (req, res) => {
    const { userId, productId, quantity, size } = req.body;

    try {
        const request = pool.request();

        // Step 1: Get the cart ID for the user
        const cartQuery = 'SELECT CartID FROM Cart WHERE UserID = @userId';
        request.input('userId', sql.Int, userId);
        const cartResult = await request.query(cartQuery);

        let cartId;
        if (cartResult.recordset.length === 0) {
            // If the user doesn't have a cart, create one
            const createCartQuery = 'INSERT INTO Cart (UserID) VALUES (@userId); SELECT SCOPE_IDENTITY() AS CartID;';
            const createCartResult = await request.query(createCartQuery);
            cartId = createCartResult.recordset[0].CartID;
        } else {
            cartId = cartResult.recordset[0].CartID;
        }

        // Step 2: Check if the item already exists in the cart
        const checkItemQuery = `
            SELECT * FROM CartItems 
            WHERE CartID = @cartId AND ProductID = @productId AND Size = @size
        `;
        request.input('cartId', sql.Int, cartId);
        request.input('productId', sql.Int, productId);
        request.input('size', sql.NVarChar, size);
        const itemResult = await request.query(checkItemQuery);

        if (itemResult.recordset.length > 0) {
            // If the item exists, update the quantity
            const updateQuery = `
                UPDATE CartItems 
                SET Quantity = Quantity + @quantity 
                WHERE CartItemID = @cartItemId
            `;
            request.input('quantity', sql.Int, quantity);
            request.input('cartItemId', sql.Int, itemResult.recordset[0].CartItemID);
            await request.query(updateQuery);
        } else {
            // If the item doesn't exist, insert it
            const addItemQuery = `
                INSERT INTO CartItems (CartID, ProductID, Quantity, Size)
                VALUES (@cartId, @productId, @quantity, @size)
            `;
            request.input('quantity', sql.Int, quantity);
            await request.query(addItemQuery);
        }

        res.status(201).json({ message: 'Item added to cart successfully' });
    } catch (err) {
        console.error('Error adding item to cart:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Remove item from cart
router.delete('/:cartItemId', async (req, res) => {
    const cartItemId = req.params.cartItemId;

    try {
        const request = pool.request();
        const query = 'DELETE FROM CartItems WHERE CartItemID = @cartItemId';
        request.input('cartItemId', sql.Int, cartItemId);
        await request.query(query);

        res.status(200).json({ message: 'Item removed from cart successfully' });
    } catch (err) {
        console.error('Error removing item from cart:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;