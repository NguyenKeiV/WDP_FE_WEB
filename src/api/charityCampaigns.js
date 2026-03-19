import apiClient from "./client";

export const charityCampaignsApi = {
  createCampaign: (payload) => apiClient.post("/charity/campaigns", payload),

  getCampaigns: ({ page = 1, limit = 20, status } = {}) =>
    apiClient.get("/charity/campaigns", {
      params: { page, limit, status },
    }),

  getCampaignById: (id) => apiClient.get(`/charity/campaigns/${id}`),
};

