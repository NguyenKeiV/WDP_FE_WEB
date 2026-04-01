import React, { useCallback, useEffect, useMemo, useState } from "react";
import Sidebar from "../../components/manager/Sidebar";
import Modal from "../../components/manager/Modal";
import {
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  People as PeopleIcon,
  Event as EventIcon,
  LocationOn as LocationIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import {
  getVolunteerCampaigns,
  createVolunteerCampaign,
  updateVolunteerCampaign,
  publishVolunteerCampaign,
  startVolunteerCampaign,
  completeVolunteerCampaign,
  cancelVolunteerCampaign,
  getApprovedVolunteers,
  inviteVolunteers,
  getVolunteerCampaignStats,
  getVolunteerCampaignById,
} from "../../services/volunteerCampaignService";

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
  draft: {
    label: "Nháp",
    color: "bg-slate-100 text-slate-600 ring-1 ring-slate-400/30",
    dot: "bg-slate-400",
  },
  published: {
    label: "Đã công bố",
    color: "bg-blue-100 text-blue-700 ring-1 ring-blue-600/30",
    dot: "bg-blue-500",
  },
  ongoing: {
    label: "Đang diễn ra",
    color: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-600/30",
    dot: "bg-emerald-500",
  },
  completed: {
    label: "Hoàn thành",
    color: "bg-violet-100 text-violet-700 ring-1 ring-violet-600/30",
    dot: "bg-violet-500",
  },
  cancelled: {
    label: "Đã hủy",
    color: "bg-red-100 text-red-700 ring-1 ring-red-600/30",
    dot: "bg-red-500",
  },
};

const INVITATION_STATUS_CONFIG = {
  pending: {
    label: "Chờ phản hồi",
    color: "bg-amber-100 text-amber-700 ring-1 ring-amber-600/30",
    dot: "bg-amber-500",
  },
  accepted: {
    label: "Đồng ý",
    color: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-600/30",
    dot: "bg-emerald-500",
  },
  declined: {
    label: "Từ chối",
    color: "bg-red-100 text-red-700 ring-1 ring-red-600/30",
    dot: "bg-red-500",
  },
};

