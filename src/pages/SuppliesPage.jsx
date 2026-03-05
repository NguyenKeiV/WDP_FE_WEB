import { useState, useEffect, useCallback } from "react";
import { suppliesApi } from "../api/supplies";
import { useAuth } from "../context/AuthContext";

const CATEGORY_CONFIG = {
  food: { label: "Thực phẩm", icon: "🍚" },
  medicine: { label: "Thuốc", icon: "💊" },
  water: { label: "Nước uống", icon: "💧" },
  clothing: { label: "Quần áo", icon: "👕" },
  equipment: { label: "Thiết bị", icon: "🔧" },
  other: { label: "Khác", icon: "📦" },
};

export default function SuppliesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [supplies, setSupplies] = useState([]);
  const [distributions, setDistributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [activeTab, setActiveTab] = useState("inventory");
  const [distPage, setDistPage] = useState(1);
  const [distPagination, setDistPagination] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchSupplies = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (categoryFilter) params.category = categoryFilter;
      const res = await suppliesApi.getAll(params);
      setSupplies(res.data || []);
      setPagination(res.pagination);
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setLoading(false);
    }
  }, [page, categoryFilter]);

  const fetchDistributions = useCallback(async () => {
    try {
      const res = await suppliesApi.getDistributions({
        page: distPage,
        limit: 10,
      });
      setDistributions(res.data || []);
      setDistPagination(res.pagination);
    } catch (e) {
      showToast(e.message, "error");
    }
  }, [distPage]);

  useEffect(() => {
    fetchSupplies();
  }, [fetchSupplies]);

  useEffect(() => {
    if (activeTab === "distributions") {
      fetchDistributions();
    }
  }, [activeTab, fetchDistributions]);

  const totalQuantity = supplies.reduce((sum, s) => sum + (s.quantity || 0), 0);
  const lowStockCount = supplies.filter((s) => s.quantity <= 10).length;

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
            📦 Nhu yếu phẩm
          </h2>
          {!isAdmin && (
            <p className="text-sm text-gray-500 mt-1">
              Xem tình trạng kho nhu yếu phẩm
            </p>
          )}
        </div>
        <div className="flex gap-3">
          {activeTab === "inventory" && (
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              <option value="">Tất cả danh mục</option>
              {Object.entries(CATEGORY_CONFIG).map(([val, cfg]) => (
                <option key={val} value={val}>
                  {cfg.icon} {cfg.label}
                </option>
              ))}
            </select>
          )}
          <button
            onClick={activeTab === "inventory" ? fetchSupplies : fetchDistributions}
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
            {pagination?.total || supplies.length}
          </p>
          <p className="text-sm text-gray-500">Loại vật tư</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-2xl font-bold text-blue-600">{totalQuantity}</p>
          <p className="text-sm text-gray-500">Tổng số lượng</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-2xl font-bold text-orange-600">{lowStockCount}</p>
          <p className="text-sm text-gray-500">Sắp hết hàng (≤10)</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4">
        <button
          onClick={() => setActiveTab("inventory")}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${
            activeTab === "inventory"
              ? "bg-red-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          📦 Kho hàng
        </button>
        <button
          onClick={() => setActiveTab("distributions")}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${
            activeTab === "distributions"
              ? "bg-red-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          📋 Lịch sử phân phối
        </button>
      </div>

      {activeTab === "inventory" ? (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="text-center py-16 text-gray-400">Đang tải...</div>
          ) : supplies.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-2">📦</div>
              <p className="text-gray-500">Chưa có nhu yếu phẩm nào</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">
                    Tên vật tư
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">
                    Danh mục
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">
                    Số lượng
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">
                    Đơn vị
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">
                    Khu vực
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">
                    Ghi chú
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {supplies.map((supply) => {
                  const cat = CATEGORY_CONFIG[supply.category] || {
                    label: supply.category,
                    icon: "📦",
                  };
                  const isLow = supply.quantity <= 10;
                  return (
                    <tr
                      key={supply.id}
                      className="hover:bg-gray-50 transition"
                    >
                      <td className="px-4 py-3 font-semibold text-gray-800">
                        {supply.name}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {cat.icon} {cat.label}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`font-bold ${isLow ? "text-orange-600" : "text-gray-800"}`}
                        >
                          {supply.quantity}
                        </span>
                        {isLow && (
                          <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-semibold">
                            Sắp hết
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{supply.unit}</td>
                      <td className="px-4 py-3 text-gray-600">
                        📍 {supply.province_city}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs max-w-xs truncate">
                        {supply.notes || "—"}
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
                {pagination.total} vật tư
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
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {distributions.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-2">📋</div>
              <p className="text-gray-500">Chưa có lịch sử phân phối</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">
                    Vật tư
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">
                    Đội nhận
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">
                    Số lượng
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">
                    Người phân phối
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">
                    Thời gian
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">
                    Ghi chú
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {distributions.map((dist) => (
                  <tr key={dist.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-800">
                        {dist.supply?.name || "—"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {CATEGORY_CONFIG[dist.supply?.category]?.icon}{" "}
                        {CATEGORY_CONFIG[dist.supply?.category]?.label}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-blue-700">
                        {dist.team?.name || "—"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {dist.team?.leader_name}
                      </p>
                    </td>
                    <td className="px-4 py-3 font-bold text-gray-800">
                      {dist.quantity} {dist.supply?.unit}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {dist.manager?.username || "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {new Date(dist.created_at).toLocaleString("vi-VN")}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs max-w-xs truncate">
                      {dist.notes || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {distPagination && distPagination.totalPages > 1 && (
            <div className="flex justify-between items-center px-4 py-3 border-t border-gray-200">
              <span className="text-sm text-gray-500">
                Trang {distPagination.page}/{distPagination.totalPages} · Tổng{" "}
                {distPagination.total} bản ghi
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setDistPage((p) => Math.max(1, p - 1))}
                  disabled={distPage === 1}
                  className="text-sm px-3 py-1.5 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition"
                >
                  ← Trước
                </button>
                <button
                  onClick={() =>
                    setDistPage((p) =>
                      Math.min(distPagination.totalPages, p + 1),
                    )
                  }
                  disabled={distPage === distPagination.totalPages}
                  className="text-sm px-3 py-1.5 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition"
                >
                  Sau →
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
