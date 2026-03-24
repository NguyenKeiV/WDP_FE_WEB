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
  assignTeam: (id, team_id) =>
    apiClient.post(`/rescue-requests/${id}/assign-team`, { team_id }),

  // Hoàn tất nhiệm vụ → status: completed
  complete: (id, completion_notes) =>
    apiClient.post(`/rescue-requests/${id}/complete`, { completion_notes }),

  // Xác nhận kết quả thực thi đội cứu hộ
  confirmExecution: (id, confirmed, confirmation_notes) =>
    apiClient.post(`/rescue-requests/${id}/confirm-execution`, {
      confirmed,
      confirmation_notes,
    }),

  delete: (id) => apiClient.delete(`/rescue-requests/${id}`),

  getStats: () => apiClient.get("/rescue-requests/stats/summary"),
};
