/**
 * rescueRequestService.js
 * Dịch vụ quản lý yêu cầu cứu hộ - kết nối với API requests
 *
 * Trạng thái API: new | pending_verification | verified | on_mission | completed | rejected
 * Mức độ ưu tiên API: urgent | high | medium | low
 * Danh mục API:       rescue | relief
 */

import { requestsApi } from "../api/requests";

/** Chuẩn hóa bản ghi từ BE: SĐT là phone_number; không có name — lấy từ creator (User). */
function enrichRescueRequest(r) {
  if (!r || typeof r !== "object") return r;
  const c = r.creator || {};
  const phone = String(r.phone_number ?? r.phone ?? "").trim();
  const name = (
    c.username ||
    c.email ||
    r.name ||
    r.requester_name ||
    ""
  ).trim();
  return {
    ...r,
    phone,
    name,
  };
}

const rescueRequestService = {
  /**
   * Lấy tất cả yêu cầu cứu hộ
   * API trả về: { success, data: [...], pagination: {...} }
   */
  getAllRequests: async (params = {}) => {
    try {
      const response = await requestsApi.getAll(params);
      // apiClient interceptor trả về response.data → { success, data: [], pagination }
      const requests = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
          ? response
          : [];
      return {
        success: true,
        data: requests.map(enrichRescueRequest),
        pagination: response?.pagination,
      };
    } catch (err) {
      console.error("Lỗi getAllRequests:", err);
      return { success: false, error: err.message, data: [] };
    }
  },

  /**
   * Lấy chi tiết một yêu cầu
   */
  getRequestById: async (id) => {
    try {
      const response = await requestsApi.getById(id);
      return { success: true, data: response?.data ?? response };
    } catch (err) {
      return { success: false, error: err.message, data: null };
    }
  },

  /**
   * Tiếp nhận / phê duyệt yêu cầu → status: verified
   * Yêu cầu: requireAdminOrCoordinator
   */
  approveRequest: async (id, notes = "") => {
    try {
      const response = await requestsApi.approve(id, notes);
      return {
        success: true,
        message: "Yêu cầu đã được tiếp nhận thành công",
        data: response?.data ?? response,
      };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Từ chối yêu cầu → status: rejected
   * Yêu cầu: requireAdminOrCoordinator, bắt buộc phải có reason
   */
  cancelRequest: async (id, reason = "") => {
    try {
      const response = await requestsApi.reject(id, reason);
      return {
        success: true,
        message: "Yêu cầu đã bị từ chối",
        data: response?.data ?? response,
      };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Hoàn tất nhiệm vụ → status: completed
   * Yêu cầu: requireAdminOrCoordinatorOrRescueTeam
   */
  completeRequest: async (id, notes = "") => {
    try {
      const response = await requestsApi.complete(id, notes);
      return {
        success: true,
        message: "Nhiệm vụ hoàn thành thành công",
        data: response?.data ?? response,
      };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Coordinator xác nhận báo cáo thực thi của team
   * confirmed=true  -> quay lại on_mission
   * confirmed=false -> trả về pending_verification
   */
  confirmExecution: async (id, confirmed, confirmationNotes = "") => {
    try {
      const response = await requestsApi.confirmExecution(
        id,
        confirmed,
        confirmationNotes,
      );
      return {
        success: true,
        message: "Đã xác nhận báo cáo thực thi",
        data: response?.data ?? response,
      };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Người dân xác nhận đã được hỗ trợ
   */
  confirmByCitizen: async (id, confirmed, feedbackNotes = "") => {
    try {
      const response = await requestsApi.citizenConfirmRescue(
        id,
        confirmed,
        feedbackNotes,
      );
      return {
        success: true,
        message: "Đã cập nhật xác nhận từ người dân",
        data: response?.data ?? response,
      };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Phân loại yêu cầu: cập nhật priority và category
   * Gọi PUT /api/rescue-requests/:id với { priority, category }
   */
  classifyRequest: async (id, { priority, category }) => {
    try {
      const response = await requestsApi.update(id, { priority, category });
      return { success: true, data: response?.data ?? response };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Phân công đội cứu hộ → status: on_mission
   * POST /api/rescue-requests/:id/assign-team { team_id }
   * Yêu cầu: requireAdminOrCoordinator
   */
  assignTeam: async (id, teamId) => {
    try {
      const response = await requestsApi.assignTeam(id, teamId);
      return {
        success: true,
        message: "Đã giao nhiệm vụ cho đội cứu hộ",
        data: response?.data ?? response,
      };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  deleteRequest: async (id) => {
    try {
      const response = await requestsApi.delete(id);
      return {
        success: true,
        message: "Đã xóa yêu cầu cứu hộ",
        data: response?.data ?? response,
      };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  getStats: async () => {
    try {
      const response = await requestsApi.getStats();
      return { success: true, data: response?.data ?? response };
    } catch (err) {
      return { success: false, error: err.message, data: null };
    }
  },
};

export default rescueRequestService;
