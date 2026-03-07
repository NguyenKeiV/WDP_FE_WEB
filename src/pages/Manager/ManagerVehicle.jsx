import React, { useState } from "react";
import Sidebar from "../../components/manager/Sidebar";
import {
  LocalShipping as TruckIcon,
  DirectionsBoat as BoatIcon,
  Flight as DroneIcon,
  LocalAirport as HelicopterIcon,
  PlayCircle as ActiveIcon,
  Build as MaintenanceIcon,
  PauseCircle as ReadyIcon,
  TrendingUp,
  FileDownload as DownloadIcon,
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  ViewList as ListIcon,
  GridView as GridIcon,
  History as HistoryIcon,
  LocationOn,
  ChevronRight,
  Refresh as SyncIcon,
} from "@mui/icons-material";

export default function ManagerVehicle() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [viewMode, setViewMode] = useState("list"); // list or grid

  // Vehicle data
  const [vehicles] = useState([
    {
      id: 1,
      code: "CN-01-Alpha",
      name: "Cano CN-01-Alpha",
      type: "cano",
      team: "Đội Cứu Hộ Số 05",
      location: "Xã Hòa Tiến, H. Hòa Vang",
      status: "active",
      fuel: 85,
      driver: "Nguyễn Văn A",
      lastUpdate: "5 phút trước",
    },
    {
      id: 2,
      code: "XT-04-Heavy",
      name: "Xe Tải XT-04-Heavy",
      type: "xetai",
      team: "Đội Hậu Cần A",
      location: "Kho Tổng Khu B",
      status: "ready",
      fuel: 100,
      driver: "Trần Văn B",
      lastUpdate: "10 phút trước",
    },
    {
      id: 3,
      code: "DR-09-Scout",
      name: "Drone DR-09-Scout",
      type: "drone",
      team: "Đội Trinh Sát",
      location: "Khu vực Hạ Lưu (Bay)",
      status: "active",
      fuel: 35,
      driver: "Lê Văn C",
      lastUpdate: "2 phút trước",
    },
    {
      id: 4,
      code: "HL-02-Medevac",
      name: "Trực Thăng HL-02",
      type: "tructhang",
      team: "Không Quân Cứu Hộ",
      location: "Sân Bay Đà Nẵng",
      status: "maintenance",
      fuel: 0,
      driver: "Phạm Văn D",
      lastUpdate: "1 giờ trước",
    },
    {
      id: 5,
      code: "CN-05-Beta",
      name: "Cano CN-05-Beta",
      type: "cano",
      team: "Đội Cứu Hộ Số 02",
      location: "Sông Hàn, Cầu Rồng",
      status: "active",
      fuel: 15,
      driver: "Hoàng Thị E",
      lastUpdate: "3 phút trước",
    },
    {
      id: 6,
      code: "XT-07-Medium",
      name: "Xe Tải XT-07",
      type: "xetai",
      team: "Đội Vận Chuyển B",
      location: "Quận 5, TP.HCM",
      status: "active",
      fuel: 92,
      driver: "Vũ Văn F",
      lastUpdate: "8 phút trước",
    },
    {
      id: 7,
      code: "DR-12-Explorer",
      name: "Drone DR-12",
      type: "drone",
      team: "Đội Trinh Sát",
      location: "Quận 12, TP.HCM",
      status: "ready",
      fuel: 88,
      driver: "Đỗ Văn G",
      lastUpdate: "15 phút trước",
    },
    {
      id: 8,
      code: "CN-08-Gamma",
      name: "Cano CN-08-Gamma",
      type: "cano",
      team: "Đội Cứu Hộ Số 03",
      location: "Sông Sài Gòn",
      status: "maintenance",
      fuel: 45,
      driver: "Ngô Thị H",
      lastUpdate: "30 phút trước",
    },
  ]);

  // Filter vehicles
  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch =
      vehicle.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.team.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "" || vehicle.type === selectedType;
    const matchesStatus =
      selectedStatus === "" || vehicle.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Stats
  const totalVehicles = vehicles.length;
  const activeVehicles = vehicles.filter((v) => v.status === "active").length;
  const maintenanceVehicles = vehicles.filter(
    (v) => v.status === "maintenance",
  ).length;
  const criticalFuel = vehicles.filter(
    (v) => v.fuel < 20 && v.status === "active",
  ).length;

  const getVehicleIcon = (type) => {
    switch (type) {
      case "cano":
        return <BoatIcon />;
      case "xetai":
        return <TruckIcon />;
      case "drone":
        return <DroneIcon />;
      case "tructhang":
        return <HelicopterIcon />;
      default:
        return <TruckIcon />;
    }
  };

  const getVehicleTypeName = (type) => {
    switch (type) {
      case "cano":
        return "Cano";
      case "xetai":
        return "Xe tải";
      case "drone":
        return "Drone";
      case "tructhang":
        return "Trực thăng";
      default:
        return type;
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      active:
        "bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm shadow-emerald-100",
      ready:
        "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm shadow-blue-100",
      maintenance:
        "bg-amber-50 text-amber-700 border border-amber-200 shadow-sm shadow-amber-100",
    };
    const labels = {
      active: "Hoạt động",
      ready: "Sẵn sàng",
      maintenance: "Bảo trì",
    };
    const icons = {
      active: <ActiveIcon sx={{ fontSize: 14 }} />,
      ready: <ReadyIcon sx={{ fontSize: 14 }} />,
      maintenance: <MaintenanceIcon sx={{ fontSize: 14 }} />,
    };
    return {
      style: styles[status] || styles.ready,
      label: labels[status] || status,
      icon: icons[status],
    };
  };

  const getFuelColor = (fuel) => {
    if (fuel >= 70) return "bg-emerald-500";
    if (fuel >= 30) return "bg-amber-500";
    return "bg-red-500";
  };

  const getFuelTextColor = (fuel) => {
    if (fuel >= 70) return "text-emerald-700";
    if (fuel >= 30) return "text-amber-700";
    return "text-red-700";
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        <div className="p-8 max-w-[1800px] mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-500 font-medium">Manager</span>
                  <ChevronRight
                    sx={{ fontSize: 16 }}
                    className="text-slate-400"
                  />
                  <span className="text-slate-900 font-semibold">
                    Quản lý phương tiện
                  </span>
                </div>
                <h1 className="text-5xl font-bold text-slate-900 tracking-tight">
                  Quản Lý Phương Tiện Cứu Hộ
                </h1>
                <p className="text-slate-600 text-base">
                  Theo dõi trạng thái, vị trí và điều phối đội xe, tàu, thiết bị
                  bay •
                  <span className="text-slate-900 font-semibold ml-1">
                    Cập nhật theo thời gian thực
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-5 py-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl transition-all duration-300 shadow-sm font-semibold text-slate-700 hover:shadow-md">
                  <DownloadIcon sx={{ fontSize: 20 }} />
                  <span>Xuất báo cáo</span>
                </button>
                <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 font-semibold group">
                  <AddIcon
                    sx={{ fontSize: 20 }}
                    className="group-hover:rotate-90 transition-transform duration-300"
                  />
                  <span>Thêm phương tiện</span>
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="group relative bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl border border-slate-200/60 hover:border-blue-300/60 transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20 text-white transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    <TruckIcon sx={{ fontSize: 28 }} />
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200">
                    <span className="text-xs font-bold text-slate-700">
                      100%
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-4xl font-bold text-slate-900 tracking-tight">
                    {totalVehicles}
                  </h3>
                  <p className="text-sm font-semibold text-slate-900">
                    Tổng phương tiện
                  </p>
                  <p className="text-xs text-slate-500">Đã huy động 100%</p>
                </div>
              </div>
            </div>

            <div className="group relative bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl border border-slate-200/60 hover:border-emerald-300/60 transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20 text-white transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    <ActiveIcon sx={{ fontSize: 28 }} />
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200">
                    <TrendingUp
                      sx={{ fontSize: 14 }}
                      className="text-emerald-600"
                    />
                    <span className="text-xs font-bold text-emerald-700">
                      +12%
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-4xl font-bold text-slate-900 tracking-tight">
                    {activeVehicles}
                  </h3>
                  <p className="text-sm font-semibold text-slate-900">
                    Đang vận hành
                  </p>
                  <p className="text-xs text-emerald-600 font-medium">
                    Hoạt động cao điểm
                  </p>
                </div>
              </div>
            </div>

            <div className="group relative bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl border border-slate-200/60 hover:border-amber-300/60 transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-amber-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20 text-white transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    <MaintenanceIcon sx={{ fontSize: 28 }} />
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200">
                    <span className="text-xs font-bold text-amber-700">
                      Cảnh báo
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-4xl font-bold text-slate-900 tracking-tight">
                    {maintenanceVehicles}
                  </h3>
                  <p className="text-sm font-semibold text-slate-900">
                    Cần bảo trì
                  </p>
                  <p className="text-xs text-red-600 font-medium">
                    {Math.floor(maintenanceVehicles / 2)} xe cần sửa gấp
                  </p>
                </div>
              </div>
            </div>

            <div className="group relative bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl border border-slate-200/60 hover:border-red-300/60 transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-red-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3.5 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 shadow-lg shadow-red-500/20 text-white transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    <SyncIcon sx={{ fontSize: 28 }} />
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 border border-red-200">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-4xl font-bold text-slate-900 tracking-tight">
                    {criticalFuel}
                  </h3>
                  <p className="text-sm font-semibold text-slate-900">
                    Nhiên liệu thấp
                  </p>
                  <p className="text-xs text-red-600 font-medium">
                    Cần tiếp nhiên liệu ngay
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters Section */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/60 mb-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                {/* Search */}
                <div className="relative group w-full lg:w-80">
                  <SearchIcon
                    sx={{ fontSize: 20 }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors"
                  />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tìm theo mã hoặc tên đội..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-slate-400 transition-all font-medium"
                  />
                </div>

                <div className="h-8 w-px bg-slate-200 hidden lg:block"></div>

                {/* Type Filter */}
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer hover:bg-slate-100 transition-colors font-medium"
                >
                  <option value="">Tất cả loại xe</option>
                  <option value="cano">Cano</option>
                  <option value="xetai">Xe tải</option>
                  <option value="tructhang">Trực thăng</option>
                  <option value="drone">Drone</option>
                </select>

                {/* Status Filter */}
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer hover:bg-slate-100 transition-colors font-medium"
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="active">Hoạt động</option>
                  <option value="ready">Sẵn sàng</option>
                  <option value="maintenance">Đang bảo trì</option>
                </select>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-3 rounded-xl transition-all duration-300 ${
                    viewMode === "list"
                      ? "bg-blue-100 text-blue-600 border border-blue-200"
                      : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
                  }`}
                  title="Chế độ danh sách"
                >
                  <ListIcon sx={{ fontSize: 20 }} />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-3 rounded-xl transition-all duration-300 ${
                    viewMode === "grid"
                      ? "bg-blue-100 text-blue-600 border border-blue-200"
                      : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
                  }`}
                  title="Chế độ lưới"
                >
                  <GridIcon sx={{ fontSize: 20 }} />
                </button>
              </div>
            </div>
          </div>

          {/* Vehicles Table/Grid */}
          {viewMode === "list" ? (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-200">
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Mã thiết bị
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Loại
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Đội phụ trách
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Vị trí hiện tại
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Nhiên liệu / Pin
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Hành động
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredVehicles.map((vehicle) => {
                      const statusBadge = getStatusBadge(vehicle.status);
                      return (
                        <tr
                          key={vehicle.id}
                          className="group hover:bg-blue-50/30 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                              <span className="text-sm font-bold text-slate-900">
                                {vehicle.code}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                                {getVehicleIcon(vehicle.type)}
                              </div>
                              <span className="text-sm font-semibold text-slate-900">
                                {getVehicleTypeName(vehicle.type)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-slate-600 font-medium">
                              {vehicle.team}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <LocationOn
                                sx={{ fontSize: 16 }}
                                className="text-slate-400"
                              />
                              <span className="text-sm text-slate-700 font-medium">
                                {vehicle.location}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold ${statusBadge.style}`}
                            >
                              {statusBadge.icon}
                              {statusBadge.label}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
                                <div
                                  className={`h-2 rounded-full transition-all duration-500 ${getFuelColor(
                                    vehicle.fuel,
                                  )}`}
                                  style={{ width: `${vehicle.fuel}%` }}
                                ></div>
                              </div>
                              <span
                                className={`text-xs font-bold ${getFuelTextColor(
                                  vehicle.fuel,
                                )} min-w-[40px] text-right`}
                              >
                                {vehicle.fuel}%
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                              <button
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
                                  vehicle.status === "maintenance"
                                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                    : "bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white shadow-sm hover:shadow-md"
                                }`}
                                disabled={vehicle.status === "maintenance"}
                              >
                                Điều phối
                              </button>
                              <button
                                className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                                title="Lịch sử"
                              >
                                <HistoryIcon sx={{ fontSize: 18 }} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/30 flex justify-between items-center">
                <p className="text-xs text-slate-600 font-medium">
                  Hiển thị{" "}
                  <span className="text-slate-900 font-bold">
                    1-{filteredVehicles.length}
                  </span>{" "}
                  trong tổng số{" "}
                  <span className="text-slate-900 font-bold">
                    {vehicles.length}
                  </span>{" "}
                  phương tiện
                </p>
                <div className="flex gap-2">
                  <button
                    className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled
                  >
                    Trước
                  </button>
                  <button className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors">
                    Sau
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredVehicles.map((vehicle) => {
                const statusBadge = getStatusBadge(vehicle.status);
                return (
                  <div
                    key={vehicle.id}
                    className="group bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl border border-slate-200/60 hover:border-blue-300/60 transition-all duration-500 overflow-hidden"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                        {getVehicleIcon(vehicle.type)}
                      </div>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold ${statusBadge.style}`}
                      >
                        {statusBadge.icon}
                        {statusBadge.label}
                      </span>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">
                          {vehicle.code}
                        </h3>
                        <p className="text-xs text-slate-600 font-medium">
                          {getVehicleTypeName(vehicle.type)} • {vehicle.team}
                        </p>
                      </div>

                      <div className="flex items-start gap-2">
                        <LocationOn
                          sx={{ fontSize: 14 }}
                          className="text-slate-400 mt-0.5"
                        />
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {vehicle.location}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-600 font-medium">
                            Nhiên liệu / Pin
                          </span>
                          <span
                            className={`font-bold ${getFuelTextColor(
                              vehicle.fuel,
                            )}`}
                          >
                            {vehicle.fuel}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${getFuelColor(
                              vehicle.fuel,
                            )}`}
                            style={{ width: `${vehicle.fuel}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-4 border-t border-slate-200">
                      <button
                        className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                          vehicle.status === "maintenance"
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                            : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-500/25"
                        }`}
                        disabled={vehicle.status === "maintenance"}
                      >
                        Điều phối
                      </button>
                      <button
                        className="p-2.5 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                        title="Lịch sử"
                      >
                        <HistoryIcon sx={{ fontSize: 18 }} />
                      </button>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <p className="text-xs text-slate-500">
                        Cập nhật: {vehicle.lastUpdate}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-500">
              © 2024 ReliefOps System. Phiên bản 2.4.1 (Build 8902). Dữ liệu
              được mã hóa đầu cuối.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
