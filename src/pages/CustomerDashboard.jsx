import React, { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { API_BASE } from "../config/api";
import "../components/dashboard/StatCard.css";
import "../components/dashboard/ProfileCard.css";
import "../components/dashboard/OrdersPreview.css";
import "../components/dashboard/SavedShopsPreview.css";

import StatCard from "../components/dashboard/StatCard";
import ProfileCard from "../components/dashboard/ProfileCard";
import OrdersPreview from "../components/dashboard/OrdersPreview";
import SavedShopsPreview from "../components/dashboard/SavedShopsPreview";

const CustomerDashboard = () => {
  const { user, login } = useAuth();
  useEffect(() => {
    // On mount, fetch user if not present (for OAuth redirect)
    if (!user) {
      const token = localStorage.getItem("token");
      if (token) {
        axios.get(`${API_BASE}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
          .then(res => {
            if (res.data && res.data.loggedIn && res.data.customer) {
              login(res.data.customer, token);
            }
          });
      }
    }
  }, [user, login]);
    return (
      <div style={{ minHeight: '70vh' }}>
        <h2>Welcome to your Dashboard!</h2>
        {/* Search bar for shopping */}
        <div style={{ margin: '24px 0', display: 'flex', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search for products, varieties..."
            style={{ padding: 8, fontSize: 16, width: 320, marginRight: 12 }}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                window.location.href = `/browse?q=${encodeURIComponent(e.target.value)}`;
              }
            }}
          />
          <button
            style={{ padding: '8px 18px', fontSize: 16 }}
            onClick={e => {
              const input = e.target.previousSibling;
              if (input && input.value) {
                window.location.href = `/browse?q=${encodeURIComponent(input.value)}`;
              }
            }}
          >
            🔍 Search
          </button>
        </div>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <StatCard label="Orders" value={12} icon={<span>🧾</span>} color="#4f46e5" />
          <StatCard label="Saved Shops" value={5} icon={<span>🏪</span>} color="#059669" />
          <StatCard label="Profile Complete" value="80%" icon={<span>✅</span>} color="#f59e0b" />
        </div>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <OrdersPreview />
          <SavedShopsPreview />
        </div>
        <div style={{ marginTop: '2rem' }}>
          <ProfileCard />
        </div>
      </div>
  );
};

export default CustomerDashboard;



