import apiClient from "./client";

/**
 * API Quản lý Đội Cứu Hộ
 * Base: /api/rescue-teams
 * Quyền: manager / admin
 *
 * Trạng thái đội: available | on_mission | unavailable
 * Chuyên môn:     rescue | relief
 */
export const teamsApi = {
  /**
   * Lấy danh sách tất cả đội
   * @param {object} params - { page, limit, status, specialization, province_city }
   */
  getAll: (params = {}) => apiClient.get("/rescue-teams", { params }),

  /**
   * Lấy danh sách đội đang rảnh (available)
   * @param {object} params - { province_city, specialization }
   */
  getAvailable: (params = {}) =>
    apiClient.get("/rescue-teams/available", { params }),

  /**
   * Lấy chi tiết một đội
   * @param {string} id - UUID của đội
   */
  getById: (id) => apiClient.get(`/rescue-teams/${id}`),

  /**
   * Tạo đội mới
   * @param {object} data - { name*, phone_number*, district*, user_id*, capacity*, specialization?, available_members?, notes? }
   */
  create: (data) => apiClient.post("/rescue-teams", data),

  /**
   * Cập nhật thông tin đội
   * @param {string} id - UUID của đội
   * @param {object} data - các trường cần cập nhật
   */
  update: (id, data) => apiClient.put(`/rescue-teams/${id}`, data),

  /**
   * Xóa đội (soft delete, không xóa được khi đang on_mission)
   * @param {string} id - UUID của đội
   */
  delete: (id) => apiClient.delete(`/rescue-teams/${id}`),
};
