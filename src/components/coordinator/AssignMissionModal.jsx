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
  const [teamSearchQuery, setTeamSearchQuery] = useState("");
  const [reassignReason, setReassignReason] = useState("");
  const [teamScopeHint, setTeamScopeHint] = useState("");
  const [effectiveAssignedTeamId, setEffectiveAssignedTeamId] = useState("");

  // ── Yêu cầu phương tiện ──
  const [vehicleType, setVehicleType] = useState("boat");
  const [quantityNeeded, setQuantityNeeded] = useState(1);
  const [vehicleReason, setVehicleReason] = useState("");
  const [vehicleRequestDone, setVehicleRequestDone] = useState(false);
  const [vehicleRequestId, setVehicleRequestId] = useState(null);
  const [vehicleRequestStatus, setVehicleRequestStatus] = useState("pending");
  const [loadingVehicleReq, setLoadingVehicleReq] = useState(false);
  const [vehicleError, setVehicleError] = useState(null);
  const [vehicleScopeHint, setVehicleScopeHint] = useState("");

  const pollIntervalRef = useRef(null);

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (["approved", "rejected", "returned"].includes(vehicleRequestStatus)) {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    }
  }, [vehicleRequestStatus]);

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

  useEffect(() => {
    if (isOpen && request) {
      setAvailableTeams([]);
      setSelectedTeamId("");
      setTeamAssigned(false);
      setTeamError(null);
      setTeamSearchQuery("");
      setReassignReason("");
      setTeamScopeHint("");
      setEffectiveAssignedTeamId(
        String(request.assigned_team_id || request.assigned_team?.id || ""),
      );
      setVehicleScopeHint("");
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }

      const assignedTeamIdAtOpen =
        request.assigned_team_id || request.assigned_team?.id || null;

      // Chỉ hiển thị vehicle request info nếu request đang on_mission
      const isCurrentlyOnMission = request.status === "on_mission";
      const vehicleBelongsToCurrentTeam =
        isCurrentlyOnMission &&
        !!vehicleRequestInfo?.vehicleRequestId &&
        (!vehicleRequestInfo?.teamId ||
          String(vehicleRequestInfo.teamId) ===
            String(assignedTeamIdAtOpen || ""));

      if (vehicleBelongsToCurrentTeam) {
        setVehicleRequestDone(true);
        setVehicleRequestId(vehicleRequestInfo.vehicleRequestId);
        setVehicleRequestStatus(vehicleRequestInfo.status);
        setVehicleError(null);
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
              if (freshStatus === "pending") {
                startPolling(vehicleRequestInfo.vehicleRequestId);
              }
            } else {
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

      if (
        [
          "pending_verification",
          "assigned",
          "on_mission",
          "verified",
          "partially_completed",
        ].includes(request.status)
      ) {
        fetchAvailableTeams();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, request]);

  const fetchAvailableTeams = async () => {
    setLoadingTeams(true);
    setTeamScopeHint("");

    const preferredResult = await missionService.getAvailableTeams({
      district: request?.district,
      specialization: request?.category,
    });

    let normalized =
      preferredResult.success && Array.isArray(preferredResult.data)
        ? preferredResult.data.filter((team) => team?.status === "available")
        : [];

    if (normalized.length === 0) {
      const fallbackResult = await missionService.getAvailableTeams();
      normalized =
        fallbackResult.success && Array.isArray(fallbackResult.data)
          ? fallbackResult.data.filter((team) => team?.status === "available")
          : [];

      if (normalized.length > 0) {
        setTeamScopeHint(
          "Không có đội khớp quận/chuyên môn. Đang hiển thị tất cả đội đang sẵn sàng.",
        );
      }
    }

    setAvailableTeams(normalized);
    setLoadingTeams(false);
  };

  const handleAssignTeam = async () => {
    if (!selectedTeamId) {
      setTeamError("Vui lòng chọn một đội cứu hộ");
      return;
    }
    const currentAssignedTeamId = String(
      request.assigned_team_id || request.assigned_team?.id || "",
    );
    const isReassigning =
      !!currentAssignedTeamId &&
      currentAssignedTeamId !== String(selectedTeamId || "");

    const isSupplementReassign = isPartiallyCompleted || isVerifiedPartial;
    if (
      isSupplementReassign &&
      String(selectedTeamId || "") === String(currentAssignedTeamId || "")
    ) {
      setTeamError(
        "Vui lòng chọn đội khác đội hiện tại để điều phối bổ sung cho phần nhiệm vụ còn lại",
      );
      return;
    }

    if (isReassigning && !reassignReason.trim()) {
      setTeamError("Vui lòng nhập lý do điều phối lại");
      return;
    }
    setLoadingAssign(true);
    setTeamError(null);
    const result = await missionService.assignTeam(
      request.id,
      selectedTeamId,
      isReassigning ? reassignReason.trim() : undefined,
    );
    setLoadingAssign(false);
    if (result.success) {
      const newlyAssignedTeamId = String(selectedTeamId || "");
      setTeamAssigned(true);
      setReassignReason("");
      setEffectiveAssignedTeamId(newlyAssignedTeamId);
      // Sau khi đổi team, reset vehicle request (chưa cho yêu cầu cho đến khi on_mission)
      setVehicleRequestDone(false);
      setVehicleRequestId(null);
      setVehicleRequestStatus("pending");
      setVehicleReason("");
      setVehicleScopeHint("");
      onVehicleStatusChange?.(request.id, null, null, null);
      onUpdateStatus?.(request.id, "assigned");
      onSuccess?.();
    } else {
      setTeamError(result.error);
    }
  };

  const handleCreateVehicleRequest = async () => {
    if (!vehicleReason.trim()) {
      setVehicleError("Vui lòng nhập lý do yêu cầu phương tiện");
      return;
    }

    const resolvedTeamId =
      effectiveAssignedTeamId ||
      request.assigned_team_id ||
      request.assigned_team?.id ||
      selectedTeamId ||
      null;

    if (!resolvedTeamId) {
      setVehicleError(
        "Chưa có đội được phân công cho yêu cầu này. Vui lòng phân công đội trước.",
      );
      return;
    }

    setLoadingVehicleReq(true);
    setVehicleError(null);
    const result = await missionService.createVehicleRequest({
      rescueRequestId: request.id,
      teamId: resolvedTeamId,
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
      onVehicleStatusChange?.(request.id, createdId, "pending");
      onVehicleStatusChange?.(request.id, createdId, "pending", resolvedTeamId);
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

  const filteredTeams = availableTeams
    .filter((team) => team?.status === "available")
    .filter((team) => {
      if (!teamSearchQuery.trim()) return true;
      const q = teamSearchQuery.toLowerCase();
      const specLabel = team.specialization === "rescue" ? "cứu hộ" : "cứu trợ";
      return (
        (team.name || "").toLowerCase().includes(q) ||
        (team.district || "").toLowerCase().includes(q) ||
        specLabel.includes(q)
      );
    });

  const pConfig = PRIORITY_CONFIG[request.priority] || PRIORITY_CONFIG.medium;
  const categoryLabel = CATEGORY_LABEL[request.category] || "Khác";
  const canAssignTeam = [
    "pending_verification",
    "assigned",
    "on_mission",
    "verified",
    "partially_completed",
  ].includes(request.status);
  const isPendingVerification = request.status === "pending_verification";
  const isAssigned = request.status === "assigned";
  const isOnMission = request.status === "on_mission";
  const isPartiallyCompleted = request.status === "partially_completed";
  const isVerifiedPartial =
    request.status === "verified" &&
    request?.team_report?.outcome === "partially_completed";
  const unmetPeopleCount = Number(
    request?.team_report?.unmet_people_count || 0,
  );
  const partialReason =
    request?.team_report?.partial_reason ||
    request?.team_report?.report_notes ||
    "Đội đã báo cáo hoàn thành một phần, cần điều phối bổ sung.";
  const currentAssignedTeamId = String(
    effectiveAssignedTeamId ||
      request.assigned_team_id ||
      request.assigned_team?.id ||
      "",
  );
  const isTeamChanged =
    !!currentAssignedTeamId &&
    !!selectedTeamId &&
    currentAssignedTeamId !== String(selectedTeamId);

  // Chỉ cho phép yêu cầu phương tiện khi đang on_mission (team đã xác nhận)
  const canRequestVehicle = isOnMission;

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
                  {isPendingVerification ? "assignment_ind" : "directions_car"}
                </span>
              </div>
              <div>
                <h2 className="text-white font-bold text-base">
                  {isPendingVerification
                    ? "Phân công đội cứu hộ"
                    : isPartiallyCompleted || isVerifiedPartial
                      ? "Điều phối bổ sung đội hỗ trợ"
                      : isAssigned
                        ? "Điều phối lại đội cứu hộ"
                        : canAssignTeam
                          ? "Điều phối lại đội cứu hộ"
                          : "Yêu cầu phương tiện"}
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
          {(isPartiallyCompleted || isVerifiedPartial) && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <p className="text-sm font-semibold text-amber-800 mb-1">
                Nhiệm vụ đang cần điều phối bổ sung
              </p>
              <p className="text-xs text-amber-700 leading-relaxed">
                {partialReason}
              </p>
              {unmetPeopleCount > 0 && (
                <p className="text-xs text-amber-800 font-semibold mt-1">
                  Còn {unmetPeopleCount} người chưa được hỗ trợ.
                </p>
              )}
            </div>
          )}

          {/* PHẦN 1: PHÂN CÔNG ĐỘI */}
          {canAssignTeam && !isOnMission && (
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
                {/* Thông báo khi đang assigned — chỉ cho điều phối lại */}
                {isAssigned && !teamAssigned && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
                    <p className="text-xs text-amber-700 font-semibold">
                      ⏳ Đội đang chờ xác nhận nhiệm vụ
                    </p>
                    <p className="text-xs text-amber-600 mt-0.5">
                      Bạn có thể điều phối lại đội khác nếu cần.
                    </p>
                  </div>
                )}

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
                    {teamScopeHint && (
                      <div className="mb-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-xs text-blue-700">
                        {teamScopeHint}
                      </div>
                    )}
                    <label className="block text-xs font-semibold text-slate-500 mb-2">
                      Chọn đội cứu hộ <span className="text-red-500">*</span>
                    </label>
                    <div className="relative mb-2">
                      <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-base">
                        search
                      </span>
                      <input
                        type="text"
                        value={teamSearchQuery}
                        onChange={(e) => setTeamSearchQuery(e.target.value)}
                        placeholder="Tìm theo tên, quận/huyện, loại đội..."
                        className="w-full pl-8 pr-8 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {teamSearchQuery && (
                        <button
                          onClick={() => setTeamSearchQuery("")}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          <span className="material-symbols-outlined text-base">
                            close
                          </span>
                        </button>
                      )}
                    </div>
                    {filteredTeams.length === 0 ? (
                      <div className="text-center py-4 text-sm text-slate-400">
                        <span className="material-symbols-outlined text-2xl mb-1 block">
                          search_off
                        </span>
                        Không tìm thấy đội phù hợp "{teamSearchQuery}"
                      </div>
                    ) : (
                      <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
                        {filteredTeams.map((team) => {
                          const disabledCurrentTeamForSupplement =
                            (isPartiallyCompleted || isVerifiedPartial) &&
                            String(team.id) === currentAssignedTeamId;
                          return (
                            <button
                              key={team.id}
                              onClick={() => {
                                if (
                                  disabledCurrentTeamForSupplement ||
                                  teamAssigned
                                )
                                  return;
                                setSelectedTeamId(team.id);
                                setTeamError(null);
                              }}
                              disabled={
                                teamAssigned || disabledCurrentTeamForSupplement
                              }
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
                                  {disabledCurrentTeamForSupplement
                                    ? "Đội hiện tại"
                                    : team.status === "available"
                                      ? "Sẵn sàng"
                                      : team.status}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {vehicleScopeHint && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-xs text-blue-700">
                    {vehicleScopeHint}
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

                {isTeamChanged && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                      Lý do điều phối lại{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={reassignReason}
                      onChange={(e) => {
                        setReassignReason(e.target.value);
                        setTeamError(null);
                      }}
                      rows={2}
                      placeholder="Nêu rõ lý do thay đổi đội phụ trách..."
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>
                )}

                {!teamAssigned ? (
                  <button
                    onClick={handleAssignTeam}
                    disabled={
                      loadingAssign ||
                      !selectedTeamId ||
                      (isTeamChanged && !reassignReason.trim()) ||
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
                        {isPartiallyCompleted || isVerifiedPartial
                          ? "Điều phối đội hỗ trợ"
                          : "Phân công đội"}
                      </>
                    )}
                  </button>
                ) : (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-500 text-base">
                      check_circle
                    </span>
                    <span className="text-sm text-emerald-700 font-medium">
                      {isPartiallyCompleted || isVerifiedPartial
                        ? "Điều phối thành công! Đội mới đang chờ xác nhận."
                        : "Phân công thành công! Yêu cầu đang chờ đội xác nhận nhận nhiệm vụ."}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PHẦN 2: YÊU CẦU PHƯƠNG TIỆN — CHỈ HIỂN THỊ KHI on_mission */}
          {canRequestVehicle && (
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

          {/* Thông báo khi assigned — không cho yêu cầu phương tiện */}
          {isAssigned && !canRequestVehicle && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-start gap-2">
              <span className="material-symbols-outlined text-blue-500 text-xl mt-0.5">
                info
              </span>
              <div>
                <p className="text-sm font-semibold text-blue-800">
                  Yêu cầu phương tiện chưa khả dụng
                </p>
                <p className="text-xs text-blue-600 mt-0.5 leading-relaxed">
                  Đội cần xác nhận nhận nhiệm vụ trước khi có thể yêu cầu phương
                  tiện. Trạng thái sẽ chuyển sang "Đang xử lý" khi đội chấp
                  nhận.
                </p>
              </div>
            </div>
          )}

          {/* Trạng thái không hợp lệ */}
          {!canAssignTeam && !canRequestVehicle && !isAssigned && (
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
