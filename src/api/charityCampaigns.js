import apiClient from "./client";

export const charityCampaignsApi = {
  createCampaign: (payload) => apiClient.post("/charity/campaigns", payload),

  getCampaigns: ({ page = 1, limit = 20, status } = {}) =>
    apiClient.get("/charity/campaigns", {
      params: { page, limit, status },
    }),

  getCampaignById: (id) => apiClient.get(`/charity/campaigns/${id}`),

  endCampaign: async (id) => {
    const attempts = [
      () => apiClient.patch(`/charity-campaigns/${id}/end`),
      () => apiClient.patch(`/charity/campaigns/${id}/end`),
    ];

    let lastError;
    for (const run of attempts) {
      try {
        return await run();
      } catch (err) {
        lastError = err;
      }
    }

    throw lastError || new Error("Không thể kết thúc đợt quyên góp");
  },
};
