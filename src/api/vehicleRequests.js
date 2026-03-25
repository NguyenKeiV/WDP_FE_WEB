import apiClient from "./client";

export const vehicleRequestsApi = {
  getAll: (params = {}) => apiClient.get("/vehicle-requests", { params }),
  getById: (id) => apiClient.get(`/vehicle-requests/${id}`),
  create: (data) => apiClient.post("/vehicle-requests", data),
  approve: (id, vehicleIds) =>
    apiClient.post(`/vehicle-requests/${id}/approve`, {
      vehicle_ids: vehicleIds,
    }),
  reject: (id, rejectReason) =>
    apiClient.post(`/vehicle-requests/${id}/reject`, {
      reject_reason: rejectReason,
    }),
  return: (id, payload) =>
    apiClient.post(`/vehicle-requests/${id}/return`, payload || {}),
};
