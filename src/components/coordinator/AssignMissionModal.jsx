import React, { useState, useEffect, useRef } from "react";
import missionService from "../../services/missionService";

// Loại phương tiện theo API
const VEHICLE_TYPES = [
  { value: "boat", label: "Xuồng máy", icon: "directions_boat" },
  { value: "car", label: "Ô tô", icon: "directions_car" },
  { value: "truck", label: "Xe tải", icon: "local_shipping" },
  { value: "helicopter", label: "Trực thăng", icon: "helicopter" },
  { value: "motorcycle", label: "Xe máy", icon: "two_wheeler" },
  { value: "other", label: "Khác", icon: "commute" },
];

const PRIORITY_CONFIG = {
  urgent: { bg: "bg-red-100", text: "text-red-700", label: "Nguy kịch" },
  high: { bg: "bg-orange-100", text: "text-orange-700", label: "Ưu tiên cao" },
  medium: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Trung bình" },
  low: { bg: "bg-slate-100", text: "text-slate-600", label: "Thấp" },
};

const CATEGORY_LABEL = {
  rescue: "Cứu hộ",
  relief: "Cứu trợ",
};

// Trạng thái yêu cầu phương tiện: pending | approved | rejected | returned
const VEHICLE_REQ_STATUS = {
  pending: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: "schedule",
    iconClass: "text-amber-500",
    textClass: "text-amber-700",
    label: "Chờ quản lý phê duyệt",
    desc: "Yêu cầu đã gửi, đang chờ Quản lý xem xét...",
    spinning: true,
  },
  approved: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    icon: "check_circle",
    iconClass: "text-emerald-500",
    textClass: "text-emerald-700",
    label: "Đã được phê duyệt ✔",
    desc: "Quản lý đã duyệt và gán phương tiện cho đội.",
    spinning: false,
  },
  rejected: {
    bg: "bg-red-50",
    border: "border-red-200",
    icon: "cancel",
    iconClass: "text-red-500",
    textClass: "text-red-700",
    label: "Bị từ chối",
    desc: "Quản lý đã từ chối yêu cầu phương tiện.",
    spinning: false,
  },
  returned: {
    bg: "bg-slate-50",
    border: "border-slate-200",
    icon: "assignment_return",
    iconClass: "text-slate-500",
    textClass: "text-slate-600",
    label: "Đã thu hồi",
    desc: "Phương tiện đã được thu hồi sau khi hoàn thành.",
    spinning: false,
  },
};

