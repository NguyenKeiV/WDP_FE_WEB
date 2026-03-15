import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import AdminRoutes from "./AdminRoutes";
import CoordinatorRoutes from "./CoordinatorRoutes";
import ManagerRoutes from "./ManagerRoutes";
import LoginPage from "../pages/LoginPage";
import PublicRoute from "../components/PublicRoute";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ),
  },
  {
    path: "/unauthorized",
    element: (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">
            Không có quyền truy cập
          </h1>
          <p className="text-gray-500">
            Bạn không có quyền truy cập trang này.
          </p>
          <a
            href="/login"
            className="mt-4 inline-block text-blue-600 underline"
          >
            Quay lại đăng nhập
          </a>
        </div>
      </div>
    ),
  },
  ...AdminRoutes,
  ...CoordinatorRoutes,
  ...ManagerRoutes,
]);

export default router;
