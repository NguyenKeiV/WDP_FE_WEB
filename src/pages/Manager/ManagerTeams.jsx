import React, { useState, useEffect } from "react";
import Sidebar from "../../components/manager/Sidebar";
import {
  Groups as TeamsIcon,
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  CheckCircle as AvailableIcon,
  RadioButtonChecked as OnMissionIcon,
  Cancel as UnavailableIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  People as PeopleIcon,
  Shield as ShieldIcon,
  Phone as PhoneIcon,
  Engineering as CapacityIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { teamsApi } from "../../api/teams";
import { usersApi } from "../../api/users";


// --- Cau hinh trang thai theo API -----------------------------------------
const STATUS_CONFIG = {
  available: {
    label: "Sẵn sàng",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
    badgeBg: "from-emerald-400 to-teal-500",
    pulse: true,
  },
  on_mission: {
    label: "Đang nhiệm vụ",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
    badgeBg: "from-blue-500 to-indigo-500",
    pulse: false,
  },
  unavailable: {
    label: "Không khả dụng",
    color: "bg-red-100 text-red-600 border-red-200",
    dot: "bg-red-400",
    badgeBg: "from-gray-400 to-gray-500",
    pulse: false,
  },
};

const STATUS_LABEL = {
  available: "Sẵn sàng",
  on_mission: "Đang nhiệm vụ",
  unavailable: "Không khả dụng",
};

const SPEC_CONFIG = {
  rescue: {
    label: "Cứu nạn (rescue)",
    color: "text-orange-600 bg-orange-50 border-orange-200",
  },
  relief: {
    label: "Cứu trợ / Hậu cần (relief)",
    color: "text-purple-600 bg-purple-50 border-purple-200",
  },
};

// --- Modal Tao / Chinh sua doi --------------------------------------------
function TeamFormModal({ open, onClose, onSave, editingTeam }) {
  const isEdit = !!editingTeam;

  const EMPTY_FORM = {
    name: "",
    phone_number: "",
    district: "",
    user_id: "",
    capacity: "",
    specialization: "rescue",
    available_members: "",
    status: "available",
    notes: "",
  };

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [saving, setSaving] = useState(false);
  const [rescueUsers, setRescueUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Tai danh sach tai khoan co role rescue_team
  useEffect(() => {
    if (!open) return;
    const fetchRescueUsers = async () => {
      setLoadingUsers(true);
      try {
        const res = await usersApi.getAll({ role: "rescue_team" });
        const list = res.data?.data ?? res.data ?? [];
        const filtered = (Array.isArray(list) ? list : []).filter(
          (u) => u.role === "rescue_team",
        );
        setRescueUsers(filtered);
      } catch {
        setRescueUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchRescueUsers();
  }, [open]);

  // Khoi tao form khi mo modal
  useEffect(() => {
    if (editingTeam) {
      setForm({
        name: editingTeam.name ?? "",
        phone_number: editingTeam.phone_number ?? "",
        district: editingTeam.district ?? "",
        user_id: editingTeam.user_id ?? "",
        capacity: editingTeam.capacity ?? "",
        specialization: editingTeam.specialization ?? "rescue",
        available_members: editingTeam.available_members ?? "",
        status: editingTeam.status ?? "available",
        notes: editingTeam.notes ?? "",
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
    setApiError("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingTeam, open]);

  if (!open) return null;

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Vui lòng nhập tên đội";
    if (!form.phone_number.trim())
      errs.phone_number = "Vui lòng nhập số điện thoại";
    else if (!/^0\d{9}$/.test(form.phone_number.trim()))
      errs.phone_number = "Số điện thoại không hợp lệ (10 chữ số, bắt đầu 0)";
    if (!form.district.trim()) errs.district = "Vui lòng nhập quận/huyện";
    if (!form.user_id) errs.user_id = "Vui lòng chọn trưởng đội";
    if (!form.capacity || Number(form.capacity) < 1)
      errs.capacity = "Sức chứa tối thiểu là 1";
    if (
      form.available_members !== "" &&
      Number(form.available_members) > Number(form.capacity)
    )
      errs.available_members = `Không được vượt quá sức chứa (${form.capacity})`;
    return errs;
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    // Payload theo dung API
    const payload = {
      name: form.name.trim(),
      phone_number: form.phone_number.trim(),
      district: form.district.trim(),
      user_id: form.user_id,
      capacity: Number(form.capacity),
      specialization: form.specialization,
    };
    if (form.available_members !== "")
      payload.available_members = Number(form.available_members);
    if (form.notes.trim()) payload.notes = form.notes.trim();
    if (isEdit) payload.status = form.status;

    setSaving(true);
    setApiError("");
    try {
      await onSave(payload);
      onClose();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Đã xảy ra lỗi, vui lòng thử lại.";
      setApiError(msg);
    } finally {
      setSaving(false);
    }
  };

  const ErrorBanner = () =>
    apiError ? (
      <div className="flex items-start gap-2 bg-red-50 border border-red-300 text-red-700 rounded-xl px-4 py-3 text-sm">
        <WarningIcon sx={{ fontSize: 16, marginTop: "2px", flexShrink: 0 }} />
        <span>{apiError}</span>
      </div>
    ) : null;

  const inputCls = (err) =>
    `w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition ${
      err ? "border-red-400 bg-red-50" : "border-gray-200 hover:border-gray-300"
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2.5 rounded-xl">
              <TeamsIcon className="text-white" sx={{ fontSize: 24 }} />
            </div>
            <div>
              <h2 className="text-white text-xl font-bold">
                {isEdit ? "Chỉnh sửa đội" : "Tạo đội cứu hộ mới"}
              </h2>
              <p className="text-blue-100 text-sm mt-0.5">
                {isEdit
                  ? "Cập nhật thông tin đội cứu hộ"
                  : "Điền đầy đủ thông tin để tạo đội mới"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="bg-white/10 hover:bg-white/25 text-white p-2 rounded-xl transition-colors"
          >
            <CloseIcon sx={{ fontSize: 20 }} />
          </button>
        </div>

        {/* Form body */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-4"
        >
          {/* Ten doi */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Tên đội <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="VD: Đội Cứu Hộ Quận 1 - Alpha"
              className={inputCls(errors.name)}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <WarningIcon sx={{ fontSize: 12 }} />
                {errors.name}
              </p>
            )}
          </div>

          {/* So dien thoai + Quan/Huyen */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Số điện thoại liên lạc <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <PhoneIcon
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  sx={{ fontSize: 16 }}
                />
                <input
                  type="text"
                  value={form.phone_number}
                  onChange={(e) => handleChange("phone_number", e.target.value)}
                  placeholder="0901234567"
                  className={`pl-9 ${inputCls(errors.phone_number)}`}
                />
              </div>
              {errors.phone_number && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <WarningIcon sx={{ fontSize: 12 }} />
                  {errors.phone_number}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Quận / Huyện hoạt động <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <LocationIcon
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  sx={{ fontSize: 16 }}
                />
                <input
                  type="text"
                  value={form.district}
                  onChange={(e) => handleChange("district", e.target.value)}
                  placeholder="VD: Quận Bình Thạnh"
                  className={`pl-9 ${inputCls(errors.district)}`}
                />
              </div>
              {errors.district && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <WarningIcon sx={{ fontSize: 12 }} />
                  {errors.district}
                </p>
              )}
            </div>
          </div>

          {/* Truong doi (user_id) - chi chon tai khoan co role rescue_team */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Đội trưởng <span className="text-red-500">*</span>
            </label>
            {loadingUsers ? (
              <div className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-500">
                <svg
                  className="animate-spin w-4 h-4 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
                Đang tải danh sách đội trưởng...
              </div>
            ) : (
              <select
                value={form.user_id}
                onChange={(e) => handleChange("user_id", e.target.value)}
                className={`bg-white ${inputCls(errors.user_id)}`}
              >
                <option value="">-- Chọn đội trưởng --</option>
                {rescueUsers.length > 0 ? (
                  rescueUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.username}
                    </option>
                  ))
                ) : (
                  <option disabled>Không có đội trưởng nào</option>
                )}
              </select>
            )}
            {errors.user_id && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <WarningIcon sx={{ fontSize: 12 }} />
                {errors.user_id}
              </p>
            )}
          </div>

          {/* Suc chua + Thanh vien san sang */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Sức chứa tối đa <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <CapacityIcon
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  sx={{ fontSize: 16 }}
                />
                <input
                  type="number"
                  min="1"
                  value={form.capacity}
                  onChange={(e) => handleChange("capacity", e.target.value)}
                  placeholder="VD: 10"
                  className={`pl-9 ${inputCls(errors.capacity)}`}
                />
              </div>
              {errors.capacity && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <WarningIcon sx={{ fontSize: 12 }} />
                  {errors.capacity}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Thành viên sẵn sàng{" "}
                <span className="text-xs font-normal text-gray-400">
                  (mặc định: 0)
                </span>
              </label>
              <div className="relative">
                <PeopleIcon
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  sx={{ fontSize: 16 }}
                />
                <input
                  type="number"
                  min="0"
                  value={form.available_members}
                  onChange={(e) =>
                    handleChange("available_members", e.target.value)
                  }
                  placeholder={form.capacity ? `0 - ${form.capacity}` : "VD: 8"}
                  className={`pl-9 ${inputCls(errors.available_members)}`}
                />
              </div>
              {errors.available_members && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <WarningIcon sx={{ fontSize: 12 }} />
                  {errors.available_members}
                </p>
              )}
            </div>
          </div>

          {/* Chuyen mon + Trang thai */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Chuyên môn
              </label>
              <select
                value={form.specialization}
                onChange={(e) => handleChange("specialization", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 hover:border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
              >
                <option value="rescue">Cứu nạn (rescue)</option>
                <option value="relief">Cứu trợ / Hậu cần (relief)</option>
              </select>
            </div>

            {isEdit && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Trạng thái
                </label>
                <select
                  value={form.status}
                  onChange={(e) => handleChange("status", e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                >
                  <option value="available">Sẵn sàng (available)</option>
                  <option value="unavailable">
                    Không khả dụng (unavailable)
                  </option>
                </select>
                <p className="text-xs text-gray-400 mt-1">
                  * on_mission được cập nhật tự động bởi Coordinator
                </p>
              </div>
            )}
          </div>

          {/* Loi API */}
          <ErrorBanner />

          {/* Ghi chu */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Ghi chú
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Ghi chú thêm về đội, nhiệm vụ đặc thù..."
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-200 hover:border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition resize-none"
            />
          </div>

          {/* Canh bao khi doi dang on_mission */}
          {isEdit && editingTeam?.status === "on_mission" && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
              <WarningIcon sx={{ fontSize: 16 }} className="shrink-0 mt-0.5" />
              Đội đang thực hiện nhiệm vụ (on_mission). Không thể xóa cho đến
              khi hoàn thành.
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 bg-gray-50/60 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-100 transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-60 flex items-center gap-2"
          >
            {saving ? (
              <>
                <svg
                  className="animate-spin w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
                Đang lưu...
              </>
            ) : isEdit ? (
              <>
                <EditIcon sx={{ fontSize: 18 }} />
                Cập nhật
              </>
            ) : (
              <>
                <AddIcon sx={{ fontSize: 18 }} />
                Tạo đội
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Modal xac nhan xoa ---------------------------------------------------
function DeleteConfirmModal({ open, team, onClose, onConfirm }) {
  if (!open || !team) return null;
  const isOnMission = team.status === "on_mission";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center gap-4 mb-4">
          <div
            className={`p-3 rounded-xl ${
              isOnMission ? "bg-amber-100" : "bg-red-100"
            }`}
          >
            {isOnMission ? (
              <WarningIcon className="text-amber-600" sx={{ fontSize: 28 }} />
            ) : (
              <DeleteIcon className="text-red-600" sx={{ fontSize: 28 }} />
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {isOnMission ? "Không thể xóa đội" : "Xóa đội nhóm"}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">
              {isOnMission
                ? "Đội đang thực hiện nhiệm vụ"
                : "Hành động này không thể hoàn tác"}
            </p>
          </div>
        </div>

        {isOnMission ? (
          <p className="text-gray-700 text-sm mb-6">
            Đội <span className="font-bold text-amber-600">"{team.name}"</span>{" "}
            đang ở trạng thái{" "}
            <span className="font-bold text-blue-600">on_mission</span>. Vui
            lòng chờ đội hoàn thành nhiệm vụ trước khi xóa.
          </p>
        ) : (
          <p className="text-gray-700 text-sm mb-6">
            Bạn có chắc muốn xóa đội{" "}
            <span className="font-bold text-red-600">"{team.name}"</span>? Dữ
            liệu sẽ bị ẩn khỏi hệ thống (soft delete).
          </p>
        )}

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            {isOnMission ? "Đóng" : "Hủy"}
          </button>
          {!isOnMission && (
            <button
              onClick={() => {
                onConfirm(team.id);
                onClose();
              }}
              className="px-5 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors shadow-lg shadow-red-500/25 flex items-center gap-2"
            >
              <DeleteIcon sx={{ fontSize: 18 }} />
              Xóa đội
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Card doi nhom -------------------------------------------------------
function TeamCard({ team, onEdit, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const cfg = STATUS_CONFIG[team.status] || STATUS_CONFIG.unavailable;
  const specCfg = SPEC_CONFIG[team.specialization] || SPEC_CONFIG.rescue;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden">
      {/* Accent bar */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${cfg.badgeBg}`} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div
              className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center shadow-sm bg-gradient-to-br ${cfg.badgeBg}`}
            >
              <TeamsIcon className="text-white" sx={{ fontSize: 22 }} />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-gray-900 leading-tight truncate">
                {team.name}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Tạo:{" "}
                {team.created_at
                  ? new Date(team.created_at).toLocaleDateString("vi-VN")
                  : "—"}
              </p>
            </div>
          </div>

          {/* Menu */}
          <div className="relative shrink-0 ml-2">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <MoreIcon sx={{ fontSize: 20 }} />
            </button>
            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-8 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-20 w-36">
                  <button
                    onClick={() => {
                      onEdit(team);
                      setMenuOpen(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 w-full transition-colors"
                  >
                    <EditIcon sx={{ fontSize: 16 }} /> Chỉnh sửa
                  </button>
                  <button
                    onClick={() => {
                      onDelete(team);
                      setMenuOpen(false);
                    }}
                    className={`flex items-center gap-2 px-4 py-2 text-sm w-full transition-colors ${
                      team.status === "on_mission"
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-red-600 hover:bg-red-50"
                    }`}
                    disabled={team.status === "on_mission"}
                  >
                    <DeleteIcon sx={{ fontSize: 16 }} /> Xóa đội
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Status + Spec badges */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.color}`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${
                cfg.pulse ? "animate-pulse" : ""
              }`}
            />
            {cfg.label}
          </span>
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${specCfg.color}`}
          >
            <ShieldIcon sx={{ fontSize: 11 }} />
            {specCfg.label}
          </span>
        </div>

        {/* Thong tin */}
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <PersonIcon
              sx={{ fontSize: 14 }}
              className="text-blue-400 shrink-0"
            />
            <span className="truncate">
              Trưởng đội:{" "}
              <span className="font-medium">
                {team.leader_account?.username ??
                  team.leader_account?.email ??
                  "—"}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <LocationIcon
              sx={{ fontSize: 14 }}
              className="text-emerald-400 shrink-0"
            />
            <span className="truncate">{team.district ?? "—"}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <PhoneIcon
              sx={{ fontSize: 14 }}
              className="text-orange-400 shrink-0"
            />
            <span>{team.phone_number ?? "—"}</span>
          </div>
          {team.notes && (
            <div className="flex items-start gap-2 text-xs text-gray-500 italic">
              <span className="text-gray-300 shrink-0 mt-0.5">&#128221;</span>
              <span className="line-clamp-1">{team.notes}</span>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="pt-3 border-t border-gray-100">
          <div className="bg-gray-50 rounded-xl p-2.5 text-center">
            <p className="text-lg font-bold text-gray-700">
              {team.capacity ?? 0}
            </p>
            <p className="text-xs text-gray-500 font-medium">Sức chứa</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Trang chinh ----------------------------------------------------------
export default function ManagerTeams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSpec, setFilterSpec] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [deletingTeam, setDeletingTeam] = useState(null);

  // Tai danh sach doi tu API
  // API: GET /api/rescue-teams?limit=100
  // Response: { success, data: [...], pagination }
  const fetchTeams = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await teamsApi.getAll({ limit: 100 });
      const list = res.data?.data ?? res.data ?? [];
      setTeams(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Lỗi tải danh sách đội:", err.message);
      setTeams([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  // Thong ke
  const stats = {
    total: teams.length,
    available: teams.filter((t) => t.status === "available").length,
    on_mission: teams.filter((t) => t.status === "on_mission").length,
    unavailable: teams.filter((t) => t.status === "unavailable").length,
    totalAvailableMembers: teams.reduce(
      (sum, t) => sum + (t.available_members ?? 0),
      0,
    ),
    totalCapacity: teams.reduce((sum, t) => sum + (t.capacity ?? 0), 0),
  };

  // Loc danh sach
  const filteredTeams = teams.filter((t) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      t.name?.toLowerCase().includes(q) ||
      t.district?.toLowerCase().includes(q) ||
      t.phone_number?.includes(q) ||
      t.leader_account?.username?.toLowerCase().includes(q) ||
      t.leader_account?.email?.toLowerCase().includes(q);
    const matchStatus = filterStatus === "all" || t.status === filterStatus;
    const matchSpec = filterSpec === "all" || t.specialization === filterSpec;
    return matchSearch && matchStatus && matchSpec;
  });

  // Luu doi (tao moi / chinh sua)
  const handleSave = async (payload) => {
    if (editingTeam) {
      // PUT /api/rescue-teams/:id
      let updated = { ...editingTeam, ...payload };
      try {
        const res = await teamsApi.update(editingTeam.id, payload);
        if (res.data?.data) updated = res.data.data;
      } catch (err) {
        console.warn("Cap nhat API loi, cap nhat local:", err.message);
      }
      setTeams((prev) =>
        prev.map((t) => (t.id === editingTeam.id ? updated : t)),
      );
    } else {
      // POST /api/rescue-teams
      const res = await teamsApi.create(payload);
      const newTeam = res.data?.data ?? {
        ...payload,
        id: `local-${Date.now()}`,
        available_members: payload.available_members ?? 0,
        status: "available",
        leader_account: null,
        created_at: new Date().toISOString(),
      };
      setTeams((prev) => [newTeam, ...prev]);
    }
    setEditingTeam(null);
  };

  // Xoa doi — DELETE /api/rescue-teams/:id
  // Chi xoa duoc khi status != on_mission
  const handleDelete = async (id) => {
    try {
      await teamsApi.delete(id);
    } catch (err) {
      console.warn("Xoa API loi, xoa local:", err.message);
    }
    setTeams((prev) => prev.filter((t) => t.id !== id));
  };

  const openEdit = (team) => {
    setEditingTeam(team);
    setShowForm(true);
  };

  const openCreate = () => {
    setEditingTeam(null);
    setShowForm(true);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-gray-200 px-8 py-4 flex items-center justify-between shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <TeamsIcon className="text-blue-600" sx={{ fontSize: 28 }} />
              Quản lý Đội nhóm
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Tổ chức và điều phối các đội cứu hộ / cứu trợ
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchTeams}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <RefreshIcon
                sx={{ fontSize: 18 }}
                className={loading ? "animate-spin" : ""}
              />
              Làm mới
            </button>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg shadow-blue-500/25"
            >
              <AddIcon sx={{ fontSize: 20 }} />
              Tạo đội mới
            </button>
          </div>
        </div>

        <div className="p-8">
          {/* Thong ke */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              {
                label: "Tổng số đội",
                value: stats.total,
                icon: TeamsIcon,
                gradient: "from-blue-500 to-cyan-600",
                bg: "from-blue-50 to-cyan-50",
                text: "text-blue-700",
              },
              {
                label: "Sẵn sàng (available)",
                value: stats.available,
                icon: AvailableIcon,
                gradient: "from-emerald-500 to-teal-600",
                bg: "from-emerald-50 to-teal-50",
                text: "text-emerald-700",
              },
              {
                label: "Đang nhiệm vụ",
                value: stats.on_mission,
                icon: OnMissionIcon,
                gradient: "from-blue-400 to-indigo-500",
                bg: "from-blue-50 to-indigo-50",
                text: "text-blue-700",
              },
              {
                label: "Tổng sức chứa",
                value: stats.totalCapacity,
                icon: PeopleIcon,
                gradient: "from-purple-500 to-pink-600",
                bg: "from-purple-50 to-pink-50",
                text: "text-purple-700",
              },
            ].map((s) => (
              <div
                key={s.label}
                className={`bg-gradient-to-br ${s.bg} border border-gray-200/60 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow`}
              >
                <div
                  className={`bg-gradient-to-br ${s.gradient} p-3 rounded-xl shadow-lg`}
                >
                  <s.icon className="text-white" sx={{ fontSize: 24 }} />
                </div>
                <div>
                  <p className={`text-2xl font-extrabold ${s.text}`}>
                    {s.value}
                  </p>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">
                    {s.label}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Tim kiem & Bo loc */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 flex flex-wrap gap-3 items-center shadow-sm">
            <div className="relative flex-1 min-w-56">
              <SearchIcon
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                sx={{ fontSize: 18 }}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm theo tên đội, quận/huyện, SĐT, trưởng đội..."
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              />
            </div>

            <div className="flex items-center gap-2">
              <FilterIcon sx={{ fontSize: 18 }} className="text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="available">Sẵn sàng</option>
                <option value="on_mission">Đang nhiệm vụ</option>
                <option value="unavailable">Không khả dụng</option>
              </select>
            </div>

            <select
              value={filterSpec}
              onChange={(e) => setFilterSpec(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
            >
              <option value="all">Tất cả chuyên môn</option>
              <option value="rescue">Cứu nạn (rescue)</option>
              <option value="relief">Cứu trợ (relief)</option>
            </select>

            <span className="text-sm text-gray-500 font-medium ml-auto">
              {filteredTeams.length} / {teams.length} đội
            </span>
          </div>

          {/* Loi */}
          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm mb-6">
              <WarningIcon sx={{ fontSize: 18 }} />
              {error}
            </div>
          )}

          {/* Danh sach */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400">
              <svg
                className="animate-spin w-10 h-10 mb-4 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                />
              </svg>
              <p className="text-sm font-medium">Đang tải dữ liệu từ API...</p>
            </div>
          ) : filteredTeams.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400">
              <TeamsIcon sx={{ fontSize: 64 }} className="text-gray-200 mb-4" />
              <p className="text-lg font-semibold text-gray-500">
                Không tìm thấy đội nào
              </p>
              <p className="text-sm mt-1">Thử thay đổi từ khóa hoặc bộ lọc</p>
              <button
                onClick={openCreate}
                className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                <AddIcon sx={{ fontSize: 18 }} />
                Tạo đội đầu tiên
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredTeams.map((team) => (
                <TeamCard
                  key={team.id}
                  team={team}
                  onEdit={openEdit}
                  onDelete={(t) => setDeletingTeam(t)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <TeamFormModal
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingTeam(null);
        }}
        onSave={handleSave}
        editingTeam={editingTeam}
      />
      <DeleteConfirmModal
        open={!!deletingTeam}
        team={deletingTeam}
        onClose={() => setDeletingTeam(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
