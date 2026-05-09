import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { translate, isKannadaEnabled } from "../../utils/kannadaTranslator";
import {
  FiMenu,
  FiX,
  FiHome,
  FiPackage,
  FiShoppingBag,
  FiGlobe,
  FiFolder,
  FiLayers,
  FiBell,
  FiFileText,
  FiSettings,
  FiLock,
  FiLogOut,
  FiUsers
} from "react-icons/fi";
import "./Sidebar.css";

function AdminSidebar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { admin, logoutAdmin } = useAdminAuth();
  const [kannadaEnabled, setKannadaEnabled] = useState(isKannadaEnabled());

  const isActive = (path) => {
    if (path === "/admin") {
      return location.pathname === "/admin" || location.pathname === "/admin/";
    }
    return location.pathname.startsWith(path);
  };

  const t = (text) => translate(text, kannadaEnabled);

  const handleLogout = async () => {
    try {
      await logoutAdmin();
      window.location.href = "/admin/login";
    } catch (err) {
      console.error("Logout error:", err);
      window.location.href = "/admin/login";
    }
  };

  return (
    <>
      {/* Hamburger Button — mobile only */}
      <button className="sidebar-hamburger" onClick={() => setOpen(true)}>
        <FiMenu size={22} />
      </button>

      {/* Dark Overlay when sidebar is open (mobile) */}
      {open && <div className="sidebar-overlay" onClick={() => setOpen(false)} />}

      {/* Sidebar */}
      <aside className={`sidebar ${open ? "open" : ""}`} style={{ background: '#e31e24', color: '#fff' }}> 

        {/* Close Button — mobile */}
        <div className="sidebar-close" onClick={() => setOpen(false)} style={{ color: '#fff' }}>
          <FiX size={22} />
        </div>

        {/* Profile Section */}
        <div className="sidebar-profile">
          <img src="/images/react.svg" alt="Admin" className="sidebar-avatar" />
          <h3 className="sidebar-username" style={{ color: '#fff' }}>{admin?.name || "Admin"}</h3>
          <p style={{ fontSize: "12px", color: "#ffd700", marginTop: "4px" }}>Admin Account</p>
          <button
            onClick={() => {
              const newState = !kannadaEnabled;
              setKannadaEnabled(newState);
              localStorage.setItem('admin_language', newState ? 'kannada' : 'english');
            }}
            style={{
              marginTop: 8,
              padding: '4px 8px',
              fontSize: 11,
              background: kannadaEnabled ? '#ffd700' : 'rgba(255,255,255,0.2)',
              color: kannadaEnabled ? '#333' : '#fff',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer'
            }}
          >
            {kannadaEnabled ? 'ಕನ್ನಡ' : 'English'}
          </button>
        </div>

        {/* Menu Items */}
        <nav className="sidebar-menu">
          <Link to="/admin" className={isActive("/admin") && !isActive("/admin/") ? "active" : ""} style={{ color: '#fff' }}>
            <FiHome /> {t("Dashboard")}
          </Link>

          <Link to="/admin/orders" className={isActive("/admin/orders") ? "active" : ""} style={{ color: '#fff' }}>
            <FiPackage /> {t("Orders")}
          </Link>

          <Link to="/admin/suppliers" className={isActive("/admin/suppliers") ? "active" : ""} style={{ color: '#fff' }}>
            <FiShoppingBag /> {t("Suppliers")}
          </Link>

          <Link to="/admin/products" className={isActive("/admin/products") ? "active" : ""} style={{ color: '#fff' }}>
            <FiPackage /> {t("Products")}
          </Link>

          <Link to="/admin/translator" className={isActive("/admin/translator") ? "active" : ""} style={{ color: '#fff' }}>
            <FiGlobe /> Translator
          </Link>

          <Link to="/admin/categories" className={isActive("/admin/categories") ? "active" : ""} style={{ color: '#fff' }}>
            <FiFolder /> Categories
          </Link>

          <Link to="/admin/varieties" className={isActive("/admin/varieties") ? "active" : ""} style={{ color: '#fff' }}>
            <FiLayers /> Varieties
          </Link>

          <Link to="/admin/ads" className={isActive("/admin/ads") ? "active" : ""} style={{ color: '#fff' }}>
            <FiBell /> Advertisements
          </Link>

          <Link to="/admin/blogs" className={isActive("/admin/blogs") ? "active" : ""} style={{ color: '#fff' }}>
            <FiFileText /> Blogs
          </Link>

          <Link to="/admin/platform-config" className={isActive("/admin/platform-config") ? "active" : ""} style={{ color: '#fff' }}>
            <FiSettings /> {t("Settings")}
          </Link>

          <Link to="/admin/admins" className={isActive("/admin/admins") ? "active" : ""} style={{ color: '#fff' }}>
            <FiUsers /> Admins
          </Link>

          <Link to="/admin/change-password" className={isActive("/admin/change-password") ? "active" : ""} style={{ color: '#fff' }}>
            <FiLock /> Change Password
          </Link>

          <button className="logout-btn" onClick={handleLogout} style={{ color: '#fff' }}>
            <FiLogOut /> {t("Logout")}
          </button>
        </nav>
      </aside>
    </>
  );
}

export default AdminSidebar;
