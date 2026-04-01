import apiClient from "./client";

export const requestsApi = {
  getAll: (params = {}) => apiClient.get("/rescue-requests", { params }),

  getById: (id) => apiClient.get(`/rescue-requests/${id}`),

  // Tạo yêu cầu mới (không cần đăng nhập - optionalAuth)
  create: (data) => apiClient.post("/rescue-requests", data),

  // Cập nhật thông tin yêu cầu (dùng để phân loại priority/category)
  update: (id, data) => apiClient.put(`/rescue-requests/${id}`, data),

  // Duyệt yêu cầu → status: verified
  approve: (id, notes) =>
    apiClient.post(`/rescue-requests/${id}/approve`, notes ? { notes } : {}),

  // Từ chối yêu cầu → status: rejected
  reject: (id, reason) =>
    apiClient.post(`/rescue-requests/${id}/reject`, reason ? { reason } : {}),

  // Phân công đội cứu hộ → status: on_mission
  assignTeam: (id, team_id, reason) =>
    apiClient.post(`/rescue-requests/${id}/assign-team`, {
      team_id,
      ...(reason ? { reason } : {}),
    }),

  // Hoàn tất nhiệm vụ → status: completed
  complete: (id, completion_notes) =>
    apiClient.post(`/rescue-requests/${id}/complete`, { completion_notes }),

  // Xác nhận kết quả thực thi đội cứu hộ
  confirmExecution: (id, confirmed, confirmation_notes) =>
    apiClient.post(`/rescue-requests/${id}/confirm-execution`, {
      confirmed,
      confirmation_notes,
    }),

  // Người dân xác nhận đã được hỗ trợ (hoặc phản hồi chưa hoàn tất)
  citizenConfirmRescue: (id, confirmed, feedback_notes = "") =>
    apiClient.post(`/rescue-requests/${id}/citizen-confirm-rescue`, {
      confirmed,
      feedback_notes,
    }),

  delete: (id) => apiClient.delete(`/rescue-requests/${id}`),

  getStats: () => apiClient.get("/rescue-requests/stats/summary"),

  getTacticalMapStats: () =>
    apiClient.get("/rescue-requests/stats/tactical-map"),

  /**
   * Lấy các yêu cầu cứu hộ đang trong quá trình xử lý (dùng cho xem task hiện tại của đội)
   * status: assigned | verified | on_mission | partially_completed
   */
  getActiveMissions: (params = {}) =>
    apiClient.get("/rescue-requests", {
      params: { ...params, status: "on_mission" },
    }),
};
