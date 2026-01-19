import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../config/api';
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

  useEffect(() => {
    if (!user || !isAdmin()) {
      navigate('/');
      return;
    }
    fetchDashboardData();
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
          api.get('/products?status=active'),
          api.get('/categories')
        ]);
        setProducts(productsRes.data);
        setCategories(categoriesRes.data);
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
            {loading ? (
              <div className="loading">Loading products...</div>
            ) : (
              <div className="products-list">
                {products.map(product => (
                  <div key={product.product_id} className="product-admin-card">
                    <h3>{product.product_name}</h3>
                    <p>Price: NPR {product.price}</p>
                    <p>Stock: {product.stock_quantity}</p>
                    <p>Category: {product.category_name || 'Uncategorized'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
