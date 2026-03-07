/**
 * rescueRequestService.js
 * Dịch vụ quản lý yêu cầu cứu hộ - kết nối với API requests
 */

import { requestsApi } from "../api/requests";

const rescueRequestService = {
  /**
   * Lấy tất cả yêu cầu cứu hộ
   */
  getAllRequests: async (params = {}) => {
    try {
      const data = await requestsApi.getAll(params);
      const requests = Array.isArray(data)
        ? data
        : data?.requests || data?.data || [];
      return { success: true, data: requests };
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
      const data = await requestsApi.getById(id);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message, data: null };
    }
  },

  /**
   * Tiếp nhận / phê duyệt yêu cầu
   */
  approveRequest: async (id, notes = "") => {
    try {
      const data = await requestsApi.approve(id, notes);
      return {
        success: true,
        message: "Yêu cầu đã được tiếp nhận thành công",
        data,
      };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Từ chối / hủy yêu cầu
   */
  cancelRequest: async (id, reason = "") => {
    try {
      const data = await requestsApi.reject(id, reason);
      return { success: true, message: "Yêu cầu đã bị từ chối", data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Cập nhật trạng thái yêu cầu (hoàn thành, v.v.)
   */
  updateRequestStatus: async (id, status, notes = "") => {
    try {
      let data;
      if (status === "COMPLETED") {
        data = await requestsApi.complete(id, notes);
      } else {
        data = await requestsApi.approve(id, notes);
      }
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Phân loại yêu cầu (mức độ ưu tiên, loại yêu cầu)
   */
  classifyRequest: async (id, { priority, requestType }) => {
    try {
      // Sử dụng API approve với metadata phân loại
      const data = await requestsApi.approve(
        id,
        `priority:${priority};type:${requestType}`,
      );
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Giao nhiệm vụ cho đội cứu hộ
   */
  assignTeam: async (id, teamId) => {
    try {
      const data = await requestsApi.assignTeam(id, teamId);
      return {
        success: true,
        message: "Đã giao nhiệm vụ cho đội cứu hộ",
        data,
      };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Lấy thống kê tổng hợp
   */
  getStats: async () => {
    try {
      const data = await requestsApi.getStats();
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message, data: null };
    }
  },
};

export default rescueRequestService;
