import React, { useState, useEffect } from "react";
import Header from "../../components/coordinator/Header";
import TabBar from "../../components/coordinator/TabBar";
import StatsCards from "../../components/coordinator/StatsCards";
import SearchAndFilter from "../../components/coordinator/SearchAndFilter";
import RequestCard from "../../components/coordinator/RequestCard";
import MapSection from "../../components/coordinator/MapSection";
import EmergencyFAB from "../../components/coordinator/EmergencyFAB";
import CancelRequestModal from "../../components/coordinator/CancelRequestModal";
import ClassifyRequestModal from "../../components/coordinator/ClassifyRequestModal";
import RequestDetailModal from "../../components/coordinator/RequestDetailModal";
import AssignMissionModal from "../../components/coordinator/AssignMissionModal";
import useMap from "../../hooks/useMap";
import "../../assets/styles/coordinator.css";
import rescueRequestService from "../../services/rescueRequestService";

const CoordinatorDashboard = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Dữ liệu từ API
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [classifyModalOpen, setClassifyModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Map hook
  const { mapRef, flyToRequest } = useMap(requests);

  // Thống kê
  const stats = {
    emergency: requests.filter(
      (r) =>
        r.priority === "CRITICAL" &&
        r.status !== "COMPLETED" &&
        r.status !== "CANCELLED",
    ).length,
    rescue: requests.filter(
      (r) => r.type === "Cứu hộ khẩn cấp" && r.status === "CREATED",
    ).length,
    relief: requests.filter(
      (r) => r.type === "Hỗ trợ cứu trợ" && r.status === "CREATED",
    ).length,
    inProgress: requests.filter((r) => r.status === "IN_PROGRESS").length,
    completed: requests.filter((r) => r.status === "COMPLETED").length,
    cancelled: requests.filter((r) => r.status === "CANCELLED").length,
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
    const interval = setInterval(fetchRequests, 30000);
    return () => clearInterval(interval);
  }, []);

  // Helper refresh danh sách
  const refreshRequests = async () => {
    const updated = await rescueRequestService.getAllRequests();
    if (updated.success) setRequests(updated.data);
  };

  // Handlers
  const handleApproveRequest = async (requestId) => {
    try {
      const result = await rescueRequestService.approveRequest(requestId);
      if (result.success) {
        alert("✅ " + result.message);
        await refreshRequests();
        setTimeout(() => setActiveTab("inprogress"), 500);
      } else {
        alert("❌ " + result.error);
      }
    } catch {
      alert("❌ Không thể tiếp nhận yêu cầu");
    }
  };

  const handleCompleteRequest = async (requestId) => {
    try {
      const result = await rescueRequestService.updateRequestStatus(requestId, "COMPLETED");
      if (result.success) {
        await refreshRequests();
        setTimeout(() => setActiveTab("completed"), 500);
      } else {
        alert("❌ " + result.error);
      }
    } catch {
      alert("❌ Không thể cập nhật trạng thái");
    }
  };

  const handleCancelRequest = async (reason) => {
    if (!selectedRequest) return;
    try {
      const result = await rescueRequestService.cancelRequest(selectedRequest.id, reason);
      if (result.success) {
        alert("✅ " + result.message);
        await refreshRequests();
        setTimeout(() => setActiveTab("cancelled"), 500);
      } else {
        alert("❌ " + result.error);
      }
    } catch {
      alert("❌ Không thể từ chối yêu cầu");
    }
  };

  const handleClassifyRequest = async ({ priority, requestType }) => {
    if (!selectedRequest) return;
    try {
      const result = await rescueRequestService.classifyRequest(
        selectedRequest.id,
        { priority, requestType },
      );
      if (result.success) {
        await refreshRequests();
      } else {
        alert("❌ " + result.error);
      }
    } catch {
      alert("❌ Không thể phân loại yêu cầu");
    }
  };

  // Modal openers
  const openCancelModal = (request) => { setSelectedRequest(request); setCancelModalOpen(true); };
  const openClassifyModal = (request) => { setSelectedRequest(request); setClassifyModalOpen(true); };
  const openDetailModal = (request) => { setSelectedRequest(request); setDetailModalOpen(true); };
  const openAssignModal = (request) => { setSelectedRequest(request); setAssignModalOpen(true); };

  // Filtered list
  const filteredRequests = requests.filter((request) => {
    if (activeTab === "pending" && request.status !== "CREATED") return false;
    if (activeTab === "inprogress" && request.status !== "IN_PROGRESS") return false;
    if (activeTab === "completed" && request.status !== "COMPLETED") return false;
    if (activeTab === "cancelled" && request.status !== "CANCELLED") return false;

    const matchesSearch =
      request.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.location.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesFilter = true;
    if (activeFilter === "rescue") matchesFilter = request.type === "Cứu hộ khẩn cấp";
    else if (activeFilter === "relief") matchesFilter = request.type === "Hỗ trợ cứu trợ";
    else if (activeFilter !== "all") matchesFilter = request.category === activeFilter;

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

          <StatsCards stats={stats} />

          <SearchAndFilter
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
          />

          {/* Request List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="text-slate-500 font-medium">Đang tải dữ liệu...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <span className="material-symbols-outlined text-red-600 text-4xl mb-2">error</span>
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
                <span className="material-symbols-outlined text-slate-300 text-5xl mb-3">inbox</span>
                <p className="text-slate-500 font-medium">Không có yêu cầu nào</p>
                <p className="text-slate-400 text-sm mt-1">
                  {activeTab === "pending" && "Chưa có yêu cầu nào chờ xử lý"}
                  {activeTab === "inprogress" && "Chưa có yêu cầu nào đang xử lý"}
                  {activeTab === "completed" && "Chưa có yêu cầu nào hoàn thành"}
                  {activeTab === "cancelled" && "Chưa có yêu cầu nào bị từ chối"}
                </p>
              </div>
            ) : (
              filteredRequests.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  onApprove={(id, action) =>
                    action === "complete"
                      ? handleCompleteRequest(id)
                      : handleApproveRequest(id)
                  }
                  onCancel={openCancelModal}
                  onClassify={openClassifyModal}
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
      <ClassifyRequestModal
        isOpen={classifyModalOpen}
        onClose={() => setClassifyModalOpen(false)}
        onConfirm={handleClassifyRequest}
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