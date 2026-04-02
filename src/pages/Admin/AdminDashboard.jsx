import React, { useState, useEffect, useMemo, useCallback } from "react";
import Sidebar from "../../components/admin/Sidebar";
import avatarUser from "../../assets/images/avatar-user.svg";
import {
  getAllUsers,
  registerUser,
  updateUser,
  deleteUser,
  createTeamLeaderAccount,
} from "../../services/userService";
import {
  People,
  CheckCircle,
  HourglassEmpty,
  Lock,
  ChevronRight,
  Add,
  Search,
  Close,
  KeyboardArrowDown,
  TableChart,
  Apps,
  Download,
  CalendarMonth,
  VpnKey,
  Edit,
  LockOpen,
  Delete,
  Visibility,
  Save,
  Email,
  PersonAdd,
} from "@mui/icons-material";

const ROLES = [
  { value: "CITIZEN", label: "Người dân" },
  { value: "RESCUE_TEAM", label: "Đội cứu hộ" },
  { value: "COORDINATOR", label: "Điều phối viên" },
  { value: "MANAGER", label: "Quản lý" },
  { value: "ADMIN", label: "Quản trị viên" },
];

const ROLE_MAP = Object.fromEntries(ROLES.map((r) => [r.value, r.label]));

const ROLE_COLOR_MAP = {
  ADMIN: "purple",
  MANAGER: "purple",
  COORDINATOR: "blue",
  RESCUE_TEAM: "orange",
  CITIZEN: "slate",
};

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

