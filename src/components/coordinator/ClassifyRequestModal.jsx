import React, { useState, useEffect } from "react";

const PRIORITY_OPTIONS = [
  {
    value: "CRITICAL",
    label: "Nguy ká»‹ch",
    color: "text-red-600",
    bg: "bg-red-100 border-red-300",
  },
  {
    value: "HIGH",
    label: "Æ¯u tiÃªn cao",
    color: "text-orange-600",
    bg: "bg-orange-100 border-orange-300",
  },
  {
    value: "MEDIUM",
    label: "Trung bÃ¬nh",
    color: "text-yellow-600",
    bg: "bg-yellow-100 border-yellow-300",
  },
  {
    value: "NORMAL",
    label: "BÃ¬nh thÆ°á»ng",
    color: "text-blue-600",
    bg: "bg-blue-100 border-blue-300",
  },
  {
    value: "LOW",
    label: "Tháº¥p",
    color: "text-slate-500",
    bg: "bg-slate-100 border-slate-300",
  },
];

const REQUEST_TYPE_OPTIONS = [
  {
    value: "rescue",
    label: "Cá»©u há»™",
    icon: "emergency",
    color: "text-red-600",
    bg: "bg-red-50 border-red-300",
  },
  {
    value: "relief",
    label: "Cá»©u trá»£",
    icon: "volunteer_activism",
    color: "text-green-600",
    bg: "bg-green-50 border-green-300",
  },
];

const ClassifyRequestModal = ({ isOpen, onClose, onConfirm, requestInfo }) => {
  const [priority, setPriority] = useState("medium");
  const [category, setCategory] = useState("rescue");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Khi m\u1edf modal, set gi\u00e1 tr\u1ecb m\u1eb7c \u0111\u1ecbnh t\u1eeb y\u00eau c\u1ea7u hi\u1ec7n t\u1ea1i
  useEffect(() => {
    if (requestInfo) {
      setPriority(requestInfo.priority || "medium");
      setCategory(requestInfo.category || "rescue");
    }
  }, [requestInfo]);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    // Tr\u1ea3 v\u1ec1 { priority, category } \u0111\u00e9 rescueRequestService.classifyRequest s\u1eed d\u1ee5ng
    await onConfirm({ priority, category });
    setIsSubmitting(false);
    onClose();
  };

  const handleClose = () => {
    if (!isSubmitting) onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-2xl">
                  tune
                </span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  PhÃ¢n loáº¡i yÃªu cáº§u
                </h2>
                <p className="text-blue-100 text-sm">
                  XÃ¡c Ä‘á»‹nh má»©c Ä‘á»™ Æ°u tiÃªn vÃ  loáº¡i yÃªu cáº§u
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
        <div className="px-6 py-6 space-y-5">
          {/* Request Info */}
          {requestInfo && (
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-blue-600">
                    {requestInfo.category === "rescue"
                      ? "emergency"
                      : requestInfo.category === "relief"
                        ? "volunteer_activism"
                        : "help"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 mb-0.5">
                    {requestInfo.creator?.username ||
                      requestInfo.phone_number ||
                      "\u1ea8n danh"}
                    {" \u2014 "}
                    {requestInfo.category === "rescue"
                      ? "C\u1ee9u h\u1ed9"
                      : requestInfo.category === "relief"
                        ? "C\u1ee9u tr\u1ee3"
                        : "Kh\u00e1c"}
                  </h3>
                  <p className="text-sm text-slate-500 truncate">
                    \uD83D\uDCCD{" "}
                    {requestInfo.district || requestInfo.address || "\u2014"}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    🕒{" "}
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
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Priority selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              <span className="material-symbols-outlined text-base align-middle mr-1">
                flag
              </span>
              Má»©c Ä‘á»™ Æ°u tiÃªn
            </label>
            <div className="grid grid-cols-1 gap-2">
              {PRIORITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setPriority(opt.value)}
                  disabled={isSubmitting}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border-2 text-left transition-all
                    ${
                      priority === opt.value
                        ? `${opt.bg} ${opt.color} font-bold`
                        : "border-slate-200 text-slate-600 hover:border-slate-300 bg-white"
                    }`}
                >
                  <div
                    className={`w-3 h-3 rounded-full border-2 flex items-center justify-center flex-shrink-0
                    ${priority === opt.value ? "border-current" : "border-slate-400"}`}
                  >
                    {priority === opt.value && (
                      <div className="w-1.5 h-1.5 rounded-full bg-current" />
                    )}
                  </div>
                  <span className="text-sm">{opt.label}</span>
                  {priority === opt.value && (
                    <span className="ml-auto material-symbols-outlined text-base">
                      check
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Request Type selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              <span className="material-symbols-outlined text-base align-middle mr-1">
                category
              </span>
              Loáº¡i yÃªu cáº§u
            </label>
            <div className="grid grid-cols-2 gap-2">
              {REQUEST_TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setCategory(opt.value)}
                  disabled={isSubmitting}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 text-center transition-all
                    ${
                      category === opt.value
                        ? `${opt.bg} ${opt.color} font-bold`
                        : "border-slate-200 text-slate-500 hover:border-slate-300 bg-white"
                    }`}
                >
                  <span
                    className={`material-symbols-outlined text-2xl
                    ${category === opt.value ? opt.color : "text-slate-400"}`}
                  >
                    {opt.icon}
                  </span>
                  <span className="text-xs font-semibold">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex gap-3">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Há»§y bá»
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                <span>Äang lÆ°u...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-sm">save</span>
                <span>LÆ°u phÃ¢n loáº¡i</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClassifyRequestModal;
