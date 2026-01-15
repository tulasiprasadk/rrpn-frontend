// frontend/src/pages/Login.jsx

import { useState, useEffect } from "react";
import { API_BASE } from "../config/api";
import api from "../api/client";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [googleAvailable, setGoogleAvailable] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const timeoutId = setTimeout(() => {
      if (mounted) {
        console.warn('Auth status check timed out after 5 seconds');
        setGoogleAvailable(false);
      }
    }, 5000); // 5 second timeout

    (async () => {
      try {
        const res = await api.get('/auth/status', { timeout: 5000 });
        clearTimeout(timeoutId);
        if (!mounted) return;
        console.log('Auth status response:', res.data);
        setGoogleAvailable(!!res.data?.googleConfigured);
      } catch (err) {
        clearTimeout(timeoutId);
        console.error('Error checking auth status:', err);
        if (mounted) setGoogleAvailable(false);
      }
    })();
    return () => { 
      clearTimeout(timeoutId);
      mounted = false; 
    };
  }, []);

  const redirectToGoogle = () => {
    if (googleAvailable) {
      setLoading(true);
      window.location.href = `${API_BASE}/customers/auth/google`;
    } else {
      alert("Google login is not available. Please try again later.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Left Side - Login Form */}
        <div className="login-form-container">
          <div className="login-brand">
            <img src="/images/rrlogo.png" alt="RR Nagar Logo" className="login-logo" />
            <h1 className="login-title">Welcome Back</h1>
            <p className="login-subtitle">Sign in to continue to RR Nagar</p>
          </div>

          <div className="login-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email address</label>
              <input
                id="email"
                type="email"
                value={email}
                placeholder="you@company.com"
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                onKeyPress={(e) => e.key === 'Enter' && redirectToGoogle()}
                disabled={loading}
              />
            </div>

            <button
              onClick={redirectToGoogle}
              disabled={loading || !googleAvailable}
              className="login-button primary"
            >
              {loading ? 'Processing...' : 'Login with Email'}
            </button>

            <div className="login-divider">
              <span>or</span>
            </div>

            {googleAvailable ? (
              <button
                onClick={redirectToGoogle}
                className="login-button google"
                disabled={loading}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span>Sign in with Google</span>
              </button>
            ) : (
              <div className="login-warning">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p>Google OAuth is not configured. Contact administrator.</p>
              </div>
            )}

            <div className="login-footer">
              <p>By continuing, you agree to our <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>.</p>
            </div>
          </div>
        </div>

        {/* Right Side - Promotional Content */}
        <div className="login-promo-container">
          <div className="promo-card special-offer">
            <div className="promo-icon">🎉</div>
            <h3>Special Offer</h3>
            <p>New users get <strong>10% off</strong> your first order</p>
            <div className="promo-code">Use code: <span>WELCOME10</span></div>
          </div>

          <div className="promo-card featured-partner">
            <a href="https://motardgears.com" target="_blank" rel="noreferrer" className="promo-link">
              <img src="/motard.svg" alt="Motard Gears" className="partner-logo" />
              <h4>Motard Gears</h4>
              <p>Premium motor accessories</p>
            </a>
          </div>

          <div className="promo-card benefits">
            <h4>Why shop with us?</h4>
            <ul className="benefits-list">
              <li>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#28a745" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span>Fast local delivery</span>
              </li>
              <li>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#28a745" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span>Trusted sellers</span>
              </li>
              <li>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#28a745" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span>Secure payments</span>
              </li>
              <li>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#28a745" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span>24/7 customer support</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
