import React, { useState } from "react";

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

const parseTeamExecutionReport = (notes) => {
  if (!notes || typeof notes !== "string") return null;

  const lines = notes.split("\n");
  const start = lines.findIndex(
    (l) => l.trim() === "--- Team execution report ---",
  );
  if (start === -1) return null;

  const nextHeader = lines.findIndex(
    (l, i) => i > start && l.trim().startsWith("--- "),
  );
  const section =
    nextHeader === -1 ? lines.slice(start + 1) : lines.slice(start + 1, nextHeader);

  let executed = null;
  let reportNotes = "";
  let mediaUrls = [];

  const executedLine = section.find((l) => l.trim().startsWith("executed:"));
  if (executedLine) {
    const v = executedLine.split(":")[1]?.trim()?.toLowerCase();
    if (v === "yes") executed = true;
    if (v === "no") executed = false;
  }

  const notesLine = section.find((l) => l.trim().startsWith("notes:"));
  if (notesLine) {
    reportNotes = notesLine.replace(/^\s*notes:\s*/i, "").trim();
  }

  const mediaStart = section.findIndex((l) => l.trim() === "media:");
  if (mediaStart !== -1) {
    mediaUrls = section
      .slice(mediaStart + 1)
      .map((l) => l.trim())
      .filter(Boolean)
      .filter((u) => /^https?:\/\//i.test(u));
  }

  return {
    executed,
    notes: reportNotes,
    mediaUrls: Array.from(new Set(mediaUrls)),
  };
};

const parseCoordinatorConfirmation = (notes) => {
  if (!notes || typeof notes !== "string") return null;
  const lines = notes.split("\n");
  const start = lines.findIndex(
    (l) => l.trim() === "--- Coordinator confirmation ---",
  );
  if (start === -1) return null;

  const nextHeader = lines.findIndex(
    (l, i) => i > start && l.trim().startsWith("--- "),
  );
  const section =
    nextHeader === -1 ? lines.slice(start + 1) : lines.slice(start + 1, nextHeader);

  let confirmed = null;
  let confirmNotes = "";

  const confirmedLine = section.find((l) => l.trim().startsWith("confirmed:"));
  if (confirmedLine) {
    const v = confirmedLine.split(":")[1]?.trim()?.toLowerCase();
    if (v === "yes") confirmed = true;
    if (v === "no") confirmed = false;
  }

  const notesLine = section.find((l) => l.trim().startsWith("notes:"));
  if (notesLine) {
    confirmNotes = notesLine.replace(/^\s*notes:\s*/i, "").trim();
  }

  return { confirmed, notes: confirmNotes };
};

const RequestDetailModal = ({ isOpen, onClose, request }) => {
  const [viewingImage, setViewingImage] = useState(null);

  if (!isOpen || !request) return null;

  const priority =
    PRIORITY_CONFIG[request.priority] || PRIORITY_CONFIG["medium"];
  const status = STATUS_CONFIG[request.status] || STATUS_CONFIG["new"];
  const reqType = TYPE_CONFIG[request.category] || TYPE_CONFIG["rescue"];

  const senderName = request.creator?.username || "Người dùng ẩn danh";
  const phoneNumber = request.phone_number || "—";
  const locationText =
    request.district ||
    (request.location_type === "manual" ? request.address : null) ||
    "—";

  const mediaUrls = Array.isArray(request.media_urls)
    ? request.media_urls.filter(Boolean)
    : [];
  const completionMediaUrls = (() => {
    const candidates = [
      request.completion_media_urls,
      request.completed_media_urls,
      request.completion_images,
      request.completed_images,
      request.result_media_urls,
      request.completion_media,
      request.completed_media,
      request.completion?.media_urls,
      request.completion?.mediaUrls,
      request.completion?.images,
      request.completion_report?.media_urls,
      request.completion_report?.images,
      request.mission_report?.media_urls,
      request.mission_report?.images,
      request.assigned_team_report?.media_urls,
      request.assigned_team_report?.images,
    ];

    const urls = candidates
      .flatMap((v) => (Array.isArray(v) ? v : []))
      .filter(Boolean);
    return Array.from(new Set(urls));
  })();
  const teamExecutionReport = parseTeamExecutionReport(request.notes);
  const coordinatorConfirmation = parseCoordinatorConfirmation(request.notes);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4 flex-shrink-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={
                    "w-11 h-11 " +
                    reqType.bg +
                    " rounded-xl flex items-center justify-center flex-shrink-0"
                  }
                >
                  <span
                    className={
                      "material-symbols-outlined text-2xl " + reqType.color
                    }
                  >
                    {reqType.icon}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={
                        "text-xs font-bold px-2 py-0.5 rounded-full " +
                        status.bg +
                        " " +
                        status.text
                      }
                    >
                      <span className="material-symbols-outlined text-xs align-middle mr-0.5">
                        {status.icon}
                      </span>
                      {status.label}
                    </span>
                    <span
                      className={
                        "text-xs font-bold px-2 py-0.5 rounded-full " +
                        priority.bg +
                        " " +
                        priority.text
                      }
                    >
                      {priority.label}
                    </span>
                  </div>
                  <h2 className="text-white font-bold text-base leading-tight">
                    {"Yêu cầu #" +
                      String(request.id).substring(0, 8) +
                      " — " +
                      reqType.label}
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

          {/* Body */}
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
                  <span className="text-blue-600 font-semibold">
                    {phoneNumber}
                  </span>
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
                    className={
                      "inline-flex items-center gap-1.5 font-semibold " +
                      reqType.color
                    }
                  >
                    <span className="material-symbols-outlined text-base">
                      {reqType.icon}
                    </span>
                    {reqType.label}
                  </span>
                </Row>
                <Row icon="flag" label="Mức độ ưu tiên">
                  <span
                    className={
                      "inline-flex items-center gap-1.5 font-semibold " +
                      priority.text
                    }
                  >
                    <span
                      className={"w-2.5 h-2.5 rounded-full " + priority.dot}
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

            {/* Hình ảnh đính kèm */}
            {mediaUrls.length > 0 && (
              <div className="mb-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                  {"Hình ảnh đính kèm (" + mediaUrls.length + ")"}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {mediaUrls.map((url, index) => (
                    <div
                      key={index}
                      className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 relative"
                    >
                      {/\.(mp4|webm|ogg)$/i.test(url) ? (
                        <video
                          src={url}
                          controls
                          className="w-full h-40 object-cover"
                        />
                      ) : (
                        <div className="relative w-full h-40">
                          <img
                            src={url}
                            alt={"Anh " + (index + 1)}
                            className="w-full h-40 object-cover hover:opacity-90 transition-opacity cursor-pointer"
                            onClick={() => setViewingImage(url)}
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                              const fallback =
                                e.currentTarget.parentNode.querySelector(
                                  ".img-fallback",
                                );
                              if (fallback) fallback.style.display = "flex";
                            }}
                          />
                          <div
                            className="img-fallback w-full h-40 items-center justify-center text-slate-400 text-sm flex-col gap-2 bg-slate-100"
                            style={{
                              display: "none",
                              position: "absolute",
                              top: 0,
                              left: 0,
                            }}
                          >
                            <span className="material-symbols-outlined text-3xl">
                              broken_image
                            </span>
                            <span>Không tải được ảnh</span>
                          </div>
                          <button
                            onClick={() => setViewingImage(url)}
                            className="absolute top-2 right-2 w-7 h-7 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors"
                          >
                            <span className="material-symbols-outlined text-white text-sm">
                              zoom_in
                            </span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hình ảnh báo cáo hoàn thành (đội cứu hộ upload) */}
            {completionMediaUrls.length > 0 && (
              <div className="mb-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                  {"Hình ảnh hoàn thành (" + completionMediaUrls.length + ")"}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {completionMediaUrls.map((url, index) => (
                    <div
                      key={index}
                      className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 relative"
                    >
                      {/\.(mp4|webm|ogg)$/i.test(url) ? (
                        <video
                          src={url}
                          controls
                          className="w-full h-40 object-cover"
                        />
                      ) : (
                        <div className="relative w-full h-40">
                          <img
                            src={url}
                            alt={"Anh hoan thanh " + (index + 1)}
                            className="w-full h-40 object-cover hover:opacity-90 transition-opacity cursor-pointer"
                            onClick={() => setViewingImage(url)}
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                              const fallback =
                                e.currentTarget.parentNode.querySelector(
                                  ".img-fallback",
                                );
                              if (fallback) fallback.style.display = "flex";
                            }}
                          />
                          <div
                            className="img-fallback w-full h-40 items-center justify-center text-slate-400 text-sm flex-col gap-2 bg-slate-100"
                            style={{
                              display: "none",
                              position: "absolute",
                              top: 0,
                              left: 0,
                            }}
                          >
                            <span className="material-symbols-outlined text-3xl">
                              broken_image
                            </span>
                            <span>Không tải được ảnh</span>
                          </div>
                          <button
                            onClick={() => setViewingImage(url)}
                            className="absolute top-2 right-2 w-7 h-7 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors"
                          >
                            <span className="material-symbols-outlined text-white text-sm">
                              zoom_in
                            </span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Báo cáo thực thi từ team (đọc từ notes chuẩn hóa) */}
            {teamExecutionReport && (
              <div className="mb-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Báo cáo từ đội cứu hộ
                </h3>
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                        teamExecutionReport.executed === true
                          ? "bg-emerald-100 text-emerald-700"
                          : teamExecutionReport.executed === false
                            ? "bg-red-100 text-red-700"
                            : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {teamExecutionReport.executed === true
                        ? "Đã thực hiện"
                        : teamExecutionReport.executed === false
                          ? "Không thực hiện được"
                          : "Chưa rõ trạng thái"}
                    </span>
                  </div>

                  {teamExecutionReport.notes && (
                    <div>
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1">
                        Nội dung báo cáo
                      </p>
                      <p className="text-sm text-slate-800 leading-relaxed">
                        {teamExecutionReport.notes}
                      </p>
                    </div>
                  )}

                  {teamExecutionReport.mediaUrls.length > 0 && (
                    <div>
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2">
                        {`Hình ảnh đội gửi (${teamExecutionReport.mediaUrls.length})`}
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {teamExecutionReport.mediaUrls.map((url, index) => (
                          <div
                            key={index}
                            className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 relative"
                          >
                            <div className="relative w-full h-40">
                              <img
                                src={url}
                                alt={`team-report-${index + 1}`}
                                className="w-full h-40 object-cover hover:opacity-90 transition-opacity cursor-pointer"
                                onClick={() => setViewingImage(url)}
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                  const fallback =
                                    e.currentTarget.parentNode.querySelector(
                                      ".img-fallback",
                                    );
                                  if (fallback) fallback.style.display = "flex";
                                }}
                              />
                              <div
                                className="img-fallback w-full h-40 items-center justify-center text-slate-400 text-sm flex-col gap-2 bg-slate-100"
                                style={{
                                  display: "none",
                                  position: "absolute",
                                  top: 0,
                                  left: 0,
                                }}
                              >
                                <span className="material-symbols-outlined text-3xl">
                                  broken_image
                                </span>
                                <span>Không tải được ảnh</span>
                              </div>
                              <button
                                onClick={() => setViewingImage(url)}
                                className="absolute top-2 right-2 w-7 h-7 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors"
                              >
                                <span className="material-symbols-outlined text-white text-sm">
                                  zoom_in
                                </span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {coordinatorConfirmation && (
                    <div className="pt-1 border-t border-slate-200">
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1">
                        Xác nhận của điều phối viên
                      </p>
                      <p className="text-sm text-slate-700">
                        {coordinatorConfirmation.confirmed === true
                          ? "Đã xác nhận báo cáo thực thi"
                          : coordinatorConfirmation.confirmed === false
                            ? "Không xác nhận báo cáo thực thi"
                            : "Đã cập nhật xác nhận"}
                      </p>
                      {coordinatorConfirmation.notes && (
                        <p className="text-sm text-slate-800 mt-1 leading-relaxed">
                          {coordinatorConfirmation.notes}
                        </p>
                      )}
                    </div>
                  )}
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

      {/* Modal xem ảnh fullscreen */}
      {viewingImage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95"
          onClick={() => setViewingImage(null)}
        >
          <button
            onClick={() => setViewingImage(null)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-white">close</span>
          </button>
          <img
            src={viewingImage}
            alt="Xem anh"
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          <a
            href={viewingImage}
            target="_blank"
            rel="noreferrer"
            className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-xl transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="material-symbols-outlined text-base">
              open_in_new
            </span>
            Mo trong tab moi
          </a>
        </div>
      )}
    </>
  );
};

export default RequestDetailModal;
