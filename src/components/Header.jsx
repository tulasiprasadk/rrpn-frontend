// frontend/src/components/Header.jsx

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Header.css";
import logo from "../assets/logo.png";
import { useAuth } from "../context/AuthContext";


export default function Header() {
  const [bagCount, setBagCount] = useState(0);
  const { user, logout } = useAuth();
  const [isSupplier, setIsSupplier] = useState(false);

  // Check if user is supplier
  useEffect(() => {
    const supplierToken = localStorage.getItem("supplierToken");
    setIsSupplier(!!supplierToken);
  }, []);

  // 🔁 Update bag count from localStorage
  const updateBagCount = () => {
    const bag = JSON.parse(localStorage.getItem("bag") || "[]");
    const count = bag.reduce(
      (sum, item) => sum + (item.quantity || item.qty || 0),
      0
    );
    setBagCount(count);
  };

  useEffect(() => {
    updateBagCount();
    // Listen to both storage events and custom cart-updated events
    window.addEventListener("storage", updateBagCount);
    window.addEventListener("cart-updated", updateBagCount);
    // Also poll periodically to catch updates from same tab
    const interval = setInterval(updateBagCount, 1000);
    return () => {
      window.removeEventListener("storage", updateBagCount);
      window.removeEventListener("cart-updated", updateBagCount);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    logout();
    // Clear supplier data if exists
    if (isSupplier) {
      localStorage.removeItem("supplierToken");
      localStorage.removeItem("supplierId");
      localStorage.removeItem("supplierData");
    }
    window.location.href = "/";
  };

  const isLoggedIn = user || isSupplier;
  const dashboardPath = isSupplier ? "/supplier/dashboard" : "/customer/dashboard";

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
          {isLoggedIn ? (
            <>
              <Link className="rn-nav-item" to={dashboardPath}>Dashboard</Link>
              <button
                className="rn-nav-item"
                onClick={handleLogout}
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



