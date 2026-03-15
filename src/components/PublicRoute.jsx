import React from "react";
import { Navigate } from "react-router-dom";
import authService from "../services/authService";

/**
 * Public Route - Redirect nếu đã đăng nhập (cho Login, Register)
 */
const PublicRoute = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getCurrentUser();

  // Nếu đã đăng nhập, redirect về dashboard theo role
  if (isAuthenticated && user) {
    switch (user.role) {
      case "admin":
        return <Navigate to="/admin/dashboard" replace />;
      case "coordinator":
        return <Navigate to="/coordinator/dashboard" replace />;
      case "manager":
        return <Navigate to="/manager/dashboard" replace />;
      default:
        return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};

export default PublicRoute;
