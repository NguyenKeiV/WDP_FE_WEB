import { useState, useEffect, useCallback } from "react";
import { requestsApi } from "../api/requests";
import { useAuth } from "../context/AuthContext";
import RejectModal from "../components/RejectModal";
import AssignTeamModal from "../components/AssignTeamModal";

const STATUS_CONFIG = {
  new: { label: "Mới tạo", color: "bg-blue-100 text-blue-700", icon: "🆕" },
  pending_verification: {
    label: "Chờ phân công",
    color: "bg-yellow-100 text-yellow-700",
    icon: "⏳",
  },
  verified: {
    label: "Đã xác minh",
    color: "bg-purple-100 text-purple-700",
    icon: "✅",
  },
  on_mission: {
    label: "Đang cứu hộ",
    color: "bg-red-100 text-red-700",
    icon: "🚨",
  },
  completed: {
    label: "Hoàn thành",
    color: "bg-green-100 text-green-700",
    icon: "✔️",
  },
  rejected: {
    label: "Từ chối",
    color: "bg-gray-100 text-gray-500",
    icon: "❌",
  },
};

const CATEGORY_LABEL = {
  rescue: "🆘 Cứu hộ người",
  supplies: "📦 Nhu yếu phẩm",
  vehicle_rescue: "🚗 Cứu hộ xe",
  other: "❓ Khác",
};

const PRIORITY_CONFIG = {
  urgent: { label: "🔴 Khẩn cấp", color: "text-red-600 font-bold" },
  high: { label: "🟠 Cao", color: "text-orange-500 font-semibold" },
  medium: { label: "🟡 Trung bình", color: "text-yellow-600" },
  low: { label: "🟢 Thấp", color: "text-green-600" },
};

export default function RequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [assignModal, setAssignModal] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;
      const res = await requestsApi.getAll(params);
      setRequests(res.data || []);
      setPagination(res.pagination);
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, categoryFilter]);

  const fetchStats = async () => {
    try {
      const res = await requestsApi.getStats();
      setStats(res.data);
    } catch {}
  };

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);
  useEffect(() => {
    fetchStats();
  }, []);

  const handleApprove = async (id) => {
    setActionLoading(id + "_approve");
    try {
      await requestsApi.approve(id);
      showToast("Đã duyệt yêu cầu thành công");
      fetchRequests();
      fetchStats();
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id, reason) => {
    try {
      await requestsApi.reject(id, reason);
      showToast("Đã từ chối yêu cầu");
      fetchRequests();
      fetchStats();
    } catch (e) {
      showToast(e.message, "error");
      throw e;
    }
  };

  const handleAssignTeam = async (id, team_id) => {
    try {
      await requestsApi.assignTeam(id, team_id);
      showToast("Đã phân công đội cứu hộ thành công");
      fetchRequests();
      fetchStats();
    } catch (e) {
      showToast(e.message, "error");
      throw e;
    }
  };

  const handleComplete = async (id) => {
    setActionLoading(id + "_complete");
    try {
      await requestsApi.complete(id);
      showToast("Đã hoàn thành nhiệm vụ");
      fetchRequests();
      fetchStats();
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
          className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-white font-semibold text-sm transition ${
            toast.type === "error" ? "bg-red-600" : "bg-green-600"
          }`}
        >
          {toast.type === "error" ? "❌" : "✅"} {toast.message}
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            <p className="text-xs text-gray-500 mt-1">Tổng</p>
          </div>
          {(stats.by_status || []).map((s) => {
            const cfg = STATUS_CONFIG[s.status];
            if (!cfg) return null;
            return (
              <div
                key={s.status}
                className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100"
              >
                <p className="text-2xl font-bold text-gray-800">{s.count}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {cfg.icon} {cfg.label}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4 flex gap-4 items-center">
        <span className="text-sm font-semibold text-gray-600">Lọc:</span>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
        >
          <option value="">Tất cả trạng thái</option>
          {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
            <option key={val} value={val}>
              {cfg.icon} {cfg.label}
            </option>
          ))}
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setPage(1);
          }}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
        >
          <option value="">Tất cả loại</option>
          {Object.entries(CATEGORY_LABEL).map(([val, label]) => (
            <option key={val} value={val}>
              {label}
            </option>
          ))}
        </select>
        <button
          onClick={() => {
            setStatusFilter("");
            setCategoryFilter("");
            setPage(1);
          }}
          className="text-sm text-gray-400 hover:text-gray-600 underline"
        >
          Xóa bộ lọc
        </button>
        <button
          onClick={fetchRequests}
          className="ml-auto text-sm bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg font-semibold transition"
        >
          🔄 Làm mới
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-gray-400">Đang tải...</div>
        ) : requests.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-2">📭</div>
            <p className="text-gray-500">Không có yêu cầu nào</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">
                  Loại
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">
                  Mô tả
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">
                  Địa điểm
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">
                  Liên hệ
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">
                  Ưu tiên
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">
                  Đội cứu hộ
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">
                  Trạng thái
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">
                  Thời gian
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {requests.map((req) => {
                const status = STATUS_CONFIG[req.status];
                const priority = PRIORITY_CONFIG[req.priority];
                return (
                  <tr key={req.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <span className="text-xs">
                        {CATEGORY_LABEL[req.category] || req.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <p className="truncate text-gray-700">
                        {req.description}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        👥 {req.num_people} người
                      </p>
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      📍 {req.province_city}
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      📞 {req.phone_number}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {priority && (
                        <span className={priority.color}>{priority.label}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {req.assigned_team ? (
                        <div>
                          <p className="text-xs font-semibold text-gray-700">
                            🚒 {req.assigned_team.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {req.assigned_team.leader_name}
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full ${status?.color}`}
                      >
                        {status?.icon} {status?.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                      {new Date(req.created_at).toLocaleString("vi-VN")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 flex-wrap">
                        {req.status === "new" && (
                          <>
                            <button
                              onClick={() => handleApprove(req.id)}
                              disabled={actionLoading === req.id + "_approve"}
                              className="text-xs bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg font-semibold transition"
                            >
                              {actionLoading === req.id + "_approve"
                                ? "..."
                                : "✅ Duyệt"}
                            </button>
                            <button
                              onClick={() => setRejectModal(req)}
                              className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-lg font-semibold transition"
                            >
                              ❌ Từ chối
                            </button>
                          </>
                        )}
                        {req.status === "pending_verification" && (
                          <button
                            onClick={() => setAssignModal(req)}
                            className="text-xs bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg font-semibold transition"
                          >
                            🚒 Phân công
                          </button>
                        )}
                        {req.status === "on_mission" && (
                          <button
                            onClick={() => handleComplete(req.id)}
                            disabled={actionLoading === req.id + "_complete"}
                            className="text-xs bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg font-semibold transition"
                          >
                            {actionLoading === req.id + "_complete"
                              ? "..."
                              : "✔️ Hoàn thành"}
                          </button>
                        )}
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
              {pagination.total} yêu cầu
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

      {rejectModal && (
        <RejectModal
          request={rejectModal}
          onConfirm={handleReject}
          onClose={() => setRejectModal(null)}
        />
      )}
      {assignModal && (
        <AssignTeamModal
          request={assignModal}
          onConfirm={handleAssignTeam}
          onClose={() => setAssignModal(null)}
        />
      )}
    </div>
  );
}
