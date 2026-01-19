import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>Welcome to Nep-Shop</h1>
        <p>Your Local Nepali E-Commerce Platform</p>
        <Link to="/products" className="cta-button">
          Shop Now
        </Link>
      </div>
      
      <div className="features-section">
        <h2>Why Choose Nep-Shop?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Local Products</h3>
            <p>Support local Nepali businesses</p>
          </div>
          <div className="feature-card">
            <h3>Easy Ordering</h3>
            <p>Simple and fast checkout process</p>
          </div>
          <div className="feature-card">
            <h3>Cash on Delivery</h3>
            <p>Pay when you receive your order</p>
          </div>
          <div className="feature-card">
            <h3>Fast Delivery</h3>
            <p>Quick delivery to your doorstep</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
