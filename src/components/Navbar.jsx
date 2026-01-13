
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";
import logo from "../assets/logo.png";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="navbar-wrapper">

      <div className="navbar-top" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <img src={logo} alt="RR Nagar Logo" className="nav-logo" />
        <div style={{ marginTop: 4, marginLeft: 8 }}>
          <span style={{ color: '#111', fontWeight: 700, fontSize: 18, letterSpacing: 1 }}>
            ತಾಜಾ, ತ್ವರಿತ, ತೃಪ್ತಿಕರ
          </span>
        </div>
        <div style={{ marginTop: 0, marginLeft: 8 }}>
          <span style={{ color: '#888', fontWeight: 500, fontSize: 15, letterSpacing: 1 }}>
            Fresh. Fast. Fulfillment.
          </span>
        </div>
      </div>

      <div className="navbar-bottom">
        <div className="nav-text">RR ನಗರದ ಹತ್ತಿರದ ಡಿಜಿಟಲ್ ಪ್ಲಾಟ್‌ಫಾರ್ಮ್</div>

        <nav className="nav-links">
          {!loading && (
            user ? (
              <>
                <Link to="/customer/dashboard">
                  <span className="user-name">👤 {user.name || user.mobile || "User"}</span>
                </Link>
                <button onClick={handleLogout} className="logout-btn">
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login">Login / Register</Link>
            )
          )}
          <Link to="/blog">Blog</Link>
          <Link to="/faq">FAQs</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/help">Help</Link>
          <Link to="/bag">Bag</Link>
        </nav>
      </div>
    </header>
  );
}



