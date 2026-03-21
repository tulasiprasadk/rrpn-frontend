import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import "./Sidebar.css";

export default function CustomerLayout() {
  return (
    <div className="dashboard-container" style={{ display: 'flex', minHeight: '100vh', background: '#f8f9fa', position: 'relative' }}>
      {/* LEFT SIDEBAR - Always visible */}
      <Sidebar />

      {/* MAIN AREA */}
      <main style={{ 
        flex: 1, 
        padding: '2rem', 
        marginLeft: '250px',
        width: 'calc(100% - 250px)',
        maxWidth: 'calc(100vw - 250px)',
        boxSizing: 'border-box',
        minWidth: 0,
        position: 'relative'
      }}>
        <Outlet />
      </main>
    </div>
  );
}
