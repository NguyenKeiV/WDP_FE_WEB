import apiClient from "./client";

export const suppliesApi = {
  getAll: (params = {}) => apiClient.get("/supplies", { params }),
  getById: (id) => apiClient.get(`/supplies/${id}`),
  create: (data) => apiClient.post("/supplies", data),
  update: (id, data) => apiClient.put(`/supplies/${id}`, data),
  delete: (id) => apiClient.delete(`/supplies/${id}`),
  distribute: (id, data) => apiClient.post(`/supplies/${id}/distribute`, data),
  getDistributions: (params = {}) =>
    apiClient.get("/supplies/distributions", { params }),
};
