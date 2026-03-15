import apiClient from "./client";

/**
 * API Quản lý Đợt nhập kho (Import Batches)
 * Base: /api/import-batches
 * Quyền: xem: admin, coordinator, manager | tạo/sửa/xóa: manager, admin
 */
export const importBatchesApi = {
  /**
   * Tổng quan kho: total_items, low_stock, expiring_soon, supplies[]
   */
  getOverview: () => apiClient.get("/import-batches/overview"),

  /**
   * Tồn kho chi tiết theo mặt hàng (từng lô, expiring_soon)
   * @param {string} supplyId - UUID của mặt hàng
   */
  getStock: (supplyId) => apiClient.get(`/import-batches/stock/${supplyId}`),

  /**
   * Lấy danh sách đợt nhập kho (có phân trang, lọc)
   * @param {object} params - { page, limit, source, status }
   */
  getAll: (params = {}) => apiClient.get("/import-batches", { params }),

  /**
   * Lấy chi tiết một đợt nhập kho
   * @param {string} id - UUID của đợt nhập
   */
  getById: (id) => apiClient.get(`/import-batches/${id}`),

  /**
   * Tạo đợt nhập kho mới (status: draft)
   * @param {object} data - { name*, source*, import_date*, donor_name?, donor_phone?, notes?, items*[] }
   */
  create: (data) => apiClient.post("/import-batches", data),

  /**
   * Hoàn tất đợt nhập → trạng thái: completed, tồn kho được cập nhật
   * @param {string} id - UUID của đợt nhập
   */
  complete: (id) => apiClient.post(`/import-batches/${id}/complete`),

  /**
   * Thêm mặt hàng vào đợt nhập đang ở trạng thái draft
   * @param {string} id - UUID của đợt nhập
   * @param {object} data - { supply_id*, quantity*, expiry_date?, condition?, notes? }
   */
  addItem: (id, data) => apiClient.post(`/import-batches/${id}/items`, data),

  /**
   * Xóa mặt hàng khỏi đợt nhập đang ở trạng thái draft
   * @param {string} id - UUID của đợt nhập
   * @param {string} itemId - UUID của item trong đợt nhập
   */
  removeItem: (id, itemId) =>
    apiClient.delete(`/import-batches/${id}/items/${itemId}`),
};
