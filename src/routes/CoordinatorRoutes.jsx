import React from "react";
import CoordinatorDashboard from "../pages/Coordinator/CoordinatorDashboard";
import CoordinatorTeamStatus from "../pages/Coordinator/CoordinatorTeamStatus";

const CoordinatorRoutes = [
  {
    path: "/coordinator/dashboard",
    element: <CoordinatorDashboard />,
  },
  {
    path: "/coordinator/teams-status",
    element: <CoordinatorTeamStatus />,
  },
];

export default CoordinatorRoutes;
