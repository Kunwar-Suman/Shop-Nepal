-- Create Admin User Script
-- 
-- IMPORTANT: This SQL script creates an admin user with a plain text password.
-- You MUST hash the password using bcrypt before inserting it into the database.
-- 
-- Option 1: Use the Node.js script (RECOMMENDED)
-- Run: npm run create-admin
--
-- Option 2: Manual SQL (requires password hashing)
-- 1. Hash your password using bcrypt (you can use online tools or Node.js)
-- 2. Replace the hashed_password_here with your bcrypt hash
-- 3. Run this SQL script

-- Example: Create admin user
-- Replace 'hashed_password_here' with a bcrypt hash of your password
-- You can generate a bcrypt hash using: node -e "const bcrypt=require('bcryptjs');bcrypt.hash('yourpassword',10).then(h=>console.log(h))"

INSERT INTO users (name, email, phone, password, role) 
VALUES (
    'Admin',
    'admin@nepshop.com',
    '9800000000',
    '$2a$10$hashed_password_here', -- REPLACE THIS with actual bcrypt hash
    'admin'
);

-- To update an existing user to admin:
-- UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
