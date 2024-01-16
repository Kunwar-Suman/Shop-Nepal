const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !password || (!email && !phone)) {
      return res.status(400).json({ error: 'Name, password, and email or phone are required' });
    }

    // Check if user exists
    const checkQuery = email 
      ? 'SELECT * FROM users WHERE email = ? OR phone = ?'
      : 'SELECT * FROM users WHERE phone = ?';
    
    const checkValues = email ? [email, phone] : [phone];
    
    db.query(checkQuery, checkValues, async (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (results.length > 0) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert user
      const insertQuery = 'INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)';
      db.query(insertQuery, [name, email || null, phone || null, hashedPassword], (err, result) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to register user' });
        }

        const token = jwt.sign(
          { userId: result.insertId, role: 'customer' },
          process.env.JWT_SECRET,
          { expiresIn: '7d' }
        );

        res.status(201).json({
          message: 'User registered successfully',
          token,
          user: {
            userId: result.insertId,
            name,
            email,
            phone,
            role: 'customer'
          }
        });
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
router.post('/login', (req, res) => {
  try {
    const { email, phone, password } = req.body;

    if (!password || (!email && !phone)) {
      return res.status(400).json({ error: 'Email or phone and password are required' });
    }

    const query = email 
      ? 'SELECT * FROM users WHERE email = ?'
      : 'SELECT * FROM users WHERE phone = ?';
    
    const values = email ? [email] : [phone];

    db.query(query, values, async (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (results.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const user = results[0];

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { userId: user.user_id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        message: 'Login successful',
        token,
        user: {
          userId: user.user_id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role
        }
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
