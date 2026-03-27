import React, { useCallback, useEffect, useMemo, useState } from "react";
import Sidebar from "../../components/manager/Sidebar";
import Modal from "../../components/manager/Modal";
import { Visibility as VisibilityIcon } from "@mui/icons-material";
import {
  getVolunteerRegistrations,
  reviewVolunteerRegistration,
} from "../../services/volunteerRegistrationService";

const formatDate = (d) => {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return String(d);
  }
};

const STATUS_CONFIG = {
  pending: {
    label: "Chờ duyệt",
    color: "bg-amber-100 text-amber-700 ring-1 ring-amber-600/30",
    dot: "bg-amber-500",
  },
  approved: {
    label: "Đã duyệt",
    color: "bg-blue-100 text-blue-700 ring-1 ring-blue-600/30",
    dot: "bg-blue-500",
  },
  active: {
    label: "Đang hoạt động",
    color: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-600/30",
    dot: "bg-emerald-500",
  },
  completed: {
    label: "Hoàn thành",
    color: "bg-violet-100 text-violet-700 ring-1 ring-violet-600/30",
    dot: "bg-violet-500",
  },
  rejected: {
    label: "Từ chối",
    color: "bg-red-100 text-red-700 ring-1 ring-red-600/30",
    dot: "bg-red-500",
  },
  cancelled: {
    label: "Đã hủy",
    color: "bg-slate-100 text-slate-600 ring-1 ring-slate-400/30",
    dot: "bg-slate-400",
  },
};

const REVIEW_OPTIONS = [
  { value: "approved", label: "Đồng ý", color: "bg-blue-600 hover:bg-blue-700" },
  { value: "rejected", label: "Từ chối", color: "bg-red-600 hover:bg-red-700" },
  { value: "cancelled", label: "Hủy đơn", color: "bg-slate-500 hover:bg-slate-600" },
];

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || {
    label: status || "?",
    color: "bg-slate-100 text-slate-600",
    dot: "bg-slate-400",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ring-inset ${cfg.color}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.totalPages <= 1) return null;
  const { page, totalPages, total } = pagination;
  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
      <p className="text-sm text-slate-500">
        Tổng <span className="font-semibold text-slate-800">{total}</span> bản ghi
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm font-medium"
        >
          Trước
        </button>
        <span className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-xl">
          {page} / {totalPages}
        </span>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm font-medium"
        >
          Sau
        </button>
      </div>
    </div>
  );
}

