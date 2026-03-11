import React from "react";

// API priority: urgent | high | medium | low
export const getPriorityColor = (priority) => {
  if (priority === "urgent") return "border-red-600";
  if (priority === "high") return "border-orange-500";
  if (priority === "medium") return "border-yellow-400";
  if (priority === "low") return "border-slate-300";
  return "border-blue-400";
};

// API status: new | pending_verification | verified | on_mission | completed | rejected
export const getStatusBadge = (status) => {
  if (status === "new") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-600 uppercase tracking-wide">
        🆕 Mới
      </span>
    );
  }
  if (status === "pending_verification") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-600 uppercase tracking-wide">
        ✓ Đã tiếp nhận
      </span>
    );
  }
  if (status === "verified") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-600 uppercase tracking-wide">
        ✓ Đã tiếp nhận
      </span>
    );
  }
  if (status === "on_mission") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-600 uppercase tracking-wide">
        ⏳ Đang xử lý
      </span>
    );
  }
  if (status === "completed") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 uppercase tracking-wide">
        ✓ Hoàn thành
      </span>
    );
  }
  if (status === "rejected") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-600 uppercase tracking-wide">
        ✕ Đã từ chối
      </span>
    );
  }
  return null;
};

const PRIORITY_CONFIG = {
  urgent: { bg: "bg-red-100", text: "text-red-600", label: "Nguy kịch" },
  high: { bg: "bg-orange-100", text: "text-orange-600", label: "Ưu tiên cao" },
  medium: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Trung bình" },
  low: { bg: "bg-slate-100", text: "text-slate-500", label: "Thấp" },
};

// API category: rescue | relief
const CATEGORY_LABEL = {
  rescue: "Cứu hộ",
  relief: "Cứu trợ",
};