function StatusBadge({ status, config = STATUS_CONFIG }) {
  const cfg = config[status] || {
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

// ─── Create / Edit Campaign Modal ─────────────────────────────────────────

function CampaignFormModal({ campaign, onClose, onSaved }) {
  const isEdit = Boolean(campaign);
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    district: "",
    scheduled_at: "",
    end_at: "",
    max_volunteers: "",
    status: "draft",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (campaign) {
      setForm({
        title: campaign.title || "",
        description: campaign.description || "",
        location: campaign.location || "",
        district: campaign.district || "",
        scheduled_at: campaign.scheduled_at ? new Date(campaign.scheduled_at).toISOString().slice(0, 16) : "",
        end_at: campaign.end_at ? new Date(campaign.end_at).toISOString().slice(0, 16) : "",
        max_volunteers: campaign.max_volunteers || "",
        status: campaign.status || "draft",
      });
    }
  }, [campaign]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (targetStatus) => {
    if (!form.title.trim()) { setError("Tiêu đề là bắt buộc"); return; }
    if (!form.location.trim()) { setError("Địa điểm là bắt buộc"); return; }
    if (!form.district.trim()) { setError("Quận/Huyện là bắt buộc"); return; }
    if (!form.scheduled_at) { setError("Ngày giờ bắt đầu là bắt buộc"); return; }
    setLoading(true);
    setError("");

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      location: form.location.trim(),
      district: form.district.trim(),
      scheduled_at: new Date(form.scheduled_at).toISOString(),
      end_at: form.end_at ? new Date(form.end_at).toISOString() : null,
      max_volunteers: form.max_volunteers ? parseInt(form.max_volunteers, 10) : null,
      status: targetStatus,
    };

    let res;
    if (isEdit) {
      res = await updateVolunteerCampaign(campaign.id, payload);
    } else {
      res = await createVolunteerCampaign(payload);
    }

    setLoading(false);
    if (res.success) {
      onSaved(res.data);
      onClose();
    } else {
      setError(res.error || "Thao tác thất bại");
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={isEdit ? "Chỉnh sửa đợt tình nguyện" : "Tạo đợt tình nguyện mới"}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Tiêu đề <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="VD: Dọn dẹp bờ sông Q1"
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Mô tả</label>
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            rows={3}
            placeholder="Chi tiết về đợt tình nguyện..."
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Quận/Huyện <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.district}
              onChange={(e) => set("district", e.target.value)}
              placeholder="VD: Quận 1"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Số người tối đa
            </label>
            <input
              type="number"
              min="1"
              value={form.max_volunteers}
              onChange={(e) => set("max_volunteers", e.target.value)}
              placeholder="VD: 50"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Địa điểm <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
            placeholder="VD: Bờ sông Sài Gòn, Quận 1"
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Ngày giờ bắt đầu <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={form.scheduled_at}
              onChange={(e) => set("scheduled_at", e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Ngày giờ kết thúc</label>
            <input
              type="datetime-local"
              value={form.end_at}
              onChange={(e) => set("end_at", e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
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
          {!isEdit && (
            <button
              type="button"
              onClick={() => handleSubmit("draft")}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-slate-500 hover:bg-slate-600 text-white rounded-xl font-semibold text-sm shadow-sm transition-colors disabled:opacity-50"
            >
              {loading ? "Đang xử lý..." : "Lưu nháp"}
            </button>
          )}
          <button
            type="button"
            onClick={() => handleSubmit(isEdit ? form.status : "published")}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm shadow-sm transition-colors disabled:opacity-50"
          >
            {loading ? "Đang xử lý..." : isEdit ? "Lưu" : "Công bố ngay"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Invite Volunteers Modal ─────────────────────────────────────────────────

function InviteModal({ campaign, onClose, onInvited }) {
  const [volunteers, setVolunteers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [filterDistrict, setFilterDistrict] = useState("");
  const [selected, setSelected] = useState(new Set());
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const load = useCallback(async (district = "") => {
    setLoading(true);
    setError("");
    try {
      const res = await getApprovedVolunteers({ district, limit: 100 });
      if (res.success) {
        setVolunteers(res.data || []);
        setPagination(res.pagination);
      } else {
        setError(res.error);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(filterDistrict); }, [load, filterDistrict]);

  const toggle = (userId) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const handleInvite = async () => {
    if (selected.size === 0) { setError("Vui lòng chọn ít nhất một tình nguyện viên"); return; }
    setInviteLoading(true);
    setError("");
    setSuccessMsg("");
    const res = await inviteVolunteers(campaign.id, Array.from(selected));
    setInviteLoading(false);
    if (res.success) {
      setSuccessMsg(`Đã gửi lời mời đến ${selected.size} tình nguyện viên!`);
      setSelected(new Set());
      onInvited();
      setTimeout(onClose, 1500);
    } else {
      setError(res.error || "Gửi lời mời thất bại");
    }
  };

  return (
    <Modal open onClose={onClose} title="Mời tình nguyện viên" maxWidth="max-w-2xl">
      <div className="space-y-4">
        <div className="bg-blue-50 rounded-xl p-3 text-sm text-blue-700 font-medium flex items-center gap-2">
          <EventIcon sx={{ fontSize: 18 }} />
          Chiến dịch: <strong>{campaign.title}</strong>
          {selected.size > 0 && (
            <span className="ml-auto bg-blue-600 text-white rounded-full px-2.5 py-0.5 text-xs font-bold">
              {selected.size} đã chọn
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={filterDistrict}
            onChange={(e) => setFilterDistrict(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load(filterDistrict)}
            placeholder="Lọc theo quận/huyện..."
            className="flex-1 h-10 px-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <button
            type="button"
            onClick={() => load(filterDistrict)}
            className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-colors"
          >
            Lọc
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-slate-400 text-sm">Đang tải tình nguyện viên...</div>
        ) : volunteers.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            Không có tình nguyện viên nào phù hợp.
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl">
            {volunteers.map((v) => (
              <label
                key={v.user_id}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-blue-50 transition-colors ${
                  selected.has(v.user_id) ? "bg-blue-50" : ""
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected.has(v.user_id)}
                  onChange={() => toggle(v.user_id)}
                  className="w-4 h-4 accent-blue-600 rounded"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {v.citizen?.username || "—"}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {v.citizen?.email || "—"} · {v.support_type} · {v.district}
                  </p>
                </div>
                {v.note && (
                  <p className="text-xs text-slate-400 italic truncate max-w-[120px]" title={v.note}>
                    {v.note}
                  </p>
                )}
              </label>
            ))}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm font-semibold text-red-600">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm font-semibold text-emerald-600">
            {successMsg}
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={handleInvite}
            disabled={inviteLoading || selected.size === 0}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm shadow-sm transition-colors disabled:opacity-50"
          >
            <SendIcon sx={{ fontSize: 16 }} />
            {inviteLoading ? "Đang gửi..." : `Gửi lời mời (${selected.size})`}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Campaign Detail View ────────────────────────────────────────────────────

function CampaignDetail({ campaign, onBack, onUpdated }) {
  const [activeTab, setActiveTab] = useState("info");
  const [detail, setDetail] = useState(campaign);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // Reload full detail
    getVolunteerCampaignById(campaign.id).then((res) => {
      if (res.success) setDetail(res.data);
    });
    // Load stats
    loadStats();
  }, [campaign.id]);

  const loadStats = async () => {
    setStatsLoading(true);
    const res = await getVolunteerCampaignStats(campaign.id);
    if (res.success) setStats(res.data);
    setStatsLoading(false);
  };

  const doAction = async (actionFn, successMsg) => {
    setActionLoading(actionFn.name);
    setError("");
    const res = await actionFn(campaign.id);
    setActionLoading("");
    if (res.success) {
      setDetail(res.data);
      onUpdated(res.data);
    } else {
      setError(res.error || "Thao tác thất bại");
    }
  };

  const canPublish = detail.status === "draft";
  const canStart = detail.status === "published";
  const canComplete = detail.status === "ongoing";
  const canCancel = ["draft", "published"].includes(detail.status);
  const canEdit = !["completed", "cancelled"].includes(detail.status);

  const TABS = [
    { key: "info", label: "Thông tin" },
    { key: "invitations", label: "Lời mời", badge: detail.invitations?.length },
    { key: "stats", label: "Thống kê" },
  ];

  return (
    <div className="p-8 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold transition-colors"
        >
          <ArrowBackIcon sx={{ fontSize: 18 }} /> Quay lại
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">{detail.title}</h1>
          <p className="text-sm text-slate-500 mt-0.5">{formatDate(detail.scheduled_at)}</p>
        </div>
        <StatusBadge status={detail.status} />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        {canPublish && (
          <button
            type="button"
            disabled={actionLoading === "publishVolunteerCampaign"}
            onClick={() => doAction(publishVolunteerCampaign, "Đã công bố")}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors disabled:opacity-50"
          >
            {actionLoading === "publishVolunteerCampaign" ? "..." : "Công bố"}
          </button>
        )}
        {canStart && (
          <button
            type="button"
            disabled={actionLoading === "startVolunteerCampaign"}
            onClick={() => doAction(startVolunteerCampaign, "Đã bắt đầu")}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors disabled:opacity-50"
          >
            {actionLoading === "startVolunteerCampaign" ? "..." : "Bắt đầu"}
          </button>
        )}
        {canComplete && (
          <button
            type="button"
            disabled={actionLoading === "completeVolunteerCampaign"}
            onClick={() => doAction(completeVolunteerCampaign, "Đã hoàn thành")}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors disabled:opacity-50"
          >
            {actionLoading === "completeVolunteerCampaign" ? "..." : "Hoàn thành"}
          </button>
        )}
        {canCancel && (
          <button
            type="button"
            disabled={actionLoading === "cancelVolunteerCampaign"}
            onClick={() => {
              if (window.confirm("Bạn có chắc muốn hủy đợt tình nguyện này?")) {
                doAction(cancelVolunteerCampaign, "Đã hủy");
              }
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors disabled:opacity-50"
          >
            {actionLoading === "cancelVolunteerCampaign" ? "..." : "Hủy đợt"}
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm font-semibold text-red-600">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 mb-6">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActiveTab(t.key)}
            className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === t.key
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.label}
            {t.badge != null ? ` (${t.badge})` : ""}
          </button>
        ))}
      </div>

      {/* Tab: Info */}
      {activeTab === "info" && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <LocationIcon sx={{ color: "action.active", mt: 0.3, fontSize: 20 }} />
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Địa điểm</p>
                  <p className="text-sm font-semibold text-slate-900">{detail.location || "—"}</p>
                  <p className="text-xs text-slate-500">{detail.district || "—"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <EventIcon sx={{ color: "action.active", mt: 0.3, fontSize: 20 }} />
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Thời gian</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {formatDate(detail.scheduled_at)}
                    {detail.end_at && <> → {formatDate(detail.end_at)}</>}
                  </p>
                </div>
              </div>
              {detail.max_volunteers && (
                <div className="flex items-start gap-3">
                  <PeopleIcon sx={{ color: "action.active", mt: 0.3, fontSize: 20 }} />
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">Số người tối đa</p>
                    <p className="text-sm font-semibold text-slate-900">{detail.max_volunteers}</p>
                  </div>
                </div>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Mô tả</p>
              <p className="text-sm text-slate-700 leading-relaxed">
                {detail.description || "Không có mô tả."}
              </p>
              {detail.cancelled_by && (
                <div className="mt-4 p-3 bg-red-50 rounded-xl text-sm text-red-600">
                  <strong>Đã hủy</strong> bởi quản trị viên
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Invitations */}
      {activeTab === "invitations" && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {(!detail.invitations || detail.invitations.length === 0) ? (
            <div className="py-16 text-center text-slate-400 text-sm">
              Chưa có lời mời nào được gửi.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-slate-600">Tình nguyện viên</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-600">Email</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-600">Trạng thái</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-600">Lý do từ chối</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-600">Ngày phản hồi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {detail.invitations.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {inv.volunteer?.username || "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{inv.volunteer?.email || "—"}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={inv.status} config={INVITATION_STATUS_CONFIG} />
                    </td>
                    <td className="px-4 py-3 text-slate-600 italic">
                      {inv.declined_reason || "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      {formatDate(inv.responded_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Tab: Stats */}
      {activeTab === "stats" && (
        <div>
          {statsLoading ? (
            <div className="py-16 text-center text-slate-400 text-sm">Đang tải thống kê...</div>
          ) : stats ? (
            <>
              <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                  { label: "Đã mời", value: stats.total_invited, color: "from-slate-400 to-slate-500", bg: "bg-slate-50", text: "text-slate-700" },
                  { label: "Chờ phản hồi", value: stats.pending, color: "from-amber-400 to-orange-500", bg: "bg-amber-50", text: "text-amber-700" },
                  { label: "Đồng ý", value: stats.accepted, color: "from-emerald-400 to-teal-500", bg: "bg-emerald-50", text: "text-emerald-700" },
                  { label: "Từ chối", value: stats.declined, color: "from-red-400 to-rose-500", bg: "bg-red-50", text: "text-red-700" },
                ].map((s) => (
                  <div key={s.label} className={`${s.bg} rounded-2xl p-4 border border-slate-200/60`}>
                    <p className={`text-xs font-semibold uppercase mb-1 ${s.text}`}>{s.label}</p>
                    <p className={`text-3xl font-bold ${s.text}`}>{s.value ?? 0}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Accepted */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-100 bg-emerald-50">
                    <h3 className="font-bold text-emerald-700 text-sm">
                      Đã xác nhận tham gia ({stats.accepted_volunteers?.length ?? 0})
                    </h3>
                  </div>
                  {(!stats.accepted_volunteers || stats.accepted_volunteers.length === 0) ? (
                    <div className="py-8 text-center text-slate-400 text-sm">Chưa có ai xác nhận</div>
                  ) : (
                    <ul className="divide-y divide-slate-100">
                      {stats.accepted_volunteers.map((v) => (
                        <li key={v.invitation_id} className="px-5 py-3 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm">
                            {(v.username || "?").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{v.username || "—"}</p>
                            <p className="text-xs text-slate-500">{v.email || "—"}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Declined */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-100 bg-red-50">
                    <h3 className="font-bold text-red-700 text-sm">
                      Đã từ chối ({stats.declined_with_reasons?.length ?? 0})
                    </h3>
                  </div>
                  {(!stats.declined_with_reasons || stats.declined_with_reasons.length === 0) ? (
                    <div className="py-8 text-center text-slate-400 text-sm">Không có ai từ chối</div>
                  ) : (
                    <ul className="divide-y divide-slate-100">
                      {stats.declined_with_reasons.map((v) => (
                        <li key={v.invitation_id} className="px-5 py-3">
                          <div className="flex items-center gap-3 mb-1">
                            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-700 font-bold text-sm">
                              {(v.username || "?").charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{v.username || "—"}</p>
                              <p className="text-xs text-slate-500">{formatDate(v.responded_at)}</p>
                            </div>
                          </div>
                          <p className="text-xs text-red-600 italic ml-11">Lý do: {v.reason || "—"}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Pending */}
              {stats.pending_list && stats.pending_list.length > 0 && (
                <div className="mt-6 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-100 bg-amber-50">
                    <h3 className="font-bold text-amber-700 text-sm">
                      Chờ phản hồi ({stats.pending_list.length})
                    </h3>
                  </div>
                  <ul className="divide-y divide-slate-100">
                    {stats.pending_list.map((v) => (
                      <li key={v.invitation_id} className="px-5 py-3 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm">
                          {(v.username || "?").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{v.username || "—"}</p>
                          <p className="text-xs text-slate-500">{v.email || "—"}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <div className="py-16 text-center text-slate-400 text-sm">Không có dữ liệu thống kê</div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function ManagerVolunteerCampaigns() {
  const [view, setView] = useState("list"); // "list" | "detail"
  const [campaigns, setCampaigns] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDistrict, setFilterDistrict] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  const limit = 20;

  const load = useCallback(
    async (p = 1) => {
      setLoading(true);
      setError("");
      try {
        const res = await getVolunteerCampaigns({
          page: p,
          limit,
          status: filterStatus || undefined,
          district: filterDistrict || undefined,
        });
        if (res.success) {
          setCampaigns(res.data || []);
          setPagination(res.pagination);
          setPage(p);
        } else {
          setError(res.error || "Không thể tải danh sách.");
          setCampaigns([]);
        }
      } catch (e) {
        setError(e?.message || "Không thể tải danh sách.");
        setCampaigns([]);
      } finally {
        setLoading(false);
      }
    },
    [filterStatus, filterDistrict, limit],
  );

  useEffect(() => { load(1); }, []);

  const stats = useMemo(() => {
    const all = campaigns;
    const total = pagination?.total ?? 0;
    const draft = all.filter((c) => c.status === "draft").length;
    const published = all.filter((c) => c.status === "published").length;
    const ongoing = all.filter((c) => c.status === "ongoing").length;
    const completed = all.filter((c) => c.status === "completed").length;
    const cancelled = all.filter((c) => c.status === "cancelled").length;
    return { total, draft, published, ongoing, completed, cancelled };
  }, [campaigns, pagination]);

  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) return campaigns;
    const q = searchTerm.trim().toLowerCase();
    return campaigns.filter(
      (c) =>
        (c.title || "").toLowerCase().includes(q) ||
        (c.district || "").toLowerCase().includes(q) ||
        (c.location || "").toLowerCase().includes(q),
    );
  }, [campaigns, searchTerm]);

  const openDetail = (c) => {
    setSelectedCampaign(c);
    setView("detail");
  };

  const handleFilterChange = () => load(1);

  const handlePageChange = (p) => load(p);

  const handleCampaignSaved = (saved) => {
    if (editModalOpen) {
      setCampaigns((prev) => prev.map((c) => (c.id === saved.id ? saved : c)));
    } else {
      load(1);
    }
  };

  const handleCampaignUpdated = (updated) => {
    setCampaigns((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setSelectedCampaign(updated);
  };

  const handleInvited = () => {
    load().then(() => {
      if (selectedCampaign) {
        getVolunteerCampaignById(selectedCampaign.id).then((res) => {
          if (res.success) setSelectedCampaign(res.data);
        });
      }
    });
  };

  if (view === "detail" && selectedCampaign) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
        <Sidebar />
        <div className="flex-1 overflow-auto">
          <CampaignDetail
            campaign={selectedCampaign}
            onBack={() => { setView("list"); setSelectedCampaign(null); }}
            onUpdated={handleCampaignUpdated}
          />
        </div>
        {inviteModalOpen && (
          <InviteModal
            campaign={selectedCampaign}
            onClose={() => setInviteModalOpen(false)}
            onInvited={handleInvited}
          />
        )}
      </div>
    );
  }

  const statCards = [
    { label: "Tổng đợt", value: stats.total, color: "from-blue-500 to-indigo-600", textColor: "text-blue-700", bgColor: "bg-blue-50" },
    { label: "Nháp", value: stats.draft, color: "from-slate-400 to-slate-500", textColor: "text-slate-700", bgColor: "bg-slate-50" },
    { label: "Đã công bố", value: stats.published, color: "from-blue-400 to-cyan-500", textColor: "text-blue-700", bgColor: "bg-blue-50" },
    { label: "Đang diễn ra", value: stats.ongoing, color: "from-emerald-400 to-teal-500", textColor: "text-emerald-700", bgColor: "bg-emerald-50" },
    { label: "Hoàn thành", value: stats.completed, color: "from-violet-400 to-purple-500", textColor: "text-violet-700", bgColor: "bg-violet-50" },
    { label: "Đã hủy", value: stats.cancelled, color: "from-red-400 to-rose-500", textColor: "text-red-700", bgColor: "bg-red-50" },
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
                Đợt tình nguyện
              </h1>
              <p className="text-slate-600 text-base">
                Tạo và quản lý các đợt tình nguyện viên.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCreateModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm shadow-sm transition-colors"
            >
              <AddIcon sx={{ fontSize: 18 }} />
              Tạo đợt mới
            </button>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            {statCards.map((s) => (
              <div
                key={s.label}
                className={`${s.bgColor} rounded-2xl p-4 border border-slate-200/60`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-semibold uppercase tracking-wide ${s.textColor}`}>
                    {s.label}
                  </span>
                  <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center shadow-sm`}>
                    <span className="text-white text-xs font-bold">{s.value}</span>
                  </div>
                </div>
                <p className={`text-2xl font-bold ${s.textColor}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-wrap gap-3">
              <div className="flex-1 min-w-[220px]">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm theo tiêu đề, quận, địa điểm..."
                  className="w-full h-10 px-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value); }}
                onBlur={handleFilterChange}
                className="h-10 px-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
              >
                <option value="">Tất cả trạng thái</option>
                {Object.entries(STATUS_CONFIG).map(([v, cfg]) => (
                  <option key={v} value={v}>{cfg.label}</option>
                ))}
              </select>

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
                  setFilterStatus(""); setFilterDistrict(""); setSearchTerm("");
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
                  Không có đợt tình nguyện nào.
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left font-bold text-slate-600">#</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-600">Tiêu đề</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-600">Quận/Huyện</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-600">Địa điểm</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-600">Thời gian</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-600">Số người</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-600">Trạng thái</th>
                      <th className="px-4 py-3 text-right font-bold text-slate-600">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRows.map((c, idx) => (
                      <tr key={c.id} className="hover:bg-slate-50/70">
                        <td className="px-4 py-3 text-slate-500">
                          {(page - 1) * limit + idx + 1}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => openDetail(c)}
                            className="font-semibold text-blue-600 hover:text-blue-800 hover:underline text-left"
                          >
                            {c.title}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-slate-700">{c.district || "—"}</td>
                        <td className="px-4 py-3 text-slate-700 max-w-[180px] truncate" title={c.location}>
                          {c.location || "—"}
                        </td>
                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                          {formatDate(c.scheduled_at)}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {c.max_volunteers || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={c.status} />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => openDetail(c)}
                              title="Chi tiết"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            >
                              <VisibilityIcon sx={{ fontSize: 18 }} />
                            </button>
                            {["draft", "published"].includes(c.status) && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedCampaign(c);
                                  setInviteModalOpen(true);
                                }}
                                title="Mời tình nguyện viên"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                              >
                                <PeopleIcon sx={{ fontSize: 18 }} />
                              </button>
                            )}
                          </div>
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

      {/* Modals */}
      {createModalOpen && (
        <CampaignFormModal
          campaign={null}
          onClose={() => setCreateModalOpen(false)}
          onSaved={handleCampaignSaved}
        />
      )}
      {editModalOpen && selectedCampaign && (
        <CampaignFormModal
          campaign={selectedCampaign}
          onClose={() => setEditModalOpen(false)}
          onSaved={handleCampaignSaved}
        />
      )}
      {inviteModalOpen && selectedCampaign && (
        <InviteModal
          campaign={selectedCampaign}
          onClose={() => setInviteModalOpen(false)}
          onInvited={handleInvited}
        />
      )}
    </div>
  );
}
