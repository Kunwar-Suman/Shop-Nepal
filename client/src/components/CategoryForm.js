import React, { useState } from 'react';
import api from '../config/api';
import './CategoryForm.css';

const CategoryForm = ({ category, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    category_name: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (category) {
      setFormData({
        category_name: category.category_name || ''
      });
    }
  }, [category]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (category) {
        await api.put(`/categories/${category.category_id}`, formData);
      } else {
        await api.post('/categories', formData);
      }

      onSuccess();
      onClose();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="category-form-overlay" onClick={onClose}>
      <div className="category-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="category-form-header">
          <h2>{category ? 'Edit Category' : 'Add New Category'}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="category-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label>Category Name *</label>
            <input
              type="text"
              name="category_name"
              value={formData.category_name}
              onChange={handleChange}
              required
              placeholder="e.g., Electronics, Clothing, Food"
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Saving...' : category ? 'Update Category' : 'Add Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryForm;
