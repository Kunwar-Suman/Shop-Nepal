# Admin User Setup Guide

To login as an admin, you need a user account with `role = 'admin'` in the database.

## Method 1: Using the Node.js Script (Recommended)

1. Make sure your server dependencies are installed:
   ```bash
   npm install --prefix server
   ```

2. Install root dependencies (for the admin script):
   ```bash
   npm install
   ```

3. Make sure your database is set up and the `.env` file in the `server` directory is configured with your database credentials.

4. Run the admin creation script:
   ```bash
   npm run create-admin
   ```

5. The script will create an admin user with these default credentials:
   - **Email**: `admin@nepshop.com`
   - **Phone**: `9800000000`
   - **Password**: `admin123`

6. Login at `http://localhost:3000/login` using the email or phone and password above.

⚠️ **Important**: Change the password after first login!

## Method 2: Manual SQL (Advanced)

If you prefer to create the admin user manually:

1. Generate a bcrypt hash for your password. You can use Node.js:
   ```bash
   node -e "const bcrypt=require('bcryptjs');bcrypt.hash('yourpassword',10).then(h=>console.log(h))"
   ```

2. Run the SQL in `create-admin.sql`, replacing the hashed password.

## Method 3: Convert Existing User to Admin

If you already have a user account and want to make it an admin:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

Then login with your existing credentials - you'll now have admin access!

## Login Process

1. Go to `http://localhost:3000/login`
2. Enter your admin email/phone and password
3. The system will automatically detect your admin role
4. You'll be redirected to the admin dashboard (if implemented) or products page with admin privileges

## Admin Features

Once logged in as admin, you can:
- Manage products (Add, Update, Delete)
- Manage categories
- View and update orders
- Access sales reports and analytics
- View daily/monthly sales
- See top selling products
