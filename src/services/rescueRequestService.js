/**
 * rescueRequestService.js
 * Dịch vụ quản lý yêu cầu cứu hộ - kết nối với API requests
 *
 * Trạng thái API: new | pending_verification | verified | on_mission | completed | rejected
 * Mức độ ưu tiên API: urgent | high | medium | low
 * Danh mục API:       rescue | relief
 */

import { requestsApi } from "../api/requests";

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
        data: requests,
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

  /**
   * Lấy thống kê tổng hợp
   * GET /api/rescue-requests/stats/summary
   */
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
