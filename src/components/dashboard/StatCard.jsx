import React from "react";
import "./StatCard.css";

export default function StatCard({ label, title, value, icon, color = "#ff6b6b" }) {
  const heading = label || title || "";
  return (
    <div className="stat-card" style={{ borderTop: `4px solid ${color}` }}>
      <div className="stat-card-top">
        {icon && <div className="stat-icon">{icon}</div>}
        <div className="stat-value">{value}</div>
      </div>
      <div className="stat-label">{heading}</div>
    </div>
  );
}



