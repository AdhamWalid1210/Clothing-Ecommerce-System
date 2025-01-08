const bcrypt = require('bcryptjs');
const { pool, sql } = require('./db'); // Adjust the path to your db.js file

async function hashPasswords() {
  try {
    // Connect to the database
    await pool.connect(); // Ensure the connection is open

    // Fetch all users
    const request = pool.request();
    const query = 'SELECT UserID, Password FROM Users';
    const result = await request.query(query);

    // Hash each user's password
    for (const user of result.recordset) {
      const hashedPassword = await bcrypt.hash(user.Password, 10); // Hash the password
      const updateQuery = `
        UPDATE Users
        SET Password = @hashedPassword
        WHERE UserID = @userId
      `;
      const updateRequest = pool.request();
      updateRequest.input('hashedPassword', sql.NVarChar, hashedPassword);
      updateRequest.input('userId', sql.Int, user.UserID);
      await updateRequest.query(updateQuery);
      console.log(`Password hashed for user ${user.UserID}`);
    }

    console.log('All passwords have been hashed successfully.');
  } catch (err) {
    console.error('Error hashing passwords:', err);
  } finally {
    // Close the connection after the script is done
    await pool.close();
  }
}

hashPasswords();