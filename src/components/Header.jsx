// frontend/src/components/Header.jsx

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Header.css";
import logo from "../assets/logo.png";
import { useAuth } from "../context/AuthContext";


export default function Header() {
  const [bagCount, setBagCount] = useState(0);
  const { user, logout } = useAuth();
  const navigate = window.location && window.location.pathname ? null : null; // placeholder for useNavigate if needed

  // 🔁 Update bag count from localStorage
  const updateBagCount = () => {
    const bag = JSON.parse(localStorage.getItem("bag") || "[]");
    const count = bag.reduce(
      (sum, item) => sum + (item.quantity || 0),
      0
    );
    setBagCount(count);
  };

  useEffect(() => {
    updateBagCount();
    window.addEventListener("storage", updateBagCount);
    return () => window.removeEventListener("storage", updateBagCount);
  }, []);

  return (
    <header>
      <div className="rn-topbar">
        <div className="rn-logo-wrap">
          <Link to="/" className="rn-logo-link" style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textDecoration: 'none'}}>
            <img src={logo} alt="RR Nagar" className="rn-logo" />
            
            <div style={{marginTop: 0, color: '#111', fontSize: 16, fontFamily: 'Noto Sans Kannada, system-ui, sans-serif'}}>ತಾಜಾ, ತ್ವರಿತ, ತೃಪ್ತಿಕರ</div>
            <div style={{marginTop: 0, color: '#888', fontSize: 14, fontWeight: 500}}>Fresh. Fast. Fulfillment.</div>
          </Link>
        </div>
        <nav className="rn-nav">
          <Link className="rn-nav-item" to="/">Home</Link>
          <Link className="rn-nav-item" to="/blog">Blog</Link>
          {user ? (
            <>
              <Link className="rn-nav-item" to="/customer/dashboard">Dashboard</Link>
              <button
                className="rn-nav-item"
                onClick={() => {
                  logout();
                  window.location.href = "/";
                }}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Logout
              </button>
            </>
          ) : (
            <Link className="rn-nav-item" to="/login">Login</Link>
          )}
          <Link className="rn-nav-item cart-link" to="/bag">
            🛍️ Bag
            {bagCount > 0 && (
              <span className="cart-badge">{bagCount}</span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
