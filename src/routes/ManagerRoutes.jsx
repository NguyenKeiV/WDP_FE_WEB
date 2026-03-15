import React from "react";
// import ProtectedRoute from "../components/ProtectedRoute"; // Tạm thời comment để xem preview
import ManagerDashboard from "../pages/Manager/ManagerDashboard";
import ManagerVehicle from "../pages/Manager/ManagerVehicle";
import ManagerInventory from "../pages/Manager/ManagerInventory";
import ManagerReports from "../pages/Manager/ManagerReports";
import ManagerTeams from "../pages/Manager/ManagerTeams";

const ManagerRoutes = [
  {
    path: "/manager/dashboard",
    element: <ManagerDashboard />, // Tạm thời bỏ ProtectedRoute để xem preview
    // element: (
    //   <ProtectedRoute allowedRoles={["manager"]}>
    //     <ManagerDashboard />
    //   </ProtectedRoute>
    // ),
  },
  {
    path: "/manager/vehicles",
    element: <ManagerVehicle />,
    // element: (
    //   <ProtectedRoute allowedRoles={["manager"]}>
    //     <ManagerVehicle />
    //   </ProtectedRoute>
    // ),
  },
  // Thêm các routes manager khác ở đây
  {
    path: "/manager/inventory",
    element: <ManagerInventory />,
    //     <ProtectedRoute allowedRoles={["manager"]}>
    //       <InventoryManagement />
    //     </ProtectedRoute>
  },
  {
    path: "/manager/teams",
    element: <ManagerTeams />,
  },
  {
    path: "/manager/reports",
    element: <ManagerReports />,
    // element: (
    //   <ProtectedRoute allowedRoles={["manager"]}>
    //     <ManagerReports />
    //   </ProtectedRoute>
    // ),
  },
  // {
  //   path: "/manager/distribution",
  //   element: (
  //     <ProtectedRoute allowedRoles={["manager"]}>
  //       <DistributionManagement />
  //     </ProtectedRoute>
  //   ),
  // },
];

export default ManagerRoutes;
