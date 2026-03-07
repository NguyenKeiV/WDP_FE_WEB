import React from "react";
import { Navigate } from "react-router-dom";
import authService from "../services/authService";

/**
 * Protected Route - Chỉ cho phép truy cập nếu đã đăng nhập
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getCurrentUser();

  // Nếu chưa đăng nhập, redirect về login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Nếu có yêu cầu role và user không có role phù hợp
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
