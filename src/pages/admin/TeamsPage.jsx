import { useState, useEffect, useCallback } from "react";
import { teamsApi } from "../../api/teams";
import { usersApi } from "../../api/users";
import { useAuth } from "../../context/AuthContext";
import apiClient from "../../api/client";

const STATUS_CONFIG = {
  available: { label: "✅ Sẵn sàng", color: "bg-green-100 text-green-700" },
  on_mission: { label: "🚨 Đang nhiệm vụ", color: "bg-red-100 text-red-700" },
  unavailable: {
    label: "⛔ Không khả dụng",
    color: "bg-gray-100 text-gray-600",
  },
};

const SPECIALIZATION_CONFIG = {
  general: "🔧 Tổng hợp",
  medical: "🏥 Y tế",
  vehicle: "🚗 Cứu hộ xe",
  supplies: "📦 Nhu yếu phẩm",
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
  leader_name: "",
  phone_number: "",
  specialization: "general",
  capacity: 5,
  current_members: 0,
  province_city: "",
  notes: "",
  user_id: "",
};

export default function TeamsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [teams, setTeams] = useState([]);
  const [rescueTeamUsers, setRescueTeamUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [formModal, setFormModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchTeams = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (statusFilter) params.status = statusFilter;
      const res = await teamsApi.getAll(params);
      setTeams(res.data || []);
      setPagination(res.pagination);
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  const fetchRescueTeamUsers = async () => {
    try {
      const res = await usersApi.getAll({ role: "rescue_team", limit: 100 });
      setRescueTeamUsers(res.data || []);
    } catch {}
  };

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);
  useEffect(() => {
    fetchRescueTeamUsers();
  }, []);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setFormModal("create");
  };

  const openEdit = (team) => {
    setForm({
      name: team.name,
      leader_name: team.leader_name,
      phone_number: team.phone_number,
      specialization: team.specialization,
      capacity: team.capacity,
      current_members: team.current_members,
      province_city: team.province_city,
      notes: team.notes || "",
      user_id: team.user_id || "",
    });
    setFormModal(team);
  };

  const handleSubmit = async () => {
    if (
      !form.name ||
      !form.leader_name ||
      !form.phone_number ||
      !form.province_city
    ) {
      showToast("Vui lòng điền đầy đủ thông tin bắt buộc", "error");
      return;
    }
    setActionLoading(true);
    try {
      const payload = { ...form, user_id: form.user_id || null };
      if (formModal === "create") {
        await apiClient.post("/rescue-teams", payload);
        showToast("Đã tạo đội cứu hộ thành công");
      } else {
        await apiClient.put(`/rescue-teams/${formModal.id}`, payload);
        showToast("Đã cập nhật đội cứu hộ");
      }
      fetchTeams();
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
      await apiClient.delete(`/rescue-teams/${id}`);
      showToast("Đã xóa đội cứu hộ");
      fetchTeams();
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
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            🚒 {isAdmin ? "Quản lý đội cứu hộ" : "Đội cứu hộ"}
          </h2>
          {!isAdmin && (
            <p className="text-sm text-gray-500 mt-1">
              Xem danh sách và trạng thái đội cứu hộ
            </p>
          )}
        </div>
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
          <button
            onClick={fetchTeams}
            className="text-sm bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg font-semibold transition"
          >
            🔄 Làm mới
          </button>
          {isAdmin && (
            <button
              onClick={openCreate}
              className="text-sm bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold transition"
            >
              + Thêm đội
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-gray-400">Đang tải...</div>
        ) : teams.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-2">🚒</div>
            <p className="text-gray-500">Chưa có đội cứu hộ nào</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">
                  Tên đội
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">
                  Đội trưởng
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">
                  Tài khoản
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">
                  Chuyên môn
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">
                  Khu vực
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">
                  Thành viên
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">
                  Trạng thái
                </th>
                {isAdmin && (
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">
                    Hành động
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {teams.map((team) => {
                const status = STATUS_CONFIG[team.status];
                const linkedUser = rescueTeamUsers.find(
                  (u) => u.id === team.user_id,
                );
                return (
                  <tr key={team.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-semibold text-gray-800">
                      {team.name}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-700">{team.leader_name}</p>
                      <p className="text-xs text-gray-400">
                        📞 {team.phone_number}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      {linkedUser ? (
                        <div>
                          <p className="text-xs font-semibold text-blue-700">
                            👤 {linkedUser.username}
                          </p>
                          <p className="text-xs text-gray-400">
                            {linkedUser.email}
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">
                          — Chưa liên kết
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {SPECIALIZATION_CONFIG[team.specialization]}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      📍 {team.province_city}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {team.current_members}/{team.capacity} người
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full ${status?.color}`}
                      >
                        {status?.label}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEdit(team)}
                            className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1.5 rounded-lg font-semibold transition"
                          >
                            ✏️ Sửa
                          </button>
                          <button
                            onClick={() => setDeleteModal(team)}
                            disabled={team.status === "on_mission"}
                            className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-lg font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            🗑️ Xóa
                          </button>
                        </div>
                      </td>
                    )}
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
              {pagination.total} đội
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
                ? "+ Thêm đội cứu hộ"
                : "✏️ Cập nhật đội cứu hộ"}
            </h2>

            <div className="space-y-3">
              {[
                {
                  key: "name",
                  label: "Tên đội *",
                  placeholder: "Đội cứu hộ số 1",
                },
                {
                  key: "leader_name",
                  label: "Tên đội trưởng *",
                  placeholder: "Nguyễn Văn A",
                },
                {
                  key: "phone_number",
                  label: "Số điện thoại *",
                  placeholder: "0912 345 678",
                },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    {label}
                  </label>
                  <input
                    value={form[key]}
                    onChange={(e) => updateForm(key, e.target.value)}
                    placeholder={placeholder}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </div>
              ))}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Tài khoản trưởng nhóm
                </label>
                <select
                  value={form.user_id}
                  onChange={(e) => updateForm("user_id", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                >
                  <option value="">— Chưa liên kết tài khoản</option>
                  {rescueTeamUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.username} ({u.email})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">
                  Chỉ hiển thị tài khoản có role{" "}
                  <span className="font-semibold">rescue_team</span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Tỉnh/Thành phố *
                </label>
                <select
                  value={form.province_city}
                  onChange={(e) => updateForm("province_city", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                >
                  <option value="">Chọn tỉnh/thành phố</option>
                  {PROVINCES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Chuyên môn
                </label>
                <select
                  value={form.specialization}
                  onChange={(e) => updateForm("specialization", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                >
                  {Object.entries(SPECIALIZATION_CONFIG).map(([val, label]) => (
                    <option key={val} value={val}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Sức chứa
                  </label>
                  <input
                    type="number"
                    value={form.capacity}
                    onChange={(e) =>
                      updateForm("capacity", parseInt(e.target.value))
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Thành viên hiện tại
                  </label>
                  <input
                    type="number"
                    value={form.current_members}
                    onChange={(e) =>
                      updateForm("current_members", parseInt(e.target.value))
                    }
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
                    ? "Tạo đội"
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
              Bạn có chắc muốn xóa đội{" "}
              <span className="font-semibold text-gray-800">
                {deleteModal.name}
              </span>
              ? Hành động này không thể hoàn tác.
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
