import React from "react";
import { Outlet, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "../../components/dashboard/AdminSidebar";
import "../../components/dashboard/Sidebar.css";
import "./AdminLayout.css";

// ================== ADMIN NOTIFICATION BELL ==================
function AdminNotifications() {
  const [list, setList] = useState([]);
  const [open, setOpen] = useState(false);

  async function load() {
    const res = await axios.get("/api/admin/notifications");
    setList(res.data);
  }

  useEffect(() => {
    load();
    const timer = setInterval(load, 15000);
    return () => clearInterval(timer);
  }, []);

  const unread = list.length;

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          padding: "8px",
          fontSize: 22,
          background: "transparent",
          border: "none",
          cursor: "pointer"
        }}
      >
        🔔
        {unread > 0 && (
          <span
            style={{
              position: "absolute",
              top: -2,
              right: -2,
              background: "red",
              color: "white",
              borderRadius: "50%",
              padding: "2px 6px",
              fontSize: 12
            }}
          >
            {unread}
          </span>
        )}
      </button>

      {/* DROPDOWN */}
      {open && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 35,
            width: 300,
            background: "white",
            border: "1px solid #ddd",
            borderRadius: 8,
            padding: 10,
            zIndex: 999
          }}
        >
          <h4 style={{ marginTop: 0 }}>Notifications</h4>

          {list.length === 0 && <p>No new alerts</p>}

          {list.map((n) => (
            <div
              key={n.id}
              style={{
                padding: "8px 0",
                borderBottom: "1px solid #eee",
                cursor: n.type === 'supplier_registration' ? 'pointer' : 'default'
              }}
              onClick={() => {
                if (n.type === 'supplier_registration') {
                  setOpen(false);
                  window.location.href = '/admin/suppliers';
                }
              }}
            >
              <strong>{n.title}</strong>
              <p style={{ margin: "3px 0", fontSize: 13 }}>{n.message}</p>
              {n.type === 'supplier_registration' && (
                <p style={{ margin: "3px 0", fontSize: 12, color: "#007bff" }}>
                  → Click to view and approve
                </p>
              )}
            </div>
          ))}

          {list.length > 0 && (
            <button
              onClick={async () => {
                await axios.put("/api/admin/notifications/mark-read");
                setList([]);
              }}
              style={{
                marginTop: 8,
                padding: "8px 12px",
                background: "#007bff",
                color: "white",
                border: "none",
                borderRadius: 5
              }}
            >
              Mark All Read
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ================== ADMIN LAYOUT ==================

export default function AdminLayout() {
  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:3000/api/admin/logout");
      window.location.href = "/admin/login";
    } catch {
      console.error("Logout error:", err);
    }
  };

  return (
    <div className="admin-layout" style={{ display: 'flex', minHeight: '100vh', background: '#f8f9fa' }}>
      {/* LEFT SIDEBAR - Using consistent sidebar component */}
      <AdminSidebar />

      {/* MAIN AREA */}
      <div className="admin-main" style={{ 
        flex: 1, 
        marginLeft: '250px', 
        display: 'flex', 
        flexDirection: 'column', 
        minWidth: 0,
        width: 'calc(100% - 250px)',
        maxWidth: 'calc(100vw - 250px)',
        boxSizing: 'border-box'
      }}>
        
        {/* HEADER */}
        <header className="admin-topbar" style={{ 
          height: '56px', 
          background: '#ffd600', 
          borderBottom: '2px solid rgba(0,0,0,0.2)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: '0 20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }}>
          <Link to="/" style={{ 
            textDecoration: "none", 
            color: "#e31e24", 
            fontWeight: "bold"
          }}>
            ← Back to Home
          </Link>
          <AdminNotifications />
        </header>

        {/* PAGE CONTENT */}
        <main className="admin-content" style={{ padding: 20, flex: 1 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}



