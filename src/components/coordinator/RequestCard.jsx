import React from "react";

export const getPriorityColor = (priority) => {
  if (priority === "CRITICAL") return "border-red-600";
  if (priority === "HIGH") return "border-orange-500";
  if (priority === "MEDIUM") return "border-yellow-400";
  if (priority === "LOW") return "border-slate-300";
  return "border-blue-400"; // NORMAL
};

export const getStatusBadge = (status) => {
  if (status === "IN_PROGRESS") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-600 uppercase tracking-wide">
        ⏳ Đang xử lý
      </span>
    );
  }
  if (status === "COMPLETED") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 uppercase tracking-wide">
        ✓ Hoàn thành
      </span>
    );
  }
  if (status === "CANCELLED") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-600 uppercase tracking-wide">
        ✕ Đã từ chối
      </span>
    );
  }
  return null;
};

const PRIORITY_CONFIG = {
  CRITICAL: { bg: "bg-red-100", text: "text-red-600", label: "Nguy kịch" },
  HIGH: { bg: "bg-orange-100", text: "text-orange-600", label: "Ưu tiên cao" },
  MEDIUM: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Trung bình" },
  NORMAL: { bg: "bg-blue-100", text: "text-blue-600", label: "Bình thường" },
  LOW: { bg: "bg-slate-100", text: "text-slate-500", label: "Thấp" },
};

export const getPriorityBadge = (priority) => {
  const c = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG["NORMAL"];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${c.bg} ${c.text} uppercase tracking-wide`}
    >
      {c.label}
    </span>
  );
};

const RequestCard = ({
  request,
  onApprove,
  onCancel,
  onClassify,
  onDetail,
  onFlyTo,
  onAssign,
}) => {
  return (
    <div
      className={`relative group bg-white rounded-xl border-l-4 ${getPriorityColor(request.priority)} shadow-sm hover:shadow-md transition-all overflow-hidden`}
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            {getStatusBadge(request.status)}
            {request.status === "CREATED" && getPriorityBadge(request.priority)}
          </div>
          <span className="text-xs font-medium text-slate-400">
            {request.time}
          </span>
        </div>
        <h3 className="text-base font-bold text-slate-900 mb-1">
          {request.name} - {request.type}
        </h3>
        <p className="text-sm text-slate-500 flex items-center gap-1 mb-4">
          <span className="material-symbols-outlined text-sm">location_on</span>
          {request.location}
        </p>

        {/* CREATED: Xem chi tiết → Phân loại → Tiếp nhận / Từ chối */}
        {request.status === "CREATED" && (
          <div className="flex flex-col gap-2">
            <button
              onClick={() => onDetail(request)}
              className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">info</span>
              Xem chi tiết yêu cầu
            </button>
            <button
              onClick={() => onClassify(request)}
              className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">tune</span>
              Phân loại yêu cầu
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

        {/* IN_PROGRESS: Phân công nhiệm vụ + Đánh dấu hoàn thành */}
        {request.status === "IN_PROGRESS" && (
          <div className="flex flex-col gap-2">
            {/* Nút phân công đội & xe */}
            <button
              onClick={() => onAssign && onAssign(request)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-base">
                assignment_ind
              </span>
              Phân công đội &amp; phương tiện
            </button>
            <div className="flex items-center gap-2">
            <button
              onClick={() => onApprove(request.id, "complete")}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
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

        {/* CANCELLED */}
        {request.status === "CANCELLED" && (
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
        {request.status === "COMPLETED" && (
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
