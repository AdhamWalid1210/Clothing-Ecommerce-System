const { pool, sql } = require('./db'); // Import the SQL Server connection

// Sample products to insert
const sampleProducts = [
    {
        name: 'Block Sweater',
        price: 40,
        imageURL: 'http://example.com/block-sweater.jpg',
        description: 'A cozy block sweater.',
        sizes: JSON.stringify(["S", "M", "L"]), // Store sizes as a JSON string
    },
    {
        name: 'White Pants',
        price: 50,
        imageURL: 'http://example.com/white-pants.jpg',
        description: 'Stylish white pants.',
        sizes: JSON.stringify(["M", "L", "XL"]), // Store sizes as a JSON string
    },
];

// Function to insert sample products
const insertSampleProducts = async () => {
    try {
        // Connect to the database
        await pool.connect();

        // Insert each product
        for (const product of sampleProducts) {
            const request = pool.request();
            const query = `
                INSERT INTO Products (Name, Price, ImageURL, Description, Sizes)
                VALUES (@name, @price, @imageURL, @description, @sizes)
            `;
            request.input('name', sql.NVarChar, product.name);
            request.input('price', sql.Decimal, product.price);
            request.input('imageURL', sql.NVarChar, product.imageURL);
            request.input('description', sql.NVarChar, product.description);
            request.input('sizes', sql.NVarChar, product.sizes);
            await request.query(query);
        }

        console.log('Sample products inserted successfully');
    } catch (err) {
        console.error('Error inserting sample products:', err);
    } finally {
        // Close the database connection
        await pool.close();
    }
};

// Run the seeding function
insertSampleProducts();