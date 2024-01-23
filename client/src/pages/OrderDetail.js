import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../config/api';
import './OrderDetail.css';

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchOrder = async () => {
    try {
      const response = await api.get(`/orders/${id}`);
      setOrder(response.data);
    } catch (error) {
      console.error('Failed to fetch order:', error);
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
    return <div className="loading">Loading order details...</div>;
  }

  if (!order) {
    return <div className="error">Order not found</div>;
  }

  return (
    <div className="order-detail-container">
      <h1>Order Details</h1>
      
      <div className="order-detail-card">
        <div className="order-header-section">
          <div>
            <h2>Order #{order.order_id}</h2>
            <p className="order-date">
              Placed on {new Date(order.created_at).toLocaleString()}
            </p>
          </div>
          <span
            className="order-status-badge"
            style={{ backgroundColor: getStatusColor(order.order_status) }}
          >
            {order.order_status}
          </span>
        </div>

        <div className="order-items-section">
          <h3>Order Items</h3>
          <div className="items-list">
            {order.items && order.items.map((item, index) => (
              <div key={index} className="order-item-row">
                <div className="item-info">
                  {item.image && (
                    <img 
                      src={item.image.startsWith('http') ? item.image : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${item.image}`} 
                      alt={item.product_name} 
                      className="item-thumbnail"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                  <div>
                    <h4>{item.product_name}</h4>
                    <p>Quantity: {item.quantity}</p>
                  </div>
                </div>
                <p className="item-price">NPR {item.price * item.quantity}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="order-summary-section">
          <div className="summary-row">
            <span>Subtotal:</span>
            <span>NPR {order.total_amount}</span>
          </div>
          <div className="summary-row total">
            <span>Total:</span>
            <span>NPR {order.total_amount}</span>
          </div>
        </div>

        <div className="delivery-info-section">
          <h3>Delivery Information</h3>
          <p><strong>Address:</strong> {order.delivery_address}</p>
          <p><strong>Phone:</strong> {order.phone}</p>
          <p><strong>Payment Method:</strong> {order.payment_method}</p>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
