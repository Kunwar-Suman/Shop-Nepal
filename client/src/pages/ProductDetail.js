import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../config/api';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/products/${id}`);
      setProduct(response.data);
    } catch (error) {
      console.error('Failed to fetch product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await api.post('/cart', {
        product_id: product.product_id,
        quantity: quantity
      });
      setMessage('Product added to cart successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to add to cart');
    }
  };

  if (loading) {
    return <div className="loading">Loading product...</div>;
  }

  if (!product) {
    return <div className="error">Product not found</div>;
  }

  return (
    <div className="product-detail-container">
      <div className="product-detail">
        <div className="product-image-section">
          {product.image ? (
            <img 
              src={product.image.startsWith('http') ? product.image : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${product.image}`} 
              alt={product.product_name}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div className="placeholder-image-large" style={{ display: product.image ? 'none' : 'flex' }}>
            No Image Available
          </div>
        </div>
        
        <div className="product-details-section">
          <h1>{product.product_name}</h1>
          <p className="category">Category: {product.category_name || 'Uncategorized'}</p>
          <p className="price">NPR {product.price}</p>
          
          <div className="stock-info">
            <span className={product.stock_quantity > 0 ? 'in-stock' : 'out-of-stock'}>
              {product.stock_quantity > 0 ? `In Stock (${product.stock_quantity} available)` : 'Out of Stock'}
            </span>
          </div>

          {product.description && (
            <div className="description">
              <h3>Description</h3>
              <p>{product.description}</p>
            </div>
          )}

          {product.stock_quantity > 0 && (
            <div className="add-to-cart-section">
              <div className="quantity-selector">
                <label>Quantity:</label>
                <input
                  type="number"
                  min="1"
                  max={product.stock_quantity}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                />
              </div>
              
              {message && (
                <div className={message.includes('success') ? 'success-message' : 'error-message'}>
                  {message}
                </div>
              )}

              <button onClick={handleAddToCart} className="add-to-cart-button">
                Add to Cart
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
