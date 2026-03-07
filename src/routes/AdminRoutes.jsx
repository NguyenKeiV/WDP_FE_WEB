import React from "react";
import AdminDashboard from "../pages/Admin/AdminDashboard";
import AdminConfiguration from "../pages/Admin/AdminConfiguration";
import AdminReports from "../pages/Admin/AdminReports";

const AdminRoutes = [
  {
    path: "/admin/dashboard",
    element: <AdminDashboard />,
  },

  {
    path: "/admin/configuration",
    element: <AdminConfiguration />,
  },

  {
    path: "/admin/reports",
    element: <AdminReports />,
  },
];

export default AdminRoutes;
