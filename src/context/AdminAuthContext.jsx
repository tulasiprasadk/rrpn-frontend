/* eslint-disable react-refresh/only-export-components */
// FRONTEND FILE
// Path: frontend/src/context/AdminAuthContext.jsx

import { createContext, useContext, useState, useEffect } from "react";

const AdminAuthContext = createContext(undefined);

export const AdminAuthProvider = ({ children }) => {
  const [adminToken, setAdminToken] = useState(null);
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("adminToken");
    const storedAdmin = localStorage.getItem("admin");
    if (storedToken) setAdminToken(storedToken);
    if (storedAdmin) {
      try {
        setAdmin(JSON.parse(storedAdmin));
      } catch {
        setAdmin(null);
      }
    }
  }, []);

  const loginAdmin = (token, adminData = null) => {
    localStorage.setItem("adminToken", token);
    setAdminToken(token);
    if (adminData) {
      localStorage.setItem("admin", JSON.stringify(adminData));
      setAdmin(adminData);
    }
  };

  const logoutAdmin = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");
    setAdminToken(null);
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider value={{ adminToken, admin, loginAdmin, logoutAdmin, logout: logoutAdmin }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  return useContext(AdminAuthContext);
};



