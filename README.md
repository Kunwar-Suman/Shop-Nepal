# Nep-Shop

Simple E-Commerce Website for Local Nepali Shop

An e-commerce platform designed for local Nepali shop owners to sell products online. Customers can browse products, add to cart, and place orders with Cash on Delivery or digital wallet payment options.

## Features

### Customer Features
- ✅ User registration and authentication (Email/Phone)
- ✅ Browse products with search and filter
- ✅ Product categories
- ✅ Shopping cart management
- ✅ Order placement with delivery address
- ✅ Order history and tracking
- ✅ Payment methods: Cash on Delivery (COD), eSewa/Khalti (optional)

### Admin Features
- ✅ Secure admin login
- ✅ Product management (Add, Update, Delete)
- ✅ Category management
- ✅ Order management with status updates
- ✅ Sales reports and analytics
- ✅ Daily/Monthly sales tracking
- ✅ Top selling products

## Tech Stack

- **Frontend**: React.js, HTML, CSS, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **Password Security**: bcryptjs

## Project Structure

```
nep-shop/
├── client/                 # React frontend
│   ├── public/
│   └── src/
├── server/                 # Node.js backend
│   ├── config/            # Database configuration
│   ├── middleware/        # Auth middleware
│   └── routes/            # API routes
├── database/              # Database schema
│   └── schema.sql
└── package.json
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Kunwar-Suman/Shop-Nepal.git
cd Nep-Shop
```

2. Install dependencies:
```bash
npm run install-all
```

3. Set up MySQL database:
   - Create a MySQL database
   - Import the schema from `database/schema.sql`
   - Update `server/.env` with your database credentials

4. Configure environment variables:
```bash
cd server
cp .env.example .env
# Edit .env with your configuration
```

5. Run the application:
```bash
npm run dev
```

The server will run on `http://localhost:5000` and the client on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (Admin)
- `PUT /api/categories/:id` - Update category (Admin)
- `DELETE /api/categories/:id` - Delete category (Admin)

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:id` - Update cart item
- `DELETE /api/cart/:id` - Remove item from cart

### Orders
- `POST /api/orders` - Place order
- `GET /api/orders/my-orders` - Get user's orders
- `GET /api/orders` - Get all orders (Admin)
- `GET /api/orders/:id` - Get single order
- `PUT /api/orders/:id/status` - Update order status (Admin)

### Reports
- `GET /api/reports/summary` - Sales summary (Admin)
- `GET /api/reports/daily` - Daily sales (Admin)
- `GET /api/reports/monthly` - Monthly sales (Admin)
- `GET /api/reports/top-products` - Top selling products (Admin)

## Database Schema

The database includes the following tables:
- `users` - User accounts
- `categories` - Product categories
- `products` - Product catalog
- `cart` - Shopping cart items
- `orders` - Order records
- `order_items` - Order line items
- `payments` - Payment records (optional)

## Future Enhancements

- [ ] Online payment integration (eSewa/Khalti)
- [ ] SMS notifications
- [ ] Delivery tracking
- [ ] Multi-vendor support
- [ ] Mobile app version

## License

ISC

## Author

Developed for local Nepali shop owners
