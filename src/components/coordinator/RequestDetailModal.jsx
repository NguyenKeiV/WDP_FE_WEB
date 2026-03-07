import React from "react";

const PRIORITY_CONFIG = {
  CRITICAL: {
    bg: "bg-red-100",
    text: "text-red-700",
    border: "border-red-300",
    label: "Nguy kịch",
    dot: "bg-red-600",
  },
  HIGH: {
    bg: "bg-orange-100",
    text: "text-orange-700",
    border: "border-orange-300",
    label: "Ưu tiên cao",
    dot: "bg-orange-500",
  },
  MEDIUM: {
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    border: "border-yellow-300",
    label: "Trung bình",
    dot: "bg-yellow-500",
  },
  NORMAL: {
    bg: "bg-blue-100",
    text: "text-blue-700",
    border: "border-blue-300",
    label: "Bình thường",
    dot: "bg-blue-500",
  },
  LOW: {
    bg: "bg-slate-100",
    text: "text-slate-600",
    border: "border-slate-300",
    label: "Thấp",
    dot: "bg-slate-400",
  },
};

const STATUS_CONFIG = {
  CREATED: {
    bg: "bg-blue-100",
    text: "text-blue-700",
    label: "Chờ xử lý",
    icon: "pending_actions",
  },
  IN_PROGRESS: {
    bg: "bg-green-100",
    text: "text-green-700",
    label: "Đang xử lý",
    icon: "autorenew",
  },
  COMPLETED: {
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    label: "Hoàn thành",
    icon: "task_alt",
  },
  CANCELLED: {
    bg: "bg-gray-100",
    text: "text-gray-600",
    label: "Đã từ chối",
    icon: "cancel",
  },
};

const TYPE_CONFIG = {
  RESCUE: {
    icon: "emergency",
    color: "text-red-600",
    bg: "bg-red-50",
    label: "Cứu hộ",
  },
  RELIEF: {
    icon: "volunteer_activism",
    color: "text-green-600",
    bg: "bg-green-50",
    label: "Cứu trợ",
  },
  OTHER: {
    icon: "help",
    color: "text-slate-500",
    bg: "bg-slate-50",
    label: "Khác",
  },
};

const Row = ({ icon, label, children }) => (
  <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
    <span className="material-symbols-outlined text-slate-400 text-base mt-0.5 flex-shrink-0">
      {icon}
    </span>
    <div className="flex-1 min-w-0">
      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-0.5">
        {label}
      </p>
      <div className="text-sm text-slate-800">{children}</div>
    </div>
  </div>
);

const formatDateTime = (isoString) => {
  if (!isoString) return "—";
  const d = new Date(isoString);
  return d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const RequestDetailModal = ({ isOpen, onClose, request }) => {
  if (!isOpen || !request) return null;

  const priority =
    PRIORITY_CONFIG[request.priority] || PRIORITY_CONFIG["NORMAL"];
  const status = STATUS_CONFIG[request.status] || STATUS_CONFIG["CREATED"];
  const reqType = TYPE_CONFIG[request.requestType] || TYPE_CONFIG["OTHER"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4 flex-shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 ${reqType.bg} rounded-xl flex items-center justify-center flex-shrink-0`}
              >
                <span
                  className={`material-symbols-outlined text-2xl ${reqType.color}`}
                >
                  {reqType.icon}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${status.bg} ${status.text}`}
                  >
                    <span className="material-symbols-outlined text-xs align-middle mr-0.5">
                      {status.icon}
                    </span>
                    {status.label}
                  </span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${priority.bg} ${priority.text}`}
                  >
                    {priority.label}
                  </span>
                </div>
                <h2 className="text-white font-bold text-base leading-tight">
                  Yêu cầu #{request.id} — {reqType.label}
                </h2>
                <p className="text-slate-400 text-xs mt-0.5">
                  {formatDateTime(request.createdAt)}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors flex-shrink-0 mt-1"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        {/* Body – scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Người gửi */}
          <div className="mb-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
              Thông tin người gửi
            </h3>
            <div className="bg-slate-50 rounded-xl border border-slate-200 px-4 divide-y divide-slate-100">
              <Row icon="person" label="Tên người dùng">
                {request.name || "—"}
              </Row>
              <Row icon="phone" label="Số điện thoại">
                {request.phone ? (
                  <a
                    href={`tel:${request.phone}`}
                    className="text-blue-600 font-semibold hover:underline"
                  >
                    {request.phone}
                  </a>
                ) : (
                  "—"
                )}
              </Row>
            </div>
          </div>

          {/* Nội dung yêu cầu */}
          <div className="mb-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
              Nội dung yêu cầu
            </h3>
            <div className="bg-slate-50 rounded-xl border border-slate-200 px-4 divide-y divide-slate-100">
              <Row icon="category" label="Loại yêu cầu">
                <span
                  className={`inline-flex items-center gap-1.5 font-semibold ${reqType.color}`}
                >
                  <span className="material-symbols-outlined text-base">
                    {reqType.icon}
                  </span>
                  {reqType.label}
                </span>
              </Row>
              <Row icon="flag" label="Mức độ ưu tiên">
                <span
                  className={`inline-flex items-center gap-1.5 font-semibold ${priority.text}`}
                >
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${priority.dot}`}
                  />
                  {priority.label}
                </span>
              </Row>
              <Row icon="description" label="Mô tả tình huống">
                <p className="leading-relaxed">
                  {request.description || "Không có mô tả"}
                </p>
              </Row>
              {request.requestSupplies && (
                <Row icon="inventory_2" label="Vật tư yêu cầu">
                  <p className="leading-relaxed">{request.requestSupplies}</p>
                </Row>
              )}
            </div>
          </div>

          {/* Media đính kèm */}
          {request.requestMedia && (
            <div className="mb-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                Hình ảnh / Video đính kèm
              </h3>
              <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                {/\.(mp4|webm|ogg)$/i.test(request.requestMedia) ? (
                  <video
                    src={request.requestMedia}
                    controls
                    className="w-full max-h-52 object-cover"
                  />
                ) : (
                  <img
                    src={request.requestMedia}
                    alt="Ảnh đính kèm yêu cầu"
                    className="w-full max-h-52 object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                )}
                <div
                  style={{ display: "none" }}
                  className="flex flex-col items-center justify-center py-8 text-slate-400 gap-2"
                >
                  <span className="material-symbols-outlined text-4xl">
                    broken_image
                  </span>
                  <p className="text-sm">Không thể tải ảnh</p>
                  <a
                    href={request.requestMedia}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 text-xs hover:underline"
                  >
                    Mở link gốc
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Thời gian */}
          <div className="mb-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
              Thời gian
            </h3>
            <div className="bg-slate-50 rounded-xl border border-slate-200 px-4">
              <Row icon="schedule" label="Thời gian tạo">
                {formatDateTime(request.createdAt)}
              </Row>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 bg-slate-800 text-white rounded-lg font-semibold hover:bg-slate-900 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequestDetailModal;
