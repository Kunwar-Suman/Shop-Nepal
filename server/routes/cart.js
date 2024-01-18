const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// Get user's cart
router.get('/', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  
  const query = `
    SELECT c.cart_id, c.quantity, 
           p.product_id, p.product_name, p.price, p.image, p.stock_quantity
    FROM cart c
    JOIN products p ON c.product_id = p.product_id
    WHERE c.user_id = ?
  `;
  
  db.query(query, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch cart' });
    }
    res.json(results);
  });
});

// Add item to cart
router.post('/', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const { product_id, quantity } = req.body;

  if (!product_id || !quantity) {
    return res.status(400).json({ error: 'Product ID and quantity are required' });
  }

  // Check if product exists and has stock
  db.query('SELECT stock_quantity FROM products WHERE product_id = ?', [product_id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    if (results[0].stock_quantity < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    // Check if item already in cart
    db.query('SELECT * FROM cart WHERE user_id = ? AND product_id = ?', [userId, product_id], (err, cartResults) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (cartResults.length > 0) {
        // Update quantity
        const newQuantity = cartResults[0].quantity + quantity;
        db.query('UPDATE cart SET quantity = ? WHERE cart_id = ?', [newQuantity, cartResults[0].cart_id], (err) => {
          if (err) {
            return res.status(500).json({ error: 'Failed to update cart' });
          }
          res.json({ message: 'Cart updated successfully' });
        });
      } else {
        // Add new item
        db.query('INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)', 
          [userId, product_id, quantity], (err, result) => {
          if (err) {
            return res.status(500).json({ error: 'Failed to add to cart' });
          }
          res.status(201).json({ message: 'Item added to cart successfully' });
        });
      }
    });
  });
});

// Update cart item quantity
router.put('/:id', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const { id } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    return res.status(400).json({ error: 'Valid quantity is required' });
  }

  // Check ownership and get product info
  db.query('SELECT * FROM cart WHERE cart_id = ? AND user_id = ?', [id, userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    // Check stock
    db.query('SELECT stock_quantity FROM products WHERE product_id = ?', [results[0].product_id], (err, productResults) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (productResults[0].stock_quantity < quantity) {
        return res.status(400).json({ error: 'Insufficient stock' });
      }

      db.query('UPDATE cart SET quantity = ? WHERE cart_id = ?', [quantity, id], (err) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to update cart' });
        }
        res.json({ message: 'Cart updated successfully' });
      });
    });
  });
});

// Remove item from cart
router.delete('/:id', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const { id } = req.params;

  db.query('DELETE FROM cart WHERE cart_id = ? AND user_id = ?', [id, userId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to remove from cart' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }
    res.json({ message: 'Item removed from cart successfully' });
  });
});

// Clear cart
router.delete('/', authenticateToken, (req, res) => {
  const userId = req.user.userId;

  db.query('DELETE FROM cart WHERE user_id = ?', [userId], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to clear cart' });
    }
    res.json({ message: 'Cart cleared successfully' });
  });
});

module.exports = router;
