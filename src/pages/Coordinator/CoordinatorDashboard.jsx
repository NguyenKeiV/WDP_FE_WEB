import React, { useState, useEffect } from "react";
import Header from "../../components/coordinator/Header";
import TabBar from "../../components/coordinator/TabBar";
import StatsCards from "../../components/coordinator/StatsCards";
import SearchAndFilter from "../../components/coordinator/SearchAndFilter";
import RequestCard from "../../components/coordinator/RequestCard";
import MapSection from "../../components/coordinator/MapSection";
import EmergencyFAB from "../../components/coordinator/EmergencyFAB";
import CancelRequestModal from "../../components/coordinator/CancelRequestModal";
import RequestDetailModal from "../../components/coordinator/RequestDetailModal";
import AssignMissionModal from "../../components/coordinator/AssignMissionModal";
import useMap from "../../hooks/useMap";
import "../../assets/styles/coordinator.css";
import rescueRequestService from "../../services/rescueRequestService";
import missionService from "../../services/missionService";
import { vehicleRequestsApi } from "../../api/vehicleRequests";

const CoordinatorDashboard = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Dữ liệu từ API
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Toast notification
  const [toast, setToast] = useState(null);
  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  // Modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Trạng thái yêu cầu phương tiện: { [rescueRequestId]: { vehicleRequestId, status } }
  const [vehicleRequestStatuses, setVehicleRequestStatuses] = useState({});
  const updateVehicleRequestStatus = (
    rescueRequestId,
    vehicleRequestId,
    status,
  ) => {
    setVehicleRequestStatuses((prev) => ({
      ...prev,
      [rescueRequestId]: { vehicleRequestId, status },
    }));
  };

  // Background polling: cập nhật trạng thái yêu cầu phương tiện đang pending (dù modal đóng)
  useEffect(() => {
    const pendingEntries = Object.entries(vehicleRequestStatuses).filter(
      ([, info]) => info.status === "pending",
    );
    if (pendingEntries.length === 0) return;

    const interval = setInterval(async () => {
      for (const [rescueReqId, info] of pendingEntries) {
        const result = await missionService.getVehicleRequestById(
          info.vehicleRequestId,
        );
        if (
          result.success &&
          result.data?.status &&
          result.data.status !== info.status
        ) {
          updateVehicleRequestStatus(
            rescueReqId,
            info.vehicleRequestId,
            result.data.status,
          );
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [vehicleRequestStatuses]);

  // Map hook
  const { mapRef, flyToRequest } = useMap(requests);

  // Thống kê dựa theo giá trị status/priority từ API
  // Backend flow thực tế: new → [approve] → pending_verification → [assign-team] → on_mission → [complete] → completed
  const stats = {
    // Nguy kịch: priority === "urgent" và chưa xong/bị từ chối
    emergency: requests.filter(
      (r) =>
        r.priority === "urgent" &&
        r.status !== "completed" &&
        r.status !== "rejected",
    ).length,
    // Cứu hộ chờ xử lý: chỉ status "new"
    rescue: requests.filter(
      (r) => r.category === "rescue" && r.status === "new",
    ).length,
    // Cứu trợ chờ xử lý: chỉ status "new"
    relief: requests.filter(
      (r) => r.category === "relief" && r.status === "new",
    ).length,
    // Đang xử lý: pending_verification (đã tiếp nhận, chờ phân công đội) + on_mission (đội đang thực hiện)
    inProgress: requests.filter(
      (r) => r.status === "pending_verification" || r.status === "on_mission",
    ).length,
    completed: requests.filter((r) => r.status === "completed").length,
    cancelled: requests.filter((r) => r.status === "rejected").length,
  };

  // Fetch vehicle requests đang active → populate vehicleRequestStatuses
  const fetchActiveVehicleRequests = async () => {
    try {
      const [pendingRes, approvedRes] = await Promise.all([
        vehicleRequestsApi.getAll({ status: "pending" }),
        vehicleRequestsApi.getAll({ status: "approved" }),
      ]);
      const allActive = [
        ...(Array.isArray(pendingRes?.data) ? pendingRes.data : []),
        ...(Array.isArray(approvedRes?.data) ? approvedRes.data : []),
      ];
      if (allActive.length === 0) return;
      setVehicleRequestStatuses((prev) => {
        const updated = { ...prev };
        allActive.forEach((vr) => {
          const rescueId = vr.rescue_request_id;
          if (!rescueId) return;
          // Chỉ ghi đè nếu chưa có hoặc trạng thái mới hơn
          const priority = {
            pending: 0,
            approved: 1,
            rejected: 2,
            returned: 3,
          };
          const existingPriority = priority[updated[rescueId]?.status] ?? -1;
          const newPriority = priority[vr.status] ?? -1;
          if (newPriority >= existingPriority) {
            updated[rescueId] = {
              vehicleRequestId: vr.id,
              status: vr.status,
            };
          }
        });
        return updated;
      });
    } catch (err) {
      console.error("Error fetching active vehicle requests:", err);
    }
  };

  // Fetch data từ API
  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await rescueRequestService.getAllRequests();
      if (result.success) {
        setRequests(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error("Error in fetchRequests:", err);
      setError("Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchActiveVehicleRequests();
    const interval = setInterval(fetchRequests, 30000);
    return () => clearInterval(interval);
  }, []);

  // Helper refresh danh sách
  const refreshRequests = async () => {
    const updated = await rescueRequestService.getAllRequests();
    if (updated.success) setRequests(updated.data);
  };

  // Cập nhật status của 1 request trực tiếp trong local state
  const updateRequestStatus = (requestId, newStatus) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: newStatus } : r)),
    );
  };

  // Handlers
  const handleApproveRequest = async (requestId) => {
    try {
      const result = await rescueRequestService.approveRequest(requestId);
      if (result.success) {
        // Backend: approve đổi status new → pending_verification
        updateRequestStatus(requestId, "pending_verification");
        setActiveTab("inprogress");
        showToast("success", "Đã tiếp nhận yêu cầu thành công");
        // Đồng bộ nền với server
        refreshRequests();
      } else {
        showToast("error", result.error || "Không thể tiếp nhận yêu cầu");
      }
    } catch {
      showToast("error", "Không thể tiếp nhận yêu cầu");
    }
  };

  const handleCompleteRequest = async (requestId) => {
    try {
      const result = await rescueRequestService.completeRequest(requestId);
      if (result.success) {
        updateRequestStatus(requestId, "completed");
        setActiveTab("completed");
        showToast("success", "Nhiệm vụ đã hoàn thành thành công");
        refreshRequests();
      } else {
        showToast("error", result.error || "Không thể hoàn thành nhiệm vụ");
      }
    } catch {
      showToast("error", "Không thể hoàn thành nhiệm vụ");
    }
  };

  const handleCancelRequest = async (reason) => {
    if (!selectedRequest) return;
    const id = selectedRequest.id;
    try {
      const result = await rescueRequestService.cancelRequest(id, reason);
      if (result.success) {
        updateRequestStatus(id, "rejected");
        setActiveTab("cancelled");
        showToast("success", "Đã từ chối yêu cầu");
        refreshRequests();
      } else {
        showToast("error", result.error || "Không thể từ chối yêu cầu");
      }
    } catch {
      showToast("error", "Không thể từ chối yêu cầu");
    }
  };

  // Modal openers
  const openCancelModal = (request) => {
    setSelectedRequest(request);
    setCancelModalOpen(true);
  };
  const openDetailModal = (request) => {
    setSelectedRequest(request);
    setDetailModalOpen(true);
  };
  const openAssignModal = (request) => {
    setSelectedRequest(request);
    setAssignModalOpen(true);
  };

  // Filtered list - dùng status từ API
  const filteredRequests = requests.filter((request) => {
    // Backend flow: new → pending_verification → on_mission → completed
    // pending tab: chỉ request mới chưa xử lý
    if (activeTab === "pending" && request.status !== "new") return false;
    // inprogress tab: đã tiếp nhận (pending_verification) + đang thực hiện (on_mission)
    if (
      activeTab === "inprogress" &&
      request.status !== "pending_verification" &&
      request.status !== "on_mission"
    )
      return false;
    if (activeTab === "completed" && request.status !== "completed")
      return false;
    if (activeTab === "cancelled" && request.status !== "rejected")
      return false;

    // Tìm kiếm theo district, description, phone_number
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      (request.district || "").toLowerCase().includes(searchLower) ||
      (request.description || "").toLowerCase().includes(searchLower) ||
      (request.phone_number || "").toLowerCase().includes(searchLower) ||
      (request.creator?.username || "").toLowerCase().includes(searchLower);

    // Lọc theo category API: rescue | relief
    let matchesFilter = true;
    if (activeFilter === "rescue")
      matchesFilter = request.category === "rescue";
    else if (activeFilter === "relief")
      matchesFilter = request.category === "relief";
    else if (activeFilter !== "all")
      matchesFilter = request.category === activeFilter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-[420px] bg-white border-r border-slate-200 flex flex-col shadow-sm">
          <TabBar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            setActiveFilter={setActiveFilter}
            stats={stats}
          />

          <SearchAndFilter
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
          />

          {/* Toast Notification */}
          {toast && (
            <div
              className={`mx-4 mt-2 px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 shadow ${
                toast.type === "success"
                  ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                  : "bg-red-50 border border-red-200 text-red-700"
              }`}
            >
              <span className="material-symbols-outlined text-base">
                {toast.type === "success" ? "check_circle" : "error"}
              </span>
              {toast.msg}
            </div>
          )}

          {/* Request List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="text-slate-500 font-medium">
                  Đang tải dữ liệu...
                </p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <span className="material-symbols-outlined text-red-600 text-4xl mb-2">
                  error
                </span>
                <p className="text-red-600 font-semibold">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700"
                >
                  Thử lại
                </button>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="bg-white rounded-lg p-8 text-center">
                <span className="material-symbols-outlined text-slate-300 text-5xl mb-3">
                  inbox
                </span>
                <p className="text-slate-500 font-medium">
                  Không có yêu cầu nào
                </p>
                <p className="text-slate-400 text-sm mt-1">
                  {activeTab === "pending" && "Chưa có yêu cầu nào chờ xử lý"}
                  {activeTab === "inprogress" &&
                    "Chưa có yêu cầu nào đang xử lý"}
                  {activeTab === "completed" &&
                    "Chưa có yêu cầu nào hoàn thành"}
                  {activeTab === "cancelled" &&
                    "Chưa có yêu cầu nào bị từ chối"}
                </p>
              </div>
            ) : (
              filteredRequests.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  vehicleRequestInfo={
                    vehicleRequestStatuses[request.id] || null
                  }
                  onApprove={(id, action) =>
                    action === "complete"
                      ? handleCompleteRequest(id)
                      : handleApproveRequest(id)
                  }
                  onCancel={openCancelModal}
                  onDetail={openDetailModal}
                  onAssign={openAssignModal}
                  onFlyTo={flyToRequest}
                />
              ))
            )}
          </div>
        </aside>

        <MapSection mapRef={mapRef} />
      </main>

      <EmergencyFAB />

      {/* Modals */}
      <CancelRequestModal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={handleCancelRequest}
        requestInfo={selectedRequest}
      />
      <RequestDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        request={selectedRequest}
      />
      <AssignMissionModal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        request={selectedRequest}
        onSuccess={refreshRequests}
        onUpdateStatus={updateRequestStatus}
        vehicleRequestInfo={vehicleRequestStatuses[selectedRequest?.id] || null}
        onVehicleStatusChange={updateVehicleRequestStatus}
      />

      {/* Styles cho map markers và animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(204, 0, 0, 0.7); }
          50% { box-shadow: 0 0 0 15px rgba(204, 0, 0, 0); }
        }
        @keyframes ping {
          0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.8; }
          70% { transform: translate(-50%, -50%) scale(2.2); opacity: 0; }
          100% { transform: translate(-50%, -50%) scale(2.2); opacity: 0; }
        }
        .marker-emergency { animation: pulse 2s infinite; }
        .custom-goong-popup .mapboxgl-popup-content {
          padding: 14px 16px;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.18);
          border: 1px solid #e2e8f0;
          min-width: 230px;
        }
        .custom-goong-popup .mapboxgl-popup-tip { border-top-color: white; }
        .custom-goong-popup .mapboxgl-popup-close-button {
          font-size: 18px; color: #64748b; padding: 4px 8px; right: 4px; top: 4px;
        }
        .custom-goong-popup .mapboxgl-popup-close-button:hover {
          color: #0f172a; background: #f1f5f9; border-radius: 6px;
        }
      `}</style>
    </div>
  );
};

export default CoordinatorDashboard;
