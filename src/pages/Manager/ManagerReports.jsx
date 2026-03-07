import React, { useState } from "react";
import Sidebar from "../../components/manager/Sidebar";
import {
  Assessment as AssessmentIcon,
  BarChart as BarChartIcon,
  ShowChart as ShowChartIcon,
  PieChart as PieChartIcon,
  Timer as TimerIcon,
  Inventory2 as InventoryIcon,
  MedicalServices as MedicalIcon,
  GroupAdd as GroupAddIcon,
  PictureAsPdf as PdfIcon,
  TableView as ExcelIcon,
  MoreVert as MoreIcon,
  FilterList as FilterIcon,
} from "@mui/icons-material";

export default function ManagerReports() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("24h");

  // KPIs data
  const [kpis] = useState([
    {
      id: 1,
      name: "Thời gian phản hồi TB",
      icon: <TimerIcon sx={{ fontSize: 18 }} />,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      target: "< 30 phút",
      actual: "24 phút",
      progress: 100,
      status: "good",
      statusLabel: "Đạt yêu cầu",
    },
    {
      id: 2,
      name: "Tỷ lệ đáp ứng nhu yếu phẩm",
      icon: <InventoryIcon sx={{ fontSize: 18 }} />,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      target: "100%",
      actual: "85%",
      progress: 85,
      status: "warning",
      statusLabel: "Cần cải thiện",
    },
    {
      id: 3,
      name: "Số ca cứu thương thành công",
      icon: <MedicalIcon sx={{ fontSize: 18 }} />,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      target: "---",
      actual: "45 ca",
      progress: 70,
      status: "info",
      statusLabel: "Đang theo dõi",
    },
    {
      id: 4,
      name: "Huy động tình nguyện viên",
      icon: <GroupAddIcon sx={{ fontSize: 18 }} />,
      iconBg: "bg-cyan-100",
      iconColor: "text-cyan-600",
      target: "50 người",
      actual: "62 người",
      progress: 100,
      status: "excellent",
      statusLabel: "Vượt chỉ tiêu",
    },
  ]);

  // Bar chart data - Tiến độ cứu trợ theo vùng
  const regionData = [
    { name: "Vùng A", value: 80, color: "bg-blue-500" },
    { name: "Vùng B", value: 45, color: "bg-blue-500" },
    { name: "Vùng C", value: 95, color: "bg-blue-500" },
    { name: "Vùng D", value: 60, color: "bg-blue-500" },
    { name: "Vùng E", value: 30, color: "bg-blue-500" },
  ];

  // Pie chart data - Cơ cấu lực lượng
  const personnelData = [
    { name: "Chuyên nghiệp", value: 35, color: "bg-cyan-600" },
    { name: "Tình nguyện viên", value: 25, color: "bg-blue-500" },
    { name: "Y tế", value: 25, color: "bg-orange-500" },
    { name: "Hậu cần", value: 15, color: "bg-red-500" },
  ];

  const getStatusBadge = (status) => {
    const styles = {
      good: "bg-emerald-100 text-emerald-700 border-emerald-200",
      warning: "bg-orange-100 text-orange-700 border-orange-200",
      info: "bg-blue-100 text-blue-700 border-blue-200",
      excellent: "bg-emerald-100 text-emerald-700 border-emerald-200",
    };
    return styles[status] || styles.info;
  };

  const getProgressColor = (status) => {
    const colors = {
      good: "bg-emerald-500",
      warning: "bg-orange-500",
      info: "bg-blue-500",
      excellent: "bg-emerald-500",
    };
    return colors[status] || colors.info;
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        <div className="p-8 max-w-[1800px] mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
                  Báo Cáo Hoạt Động Cứu Trợ
                </h1>
                <p className="text-slate-600 text-base">
                  Tổng hợp số liệu phân tích và hiệu quả hoạt động
                </p>
              </div>

              {/* Timeframe Filter */}
              <div className="flex items-center gap-1 p-1 bg-white rounded-2xl border border-slate-200 shadow-sm">
                {[
                  { id: "24h", label: "24h qua" },
                  { id: "7d", label: "7 ngày qua" },
                  { id: "custom", label: "Tùy chỉnh" },
                ].map((time) => (
                  <button
                    key={time.id}
                    onClick={() => setSelectedTimeframe(time.id)}
                    className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                      selectedTimeframe === time.id
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    {time.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
            {/* Bar Chart - Tiến độ cứu trợ theo vùng */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/60 hover:shadow-lg transition-all duration-300">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/20">
                    <BarChartIcon sx={{ fontSize: 20 }} />
                  </div>
                  Tiến độ cứu trợ theo vùng
                </h3>
                <button className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                  <MoreIcon sx={{ fontSize: 20 }} className="text-slate-600" />
                </button>
              </div>

              <div className="flex items-end justify-between gap-4 h-64 px-2 border-b border-slate-200 relative">
                {/* Grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-0">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-full border-t border-slate-200 border-dashed h-0"
                    ></div>
                  ))}
                </div>

                {/* Bars */}
                {regionData.map((region, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col items-center gap-2 flex-1 group"
                  >
                    <div
                      className={`w-full ${region.color} hover:bg-blue-600 transition-all duration-300 rounded-t-xl relative cursor-pointer shadow-lg shadow-blue-500/20`}
                      style={{ height: `${region.value}%` }}
                    >
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-sm font-bold text-slate-900 opacity-0 group-hover:opacity-100 transition-opacity bg-white px-3 py-1 rounded-lg shadow-lg">
                        {region.value}%
                      </span>
                    </div>
                    <span className="text-sm font-medium text-slate-700">
                      {region.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Line Chart - Biến động tồn kho */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/60 hover:shadow-lg transition-all duration-300">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/20">
                    <ShowChartIcon sx={{ fontSize: 20 }} />
                  </div>
                  Biến động tồn kho
                </h3>
                <button className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                  <FilterIcon
                    sx={{ fontSize: 20 }}
                    className="text-slate-600"
                  />
                </button>
              </div>

              <div className="relative h-64 w-full">
                {/* Grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-full border-t border-slate-200 border-dashed h-0"
                    ></div>
                  ))}
                </div>

                {/* SVG Line Chart */}
                <svg
                  className="w-full h-full"
                  preserveAspectRatio="none"
                  viewBox="0 0 100 50"
                >
                  {/* Orange line - Thực phẩm */}
                  <path
                    d="M0,40 L20,35 L40,20 L60,25 L80,10 L100,15"
                    fill="none"
                    stroke="#f97316"
                    strokeWidth="3"
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                  />
                  {/* Green line - Dashed */}
                  <path
                    d="M0,45 L20,40 L40,35 L60,30 L80,25 L100,30"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                    strokeDasharray="4"
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>

                {/* Tooltip */}
                <div className="absolute top-[30%] left-[40%] bg-white border border-slate-200 p-3 rounded-xl shadow-lg z-10">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                    <span className="text-slate-900 font-semibold">
                      Thực phẩm: 1.2 tấn
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between text-sm text-slate-600 mt-4 px-2 font-medium">
                <span>00:00</span>
                <span>06:00</span>
                <span>12:00</span>
                <span>18:00</span>
                <span>24:00</span>
              </div>
            </div>

            {/* Pie Chart - Cơ cấu lực lượng */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/60 hover:shadow-lg transition-all duration-300">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/20">
                    <PieChartIcon sx={{ fontSize: 20 }} />
                  </div>
                  Cơ cấu lực lượng
                </h3>
              </div>

              <div className="flex flex-col items-center justify-center pt-4">
                {/* Donut Chart */}
                <div className="relative h-44 w-44 rounded-full mb-6 shadow-xl">
                  <svg
                    className="w-full h-full -rotate-90"
                    viewBox="0 0 100 100"
                  >
                    {/* Background circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#e2e8f0"
                      strokeWidth="16"
                    />
                    {/* Colored segments */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#0891b2"
                      strokeWidth="16"
                      strokeDasharray="87.96 251.2"
                      strokeDashoffset="0"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="16"
                      strokeDasharray="62.8 251.2"
                      strokeDashoffset="-87.96"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#f97316"
                      strokeWidth="16"
                      strokeDasharray="62.8 251.2"
                      strokeDashoffset="-150.76"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="16"
                      strokeDasharray="37.68 251.2"
                      strokeDashoffset="-213.56"
                    />
                  </svg>

                  {/* Center content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-slate-900">
                      120
                    </span>
                    <span className="text-xs text-slate-600 uppercase tracking-wider font-semibold">
                      Nhân sự
                    </span>
                  </div>
                </div>

                {/* Legend */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-3 w-full">
                  {personnelData.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span
                        className={`w-3 h-3 rounded-full ${item.color}`}
                      ></span>
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-600">
                          {item.name}
                        </span>
                        <span className="text-sm font-bold text-slate-900">
                          {item.value}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* KPIs Table */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-transparent">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/20">
                    <AssessmentIcon sx={{ fontSize: 24 }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-xl">
                      Tổng Hợp KPIs Hoạt Động
                    </h3>
                    <p className="text-sm text-slate-600 mt-0.5">
                      Cập nhật: 15 phút trước
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors text-sm font-semibold border border-slate-200">
                    <PdfIcon sx={{ fontSize: 18 }} />
                    Xuất PDF
                  </button>
                  <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white transition-all text-sm font-semibold shadow-lg shadow-emerald-500/30">
                    <ExcelIcon sx={{ fontSize: 18 }} />
                    Xuất Excel
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200">
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Chỉ số KPI
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Mục tiêu
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Thực đạt
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Tiến độ
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Trạng thái
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {kpis.map((kpi) => (
                    <tr
                      key={kpi.id}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-10 w-10 rounded-xl ${kpi.iconBg} ${kpi.iconColor} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}
                          >
                            {kpi.icon}
                          </div>
                          <span className="text-slate-900 font-semibold">
                            {kpi.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">
                        {kpi.target}
                      </td>
                      <td className="px-6 py-4 text-slate-900 font-bold">
                        {kpi.actual}
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-32">
                          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div
                              className={`${getProgressColor(kpi.status)} h-full rounded-full transition-all duration-500`}
                              style={{ width: `${kpi.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold border ${getStatusBadge(kpi.status)}`}
                        >
                          {kpi.statusLabel}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-100 px-6 py-4 bg-slate-50/30 text-center">
              <p className="text-xs text-slate-600">
                © 2024 ReliefOps System. Báo cáo được tạo tự động lúc{" "}
                {new Date().toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
