import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isCustomerAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div style={{ padding: 20 }}>Checking authentication...</div>;
  }

  if (!isAuthenticated || !isCustomerAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
