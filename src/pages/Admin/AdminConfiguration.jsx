import React, { useState } from "react";
import Sidebar from "../../components/admin/Sidebar";
import VehiclesManagement from "../../components/admin/VehiclesManagement";
import InventoryManagement from "../../components/admin/InventoryManagement";
import DisasterManagement from "../../components/admin/DisasterManagement";
import {
  MdDirectionsBoat,
  MdInventory2,
  MdWarning,
  MdHelp,
} from "react-icons/md";

const AdminConfiguration = () => {
  const [activeTab, setActiveTab] = useState("vehicles");

  const tabs = [
    {
      id: "vehicles",
      label: "Danh mục phương tiện",
      icon: <MdDirectionsBoat className="text-lg" />,
    },
    {
      id: "supplies",
      label: "Danh mục nhu yếu phẩm",
      icon: <MdInventory2 className="text-lg" />,
    },
    {
      id: "zones",
      label: "Vùng thiên tai",
      icon: <MdWarning className="text-lg" />,
    },
  ];

  return (
    <div className="h-screen overflow-hidden flex bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Gradient Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500/50 z-10"></div>

        {/* Top Bar with Breadcrumbs */}
        <header className="flex-shrink-0 border-b border-gray-200 bg-white z-0">
          <div className="px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <a
                href="#"
                className="text-gray-500 hover:text-emerald-600 transition-colors"
              >
                Home
              </a>
              <span className="text-gray-300">/</span>
              <a
                href="#"
                className="text-gray-500 hover:text-emerald-600 transition-colors"
              >
                Admin
              </a>
              <span className="text-gray-300">/</span>
              <span className="text-gray-900 font-semibold">
                Cấu hình hệ thống
              </span>
            </div>
            <div className="flex items-center gap-4">
              <button className="text-gray-500 hover:text-gray-900 transition-colors">
                <MdHelp className="text-xl" />
              </button>
              <div className="h-4 w-[1px] bg-gray-200"></div>
              <p className="text-gray-500 text-xs font-mono">V1.2.4-RC</p>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto bg-gray-50">
          <div className="px-8 py-6">
            {/* Page Heading */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Cấu Hình Danh Mục & Tham Số
              </h1>
              <p className="text-gray-600">
                Quản lý trung tâm cho các loại phương tiện, nhu yếu phẩm cứu
                trợ, tham số vận hành và các vùng cảnh báo thiên tai.
              </p>
            </div>

            {/* Tabs Navigation */}
            <div className="border-b border-gray-200 mb-6">
              <div className="flex gap-6 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`pb-3 px-2 border-b-2 font-medium text-sm transition-colors whitespace-nowrap flex items-center gap-2 ${
                      activeTab === tab.id
                        ? "border-emerald-500 text-emerald-600"
                        : "border-transparent text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === "vehicles" && <VehiclesManagement />}
            {activeTab === "supplies" && <InventoryManagement />}
            {activeTab === "zones" && <DisasterManagement />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminConfiguration;
