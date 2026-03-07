import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/manager/Sidebar";
import Notification from "../../components/manager/Notification";
import { usePermission } from "../../hooks/usePermission";
import { Permission } from "../../constants/permissions";
import { Role } from "../../constants/roles";
import {
  Warning as WarningIcon,
  LocalShipping as VehicleIcon,
  Group as GroupIcon,
  Inventory2 as BoxIcon,
  Favorite as HeartIcon,
  DirectionsBoat as ShipIcon,
  Refresh as SyncIcon,
  ChevronRight,
  LocalGasStation as FuelIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  MoreVert as MoreIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
  Notifications as NotificationsIcon,
  Add as AddIcon,
  Emergency as EmergencyIcon,
  Assessment as AssessmentIcon,
  LocationOn as LocationIcon,
  Speed as SpeedIcon,
  Timeline as TimelineIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  ErrorOutline as ErrorOutlineIcon,
  Lock as LockIcon,
} from "@mui/icons-material";

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const { hasPermission, hasRole, userRole, isAuthenticated } = usePermission();

  // Kiểm tra quyền truy cập - chỉ Manager và Admin mới được truy cập
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!hasRole([Role.MANAGER, Role.ADMIN])) {
      navigate("/unauthorized");
      return;
    }
  }, [isAuthenticated, hasRole, navigate]);

  // Kiểm tra các quyền cụ thể cho Manager
  const canManageVehicles = hasPermission(Permission.MANAGE_VEHICLES);
  const canManageInventory = hasPermission(Permission.MANAGE_INVENTORY);
  const canTrackDistributions = hasPermission(Permission.TRACK_DISTRIBUTIONS);
  const canViewReports = hasPermission(Permission.VIEW_RESOURCE_REPORTS);

  const [selectedTimeframe, setSelectedTimeframe] = useState("today");
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    navigate("/login");
  };

  // Loading state khi đang kiểm tra quyền
  if (!isAuthenticated || !hasRole([Role.MANAGER, Role.ADMIN])) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
        <div className="text-center p-8 bg-white rounded-3xl shadow-xl border border-slate-200">
          <LockIcon sx={{ fontSize: 48 }} className="text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Không có quyền truy cập
          </h2>
          <p className="text-slate-600 mb-4">
            Bạn không có quyền truy cập vào trang này.
          </p>
          <p className="text-sm text-slate-500 mb-4">
            Vai trò của bạn: {userRole || "Chưa xác định"}
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
          >
            Quay lại trang chủ
          </button>
        </div>
      </div>
    );
  }

  // Alerts data
  const [alerts] = useState([
    {
      id: 1,
      type: "critical",
      title: "Nhiên liệu thấp",
      message: "Xe Tải VN-003 cần tiếp nhiên liệu ngay",
      time: "5 phút trước",
    },
    {
      id: 2,
      type: "warning",
      title: "Vật tư sắp hết",
      message: "Bộ sơ cứu chỉ còn 45 bộ",
      time: "15 phút trước",
    },
    {
      id: 3,
      type: "info",
      title: "Nhiệm vụ hoàn thành",
      message: "Đội A đã hoàn thành phân phối tại Quận 5",
      time: "30 phút trước",
    },
  ]);

  // Vehicles data
  const [vehicles] = useState([
    {
      id: 1,
      name: "Xe Tải VN-001",
      type: "Xe tải",
      status: "active",
      driver: "Nguyễn Văn A",
      location: "Quận 1",
      fuel: 85,
      distance: "125 km",
      lastUpdate: "5 phút trước",
    },
    {
      id: 2,
      name: "Cano Đội 05",
      type: "Cano",
      status: "active",
      driver: "Trần Văn B",
      location: "Sông Hàn",
      fuel: 45,
      distance: "89 km",
      lastUpdate: "10 phút trước",
    },
    {
      id: 3,
      name: "Xe Van RS-12",
      type: "Xe van",
      status: "maintenance",
      driver: "Lê Thị C",
      location: "Xưởng sửa chữa",
      fuel: 20,
      distance: "0 km",
      lastUpdate: "1 giờ trước",
    },
    {
      id: 4,
      name: "Xe Tải VN-007",
      type: "Xe tải",
      status: "active",
      driver: "Phạm Văn D",
      location: "Quận 7",
      fuel: 92,
      distance: "234 km",
      lastUpdate: "2 phút trước",
    },
  ]);

  // Inventory data
  const [inventory] = useState([
    {
      id: 1,
      name: "Gạo",
      quantity: 1250,
      unit: "kg",
      status: "good",
      category: "Thực phẩm",
      warehouse: "Kho A",
      restock: "Không cần",
    },
    {
      id: 2,
      name: "Nước uống",
      quantity: 850,
      unit: "chai",
      status: "warning",
      category: "Thực phẩm",
      warehouse: "Kho B",
      restock: "Trong 3 ngày",
    },
    {
      id: 3,
      name: "Bộ sơ cứu",
      quantity: 45,
      unit: "bộ",
      status: "critical",
      category: "Y tế",
      warehouse: "Trung tâm Y tế",
      restock: "Khẩn cấp",
    },
    {
      id: 4,
      name: "Chăn ấm",
      quantity: 320,
      unit: "cái",
      status: "good",
      category: "Vật dụng",
      warehouse: "Kho A",
      restock: "Không cần",
    },
  ]);

  // Distribution data
  const [distributions] = useState([
    {
      id: 1,
      area: "Quận 5, TP.HCM",
      items: "Gạo, Nước, Thuốc men",
      status: "completed",
      team: "Đội A",
      people: 125,
      timestamp: "2 giờ trước",
      progress: 100,
    },
    {
      id: 2,
      area: "Quận 12, TP.HCM",
      items: "Chăn ấm, Thực phẩm",
      status: "in-progress",
      team: "Đội B",
      people: 89,
      timestamp: "30 phút trước",
      progress: 65,
    },
    {
      id: 3,
      area: "Quận 9, TP.HCM",
      items: "Vật tư y tế",
      status: "pending",
      team: "Đội C",
      people: 156,
      timestamp: "Đã lên lịch",
      progress: 0,
    },
  ]);

  // Stats data
  const stats = [
    {
      title: "Phương Tiện",
      value: "42",
      subtitle: "Đang hoạt động",
      change: "+5",
      trend: "up",
      percentage: "+12%",
      icon: <VehicleIcon sx={{ fontSize: 28 }} />,
      iconBg: "bg-gradient-to-br from-blue-500 to-indigo-600",
      chartData: [20, 35, 28, 42],
    },
    {
      title: "Đội Cứu Hộ",
      value: "15",
      subtitle: "Đang triển khai",
      change: "+3",
      trend: "up",
      percentage: "+100%",
      icon: <GroupIcon sx={{ fontSize: 28 }} />,
      iconBg: "bg-gradient-to-br from-emerald-500 to-teal-600",
      chartData: [12, 15, 13, 15],
    },
    {
      title: "Vật Tư Thiết Yếu",
      value: "1,250",
      subtitle: "kg sẵn sàng phân phối",
      change: "+200kg",
      trend: "up",
      percentage: "+19%",
      icon: <BoxIcon sx={{ fontSize: 28 }} />,
      iconBg: "bg-gradient-to-br from-violet-500 to-purple-700",
      chartData: [800, 950, 1100, 1250],
    },
    {
      title: "Người Được Cứu",
      value: "89",
      subtitle: "Trong 24h qua",
      change: "+12",
      trend: "up",
      percentage: "+15.6%",
      icon: <HeartIcon sx={{ fontSize: 28 }} />,
      iconBg: "bg-gradient-to-br from-rose-500 to-pink-700",
      chartData: [45, 67, 78, 89],
    },
  ];

  const getVehicleStatusBadge = (status) => {
    const styles = {
      active: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-600/20",
      inactive: "bg-slate-100 text-slate-700 ring-1 ring-slate-600/20",
      maintenance: "bg-amber-100 text-amber-700 ring-1 ring-amber-600/20",
    };
    const labels = {
      active: "Hoạt động",
      inactive: "Không hoạt động",
      maintenance: "Bảo trì",
    };
    return {
      style: styles[status] || styles.inactive,
      label: labels[status] || status,
    };
  };

  const getInventoryStatusBadge = (status) => {
    const styles = {
      good: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-600/20",
      warning: "bg-amber-100 text-amber-700 ring-1 ring-amber-600/20",
      critical: "bg-red-100 text-red-700 ring-1 ring-red-600/20",
    };
    const labels = {
      good: "Tốt",
      warning: "Cảnh báo",
      critical: "Nguy cấp",
    };
    return {
      style: styles[status] || styles.good,
      label: labels[status] || status,
    };
  };

  const getDistributionStatusBadge = (status) => {
    const styles = {
      completed: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-600/20",
      "in-progress": "bg-blue-100 text-blue-700 ring-1 ring-blue-600/20",
      pending: "bg-slate-100 text-slate-700 ring-1 ring-slate-600/20",
    };
    const labels = {
      completed: "Hoàn thành",
      "in-progress": "Đang thực hiện",
      pending: "Chờ xử lý",
    };
    return {
      style: styles[status] || styles.pending,
      label: labels[status] || status,
    };
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        <div className="p-8 max-w-[1800px] mx-auto">
          {/* Modern Header */}
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
                    Dashboard
                  </span>
                </div>
                <h1 className="text-5xl font-bold text-slate-900 tracking-tight">
                  Tổng Quan Chiến Lược
                </h1>
                <p className="text-slate-600 text-base">
                  Quản lý hoạt động cứu trợ và phân bổ nguồn lực theo thời gian
                  thực •
                  <span className="text-slate-900 font-semibold ml-1">
                    {new Date().toLocaleDateString("vi-VN", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Time selector */}
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl">
                  {["today", "week", "month"].map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTimeframe(time)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                        selectedTimeframe === time
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {time === "today"
                        ? "Hôm nay"
                        : time === "week"
                          ? "Tuần này"
                          : "Tháng này"}
                    </button>
                  ))}
                </div>

                {/* Notifications */}
                <button
                  onClick={() => setIsNotificationOpen(true)}
                  className="relative p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl transition-all duration-300 shadow-sm group"
                >
                  <NotificationsIcon
                    sx={{ fontSize: 22 }}
                    className="text-slate-700 group-hover:scale-110 transition-transform"
                  />
                  {alerts.length > 0 && (
                    <>
                      <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white animate-pulse"></span>
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {alerts.length}
                      </span>
                    </>
                  )}
                </button>

                {/* Live status */}
                <div className="flex items-center gap-2.5 px-5 py-3 bg-white border border-emerald-200 rounded-2xl shadow-sm shadow-emerald-100">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="text-sm font-semibold text-emerald-700">
                    Trực tiếp
                  </span>
                </div>

                {/* Refresh button */}
                <button className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 font-semibold group">
                  <SyncIcon
                    sx={{ fontSize: 20 }}
                    className="group-hover:rotate-180 transition-transform duration-700"
                  />
                  <span>Làm mới</span>
                </button>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full border-2 border-white shadow-md flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-blue-400 transition-all"
                  >
                    <span className="text-white font-bold text-sm">MN</span>
                  </button>

                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowUserMenu(false)}
                      />
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-20">
                        <div className="px-4 py-3 border-b border-slate-200">
                          <p className="text-sm font-bold text-slate-900">
                            Manager
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            manager@reliefmanagement.vn
                          </p>
                        </div>

                        <div className="py-2">
                          <a
                            href="#"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <span className="text-slate-500">👤</span>
                            Hồ sơ cá nhân
                          </a>
                          <a
                            href="#"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <span className="text-slate-500">⚙️</span>
                            Cài đặt
                          </a>
                          <a
                            href="#"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <span className="text-slate-500">❓</span>
                            Trợ giúp
                          </a>
                        </div>

                        <div className="border-t border-slate-200 pt-2">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full font-semibold"
                          >
                            <span className="text-red-500">🚪</span>
                            Đăng xuất
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Modern Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="group relative bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl border border-slate-200/60 hover:border-slate-300/60 transition-all duration-500 overflow-hidden"
              >
                {/* Background gradient effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-slate-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`p-3.5 rounded-2xl ${stat.iconBg} shadow-lg shadow-black/10 text-white transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}
                    >
                      {stat.icon}
                    </div>
                    <div
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${
                        stat.trend === "up"
                          ? "bg-emerald-50 border border-emerald-200"
                          : "bg-red-50 border border-red-200"
                      }`}
                    >
                      {stat.trend === "up" ? (
                        <TrendingUpIcon
                          sx={{ fontSize: 14 }}
                          className="text-emerald-600"
                        />
                      ) : (
                        <TrendingDownIcon
                          sx={{ fontSize: 14 }}
                          className="text-red-600"
                        />
                      )}
                      <span
                        className={`text-xs font-bold ${
                          stat.trend === "up"
                            ? "text-emerald-700"
                            : "text-red-700"
                        }`}
                      >
                        {stat.percentage}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 mb-4">
                    <h3 className="text-4xl font-bold text-slate-900 tracking-tight">
                      {stat.value}
                    </h3>
                    <p className="text-sm font-semibold text-slate-900">
                      {stat.title}
                    </p>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {stat.subtitle}
                    </p>
                  </div>

                  {/* Mini chart */}
                  <div className="flex items-end gap-1 h-12">
                    {stat.chartData.map((value, idx) => (
                      <div
                        key={idx}
                        className="flex-1 bg-gradient-to-t from-slate-200 to-slate-300 rounded-t-lg group-hover:from-blue-400 group-hover:to-blue-500 transition-all duration-500"
                        style={{
                          height: `${(value / Math.max(...stat.chartData)) * 100}%`,
                          transitionDelay: `${idx * 50}ms`,
                        }}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Vehicle Management - Modern Design */}
            {canManageVehicles ? (
              <div className="xl:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-transparent">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
                        <VehicleIcon sx={{ fontSize: 24 }} />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-slate-900">
                          Quản Lý Phương Tiện
                        </h2>
                        <p className="text-sm text-slate-600 mt-0.5">
                          Theo dõi và giám sát tất cả xe cứu hộ
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors">
                        <FilterIcon
                          sx={{ fontSize: 20 }}
                          className="text-slate-600"
                        />
                      </button>
                      <button className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors">
                        <MoreIcon
                          sx={{ fontSize: 20 }}
                          className="text-slate-600"
                        />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50/50">
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                          Phương Tiện
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                          Trạng Thái
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                          Vị Trí
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                          Nhiên Liệu
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {vehicles.map((vehicle, idx) => {
                        const status = getVehicleStatusBadge(vehicle.status);
                        return (
                          <tr
                            key={vehicle.id}
                            className={`border-b border-slate-100 hover:bg-slate-50/50 transition-colors ${
                              idx === vehicles.length - 1 ? "border-b-0" : ""
                            }`}
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                                  {vehicle.type === "Xe tải" ? (
                                    <VehicleIcon
                                      sx={{ fontSize: 20 }}
                                      className="text-slate-600"
                                    />
                                  ) : vehicle.type === "Cano" ? (
                                    <ShipIcon
                                      sx={{ fontSize: 20 }}
                                      className="text-slate-600"
                                    />
                                  ) : (
                                    <span className="text-sm font-bold text-slate-700">
                                      {vehicle.id}
                                    </span>
                                  )}
                                </div>
                                <div>
                                  <div className="text-sm font-bold text-slate-900">
                                    {vehicle.name}
                                  </div>
                                  <div className="text-xs text-slate-500">
                                    {vehicle.type} · {vehicle.driver}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold ${status.style}`}
                              >
                                {status.label}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <LocationIcon
                                  sx={{ fontSize: 16 }}
                                  className="text-slate-400"
                                />
                                <div>
                                  <div className="text-sm font-medium text-slate-900">
                                    {vehicle.location}
                                  </div>
                                  <div className="flex items-center gap-1 text-xs text-slate-500">
                                    <SpeedIcon sx={{ fontSize: 12 }} />
                                    <span>{vehicle.distance}</span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-1">
                                    <span
                                      className={`text-xs font-bold ${
                                        vehicle.fuel < 30
                                          ? "text-red-600"
                                          : vehicle.fuel < 50
                                            ? "text-amber-600"
                                            : "text-emerald-600"
                                      }`}
                                    >
                                      {vehicle.fuel}%
                                    </span>
                                  </div>
                                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full transition-all duration-500 ${
                                        vehicle.fuel < 30
                                          ? "bg-gradient-to-r from-red-500 to-red-600"
                                          : vehicle.fuel < 50
                                            ? "bg-gradient-to-r from-amber-500 to-amber-600"
                                            : "bg-gradient-to-r from-emerald-500 to-emerald-600"
                                      }`}
                                      style={{ width: `${vehicle.fuel}%` }}
                                    ></div>
                                  </div>
                                </div>
                                <FuelIcon
                                  sx={{ fontSize: 18 }}
                                  className={
                                    vehicle.fuel < 30
                                      ? "text-red-500"
                                      : vehicle.fuel < 50
                                        ? "text-amber-500"
                                        : "text-emerald-500"
                                  }
                                />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="xl:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden p-12">
                <div className="text-center">
                  <LockIcon
                    sx={{ fontSize: 48 }}
                    className="text-slate-300 mb-4"
                  />
                  <h3 className="text-xl font-bold text-slate-700 mb-2">
                    Không có quyền truy cập
                  </h3>
                  <p className="text-slate-500">
                    Bạn không có quyền quản lý phương tiện.
                  </p>
                </div>
              </div>
            )}

            {/* Distribution Tracking - Modern Design */}
            {canTrackDistributions ? (
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-transparent">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-purple-500/20">
                        <ShipIcon sx={{ fontSize: 24 }} />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-slate-900">
                          Phân Phối
                        </h2>
                        <p className="text-sm text-slate-600 mt-0.5">
                          Theo dõi phân bổ nguồn lực
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
                  {distributions.map((dist) => {
                    const status = getDistributionStatusBadge(dist.status);
                    return (
                      <div
                        key={dist.id}
                        className="group p-5 rounded-2xl border-2 border-slate-100 hover:border-blue-200 bg-slate-50/50 hover:bg-blue-50/50 transition-all duration-300"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="text-base font-bold text-slate-900 mb-1">
                              {dist.area}
                            </h3>
                            <p className="text-xs text-slate-600 mb-2">
                              {dist.items}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <span className="font-medium">{dist.team}</span>
                              <span>•</span>
                              <span>{dist.people} người</span>
                            </div>
                          </div>
                          <span
                            className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold ${status.style}`}
                          >
                            {status.label}
                          </span>
                        </div>

                        {dist.status !== "pending" && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-semibold text-slate-600">
                                Tiến độ
                              </span>
                              <span className="text-xs font-bold text-slate-900">
                                {dist.progress}%
                              </span>
                            </div>
                            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-700"
                                style={{ width: `${dist.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        )}

                        <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between">
                          <span className="text-xs text-slate-500">
                            {dist.timestamp}
                          </span>
                          <button className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                            Chi tiết →
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden p-12">
                <div className="text-center">
                  <LockIcon
                    sx={{ fontSize: 48 }}
                    className="text-slate-300 mb-4"
                  />
                  <h3 className="text-xl font-bold text-slate-700 mb-2">
                    Không có quyền truy cập
                  </h3>
                  <p className="text-slate-500">
                    Bạn không có quyền theo dõi phân phối.
                  </p>
                </div>
              </div>
            )}

            {/* Inventory Management - Modern Design */}
            {canManageInventory ? (
              <div className="xl:col-span-3 bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-transparent">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20">
                        <BoxIcon sx={{ fontSize: 24 }} />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-slate-900">
                          Quản Lý Kho Vật Tư
                        </h2>
                        <p className="text-sm text-slate-600 mt-0.5">
                          Mức tồn kho và tình trạng kho hàng
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <SearchIcon
                          sx={{ fontSize: 18 }}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                          type="text"
                          placeholder="Tìm kiếm vật tư..."
                          className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>
                      {canViewReports && (
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold transition-colors">
                          <DownloadIcon sx={{ fontSize: 18 }} />
                          <span>Xuất báo cáo</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50/50">
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                          Vật Tư
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                          Danh Mục
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                          Số Lượng
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                          Trạng Thái
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                          Kho
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                          Nhập Thêm
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventory.map((item, idx) => {
                        const status = getInventoryStatusBadge(item.status);
                        return (
                          <tr
                            key={item.id}
                            className={`border-b border-slate-100 hover:bg-slate-50/50 transition-colors ${
                              idx === inventory.length - 1 ? "border-b-0" : ""
                            }`}
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                                  <BoxIcon
                                    sx={{ fontSize: 20 }}
                                    className="text-slate-600"
                                  />
                                </div>
                                <div className="text-sm font-bold text-slate-900">
                                  {item.name}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold">
                                {item.category}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-bold text-slate-900">
                                {item.quantity.toLocaleString()} {item.unit}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold ${status.style}`}
                              >
                                {status.label}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-slate-900">
                                {item.warehouse}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold ${
                                  item.status === "critical"
                                    ? "bg-red-100 text-red-700"
                                    : item.status === "warning"
                                      ? "bg-amber-100 text-amber-700"
                                      : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                <ScheduleIcon
                                  sx={{ fontSize: 14 }}
                                  className="mr-1"
                                />
                                {item.restock}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="xl:col-span-3 bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden p-12">
                <div className="text-center">
                  <LockIcon
                    sx={{ fontSize: 48 }}
                    className="text-slate-300 mb-4"
                  />
                  <h3 className="text-xl font-bold text-slate-700 mb-2">
                    Không có quyền truy cập
                  </h3>
                  <p className="text-slate-500">
                    Bạn không có quyền quản lý kho vật tư.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notification Popup */}
      <Notification
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        alerts={alerts}
      />
    </div>
  );
}
