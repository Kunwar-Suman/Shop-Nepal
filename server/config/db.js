const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'nep_shop',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const db = mysql.createConnection(dbConfig);

db.connect((err) => {
  if (err) {
    console.error('❌ Database connection error:', err.message);
    console.error('Please check your database configuration in server/.env');
    console.error('Make sure MySQL is running and the database exists.');
    process.exit(1);
  }
  console.log('✅ Connected to MySQL database:', dbConfig.database);
});

// Handle connection errors
db.on('error', (err) => {
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.error('Database connection was closed. Reconnecting...');
    db.connect();
  } else {
    console.error('Database error:', err);
  }
});

module.exports = db;
