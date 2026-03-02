import apiClient from "./client";

export const usersApi = {
  getAll: (params = {}) => apiClient.get("/users", { params }),

  getById: (id) => apiClient.get(`/users/${id}`),

  update: (id, data) => apiClient.put(`/users/${id}`, data),

  delete: (id) => apiClient.delete(`/users/${id}`),
};
