const { pool, sql } = require('../db');

// Get all products
const getAllProducts = async () => {
    try {
        const request = pool.request();
        const result = await request.query('SELECT * FROM Products');
        return result.recordset;
    } catch (err) {
        console.error('Error fetching products:', err);
        throw err;
    }
};

// Add a new product
const addProduct = async (name, price, imageURL, description, sizes) => {
    try {
        const request = pool.request();
        const query = `
            INSERT INTO Products (Name, Price, ImageURL, Description, Sizes)
            VALUES (@name, @price, @imageURL, @description, @sizes)
        `;
        request.input('name', sql.NVarChar, name);
        request.input('price', sql.Decimal, price);
        request.input('imageURL', sql.NVarChar, imageURL);
        request.input('description', sql.NVarChar, description);
        request.input('sizes', sql.NVarChar, JSON.stringify(sizes));
        await request.query(query);
    } catch (err) {
        console.error('Error adding product:', err);
        throw err;
    }
};

module.exports = {
    getAllProducts,
    addProduct,
};