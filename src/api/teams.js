import apiClient from "./client";

export const teamsApi = {
  getAll: (params = {}) => apiClient.get("/rescue-teams", { params }),

  getAvailable: (params = {}) =>
    apiClient.get("/rescue-teams/available", { params }),

  getById: (id) => apiClient.get(`/rescue-teams/${id}`),
};
