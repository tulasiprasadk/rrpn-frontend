import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import "./Header.css";
import logo from "../assets/logo.png";
import { useAuth } from "../context/AuthContext";

const SITE_LANGUAGE_KEY = "site_language";

const headerTranslations = {
  Home: "ಮುಖಪುಟ",
  Blog: "ಬ್ಲಾಗ್",
  Subscriptions: "ಚಂದಾದಾರಿಕೆ",
  Dashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
  Logout: "ಲಾಗ್ ಔಟ್",
  Login: "ಲಾಗಿನ್",
  Bag: "ಬ್ಯಾಗ್",
  Kannada: "ಕನ್ನಡ",
  English: "English",
  "Fresh. Fast. Fulfillment.": "ತಾಜಾ. ತ್ವರಿತ. ತೃಪ್ತಿಕರ.",
};

function t(label, kannadaEnabled) {
  if (!kannadaEnabled) return label;
  return headerTranslations[label] || label;
}

export default function Header() {
  const [bagCount, setBagCount] = useState(0);
  const auth = useAuth() || {};
  const user = auth.user || null;
  const logout = auth.logout || (() => {});
  const [isSupplier, setIsSupplier] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [kannadaEnabled, setKannadaEnabled] = useState(
    typeof window !== "undefined" && localStorage.getItem(SITE_LANGUAGE_KEY) === "kannada"
  );

  const updateSupplierFlag = () => {
    const supplierToken = localStorage.getItem("supplierToken");
    setIsSupplier(!!supplierToken);
  };

  const updateBagCount = () => {
    const bag = JSON.parse(localStorage.getItem("bag") || "[]");
    const count = bag.reduce((sum, item) => sum + (item.quantity || item.qty || 0), 0);
    setBagCount(count);
  };

  useEffect(() => {
    updateBagCount();
    updateSupplierFlag();
    window.addEventListener("storage", updateBagCount);
    window.addEventListener("cart-updated", updateBagCount);
    window.addEventListener("storage", updateSupplierFlag);

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

  const handleLogout = async () => {
    try {
      if (isSupplier) {
        await api.post("/supplier/auth/logout");
      } else if (user) {
        await api.post("/auth/logout");
      }
    } catch (err) {
      // Keep local cleanup as the source of truth for the UI.
    } finally {
      logout();
      localStorage.removeItem("supplierToken");
      localStorage.removeItem("supplierId");
      localStorage.removeItem("supplierData");
      window.location.href = "/";
    }
  };

  const toggleKannada = () => {
    const next = !kannadaEnabled;
    setKannadaEnabled(next);
    if (next) {
      localStorage.setItem(SITE_LANGUAGE_KEY, "kannada");
    } else {
      localStorage.removeItem(SITE_LANGUAGE_KEY);
    }
  };

  const isSupplierRole = user?.role === "supplier" || isSupplier;
  const isLoggedIn = Boolean(user || isSupplierRole);
  const dashboardPath = isSupplierRole ? "/supplier/dashboard" : "/customer/dashboard";

  return (
    <header>
      <div className="rn-topbar">
        <div className="rn-logo-wrap">
          <button
            className="rn-menu-btn"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            ≡
          </button>
          <Link
            to="/"
            className="rn-logo-link"
            style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", textDecoration: "none" }}
          >
            <img src={logo} alt="RR Nagar" className="rn-logo" />
            <div style={{ marginTop: 0, color: "#111", fontSize: 16, fontFamily: "Noto Sans Kannada, system-ui, sans-serif" }}>
              ತಾಜಾ, ತ್ವರಿತ, ತೃಪ್ತಿಕರ
            </div>
            <div style={{ marginTop: 0, color: "#888", fontSize: 14, fontWeight: 500 }}>
              {t("Fresh. Fast. Fulfillment.", kannadaEnabled)}
            </div>
          </Link>
        </div>
        <nav className={`rn-nav ${menuOpen ? "open" : "closed"}`}>
          <Link className="rn-nav-item" to="/" onClick={() => setMenuOpen(false)}>
            {t("Home", kannadaEnabled)}
          </Link>
          <Link className="rn-nav-item" to="/blog" onClick={() => setMenuOpen(false)}>
            {t("Blog", kannadaEnabled)}
          </Link>
          <Link className="rn-nav-item" to="/subscriptions" onClick={() => setMenuOpen(false)}>
            {t("Subscriptions", kannadaEnabled)}
          </Link>
          <button
            className="rn-nav-item"
            onClick={toggleKannada}
            style={{ background: "transparent", border: "none", cursor: "pointer" }}
          >
            {kannadaEnabled ? t("English", false) : t("Kannada", false)}
          </button>
          {isLoggedIn ? (
            <>
              <Link className="rn-nav-item" to={dashboardPath} onClick={() => setMenuOpen(false)}>
                {t("Dashboard", kannadaEnabled)}
              </Link>
              <button
                className="rn-nav-item"
                onClick={handleLogout}
                style={{ background: "none", border: "none", cursor: "pointer" }}
              >
                {t("Logout", kannadaEnabled)}
              </button>
            </>
          ) : (
            <Link className="rn-nav-item" to="/login" onClick={() => setMenuOpen(false)}>
              {t("Login", kannadaEnabled)}
            </Link>
          )}
          <Link className="rn-nav-item cart-link" to="/bag" onClick={() => setMenuOpen(false)}>
            {t("Bag", kannadaEnabled)}
            {bagCount > 0 && <span className="cart-badge">{bagCount}</span>}
          </Link>
        </nav>
        {!isLoggedIn && (
          <Link className="rn-login-btn" to="/login">
            {t("Login", kannadaEnabled)}
          </Link>
        )}
      </div>
    </header>
  );
}
