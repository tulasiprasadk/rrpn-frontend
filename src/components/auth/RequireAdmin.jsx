// FRONTEND FILE
// Path: frontend/src/components/auth/RequireAdmin.jsx

import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../api/client";

const RequireAdmin = () => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");

    api.get("/admin/me")
      .then((res) => {
        const loggedIn = !!res.data?.loggedIn || !!token;
        setIsAuthenticated(loggedIn);
        setIsChecking(false);
      })
      .catch(() => {
        setIsAuthenticated(!!token);
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



