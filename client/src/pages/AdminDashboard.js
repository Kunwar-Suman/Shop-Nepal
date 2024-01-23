import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../config/api';
import ProductForm from '../components/ProductForm';
import CategoryForm from '../components/CategoryForm';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user, isAdmin } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [summary, setSummary] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);

  useEffect(() => {
    if (!user || !isAdmin()) {
      navigate('/');
      return;
    }
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, activeTab]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'dashboard') {
        const response = await api.get('/reports/summary');
        setSummary(response.data);
      } else if (activeTab === 'orders') {
        const response = await api.get('/orders');
        setOrders(response.data);
      } else if (activeTab === 'products') {
        const [productsRes, categoriesRes] = await Promise.all([
          api.get('/products'),
          api.get('/categories')
        ]);
        setProducts(productsRes.data);
        setCategories(categoriesRes.data);
      } else if (activeTab === 'categories') {
        const response = await api.get('/categories');
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { order_status: newStatus });
      fetchDashboardData();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to update order status');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${productId}`);
        fetchDashboardData();
      } catch (error) {
        alert(error.response?.data?.error || 'Failed to delete product');
      }
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category? Products in this category will become uncategorized.')) {
      try {
        await api.delete(`/categories/${categoryId}`);
        fetchDashboardData();
      } catch (error) {
        alert(error.response?.data?.error || 'Failed to delete category');
      }
    }
  };

  const handleProductSuccess = () => {
    fetchDashboardData();
  };

  const handleCategorySuccess = () => {
    fetchDashboardData();
  };

  if (!user || !isAdmin()) {
    return null;
  }

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      
      <div className="admin-tabs">
        <button
          className={activeTab === 'dashboard' ? 'active' : ''}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button
          className={activeTab === 'orders' ? 'active' : ''}
          onClick={() => setActiveTab('orders')}
        >
          Orders
        </button>
        <button
          className={activeTab === 'products' ? 'active' : ''}
          onClick={() => setActiveTab('products')}
        >
          Products
        </button>
        <button
          className={activeTab === 'categories' ? 'active' : ''}
          onClick={() => setActiveTab('categories')}
        >
          Categories
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'dashboard' && (
          <div className="dashboard-summary">
            {loading ? (
              <div className="loading">Loading...</div>
            ) : summary ? (
              <>
                <div className="summary-card">
                  <h3>Total Orders</h3>
                  <p className="summary-value">{summary.total_orders || 0}</p>
                </div>
                <div className="summary-card">
                  <h3>Total Sales</h3>
                  <p className="summary-value">NPR {summary.total_sales || 0}</p>
                </div>
                <div className="summary-card">
                  <h3>Completed Sales</h3>
                  <p className="summary-value">NPR {summary.completed_sales || 0}</p>
                </div>
                <div className="summary-card">
                  <h3>Pending Orders</h3>
                  <p className="summary-value">{summary.pending_orders || 0}</p>
                </div>
              </>
            ) : null}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="admin-orders">
            {loading ? (
              <div className="loading">Loading orders...</div>
            ) : orders.length === 0 ? (
              <div className="no-data">No orders found</div>
            ) : (
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.order_id}>
                      <td>#{order.order_id}</td>
                      <td>{order.customer_name}</td>
                      <td>NPR {order.total_amount}</td>
                      <td>
                        <select
                          value={order.order_status}
                          onChange={(e) => updateOrderStatus(order.order_id, e.target.value)}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td>{new Date(order.created_at).toLocaleDateString()}</td>
                      <td>
                        <button onClick={() => navigate(`/orders/${order.order_id}`)}>
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'products' && (
          <div className="admin-products">
            <div className="admin-header-actions">
              <button
                className="btn-add"
                onClick={() => {
                  setEditingProduct(null);
                  setShowProductForm(true);
                }}
              >
                + Add Product
              </button>
            </div>
            {loading ? (
              <div className="loading">Loading products...</div>
            ) : products.length === 0 ? (
              <div className="no-data">No products found</div>
            ) : (
              <div className="products-list">
                {products.map(product => (
                  <div key={product.product_id} className="product-admin-card">
                    {product.image && (
                      <img
                        src={product.image.startsWith('http') ? product.image : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${product.image}`}
                        alt={product.product_name}
                        className="product-admin-image"
                      />
                    )}
                    <div className="product-admin-info">
                      <h3>{product.product_name}</h3>
                      <p><strong>Price:</strong> NPR {product.price}</p>
                      <p><strong>Stock:</strong> {product.stock_quantity}</p>
                      <p><strong>Category:</strong> {product.category_name || 'Uncategorized'}</p>
                      <p><strong>Status:</strong> <span className={`status-badge ${product.status}`}>{product.status}</span></p>
                    </div>
                    <div className="product-admin-actions">
                      <button
                        className="btn-edit"
                        onClick={() => {
                          setEditingProduct(product);
                          setShowProductForm(true);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDeleteProduct(product.product_id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="admin-categories">
            <div className="admin-header-actions">
              <button
                className="btn-add"
                onClick={() => {
                  setEditingCategory(null);
                  setShowCategoryForm(true);
                }}
              >
                + Add Category
              </button>
            </div>
            {loading ? (
              <div className="loading">Loading categories...</div>
            ) : categories.length === 0 ? (
              <div className="no-data">No categories found</div>
            ) : (
              <div className="categories-list">
                {categories.map(category => (
                  <div key={category.category_id} className="category-admin-card">
                    <h3>{category.category_name}</h3>
                    <p>Created: {new Date(category.created_at).toLocaleDateString()}</p>
                    <div className="category-admin-actions">
                      <button
                        className="btn-edit"
                        onClick={() => {
                          setEditingCategory(category);
                          setShowCategoryForm(true);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDeleteCategory(category.category_id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {showProductForm && (
        <ProductForm
          product={editingProduct}
          onClose={() => {
            setShowProductForm(false);
            setEditingProduct(null);
          }}
          onSuccess={handleProductSuccess}
        />
      )}

      {showCategoryForm && (
        <CategoryForm
          category={editingCategory}
          onClose={() => {
            setShowCategoryForm(false);
            setEditingCategory(null);
          }}
          onSuccess={handleCategorySuccess}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
