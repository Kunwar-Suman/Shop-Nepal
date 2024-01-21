import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../config/api';
import './Cart.css';

const Cart = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchCart();
  }, [user]);

  const fetchCart = async () => {
    try {
      const response = await api.get('/cart');
      setCartItems(response.data);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cartId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setUpdating(cartId);
    try {
      await api.put(`/cart/${cartId}`, { quantity: newQuantity });
      fetchCart();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to update quantity');
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (cartId) => {
    if (window.confirm('Remove this item from cart?')) {
      try {
        await api.delete(`/cart/${cartId}`);
        fetchCart();
      } catch (error) {
        alert(error.response?.data?.error || 'Failed to remove item');
      }
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  if (loading) {
    return <div className="loading">Loading cart...</div>;
  }

  if (cartItems.length === 0) {
    return (
      <div className="cart-container">
        <h1>Your Cart</h1>
        <div className="empty-cart">
          <p>Your cart is empty</p>
          <Link to="/products" className="shop-button">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h1>Your Cart</h1>
      
      <div className="cart-content">
        <div className="cart-items">
          {cartItems.map(item => (
            <div key={item.cart_id} className="cart-item">
              <div className="item-image">
                {item.image ? (
                  <img src={item.image} alt={item.product_name} />
                ) : (
                  <div className="placeholder">No Image</div>
                )}
              </div>
              
              <div className="item-details">
                <h3>{item.product_name}</h3>
                <p className="item-price">NPR {item.price} each</p>
                
                <div className="item-actions">
                  <div className="quantity-controls">
                    <button
                      onClick={() => updateQuantity(item.cart_id, item.quantity - 1)}
                      disabled={updating === item.cart_id || item.quantity <= 1}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.cart_id, item.quantity + 1)}
                      disabled={updating === item.cart_id || item.quantity >= item.stock_quantity}
                    >
                      +
                    </button>
                  </div>
                  
                  <button
                    onClick={() => removeItem(item.cart_id)}
                    className="remove-button"
                  >
                    Remove
                  </button>
                </div>
              </div>
              
              <div className="item-total">
                <p>NPR {item.price * item.quantity}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h2>Order Summary</h2>
          <div className="summary-row">
            <span>Subtotal:</span>
            <span>NPR {calculateTotal()}</span>
          </div>
          <div className="summary-row total">
            <span>Total:</span>
            <span>NPR {calculateTotal()}</span>
          </div>
          <Link to="/checkout" className="checkout-button">
            Proceed to Checkout
          </Link>
          <Link to="/products" className="continue-shopping">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;
