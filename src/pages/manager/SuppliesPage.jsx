import { useState, useEffect, useCallback } from "react";
import { suppliesApi } from "../../api/supplies";
import { teamsApi } from "../../api/teams";

const CATEGORY_CONFIG = {
  food: { label: "🍚 Thực phẩm", color: "bg-orange-100 text-orange-700" },
  medicine: { label: "💊 Thuốc men", color: "bg-red-100 text-red-700" },
  water: { label: "💧 Nước uống", color: "bg-blue-100 text-blue-700" },
  clothing: { label: "👕 Quần áo", color: "bg-purple-100 text-purple-700" },
  equipment: { label: "🔧 Thiết bị", color: "bg-gray-100 text-gray-700" },
  other: { label: "📦 Khác", color: "bg-yellow-100 text-yellow-700" },
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
  category: "food",
  quantity: 0,
  unit: "cái",
  province_city: "",
  notes: "",
};

const EMPTY_DIST = { team_id: "", quantity: 1, notes: "" };

export default function SuppliesPage() {
  const [supplies, setSupplies] = useState([]);
  const [teams, setTeams] = useState([]);
  const [distributions, setDistributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("supplies");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [formModal, setFormModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [distributeModal, setDistributeModal] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [distForm, setDistForm] = useState(EMPTY_DIST);
  const [actionLoading, setActionLoading] = useState(false);
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
    setLoading(true);
    try {
      const res = await suppliesApi.getDistributions({ page, limit: 10 });
      setDistributions(res.data || []);
      setPagination(res.pagination);
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setLoading(false);
    }
  }, [page]);

  const fetchTeams = async () => {
    try {
      const res = await teamsApi.getAll({ limit: 100 });
      setTeams(res.data || []);
    } catch {}
  };

  useEffect(() => {
    if (activeTab === "supplies") fetchSupplies();
    else fetchDistributions();
  }, [activeTab, fetchSupplies, fetchDistributions]);

  useEffect(() => {
    fetchTeams();
  }, []);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setFormModal("create");
  };
  const openEdit = (s) => {
    setForm({
      name: s.name,
      category: s.category,
      quantity: s.quantity,
      unit: s.unit,
      province_city: s.province_city,
      notes: s.notes || "",
    });
    setFormModal(s);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.category || !form.province_city) {
      showToast("Vui lòng điền đầy đủ thông tin bắt buộc", "error");
      return;
    }
    setActionLoading(true);
    try {
      if (formModal === "create") {
        await suppliesApi.create(form);
        showToast("Đã thêm nhu yếu phẩm thành công");
      } else {
        await suppliesApi.update(formModal.id, form);
        showToast("Đã cập nhật nhu yếu phẩm");
      }
      fetchSupplies();
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
      await suppliesApi.delete(id);
      showToast("Đã xóa nhu yếu phẩm");
      fetchSupplies();
      setDeleteModal(null);
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDistribute = async () => {
    if (!distForm.team_id || !distForm.quantity) {
      showToast("Vui lòng chọn đội và nhập số lượng", "error");
      return;
    }
    setActionLoading(true);
    try {
      await suppliesApi.distribute(distributeModal.id, distForm);
      showToast("Đã phân phối thành công");
      fetchSupplies();
      setDistributeModal(null);
      setDistForm(EMPTY_DIST);
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setActionLoading(false);
    }
  };

  const updateForm = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const updateDist = (key, val) => setDistForm((f) => ({ ...f, [key]: val }));

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
          📦 Quản lý nhu yếu phẩm
        </h2>
        <div className="flex gap-3">
          {activeTab === "supplies" && (
            <>
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setPage(1);
                }}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
              >
                <option value="">Tất cả loại</option>
                {Object.entries(CATEGORY_CONFIG).map(([val, cfg]) => (
                  <option key={val} value={val}>
                    {cfg.label}
                  </option>
                ))}
              </select>
              <button
                onClick={openCreate}
                className="text-sm bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold transition"
              >
                + Thêm
              </button>
            </>
          )}
          <button
            onClick={() => {
              setActiveTab(
                activeTab === "supplies" ? "distributions" : "supplies",
              );
              setPage(1);
            }}
            className="text-sm bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg font-semibold transition"
          >
            {activeTab === "supplies"
              ? "📋 Lịch sử phân phối"
              : "📦 Danh sách kho"}
          </button>
        </div>
      </div>

      {/* Supplies Table */}
      {activeTab === "supplies" && (
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
                    Tên
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">
                    Loại
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">
                    Số lượng
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">
                    Khu vực
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">
                    Ghi chú
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {supplies.map((s) => {
                  const cat = CATEGORY_CONFIG[s.category];
                  return (
                    <tr key={s.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-semibold text-gray-800">
                        {s.name}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded-full ${cat?.color}`}
                        >
                          {cat?.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`font-bold ${s.quantity < 10 ? "text-red-600" : "text-gray-800"}`}
                        >
                          {s.quantity}
                        </span>
                        <span className="text-gray-500 ml-1">{s.unit}</span>
                        {s.quantity < 10 && (
                          <span className="ml-2 text-xs text-red-500">
                            ⚠️ Sắp hết
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        📍 {s.province_city}
                      </td>
                      <td className="px-4 py-3 text-gray-500 max-w-xs truncate">
                        {s.notes || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setDistributeModal(s);
                              setDistForm(EMPTY_DIST);
                            }}
                            disabled={s.quantity === 0}
                            className="text-xs bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1.5 rounded-lg font-semibold transition disabled:opacity-40"
                          >
                            📤 Phân phối
                          </button>
                          <button
                            onClick={() => openEdit(s)}
                            className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1.5 rounded-lg font-semibold transition"
                          >
                            ✏️ Sửa
                          </button>
                          <button
                            onClick={() => setDeleteModal(s)}
                            className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-lg font-semibold transition"
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
                {pagination.total}
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
      )}

      {/* Distributions Table */}
      {activeTab === "distributions" && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="text-center py-16 text-gray-400">Đang tải...</div>
          ) : distributions.length === 0 ? (
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
                    Ghi chú
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">
                    Thời gian
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {distributions.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-800">
                        {d.supply?.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {CATEGORY_CONFIG[d.supply?.category]?.label}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      🚒 {d.team?.name}
                    </td>
                    <td className="px-4 py-3 font-bold text-gray-800">
                      {d.quantity}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      👤 {d.manager?.username}
                    </td>
                    <td className="px-4 py-3 text-gray-500 max-w-xs truncate">
                      {d.notes || "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {new Date(d.createdAt).toLocaleString("vi-VN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-between items-center px-4 py-3 border-t border-gray-200">
              <span className="text-sm text-gray-500">
                Trang {pagination.page}/{pagination.totalPages}
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
      )}

      {/* Form Modal */}
      {formModal !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              {formModal === "create"
                ? "+ Thêm nhu yếu phẩm"
                : "✏️ Cập nhật nhu yếu phẩm"}
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Tên *
                </label>
                <input
                  value={form.name}
                  onChange={(e) => updateForm("name", e.target.value)}
                  placeholder="Gạo ST25"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Loại *
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => updateForm("category", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                  >
                    {Object.entries(CATEGORY_CONFIG).map(([val, cfg]) => (
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Số lượng
                  </label>
                  <input
                    type="number"
                    value={form.quantity}
                    onChange={(e) =>
                      updateForm("quantity", parseInt(e.target.value))
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Đơn vị
                  </label>
                  <input
                    value={form.unit}
                    onChange={(e) => updateForm("unit", e.target.value)}
                    placeholder="kg, lít, cái, thùng..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Ghi chú
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => updateForm("notes", e.target.value)}
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

      {/* Distribute Modal */}
      {distributeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold text-gray-800 mb-1">
              📤 Phân phối nhu yếu phẩm
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              <span className="font-semibold">{distributeModal.name}</span> —
              Còn {distributeModal.quantity} {distributeModal.unit}
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Đội nhận *
                </label>
                <select
                  value={distForm.team_id}
                  onChange={(e) => updateDist("team_id", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                >
                  <option value="">Chọn đội cứu hộ</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      🚒 {t.name} — {t.province_city}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Số lượng *
                </label>
                <input
                  type="number"
                  value={distForm.quantity}
                  min={1}
                  max={distributeModal.quantity}
                  onChange={(e) =>
                    updateDist("quantity", parseInt(e.target.value))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Ghi chú
                </label>
                <textarea
                  value={distForm.notes}
                  onChange={(e) => updateDist("notes", e.target.value)}
                  rows={2}
                  placeholder="Ghi chú thêm..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setDistributeModal(null)}
                className="flex-1 border border-gray-300 text-gray-600 font-semibold py-2 rounded-lg hover:bg-gray-50 transition"
              >
                Hủy
              </button>
              <button
                onClick={handleDistribute}
                disabled={actionLoading}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-2 rounded-lg transition"
              >
                {actionLoading ? "Đang xử lý..." : "📤 Xác nhận phân phối"}
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
              Bạn có chắc muốn xóa{" "}
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
