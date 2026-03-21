/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../api/client";

const AuthContext = createContext();

function readStoredUser() {
  try {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (err) {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStoredUser());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const syncAuth = async () => {
      setIsLoading(true);
      try {
        const customerToken = localStorage.getItem("token");
        const supplierToken = localStorage.getItem("supplierToken");
        const storedUser = readStoredUser();
        const path = typeof window !== "undefined" ? window.location.pathname : "";

        if (customerToken) {
          if (mounted) {
            setUser(storedUser || { role: "user" });
            setIsLoading(false);
          }
          return;
        }

        if (supplierToken) {
          if (mounted) {
            setUser(storedUser || { role: "supplier" });
            setIsLoading(false);
          }
          return;
        }

        // Public supplier routes should not probe customer auth endpoints.
        if (path.startsWith("/supplier")) {
          if (mounted) {
            setUser(storedUser?.role === "supplier" ? storedUser : null);
            setIsLoading(false);
          }
          return;
        }

        const res = await api.get("/auth/me");
        if (!mounted) return;

        if (res.data?.loggedIn && res.data?.user) {
          setUser(res.data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    syncAuth();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  const login = (nextUser, token) => {
    if (token) {
      localStorage.setItem("token", token);
      localStorage.removeItem("supplierToken");
    }
    setUser(nextUser || { role: "user" });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("supplierToken");
  };

  const customerToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const supplierToken = typeof window !== "undefined" ? localStorage.getItem("supplierToken") : null;
  const isSupplierAuthenticated = Boolean(supplierToken || user?.role === "supplier");
  const isCustomerAuthenticated = Boolean(customerToken || (user && user.role !== "supplier"));
  const value = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: isCustomerAuthenticated || isSupplierAuthenticated,
    isCustomerAuthenticated,
    isSupplierAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
