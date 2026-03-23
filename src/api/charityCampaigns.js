import apiClient from "./client";

export const charityCampaignsApi = {
  getAll: (params = {}) => apiClient.get("/charity-campaigns", { params }),
  getActive: () => apiClient.get("/charity-campaigns/active"),
  create: (formData) =>
    apiClient.post("/charity-campaigns", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  end: (id) => apiClient.patch(`/charity-campaigns/${id}/end`),
};
