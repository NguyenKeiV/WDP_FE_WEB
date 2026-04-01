import apiClient from "./client";

/**
 * Volunteer Campaigns API
 * Base: /api/volunteer-campaigns
 *
 * Status: draft | published | ongoing | completed | cancelled
 * Invitation status: pending | accepted | declined
 */
export const volunteerCampaignsApi = {
  /**
   * GET / — lấy danh sách campaign (manager/admin)
   * @param {object} params - { page, limit, status, district }
   */
  list: (params = {}) =>
    apiClient.get("/volunteer-campaigns", { params }),

  /**
   * GET /:id — lấy chi tiết campaign
   * @param {string} id - UUID
   */
  getById: (id) =>
    apiClient.get(`/volunteer-campaigns/${id}`),

  /**
   * POST / — tạo campaign mới (manager/admin)
   * @param {object} data - campaign fields
   */
  create: (data) =>
    apiClient.post("/volunteer-campaigns", data),

  /**
   * PUT /:id — chỉnh sửa campaign
   * @param {string} id - UUID
   * @param {object} data - updated fields
   */
  update: (id, data) =>
    apiClient.put(`/volunteer-campaigns/${id}`, data),

  /**
   * PATCH /:id/publish — công bố campaign
   */
  publish: (id) =>
    apiClient.patch(`/volunteer-campaigns/${id}/publish`),

  /**
   * PATCH /:id/start — bắt đầu campaign
   */
  start: (id) =>
    apiClient.patch(`/volunteer-campaigns/${id}/start`),

  /**
   * PATCH /:id/complete — hoàn thành campaign
   */
  complete: (id) =>
    apiClient.patch(`/volunteer-campaigns/${id}/complete`),

  /**
   * PATCH /:id/cancel — hủy campaign
   */
  cancel: (id) =>
    apiClient.patch(`/volunteer-campaigns/${id}/cancel`),

  /**
   * GET /volunteers/approved — lấy danh sách tình nguyện viên đã duyệt (status=active)
   * @param {object} params - { page, limit, district }
   */
  listApprovedVolunteers: (params = {}) =>
    apiClient.get("/volunteer-campaigns/volunteers/approved", { params }),

  /**
   * POST /:id/invite — mời tình nguyện viên
   * @param {string} id - campaign UUID
   * @param {string[]} volunteer_user_ids - array of user UUIDs
   */
  invite: (id, volunteer_user_ids) =>
    apiClient.post(`/volunteer-campaigns/${id}/invite`, { volunteer_user_ids }),

  /**
   * GET /:id/stats — lấy thống kê phản hồi
   */
  getStats: (id) =>
    apiClient.get(`/volunteer-campaigns/${id}/stats`),

  /**
   * GET /invitations/me — citizen: lấy lời mời của mình
   * @param {object} params - { page, limit, status }
   */
  listMyInvitations: (params = {}) =>
    apiClient.get("/volunteer-campaigns/invitations/me", { params }),

  /**
   * PATCH /invitations/:id/respond — citizen: phản hồi lời mời
   * @param {string} id - invitation UUID
   * @param {object} data - { status: "accepted" | "declined", declined_reason }
   */
  respondToInvitation: (id, data) =>
    apiClient.patch(`/volunteer-campaigns/invitations/${id}/respond`, data),
};
