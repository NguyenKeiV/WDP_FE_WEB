import { useState, useEffect, useCallback } from "react";
import { vehiclesApi } from "../../api/vehicles";
import { teamsApi } from "../../api/teams";

const STATUS_CONFIG = {
  available: { label: "✅ Sẵn sàng", color: "bg-green-100 text-green-700" },
  in_use: { label: "🚗 Đang sử dụng", color: "bg-blue-100 text-blue-700" },
  maintenance: { label: "🔧 Bảo trì", color: "bg-yellow-100 text-yellow-700" },
};

const TYPE_CONFIG = {
  car: "🚗 Ô tô",
  boat: "⛵ Thuyền",
  helicopter: "🚁 Trực thăng",
  truck: "🚛 Xe tải",
  motorcycle: "🏍️ Xe máy",
  other: "🚘 Khác",
};

const PROVINCES = [
  "Hà Nội",
  "TP. Hồ Chí Minh",
  "Đà Nẵng",
  "Cần Thơ",
  "Hải Phòng",
  "An Giang",
  "Bà Rịa - Vũng Tàu",
  "Bắc Giang",
  "Bắc Kạn",
  "Bạc Liêu",
  "Bắc Ninh",
  "Bến Tre",
  "Bình Định",
  "Bình Dương",
  "Bình Phước",
  "Bình Thuận",
  "Cà Mau",
  "Cao Bằng",
  "Đắk Lắk",
  "Đắk Nông",
  "Điện Biên",
  "Đồng Nai",
  "Đồng Tháp",
  "Gia Lai",
  "Hà Giang",
  "Hà Nam",
  "Hà Tĩnh",
  "Hải Dương",
  "Hậu Giang",
  "Hòa Bình",
  "Hưng Yên",
  "Khánh Hòa",
  "Kiên Giang",
  "Kon Tum",
  "Lai Châu",
  "Lâm Đồng",
  "Lạng Sơn",
  "Lào Cai",
  "Long An",
  "Nam Định",
  "Nghệ An",
  "Ninh Bình",
  "Ninh Thuận",
  "Phú Thọ",
  "Phú Yên",
  "Quảng Bình",
  "Quảng Nam",
  "Quảng Ngãi",
  "Quảng Ninh",
  "Quảng Trị",
  "Sóc Trăng",
  "Sơn La",
  "Tây Ninh",
  "Thái Bình",
  "Thái Nguyên",
  "Thanh Hóa",
  "Thừa Thiên Huế",
  "Tiền Giang",
  "Trà Vinh",
  "Tuyên Quang",
  "Vĩnh Long",
  "Vĩnh Phúc",
  "Yên Bái",
];

