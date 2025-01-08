const express = require('express');
const router = express.Router();
const { pool, sql } = require('../db'); // Import the SQL Server connection pool

// Fetch all products
router.get('/', async (req, res) => {
    try {
        const request = pool.request();
        const query = 'SELECT DISTINCT * FROM Products'; // Use DISTINCT to avoid duplicates
        const result = await request.query(query);

        // Convert sizes from JSON string to array
        const products = result.recordset.map(product => ({
            ...product,
            sizes: JSON.parse(product.Sizes), // Parse the sizes field
        }));

        res.status(200).json(products);
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ message: 'Error fetching products', error: err.message });
    }
});

// Fetch product details by ID
router.get('/:productId', async (req, res) => {
    const productId = req.params.productId;

    try {
        const request = pool.request();
        const query = 'SELECT * FROM Products WHERE ProductID = @productId';
        request.input('productId', sql.Int, productId);
        const result = await request.query(query);

        if (result.recordset.length > 0) {
            const product = result.recordset[0];
            product.sizes = JSON.parse(product.Sizes); // Parse the sizes field
            res.status(200).json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (err) {
        console.error('Error fetching product details:', err);
        res.status(500).json({ message: 'Error fetching product details', error: err.message });
    }
});

module.exports = router;