import React from "react";

const PRIORITY_CONFIG = {
  urgent: {
    bg: "bg-red-100",
    text: "text-red-700",
    border: "border-red-300",
    label: "Nguy kịch",
    dot: "bg-red-600",
  },
  high: {
    bg: "bg-orange-100",
    text: "text-orange-700",
    border: "border-orange-300",
    label: "Ưu tiên cao",
    dot: "bg-orange-500",
  },
  medium: {
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    border: "border-yellow-300",
    label: "Trung bình",
    dot: "bg-yellow-500",
  },
  low: {
    bg: "bg-slate-100",
    text: "text-slate-600",
    border: "border-slate-300",
    label: "Thấp",
    dot: "bg-slate-400",
  },
};

const STATUS_CONFIG = {
  new: {
    bg: "bg-blue-100",
    text: "text-blue-700",
    label: "Chờ xử lý",
    icon: "pending_actions",
  },
  pending_verification: {
    bg: "bg-indigo-100",
    text: "text-indigo-700",
    label: "Đã tiếp nhận",
    icon: "verified",
  },
  on_mission: {
    bg: "bg-green-100",
    text: "text-green-700",
    label: "Đang xử lý",
    icon: "autorenew",
  },
  completed: {
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    label: "Hoàn thành",
    icon: "task_alt",
  },
  rejected: {
    bg: "bg-gray-100",
    text: "text-gray-600",
    label: "Đã từ chối",
    icon: "cancel",
  },
};

const TYPE_CONFIG = {
  rescue: {
    icon: "emergency",
    color: "text-red-600",
    bg: "bg-red-50",
    label: "Cứu hộ",
  },
  relief: {
    icon: "volunteer_activism",
    color: "text-green-600",
    bg: "bg-green-50",
    label: "Cứu trợ",
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
    PRIORITY_CONFIG[request.priority] || PRIORITY_CONFIG["medium"];
  const status = STATUS_CONFIG[request.status] || STATUS_CONFIG["new"];
  const reqType = TYPE_CONFIG[request.category] || TYPE_CONFIG["other"];

  // Tên người gử: creator.username hoặc phone_number nếu gử ẩn danh
  const senderName = request.creator?.username || "Nưới dùng ẩn danh";
  const phoneNumber = request.phone_number || "—";
  // Vị trí: district hoặc address
  const locationText =
    request.district ||
    (request.location_type === "manual" ? request.address : null) ||
    "—";
  // Ảnh/video đính kèm
  const mediaUrl =
    Array.isArray(request.media_urls) && request.media_urls.length > 0
      ? request.media_urls[0]
      : null;

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
                  Yêu cầu #{String(request.id).substring(0, 8)} —{" "}
                  {reqType.label}
                </h2>
                <p className="text-slate-400 text-xs mt-0.5">
                  {formatDateTime(request.created_at)}
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
                {senderName}
              </Row>
              <Row icon="phone" label="Số điện thoại">
                {phoneNumber !== "—" ? (
                  <a
                    href={`tel:${phoneNumber}`}
                    className="text-blue-600 font-semibold hover:underline"
                  >
                    {phoneNumber}
                  </a>
                ) : (
                  "—"
                )}
              </Row>
              <Row icon="location_on" label="Vị trí">
                {locationText}
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
              {request.num_people && (
                <Row icon="groups" label="Số người cần hỗ trợ">
                  <span className="font-semibold text-slate-800">
                    {request.num_people} người
                  </span>
                </Row>
              )}
            </div>
          </div>

          {/* Media đính kèm */}
          {mediaUrl && (
            <div className="mb-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                Hình ảnh / Video đính kèm
              </h3>
              <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                {/\.(mp4|webm|ogg)$/i.test(mediaUrl) ? (
                  <video
                    src={mediaUrl}
                    controls
                    className="w-full max-h-52 object-cover"
                  />
                ) : (
                  <img
                    src={mediaUrl}
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
                    href={mediaUrl}
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
                {formatDateTime(request.created_at)}
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
