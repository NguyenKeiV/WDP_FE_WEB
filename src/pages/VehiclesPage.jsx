import { useState, useEffect, useCallback } from "react";
import { vehiclesApi } from "../api/vehicles";
import { useAuth } from "../context/AuthContext";

const STATUS_CONFIG = {
  available: { label: "Sẵn sàng", color: "bg-green-100 text-green-700" },
  in_use: { label: "Đang sử dụng", color: "bg-red-100 text-red-700" },
  maintenance: { label: "Bảo trì", color: "bg-yellow-100 text-yellow-700" },
};

const TYPE_CONFIG = {
  car: "Ô tô",
  boat: "Thuyền",
  helicopter: "Trực thăng",
  truck: "Xe tải",
  motorcycle: "Xe máy",
  other: "Khác",
};

export default function VehiclesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.type = typeFilter;
      const res = await vehiclesApi.getAll(params);
      setVehicles(res.data || []);
      setPagination(res.pagination);
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, typeFilter]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const availableCount = vehicles.filter((v) => v.status === "available").length;
  const inUseCount = vehicles.filter((v) => v.status === "in_use").length;

  return (
    <div className="p-8">
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-white font-semibold text-sm ${
            toast.type === "error" ? "bg-red-600" : "bg-green-600"
          }`}
        >
          {toast.type === "error" ? "❌" : "✅"} {toast.message}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            🚗 Phương tiện cứu hộ
          </h2>
          {!isAdmin && (
            <p className="text-sm text-gray-500 mt-1">
              Xem danh sách phương tiện hiện có
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            <option value="">Tất cả loại xe</option>
            {Object.entries(TYPE_CONFIG).map(([val, label]) => (
              <option key={val} value={val}>
                {label}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            <option value="">Tất cả trạng thái</option>
            {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
              <option key={val} value={val}>
                {cfg.label}
              </option>
            ))}
          </select>
          <button
            onClick={fetchVehicles}
            className="text-sm bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg font-semibold transition"
          >
            🔄 Làm mới
          </button>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-2xl font-bold text-gray-800">
            {pagination?.total || vehicles.length}
          </p>
          <p className="text-sm text-gray-500">Tổng phương tiện</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-2xl font-bold text-green-600">{availableCount}</p>
          <p className="text-sm text-gray-500">Sẵn sàng</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-2xl font-bold text-red-600">{inUseCount}</p>
          <p className="text-sm text-gray-500">Đang sử dụng</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-gray-400">Đang tải...</div>
        ) : vehicles.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-2">🚗</div>
            <p className="text-gray-500">Chưa có phương tiện nào</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">
                  Tên phương tiện
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">
                  Loại
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">
                  Biển số
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">
                  Khu vực
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">
                  Đội phụ trách
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">
                  Trạng thái
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">
                  Ghi chú
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {vehicles.map((vehicle) => {
                const status = STATUS_CONFIG[vehicle.status];
                return (
                  <tr key={vehicle.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-semibold text-gray-800">
                      {vehicle.name}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {TYPE_CONFIG[vehicle.type] || vehicle.type}
                    </td>
                    <td className="px-4 py-3 text-gray-600 font-mono">
                      {vehicle.license_plate || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      📍 {vehicle.province_city}
                    </td>
                    <td className="px-4 py-3">
                      {vehicle.assigned_team ? (
                        <div>
                          <p className="text-xs font-semibold text-blue-700">
                            {vehicle.assigned_team.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {vehicle.assigned_team.leader_name}
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">
                          — Chưa phân công
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full ${status?.color}`}
                      >
                        {status?.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs max-w-xs truncate">
                      {vehicle.notes || "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-between items-center px-4 py-3 border-t border-gray-200">
            <span className="text-sm text-gray-500">
              Trang {pagination.page}/{pagination.totalPages} · Tổng{" "}
              {pagination.total} phương tiện
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="text-sm px-3 py-1.5 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition"
              >
                ← Trước
              </button>
              <button
                onClick={() =>
                  setPage((p) => Math.min(pagination.totalPages, p + 1))
                }
                disabled={page === pagination.totalPages}
                className="text-sm px-3 py-1.5 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition"
              >
                Sau →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
