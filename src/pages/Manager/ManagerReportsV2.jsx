import React, { useCallback, useEffect, useMemo, useState } from "react";
import Sidebar from "../../components/manager/Sidebar";
import { requestsApi } from "../../api/requests";
import { vehiclesApi } from "../../api/vehicles";
import { importBatchesApi } from "../../api/importBatches";
import { suppliesApi } from "../../api/supplies";

import {
  Refresh as RefreshIcon,
  Timer as TimerIcon,
  Inventory2 as InventoryIcon,
  MedicalServices as MedicalIcon,
  LocalShipping as ShippingIcon,
  Warning as WarningIcon,
  GroupAdd as VehicleIcon,
  TableView as TableIcon,
} from "@mui/icons-material";

function StatusBadge({ status }) {
  const cls = (() => {
    if (status === "completed") return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (status === "on_mission") return "bg-indigo-100 text-indigo-700 border-indigo-200";
    if (status === "pending_verification") return "bg-amber-100 text-amber-700 border-amber-200";
    if (status === "verified") return "bg-blue-100 text-blue-700 border-blue-200";
    if (status === "rejected") return "bg-red-100 text-red-700 border-red-200";
    return "bg-slate-100 text-slate-700 border-slate-200";
  })();

  return (
    <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold border ${cls}`}>
      {status}
    </span>
  );
}

function formatDateTime(d) {
  if (!d) return "—";
  try {
    const dt = new Date(d);
    return dt.toLocaleString("vi-VN");
  } catch {
    return String(d);
  }
}

export default function ManagerReportsV2() {
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    total: 0,
    by_status: [],
  });
  const [vehicles, setVehicles] = useState([]);
  const [overview, setOverview] = useState({});
  const [distributions, setDistributions] = useState([]);
  const [recentRequests, setRecentRequests] = useState([]);

  const [usagesTop, setUsagesTop] = useState([]);
  const [usagesAvailable, setUsagesAvailable] = useState(true);

  const [distByTeamRows, setDistByTeamRows] = useState([]);

  const byStatus = useMemo(() => {
    const map = {};
    if (!Array.isArray(stats.by_status)) return map;
    stats.by_status.forEach((s) => {
      const key = s.status;
      const val = Number(s.count) || 0;
      if (key) map[key] = val;
    });
    return map;
  }, [stats]);

  const totalRequests = stats.total || 0;
  const completedRequests = byStatus.completed || 0;
  const inProgressRequests = (byStatus.pending_verification || 0) + (byStatus.on_mission || 0);

  const lowStockSupplies = useMemo(() => {
    const list = Array.isArray(overview.supplies) ? overview.supplies : [];
    return list
      .filter((s) => (s.total_remaining ?? 0) <= (s.min_quantity ?? 0))
      .sort((a, b) => (a.total_remaining ?? 0) - (b.total_remaining ?? 0))
      .slice(0, 10);
  }, [overview]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, recentReqRes, overviewRes, vehiclesRes, distRes, usagesRes] =
        await Promise.allSettled([
          requestsApi.getStats(),
          requestsApi.getAll({ page: 1, limit: 8 }),
          importBatchesApi.getOverview(),
          vehiclesApi.getAll({ limit: 200 }),
          suppliesApi.getDistributions({ page: 1, limit: 20 }),
          suppliesApi.getAllUsages({ page: 1, limit: 80 }),
        ]);

      setStats(
        statsRes.status === "fulfilled" ? statsRes.value?.data || statsRes.value || stats : stats,
      );

      setRecentRequests(
        recentReqRes.status === "fulfilled"
          ? Array.isArray(recentReqRes.value?.data) ? recentReqRes.value.data : recentReqRes.value || []
          : [],
      );

      const ov =
        overviewRes.status === "fulfilled"
          ? overviewRes.value?.data || overviewRes.value || {}
          : {};
      setOverview(ov);

      const v =
        vehiclesRes.status === "fulfilled"
          ? vehiclesRes.value?.data || vehiclesRes.value || []
          : [];
      setVehicles(Array.isArray(v) ? v : []);

      const d =
        distRes.status === "fulfilled"
          ? distRes.value?.data || distRes.value || []
          : [];
      setDistributions(Array.isArray(d) ? d : []);

      // Distribution by team (top)
      const map = {};
      const list = Array.isArray(d) ? d : [];
      list.forEach((item) => {
        const teamName = item.team?.name || item.RescueTeam?.name || item.team_id || "N/A";
        const qty = Number(item.quantity) || 0;
        map[teamName] = (map[teamName] || 0) + qty;
      });
      setDistByTeamRows(
        Object.entries(map)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 8)
          .map(([teamName, totalQuantity]) => ({ teamName, totalQuantity })),
      );

      // Optional usage top list
      if (usagesRes.status === "fulfilled") {
        const usageList =
          Array.isArray(usagesRes.value?.data) ? usagesRes.value.data : usagesRes.value?.data?.usages || usagesRes.value?.usages || [];
        if (Array.isArray(usageList) && usageList.length > 0) {
          const bySupply = {};
          usageList.forEach((u) => {
            const supply = u.supply || u.Supply || {};
            const supplyId = supply.id || u.supply_id;
            if (!supplyId) return;
            if (!bySupply[supplyId]) {
              bySupply[supplyId] = {
                supplyId,
                supplyName: supply.name || supplyId,
                unit: supply.unit || "",
                totalUsed: 0,
              };
            }
            bySupply[supplyId].totalUsed += Number(u.quantity_used) || 0;
          });
          setUsagesTop(
            Object.values(bySupply)
              .sort((a, b) => b.totalUsed - a.totalUsed)
              .slice(0, 10),
          );
          setUsagesAvailable(true);
        } else {
          setUsagesTop([]);
          setUsagesAvailable(true);
        }
      } else {
        setUsagesTop([]);
        setUsagesAvailable(false);
      }
    } catch (e) {
      // Keep the page usable even if some endpoints fail
      console.error("ManagerReportsV2 fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, [setLoading]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const availableVehicles = vehicles.filter((v) => v.status === "available").length;
  const inUseVehicles = vehicles.filter((v) => v.status === "in_use").length;
  const lowStockCount = lowStockSupplies.length;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-8 max-w-[1800px] mx-auto">
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
                  Báo cáo vận hành
                </h1>
                <p className="text-slate-600 text-base">
                  Dữ liệu thực tế cho điều phối, tồn kho và phân bổ
                </p>
              </div>
              <button
                onClick={refresh}
                className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2"
              >
                <RefreshIcon sx={{ fontSize: 20 }} className={loading ? "animate-spin" : ""} />
                Làm mới
              </button>
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
            <div className="space-y-6">
              {/* KPI row */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/60">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-2xl bg-blue-100 text-blue-700">
                      <TimerIcon sx={{ fontSize: 22 }} />
                    </div>
                    <span className="text-xs text-slate-500 font-semibold">Tổng</span>
                  </div>
                  <div className="mt-4 text-3xl font-bold text-slate-900">{totalRequests}</div>
                  <div className="text-sm text-slate-600 mt-1">Yêu cầu cứu hộ</div>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/60">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-700">
                      <MedicalIcon sx={{ fontSize: 22 }} />
                    </div>
                    <span className="text-xs text-slate-500 font-semibold">Hoàn thành</span>
                  </div>
                  <div className="mt-4 text-3xl font-bold text-slate-900">{completedRequests}</div>
                  <div className="text-sm text-slate-600 mt-1">Ca đã kết thúc</div>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/60">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-2xl bg-indigo-100 text-indigo-700">
                      <ShippingIcon sx={{ fontSize: 22 }} />
                    </div>
                    <span className="text-xs text-slate-500 font-semibold">Đang xử lý</span>
                  </div>
                  <div className="mt-4 text-3xl font-bold text-slate-900">{inProgressRequests}</div>
                  <div className="text-sm text-slate-600 mt-1">Chờ & đang thực hiện</div>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/60">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-2xl bg-orange-100 text-orange-700">
                      <InventoryIcon sx={{ fontSize: 22 }} />
                    </div>
                    <span className="text-xs text-slate-500 font-semibold">Kho</span>
                  </div>
                  <div className="mt-4 text-3xl font-bold text-slate-900">{lowStockCount}</div>
                  <div className="text-sm text-slate-600 mt-1">Mặt hàng cần nhập</div>
                </div>
              </div>

              {/* Tables grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Requests */}
                <div className="lg:col-span-1 bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
                  <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-transparent">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-slate-900 text-white">
                        <TableIcon sx={{ fontSize: 18 }} />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-lg">Yêu cầu gần đây</div>
                        <div className="text-sm text-slate-600 mt-0.5">
                          Mới nhất theo thời gian tạo
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    {recentRequests.length === 0 ? (
                      <div className="py-10 text-center text-slate-400 text-sm">Chưa có dữ liệu</div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                              <th className="py-2">Nội dung</th>
                              <th className="py-2">Khu vực</th>
                              <th className="py-2">Trạng thái</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {recentRequests.map((r) => (
                              <tr key={r.id} className="hover:bg-slate-50/50">
                                <td className="py-2 pr-2">
                                  <div className="font-semibold text-slate-800 truncate max-w-[220px]">
                                    {r.category ? (r.category === "relief" ? "Cứu trợ" : "Cứu hộ") : "—"}
                                  </div>
                                  <div className="text-xs text-slate-500">
                                    {r.priority || "—"} • {r.num_people || r.numPeople || "—"} người
                                  </div>
                                </td>
                                <td className="py-2 pr-2">
                                  <div className="text-sm font-medium text-slate-900 truncate max-w-[160px]">
                                    {r.district || r.province_city || "—"}
                                  </div>
                                </td>
                                <td className="py-2">
                                  <StatusBadge status={r.status} />
                                  <div className="text-xs text-slate-400 mt-1">{formatDateTime(r.created_at)}</div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>

                {/* Low stock */}
                <div className="lg:col-span-1 bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
                  <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-transparent">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-amber-500 text-white">
                        <WarningIcon sx={{ fontSize: 18 }} />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-lg">Tồn kho cần chú ý</div>
                        <div className="text-sm text-slate-600 mt-0.5">Sắp chạm ngưỡng tối thiểu</div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    {lowStockSupplies.length === 0 ? (
                      <div className="py-10 text-center text-slate-400 text-sm">
                        Không có mặt hàng nguy cấp
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                              <th className="py-2">Vật tư</th>
                              <th className="py-2 text-right">Còn</th>
                              <th className="py-2 text-right">Tối thiểu</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {lowStockSupplies.map((s) => (
                              <tr key={s.id} className="hover:bg-slate-50/50">
                                <td className="py-2">
                                  <div className="font-semibold text-slate-900 truncate max-w-[240px]">
                                    {s.name || s.supply_name || "—"}
                                  </div>
                                  <div className="text-xs text-slate-500">
                                    {s.category || "Khác"} • {s.province_city || "—"}
                                  </div>
                                </td>
                                <td className="py-2 text-right font-semibold text-red-600">
                                  {s.total_remaining ?? 0} {s.unit || ""}
                                </td>
                                <td className="py-2 text-right text-slate-700">
                                  {s.min_quantity ?? 0} {s.unit || ""}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>

                {/* Top Usage */}
                <div className="lg:col-span-1 bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
                  <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-transparent">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-emerald-600 text-white">
                        <InventoryIcon sx={{ fontSize: 18 }} />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-lg">Top vật phẩm đã dùng</div>
                        <div className="text-sm text-slate-600 mt-0.5">Theo báo cáo sử dụng (nếu có)</div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    {!usagesAvailable ? (
                      <div className="py-10 text-center text-slate-400 text-sm">
                        API sử dụng vật phẩm chưa sẵn sàng trên server.
                      </div>
                    ) : usagesTop.length === 0 ? (
                      <div className="py-10 text-center text-slate-400 text-sm">
                        Chưa có dữ liệu sử dụng
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                              <th className="py-2">Vật tư</th>
                              <th className="py-2 text-right">Đã dùng</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {usagesTop.map((u) => (
                              <tr key={u.supplyId} className="hover:bg-slate-50/50">
                                <td className="py-2">
                                  <div className="font-semibold text-slate-900 truncate max-w-[240px]">
                                    {u.supplyName}
                                  </div>
                                  <div className="text-xs text-slate-500">{u.unit}</div>
                                </td>
                                <td className="py-2 text-right font-semibold text-red-500">
                                  {u.totalUsed} {u.unit}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Distributions */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
                  <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-transparent">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-blue-600 text-white">
                        <ShippingIcon sx={{ fontSize: 18 }} />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-lg">Phân phối theo đội</div>
                        <div className="text-sm text-slate-600 mt-0.5">Top đội theo tổng số lượng</div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    {distByTeamRows.length === 0 ? (
                      <div className="py-10 text-center text-slate-400 text-sm">Chưa có dữ liệu</div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                              <th className="py-2">Đội</th>
                              <th className="py-2 text-right">Tổng số lượng</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {distByTeamRows.map((row) => (
                              <tr key={row.teamName} className="hover:bg-slate-50/50">
                                <td className="py-2">
                                  <div className="font-semibold text-slate-900 truncate max-w-[260px]">
                                    {row.teamName}
                                  </div>
                                </td>
                                <td className="py-2 text-right font-semibold text-slate-900">
                                  {row.totalQuantity}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
                  <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-transparent">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-slate-900 text-white">
                        <ShippingIcon sx={{ fontSize: 18 }} />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-lg">Phân phối gần đây</div>
                        <div className="text-sm text-slate-600 mt-0.5">Dữ liệu mới nhất từ hệ thống</div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    {distributions.length === 0 ? (
                      <div className="py-10 text-center text-slate-400 text-sm">Chưa có dữ liệu</div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                              <th className="py-2">Vật tư</th>
                              <th className="py-2 text-right">Số lượng</th>
                              <th className="py-2">Đội</th>
                              <th className="py-2">Thời gian</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {distributions.slice(0, 8).map((d) => (
                              <tr key={d.id} className="hover:bg-slate-50/50">
                                <td className="py-2">
                                  <div className="font-semibold text-slate-900 truncate max-w-[240px]">
                                    {d.supply?.name || d.Supply?.name || d.supply_id || "—"}
                                  </div>
                                  <div className="text-xs text-slate-500">
                                    {d.supply?.unit || d.Supply?.unit || ""}
                                  </div>
                                </td>
                                <td className="py-2 text-right font-semibold text-slate-900">
                                  {d.quantity} {d.supply?.unit || d.Supply?.unit || ""}
                                </td>
                                <td className="py-2">
                                  <div className="font-medium text-slate-700 truncate max-w-[200px]">
                                    {d.team?.name || d.RescueTeam?.name || d.team_id || "—"}
                                  </div>
                                </td>
                                <td className="py-2 text-xs text-slate-500">
                                  {formatDateTime(d.created_at)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 px-2 py-4 text-center">
                <p className="text-xs text-slate-500">
                  Báo cáo được tạo từ dữ liệu thực lúc{" "}
                  {new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

