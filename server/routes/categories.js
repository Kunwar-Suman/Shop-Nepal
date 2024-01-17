const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Get all categories
router.get('/', (req, res) => {
  const query = 'SELECT * FROM categories ORDER BY category_name';
  
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch categories' });
    }
    res.json(results);
  });
});

// Get single category
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM categories WHERE category_id = ?';
  
  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch category' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(results[0]);
  });
});

// Create category (Admin only)
router.post('/', authenticateToken, isAdmin, (req, res) => {
  const { category_name } = req.body;

  if (!category_name) {
    return res.status(400).json({ error: 'Category name is required' });
  }

  const query = 'INSERT INTO categories (category_name) VALUES (?)';
  
  db.query(query, [category_name], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'Category already exists' });
      }
      return res.status(500).json({ error: 'Failed to create category' });
    }
    res.status(201).json({
      message: 'Category created successfully',
      category_id: result.insertId,
      category_name
    });
  });
});

// Update category (Admin only)
router.put('/:id', authenticateToken, isAdmin, (req, res) => {
  const { id } = req.params;
  const { category_name } = req.body;

  if (!category_name) {
    return res.status(400).json({ error: 'Category name is required' });
  }

  const query = 'UPDATE categories SET category_name = ? WHERE category_id = ?';
  
  db.query(query, [category_name, id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to update category' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json({ message: 'Category updated successfully' });
  });
});

// Delete category (Admin only)
router.delete('/:id', authenticateToken, isAdmin, (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM categories WHERE category_id = ?';
  
  db.query(query, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete category' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json({ message: 'Category deleted successfully' });
  });
});

module.exports = router;
