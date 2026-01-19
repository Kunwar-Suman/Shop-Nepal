import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAdmin } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <h2>Nep-Shop</h2>
        </Link>
        
        <div className="navbar-menu">
          <Link to="/products" className="navbar-link">Products</Link>
          
          {user ? (
            <>
              <Link to="/cart" className="navbar-link">Cart</Link>
              <Link to="/orders" className="navbar-link">My Orders</Link>
              {isAdmin() && (
                <Link to="/admin" className="navbar-link">Admin</Link>
              )}
              <span className="navbar-user">Hello, {user.name}</span>
              <button onClick={handleLogout} className="navbar-button">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-link">Login</Link>
              <Link to="/register" className="navbar-button">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
