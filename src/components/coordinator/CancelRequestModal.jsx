import React, { useState } from "react";

const CancelRequestModal = ({ isOpen, onClose, onConfirm, requestInfo }) => {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    await onConfirm(reason);
    setIsSubmitting(false);
    setReason("");
    onClose();
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setReason("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-2xl">
                  cancel
                </span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Từ chối yêu cầu
                </h2>
                <p className="text-red-100 text-sm">
                  Xác nhận từ chối yêu cầu này
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-white/80 hover:text-white transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          {/* Request Info */}
          {requestInfo && (
            <div className="bg-slate-50 rounded-lg p-4 mb-4 border border-slate-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-red-600">
                    {requestInfo.category === "rescue"
                      ? "emergency"
                      : requestInfo.category === "supplies"
                        ? "volunteer_activism"
                        : "help"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 mb-1">
                    {requestInfo.creator?.username ||
                      requestInfo.phone_number ||
                      "Ẩn danh"}
                    {" — "}
                    {requestInfo.category === "rescue"
                      ? "Cứu hộ"
                      : requestInfo.category === "supplies"
                        ? "Cứu trợ"
                        : requestInfo.category === "vehicle_rescue"
                          ? "Cứu hộ phương tiện"
                          : "Khác"}
                  </h3>
                  <p className="text-sm text-slate-600 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">
                      location_on
                    </span>
                    {requestInfo.province_city || requestInfo.address || "—"}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    {/* Priority từ API: urgent | high | medium | low */}
                    {requestInfo.priority === "urgent" ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600 uppercase">
                        Nguy kịch
                      </span>
                    ) : requestInfo.priority === "high" ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-600 uppercase">
                        Ưu tiên cao
                      </span>
                    ) : requestInfo.priority === "medium" ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-100 text-yellow-700 uppercase">
                        Trung bình
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 uppercase">
                        Thấp
                      </span>
                    )}
                    <span className="text-xs text-slate-400">
                      {requestInfo.created_at
                        ? new Date(requestInfo.created_at).toLocaleString(
                            "vi-VN",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )
                        : ""}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
            <div className="flex gap-3">
              <span className="material-symbols-outlined text-amber-600 flex-shrink-0">
                warning
              </span>
              <div>
                <p className="text-sm font-semibold text-amber-900 mb-1">
                  Lưu ý quan trọng
                </p>
                <p className="text-sm text-amber-700">
                  Việc từ chối yêu cầu sẽ hủy bỏ yêu cầu này và không thể hoàn
                  tác. Vui lòng xem xét kỹ trước khi xác nhận.
                </p>
              </div>
            </div>
          </div>

          {/* Reason Input */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Lý do từ chối
              <span className="text-slate-400 font-normal ml-1">
                (Tùy chọn)
              </span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập lý do từ chối yêu cầu này (nếu có)..."
              disabled={isSubmitting}
              className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none disabled:bg-slate-100 disabled:cursor-not-allowed"
              rows="4"
            />
            <p className="text-xs text-slate-500 mt-1">
              Lý do từ chối sẽ được ghi nhận để báo cáo sau này
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex gap-3">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Đang xử lý...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-sm">
                  check_circle
                </span>
                <span>Xác nhận từ chối</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelRequestModal;
