const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from server directory
dotenv.config({ path: path.join(__dirname, '../server/.env') });

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'nep_shop'
});

async function createAdmin() {
  // Default admin credentials (you can change these)
  const adminData = {
    name: 'Admin',
    email: 'admin@nepshop.com',
    phone: '9800000000',
    password: 'admin123', // Change this password!
    role: 'admin'
  };

  try {
    // Connect to database
    await new Promise((resolve, reject) => {
      db.connect((err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    console.log('Connected to database');

    // Check if admin already exists
    const checkQuery = 'SELECT * FROM users WHERE email = ? OR role = ?';
    const existingUsers = await new Promise((resolve, reject) => {
      db.query(checkQuery, [adminData.email, 'admin'], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    if (existingUsers.length > 0) {
      console.log('Admin user already exists!');
      console.log('Existing admin users:');
      existingUsers.forEach(user => {
        console.log(`- ${user.name} (${user.email}) - Role: ${user.role}`);
      });
      console.log('\nYou can login with the existing admin credentials.');
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminData.password, 10);
    console.log('Password hashed successfully');

    // Insert admin user
    const insertQuery = 'INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)';
    await new Promise((resolve, reject) => {
      db.query(
        insertQuery,
        [adminData.name, adminData.email, adminData.phone, hashedPassword, adminData.role],
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });

    console.log('\n✅ Admin user created successfully!');
    console.log('\nAdmin Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Email: ${adminData.email}`);
    console.log(`Phone: ${adminData.phone}`);
    console.log(`Password: ${adminData.password}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n⚠️  IMPORTANT: Change the password after first login!');
    console.log('\nYou can now login at: http://localhost:3000/login');

  } catch (error) {
    console.error('Error creating admin user:', error.message);
    process.exit(1);
  } finally {
    db.end();
  }
}

createAdmin();
