import apiClient from "./client";

export const usersApi = {
  getAll: (params = {}) => apiClient.get("/users", { params }),

  getById: (id) => apiClient.get(`/users/${id}`),

  getProfile: () => apiClient.get("/users/profile"),

  register: (data) => apiClient.post("/users/register", data),

  update: (id, data) => apiClient.put(`/users/${id}`, data),

  delete: (id) => apiClient.delete(`/users/${id}`),

  // Backend creates user + sends SMTP email — 180s timeout is set globally in client.js.
  createTeamLeader: (data) =>
    apiClient.post("/users/admin/team-leaders", data),
};
