// frontend/src/pages/Login.jsx

import { useState, useEffect } from "react";
import api from "../api/client";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");

  useEffect(() => {
    const existingToken = localStorage.getItem("token");
    if (existingToken) {
      window.location.href = "/customer/dashboard";
      return;
    }

    // Optional: Check backend health (safe)
    (async () => {
      try {
        await api.get("/auth/status");
      } catch (err) {
        console.warn("Auth status check failed (safe to ignore):", err?.message);
      }
    })();
  }, []);

  // ✅ FINAL GOOGLE HANDLER (CRITICAL)
  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/api/customers/auth/google`;
  };

  return (
    <div className="login-page">
      <div className="login-container">

        {/* Left Side */}
        <div className="login-form-container">
          <div className="login-brand">
            <img
              src="/images/rrlogo.png"
              alt="RR Nagar Logo"
              className="login-logo"
            />
            <h1 className="login-title">Welcome Back</h1>
            <p className="login-subtitle">
              Sign in to continue to RR Nagar
            </p>
          </div>

          <div className="login-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                placeholder="you@company.com"
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                onKeyDown={(e) => e.key === "Enter" && handleGoogleLogin()}
                disabled
              />
              <small style={{ marginTop: 8, color: "#666", display: "block" }}>
                Email sign-in will continue through Google.
              </small>
            </div>

            {/* PRIMARY BUTTON */}
            <button
              onClick={handleGoogleLogin}
              className="login-button primary"
            >
              Continue with Google
            </button>

            <div className="login-divider">
              <span>or</span>
            </div>

            {/* GOOGLE BUTTON */}
            <button
              onClick={handleGoogleLogin}
              className="login-button google"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>Sign in with Google</span>
            </button>

            <div className="login-footer">
              <p>
                By continuing, you agree to our{" "}
                <a href="/terms">Terms</a> and{" "}
                <a href="/privacy">Privacy Policy</a>.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="login-promo-container">
          <div className="promo-card special-offer">
            <div className="promo-icon">🎉</div>
            <h3>Special Offer</h3>
            <p>
              New users get <strong>10% off</strong>
            </p>
            <div className="promo-code">
              Use code: <span>WELCOME10</span>
            </div>
          </div>

          <div className="promo-card featured-partner">
            <a
              href="https://motardgears.com"
              target="_blank"
              rel="noreferrer"
              className="promo-link"
            >
              <img
                src="/motard.svg"
                alt="Motard"
                className="partner-logo"
              />
              <h4>Motard Gears</h4>
              <p>Premium motor accessories</p>
            </a>
          </div>

          <div className="promo-card benefits">
            <h4>Why shop with us?</h4>
            <ul className="benefits-list">
              <li>Fast delivery</li>
              <li>Trusted sellers</li>
              <li>Secure payments</li>
              <li>24/7 support</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}