export const getPriorityBadge = (priority) => {
  const c = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG["medium"];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${c.bg} ${c.text} uppercase tracking-wide`}
    >
      {c.label}
    </span>
  );
};

const formatTime = (isoString) => {
  if (!isoString) return "";
  const d = new Date(isoString);
  return d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Hiển thị giờ rõ hơn: “HH:MM — DD/MM/YYYY”
const formatTimeVerbose = (isoString) => {
  if (!isoString) return "—";
  const d = new Date(isoString);
  const now = new Date();
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
  const timeStr = d.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
  if (isToday) return `Hôm nay ${timeStr}`;
  const dateStr = d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  return `${timeStr} — ${dateStr}`;
};

const RequestCard = ({
  request,
  onApprove,
  onCancel,
  onDetail,
  onFlyTo,
  onAssign,
  vehicleRequestInfo,
}) => {
  const displayName =
    request.creator?.username || request.phone_number || "Ẩn danh";
  const displayLocation = request.district || request.address || "—";
  const displayCategory =
    CATEGORY_LABEL[request.category] || request.category || "—";
  const displayTime = formatTime(request.created_at);
  const displayTimeVerbose = formatTimeVerbose(request.created_at);

  // Backend flow: new → [approve] → pending_verification → [assign-team] → on_mission
  // "new": mới tạo, có thể Tiếp nhận hoặc Từ chối
  const isNew = request.status === "new";
  // "pending_verification": đã được coordinator tiếp nhận, chờ phân công đội
  const isPendingVerification = request.status === "pending_verification";
  // Đội đang thực hiện nhiệm vụ
  const isOnMission = request.status === "on_mission";

  return (
    <div
      className={`relative group bg-white rounded-xl border-l-4 ${getPriorityColor(request.priority)} shadow-sm hover:shadow-md transition-all overflow-hidden`}
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            {getStatusBadge(request.status)}
            {isNew && getPriorityBadge(request.priority)}
          </div>
          <span className="text-xs font-medium text-slate-400">
            {displayTime}
          </span>
        </div>
        <h3 className="text-base font-bold text-slate-900 mb-1">
          {displayName} — {displayCategory}
        </h3>
        <p className="text-sm text-slate-500 flex items-center gap-1 mb-2">
          <span className="material-symbols-outlined text-sm">location_on</span>
          {displayLocation}
        </p>
        <p className="text-xs text-slate-400 flex items-center gap-1 mb-4">
          <span className="material-symbols-outlined text-xs">schedule</span>
          {displayTimeVerbose}
        </p>

        {/* NEW: Xem chi tiết → Tiếp nhận / Từ chối */}
        {isNew && (
          <div className="flex flex-col gap-2">
            <button
              onClick={() => onDetail(request)}
              className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">info</span>
              Xem chi tiết yêu cầu
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onApprove(request.id)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">
                  check_circle
                </span>
                Tiếp nhận
              </button>
              <button
                onClick={() => onCancel(request)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">
                  cancel
                </span>
                Từ chối
              </button>
              <button
                onClick={() => onFlyTo(request)}
                className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-blue-100 hover:text-blue-600 transition-colors"
                title="Xem trên bản đồ"
              >
                <span className="material-symbols-outlined text-sm">map</span>
              </button>
            </div>
          </div>
        )}

        {/* PENDING_VERIFICATION: Đã tiếp nhận bởi coordinator, cần phân công đội cứu hộ */}
        {isPendingVerification && (
          <div className="flex flex-col gap-2">
            <button
              onClick={() => onDetail(request)}
              className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">info</span>
              Xem chi tiết
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onAssign && onAssign(request)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-base">
                  assignment_ind
                </span>
                Phân công đội cứu hộ
              </button>
              <button
                onClick={() => onFlyTo(request)}
                className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-blue-100 hover:text-blue-600 transition-colors"
                title="Xem trên bản đồ"
              >
                <span className="material-symbols-outlined text-sm">map</span>
              </button>
            </div>
          </div>
        )}

        {/* ON_MISSION: Đội đang thực hiện → Yêu cầu phương tiện + Hoàn thành */}
        {isOnMission && (
          <div className="flex flex-col gap-2">
            {/* Nút yêu cầu phương tiện — thay đổi theo trạng thái */}
            {(!vehicleRequestInfo ||
              vehicleRequestInfo.status === "rejected" ||
              vehicleRequestInfo.status === "returned") && (
              <button
                onClick={() => onAssign && onAssign(request)}
                className="w-full bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 py-2 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-base">
                  directions_car
                </span>
                Yêu cầu phương tiện
              </button>
            )}

            {vehicleRequestInfo?.status === "pending" && (
              <button
                onClick={() => onAssign && onAssign(request)}
                className="w-full bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 py-2 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2"
              >
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-500 flex-shrink-0" />
                Đang chờ duyệt phương tiện
              </button>
            )}

            {vehicleRequestInfo?.status === "approved" && (
              <button
                onClick={() => onAssign && onAssign(request)}
                className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 py-2 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-base">
                  check_circle
                </span>
                Phương tiện đã duyệt
              </button>
            )}

            {vehicleRequestInfo?.status === "returned" && (
              <div className="w-full bg-slate-50 text-slate-600 border border-slate-200 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-base">
                  assignment_return
                </span>
                Phương tiện đã thu hồi
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={() => onApprove(request.id, "complete")}
                disabled={vehicleRequestInfo?.status === "pending"}
                title={
                  vehicleRequestInfo?.status === "pending"
                    ? "Cần chờ phương tiện được duyệt trước"
                    : ""
                }
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-slate-300 disabled:to-slate-300 disabled:cursor-not-allowed disabled:text-slate-400 text-white py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <span className="material-symbols-outlined text-base">
                  task_alt
                </span>
                Đánh dấu hoàn thành
              </button>
              <button
                onClick={() => onFlyTo(request)}
                className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-blue-100 hover:text-blue-600 transition-colors"
                title="Xem trên bản đồ"
              >
                <span className="material-symbols-outlined text-sm">
                  my_location
                </span>
              </button>
            </div>
          </div>
        )}

        {/* REJECTED */}
        {request.status === "rejected" && (
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <p className="text-xs text-gray-600 flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-gray-500">
                info
              </span>
              <span>Yêu cầu đã bị từ chối và không thể xử lý</span>
            </p>
          </div>
        )}

        {/* COMPLETED: Xem lại chi tiết */}
        {request.status === "completed" && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onDetail(request)}
              className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 py-2.5 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-base">
                search
              </span>
              Xem lại chi tiết
            </button>
            <button
              onClick={() => onFlyTo(request)}
              className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-emerald-100 hover:text-emerald-600 transition-colors"
              title="Xem vị trí trên bản đồ"
            >
              <span className="material-symbols-outlined text-sm">
                my_location
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestCard;
