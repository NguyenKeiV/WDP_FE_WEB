import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "../../components/manager/Sidebar";
import { requestsApi } from "../../api/requests";
import { vehiclesApi } from "../../api/vehicles";
import { teamsApi } from "../../api/teams";
import { importBatchesApi } from "../../api/importBatches";
import { suppliesApi } from "../../api/supplies";
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
  Refresh as RefreshIcon,
} from "@mui/icons-material";

export default function ManagerReports() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("24h");
  const [loading, setLoading] = useState(true);

  const [kpis, setKpis] = useState([]);
  const [regionData, setRegionData] = useState([]);
  const [personnelData, setPersonnelData] = useState([]);
  const [totalPersonnel, setTotalPersonnel] = useState(0);

  // Usable tables (recent activity + inventory risks)
  const [recentRequests, setRecentRequests] = useState([]);
  const [recentDistributions, setRecentDistributions] = useState([]);
  const [lowStockSupplies, setLowStockSupplies] = useState([]);
  const [usageTopSupplies, setUsageTopSupplies] = useState([]);
  const [distByTeamRows, setDistByTeamRows] = useState([]);
  const [usagesAvailable, setUsagesAvailable] = useState(true);

  const fetchReportData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, teamsRes, overviewRes, vehiclesRes, distRes, recentReqRes, usagesRes] =
        await Promise.allSettled([
          requestsApi.getStats(),
          requestsApi.getAll({ page: 1, limit: 8 }),
          teamsApi.getAll({ limit: 200 }),
          importBatchesApi.getOverview(),
          vehiclesApi.getAll({ limit: 200 }),
          suppliesApi.getDistributions({ limit: 200 }),
          // Optional: usage endpoints might not be deployed yet
          suppliesApi.getAllUsages({ page: 1, limit: 50 }),
        ]);

      const stats =
        statsRes.status === "fulfilled"
          ? statsRes.value?.data || statsRes.value || {}
          : {};

      const teams =
        teamsRes.status === "fulfilled"
          ? teamsRes.value?.data || teamsRes.value || []
          : [];
      const teamsList = Array.isArray(teams) ? teams : [];

      const overview =
        overviewRes.status === "fulfilled"
          ? overviewRes.value?.data || overviewRes.value || {}
          : {};

      const vehicles =
        vehiclesRes.status === "fulfilled"
          ? vehiclesRes.value?.data || vehiclesRes.value || []
          : [];
      const vehiclesList = Array.isArray(vehicles) ? vehicles : [];

      const dists =
        distRes.status === "fulfilled"
          ? distRes.value?.data || distRes.value || []
          : [];
      const distsList = Array.isArray(dists) ? dists : [];

      const recentReqs =
        recentReqRes.status === "fulfilled"
          ? recentReqRes.value?.data || recentReqRes.value || []
          : [];
      const recentReqList = Array.isArray(recentReqs) ? recentReqs : [];

      const usagePayload =
        usagesRes.status === "fulfilled"
          ? usagesRes.value?.data || usagesRes.value || []
          : [];
      const usagesList = Array.isArray(usagePayload) ? usagePayload : [];

      const totalRequests =
        stats.total || stats.total_requests || 0;
      const completedRequests =
        stats.completed || stats.total_completed || 0;
      const supplyItems = overview.supplies || [];
      const lowStockCount = supplyItems.filter(
        (s) => (s.total_remaining ?? 0) <= (s.min_quantity ?? 0)
      ).length;
      const totalSupplyItems = supplyItems.length;
      const supplyFulfillment =
        totalSupplyItems > 0
          ? Math.round(
              ((totalSupplyItems - lowStockCount) / totalSupplyItems) * 100
            )
          : 0;

      // Usable tables for the new UI
      const lowSuppliesSorted = supplyItems
        .slice()
        .filter(
          (s) => (s.total_remaining ?? 0) <= (s.min_quantity ?? 0),
        )
        .sort((a, b) => (a.total_remaining ?? 0) - (b.total_remaining ?? 0))
        .slice(0, 10);
      setLowStockSupplies(lowSuppliesSorted);
      setRecentRequests(recentReqList.slice(0, 8));
      setRecentDistributions(distsList.slice(0, 8));

      // Top used supplies (optional)
      if (usagesRes.status === "fulfilled" && usagesList.length > 0) {
        setUsagesAvailable(true);
        const bySupply = {};
        usagesList.forEach((u) => {
          const supply =
            u.supply || u.Supply || {};
          const supplyId = supply.id || u.supply_id || u.supplyId;
          if (!supplyId) return;
          const name = supply.name || u.name || supplyId;
          const unit = supply.unit || u.unit || "";
          const qty = Number(u.quantity_used) || 0;
          if (!bySupply[supplyId]) {
            bySupply[supplyId] = {
              supply_id: supplyId,
              supply_name: name,
              unit,
              total_used: 0,
              count: 0,
            };
          }
          bySupply[supplyId].total_used += qty;
          bySupply[supplyId].count += 1;
        });
        const top = Object.values(bySupply)
          .sort((a, b) => b.total_used - a.total_used)
          .slice(0, 10);
        setUsageTopSupplies(top);
      } else {
        setUsagesAvailable(false);
        setUsageTopSupplies([]);
      }

      setKpis([
        {
          id: 1,
          name: "Tổng yêu cầu cứu hộ",
          icon: <TimerIcon sx={{ fontSize: 18 }} />,
          iconBg: "bg-blue-100",
          iconColor: "text-blue-600",
          target: "—",
          actual: `${totalRequests} yêu cầu`,
          progress: Math.min(100, totalRequests > 0 ? 100 : 0),
          status: totalRequests > 0 ? "good" : "info",
          statusLabel: totalRequests > 0 ? "Có dữ liệu" : "Chưa có dữ liệu",
        },
        {
          id: 2,
          name: "Tỷ lệ đáp ứng nhu yếu phẩm",
          icon: <InventoryIcon sx={{ fontSize: 18 }} />,
          iconBg: "bg-orange-100",
          iconColor: "text-orange-600",
          target: "100%",
          actual: `${supplyFulfillment}%`,
          progress: supplyFulfillment,
          status:
            supplyFulfillment >= 90
              ? "good"
              : supplyFulfillment >= 70
                ? "warning"
                : "info",
          statusLabel:
            supplyFulfillment >= 90
              ? "Tốt"
              : supplyFulfillment >= 70
                ? "Cần cải thiện"
                : "Cần nhập thêm",
        },
        {
          id: 3,
          name: "Nhiệm vụ hoàn thành",
          icon: <MedicalIcon sx={{ fontSize: 18 }} />,
          iconBg: "bg-red-100",
          iconColor: "text-red-600",
          target: `${totalRequests} yêu cầu`,
          actual: `${completedRequests} ca`,
          progress:
            totalRequests > 0
              ? Math.round((completedRequests / totalRequests) * 100)
              : 0,
          status: "info",
          statusLabel: "Đang theo dõi",
        },
        {
          id: 4,
          name: "Phương tiện sẵn sàng",
          icon: <GroupAddIcon sx={{ fontSize: 18 }} />,
          iconBg: "bg-cyan-100",
          iconColor: "text-cyan-600",
          target: `${vehiclesList.length} xe`,
          actual: `${vehiclesList.filter((v) => v.status === "available").length} xe`,
          progress:
            vehiclesList.length > 0
              ? Math.round(
                  (vehiclesList.filter((v) => v.status === "available").length /
                    vehiclesList.length) *
                    100
                )
              : 0,
          status:
            vehiclesList.filter((v) => v.status === "available").length >=
            vehiclesList.length * 0.7
              ? "excellent"
              : "warning",
          statusLabel:
            vehiclesList.filter((v) => v.status === "available").length >=
            vehiclesList.length * 0.7
              ? "Đủ phương tiện"
              : "Thiếu phương tiện",
        },
      ]);

      const distByTeam = {};
      distsList.forEach((d) => {
        const teamName =
          d.team?.name || d.RescueTeam?.name || d.team_id?.slice(0, 8) || "N/A";
        distByTeam[teamName] = (distByTeam[teamName] || 0) + (d.quantity || 0);
      });
      const sortedRegions = Object.entries(distByTeam)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6);
      setDistByTeamRows(
        Object.entries(distByTeam)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 8)
          .map(([teamName, totalQuantity]) => ({
            teamName,
            totalQuantity,
          })),
      );
      const maxRegionVal =
        sortedRegions.length > 0
          ? Math.max(...sortedRegions.map(([, v]) => v))
          : 1;
      setRegionData(
        sortedRegions.map(([name, value]) => ({
          name: name.length > 15 ? name.slice(0, 15) + "…" : name,
          value: Math.round((value / maxRegionVal) * 100),
          rawValue: value,
          color: "bg-blue-500",
        }))
      );

      const specCounts = { rescue: 0, relief: 0 };
      let totalCap = 0;
      teamsList.forEach((t) => {
        const cap = t.capacity || 0;
        totalCap += cap;
        if (t.specialization === "rescue") specCounts.rescue += cap;
        else specCounts.relief += cap;
      });

      const availableVehicles = vehiclesList.filter(
        (v) => v.status === "available"
      ).length;
      const inUseVehicles = vehiclesList.filter(
        (v) => v.status === "in_use"
      ).length;
      const totalPeople = totalCap + vehiclesList.length;
      setTotalPersonnel(totalPeople);

      const pData = [];
      if (specCounts.rescue > 0)
        pData.push({
          name: "Đội cứu nạn",
          value:
            totalPeople > 0
              ? Math.round((specCounts.rescue / totalPeople) * 100)
              : 0,
          color: "bg-cyan-600",
        });
      if (specCounts.relief > 0)
        pData.push({
          name: "Đội cứu trợ",
          value:
            totalPeople > 0
              ? Math.round((specCounts.relief / totalPeople) * 100)
              : 0,
          color: "bg-blue-500",
        });
      if (availableVehicles > 0)
        pData.push({
          name: "Xe sẵn sàng",
          value:
            totalPeople > 0
              ? Math.round((availableVehicles / totalPeople) * 100)
              : 0,
          color: "bg-orange-500",
        });
      if (inUseVehicles > 0)
        pData.push({
          name: "Xe đang dùng",
          value:
            totalPeople > 0
              ? Math.round((inUseVehicles / totalPeople) * 100)
              : 0,
          color: "bg-red-500",
        });
      setPersonnelData(pData.length > 0 ? pData : [{ name: "Chưa có dữ liệu", value: 100, color: "bg-slate-300" }]);
    } catch (err) {
      console.error("Report fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

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

  const computeDonutSegments = () => {
    const circumference = 2 * Math.PI * 40;
    let offset = 0;
    return personnelData.map((item) => {
      const dashLen = (item.value / 100) * circumference;
      const seg = { dasharray: `${dashLen} ${circumference}`, dashoffset: -offset };
      offset += dashLen;
      return seg;
    });
  };

  const strokeColors = ["#0891b2", "#3b82f6", "#f97316", "#ef4444", "#64748b"];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        <div className="p-8 max-w-[1800px] mx-auto">
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

              <div className="flex items-center gap-3">
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
                <button
                  onClick={fetchReportData}
                  className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
                >
                  <RefreshIcon
                    sx={{ fontSize: 20 }}
                    className={`text-slate-600 ${loading ? "animate-spin" : ""}`}
                  />
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-32">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-slate-600">Đang tải báo cáo...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                {/* Bar Chart */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/60 hover:shadow-lg transition-all duration-300">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-slate-900 text-lg flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/20">
                        <BarChartIcon sx={{ fontSize: 20 }} />
                      </div>
                      Phân phối theo đội
                    </h3>
                  </div>

                  <div className="flex items-end justify-between gap-4 h-64 px-2 border-b border-slate-200 relative">
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-0">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className="w-full border-t border-slate-200 border-dashed h-0"
                        ></div>
                      ))}
                    </div>

                    {regionData.length === 0 ? (
                      <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
                        Chưa có dữ liệu phân phối
                      </div>
                    ) : (
                      regionData.map((region, idx) => (
                        <div
                          key={idx}
                          className="flex flex-col items-center gap-2 flex-1 group"
                        >
                          <div
                            className={`w-full ${region.color} hover:bg-blue-600 transition-all duration-300 rounded-t-xl relative cursor-pointer shadow-lg shadow-blue-500/20`}
                            style={{
                              height: `${Math.max(region.value, 5)}%`,
                            }}
                          >
                            <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-sm font-bold text-slate-900 opacity-0 group-hover:opacity-100 transition-opacity bg-white px-3 py-1 rounded-lg shadow-lg whitespace-nowrap">
                              {region.rawValue}
                            </span>
                          </div>
                          <span className="text-[10px] font-medium text-slate-700 text-center leading-tight max-w-full truncate">
                            {region.name}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Line Chart placeholder */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/60 hover:shadow-lg transition-all duration-300">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-slate-900 text-lg flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/20">
                        <ShowChartIcon sx={{ fontSize: 20 }} />
                      </div>
                      Biến động tồn kho
                    </h3>
                  </div>

                  <div className="relative h-64 w-full flex items-center justify-center">
                    <div className="text-center text-slate-400">
                      <ShowChartIcon
                        sx={{ fontSize: 48 }}
                        className="text-slate-200 mb-3"
                      />
                      <p className="text-sm font-medium">
                        Biểu đồ xu hướng sẽ hiển thị khi có đủ dữ liệu theo thời gian
                      </p>
                    </div>
                  </div>
                </div>

                {/* Pie Chart */}
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
                    <div className="relative h-44 w-44 rounded-full mb-6 shadow-xl">
                      <svg
                        className="w-full h-full -rotate-90"
                        viewBox="0 0 100 100"
                      >
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="#e2e8f0"
                          strokeWidth="16"
                        />
                        {computeDonutSegments().map((seg, idx) => (
                          <circle
                            key={idx}
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke={strokeColors[idx % strokeColors.length]}
                            strokeWidth="16"
                            strokeDasharray={seg.dasharray}
                            strokeDashoffset={seg.dashoffset}
                          />
                        ))}
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-bold text-slate-900">
                          {totalPersonnel}
                        </span>
                        <span className="text-xs text-slate-600 uppercase tracking-wider font-semibold">
                          Tổng lực lượng
                        </span>
                      </div>
                    </div>

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
                          Dữ liệu thực từ hệ thống
                        </p>
                      </div>
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

                <div className="border-t border-slate-100 px-6 py-4 bg-slate-50/30 text-center">
                  <p className="text-xs text-slate-600">
                    Báo cáo được tạo từ dữ liệu thực lúc{" "}
                    {new Date().toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    .
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
