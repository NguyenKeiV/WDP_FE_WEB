import React from "react";
// import ProtectedRoute from "../components/ProtectedRoute"; // Tạm thời comment để xem preview
import ManagerDashboard from "../pages/Manager/ManagerDashboard";
import ManagerVehicle from "../pages/Manager/ManagerVehicle";
import ManagerInventory from "../pages/Manager/ManagerInventory";
import ManagerReportsSupplyVehicles from "../pages/Manager/ManagerReportsSupplyVehicles";
import ManagerTeams from "../pages/Manager/ManagerTeams";
import ManagerCharityHistory from "../pages/Manager/ManagerCharityHistory";
import ManagerCharityCampaigns from "../pages/Manager/ManagerCharityCampaigns";
import ManagerVolunteerRegistrations from "../pages/Manager/ManagerVolunteerRegistrations";
import ManagerVolunteerCampaigns from "../pages/Manager/ManagerVolunteerCampaigns";

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
    element: <ManagerReportsSupplyVehicles />,
    // element: (
    //   <ProtectedRoute allowedRoles={["manager"]}>
    //     <ManagerReports />
    //   </ProtectedRoute>
    // ),
  },
  {
    path: "/manager/charity-history",
    element: <ManagerCharityHistory />,
  },
  {
    path: "/manager/charity-campaigns",
    element: <ManagerCharityCampaigns />,
  },
  {
    path: "/manager/volunteer-registrations",
    element: <ManagerVolunteerRegistrations />,
  },
  {
    path: "/manager/volunteer-campaigns",
    element: <ManagerVolunteerCampaigns />,
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