const EMPTY_FORM = {
  name: "",
  type: "car",
  license_plate: "",
  status: "available",
  assigned_team_id: "",
  province_city: "",
  notes: "",
};

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [formModal, setFormModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [actionLoading, setActionLoading] = useState(false);
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

  const fetchTeams = async () => {
    try {
      const res = await teamsApi.getAll({ limit: 100 });
      setTeams(res.data || []);
    } catch {}
  };

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);
  useEffect(() => {
    fetchTeams();
  }, []);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setFormModal("create");
  };
  const openEdit = (v) => {
    setForm({
      name: v.name,
      type: v.type,
      license_plate: v.license_plate || "",
      status: v.status,
      assigned_team_id: v.assigned_team_id || "",
      province_city: v.province_city,
      notes: v.notes || "",
    });
    setFormModal(v);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.type || !form.province_city) {
      showToast("Vui lòng điền đầy đủ thông tin bắt buộc", "error");
      return;
    }
    setActionLoading(true);
    try {
      const payload = {
        ...form,
        assigned_team_id: form.assigned_team_id || null,
      };
      if (formModal === "create") {
        await vehiclesApi.create(payload);
        showToast("Đã thêm phương tiện thành công");
      } else {
        await vehiclesApi.update(formModal.id, payload);
        showToast("Đã cập nhật phương tiện");
      }
      fetchVehicles();
      setFormModal(null);
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setActionLoading(true);
    try {
      await vehiclesApi.delete(id);
      showToast("Đã xóa phương tiện");
      fetchVehicles();
      setDeleteModal(null);
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setActionLoading(false);
    }
  };

  const updateForm = (key, val) => setForm((f) => ({ ...f, [key]: val }));

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
        <h2 className="text-2xl font-bold text-gray-800">
          🚗 Quản lý phương tiện
        </h2>
        <div className="flex gap-3">
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
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            <option value="">Tất cả loại</option>
            {Object.entries(TYPE_CONFIG).map(([val, label]) => (
              <option key={val} value={val}>
                {label}
              </option>
            ))}
          </select>
          <button
            onClick={fetchVehicles}
            className="text-sm bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg font-semibold transition"
          >
            🔄 Làm mới
          </button>
          <button
            onClick={openCreate}
            className="text-sm bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold transition"
          >
            + Thêm phương tiện
          </button>
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
                  Tên
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
                  Đội sử dụng
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">
                  Trạng thái
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {vehicles.map((v) => {
                const status = STATUS_CONFIG[v.status];
                return (
                  <tr key={v.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-semibold text-gray-800">
                      {v.name}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {TYPE_CONFIG[v.type]}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {v.license_plate || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      📍 {v.province_city}
                    </td>
                    <td className="px-4 py-3">
                      {v.assigned_team ? (
                        <span className="text-xs font-semibold text-blue-700">
                          🚒 {v.assigned_team.name}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full ${status?.color}`}
                      >
                        {status?.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(v)}
                          className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1.5 rounded-lg font-semibold transition"
                        >
                          ✏️ Sửa
                        </button>
                        <button
                          onClick={() => setDeleteModal(v)}
                          disabled={v.status === "in_use"}
                          className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-lg font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          🗑️ Xóa
                        </button>
                      </div>
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

      {/* Form Modal */}
      {formModal !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              {formModal === "create"
                ? "+ Thêm phương tiện"
                : "✏️ Cập nhật phương tiện"}
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Tên phương tiện *
                </label>
                <input
                  value={form.name}
                  onChange={(e) => updateForm("name", e.target.value)}
                  placeholder="Xe cứu hộ Toyota"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Loại *
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => updateForm("type", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                  >
                    {Object.entries(TYPE_CONFIG).map(([val, label]) => (
                      <option key={val} value={val}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Biển số
                  </label>
                  <input
                    value={form.license_plate}
                    onChange={(e) =>
                      updateForm("license_plate", e.target.value)
                    }
                    placeholder="51A-12345"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Trạng thái
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => updateForm("status", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                  >
                    {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
                      <option key={val} value={val}>
                        {cfg.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Tỉnh/Thành phố *
                  </label>
                  <select
                    value={form.province_city}
                    onChange={(e) =>
                      updateForm("province_city", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                  >
                    <option value="">Chọn tỉnh/thành</option>
                    {PROVINCES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Đội đang sử dụng
                </label>
                <select
                  value={form.assigned_team_id}
                  onChange={(e) =>
                    updateForm("assigned_team_id", e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                >
                  <option value="">— Chưa giao cho đội nào</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      🚒 {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Ghi chú
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => updateForm("notes", e.target.value)}
                  placeholder="Ghi chú thêm..."
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setFormModal(null)}
                className="flex-1 border border-gray-300 text-gray-600 font-semibold py-2 rounded-lg hover:bg-gray-50 transition"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                disabled={actionLoading}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-2 rounded-lg transition"
              >
                {actionLoading
                  ? "Đang lưu..."
                  : formModal === "create"
                    ? "Thêm"
                    : "Cập nhật"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-1">
              Xác nhận xóa
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Bạn có chắc muốn xóa phương tiện{" "}
              <span className="font-semibold text-gray-800">
                {deleteModal.name}
              </span>
              ?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal(null)}
                className="flex-1 border border-gray-300 text-gray-600 font-semibold py-2 rounded-lg hover:bg-gray-50 transition"
              >
                Hủy
              </button>
              <button
                onClick={() => handleDelete(deleteModal.id)}
                disabled={actionLoading}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-2 rounded-lg transition"
              >
                {actionLoading ? "Đang xóa..." : "Xóa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
