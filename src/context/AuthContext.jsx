
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api/client";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const loadAuth = async () => {
      setIsLoading(true);
      try {
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (storedToken) {
          if (mounted) {
            setUser(storedUser ? JSON.parse(storedUser) : { role: "user" });
          }
          return;
        }

        // Fall back to session-based auth (Google OAuth)
        const res = await api.get("/auth/me");
        if (mounted) {
          if (res.data?.loggedIn && res.data?.user) {
            setUser(res.data.user);
            localStorage.setItem("user", JSON.stringify(res.data.user));
          } else {
            setUser(null);
          }
        }
      } catch {
        if (mounted) setUser(null);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadAuth();
    return () => {
      mounted = false;
    };
  }, []);


  // Keep user in localStorage in sync
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

const login = (user, token) => {
  if (token) {
    localStorage.setItem("token", token);
  }
  setUser(user || { role: "user" });
  localStorage.setItem("user", JSON.stringify(user || { role: "user" }));
};


  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}



