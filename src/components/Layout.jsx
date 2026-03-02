import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Sidebar from "./Sidebar";
import RequestsPage from "../pages/RequestsPage";
import DashboardPage from "../pages/admin/DashboardPage";
import UsersPage from "../pages/admin/UsersPage";
import TeamsPage from "../pages/admin/TeamsPage";

export default function Layout() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(
    user?.role === "admin" ? "dashboard" : "requests",
  );

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
      default:
        return <RequestsPage />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <div className="flex-1 overflow-auto">{renderPage()}</div>
    </div>
  );
}