const AssignMissionModal = ({
  isOpen,
  onClose,
  request,
  onSuccess,
  onUpdateStatus,
  vehicleRequestInfo,
  onVehicleStatusChange,
}) => {
  // ── Phân công đội ──
  const [availableTeams, setAvailableTeams] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [teamAssigned, setTeamAssigned] = useState(false);
  const [loadingAssign, setLoadingAssign] = useState(false);
  const [teamError, setTeamError] = useState(null);

  // ── Yêu cầu phương tiện ──
  const [vehicleType, setVehicleType] = useState("boat");
  const [quantityNeeded, setQuantityNeeded] = useState(1);
  const [vehicleReason, setVehicleReason] = useState("");
  const [vehicleRequestDone, setVehicleRequestDone] = useState(false);
  const [vehicleRequestId, setVehicleRequestId] = useState(null);
  const [vehicleRequestStatus, setVehicleRequestStatus] = useState("pending");
  const [loadingVehicleReq, setLoadingVehicleReq] = useState(false);
  const [vehicleError, setVehicleError] = useState(null);

  // Ref để lưu interval polling
  const pollIntervalRef = useRef(null);

  // Dọn interval khi đóng modal hoặc unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  // Dừng polling khi đạt trạng thái cuối
  useEffect(() => {
    if (["approved", "rejected", "returned"].includes(vehicleRequestStatus)) {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    }
  }, [vehicleRequestStatus]);

  // Helper: bắt đầu polling trạng thái yêu cầu phương tiện
  const startPolling = (id) => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    pollIntervalRef.current = setInterval(async () => {
      const statusResult = await missionService.getVehicleRequestById(id);
      if (statusResult.success && statusResult.data?.status) {
        const newStatus = statusResult.data.status;
        setVehicleRequestStatus(newStatus);
        onVehicleStatusChange?.(request.id, id, newStatus);
      }
    }, 5000);
  };

  // Reset state khi mở modal
  useEffect(() => {
    if (isOpen && request) {
      // Reset phần phân công đội
      setAvailableTeams([]);
      setSelectedTeamId("");
      setTeamAssigned(false);
      setTeamError(null);
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }

      // Khởi tạo trạng thái yêu cầu phương tiện từ parent nếu có
      if (vehicleRequestInfo?.vehicleRequestId) {
        setVehicleRequestDone(true);
        setVehicleRequestId(vehicleRequestInfo.vehicleRequestId);
        setVehicleRequestStatus(vehicleRequestInfo.status); // hiển thị tạm cached
        setVehicleError(null);
        // Fetch trạng thái mới nhất từ backend ngay khi mở modal
        missionService
          .getVehicleRequestById(vehicleRequestInfo.vehicleRequestId)
          .then((result) => {
            if (result.success && result.data?.status) {
              const freshStatus = result.data.status;
              setVehicleRequestStatus(freshStatus);
              onVehicleStatusChange?.(
                request.id,
                vehicleRequestInfo.vehicleRequestId,
                freshStatus,
              );
              // Chỉ polling nếu vẫn còn pending
              if (freshStatus === "pending") {
                startPolling(vehicleRequestInfo.vehicleRequestId);
              }
            } else {
              // Fallback: dùng cached status, polling nếu pending
              if (vehicleRequestInfo.status === "pending") {
                startPolling(vehicleRequestInfo.vehicleRequestId);
              }
            }
          });
      } else {
        setVehicleType("boat");
        setQuantityNeeded(1);
        setVehicleReason("");
        setVehicleRequestDone(false);
        setVehicleRequestId(null);
        setVehicleRequestStatus("pending");
        setVehicleError(null);
      }

      // Backend: sau approve → status = pending_verification → cần phân công đội
      if (request.status === "pending_verification") {
        fetchAvailableTeams();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, request]);

  // Lấy danh sách đội cứu hộ sẵn sàng từ API
  const fetchAvailableTeams = async () => {
    setLoadingTeams(true);
    const result = await missionService.getAvailableTeams();
    if (result.success) {
      setAvailableTeams(result.data);
    }
    setLoadingTeams(false);
  };

  // Phân công đội → POST /api/rescue-requests/:id/assign-team { team_id }
  const handleAssignTeam = async () => {
    if (!selectedTeamId) {
      setTeamError("Vui lòng chọn một đội cứu hộ");
      return;
    }
    setLoadingAssign(true);
    setTeamError(null);
    const result = await missionService.assignTeam(request.id, selectedTeamId);
    setLoadingAssign(false);
    if (result.success) {
      setTeamAssigned(true);
      // Cập nhật local state ngay lập tức: pending_verification → on_mission
      onUpdateStatus?.(request.id, "on_mission");
      // Refresh để lấy thông tin đội được gán
      onSuccess?.();
    } else {
      setTeamError(result.error);
    }
  };

  // Tạo yêu cầu cấp phương tiện → POST /api/vehicle-requests
  const handleCreateVehicleRequest = async () => {
    if (!vehicleReason.trim()) {
      setVehicleError("Vui lòng nhập lý do yêu cầu phương tiện");
      return;
    }
    setLoadingVehicleReq(true);
    setVehicleError(null);
    const result = await missionService.createVehicleRequest({
      rescueRequestId: request.id,
      teamId: request.assigned_team_id || request.assigned_team?.id || null,
      vehicleType,
      quantityNeeded: Number(quantityNeeded),
      reason: vehicleReason,
    });
    setLoadingVehicleReq(false);
    if (result.success) {
      const createdId = result.data?.id;
      setVehicleRequestDone(true);
      setVehicleRequestId(createdId);
      setVehicleRequestStatus("pending");
      // Thông báo cho parent biết trạng thái yêu cầu phương tiện
      onVehicleStatusChange?.(request.id, createdId, "pending");
      // Bắt đầu polling để theo dõi trạng thái mỗi 5 giây
      if (createdId) {
        startPolling(createdId);
      }
    } else {
      setVehicleError(result.error);
    }
  };

  const handleDone = () => {
    onClose();
  };

  if (!isOpen || !request) return null;

  const pConfig = PRIORITY_CONFIG[request.priority] || PRIORITY_CONFIG.medium;
  const categoryLabel = CATEGORY_LABEL[request.category] || "Khác";
  // Backend: approve đổi status → pending_verification (không phải verified)
  const isVerified = request.status === "pending_verification";
  const isOnMission = request.status === "on_mission";
  const anyDone = teamAssigned || vehicleRequestDone;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* ── Header ── */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-600 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-white text-xl">
                  {isVerified ? "assignment_ind" : "directions_car"}
                </span>
              </div>
              <div>
                <h2 className="text-white font-bold text-base">
                  {isVerified ? "Phân công đội cứu hộ" : "Yêu cầu phương tiện"}
                </h2>
                <p className="text-blue-200 text-xs mt-0.5">
                  Yêu cầu #{String(request.id).substring(0, 8)} ·{" "}
                  {categoryLabel}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-blue-200 hover:text-white transition-colors p-1"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        {/* ── Request Info Banner ── */}
        <div className="px-5 py-2.5 bg-blue-50 border-b border-blue-100 flex items-center gap-2 flex-shrink-0">
          <span className="material-symbols-outlined text-blue-500 text-sm">
            location_on
          </span>
          <span className="text-sm text-slate-700 truncate flex-1 font-medium">
            {request.district || request.address || "—"}
          </span>
          <span className="text-slate-300">·</span>
          <span className="material-symbols-outlined text-slate-400 text-sm">
            phone
          </span>
          <span className="text-sm text-slate-600 truncate max-w-[120px]">
            {request.phone_number || "—"}
          </span>
          <span
            className={`flex-shrink-0 text-xs font-bold px-2 py-0.5 rounded-full ${pConfig.bg} ${pConfig.text}`}
          >
            {pConfig.label}
          </span>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* ════════════════════════════════════════════ */}
          {/* PHẦN 1: PHÂN CÔNG ĐỘI (hiện khi verified)  */}
          {/* ════════════════════════════════════════════ */}
          {isVerified && (
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-blue-600 text-base">
                      groups
                    </span>
                  </div>
                  <span className="font-bold text-slate-700 text-sm">
                    Phân công đội cứu hộ
                  </span>
                </div>
                {teamAssigned && (
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                    <span className="material-symbols-outlined text-sm">
                      check_circle
                    </span>
                    Đã phân công
                  </span>
                )}
              </div>

              <div className="p-4 space-y-3">
                {loadingTeams ? (
                  <div className="flex items-center gap-2 text-xs text-slate-400 py-3 justify-center">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></span>
                    Đang tải danh sách đội...
                  </div>
                ) : availableTeams.length === 0 ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-500 text-base">
                      warning
                    </span>
                    <span className="text-sm text-amber-700">
                      Không có đội nào đang sẵn sàng. Vui lòng thử lại sau.
                    </span>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-2">
                      Chọn đội cứu hộ <span className="text-red-500">*</span>
                    </label>
                    <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
                      {availableTeams.map((team) => (
                        <button
                          key={team.id}
                          onClick={() => {
                            setSelectedTeamId(team.id);
                            setTeamError(null);
                          }}
                          disabled={teamAssigned}
                          className={`w-full text-left px-3 py-2.5 rounded-lg border-2 transition-all text-sm
                            ${
                              selectedTeamId === team.id
                                ? "border-blue-500 bg-blue-50 text-blue-800"
                                : "border-slate-200 hover:border-blue-300 bg-white text-slate-700"
                            } disabled:opacity-60 disabled:cursor-not-allowed`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold">{team.name}</p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {team.district}
                                {team.district && " · "}
                                {team.specialization === "rescue"
                                  ? "🚨 Cứu hộ"
                                  : "🤝 Cứu trợ"}
                              </p>
                            </div>
                            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0">
                              Sẵn sàng
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {teamError && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">
                      error
                    </span>
                    {teamError}
                  </p>
                )}

                {!teamAssigned ? (
                  <button
                    onClick={handleAssignTeam}
                    disabled={
                      loadingAssign ||
                      !selectedTeamId ||
                      availableTeams.length === 0
                    }
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white py-2 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    {loadingAssign ? (
                      <>
                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                        Đang phân công...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-base">
                          groups
                        </span>
                        Phân công đội
                      </>
                    )}
                  </button>
                ) : (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-500 text-base">
                      check_circle
                    </span>
                    <span className="text-sm text-emerald-700 font-medium">
                      Phân công thành công! Yêu cầu chuyển sang "Đang thực
                      hiện".
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════ */}
          {/* PHẦN 2: YÊU CẦU PHƯƠNG TIỆN (khi on_mission)   */}
          {/* ════════════════════════════════════════════════ */}
          {isOnMission && (
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-purple-600 text-base">
                      directions_car
                    </span>
                  </div>
                  <span className="font-bold text-slate-700 text-sm">
                    Yêu cầu cấp phương tiện
                  </span>
                </div>
                {vehicleRequestDone && (
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                    <span className="material-symbols-outlined text-sm">
                      check_circle
                    </span>
                    Đã gửi
                  </span>
                )}
              </div>

              <div className="p-4 space-y-3">
                <p className="text-xs text-slate-500">
                  Yêu cầu sẽ được gửi đến Quản lý để phê duyệt và cấp phương
                  tiện phù hợp.
                </p>

                {/* Loại phương tiện */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                    Loại phương tiện <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {VEHICLE_TYPES.map((vt) => (
                      <button
                        key={vt.value}
                        onClick={() => setVehicleType(vt.value)}
                        disabled={vehicleRequestDone}
                        className={`flex flex-col items-center gap-1 py-2 rounded-lg border-2 text-xs font-semibold transition-all
                          ${
                            vehicleType === vt.value
                              ? "border-purple-500 bg-purple-50 text-purple-700"
                              : "border-slate-200 bg-white text-slate-600 hover:border-purple-300"
                          } disabled:opacity-60 disabled:cursor-not-allowed`}
                      >
                        <span className="material-symbols-outlined text-lg">
                          {vt.icon}
                        </span>
                        {vt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Số lượng */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                    Số lượng cần <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={quantityNeeded}
                    onChange={(e) => setQuantityNeeded(e.target.value)}
                    disabled={vehicleRequestDone}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-slate-100 disabled:cursor-not-allowed [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>

                {/* Lý do */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                    Lý do yêu cầu <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={vehicleReason}
                    onChange={(e) => setVehicleReason(e.target.value)}
                    disabled={vehicleRequestDone}
                    rows={2}
                    placeholder="VD: Khu vực ngập sâu 2m, cần xuồng để tiếp cận nạn nhân..."
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                  />
                </div>

                {vehicleError && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">
                      error
                    </span>
                    {vehicleError}
                  </p>
                )}

                {!vehicleRequestDone ? (
                  <button
                    onClick={handleCreateVehicleRequest}
                    disabled={loadingVehicleReq || !vehicleReason.trim()}
                    className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white py-2 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    {loadingVehicleReq ? (
                      <>
                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                        Đang gửi...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-base">
                          send
                        </span>
                        Gửi yêu cầu phương tiện
                      </>
                    )}
                  </button>
                ) : (
                  <div className="space-y-3">
                    {/* Trạng thái động */}
                    {(() => {
                      const cfg =
                        VEHICLE_REQ_STATUS[vehicleRequestStatus] ||
                        VEHICLE_REQ_STATUS.pending;
                      return (
                        <div
                          className={`rounded-lg px-4 py-3 flex items-center gap-3 border ${cfg.bg} ${cfg.border}`}
                        >
                          <span
                            className={`material-symbols-outlined text-xl flex-shrink-0 ${cfg.iconClass}`}
                          >
                            {cfg.icon}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-bold ${cfg.textClass}`}>
                              {cfg.label}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {cfg.desc}
                            </p>
                          </div>
                          {cfg.spinning && (
                            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-500 flex-shrink-0" />
                          )}
                        </div>
                      );
                    })()}
                    {/* Thông tin yêu cầu đã gửi */}
                    <div className="bg-slate-50 rounded-lg px-3 py-2 flex items-center gap-2 text-xs text-slate-500">
                      <span className="material-symbols-outlined text-sm">
                        info
                      </span>
                      Loại:{" "}
                      <span className="font-semibold text-slate-700">
                        {
                          VEHICLE_TYPES.find((v) => v.value === vehicleType)
                            ?.label
                        }
                      </span>
                      &nbsp;·&nbsp;Số lượng:{" "}
                      <span className="font-semibold text-slate-700">
                        {quantityNeeded}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Trạng thái không hợp lệ */}
          {!isVerified && !isOnMission && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-500 text-xl">
                info
              </span>
              <p className="text-sm text-amber-700">
                Hành động này không khả dụng ở trạng thái hiện tại của yêu cầu.
              </p>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex-shrink-0 px-5 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            {teamAssigned && "✅ Đội cứu hộ đã được phân công"}
            {vehicleRequestDone && "✅ Yêu cầu phương tiện đã gửi"}
            {!anyDone && "Chưa thực hiện thao tác nào"}
          </p>
          <button
            onClick={handleDone}
            className={`px-5 py-2 text-sm font-bold rounded-lg transition-colors ${
              anyDone
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-slate-600 hover:bg-slate-700 text-white"
            }`}
          >
            {anyDone ? "Hoàn tất" : "Đóng"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignMissionModal;