function ReviewModal({ registration, initialStatus = "approved", onClose, onReviewed }) {
  const [selectedStatus, setSelectedStatus] = useState(initialStatus);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setSelectedStatus(initialStatus);
    setNote("");
    setError("");
  }, [registration.id, initialStatus]);

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    const res = await reviewVolunteerRegistration({
      id: registration.id,
      status: selectedStatus,
      coordinator_note: note,
    });
    setLoading(false);
    if (res.success) {
      onReviewed(res.data);
      onClose();
    } else {
      setError(res.error || "Cập nhật thất bại");
    }
  };

  return (
    <Modal open onClose={onClose} title="Duyệt đơn đăng ký tình nguyện" maxWidth="max-w-md">
      <div className="space-y-5">
        <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Người đăng ký</span>
            <span className="font-semibold text-slate-900">
              {registration.citizen?.username || "—"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Email</span>
            <span className="text-slate-700">{registration.citizen?.email || "—"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Quận/Huyện</span>
            <span className="text-slate-700">{registration.district || "—"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Loại hỗ trợ</span>
            <span className="text-slate-700">{registration.support_type || "—"}</span>
          </div>
          {registration.note && (
            <div>
              <span className="text-slate-500">Ghi chú</span>
              <p className="mt-1 text-slate-700 italic">"{registration.note}"</p>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Ngày đăng ký</span>
            <span className="text-slate-700">{formatDate(registration.created_at)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Trạng thái hiện tại</span>
            <StatusBadge status={registration.status} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Hành động <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {REVIEW_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSelectedStatus(opt.value)}
                className={`flex items-center justify-center px-3 py-2.5 rounded-xl font-semibold text-sm transition-all border-2 ${
                  selectedStatus === opt.value
                    ? `${opt.color} text-white border-transparent shadow-sm`
                    : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Ghi chú (tùy chọn)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="VD: Tài khoản chưa xác minh email, cần bổ sung thông tin..."
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm font-semibold text-red-600">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm shadow-sm transition-colors disabled:opacity-50"
          >
            {loading ? "Đang xử lý..." : "Xác nhận"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default function ManagerVolunteerRegistrations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [registrations, setRegistrations] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);

  const [filterStatus, setFilterStatus] = useState("");
  const [filterDistrict, setFilterDistrict] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [reviewTarget, setReviewTarget] = useState(null);
  const [reviewInitialStatus, setReviewInitialStatus] = useState("approved");

  const openReviewModal = (row, status) => {
    setReviewInitialStatus(status);
    setReviewTarget(row);
  };

  const limit = 20;

  const load = useCallback(
    async (p = 1) => {
      setLoading(true);
      setError("");
      try {
        const res = await getVolunteerRegistrations({
          page: p,
          limit,
          status: filterStatus || undefined,
          district: filterDistrict || undefined,
        });
        if (res.success) {
          setRegistrations(res.data || []);
          setPagination(res.pagination || null);
          setPage(p);
        } else {
          setError(res.error || "Không thể tải danh sách.");
          setRegistrations([]);
          setPagination(null);
        }
      } catch (e) {
        setError(e?.message || "Không thể tải danh sách.");
        setRegistrations([]);
      } finally {
        setLoading(false);
      }
    },
    [filterStatus, filterDistrict, limit],
  );

  useEffect(() => {
    load(1);
  }, [load]);

  const stats = useMemo(() => {
    const all = registrations;
    const total = pagination?.total ?? 0;
    const pending = all.filter((r) => r.status === "pending").length;
    const approved = all.filter((r) => r.status === "approved").length;
    const rejected = all.filter((r) => r.status === "rejected" || r.status === "cancelled").length;
    return { total, pending, approved, rejected };
  }, [registrations, pagination]);

  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) return registrations;
    const q = searchTerm.trim().toLowerCase();
    return registrations.filter(
      (r) =>
        (r.citizen?.username || "").toLowerCase().includes(q) ||
        (r.citizen?.email || "").toLowerCase().includes(q) ||
        (r.district || "").toLowerCase().includes(q) ||
        (r.support_type || "").toLowerCase().includes(q),
    );
  }, [registrations, searchTerm]);

  const handlePageChange = (p) => load(p);

  const handleFilterChange = () => {
    setPage(1);
    load(1);
  };

  const handleReviewed = (updatedRow) => {
    setRegistrations((prev) =>
      prev.map((r) => (r.id === updatedRow.id ? updatedRow : r)),
    );
  };

  const statCards = [
    {
      label: "Tổng đơn",
      value: stats.total,
      color: "from-blue-500 to-indigo-600",
      textColor: "text-blue-700",
      bgColor: "bg-blue-50",
    },
    {
      label: "Chờ duyệt",
      value: stats.pending,
      color: "from-amber-400 to-orange-500",
      textColor: "text-amber-700",
      bgColor: "bg-amber-50",
    },
    {
      label: "Đã duyệt",
      value: stats.approved,
      color: "from-emerald-400 to-teal-500",
      textColor: "text-emerald-700",
      bgColor: "bg-emerald-50",
    },
    {
      label: "Từ chối / Hủy",
      value: stats.rejected,
      color: "from-red-400 to-rose-500",
      textColor: "text-red-700",
      bgColor: "bg-red-50",
    },
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-8 max-w-[1600px] mx-auto">
          {/* Header */}
          <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
                Đăng ký tình nguyện
              </h1>
              <p className="text-slate-600 text-base">
                Xem và duyệt đơn đăng ký tình nguyện viên từ người dân.
              </p>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {statCards.map((s) => (
              <div
                key={s.label}
                className={`${s.bgColor} rounded-2xl p-4 border border-slate-200/60`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-semibold uppercase tracking-wide ${s.textColor}`}>
                    {s.label}
                  </span>
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center shadow-sm`}>
                    <span className="text-white text-sm font-bold">{s.value}</span>
                  </div>
                </div>
                <p className={`text-2xl font-bold ${s.textColor}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-wrap gap-3">
              {/* Search */}
              <div className="flex-1 min-w-[220px]">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm theo tên, email, quận, loại hỗ trợ..."
                  className="w-full h-10 px-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              {/* Status filter */}
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  handleFilterChange();
                }}
                className="h-10 px-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
              >
                <option value="">Tất cả trạng thái</option>
                {Object.entries(STATUS_CONFIG).map(([v, cfg]) => (
                  <option key={v} value={v}>{cfg.label}</option>
                ))}
              </select>

              {/* District filter */}
              <input
                type="text"
                value={filterDistrict}
                onChange={(e) => setFilterDistrict(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleFilterChange()}
                placeholder="Quận/Huyện"
                className="h-10 px-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />

              <button
                type="button"
                onClick={handleFilterChange}
                className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-colors"
              >
                Lọc
              </button>
              <button
                type="button"
                onClick={() => {
                  setFilterStatus("");
                  setFilterDistrict("");
                  setSearchTerm("");
                  load(1);
                }}
                className="h-10 px-4 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-semibold text-sm transition-colors"
              >
                Đặt lại
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
                  Đang tải...
                </div>
              ) : error ? (
                <div className="px-6 py-4">
                  <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm font-semibold text-red-600">
                    {error}
                  </div>
                </div>
              ) : filteredRows.length === 0 ? (
                <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
                  Không có đơn đăng ký nào.
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left font-bold text-slate-600">#</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-600">Người đăng ký</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-600">Quận/Huyện</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-600">Loại hỗ trợ</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-600">Ghi chú</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-600">Ngày đăng ký</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-600">Trạng thái</th>
                      <th className="px-4 py-3 text-right font-bold text-slate-600">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRows.map((r, idx) => (
                      <tr key={r.id} className="hover:bg-slate-50/70">
                        <td className="px-4 py-3 text-slate-500">
                          {(page - 1) * limit + idx + 1}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900">
                            {r.citizen?.username || "—"}
                          </div>
                          <div className="text-xs text-slate-500">
                            {r.citizen?.email || "—"}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-700">{r.district || "—"}</td>
                        <td className="px-4 py-3 text-slate-700">{r.support_type || "—"}</td>
                        <td className="px-4 py-3 text-slate-600 max-w-[200px] truncate">
                          {r.note || <span className="text-slate-300 italic">Không có</span>}
                        </td>
                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                          {formatDate(r.created_at)}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={r.status} />
                        </td>
                        <td className="px-4 py-3 text-right">
                          {r.status === "pending" ? (
                            <button
                              type="button"
                              onClick={() => openReviewModal(r, "approved")}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/25 transition-all active:scale-[0.98]"
                            >
                              Duyệt
                            </button>
                          ) : r.coordinator_note ? (
                            <button
                              type="button"
                              onClick={() => openReviewModal(r, "approved")}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                            >
                              <VisibilityIcon sx={{ fontSize: 16 }} />
                              Chi tiết
                            </button>
                          ) : (
                            <span className="text-slate-300 italic text-xs">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <Pagination pagination={pagination} onPageChange={handlePageChange} />
          </div>
        </div>
      </div>

      {reviewTarget && (
        <ReviewModal
          registration={reviewTarget}
          initialStatus={reviewInitialStatus}
          onClose={() => setReviewTarget(null)}
          onReviewed={handleReviewed}
        />
      )}
    </div>
  );
}
