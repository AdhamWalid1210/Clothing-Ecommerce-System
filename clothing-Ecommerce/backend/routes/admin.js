const express = require('express');
const router = express.Router();
const isAdmin = require('../middleware/isAdmin');
const { pool, sql } = require('../db');
const bcrypt = require('bcryptjs'); // For password hashing

// User Management

// Get all users
router.get('/users', isAdmin, async (req, res) => {
    try {
        console.log('Fetching users...'); // Debugging
        const request = pool.request();
        const query = 'SELECT UserID, Name, Email, Role FROM [dbo].[Users]';
        const result = await request.query(query);
        console.log('Users fetched:', result.recordset); // Debugging
        res.status(200).json(result.recordset);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ message: 'Failed to fetch users.' });
    }
});

// Add a new user
router.post('/users/add', isAdmin, async (req, res) => {
    const { name, email, password, role = 'customer' } = req.body;

    // Validate input
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    try {
        // Hash the password before storing it
        const hashedPassword = await bcrypt.hash(password, 10);

        const request = pool.request();
        const query = `
            INSERT INTO [dbo].[Users] (Name, Email, Password, Role)
            VALUES (@name, @email, @password, @role)
        `;
        request.input('name', sql.NVarChar, name);
        request.input('email', sql.NVarChar, email);
        request.input('password', sql.NVarChar, hashedPassword); // Store hashed password
        request.input('role', sql.NVarChar, role);
        await request.query(query);
        res.status(201).json({ message: 'User added successfully.' });
    } catch (err) {
        console.error('Error adding user:', err);
        res.status(500).json({ message: 'Failed to add user.' });
    }
});

// Delete a user
router.delete('/users/delete/:id', isAdmin, async (req, res) => {
    const { id } = req.params;

    try {
        const request = pool.request();
        const query = 'DELETE FROM [dbo].[Users] WHERE UserID = @id';
        request.input('id', sql.Int, id);
        await request.query(query);
        res.status(200).json({ message: 'User deleted successfully.' });
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ message: 'Failed to delete user.' });
    }
});

// Product Management

// Get all products
router.get('/products', isAdmin, async (req, res) => {
    try {
        const request = pool.request();
        const query = 'SELECT * FROM [dbo].[Products]';
        const result = await request.query(query);

        // Parse sizes from JSON string to array
        const products = result.recordset.map(product => ({
            ...product,
            sizes: JSON.parse(product.Sizes),
        }));

        res.status(200).json(products);
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ message: 'Failed to fetch products.' });
    }
});

// Add a new product
router.post('/products/add', isAdmin, async (req, res) => {
    const { name, price, imageURL, description, sizes } = req.body;

    // Validate input
    if (!name || !price || !imageURL || !description || !sizes) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        const request = pool.request();
        const query = `
            INSERT INTO [dbo].[Products] (Name, Price, ImageURL, Description, Sizes)
            VALUES (@name, @price, @imageURL, @description, @sizes)
        `;
        request.input('name', sql.NVarChar, name);
        request.input('price', sql.Decimal, price);
        request.input('imageURL', sql.NVarChar, imageURL);
        request.input('description', sql.NVarChar, description);
        request.input('sizes', sql.NVarChar, JSON.stringify(sizes)); // Store sizes as JSON
        await request.query(query);
        res.status(201).json({ message: 'Product added successfully.' });
    } catch (err) {
        console.error('Error adding product:', err);
        res.status(500).json({ message: 'Failed to add product.' });
    }
});

// Delete a product
router.delete('/products/delete/:id', isAdmin, async (req, res) => {
    const { id } = req.params;

    try {
        const request = pool.request();
        const query = 'DELETE FROM [dbo].[Products] WHERE ProductID = @id';
        request.input('id', sql.Int, id);
        await request.query(query);
        res.status(200).json({ message: 'Product deleted successfully.' });
    } catch (err) {
        console.error('Error deleting product:', err);
        res.status(500).json({ message: 'Failed to delete product.' });
    }
});

// Order Management

// Get all orders
router.get('/orders', isAdmin, async (req, res) => {
    try {
        const request = pool.request();
        const query = `
            SELECT 
                Orders.OrderID, Orders.UserID, Orders.TotalAmount, Orders.ShippingAddress, 
                Orders.PaymentMethod, Orders.Status, Orders.CreatedAt,
                OrderItems.ProductID, OrderItems.Quantity, OrderItems.Price, OrderItems.Size,
                Products.Name AS ProductName
            FROM Orders
            INNER JOIN OrderItems ON Orders.OrderID = OrderItems.OrderID
            INNER JOIN Products ON OrderItems.ProductID = Products.ProductID
        `;
        const result = await request.query(query);

        // Group order items by OrderID
        const orders = result.recordset.reduce((acc, item) => {
            const order = acc.find(o => o.OrderID === item.OrderID);
            if (order) {
                order.Items.push({
                    ProductID: item.ProductID,
                    ProductName: item.ProductName,
                    Quantity: item.Quantity,
                    Price: item.Price,
                    Size: item.Size,
                });
            } else {
                acc.push({
                    OrderID: item.OrderID,
                    UserID: item.UserID,
                    TotalAmount: item.TotalAmount,
                    ShippingAddress: item.ShippingAddress,
                    PaymentMethod: item.PaymentMethod,
                    Status: item.Status,
                    CreatedAt: item.CreatedAt,
                    Items: [{
                        ProductID: item.ProductID,
                        ProductName: item.ProductName,
                        Quantity: item.Quantity,
                        Price: item.Price,
                        Size: item.Size,
                    }],
                });
            }
            return acc;
        }, []);

        res.status(200).json(orders);
    } catch (err) {
        console.error('Error fetching orders:', err);
        res.status(500).json({ message: 'Failed to fetch orders.' });
    }
});

// Update order status
router.put('/orders/update-status/:id', isAdmin, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    // Validate input
    if (!status) {
        return res.status(400).json({ message: 'Status is required.' });
    }

    try {
        const request = pool.request();
        const query = `
            UPDATE [dbo].[Orders]
            SET Status = @status
            WHERE OrderID = @id
        `;
        request.input('id', sql.Int, id);
        request.input('status', sql.NVarChar, status);
        await request.query(query);
        res.status(200).json({ message: 'Order status updated successfully.' });
    } catch (err) {
        console.error('Error updating order status:', err);
        res.status(500).json({ message: 'Failed to update order status.' });
    }
});

module.exports = router;