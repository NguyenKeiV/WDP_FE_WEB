import apiClient from "./client";

export const suppliesApi = {
  getAll: (params = {}) => apiClient.get("/supplies", { params }),
  getById: (id) => apiClient.get(`/supplies/${id}`),
  create: (data) => apiClient.post("/supplies", data),
  update: (id, data) => apiClient.put(`/supplies/${id}`, data),
  delete: (id) => apiClient.delete(`/supplies/${id}`),
  distribute: (id, data) => apiClient.post(`/supplies/${id}/distribute`, data),
  bulkDistribute: (data) => apiClient.post("/supplies/bulk-distribute", data),
  getDistributions: (params = {}) =>
    apiClient.get("/supplies/distributions", { params }),

  // Supply usages
  reportUsage: (data) => apiClient.post("/supplies/usages/report", data),
  bulkReportUsage: (data) =>
    apiClient.post("/supplies/usages/bulk-report", data),
  getMyTeamInventory: () => apiClient.get("/supplies/usages/my-team-inventory"),
  getMyTeamUsages: (params = {}) =>
    apiClient.get("/supplies/usages/my-team", { params }),
  getAllUsages: (params = {}) =>
    apiClient.get("/supplies/usages", { params }),
  getMissionUsages: (missionId) =>
    apiClient.get(`/supplies/usages/mission/${missionId}`),
  getTeamInventory: (teamId) =>
    apiClient.get(`/supplies/usages/team/${teamId}`),
};
