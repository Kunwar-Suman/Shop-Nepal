import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../config/api';
import './Checkout.css';

const Checkout = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [formData, setFormData] = useState({
    delivery_address: '',
    phone: '',
    payment_method: 'COD'
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchCart();
    setFormData(prev => ({
      ...prev,
      phone: user.phone || ''
    }));
  }, [user]);

  const fetchCart = async () => {
    try {
      const response = await api.get('/cart');
      setCartItems(response.data);
      if (response.data.length === 0) {
        navigate('/cart');
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await api.post('/orders', formData);
      navigate(`/orders/${response.data.order_id}`);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="checkout-container">
      <h1>Checkout</h1>
      
      <div className="checkout-content">
        <form onSubmit={handleSubmit} className="checkout-form">
          <h2>Delivery Information</h2>
          
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              value={user.name}
              disabled
              className="disabled-input"
            />
          </div>

          <div className="form-group">
            <label>Phone Number *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="98XXXXXXXX"
            />
          </div>

          <div className="form-group">
            <label>Delivery Address *</label>
            <textarea
              name="delivery_address"
              value={formData.delivery_address}
              onChange={handleChange}
              required
              rows="3"
              placeholder="Enter your complete delivery address"
            />
          </div>

          <h2>Payment Method</h2>
          
          <div className="payment-options">
            <label className="payment-option">
              <input
                type="radio"
                name="payment_method"
                value="COD"
                checked={formData.payment_method === 'COD'}
                onChange={handleChange}
              />
              <span>Cash on Delivery (COD)</span>
            </label>
            
            <label className="payment-option">
              <input
                type="radio"
                name="payment_method"
                value="esewa"
                checked={formData.payment_method === 'esewa'}
                onChange={handleChange}
              />
              <span>eSewa (Coming Soon)</span>
            </label>
            
            <label className="payment-option">
              <input
                type="radio"
                name="payment_method"
                value="khalti"
                checked={formData.payment_method === 'khalti'}
                onChange={handleChange}
              />
              <span>Khalti (Coming Soon)</span>
            </label>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="place-order-button" disabled={submitting}>
            {submitting ? 'Placing Order...' : `Place Order (NPR ${calculateTotal()})`}
          </button>
        </form>

        <div className="order-summary">
          <h2>Order Summary</h2>
          <div className="order-items">
            {cartItems.map(item => (
              <div key={item.cart_id} className="order-item">
                <span>{item.product_name} x {item.quantity}</span>
                <span>NPR {item.price * item.quantity}</span>
              </div>
            ))}
          </div>
          <div className="order-total">
            <span>Total:</span>
            <span>NPR {calculateTotal()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
