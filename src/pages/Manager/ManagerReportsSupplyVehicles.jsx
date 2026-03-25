import React, { useCallback, useEffect, useMemo, useState } from "react";
import Sidebar from "../../components/manager/Sidebar";
import { vehiclesApi } from "../../api/vehicles";
import { importBatchesApi } from "../../api/importBatches";
import { suppliesApi } from "../../api/supplies";
import { useNavigate } from "react-router-dom";

import {
  Refresh as RefreshIcon,
  Inventory2 as InventoryIcon,
  Warning as WarningIcon,
  LocalShipping as ShippingIcon,
  DirectionsCar as VehicleIcon,
  Inventory as SupplyIcon,
} from "@mui/icons-material";

function formatDateTime(d) {
  if (!d) return "—";
  try {
    const dt = new Date(d);
    return dt.toLocaleString("vi-VN");
  } catch {
    return String(d);
  }
}

function VehicleStatusBadge({ status }) {
  const label = (() => {
    if (status === "available") return "Sẵn sàng";
    if (status === "in_use") return "Đang sử dụng";
    if (status === "maintenance") return "Bảo trì";
    if (status === "unavailable") return "Không khả dụng";
    return status || "—";
  })();

  const cls = (() => {
    if (status === "available")
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (status === "in_use")
      return "bg-blue-100 text-blue-700 border-blue-200";
    if (status === "maintenance")
      return "bg-amber-100 text-amber-700 border-amber-200";
    if (status === "unavailable")
      return "bg-slate-100 text-slate-700 border-slate-200";
    return "bg-slate-100 text-slate-700 border-slate-200";
  })();

  return (
    <span
      className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold border ${cls}`}
    >
      {label}
    </span>
  );
}

export default function ManagerReportsSupplyVehicles() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [vehicles, setVehicles] = useState([]);
  const [overview, setOverview] = useState({});
  const [distributions, setDistributions] = useState([]);
  const [distByTeamRows, setDistByTeamRows] = useState([]);

  const [usagesTop, setUsagesTop] = useState([]);
  const [usagesAvailable, setUsagesAvailable] = useState(true);

  // Modal: xem chi tiết phân phối
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedDistribution, setSelectedDistribution] = useState(null);

  const lowStockSupplies = useMemo(() => {
    const list = Array.isArray(overview.supplies) ? overview.supplies : [];
    return list
      .filter(
        (s) => (s.total_remaining ?? 0) <= (s.min_quantity ?? 0),
      )
      .sort((a, b) => (a.total_remaining ?? 0) - (b.total_remaining ?? 0))
      .slice(0, 10);
  }, [overview]);

  const totalSupplyTypes = useMemo(() => {
    if (Array.isArray(overview.supplies)) return overview.supplies.length;
    return overview.total_items ?? 0;
  }, [overview]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [overviewRes, vehiclesRes, distRes, usagesRes] =
        await Promise.allSettled([
          importBatchesApi.getOverview(),
          vehiclesApi.getAll({ limit: 200 }),
          suppliesApi.getDistributions({ limit: 200 }),
          suppliesApi.getAllUsages({ page: 1, limit: 120 }),
        ]);

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
      const distList = Array.isArray(d) ? d : [];
      setDistributions(distList);

      // Distribution by team (top)
      const map = {};
      distList.forEach((item) => {
        const teamName =
          item.team?.name || item.RescueTeam?.name || item.team_id || "N/A";
        const qty = Number(item.quantity) || 0;
        map[teamName] = (map[teamName] || 0) + qty;
      });
      setDistByTeamRows(
        Object.entries(map)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 8)
          .map(([teamName, totalQuantity]) => ({ teamName, totalQuantity })),
      );

      // Optional: Top used supplies
      if (usagesRes.status === "fulfilled") {
        const payload = usagesRes.value?.data || usagesRes.value || [];
        const usageList =
          Array.isArray(payload)
            ? payload
            : payload?.usages || payload?.data || [];

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
      console.error("ManagerReportsSupplyVehicles refresh error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const vehiclesAvailable = vehicles.filter((v) => v.status === "available").length;
  const vehiclesInUse = vehicles.filter((v) => v.status === "in_use").length;
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
                  Báo cáo vật tư & phương tiện
                </h1>
                <p className="text-slate-600 text-base">
                  Tồn kho cần chú ý, phân phối và trạng thái phương tiện
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={refresh}
                  className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2"
                >
                  <RefreshIcon
                    sx={{ fontSize: 20 }}
                    className={loading ? "animate-spin" : ""}
                  />
                  Làm mới
                </button>
                <button
                  onClick={() => navigate("/manager/inventory")}
                  className="px-4 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 text-sm font-semibold transition-colors"
                >
                  Xem tồn kho
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-32">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4" />
                <p className="text-slate-600">Đang tải báo cáo...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* KPI row */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/60">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-700">
                      <VehicleIcon sx={{ fontSize: 22 }} />
                    </div>
                    <span className="text-xs text-slate-500 font-semibold">Sẵn sàng</span>
                  </div>
                  <div className="mt-4 text-3xl font-bold text-slate-900">
                    {vehiclesAvailable}
                  </div>
                  <div className="text-sm text-slate-600 mt-1">Xe có thể sử dụng</div>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/60">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-2xl bg-blue-100 text-blue-700">
                      <VehicleIcon sx={{ fontSize: 22 }} />
                    </div>
                    <span className="text-xs text-slate-500 font-semibold">Đang dùng</span>
                  </div>
                  <div className="mt-4 text-3xl font-bold text-slate-900">
                    {vehiclesInUse}
                  </div>
                  <div className="text-sm text-slate-600 mt-1">Xe đang tham gia nhiệm vụ</div>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/60">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-2xl bg-orange-100 text-orange-700">
                      <InventoryIcon sx={{ fontSize: 22 }} />
                    </div>
                    <span className="text-xs text-slate-500 font-semibold">Cần nhập</span>
                  </div>
                  <div className="mt-4 text-3xl font-bold text-slate-900">
                    {lowStockCount}
                  </div>
                  <div className="text-sm text-slate-600 mt-1">Mặt hàng chạm ngưỡng</div>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/60">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-2xl bg-violet-100 text-violet-700">
                      <SupplyIcon sx={{ fontSize: 22 }} />
                    </div>
                    <span className="text-xs text-slate-500 font-semibold">Trong kho</span>
                  </div>
                  <div className="mt-4 text-3xl font-bold text-slate-900">
                    {totalSupplyTypes}
                  </div>
                  <div className="text-sm text-slate-600 mt-1">Loại vật tư hiện có</div>
                </div>
              </div>

              {/* Tables */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Vehicles table */}
                <div className="lg:col-span-1 bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
                  <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-transparent">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-slate-900 text-white">
                        <VehicleIcon sx={{ fontSize: 18 }} />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-lg">Phương tiện</div>
                        <div className="text-sm text-slate-600 mt-0.5">
                          Sẵn sàng / đang dùng (top {Math.min(8, vehicles.length)})
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    {vehicles.length === 0 ? (
                      <div className="py-10 text-center text-slate-400 text-sm">Chưa có dữ liệu</div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                              <th className="py-2">Phương tiện</th>
                              <th className="py-2">Trạng thái</th>
                              <th className="py-2">Khu vực</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {vehicles.slice(0, 8).map((v) => (
                              <tr key={v.id} className="hover:bg-slate-50/50">
                                <td className="py-2">
                                  <div className="font-semibold text-slate-900 truncate max-w-[220px]">
                                    {v.name || v.license_plate || v.type || v.id}
                                  </div>
                                  <div className="text-xs text-slate-500">{v.type || "—"}</div>
                                </td>
                                <td className="py-2">
                                  <VehicleStatusBadge status={v.status} />
                                </td>
                                <td className="py-2">
                                  <div className="text-sm text-slate-700 truncate max-w-[160px]">
                                    {v.province_city || "—"}
                                  </div>
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
                                    {s.name || "—"}
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

                {/* Top usage (optional) */}
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

              {/* Distribution */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
                  <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-transparent">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-blue-600 text-white">
                        <ShippingIcon sx={{ fontSize: 18 }} />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-lg">Phân phối theo đội</div>
                        <div className="text-sm text-slate-600 mt-0.5">
                          Top đội theo tổng số lượng
                        </div>
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
                        <div className="text-sm text-slate-600 mt-0.5">
                          Dữ liệu mới nhất từ hệ thống
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    {distributions.length === 0 ? (
                      <div className="py-10 text-center text-slate-400 text-sm">Chưa có dữ liệu</div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full table-fixed text-sm">
                          <thead>
                            <tr className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                              <th className="py-2 px-3 whitespace-nowrap w-[36%]">
                                Vật tư
                              </th>
                              <th className="py-2 px-3 whitespace-nowrap w-[14%] text-center">
                                Số lượng
                              </th>
                              <th className="py-2 px-3 whitespace-nowrap w-[20%]">
                                Đội
                              </th>
                              <th className="py-2 px-3 whitespace-nowrap w-[18%]">
                                Thời gian
                              </th>
                              <th className="py-2 px-3 whitespace-nowrap w-[12%]">
                                Chi tiết
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {distributions.slice(0, 8).map((d) => (
                              <tr key={d.id} className="hover:bg-slate-50/50">
                                <td className="py-2 px-3">
                                  <div className="font-semibold text-slate-900 truncate max-w-[240px]">
                                    {d.supply?.name || d.Supply?.name || d.supply_id || "—"}
                                  </div>
                                  <div className="text-xs text-slate-500">
                                    {d.supply?.unit || d.Supply?.unit || ""}
                                  </div>
                                </td>
                                <td className="py-2 px-3 text-center font-semibold text-slate-900 whitespace-nowrap align-middle">
                                  {d.quantity} {d.Supply?.unit || d.Supply?.unit || ""}
                                </td>
                                <td className="py-2 px-3 whitespace-nowrap">
                                  <div className="font-medium text-slate-700 truncate max-w-[200px]">
                                    {d.team?.name || d.RescueTeam?.name || d.team_id || "—"}
                                  </div>
                                </td>
                                <td className="py-2 px-3 text-xs text-slate-500 whitespace-nowrap">
                                  {formatDateTime(d.created_at)}
                                </td>
                                <td className="py-2 px-3 text-right whitespace-nowrap">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedDistribution(d);
                                      setDetailModalOpen(true);
                                    }}
                                    className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                                  >
                                    Xem chi tiết
                                  </button>
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
                  {new Date().toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  .
                </p>
              </div>
            </div>
          )}

          {detailModalOpen && selectedDistribution && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
              onClick={() => setDetailModalOpen(false)}
            >
              <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                  <h2 className="text-white font-bold text-lg">
                    Chi tiết phân phối
                  </h2>
                  <p className="text-blue-100 text-xs mt-1">
                    Kiểm tra vật tư, đội nhận và ghi chú
                  </p>
                </div>
                <div className="p-6 space-y-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                    <p className="text-xs text-slate-500">Vật tư</p>
                    <p className="font-semibold text-slate-900">
                      {selectedDistribution.supply?.name ||
                        selectedDistribution.Supply?.name ||
                        "—"}
                    </p>
                    <p className="text-sm text-slate-700 mt-1">
                      Số lượng:{" "}
                      <span className="font-bold text-slate-900">
                        {selectedDistribution.quantity}{" "}
                        {selectedDistribution.supply?.unit ||
                          selectedDistribution.Supply?.unit ||
                          ""}
                      </span>
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                      <p className="text-xs text-slate-500">Đội</p>
                      <p className="font-semibold text-slate-900">
                        {selectedDistribution.team?.name ||
                          selectedDistribution.RescueTeam?.name ||
                          selectedDistribution.team_id ||
                          "—"}
                      </p>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                      <p className="text-xs text-slate-500">Thời gian</p>
                      <p className="font-semibold text-slate-900 text-sm">
                        {formatDateTime(selectedDistribution.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                    <p className="text-xs text-slate-500">Ghi chú</p>
                    <p className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">
                      {selectedDistribution.notes || "—"}
                    </p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setDetailModalOpen(false)}
                      className="flex-1 py-3 border border-slate-200 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 transition-colors text-sm"
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

