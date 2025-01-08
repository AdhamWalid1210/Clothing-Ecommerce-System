const express = require('express');
const { pool, sql } = require('../db');
const router = express.Router();

// Function to create an order
async function createOrder(userId, totalAmount, shippingAddress, paymentMethod, items) {
    if (!userId || !totalAmount || !shippingAddress || !paymentMethod || !items || items.length === 0) {
        throw new Error('Invalid input data for creating an order.');
    }

    try {
        await sql.connect(); // Ensure the connection is established

        const transaction = new sql.Transaction();
        await transaction.begin();

        try {
            const request = new sql.Request(transaction);

            // Insert into Orders table
            const orderResult = await request
                .input('UserID', sql.Int, userId)
                .input('TotalAmount', sql.Decimal(10, 2), totalAmount)
                .input('ShippingAddress', sql.NVarChar(255), shippingAddress)
                .input('PaymentMethod', sql.NVarChar(50), paymentMethod)
                .query(`
                    INSERT INTO Orders (UserID, TotalAmount, ShippingAddress, PaymentMethod, Status)
                    VALUES (@UserID, @TotalAmount, @ShippingAddress, @PaymentMethod, 'Pending');
                    SELECT SCOPE_IDENTITY() AS OrderID;
                `);

            const orderId = orderResult.recordset[0].OrderID;
            console.log('Order created successfully. Order ID:', orderId); // Debugging

            // Insert into OrderItems table
            for (let i = 0; i < items.length; i++) {
                const item = items[i];

                if (!item.productId || !item.quantity || !item.price || !item.size) {
                    throw new Error('Invalid item data in the order.');
                }

                // Use unique parameter names for each item
                await request
                    .input(`OrderIDItem${i}`, sql.Int, orderId) // Unique parameter name for each item
                    .input(`ProductIDItem${i}`, sql.Int, item.productId) // Unique parameter name for each item
                    .input(`QuantityItem${i}`, sql.Int, item.quantity) // Unique parameter name for each item
                    .input(`PriceItem${i}`, sql.Decimal(10, 2), item.price) // Unique parameter name for each item
                    .input(`SizeItem${i}`, sql.NVarChar(10), item.size) // Unique parameter name for each item
                    .query(`
                        INSERT INTO OrderItems (OrderID, ProductID, Quantity, Price, Size)
                        VALUES (@OrderIDItem${i}, @ProductIDItem${i}, @QuantityItem${i}, @PriceItem${i}, @SizeItem${i});
                    `);

                console.log('Order item added:', item); // Debugging
            }

            await transaction.commit(); // Commit the transaction
            return orderId;
        } catch (err) {
            await transaction.rollback(); // Rollback the transaction on error
            console.error('Error during order creation:', err); // Debugging
            throw err;
        }
    } catch (err) {
        console.error('Error creating order:', err); // Debugging
        throw err;
    }
}

// Function to fetch order details by ID
async function getOrderById(orderId) {
    if (!orderId) {
        throw new Error('Order ID is required to fetch order details.');
    }

    try {
        await sql.connect(); // Ensure the connection is established

        const request = new sql.Request();
        const result = await request
            .input('OrderIDParam', sql.Int, orderId) // Unique parameter name
            .query(`
                SELECT 
                    Orders.OrderID, Orders.UserID, Orders.TotalAmount, Orders.ShippingAddress, 
                    Orders.PaymentMethod, Orders.Status, Orders.CreatedAt,
                    OrderItems.ProductID, OrderItems.Quantity, OrderItems.Price, OrderItems.Size,
                    Products.Name AS ProductName, Products.Description AS ProductDescription
                FROM Orders
                INNER JOIN OrderItems ON Orders.OrderID = OrderItems.OrderID
                INNER JOIN Products ON OrderItems.ProductID = Products.ProductID
                WHERE Orders.OrderID = @OrderIDParam;
            `);

        console.log('Order details fetched:', result.recordset); // Debugging

        if (result.recordset.length === 0) {
            return null;
        }

        // Group order items by OrderID
        const order = {
            OrderID: result.recordset[0].OrderID,
            UserID: result.recordset[0].UserID,
            TotalAmount: result.recordset[0].TotalAmount,
            ShippingAddress: result.recordset[0].ShippingAddress,
            PaymentMethod: result.recordset[0].PaymentMethod,
            Status: result.recordset[0].Status,
            CreatedAt: result.recordset[0].CreatedAt,
            Items: result.recordset.map(item => ({
                ProductID: item.ProductID,
                ProductName: item.ProductName,
                ProductDescription: item.ProductDescription,
                Quantity: item.Quantity,
                Price: item.Price,
                Size: item.Size,
            })),
        };

        return order;
    } catch (err) {
        console.error('Error fetching order details:', err); // Debugging
        throw err;
    }
}

// Create a new order
router.post('/create', async (req, res) => {
    const { userId, totalAmount, shippingAddress, paymentMethod, items } = req.body;

    try {
        const orderId = await createOrder(userId, totalAmount, shippingAddress, paymentMethod, items);
        res.status(201).json({ orderId });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Fetch order details by ID
router.get('/:orderId', async (req, res) => {
    const { orderId } = req.params;

    try {
        const order = await getOrderById(orderId);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json(order);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;