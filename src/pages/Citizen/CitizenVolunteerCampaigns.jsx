import React, { useCallback, useEffect, useState } from "react";
import {
  getMyInvitations,
  respondToInvitation,
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

const INV_STATUS_CONFIG = {
  pending: {
    label: "Chờ phản hồi",
    color: "bg-amber-100 text-amber-700",
    dot: "bg-amber-500",
  },
  accepted: {
    label: "Đã đồng ý",
    color: "bg-emerald-100 text-emerald-700",
    dot: "bg-emerald-500",
  },
  declined: {
    label: "Đã từ chối",
    color: "bg-red-100 text-red-700",
    dot: "bg-red-500",
  },
};

const CAMPAIGN_STATUS_CONFIG = {
  draft: { label: "Nháp", color: "bg-slate-100 text-slate-600" },
  published: { label: "Đã công bố", color: "bg-blue-100 text-blue-700" },
  ongoing: { label: "Đang diễn ra", color: "bg-emerald-100 text-emerald-700" },
  completed: { label: "Hoàn thành", color: "bg-violet-100 text-violet-700" },
  cancelled: { label: "Đã hủy", color: "bg-red-100 text-red-700" },
};

function InvitationCard({ inv, onTap }) {
  const statusCfg = INV_STATUS_CONFIG[inv.status] || { label: inv.status, color: "bg-slate-100 text-slate-600", dot: "bg-slate-400" };
  const campaign = inv.campaign || {};

  return (
    <button
      type="button"
      onClick={() => onTap(inv)}
      className="w-full text-left bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-3 hover:shadow-md transition-shadow active:scale-[0.99]"
    >
      {/* Campaign Title */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-900 text-base leading-tight line-clamp-2">
            {campaign.title || "Không có tiêu đề"}
          </h3>
          {campaign.description && (
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{campaign.description}</p>
          )}
        </div>
        <span className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${statusCfg.color}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
          {statusCfg.label}
        </span>
      </div>

      {/* Campaign Status Badge */}
      {campaign.status && (
        <div className="mb-3">
          {(() => {
            const cs = CAMPAIGN_STATUS_CONFIG[campaign.status] || { label: campaign.status, color: "bg-slate-100 text-slate-600" };
            return (
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${cs.color}`}>
                Đợt: {cs.label}
              </span>
            );
          })()}
        </div>
      )}

      {/* Details */}
      <div className="space-y-1.5 mb-3">
        {campaign.location && (
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <svg className="w-3.5 h-3.5 shrink-0 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            <span className="truncate">{campaign.location}</span>
            {campaign.district && (
              <span className="text-slate-400">· {campaign.district}</span>
            )}
          </div>
        )}
        {campaign.scheduled_at && (
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <svg className="w-3.5 h-3.5 shrink-0 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
            </svg>
            <span>
              {formatDate(campaign.scheduled_at)}
              {campaign.end_at && <> → {formatDate(campaign.end_at)}</>}
            </span>
          </div>
        )}
      </div>

      {/* Declined reason */}
      {inv.status === "declined" && inv.declined_reason && (
        <div className="bg-red-50 rounded-xl px-3 py-2 text-xs text-red-600">
          <strong>Lý do từ chối:</strong> {inv.declined_reason}
        </div>
      )}

      {/* CTA for pending */}
      {inv.status === "pending" && (
        <div className="mt-2 text-xs text-blue-600 font-semibold flex items-center gap-1">
          <span>Bấm để phản hồi</span>
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
          </svg>
        </div>
      )}
    </button>
  );
}

// ─── Respond Modal ────────────────────────────────────────────────────────────

function RespondModal({ invitation, onClose, onResponded }) {
  const [choice, setChoice] = useState(null); // null | "accept" | "decline"
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const campaign = invitation.campaign || {};

  const handleSubmit = async () => {
    if (!choice) return;
    if (choice === "decline" && !reason.trim()) {
      setError("Vui lòng nhập lý do từ chối");
      return;
    }
    setLoading(true);
    setError("");
    const res = await respondToInvitation(invitation.id, {
      status: choice === "accept" ? "accepted" : "declined",
      declined_reason: choice === "decline" ? reason.trim() : undefined,
    });
    setLoading(false);
    if (res.success) {
      onResponded();
      onClose();
    } else {
      setError(res.error || "Phản hồi thất bại");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40">
      <div className="bg-white w-full sm:w-[480px] sm:rounded-2xl rounded-t-3xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Phản hồi lời mời</h2>
          <p className="text-sm text-slate-500 mt-1 line-clamp-2">{campaign.title}</p>
        </div>

        {/* Campaign Info */}
        <div className="px-6 py-4 space-y-2 bg-slate-50 text-sm">
          {campaign.location && (
            <div className="flex items-center gap-2 text-slate-600">
              <svg className="w-4 h-4 shrink-0 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              <span>{campaign.location}{campaign.district ? `, ${campaign.district}` : ""}</span>
            </div>
          )}
          {campaign.scheduled_at && (
            <div className="flex items-center gap-2 text-slate-600">
              <svg className="w-4 h-4 shrink-0 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
              </svg>
              <span>{formatDate(campaign.scheduled_at)}</span>
            </div>
          )}
          {campaign.description && (
            <p className="text-xs text-slate-500 leading-relaxed pt-1">{campaign.description}</p>
          )}
        </div>

        {/* Choice */}
        <div className="px-6 py-4 space-y-3">
          <p className="text-sm font-semibold text-slate-700">Bạn có tham gia không?</p>

          <button
            type="button"
            onClick={() => setChoice("accept")}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
              choice === "accept"
                ? "border-emerald-500 bg-emerald-50"
                : "border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50"
            }`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
              choice === "accept" ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"
            }`}>
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            </div>
            <div className="text-left">
              <p className={`font-bold text-base ${choice === "accept" ? "text-emerald-700" : "text-slate-700"}`}>
                Đồng ý tham gia
              </p>
              <p className="text-xs text-slate-500 mt-0.5">Tôi sẽ có mặt tại địa điểm đúng giờ</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setChoice("decline")}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
              choice === "decline"
                ? "border-red-500 bg-red-50"
                : "border-slate-200 hover:border-red-300 hover:bg-red-50/50"
            }`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
              choice === "decline" ? "bg-red-500 text-white" : "bg-slate-100 text-slate-400"
            }`}>
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </div>
            <div className="text-left">
              <p className={`font-bold text-base ${choice === "decline" ? "text-red-700" : "text-slate-700"}`}>
                Không tham gia
              </p>
              <p className="text-xs text-slate-500 mt-0.5">Tôi không thể tham gia đợt này</p>
            </div>
          </button>

          {choice === "decline" && (
            <div className="mt-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Lý do từ chối <span className="text-red-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder="VD: Trùng lịch công tác, bận việc gia đình..."
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm resize-none"
              />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm font-semibold text-red-600">
              {error}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex items-center gap-3">
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
            disabled={loading || !choice}
            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm shadow-sm transition-colors disabled:opacity-50"
          >
            {loading ? "Đang xử lý..." : "Gửi phản hồi"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CitizenVolunteerCampaigns() {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // all | pending | accepted | declined
  const [selectedInv, setSelectedInv] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getMyInvitations({ limit: 100 });
      if (res.success) {
        setInvitations(res.data || []);
      } else {
        setError(res.error || "Không thể tải lời mời");
      }
    } catch (e) {
      setError(e?.message || "Không thể tải lời mời");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = activeTab === "all"
    ? invitations
    : invitations.filter((i) => i.status === activeTab);

  const counts = {
    all: invitations.length,
    pending: invitations.filter((i) => i.status === "pending").length,
    accepted: invitations.filter((i) => i.status === "accepted").length,
    declined: invitations.filter((i) => i.status === "declined").length,
  };

  const tabs = [
    { key: "all", label: "Tất cả" },
    { key: "pending", label: "Chờ phản hồi" },
    { key: "accepted", label: "Đồng ý" },
    { key: "declined", label: "Từ chối" },
  ];

  const handleResponded = () => {
    load();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-5 pt-4 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-md shadow-blue-500/20">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">
                Đợt tình nguyện
              </h1>
              <p className="text-xs text-blue-600 font-medium">
                Lời mời tham gia của bạn
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-5 pb-3 flex gap-2 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveTab(t.key)}
              className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                activeTab === t.key
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {t.label}
              {counts[t.key] > 0 && (
                <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${
                  activeTab === t.key ? "bg-white/20 text-white" : "bg-blue-100 text-blue-700"
                }`}>
                  {counts[t.key]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-4">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="mt-3 text-sm text-slate-500">Đang tải lời mời...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-sm font-semibold text-red-600 text-center">
            {error}
            <button
              type="button"
              onClick={load}
              className="block mx-auto mt-2 text-blue-600 underline text-sm"
            >
              Thử lại
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10H7v-2h10v2z"/>
              </svg>
            </div>
            <p className="text-slate-600 font-semibold">
              {activeTab === "all" ? "Chưa có lời mời nào" : `Không có lời mời "${tabs.find((t) => t.key === activeTab)?.label}"`}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {activeTab === "all" ? "Bạn sẽ nhận được lời mời khi có đợt tình nguyện phù hợp" : "Thử chọn tab khác"}
            </p>
          </div>
        ) : (
          <>
            {activeTab !== "all" && (
              <p className="text-xs text-slate-500 mb-3 font-medium">
                {filtered.length} lời mời
              </p>
            )}
            {filtered.map((inv) => (
              <InvitationCard
                key={inv.id}
                inv={inv}
                onTap={(i) => i.status === "pending" && setSelectedInv(i)}
              />
            ))}
          </>
        )}
      </div>

      {/* Respond Modal */}
      {selectedInv && (
        <RespondModal
          invitation={selectedInv}
          onClose={() => setSelectedInv(null)}
          onResponded={handleResponded}
        />
      )}
    </div>
  );
}
