import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/manager/Sidebar";
import Notification from "../../components/manager/Notification";
import { usePermission } from "../../hooks/usePermission";
import { Permission } from "../../constants/permissions";
import { Role } from "../../constants/roles";
import { vehiclesApi } from "../../api/vehicles";
import { teamsApi } from "../../api/teams";
import { suppliesApi } from "../../api/supplies";
import { importBatchesApi } from "../../api/importBatches";
import { requestsApi } from "../../api/requests";
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

  const canManageVehicles = hasPermission(Permission.MANAGE_VEHICLES);
  const canManageInventory = hasPermission(Permission.MANAGE_INVENTORY);
  const canTrackDistributions = hasPermission(Permission.TRACK_DISTRIBUTIONS);
  const canViewReports = hasPermission(Permission.VIEW_RESOURCE_REPORTS);

  const [selectedTimeframe, setSelectedTimeframe] = useState("today");
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [loading, setLoading] = useState(true);

  const [vehicles, setVehicles] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [distributions, setDistributions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [statsData, setStatsData] = useState({
    vehicleCount: 0,
    teamCount: 0,
    supplyTotal: 0,
    completedRequests: 0,
  });

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [vehiclesRes, teamsRes, overviewRes, distributionsRes, statsRes] =
        await Promise.allSettled([
          vehiclesApi.getAll({ limit: 100 }),
          teamsApi.getAll({ limit: 100 }),
          importBatchesApi.getOverview(),
          suppliesApi.getDistributions({ limit: 10 }),
          requestsApi.getStats(),
        ]);

      const vehiclesList =
        vehiclesRes.status === "fulfilled"
          ? vehiclesRes.value?.data || vehiclesRes.value || []
          : [];
      setVehicles(Array.isArray(vehiclesList) ? vehiclesList : []);

      const teamsList =
        teamsRes.status === "fulfilled"
          ? teamsRes.value?.data || teamsRes.value || []
          : [];

      const overview =
        overviewRes.status === "fulfilled"
          ? overviewRes.value?.data || overviewRes.value || {}
          : {};

      const supplyItems = overview.supplies || [];

      const mappedInventory = supplyItems.map((item) => ({
        id: item.id || item.supply_id,
        name: item.name,
        quantity: item.total_remaining ?? 0,
        unit: item.unit || "",
        category: item.category || "Khác",
        province_city: item.province_city || "",
        min_quantity: item.min_quantity ?? 0,
        status:
          (item.total_remaining ?? 0) <= (item.min_quantity ?? 0)
            ? "critical"
            : (item.total_remaining ?? 0) <= (item.min_quantity ?? 0) * 2
              ? "warning"
              : "good",
      }));
      setInventory(mappedInventory);

      const lowStockAlerts = mappedInventory
        .filter((item) => item.status === "critical")
        .map((item, idx) => ({
          id: `low-${idx}`,
          type: "critical",
          title: `${item.name} sắp hết`,
          message: `Còn lại: ${item.quantity} ${item.unit} (tối thiểu: ${item.min_quantity})`,
          time: "Cập nhật vừa xong",
        }));

      const warningAlerts = mappedInventory
        .filter((item) => item.status === "warning")
        .map((item, idx) => ({
          id: `warn-${idx}`,
          type: "warning",
          title: `${item.name} sắp cần nhập thêm`,
          message: `Còn lại: ${item.quantity} ${item.unit}`,
          time: "Cập nhật vừa xong",
        }));
      setAlerts([...lowStockAlerts, ...warningAlerts].slice(0, 5));

      const distList =
        distributionsRes.status === "fulfilled"
          ? distributionsRes.value?.data || distributionsRes.value || []
          : [];
      setDistributions(Array.isArray(distList) ? distList : []);

      const rescueStats =
        statsRes.status === "fulfilled"
          ? statsRes.value?.data || statsRes.value || {}
          : {};

      const vArr = Array.isArray(vehiclesList) ? vehiclesList : [];
      const tArr = Array.isArray(teamsList) ? teamsList : [];
      const activeVehicles = vArr.filter(
        (v) => v.status === "available" || v.status === "in_use"
      ).length;

      setStatsData({
        vehicleCount: activeVehicles || vArr.length,
        teamCount: tArr.length,
        supplyTotal: overview.total_items ?? mappedInventory.length,
        completedRequests:
          rescueStats.completed ?? rescueStats.total_completed ?? 0,
      });
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && hasRole([Role.MANAGER, Role.ADMIN])) {
      fetchDashboardData();
    }
  }, [isAuthenticated, hasRole, fetchDashboardData]);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    navigate("/login");
  };

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

  const stats = [
    {
      title: "Phương Tiện",
      value: String(statsData.vehicleCount),
      subtitle: "Đang hoạt động",
      icon: <VehicleIcon sx={{ fontSize: 28 }} />,
      iconBg: "bg-gradient-to-br from-blue-500 to-indigo-600",
    },
    {
      title: "Đội Cứu Hộ",
      value: String(statsData.teamCount),
      subtitle: "Đã đăng ký",
      icon: <GroupIcon sx={{ fontSize: 28 }} />,
      iconBg: "bg-gradient-to-br from-emerald-500 to-teal-600",
    },
    {
      title: "Vật Tư Thiết Yếu",
      value: String(statsData.supplyTotal),
      subtitle: "Mặt hàng trong kho",
      icon: <BoxIcon sx={{ fontSize: 28 }} />,
      iconBg: "bg-gradient-to-br from-violet-500 to-purple-700",
    },
    {
      title: "Nhiệm Vụ Hoàn Thành",
      value: String(statsData.completedRequests),
      subtitle: "Tổng cộng",
      icon: <HeartIcon sx={{ fontSize: 28 }} />,
      iconBg: "bg-gradient-to-br from-rose-500 to-pink-700",
    },
  ];

  const getVehicleStatusBadge = (status) => {
    const styles = {
      available: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-600/20",
      in_use: "bg-blue-100 text-blue-700 ring-1 ring-blue-600/20",
      maintenance: "bg-amber-100 text-amber-700 ring-1 ring-amber-600/20",
      unavailable: "bg-slate-100 text-slate-700 ring-1 ring-slate-600/20",
    };
    const labels = {
      available: "Sẵn sàng",
      in_use: "Đang sử dụng",
      maintenance: "Bảo trì",
      unavailable: "Không khả dụng",
    };
    return {
      style: styles[status] || styles.unavailable,
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

  const formatDistDate = (d) => {
    if (!d) return "";
    const dt = new Date(d);
    const diff = Date.now() - dt.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} phút trước`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} giờ trước`;
    return `${Math.floor(hrs / 24)} ngày trước`;
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        <div className="p-8 max-w-[1800px] mx-auto">
          {/* Header */}
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

                <div className="flex items-center gap-2.5 px-5 py-3 bg-white border border-emerald-200 rounded-2xl shadow-sm shadow-emerald-100">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="text-sm font-semibold text-emerald-700">
                    Trực tiếp
                  </span>
                </div>

                <button
                  onClick={fetchDashboardData}
                  className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 font-semibold group"
                >
                  <SyncIcon
                    sx={{ fontSize: 20 }}
                    className={`group-hover:rotate-180 transition-transform duration-700 ${loading ? "animate-spin" : ""}`}
                  />
                  <span>Làm mới</span>
                </button>

                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full border-2 border-white shadow-md flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-blue-400 transition-all"
                  >
                    <span className="text-white font-bold text-sm">MN</span>
                  </button>

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
                        </div>
                        <div className="border-t border-slate-200 pt-2">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full font-semibold"
                          >
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

          {loading ? (
            <div className="flex items-center justify-center py-32">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-slate-600">Đang tải dữ liệu...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className="group relative bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl border border-slate-200/60 hover:border-slate-300/60 transition-all duration-500 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-slate-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative">
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className={`p-3.5 rounded-2xl ${stat.iconBg} shadow-lg shadow-black/10 text-white transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}
                        >
                          {stat.icon}
                        </div>
                      </div>
                      <div className="space-y-1">
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
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Vehicle Management */}
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
                              {vehicles.length} phương tiện đã đăng ký
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
                              Khu Vực
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                              Biển Số
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {vehicles.length === 0 ? (
                            <tr>
                              <td
                                colSpan={4}
                                className="px-6 py-12 text-center text-slate-500"
                              >
                                Chưa có phương tiện nào
                              </td>
                            </tr>
                          ) : (
                            vehicles.slice(0, 6).map((vehicle, idx) => {
                              const status = getVehicleStatusBadge(
                                vehicle.status
                              );
                              return (
                                <tr
                                  key={vehicle.id}
                                  className={`border-b border-slate-100 hover:bg-slate-50/50 transition-colors ${
                                    idx === Math.min(vehicles.length, 6) - 1
                                      ? "border-b-0"
                                      : ""
                                  }`}
                                >
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                                        <VehicleIcon
                                          sx={{ fontSize: 20 }}
                                          className="text-slate-600"
                                        />
                                      </div>
                                      <div>
                                        <div className="text-sm font-bold text-slate-900">
                                          {vehicle.name}
                                        </div>
                                        <div className="text-xs text-slate-500">
                                          {vehicle.type}
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
                                      <span className="text-sm font-medium text-slate-900">
                                        {vehicle.province_city || "—"}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className="text-sm font-mono text-slate-700">
                                      {vehicle.license_plate || "—"}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                    {vehicles.length > 6 && (
                      <div className="px-6 py-3 border-t border-slate-100 text-center">
                        <button
                          onClick={() => navigate("/manager/vehicles")}
                          className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                        >
                          Xem tất cả {vehicles.length} phương tiện →
                        </button>
                      </div>
                    )}
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

                {/* Distribution Tracking */}
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
                              {distributions.length} lượt phân phối gần nhất
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
                      {distributions.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                          <ShipIcon
                            sx={{ fontSize: 40 }}
                            className="text-slate-300 mb-2"
                          />
                          <p className="text-sm">Chưa có lượt phân phối nào</p>
                        </div>
                      ) : (
                        distributions.slice(0, 5).map((dist) => (
                          <div
                            key={dist.id}
                            className="group p-5 rounded-2xl border-2 border-slate-100 hover:border-blue-200 bg-slate-50/50 hover:bg-blue-50/50 transition-all duration-300"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h3 className="text-base font-bold text-slate-900 mb-1">
                                  {dist.supply?.name || dist.Supply?.name || `Vật tư #${dist.supply_id?.slice(0, 8)}`}
                                </h3>
                                <div className="flex items-center gap-3 text-xs text-slate-600 mb-1">
                                  <span>
                                    Số lượng:{" "}
                                    <span className="font-semibold text-slate-900">
                                      {dist.quantity}
                                    </span>
                                    {(dist.supply?.unit || dist.Supply?.unit) && (
                                      <span className="ml-1 text-slate-500">
                                        {dist.supply?.unit || dist.Supply?.unit}
                                      </span>
                                    )}
                                  </span>
                                  {(dist.supply?.category || dist.Supply?.category) && (
                                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold">
                                      {dist.supply?.category || dist.Supply?.category}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                  <span className="font-medium">
                                    {dist.team?.name || dist.RescueTeam?.name || `Đội #${dist.team_id?.slice(0, 8)}`}
                                  </span>
                                  {(dist.manager?.username || dist.manager?.email) && (
                                    <span className="text-slate-400">
                                      · Bởi {dist.manager?.username || dist.manager?.email}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-700 ring-1 ring-emerald-600/20">
                                Đã phân phối
                              </span>
                            </div>
                            {dist.notes && (
                              <p className="text-xs text-slate-500 italic mb-2">
                                {dist.notes}
                              </p>
                            )}
                            <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between">
                              <span className="text-xs text-slate-500">
                                {formatDistDate(dist.created_at)}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
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

                {/* Inventory Management */}
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
                              {inventory.length} mặt hàng trong kho
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
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
                              Tồn Kho
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                              Trạng Thái
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                              Khu Vực
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {inventory.length === 0 ? (
                            <tr>
                              <td
                                colSpan={5}
                                className="px-6 py-12 text-center text-slate-500"
                              >
                                Chưa có vật tư nào trong kho
                              </td>
                            </tr>
                          ) : (
                            inventory.slice(0, 8).map((item, idx) => {
                              const status = getInventoryStatusBadge(
                                item.status
                              );
                              return (
                                <tr
                                  key={item.id}
                                  className={`border-b border-slate-100 hover:bg-slate-50/50 transition-colors ${
                                    idx === Math.min(inventory.length, 8) - 1
                                      ? "border-b-0"
                                      : ""
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
                                      {item.quantity.toLocaleString()}{" "}
                                      {item.unit}
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
                                      {item.province_city || "—"}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                    {inventory.length > 8 && (
                      <div className="px-6 py-3 border-t border-slate-100 text-center">
                        <button
                          onClick={() => navigate("/manager/inventory")}
                          className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                        >
                          Xem tất cả {inventory.length} mặt hàng →
                        </button>
                      </div>
                    )}
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
            </>
          )}
        </div>
      </div>

      <Notification
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        alerts={alerts}
      />
    </div>
  );
}
