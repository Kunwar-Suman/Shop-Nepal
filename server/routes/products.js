const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const upload = require('../config/upload');

// Get all products with filters
router.get('/', (req, res) => {
  const { category_id, search, min_price, max_price, status } = req.query;
  
  let query = `
    SELECT p.*, c.category_name 
    FROM products p 
    LEFT JOIN categories c ON p.category_id = c.category_id 
    WHERE 1=1
  `;
  const params = [];

  if (category_id) {
    query += ' AND p.category_id = ?';
    params.push(category_id);
  }

  if (search) {
    query += ' AND (p.product_name LIKE ? OR p.description LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm);
  }

  if (min_price) {
    query += ' AND p.price >= ?';
    params.push(min_price);
  }

  if (max_price) {
    query += ' AND p.price <= ?';
    params.push(max_price);
  }

  if (status) {
    query += ' AND p.status = ?';
    params.push(status);
  } else {
    query += ' AND p.status = "active"';
  }

  query += ' ORDER BY p.created_at DESC';

  db.query(query, params, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch products' });
    }
    res.json(results);
  });
});

// Get single product
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT p.*, c.category_name 
    FROM products p 
    LEFT JOIN categories c ON p.category_id = c.category_id 
    WHERE p.product_id = ?
  `;
  
  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch product' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(results[0]);
  });
});

// Create product (Admin only) - with image upload
router.post('/', authenticateToken, isAdmin, upload.single('image'), (req, res) => {
  const { category_id, product_name, price, stock_quantity, description, status } = req.body;
  const imagePath = req.file ? `/uploads/products/${req.file.filename}` : null;

  if (!product_name || !price) {
    return res.status(400).json({ error: 'Product name and price are required' });
  }

  const query = `
    INSERT INTO products (category_id, product_name, price, stock_quantity, description, image, status) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  
  const values = [
    category_id || null,
    product_name,
    price,
    stock_quantity || 0,
    description || null,
    imagePath,
    status || 'active'
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to create product' });
    }
    res.status(201).json({
      message: 'Product created successfully',
      product_id: result.insertId,
      image: imagePath
    });
  });
});

// Update product (Admin only) - with optional image upload
router.put('/:id', authenticateToken, isAdmin, upload.single('image'), (req, res) => {
  const { id } = req.params;
  const { category_id, product_name, price, stock_quantity, description, status } = req.body;
  
  // If new image uploaded, use it; otherwise keep existing or use provided URL
  let imagePath = req.body.image; // Default to provided image URL
  
  if (req.file) {
    imagePath = `/uploads/products/${req.file.filename}`;
  }

  const query = `
    UPDATE products 
    SET category_id = ?, product_name = ?, price = ?, stock_quantity = ?, 
        description = ?, image = ?, status = ?
    WHERE product_id = ?
  `;
  
  const values = [
    category_id || null,
    product_name,
    price,
    stock_quantity,
    description || null,
    imagePath,
    status || 'active',
    id
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to update product' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product updated successfully', image: imagePath });
  });
});

// Delete product (Admin only)
router.delete('/:id', authenticateToken, isAdmin, (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM products WHERE product_id = ?';
  
  db.query(query, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete product' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  });
});

module.exports = router;
