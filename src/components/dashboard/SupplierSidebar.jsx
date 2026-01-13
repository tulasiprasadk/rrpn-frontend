import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  FiMenu,
  FiX,
  FiHome,
  FiPackage,
  FiShoppingBag,
  FiPlus,
  FiBarChart2,
  FiUser,
  FiLogOut
} from "react-icons/fi";
import "./Sidebar.css";

function SupplierSidebar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <>
      {/* Hamburger Button — mobile only */}
      <button className="sidebar-hamburger" onClick={() => setOpen(true)}>
        <FiMenu size={22} />
      </button>

      {/* Dark Overlay when sidebar is open (mobile) */}
      {open && <div className="sidebar-overlay" onClick={() => setOpen(false)} />}

      {/* Sidebar */}
      <aside className={`sidebar ${open ? "open" : ""}`}> 

        {/* Close Button — mobile */}
        <div className="sidebar-close" onClick={() => setOpen(false)}>
          <FiX size={22} />
        </div>

        {/* Profile Section */}
        <div className="sidebar-profile">
          <img src="/images/react.svg" alt="Supplier" className="sidebar-avatar" />
          <h3 className="sidebar-username">{user?.name || "Supplier"}</h3>
          <p style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>Supplier Account</p>
        </div>

        {/* Menu Items */}
        <nav className="sidebar-menu">
          <Link to="/supplier/dashboard" className={isActive("/supplier/dashboard") ? "active" : ""}>
            <FiHome /> Dashboard
          </Link>

          <Link to="/supplier/products" className={isActive("/supplier/products") ? "active" : ""}>
            <FiShoppingBag /> Products & Pricing
          </Link>

          <Link to="/supplier/orders" className={isActive("/supplier/orders") ? "active" : ""}>
            <FiPackage /> Orders
          </Link>

          <Link to="/supplier/analytics" className={isActive("/supplier/analytics") ? "active" : ""}>
            <FiBarChart2 /> Performance
          </Link>

          <Link to="/supplier/profile" className={isActive("/supplier/profile") ? "active" : ""}>
            <FiUser /> Profile
          </Link>

          <button className="logout-btn" onClick={() => { logout(); window.location.href = "/"; }}>
            <FiLogOut /> Logout
          </button>
        </nav>
      </aside>
    </>
  );
}

export default SupplierSidebar;
