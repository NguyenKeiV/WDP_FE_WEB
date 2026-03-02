import apiClient from "./client";

export const requestsApi = {
  getAll: (params = {}) => apiClient.get("/rescue-requests", { params }),

  getById: (id) => apiClient.get(`/rescue-requests/${id}`),

  approve: (id, notes) =>
    apiClient.post(`/rescue-requests/${id}/approve`, { notes }),

  reject: (id, reason) =>
    apiClient.post(`/rescue-requests/${id}/reject`, { reason }),

  assignTeam: (id, team_id) =>
    apiClient.post(`/rescue-requests/${id}/assign-team`, { team_id }),

  complete: (id, completion_notes) =>
    apiClient.post(`/rescue-requests/${id}/complete`, { completion_notes }),

  getStats: () => apiClient.get("/rescue-requests/stats/summary"),
};
