import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../../config/api";
import "./SupplierDashboard.css";

export default function SupplierDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    todayOrders: 0,
    pending: 0,
    delivered: 0,
    revenueToday: 0,
  });

  const [loading, setLoading] = useState(true);

  // Auth guard + fetch dashboard stats from backend
  useEffect(() => {
    const init = async () => {
      try {
        const authRes = await fetch(
          `${API_BASE}/supplier/auth/me`,
          { credentials: "include" }
        );

        const auth = await authRes.json();

        if (auth && auth.loggedIn === false) {
          navigate("/supplier/login");
          return;
        }

        // If logged in (or auth check passed), load dashboard stats
        const res = await fetch(`${API_BASE}/supplier/dashboard`, {
          credentials: "include"
        });
        const data = await res.json();

        if (res.ok) {
          setStats(data);
        }
      } catch (err) {
        console.error("Dashboard load error:", err);
      }

      setLoading(false);
    };

    init();
  }, [navigate]);

  if (loading) {
    return <div className="sd-loading">Loading dashboard...</div>;
  }

  return (
    <div className="sd-container">
      <h1>Supplier Dashboard</h1>

      {/* DASHBOARD CARDS */}
      <div className="sd-cards">
        <div className="sd-card">
          <h2>{stats.todayOrders}</h2>
          <p>Today's Orders</p>
        </div>

        <div className="sd-card">
          <h2>{stats.pending}</h2>
          <p>Pending Orders</p>
        </div>

        <div className="sd-card">
          <h2>{stats.delivered}</h2>
          <p>Delivered</p>
        </div>

        <div className="sd-card revenue">
          <h2>₹ {stats.revenueToday}</h2>
          <p>Revenue Today</p>
        </div>
      </div>

      {/* Quick Stats Info */}
      <div style={{ marginTop: 24, padding: 16, background: '#f8f9fa', borderRadius: 8 }}>
        <p style={{ margin: 0, color: '#666', fontSize: 14 }}>
          💡 Use the left sidebar to navigate to Orders, Products, and Analytics
        </p>
      </div>
    </div>
  );
}



