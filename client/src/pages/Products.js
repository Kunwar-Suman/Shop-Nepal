import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../config/api';
import './Products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    category_id: '',
    min_price: '',
    max_price: ''
  });

  useEffect(() => {
    fetchCategories();
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.category_id) params.append('category_id', filters.category_id);
      if (filters.min_price) params.append('min_price', filters.min_price);
      if (filters.max_price) params.append('max_price', filters.max_price);

      const response = await api.get(`/products?${params.toString()}`);
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="products-container">
      <h1>Our Products</h1>
      
      <div className="filters-section">
        <input
          type="text"
          name="search"
          placeholder="Search products..."
          value={filters.search}
          onChange={handleFilterChange}
          className="search-input"
        />
        
        <select
          name="category_id"
          value={filters.category_id}
          onChange={handleFilterChange}
          className="filter-select"
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat.category_id} value={cat.category_id}>
              {cat.category_name}
            </option>
          ))}
        </select>

        <input
          type="number"
          name="min_price"
          placeholder="Min Price (NPR)"
          value={filters.min_price}
          onChange={handleFilterChange}
          className="price-input"
        />

        <input
          type="number"
          name="max_price"
          placeholder="Max Price (NPR)"
          value={filters.max_price}
          onChange={handleFilterChange}
          className="price-input"
        />
      </div>

      {loading ? (
        <div className="loading">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="no-products">No products found</div>
      ) : (
        <div className="products-grid">
          {products.map(product => (
            <div key={product.product_id} className="product-card">
              <div className="product-image">
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
                <div className="placeholder-image" style={{ display: product.image ? 'none' : 'flex' }}>
                  No Image
                </div>
              </div>
              <div className="product-info">
                <h3>{product.product_name}</h3>
                <p className="product-category">{product.category_name || 'Uncategorized'}</p>
                <p className="product-price">NPR {product.price}</p>
                <p className="product-stock">
                  Stock: {product.stock_quantity > 0 ? `${product.stock_quantity} available` : 'Out of stock'}
                </p>
                <Link to={`/products/${product.product_id}`} className="view-button">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;
