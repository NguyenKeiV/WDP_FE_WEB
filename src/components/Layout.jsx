import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Sidebar from "./Sidebar";
import RequestsPage from "../pages/RequestsPage";
import DashboardPage from "../pages/admin/DashboardPage";
import UsersPage from "../pages/admin/UsersPage";
import TeamsPage from "../pages/admin/TeamsPage";
import VehiclesPage from "../pages/VehiclesPage";
import SuppliesPage from "../pages/SuppliesPage";

export default function Layout() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState("dashboard");

  const renderPage = () => {
    switch (currentPage) {
      case "requests":
        return <RequestsPage />;
      case "dashboard":
        return <DashboardPage />;
      case "users":
        return <UsersPage />;
      case "teams":
        return <TeamsPage />;
      case "vehicles":
        return <VehiclesPage />;
      case "supplies":
        return <SuppliesPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <div className="flex-1 overflow-auto">{renderPage()}</div>
    </div>
  );
}
