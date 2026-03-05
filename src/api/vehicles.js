import apiClient from "./client";

export const vehiclesApi = {
  getAll: (params = {}) => apiClient.get("/vehicles", { params }),

  getById: (id) => apiClient.get(`/vehicles/${id}`),
};
