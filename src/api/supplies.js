import apiClient from "./client";

export const suppliesApi = {
  getAll: (params = {}) => apiClient.get("/supplies", { params }),

  getById: (id) => apiClient.get(`/supplies/${id}`),

  getDistributions: (params = {}) =>
    apiClient.get("/supplies/distributions", { params }),
};
