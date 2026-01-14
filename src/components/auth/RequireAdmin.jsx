// FRONTEND FILE
// Path: frontend/src/components/auth/RequireAdmin.jsx

import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { API_BASE } from "../../config/api";

const RequireAdmin = () => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if admin is logged in via session
    fetch(`${API_BASE}/admin/me`, { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) {
          return { loggedIn: false };
        }
        return res.json();
      })
      .then((data) => {
        setIsAuthenticated(!!data?.loggedIn);
        setIsChecking(false);
      })
      .catch(() => {
        setIsAuthenticated(false);
        setIsChecking(false);
      });
  }, []);

  if (isChecking) {
    return <div style={{ padding: 24 }}>Checking authentication...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
};

export default RequireAdmin;



