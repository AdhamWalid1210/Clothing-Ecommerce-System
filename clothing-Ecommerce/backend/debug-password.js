const bcrypt = require('bcryptjs');

// Replace these values with the actual password and hash from your database
const password = 'A3A3'; // Replace with the actual password
const hashedPassword = '$2a$10$CmSxDaerfr9ASOJ807FHfut7TkbuJ40dr5D22z6SgGFcePR2csomO'; // Replace with the actual hash

// Hash the password (for testing purposes)
const newHash = bcrypt.hashSync(password, 10);
console.log('New hash:', newHash);

// Compare the password with the hash
const isMatch = bcrypt.compareSync(password, hashedPassword);
console.log('Password match:', isMatch);
