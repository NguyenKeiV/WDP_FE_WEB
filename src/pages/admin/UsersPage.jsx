import { useState, useEffect, useCallback } from "react";
import { usersApi } from "../../api/users";

const ROLE_CONFIG = {
  user: { label: "Người dùng", color: "bg-gray-100 text-gray-600" },
  coordinator: { label: "Điều phối viên", color: "bg-blue-100 text-blue-700" },
  admin: { label: "Quản trị viên", color: "bg-red-100 text-red-700" },
};

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await usersApi.getAll({ page, limit: 10 });
      setUsers(res.data || []);
      setPagination(res.pagination);
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleUpdateRole = async (id, role) => {
    setActionLoading(id);
    try {
      await usersApi.update(id, { role });
      showToast("Đã cập nhật role thành công");
      fetchUsers();
      setEditModal(null);
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id) => {
    setActionLoading(id);
    try {
      await usersApi.delete(id);
      showToast("Đã xóa người dùng");
      fetchUsers();
      setDeleteModal(null);
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="p-8">
      {/* Toast */}
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
          👥 Quản lý người dùng
        </h2>
        <button
          onClick={fetchUsers}
          className="text-sm bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg font-semibold transition"
        >
          🔄 Làm mới
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-gray-400">Đang tải...</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">
                  Tên
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">
                  Email
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">
                  Role
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">
                  Ngày tạo
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => {
                const role = ROLE_CONFIG[user.role];
                return (
                  <tr key={user.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-sm">
                          {user.username?.[0]?.toUpperCase()}
                        </div>
                        <span className="font-semibold text-gray-800">
                          {user.username}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{user.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full ${role?.color}`}
                      >
                        {role?.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {new Date(user.created_at).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditModal(user)}
                          className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1.5 rounded-lg font-semibold transition"
                        >
                          ✏️ Đổi role
                        </button>
                        <button
                          onClick={() => setDeleteModal(user)}
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

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-between items-center px-4 py-3 border-t border-gray-200">
            <span className="text-sm text-gray-500">
              Trang {pagination.page}/{pagination.totalPages} · Tổng{" "}
              {pagination.total} người dùng
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

      {/* Edit Role Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-1">Đổi role</h2>
            <p className="text-sm text-gray-500 mb-4">
              {editModal.username} — {editModal.email}
            </p>
            <div className="space-y-2 mb-4">
              {Object.entries(ROLE_CONFIG).map(([val, cfg]) => (
                <button
                  key={val}
                  onClick={() => handleUpdateRole(editModal.id, val)}
                  disabled={
                    actionLoading === editModal.id || editModal.role === val
                  }
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition font-semibold text-sm ${
                    editModal.role === val
                      ? "border-red-500 bg-red-50 text-red-600"
                      : "border-gray-200 hover:border-gray-300 text-gray-700"
                  }`}
                >
                  <span>{cfg.label}</span>
                  {editModal.role === val && <span>✓ Hiện tại</span>}
                </button>
              ))}
            </div>
            <button
              onClick={() => setEditModal(null)}
              className="w-full border border-gray-300 text-gray-600 font-semibold py-2 rounded-lg hover:bg-gray-50 transition"
            >
              Đóng
            </button>
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
              Bạn có chắc muốn xóa người dùng{" "}
              <span className="font-semibold text-gray-800">
                {deleteModal.username}
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
                disabled={actionLoading === deleteModal.id}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-2 rounded-lg transition"
              >
                {actionLoading === deleteModal.id ? "Đang xóa..." : "Xóa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
