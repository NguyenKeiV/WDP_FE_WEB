import apiClient from "./client";

export const vehiclesApi = {
  getAll: (params = {}) => apiClient.get("/vehicles", { params }),
  getById: (id) => apiClient.get(`/vehicles/${id}`),
  create: (data) => apiClient.post("/vehicles", data),
  update: (id, data) => apiClient.put(`/vehicles/${id}`, data),
  delete: (id) => apiClient.delete(`/vehicles/${id}`),
};
