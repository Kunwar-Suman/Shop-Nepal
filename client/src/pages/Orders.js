import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../config/api';
import './Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders/my-orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered':
        return '#27ae60';
      case 'Shipped':
        return '#3498db';
      case 'Confirmed':
        return '#f39c12';
      case 'Cancelled':
        return '#e74c3c';
      default:
        return '#95a5a6';
    }
  };

  if (loading) {
    return <div className="loading">Loading orders...</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="orders-container">
        <h1>My Orders</h1>
        <div className="no-orders">
          <p>You haven't placed any orders yet</p>
          <Link to="/products" className="shop-button">Start Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-container">
      <h1>My Orders</h1>
      
      <div className="orders-list">
        {orders.map(order => (
          <Link
            key={order.order_id}
            to={`/orders/${order.order_id}`}
            className="order-card"
          >
            <div className="order-header">
              <div>
                <h3>Order #{order.order_id}</h3>
                <p className="order-date">
                  {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
              <span
                className="order-status"
                style={{ backgroundColor: getStatusColor(order.order_status) }}
              >
                {order.order_status}
              </span>
            </div>
            
            <div className="order-info">
              <p><strong>Items:</strong> {order.items || 'N/A'}</p>
              <p><strong>Total:</strong> NPR {order.total_amount}</p>
              <p><strong>Payment:</strong> {order.payment_method}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Orders;
