import apiClient from "./client";

/**
 * Volunteer Registrations API
 * Base: /api/volunteer-registrations
 *
 * Trạng thái đơn: pending | approved | active | completed | rejected | cancelled
 */
export const volunteerRegistrationsApi = {
  /**
   * GET / — lấy danh sách đơn (manager/admin)
   * @param {object} params - { page, limit, status, district }
   */
  getAll: (params = {}) =>
    apiClient.get("/volunteer-registrations", { params }),

  /**
   * GET /:id — lấy chi tiết một đơn
   * @param {string} id - UUID của đơn
   */
  getById: (id) => apiClient.get(`/volunteer-registrations/${id}`),

  /**
   * PATCH /:id/review — duyệt / từ chối / hủy đơn (manager/admin)
   * @param {string} id - UUID của đơn
   * @param {object} data - { status, coordinator_note }
   */
  review: (id, data) =>
    apiClient.patch(`/volunteer-registrations/${id}/review`, data),
};
