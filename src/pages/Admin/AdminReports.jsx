import React, { useState, useEffect, useCallback } from "react";
import {
  FiTrendingUp,
  FiUsers,
  FiTruck,
  FiDollarSign,
  FiMap,
  FiDownload,
  FiFileText,
  FiGrid,
  FiZoomIn,
  FiZoomOut,
} from "react-icons/fi";
import { SiJsonwebtokens } from "react-icons/si";
import Sidebar from "../../components/admin/Sidebar";
import { requestsApi } from "../../api/requests";
import { vehiclesApi } from "../../api/vehicles";
import { importBatchesApi } from "../../api/importBatches";
import { usersApi } from "../../api/users";

const AdminReports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("Tháng này");
  const [exportFrequency, setExportFrequency] = useState("daily");
  const [loading, setLoading] = useState(true);
  const [kpiData, setKpiData] = useState([]);
  const [requestsByStatus, setRequestsByStatus] = useState({});

  const fetchReportData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, vehiclesRes, overviewRes, usersRes] =
        await Promise.allSettled([
          requestsApi.getStats(),
          vehiclesApi.getAll({ limit: 200 }),
          importBatchesApi.getOverview(),
          usersApi.getAll({ limit: 200 }),
        ]);

      const stats =
        statsRes.status === "fulfilled"
          ? statsRes.value?.data || statsRes.value || {}
          : {};

      const vehicles =
        vehiclesRes.status === "fulfilled"
          ? vehiclesRes.value?.data || vehiclesRes.value || []
          : [];
      const vehiclesList = Array.isArray(vehicles) ? vehicles : [];

      const overview =
        overviewRes.status === "fulfilled"
          ? overviewRes.value?.data || overviewRes.value || {}
          : {};

      const users =
        usersRes.status === "fulfilled"
          ? usersRes.value?.data || usersRes.value || []
          : [];
      const usersList = Array.isArray(users) ? users : [];

      const totalRequests = stats.total || stats.total_requests || 0;
      const completedRequests = stats.completed || stats.total_completed || 0;
      const completionRate =
        totalRequests > 0
          ? Math.round((completedRequests / totalRequests) * 100)
          : 0;

      const totalVehicles = vehiclesList.length;
      const availableVehicles = vehiclesList.filter(
        (v) => v.status === "available"
      ).length;
      const vehicleUsageRate =
        totalVehicles > 0
          ? Math.round(
              ((totalVehicles - availableVehicles) / totalVehicles) * 100
            )
          : 0;

      const totalSupplyTypes = overview.supplies?.length || overview.total_items || 0;
      const lowStock = overview.supplies
        ? overview.supplies.filter(
            (s) => (s.total_remaining ?? 0) <= (s.min_quantity ?? 0)
          ).length
        : overview.low_stock || 0;
      const supplyHealth =
        totalSupplyTypes > 0
          ? Math.round(((totalSupplyTypes - lowStock) / totalSupplyTypes) * 100)
          : 0;

      setRequestsByStatus(stats);

      setKpiData([
        {
          title: "Yêu cầu cứu hộ",
          value: totalRequests.toLocaleString(),
          subtitle: `/ ${completedRequests.toLocaleString()} hoàn thành`,
          percentage: `${completionRate}% thành công`,
          trend: completionRate >= 50 ? "up" : "neutral",
          progress: completionRate,
          icon: <FiUsers className="text-emerald-400" size={24} />,
          color: "emerald",
          updated: `${usersList.length} người dùng`,
        },
        {
          title: "Phương tiện",
          value: totalVehicles.toLocaleString(),
          subtitle: "phương tiện",
          percentage: `${availableVehicles} sẵn sàng`,
          trend: availableVehicles > 0 ? "up" : "neutral",
          progress: totalVehicles > 0 ? Math.round((availableVehicles / totalVehicles) * 100) : 0,
          icon: <FiTruck className="text-teal-400" size={24} />,
          color: "teal",
          updated: `${vehicleUsageRate}% đang sử dụng`,
        },
        {
          title: "Kho vật tư",
          value: String(totalSupplyTypes),
          subtitle: "mặt hàng",
          percentage: `${supplyHealth}% đầy đủ`,
          trend: supplyHealth >= 80 ? "up" : "neutral",
          progress: supplyHealth,
          icon: <FiDollarSign className="text-orange-400" size={24} />,
          color: "orange",
          updated: lowStock > 0 ? `${lowStock} thiếu hàng` : "Đủ hàng",
        },
      ]);
    } catch (err) {
      console.error("Admin report fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  const handleExport = (type) => {
    console.log(`Exporting as ${type}...`);
  };

  const kpiStyles = {
    emerald: {
      glow: "bg-emerald-500/10",
      progress: "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.45)]",
    },
    teal: {
      glow: "bg-teal-500/10",
      progress: "bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.45)]",
    },
    orange: {
      glow: "bg-orange-500/10",
      progress:
        "bg-gradient-to-r from-orange-500 to-red-500 shadow-[0_0_10px_rgba(249,115,22,0.45)]",
    },
  };

  const statusSummary = [
    { key: "new", label: "Mới", color: "bg-slate-500" },
    { key: "pending_verification", label: "Chờ xác minh", color: "bg-yellow-500" },
    { key: "verified", label: "Đã xác minh", color: "bg-blue-500" },
    { key: "on_mission", label: "Đang cứu hộ", color: "bg-indigo-500" },
    { key: "completed", label: "Hoàn thành", color: "bg-emerald-500" },
    { key: "rejected", label: "Từ chối", color: "bg-red-500" },
  ];

  return (
    <div className="h-screen overflow-hidden flex bg-gray-50">
      <Sidebar />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500/50 z-10"></div>

        <header className="bg-white border-b border-gray-200 px-8 py-6 shrink-0 z-0">
          <div className="max-w-[1600px] mx-auto">
            <div className="flex flex-wrap gap-6 justify-between items-end">
              <div>
                <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                  <span>Admin</span>
                  <span>/</span>
                  <span className="text-gray-900">Báo cáo</span>
                </div>
                <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
                  Báo cáo tổng hợp toàn quốc
                </h1>
                <p className="text-gray-600 mt-2 text-sm max-w-2xl leading-relaxed flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                  Dữ liệu thời gian thực từ hệ thống
                </p>
              </div>

              <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-gray-200 shadow-sm">
                <button
                  onClick={fetchReportData}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors flex items-center gap-1"
                >
                  Làm mới
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto bg-gray-50 px-8 py-6">
          <div className="max-w-[1600px] mx-auto space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-32">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
                  <p className="text-gray-600">Đang tải báo cáo...</p>
                </div>
              </div>
            ) : (
              <>
                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {kpiData.map((kpi, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-2xl p-6 border border-gray-200 relative overflow-hidden group hover:border-emerald-400 transition-all duration-300 shadow-sm hover:shadow-emerald-200/50 hover:-translate-y-1"
                    >
                      <div
                        className={`absolute -right-6 -top-6 w-32 h-32 ${kpiStyles[kpi.color].glow} rounded-full blur-2xl transition-all group-hover:scale-110`}
                      ></div>
                      <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                          <p className="text-gray-600 text-sm font-medium tracking-wide">
                            {kpi.title}
                          </p>
                          {kpi.icon}
                        </div>
                        <div className="flex items-baseline gap-2 mb-2">
                          <h3 className="text-4xl font-bold text-gray-900 tracking-tight">
                            {kpi.value}
                          </h3>
                          <span className="text-xl font-normal text-gray-600">
                            {kpi.subtitle}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <span
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${
                              kpi.trend === "up"
                                ? "bg-green-500/10 text-green-400 border-green-500/20"
                                : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                            } text-xs font-bold border`}
                          >
                            {kpi.trend === "up" && <FiTrendingUp size={14} />}
                            {kpi.percentage}
                          </span>
                          <span className="text-gray-500 text-xs font-mono">
                            {kpi.updated}
                          </span>
                        </div>
                        <div className="mt-4 w-full bg-gray-200 h-1 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${kpiStyles[kpi.color].progress}`}
                            style={{ width: `${kpi.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Status breakdown + Map placeholder */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-1 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-gray-900 font-bold text-lg mb-4">
                      Phân bổ theo trạng thái
                    </h3>
                    <div className="space-y-3">
                      {statusSummary.map((s) => {
                        const count = requestsByStatus[s.key] || 0;
                        const total =
                          requestsByStatus.total ||
                          requestsByStatus.total_requests ||
                          1;
                        const pct =
                          total > 0 ? Math.round((count / total) * 100) : 0;
                        return (
                          <div key={s.key}>
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`w-2.5 h-2.5 rounded-full ${s.color}`}
                                ></span>
                                <span className="text-sm text-gray-700 font-medium">
                                  {s.label}
                                </span>
                              </div>
                              <span className="text-sm font-bold text-gray-900">
                                {count}
                              </span>
                            </div>
                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${s.color} transition-all duration-500`}
                                style={{ width: `${pct}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl flex flex-col relative overflow-hidden h-[400px] shadow-sm">
                    <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-emerald-100/50 to-transparent pointer-events-none z-10"></div>
                    <div className="p-6 z-10 flex justify-between items-start pointer-events-none">
                      <div className="bg-white/90 backdrop-blur-md p-3 rounded-xl border border-gray-200 pointer-events-auto shadow-sm">
                        <h3 className="text-gray-900 font-bold text-lg leading-none mb-1">
                          Bản đồ nhiệt
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                          <p className="text-gray-500 text-[10px] font-mono uppercase">
                            Hoạt động thời gian thực
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center">
                      <div className="text-center p-8">
                        <FiMap
                          className="text-emerald-500 mx-auto mb-4"
                          size={64}
                        />
                        <p className="text-gray-600 text-sm">
                          Bản đồ nhiệt hiển thị hoạt động cứu hộ
                        </p>
                        <p className="text-gray-400 text-xs mt-2">
                          Tích hợp bản đồ thời gian thực
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Export Section */}
                <div className="bg-white border border-gray-200 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 hidden md:block border border-emerald-100">
                      <FiDownload size={28} />
                    </div>
                    <div>
                      <h3 className="text-gray-900 font-bold text-lg">
                        Xuất báo cáo định kỳ
                      </h3>
                      <p className="text-gray-600 text-sm mt-1 max-w-md">
                        Tải xuống dữ liệu thô hoặc báo cáo đã định dạng để tích
                        hợp với hệ thống bên thứ ba.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-6 w-full md:w-auto">
                    <div className="flex bg-gray-50 p-1.5 rounded-xl border border-gray-200 w-full sm:w-auto">
                      {["daily", "weekly", "monthly"].map((freq) => (
                        <button
                          key={freq}
                          onClick={() => setExportFrequency(freq)}
                          className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-medium transition-all ${
                            exportFrequency === freq
                              ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                              : "text-gray-600 hover:text-gray-900 hover:bg-white"
                          }`}
                        >
                          {freq === "daily"
                            ? "Hàng ngày"
                            : freq === "weekly"
                              ? "Hàng tuần"
                              : "Hàng tháng"}
                        </button>
                      ))}
                    </div>

                    <div className="h-8 w-[1px] bg-gray-200 hidden sm:block"></div>

                    <div className="flex gap-3 w-full sm:w-auto">
                      <button
                        onClick={() => handleExport("pdf")}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white hover:bg-rose-50 border border-gray-200 hover:border-rose-200 text-gray-700 px-5 py-2.5 rounded-xl transition-colors group shadow-sm"
                      >
                        <FiFileText
                          className="text-rose-500 group-hover:text-rose-600 transition-colors"
                          size={20}
                        />
                        <span className="text-sm font-medium">PDF</span>
                      </button>
                      <button
                        onClick={() => handleExport("excel")}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white hover:bg-emerald-50 border border-gray-200 hover:border-emerald-200 text-gray-700 px-5 py-2.5 rounded-xl transition-colors group shadow-sm"
                      >
                        <FiGrid
                          className="text-emerald-500 group-hover:text-emerald-600 transition-colors"
                          size={20}
                        />
                        <span className="text-sm font-medium">Excel</span>
                      </button>
                      <button
                        onClick={() => handleExport("json")}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-teal-600 hover:to-emerald-500 text-white px-5 py-2.5 rounded-xl transition-colors font-bold shadow-lg shadow-emerald-300/50"
                      >
                        <SiJsonwebtokens size={20} />
                        <span className="text-sm">JSON API</span>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminReports;
