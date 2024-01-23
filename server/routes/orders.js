const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Create order (Checkout)
router.post('/', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const { delivery_address, phone, payment_method } = req.body;

  if (!delivery_address || !phone || !payment_method) {
    return res.status(400).json({ error: 'Delivery address, phone, and payment method are required' });
  }

  // Get cart items
  db.query(`
    SELECT c.product_id, c.quantity, p.price, p.product_name, p.stock_quantity
    FROM cart c
    JOIN products p ON c.product_id = p.product_id
    WHERE c.user_id = ?
  `, [userId], async (err, cartItems) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch cart' });
    }

    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Check stock and calculate total
    let totalAmount = 0;
    for (const item of cartItems) {
      if (item.stock_quantity < item.quantity) {
        return res.status(400).json({ 
          error: `Insufficient stock for ${item.product_name}` 
        });
      }
      totalAmount += item.price * item.quantity;
    }

    // Start transaction
    db.beginTransaction((err) => {
      if (err) {
        return res.status(500).json({ error: 'Transaction failed' });
      }

      // Create order
      const orderQuery = `
        INSERT INTO orders (user_id, total_amount, payment_method, delivery_address, phone)
        VALUES (?, ?, ?, ?, ?)
      `;
      
      db.query(orderQuery, [userId, totalAmount, payment_method, delivery_address, phone], (err, orderResult) => {
        if (err) {
          return db.rollback(() => {
            res.status(500).json({ error: 'Failed to create order' });
          });
        }

        const orderId = orderResult.insertId;
        const orderItems = cartItems.map(item => [
          orderId,
          item.product_id,
          item.quantity,
          item.price
        ]);

        // Insert order items
        const orderItemsQuery = `
          INSERT INTO order_items (order_id, product_id, quantity, price)
          VALUES ?
        `;
        
        db.query(orderItemsQuery, [orderItems], (err) => {
          if (err) {
            return db.rollback(() => {
              res.status(500).json({ error: 'Failed to create order items' });
            });
          }

          // Update stock
          const updatePromises = cartItems.map(item => {
            return new Promise((resolve, reject) => {
              db.query(
                'UPDATE products SET stock_quantity = stock_quantity - ? WHERE product_id = ?',
                [item.quantity, item.product_id],
                (err) => err ? reject(err) : resolve()
              );
            });
          });

          Promise.all(updatePromises).then(() => {
            // Clear cart
            db.query('DELETE FROM cart WHERE user_id = ?', [userId], (err) => {
              if (err) {
                return db.rollback(() => {
                  res.status(500).json({ error: 'Failed to clear cart' });
                });
              }

              db.commit((err) => {
                if (err) {
                  return db.rollback(() => {
                    res.status(500).json({ error: 'Failed to commit order' });
                  });
                }

                res.status(201).json({
                  message: 'Order placed successfully',
                  order_id: orderId,
                  total_amount: totalAmount
                });
              });
            });
          }).catch((err) => {
            db.rollback(() => {
              res.status(500).json({ error: 'Failed to update stock' });
            });
          });
        });
      });
    });
  });
});

// Get user's orders
router.get('/my-orders', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  
  const query = `
    SELECT o.*, 
           GROUP_CONCAT(
             CONCAT(oi.quantity, 'x ', p.product_name) 
             SEPARATOR ', '
           ) as items
    FROM orders o
    LEFT JOIN order_items oi ON o.order_id = oi.order_id
    LEFT JOIN products p ON oi.product_id = p.product_id
    WHERE o.user_id = ?
    GROUP BY o.order_id
    ORDER BY o.created_at DESC
  `;
  
  db.query(query, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch orders' });
    }
    res.json(results);
  });
});

// Get all orders (Admin only) - Must come before /:id route
router.get('/', authenticateToken, isAdmin, (req, res) => {
  const { status } = req.query;
  
  let query = `
    SELECT o.*, u.name as customer_name, u.phone as customer_phone
    FROM orders o
    JOIN users u ON o.user_id = u.user_id
    WHERE 1=1
  `;
  const params = [];

  if (status) {
    query += ' AND o.order_status = ?';
    params.push(status);
  }

  query += ' ORDER BY o.created_at DESC';

  db.query(query, params, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch orders' });
    }
    res.json(results);
  });
});

// Get single order - Must come after /my-orders and / routes
router.get('/:id', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const { id } = req.params;
  const isAdminUser = req.user.role === 'admin';

  let query = `
    SELECT o.*, 
           oi.order_item_id, oi.product_id, oi.quantity, oi.price,
           p.product_name, p.image
    FROM orders o
    LEFT JOIN order_items oi ON o.order_id = oi.order_id
    LEFT JOIN products p ON oi.product_id = p.product_id
    WHERE o.order_id = ?
  `;
  
  const params = [id];
  
  if (!isAdminUser) {
    query += ' AND o.user_id = ?';
    params.push(userId);
  }

  db.query(query, params, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch order' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Format response
    const order = {
      order_id: results[0].order_id,
      user_id: results[0].user_id,
      total_amount: results[0].total_amount,
      payment_method: results[0].payment_method,
      order_status: results[0].order_status,
      delivery_address: results[0].delivery_address,
      phone: results[0].phone,
      created_at: results[0].created_at,
      items: results.map(row => ({
        product_id: row.product_id,
        product_name: row.product_name,
        quantity: row.quantity,
        price: row.price,
        image: row.image
      }))
    };
    
    res.json(order);
  });
});

// Update order status (Admin only)
router.put('/:id/status', authenticateToken, isAdmin, (req, res) => {
  const { id } = req.params;
  const { order_status } = req.body;

  const validStatuses = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];
  if (!order_status || !validStatuses.includes(order_status)) {
    return res.status(400).json({ error: 'Valid order status is required' });
  }

  const query = 'UPDATE orders SET order_status = ? WHERE order_id = ?';
  
  db.query(query, [order_status, id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to update order status' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({ message: 'Order status updated successfully' });
  });
});

module.exports = router;
