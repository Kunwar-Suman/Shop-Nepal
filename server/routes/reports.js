const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Get sales summary
router.get('/summary', authenticateToken, isAdmin, (req, res) => {
  const query = `
    SELECT 
      COUNT(*) as total_orders,
      SUM(total_amount) as total_sales,
      SUM(CASE WHEN order_status = 'Delivered' THEN total_amount ELSE 0 END) as completed_sales,
      SUM(CASE WHEN order_status = 'Pending' THEN 1 ELSE 0 END) as pending_orders,
      SUM(CASE WHEN order_status = 'Confirmed' THEN 1 ELSE 0 END) as confirmed_orders
    FROM orders
  `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch sales summary' });
    }
    res.json(results[0]);
  });
});

// Get daily sales
router.get('/daily', authenticateToken, isAdmin, (req, res) => {
  const { date } = req.query;
  
  let query = `
    SELECT 
      DATE(created_at) as sale_date,
      COUNT(*) as order_count,
      SUM(total_amount) as total_sales
    FROM orders
    WHERE DATE(created_at) = ?
    GROUP BY DATE(created_at)
  `;
  
  const params = [date || new Date().toISOString().split('T')[0]];

  db.query(query, params, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch daily sales' });
    }
    res.json(results[0] || { sale_date: params[0], order_count: 0, total_sales: 0 });
  });
});

// Get monthly sales
router.get('/monthly', authenticateToken, isAdmin, (req, res) => {
  const { month, year } = req.query;
  const currentDate = new Date();
  const targetMonth = month || currentDate.getMonth() + 1;
  const targetYear = year || currentDate.getFullYear();

  const query = `
    SELECT 
      DATE(created_at) as sale_date,
      COUNT(*) as order_count,
      SUM(total_amount) as total_sales
    FROM orders
    WHERE MONTH(created_at) = ? AND YEAR(created_at) = ?
    GROUP BY DATE(created_at)
    ORDER BY sale_date
  `;

  db.query(query, [targetMonth, targetYear], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch monthly sales' });
    }
    res.json(results);
  });
});

// Get top selling products
router.get('/top-products', authenticateToken, isAdmin, (req, res) => {
  const { limit } = req.query;
  const queryLimit = limit || 10;

  const query = `
    SELECT 
      p.product_id,
      p.product_name,
      SUM(oi.quantity) as total_sold,
      SUM(oi.quantity * oi.price) as total_revenue
    FROM order_items oi
    JOIN products p ON oi.product_id = p.product_id
    JOIN orders o ON oi.order_id = o.order_id
    WHERE o.order_status != 'Cancelled'
    GROUP BY p.product_id, p.product_name
    ORDER BY total_sold DESC
    LIMIT ?
  `;

  db.query(query, [queryLimit], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch top products' });
    }
    res.json(results);
  });
});

module.exports = router;