function UserFormModal({ open, onClose, onSave, initial, saving }) {
  const isEdit = !!initial;
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "CITIZEN",
    fullName: "",
    phoneNumber: "",
  });

  useEffect(() => {
    if (initial) {
      setForm({
        username: initial.username || "",
        email: initial.email || "",
        password: "",
        role: initial.role || "CITIZEN",
        fullName: initial.fullName || "",
        phoneNumber: initial.phoneNumber || "",
      });
    } else {
      setForm({
        username: "",
        email: "",
        password: "",
        role: "CITIZEN",
        fullName: "",
        phoneNumber: "",
      });
    }
  }, [initial]);

  if (!open) return null;

  const set = (field) => (e) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEdit) {
      const { password, username, ...payload } = form;
      if (password) payload.password = password;
      onSave(payload);
    } else {
      onSave(form);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4 flex items-center justify-between">
          <h2 className="text-white font-bold text-lg">
            {isEdit ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
          </h2>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <Close />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {!isEdit && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                required
                value={form.username}
                onChange={set("username")}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                placeholder="Nguyễn Văn A"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Họ và tên
            </label>
            <input
              value={form.fullName}
              onChange={set("fullName")}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              placeholder="Nguyễn Văn A"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="email"
              value={form.email}
              onChange={set("email")}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              placeholder="user@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              {isEdit ? "Mật khẩu mới (bỏ trống nếu không đổi)" : "Mật khẩu"}{" "}
              {!isEdit && <span className="text-red-500">*</span>}
            </label>
            <input
              required={!isEdit}
              type="password"
              value={form.password}
              onChange={set("password")}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Số điện thoại
            </label>
            <input
              value={form.phoneNumber}
              onChange={set("phoneNumber")}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              placeholder="0912345678"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Vai trò <span className="text-red-500">*</span>
            </label>
            <select
              value={form.role}
              onChange={set("role")}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-50"
            >
              <Save sx={{ fontSize: 18 }} />
              {saving ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function UserDetailModal({ open, onClose, user }) {
  if (!open || !user) return null;

  const formatDate = (d) => {
    if (!d) return "N/A";
    const dt = new Date(d);
    return `${String(dt.getDate()).padStart(2, "0")}/${String(dt.getMonth() + 1).padStart(2, "0")}/${dt.getFullYear()} ${String(dt.getHours()).padStart(2, "0")}:${String(dt.getMinutes()).padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4 flex items-center justify-between">
          <h2 className="text-white font-bold text-lg">Chi tiết người dùng</h2>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <Close />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4 pb-4 border-b">
            <img
              src={avatarUser}
              alt=""
              className="w-16 h-16 rounded-full ring-2 ring-emerald-200"
            />
            <div>
              <p className="font-bold text-gray-900 text-lg">
                {user.fullName || user.username}
              </p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-500">Họ và tên</p>
              <p className="font-semibold text-gray-900">
                {user.fullName || user.username || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Vai trò</p>
              <p className="font-semibold text-gray-900">
                {ROLE_MAP[user.role] || user.role}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Số điện thoại</p>
              <p className="font-semibold text-gray-900">
                {user.phoneNumber || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Trạng thái</p>
              <p
                className={`font-semibold ${user.isActive ? "text-green-600" : "text-red-600"}`}
              >
                {user.isActive ? "Đang hoạt động" : "Đã khóa"}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Ngày tạo</p>
              <p className="font-semibold text-gray-900">
                {formatDate(user.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Cập nhật lần cuối</p>
              <p className="font-semibold text-gray-900">
                {formatDate(user.updatedAt)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-full mt-2 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({ open, onClose, onConfirm, title, message, loading }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
        <div className="p-6 text-center">
          <div className="w-14 h-14 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <Lock sx={{ fontSize: 28 }} className="text-red-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-600 mb-6">{message}</p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? "Đang xử lý..." : "Xác nhận"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CreateTeamLeaderModal({ open, onClose, onSuccess }) {
  const [form, setForm] = useState({ email: "", username: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!open) {
      setForm({ email: "", username: "" });
      setError("");
      setDone(false);
      setSaving(false);
    }
  }, [open]);

  const set = (field) => (e) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    const result = await onSuccess(form);
    setSaving(false);
    if (result.success) {
      setDone(true);
    } else {
      setError(result.error || "Đã xảy ra lỗi, vui lòng thử lại.");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <PersonAdd sx={{ fontSize: 22 }} className="text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">
                Tạo tài khoản Trưởng nhóm
              </h2>
              <p className="text-white/70 text-xs">
                Hệ thống sẽ gửi email thông tin đăng nhập tự động
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <Close />
          </button>
        </div>

        {done ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              Tài khoản đã được tạo!
            </h3>
            <p className="text-sm text-gray-600">
              Email thông tin đăng nhập đã được gửi đến{" "}
              <strong>{form.email}</strong>. Trưởng nhóm có thể đăng nhập với
              mật khẩu trong email.
            </p>
            <button
              onClick={onClose}
              className="w-full mt-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all"
            >
              Đóng
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-sm text-indigo-800 flex items-start gap-3">
              <Email sx={{ fontSize: 18, mt: 0.3 }} className="shrink-0" />
              <p>
                Sau khi tạo, hệ thống sẽ tự động tạo mật khẩu ngẫu nhiên và gửi
                thông tin đăng nhập qua email cho trưởng nhóm.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Email trưởng nhóm <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="email"
                value={form.email}
                onChange={set("email")}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                placeholder="truongnhom@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                required
                value={form.username}
                onChange={set("username")}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                placeholder="Nguyễn Văn A"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-50"
              >
                <PersonAdd sx={{ fontSize: 18 }} />
                {saving ? "Đang gửi..." : "Tạo và gửi email"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("table");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const [formOpen, setFormOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [saving, setSaving] = useState(false);

  const [teamLeaderOpen, setTeamLeaderOpen] = useState(false);

  const [detailUser, setDetailUser] = useState(null);

  const [confirmAction, setConfirmAction] = useState(null);
  const [confirming, setConfirming] = useState(false);

  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAllUsers();
      if (response.success && response.data) {
        setUsers(response.data);
      }
    } catch (err) {
      setError(err.message || "Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const getRoleLabel = (role) => ROLE_MAP[role] || role;
  const getRoleColor = (role) => ROLE_COLOR_MAP[role] || "slate";

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      if (roleFilter !== "all") {
        const roleMap = {
          manager: "MANAGER",
          coordinator: "COORDINATOR",
          rescue: "RESCUE_TEAM",
          citizen: "CITIZEN",
          admin: "ADMIN",
        };
        if (user.role !== roleMap[roleFilter]) return false;
      }
      if (statusFilter !== "all") {
        const isActive = user.isActive;
        if (statusFilter === "active" && !isActive) return false;
        if (statusFilter === "locked" && isActive) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const name = (user.fullName || "").toLowerCase();
        const email = (user.email || "").toLowerCase();
        const phone = (user.phoneNumber || "").toLowerCase();
        if (!name.includes(q) && !email.includes(q) && !phone.includes(q))
          return false;
      }
      return true;
    });
  }, [users, roleFilter, statusFilter, searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [roleFilter, statusFilter, searchQuery]);

  const totalFiltered = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / perPage));
  const paginatedUsers = filteredUsers.slice(
    (page - 1) * perPage,
    page * perPage,
  );

  const transformedUsers = paginatedUsers.map((user) => ({
    id: user.id,
    name: user.fullName || user.username,
    email: user.email,
    phone: user.phoneNumber,
    avatar: avatarUser,
    role: getRoleLabel(user.role),
    roleColor: getRoleColor(user.role),
    joinDate: formatDate(user.createdAt),
    status: user.isActive ? "active" : "locked",
    _raw: user,
  }));

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.isActive).length;
  const lockedUsers = users.filter((u) => !u.isActive).length;

  const stats = [
    {
      id: 1,
      label: "Tổng người dùng",
      value: totalUsers.toString(),
      icon: <People sx={{ fontSize: 24 }} />,
      bgColor: "from-emerald-500 to-teal-600",
      lightBg: "bg-emerald-500/10",
      lightBorder: "border-emerald-500/20",
    },
    {
      id: 2,
      label: "Đang hoạt động",
      value: activeUsers.toString(),
      icon: <CheckCircle sx={{ fontSize: 24 }} />,
      bgColor: "from-green-500 to-green-600",
      lightBg: "bg-green-500/10",
      lightBorder: "border-green-500/20",
    },
    {
      id: 3,
      label: "Kết quả lọc",
      value: totalFiltered.toString(),
      icon: <HourglassEmpty sx={{ fontSize: 24 }} />,
      bgColor: "from-yellow-500 to-yellow-600",
      lightBg: "bg-yellow-500/10",
      lightBorder: "border-yellow-500/20",
    },
    {
      id: 4,
      label: "Đã khóa",
      value: lockedUsers.toString(),
      icon: <Lock sx={{ fontSize: 24 }} />,
      bgColor: "from-red-500 to-red-600",
      lightBg: "bg-red-500/10",
      lightBorder: "border-red-500/20",
    },
  ];

  const handleAddUser = () => {
    setEditUser(null);
    setFormOpen(true);
  };

  const handleEditUser = (rawUser) => {
    setEditUser(rawUser);
    setFormOpen(true);
  };

  const handleSaveUser = async (formData) => {
    setSaving(true);
    try {
      if (editUser) {
        const res = await updateUser(editUser.id, formData);
        if (res.success) {
          showToast("Cập nhật người dùng thành công");
          setFormOpen(false);
          fetchUsers();
        } else {
          showToast(res.error || "Lỗi cập nhật", "error");
        }
      } else {
        const res = await registerUser(formData);
        if (res.success) {
          showToast("Tạo người dùng thành công");
          setFormOpen(false);
          fetchUsers();
        } else {
          showToast(res.error || "Lỗi tạo người dùng", "error");
        }
      }
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleLock = (rawUser) => {
    const isLocking = rawUser.isActive;
    setConfirmAction({
      type: "toggle-lock",
      user: rawUser,
      title: isLocking ? "Khóa tài khoản?" : "Mở khóa tài khoản?",
      message: isLocking
        ? `Bạn có chắc muốn khóa tài khoản "${rawUser.fullName || rawUser.email}"?`
        : `Bạn có chắc muốn mở khóa tài khoản "${rawUser.fullName || rawUser.email}"?`,
    });
  };

  const handleChangeRole = (rawUser) => {
    setEditUser(rawUser);
    setFormOpen(true);
  };

  const handleDeleteUser = (rawUser) => {
    setConfirmAction({
      type: "delete",
      user: rawUser,
      title: "Xóa người dùng?",
      message: `Bạn có chắc muốn xóa người dùng "${rawUser.fullName || rawUser.email}"? Hành động này không thể hoàn tác.`,
    });
  };

  const handleCreateTeamLeader = async ({ email, username }) => {
    const result = await createTeamLeaderAccount({ email, username });
    if (result.success) {
      showToast(
        "Tài khoản trưởng nhóm đã được tạo và gửi email thông tin đăng nhập",
      );
      fetchUsers();
    }
    return result;
  };

  const executeConfirmAction = async () => {
    if (!confirmAction) return;
    setConfirming(true);
    try {
      if (confirmAction.type === "toggle-lock") {
        const res = await updateUser(confirmAction.user.id, {
          isActive: !confirmAction.user.isActive,
        });
        if (res.success) {
          showToast(
            confirmAction.user.isActive
              ? "Đã khóa tài khoản"
              : "Đã mở khóa tài khoản",
          );
          fetchUsers();
        } else {
          showToast(res.error || "Lỗi thao tác", "error");
        }
      } else if (confirmAction.type === "delete") {
        const res = await deleteUser(confirmAction.user.id);
        if (res.success) {
          showToast("Đã xóa người dùng");
          fetchUsers();
        } else {
          showToast(res.error || "Lỗi xóa", "error");
        }
      }
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setConfirming(false);
      setConfirmAction(null);
    }
  };

  const getRoleBadgeClasses = (color) => {
    const colorMap = {
      purple: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      blue: "bg-teal-500/10 text-teal-400 border-teal-500/20",
      orange: "bg-green-500/10 text-green-400 border-green-500/20",
      slate: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    };
    return colorMap[color] || colorMap.slate;
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      active: {
        label: "Đang hoạt động",
        classes: "bg-green-500/10 text-green-400 border-green-500/20",
      },
      locked: {
        label: "Đã khóa",
        classes: "bg-red-500/10 text-red-400 border-red-500/20",
        icon: true,
      },
    };
    return statusMap[status] || statusMap.active;
  };

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");
      for (
        let i = Math.max(2, page - 1);
        i <= Math.min(totalPages - 1, page + 1);
        i++
      )
        pages.push(i);
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  if (loading) {
    return (
      <div className="h-screen overflow-hidden flex bg-gray-50">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
            <p className="text-gray-600">Đang tải dữ liệu...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen overflow-hidden flex bg-gray-50">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <p className="text-gray-900 font-semibold mb-2">Lỗi tải dữ liệu</p>
            <p className="text-gray-600">{error}</p>
            <button
              onClick={fetchUsers}
              className="mt-4 px-6 py-2 bg-emerald-500 text-white rounded-xl text-sm font-semibold hover:bg-emerald-600 transition-colors"
            >
              Thử lại
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden flex bg-gray-50">
      <Sidebar />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500/50 z-10"></div>

        <header className="bg-white border-b border-gray-200 px-8 py-6 shrink-0 z-0">
          <div className="max-w-7xl mx-auto w-full">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                  <span>Admin</span>
                  <ChevronRight sx={{ fontSize: 12 }} />
                  <span className="text-gray-900">Người dùng</span>
                </div>
                <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
                  Quản lý người dùng
                </h1>
                <p className="text-gray-600 mt-2 text-sm max-w-2xl leading-relaxed">
                  Quản lý hồ sơ nhân sự, phân quyền truy cập và giám sát hoạt
                  động của các đội cứu trợ
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {stats.map((stat) => (
                <div
                  key={stat.id}
                  className="group relative bg-white border border-gray-200 rounded-xl p-5 hover:border-emerald-400 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-200/50 hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className={`p-3 rounded-lg ${stat.lightBg} border ${stat.lightBorder} group-hover:scale-110 transition-transform duration-300`}
                    >
                      <div className="text-gray-700">{stat.icon}</div>
                    </div>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900 mb-1">
                      {stat.value}
                    </p>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                  </div>
                  <div
                    className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-xl`}
                  ></div>
                </div>
              ))}
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:max-w-xl group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search
                    sx={{ fontSize: 20 }}
                    className="text-gray-500 group-focus-within:text-emerald-600 transition-all duration-300"
                  />
                </div>
                <input
                  className="block w-full pl-12 pr-20 py-3 border border-gray-300 rounded-xl leading-5 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent sm:text-sm transition-all shadow-sm hover:shadow-emerald-200/50 focus:shadow-emerald-300/50"
                  placeholder="Tìm kiếm theo tên, email, số điện thoại..."
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-2">
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                    >
                      <Close sx={{ fontSize: 16 }} className="text-gray-500" />
                    </button>
                  )}
                  <kbd className="hidden sm:inline-flex items-center border border-gray-300 rounded-md px-2 py-1 text-xs font-sans font-medium text-gray-600 bg-gray-50">
                    ⌘K
                  </kbd>
                </div>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 w-full md:w-auto items-center">
                <div className="relative group">
                  <select
                    className="appearance-none bg-white border border-gray-300 text-gray-900 text-sm rounded-xl pl-4 pr-10 py-3 cursor-pointer hover:border-emerald-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all shadow-sm"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                  >
                    <option value="all">Tất cả vai trò</option>
                    <option value="admin">Quản trị viên</option>
                    <option value="manager">Quản lý</option>
                    <option value="coordinator">Điều phối viên</option>
                    <option value="rescue">Đội cứu hộ</option>
                    <option value="citizen">Người dân</option>
                  </select>
                  <KeyboardArrowDown
                    sx={{ fontSize: 16 }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none group-hover:text-emerald-600 transition-colors"
                  />
                </div>

                <div className="relative group">
                  <select
                    className="appearance-none bg-white border border-gray-300 text-gray-900 text-sm rounded-xl pl-4 pr-10 py-3 cursor-pointer hover:border-emerald-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all shadow-sm"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="active">Đang hoạt động</option>
                    <option value="locked">Đã khóa</option>
                  </select>
                  <KeyboardArrowDown
                    sx={{ fontSize: 16 }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none group-hover:text-emerald-600 transition-colors"
                  />
                </div>

                <div className="flex gap-1 bg-white border border-gray-300 rounded-xl p-1 shadow-sm">
                  <button
                    onClick={() => setViewMode("table")}
                    className={`p-2 rounded-lg transition-all ${
                      viewMode === "table"
                        ? "bg-emerald-500 text-white shadow-lg"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                    title="Xem dạng bảng"
                  >
                    <TableChart sx={{ fontSize: 20 }} />
                  </button>
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-lg transition-all ${
                      viewMode === "grid"
                        ? "bg-emerald-500 text-white shadow-lg"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                    title="Xem dạng lưới"
                  >
                    <Apps sx={{ fontSize: 20 }} />
                  </button>
                </div>

                <button
                  className="flex items-center justify-center gap-2 px-4 h-[48px] rounded-xl border border-gray-300 bg-white text-gray-600 hover:text-gray-900 hover:border-emerald-400 hover:bg-gray-50 transition-all shadow-sm hover:shadow-emerald-200/50"
                  title="Xuất dữ liệu"
                >
                  <Download sx={{ fontSize: 20 }} />
                  <span className="hidden lg:inline text-sm font-medium">
                    Xuất
                  </span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto bg-gray-50 px-8 py-6">
          <div className="max-w-7xl mx-auto">
            {viewMode === "table" ? (
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                      <th className="py-5 px-6 text-xs font-bold uppercase tracking-wider text-gray-700">
                        <div className="flex items-center gap-2">
                          <People
                            sx={{ fontSize: 16 }}
                            className="text-emerald-600"
                          />
                          Hồ sơ người dùng
                        </div>
                      </th>
                      <th className="py-5 px-6 text-xs font-bold uppercase tracking-wider text-gray-700">
                        <div className="flex items-center gap-2">
                          <CheckCircle
                            sx={{ fontSize: 16 }}
                            className="text-emerald-600"
                          />
                          Vai trò
                        </div>
                      </th>
                      <th className="py-5 px-6 text-xs font-bold uppercase tracking-wider text-gray-700">
                        <div className="flex items-center gap-2">
                          <CalendarMonth
                            sx={{ fontSize: 16 }}
                            className="text-emerald-600"
                          />
                          Ngày tham gia
                        </div>
                      </th>
                      <th className="py-5 px-6 text-xs font-bold uppercase tracking-wider text-gray-700">
                        <div className="flex items-center gap-2">
                          <CheckCircle
                            sx={{ fontSize: 16 }}
                            className="text-emerald-600"
                          />
                          Trạng thái
                        </div>
                      </th>
                      <th className="py-5 px-6 text-xs font-bold uppercase tracking-wider text-gray-700 text-right">
                        Hành động
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginatedUsers.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="py-16 text-center text-gray-500"
                        >
                          <p className="text-lg font-semibold">
                            Không tìm thấy người dùng nào
                          </p>
                          <p className="text-sm mt-1">
                            Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                          </p>
                        </td>
                      </tr>
                    ) : (
                      transformedUsers.map((user) => {
                        const statusBadge = getStatusBadge(user.status);
                        return (
                          <tr
                            key={user.id}
                            className="group hover:bg-gradient-to-r hover:from-emerald-50 hover:to-transparent transition-all duration-200 cursor-pointer border-l-4 border-transparent hover:border-l-emerald-500"
                            onClick={() => setDetailUser(user._raw)}
                          >
                            <td className="py-5 px-6">
                              <div className="flex items-center gap-4">
                                <div
                                  className="bg-center bg-no-repeat bg-cover rounded-full w-12 h-12 shadow-md ring-2 ring-gray-200 group-hover:ring-emerald-400 transition-all"
                                  style={{
                                    backgroundImage: `url("${user.avatar}")`,
                                  }}
                                ></div>
                                <div className="flex flex-col">
                                  <span className="text-sm font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
                                    {user.name}
                                  </span>
                                  <span className="text-xs text-gray-600 group-hover:text-gray-700 transition-colors">
                                    {user.email || user.phone}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="py-5 px-6">
                              <span
                                className={`inline-flex w-fit items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeClasses(user.roleColor)}`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${user.roleColor === "purple" ? "bg-emerald-500" : user.roleColor === "blue" ? "bg-teal-500" : user.roleColor === "orange" ? "bg-green-500" : "bg-gray-500"}`}
                                ></span>
                                {user.role}
                              </span>
                            </td>
                            <td className="py-5 px-6">
                              <div className="flex items-center gap-2">
                                <svg
                                  className="w-4 h-4 text-gray-500"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" />
                                </svg>
                                <span className="text-sm text-gray-700 font-medium">
                                  {user.joinDate}
                                </span>
                              </div>
                            </td>
                            <td className="py-5 px-6">
                              <span
                                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${statusBadge.classes} shadow-lg`}
                              >
                                {statusBadge.icon && (
                                  <svg
                                    className="w-4 h-4"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                                  </svg>
                                )}
                                {statusBadge.label}
                              </span>
                            </td>
                            <td className="py-5 px-6 text-right">
                              <div
                                className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  onClick={() => setDetailUser(user._raw)}
                                  className="p-2.5 text-gray-500 hover:text-blue-600 hover:bg-blue-100 rounded-xl transition-all hover:scale-110 hover:shadow-lg"
                                  title="Xem chi tiết"
                                >
                                  <Visibility sx={{ fontSize: 20 }} />
                                </button>
                                <button
                                  onClick={() => handleEditUser(user._raw)}
                                  className="p-2.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-100 rounded-xl transition-all hover:scale-110 hover:shadow-lg"
                                  title="Chỉnh sửa"
                                >
                                  <Edit sx={{ fontSize: 20 }} />
                                </button>
                                {user.status === "locked" ? (
                                  <button
                                    onClick={() => handleToggleLock(user._raw)}
                                    className="p-2.5 text-gray-500 hover:text-green-600 hover:bg-green-100 rounded-xl transition-all hover:scale-110 hover:shadow-lg"
                                    title="Mở khóa tài khoản"
                                  >
                                    <LockOpen sx={{ fontSize: 20 }} />
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleToggleLock(user._raw)}
                                    className="p-2.5 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-xl transition-all hover:scale-110 hover:shadow-lg"
                                    title="Khóa tài khoản"
                                  >
                                    <Lock sx={{ fontSize: 20 }} />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteUser(user._raw)}
                                  className="p-2.5 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-xl transition-all hover:scale-110 hover:shadow-lg"
                                  title="Xóa người dùng"
                                >
                                  <Delete sx={{ fontSize: 20 }} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>

                <div className="px-8 py-5 border-t-2 border-gray-200 bg-gradient-to-r from-gray-50 to-white flex flex-col md:flex-row gap-4 md:gap-0 items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-sm text-gray-700">
                      Hiển thị{" "}
                      <span className="font-bold text-gray-900 px-2 py-1 bg-emerald-100 rounded-md">
                        {totalFiltered === 0 ? 0 : (page - 1) * perPage + 1}-
                        {Math.min(page * perPage, totalFiltered)}
                      </span>{" "}
                      trong tổng số{" "}
                      <span className="font-bold text-gray-900 px-2 py-1 bg-emerald-100 rounded-md">
                        {totalFiltered}
                      </span>{" "}
                      người dùng
                    </div>
                    <select
                      className="ml-2 bg-white border border-gray-300 text-gray-900 text-xs rounded-lg px-2 py-1 cursor-pointer hover:border-emerald-400 focus:outline-none focus:border-emerald-500 transition-all"
                      value={perPage}
                      onChange={(e) => {
                        setPerPage(Number(e.target.value));
                        setPage(1);
                      }}
                    >
                      {ITEMS_PER_PAGE_OPTIONS.map((n) => (
                        <option key={n} value={n}>
                          {n} / trang
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-gray-300 hover:border-emerald-400"
                    >
                      <div className="flex items-center gap-1.5">
                        <ChevronRight
                          sx={{ fontSize: 16 }}
                          className="rotate-180"
                        />
                        Trước
                      </div>
                    </button>
                    {getPageNumbers().map((p, idx) =>
                      p === "..." ? (
                        <span
                          key={`ellipsis-${idx}`}
                          className="px-3 py-2 text-gray-500 font-bold"
                        >
                          ...
                        </span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                            p === page
                              ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold shadow-lg shadow-emerald-300/50 border-transparent scale-105"
                              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 border-gray-300 hover:border-emerald-400"
                          }`}
                        >
                          {p}
                        </button>
                      ),
                    )}
                    <button
                      disabled={page >= totalPages}
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-gray-300 hover:border-emerald-400"
                    >
                      <div className="flex items-center gap-1.5">
                        Sau
                        <ChevronRight sx={{ fontSize: 16 }} />
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {paginatedUsers.length === 0 ? (
                  <div className="col-span-full py-16 text-center text-gray-500">
                    <p className="text-lg font-semibold">
                      Không tìm thấy người dùng nào
                    </p>
                    <p className="text-sm mt-1">
                      Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                    </p>
                  </div>
                ) : (
                  transformedUsers.map((user) => {
                    const statusBadge = getStatusBadge(user.status);
                    return (
                      <div
                        key={user.id}
                        className="group bg-white border border-gray-200 rounded-2xl p-5 hover:border-emerald-400 hover:shadow-lg transition-all duration-300 cursor-pointer"
                        onClick={() => setDetailUser(user._raw)}
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <div
                            className="bg-center bg-no-repeat bg-cover rounded-full w-12 h-12 shadow-md ring-2 ring-gray-200 group-hover:ring-emerald-400 transition-all"
                            style={{
                              backgroundImage: `url("${user.avatar}")`,
                            }}
                          ></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate group-hover:text-emerald-600 transition-colors">
                              {user.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mb-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getRoleBadgeClasses(user.roleColor)}`}
                          >
                            {user.role}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusBadge.classes}`}
                          >
                            {statusBadge.label}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          Tham gia: {user.joinDate}
                        </p>
                        <div
                          className="flex gap-1 mt-3 pt-3 border-t border-gray-100"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => handleEditUser(user._raw)}
                            className="flex-1 py-1.5 text-xs font-semibold text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleToggleLock(user._raw)}
                            className="flex-1 py-1.5 text-xs font-semibold text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          >
                            {user.status === "locked" ? "Mở khóa" : "Khóa"}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user._raw)}
                            className="flex-1 py-1.5 text-xs font-semibold text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
                {totalPages > 1 && (
                  <div className="col-span-full flex justify-center gap-1.5 pt-4">
                    <button
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-gray-300"
                    >
                      Trước
                    </button>
                    <span className="px-4 py-2 text-sm font-semibold text-gray-700">
                      {page} / {totalPages}
                    </span>
                    <button
                      disabled={page >= totalPages}
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-gray-300"
                    >
                      Sau
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <button
        onClick={handleAddUser}
        className="fixed bottom-6 right-6 z-40 p-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-teal-600 hover:to-emerald-500 text-white rounded-2xl shadow-2xl shadow-emerald-300/50 hover:shadow-emerald-400/60 transition-all duration-300 hover:scale-110 group"
      >
        <Add
          sx={{ fontSize: 24 }}
          className="group-hover:rotate-90 transition-transform duration-300"
        />
      </button>

      <UserFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSaveUser}
        initial={editUser}
        saving={saving}
      />

      <CreateTeamLeaderModal
        open={teamLeaderOpen}
        onClose={() => setTeamLeaderOpen(false)}
        onSuccess={handleCreateTeamLeader}
      />

      <UserDetailModal
        open={!!detailUser}
        onClose={() => setDetailUser(null)}
        user={detailUser}
      />

      <ConfirmModal
        open={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={executeConfirmAction}
        title={confirmAction?.title}
        message={confirmAction?.message}
        loading={confirming}
      />

      {toast && (
        <div
          className={`fixed top-6 right-6 z-[60] px-6 py-3 rounded-xl shadow-2xl text-sm font-semibold text-white transition-all animate-slide-in ${
            toast.type === "error" ? "bg-red-500" : "bg-emerald-500"
          }`}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}
