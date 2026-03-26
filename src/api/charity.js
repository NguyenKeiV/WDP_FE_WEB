import apiClient from "./client";

/**
 * Charity History API
 * Base: /api/charity
 */
export const charityApi = {
  /**
   * GET /api/charity/history?donor_phone=...&page=...&limit=...
   */
  getHistoryByPhone: ({ donor_phone, page = 1, limit = 20 }) =>
    apiClient.get("/charity/history", {
      params: { donor_phone, page, limit },
    }),

  /**
   * GET /api/charity/history/:phone?page=...&limit=...
   */
  getHistoryByPhonePath: (phone, { page = 1, limit = 20 } = {}) =>
    apiClient.get(`/charity/history/${phone}`, {
      params: { page, limit },
    }),
};
