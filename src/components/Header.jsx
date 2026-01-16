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
  const [menuOpen, setMenuOpen] = useState(false);

  const updateSupplierFlag = () => {
    const supplierToken = localStorage.getItem("supplierToken");
    setIsSupplier(!!supplierToken);
  };

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
    updateSupplierFlag();
    // Listen to both storage events and custom cart-updated events
    window.addEventListener("storage", updateBagCount);
    window.addEventListener("cart-updated", updateBagCount);
    window.addEventListener("storage", updateSupplierFlag);
    // Also poll periodically to catch updates from same tab
    const interval = setInterval(() => {
      updateBagCount();
      updateSupplierFlag();
    }, 1000);
    return () => {
      window.removeEventListener("storage", updateBagCount);
      window.removeEventListener("cart-updated", updateBagCount);
      window.removeEventListener("storage", updateSupplierFlag);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 600) setMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
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
          <button
            className="rn-menu-btn"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            ☰
          </button>
          <Link to="/" className="rn-logo-link" style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textDecoration: 'none'}}>
            <img src={logo} alt="RR Nagar" className="rn-logo" />
            
            <div style={{marginTop: 0, color: '#111', fontSize: 16, fontFamily: 'Noto Sans Kannada, system-ui, sans-serif'}}>ತಾಜಾ, ತ್ವರಿತ, ತೃಪ್ತಿಕರ</div>
            <div style={{marginTop: 0, color: '#888', fontSize: 14, fontWeight: 500}}>Fresh. Fast. Fulfillment.</div>
          </Link>
        </div>
        <nav className={`rn-nav ${menuOpen ? "open" : "closed"}`}>
          <Link className="rn-nav-item" to="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link className="rn-nav-item" to="/blog" onClick={() => setMenuOpen(false)}>Blog</Link>
          {isLoggedIn ? (
            <>
              <Link className="rn-nav-item" to={dashboardPath} onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <button
                className="rn-nav-item"
                onClick={handleLogout}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Logout
              </button>
            </>
          ) : (
            <Link className="rn-nav-item" to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
          )}
          <Link className="rn-nav-item cart-link" to="/bag" onClick={() => setMenuOpen(false)}>
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



