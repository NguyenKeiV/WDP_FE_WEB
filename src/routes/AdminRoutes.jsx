import React from "react";
import AdminDashboard from "../pages/Admin/AdminDashboard";
import AdminConfiguration from "../pages/Admin/AdminConfiguration";
import AdminReports from "../pages/Admin/AdminReports";
import CreateTeamLeaderPage from "../pages/Admin/CreateTeamLeaderPage";

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

  {
    path: "/admin/team-leaders/create",
    element: <CreateTeamLeaderPage />,
  },
];

export default AdminRoutes;
