const express = require('express');
const path = require('path');
const sql = require('mssql');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config(); // Load environment variables from .env file

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json()); // Parse JSON request bodies
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON bodies (alternative to bodyParser.json)

// Serve static files from the "frontend" folder
app.use(express.static(path.join(__dirname, '../frontend')));

// SQL Server Configuration
const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: {
    encrypt: true, // For Azure
    trustServerCertificate: true, // For self-signed certificates
  },
};

// Connect to SQL Server
sql.connect(config)
  .then(() => {
    console.log('SQL Server connected');
  })
  .catch((err) => {
    console.error('SQL Server connection error:', err);
    process.exit(1); // Exit the application if the database connection fails
  });

// Routes
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const authRoutes = require('./routes/auth'); // Import auth routes
const orderRoutes = require('./routes/order');
const wishlistRoutes = require('./routes/wishlist');
const adminRoutes = require('./routes/admin'); // Import admin routes

// Use routes with /api prefix
app.use('/api/products', productRoutes); // Product-related routes
app.use('/api/cart', cartRoutes); // Cart-related routes
app.use('/api/auth', authRoutes); // Authentication-related routes
app.use('/api/orders', orderRoutes); // Order-related routes
app.use('/api/wishlist', wishlistRoutes); // Wishlist-related routes
app.use('/api/admin', adminRoutes); // Admin-related routes

// Root route - Serve the homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Health check route
app.get('/api/health', async (req, res) => {
  try {
    const request = new sql.Request();
    await request.query('SELECT 1'); // Simple query to test the database connection
    res.status(200).json({ status: 'OK' });
  } catch (err) {
    res.status(500).json({ status: 'Database connection failed', error: err.message });
  }
});

// 404 Route Not Found Handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the error stack trace
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});