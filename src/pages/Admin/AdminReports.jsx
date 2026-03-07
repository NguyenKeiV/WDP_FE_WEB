import React, { useState } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  FiTrendingUp,
  FiTrendingDown,
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

const AdminReports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("Tháng 10, 2023");
  const [exportFrequency, setExportFrequency] = useState("daily");

  // Dữ liệu mẫu cho biểu đồ thời gian phản hồi
  const responseTimeData = [
    { day: "Mon", daNang: 8, haNoi: 10, tpHCM: 14 },
    { day: "Tue", daNang: 7, haNoi: 9, tpHCM: 15 },
    { day: "Wed", daNang: 5, haNoi: 8, tpHCM: 16 },
    { day: "Thu", daNang: 4, haNoi: 7, tpHCM: 15 },
    { day: "Fri", daNang: 3, haNoi: 9, tpHCM: 17 },
    { day: "Sat", daNang: 4, haNoi: 6, tpHCM: 14 },
    { day: "Sun", daNang: 4.5, haNoi: 7, tpHCM: 16 },
  ];

  // KPI Cards Data
  const kpiData = [
    {
      title: "Yêu cầu vs Đã cứu",
      value: "1,245",
      subtitle: "/ 1,100",
      percentage: "98% thành công",
      trend: "up",
      progress: 88,
      icon: <FiUsers className="text-emerald-400" size={24} />,
      color: "emerald",
      updated: "1M AGO",
    },
    {
      title: "Tài sản điều động",
      value: "450",
      subtitle: "phương tiện",
      percentage: "+12% huy động",
      trend: "up",
      progress: 75,
      icon: <FiTruck className="text-teal-400" size={24} />,
      color: "teal",
      updated: "TOTAL ASSETS",
    },
    {
      title: "Ngân sách sử dụng",
      value: "12.5",
      subtitle: "Tỷ VND",
      percentage: "75% phân bổ",
      trend: "neutral",
      progress: 75,
      icon: <FiDollarSign className="text-orange-400" size={24} />,
      color: "orange",
      updated: "REMAINING: 4.2 Tỷ",
    },
  ];

  const handleExport = (type) => {
    console.log(`Exporting as ${type}...`);
    // Implement export logic here
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

  return (
    <div className="h-screen overflow-hidden flex bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Gradient Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500/50 z-10"></div>
        {/* Header Section */}
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
                  Dữ liệu thời gian thực từ các trung tâm điều phối
                </p>
              </div>

              {/* Time Period Filter */}
              <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-gray-200 shadow-sm">
                <div className="flex items-center bg-gray-50 rounded-xl p-1 border border-gray-200">
                  <button className="px-3 py-1.5 text-xs font-semibold rounded-lg hover:bg-white text-gray-600 transition-colors">
                    Tháng trước
                  </button>
                  <button className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white text-gray-900 shadow-sm border border-gray-200">
                    {selectedPeriod}
                  </button>
                </div>
                <div className="w-[1px] h-6 bg-gray-200 mx-1"></div>
                <button className="flex items-center gap-2 text-gray-900 px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors group">
                  <span className="text-gray-600 text-sm group-hover:text-emerald-600 transition-colors">
                    📅
                  </span>
                  <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900">
                    Chọn khoảng thời gian
                  </span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto bg-gray-50 px-8 py-6">
          <div className="max-w-[1600px] mx-auto space-y-6">
            {/* KPI Cards Row */}
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
                    {/* Progress Bar */}
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

            {/* Main Visualization Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Map Section */}
              <div className="lg:col-span-1 bg-white border border-gray-200 rounded-2xl flex flex-col relative overflow-hidden h-[500px] shadow-sm">
                <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-emerald-100/50 to-transparent pointer-events-none z-10"></div>

                {/* Header Overlay */}
                <div className="p-6 z-10 flex justify-between items-start pointer-events-none">
                  <div className="bg-white/90 backdrop-blur-md p-3 rounded-xl border border-gray-200 pointer-events-auto shadow-sm">
                    <h3 className="text-gray-900 font-bold text-lg leading-none mb-1">
                      Bản đồ nhiệt
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                      <p className="text-gray-500 text-[10px] font-mono uppercase">
                        Live Activity
                      </p>
                    </div>
                  </div>
                  <button className="bg-white/90 backdrop-blur-md p-2 rounded-xl border border-gray-200 text-gray-600 hover:text-emerald-600 pointer-events-auto transition-colors shadow-sm">
                    <FiMap size={20} />
                  </button>
                </div>

                {/* Map Container */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-teal-50 group flex items-center justify-center">
                  <div className="text-center p-8">
                    <FiMap
                      className="text-emerald-500 mx-auto mb-4"
                      size={64}
                    />
                    <p className="text-gray-600 text-sm">
                      Bản đồ nhiệt hiển thị hoạt động cứu hộ
                    </p>
                    <p className="text-gray-400 text-xs mt-2">
                      Tích hợp với React-Leaflet
                    </p>
                  </div>

                  {/* Map UI Overlay (Bottom) */}
                  <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end z-10 pointer-events-none">
                    <div className="bg-white/90 backdrop-blur-md p-3 rounded-xl border border-gray-200 pointer-events-auto shadow-sm">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]"></div>
                        <span className="text-[10px] text-gray-600 uppercase font-bold tracking-wider">
                          High Intensity
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>
                        <span className="text-[10px] text-gray-600 uppercase font-bold tracking-wider">
                          Moderate
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 pointer-events-auto">
                      <button className="w-9 h-9 rounded-xl bg-white text-gray-700 flex items-center justify-center hover:bg-emerald-50 border border-gray-200 hover:border-emerald-300 transition-colors shadow-sm">
                        <FiZoomIn size={18} />
                      </button>
                      <button className="w-9 h-9 rounded-xl bg-white text-gray-700 flex items-center justify-center hover:bg-emerald-50 border border-gray-200 hover:border-emerald-300 transition-colors shadow-sm">
                        <FiZoomOut size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-8 flex flex-col h-[500px] shadow-sm">
                <div className="flex flex-wrap justify-between items-start mb-8 gap-4">
                  <div>
                    <h3 className="text-gray-900 font-bold text-xl">
                      Thời gian phản hồi trung bình
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                      So sánh hiệu suất phản hồi (giờ) giữa các tỉnh trọng điểm
                      trong 7 ngày qua.
                    </p>
                  </div>
                  <div className="flex items-center bg-gray-50 p-1.5 rounded-xl border border-gray-200 gap-4 px-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_5px_#10b981]"></span>
                      <span className="text-xs text-gray-700 font-semibold">
                        Đà Nẵng
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-teal-600"></span>
                      <span className="text-xs text-gray-700 font-semibold">
                        Hà Nội
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-slate-600"></span>
                      <span className="text-xs text-gray-700 font-semibold">
                        TP. HCM
                      </span>
                    </div>
                  </div>
                </div>

                {/* Chart Area */}
                <div className="flex-1 w-full min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={responseTimeData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="colorDaNang"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#10b981"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#10b981"
                            stopOpacity={0}
                          />
                        </linearGradient>
                        <linearGradient
                          id="colorHaNoi"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#14b8a6"
                            stopOpacity={0.2}
                          />
                          <stop
                            offset="95%"
                            stopColor="#14b8a6"
                            stopOpacity={0}
                          />
                        </linearGradient>
                        <linearGradient
                          id="colorHCM"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#4b5563"
                            stopOpacity={0.2}
                          />
                          <stop
                            offset="95%"
                            stopColor="#4b5563"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#e5e7eb"
                        opacity={1}
                      />
                      <XAxis
                        dataKey="day"
                        stroke="#6b7280"
                        style={{ fontSize: "12px", fontWeight: "600" }}
                      />
                      <YAxis
                        stroke="#6b7280"
                        style={{ fontSize: "10px" }}
                        label={{
                          value: "Giờ",
                          angle: -90,
                          position: "insideLeft",
                          fill: "#6b7280",
                        }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#ffffff",
                          border: "1px solid #e5e7eb",
                          borderRadius: "12px",
                          color: "#111827",
                          fontSize: "12px",
                          fontWeight: "600",
                          boxShadow: "0 10px 20px rgba(0,0,0,0.08)",
                        }}
                        labelStyle={{ color: "#111827" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="daNang"
                        stroke="#10b981"
                        strokeWidth={3}
                        fill="url(#colorDaNang)"
                        dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, fill: "#10b981" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="haNoi"
                        stroke="#14b8a6"
                        strokeWidth={2}
                        fill="url(#colorHaNoi)"
                        opacity={0.6}
                        dot={false}
                      />
                      <Area
                        type="monotone"
                        dataKey="tpHCM"
                        stroke="#64748b"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        fill="url(#colorHCM)"
                        opacity={0.6}
                        dot={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
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
                    Tải xuống dữ liệu thô hoặc báo cáo đã định dạng để tích hợp
                    với hệ thống bên thứ ba.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6 w-full md:w-auto">
                {/* Frequency Toggle */}
                <div className="flex bg-gray-50 p-1.5 rounded-xl border border-gray-200 w-full sm:w-auto">
                  <button
                    onClick={() => setExportFrequency("daily")}
                    className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      exportFrequency === "daily"
                        ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                        : "text-gray-600 hover:text-gray-900 hover:bg-white"
                    }`}
                  >
                    Hàng ngày
                  </button>
                  <button
                    onClick={() => setExportFrequency("weekly")}
                    className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      exportFrequency === "weekly"
                        ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                        : "text-gray-600 hover:text-gray-900 hover:bg-white"
                    }`}
                  >
                    Hàng tuần
                  </button>
                  <button
                    onClick={() => setExportFrequency("monthly")}
                    className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      exportFrequency === "monthly"
                        ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                        : "text-gray-600 hover:text-gray-900 hover:bg-white"
                    }`}
                  >
                    Hàng tháng
                  </button>
                </div>

                <div className="h-8 w-[1px] bg-gray-200 hidden sm:block"></div>

                {/* Export Buttons */}
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
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminReports;
