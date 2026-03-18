/**
 * warehouseService.js
 * Dịch vụ quản lý kho hàng và vật tư cứu trợ
 * Kết nối với backend API theo tài liệu KHO_API.md
 */

import { suppliesApi } from "../api/supplies";
import { importBatchesApi } from "../api/importBatches";

// ─────────────────────────────────────────────
// TỔNG QUAN KHO
// ─────────────────────────────────────────────

/**
 * Lấy tổng quan kho: total_items, low_stock, expiring_soon, supplies[]
 */
export const getWarehouseOverview = async () => {
  try {
    const data = await importBatchesApi.getOverview();
    return { success: true, data: data?.data || data };
  } catch (err) {
    console.error("Lỗi getWarehouseOverview:", err);
    return { success: false, error: err.message, data: null };
  }
};

/**
 * Lấy tồn kho chi tiết từng lô của một mặt hàng
 * @param {string} supplyId - UUID của mặt hàng
 */
export const getStockBySupply = async (supplyId) => {
  try {
    const data = await importBatchesApi.getStock(supplyId);
    return { success: true, data: data?.data || data };
  } catch (err) {
    console.error("Lỗi getStockBySupply:", err);
    return { success: false, error: err.message, data: null };
  }
};

// ─────────────────────────────────────────────
// MẶT HÀNG (SUPPLIES)
// ─────────────────────────────────────────────

/**
 * Lấy danh sách mặt hàng (có phân trang, lọc theo category và province_city)
 * @param {object} params - { page, limit, category, province_city }
 */
export const getSupplies = async (params = {}) => {
  try {
    const data = await suppliesApi.getAll(params);
    return {
      success: true,
      data: data?.data || [],
      pagination: data?.pagination || { page: 1, totalPages: 1, total: 0 },
    };
  } catch (err) {
    console.error("Lỗi getSupplies:", err);
    return { success: false, error: err.message, data: [], pagination: {} };
  }
};

/**
 * Lấy chi tiết một mặt hàng
 * @param {string} id - UUID của mặt hàng
 */
export const getSupplyById = async (id) => {
  try {
    const data = await suppliesApi.getById(id);
    return { success: true, data: data?.data || data };
  } catch (err) {
    console.error("Lỗi getSupplyById:", err);
    return { success: false, error: err.message, data: null };
  }
};

/**
 * Tạo mặt hàng mới
 * @param {object} formData - { name*, category*, province_city*, unit?, min_quantity?, notes? }
 */
export const createSupply = async (formData) => {
  try {
    const data = await suppliesApi.create(formData);
    return { success: true, data: data?.data || data };
  } catch (err) {
    console.error("Lỗi createSupply:", err);
    return { success: false, error: err.message };
  }
};

/**
 * Cập nhật mặt hàng
 * @param {string} id - UUID của mặt hàng
 * @param {object} formData - các trường cần cập nhật
 */
export const updateSupply = async (id, formData) => {
  try {
    const data = await suppliesApi.update(id, formData);
    return { success: true, data: data?.data || data };
  } catch (err) {
    console.error("Lỗi updateSupply:", err);
    return { success: false, error: err.message };
  }
};

/**
 * Xóa mặt hàng (chỉ xóa được khi tồn kho = 0)
 * @param {string} id - UUID của mặt hàng
 */
export const deleteSupply = async (id) => {
  try {
    await suppliesApi.delete(id);
    return { success: true };
  } catch (err) {
    console.error("Lỗi deleteSupply:", err);
    return { success: false, error: err.message };
  }
};

// ─────────────────────────────────────────────
// XUẤT KHO (PHÂN PHỐI)
// ─────────────────────────────────────────────

/**
 * Xuất kho cho đội cứu hộ theo thuật toán FIFO
 * @param {string} supplyId - UUID của mặt hàng
 * @param {object} payload  - { team_id*, quantity*, notes? }
 */
export const distributeSupply = async (supplyId, payload) => {
  try {
    const data = await suppliesApi.distribute(supplyId, payload);
    return { success: true, data: data?.data || data };
  } catch (err) {
    console.error("Lỗi distributeSupply:", err);
    return { success: false, error: err.message };
  }
};

/**
 * Xuất kho hàng loạt — thử bulk endpoint trước, fallback sang từng item nếu 404
 * @param {Array} items - [{ supply_id*, team_id*, quantity*, notes? }]
 */
export const bulkDistributeSupplies = async (items) => {
  try {
    const data = await suppliesApi.bulkDistribute({ items });
    return { success: true, data: data?.data || data };
  } catch (err) {
    const is404 =
      err?.response?.status === 404 || err?.message?.includes("404");
    if (is404) {
      // Fallback: gọi từng item qua single-distribute endpoint
      const results = [];
      for (const item of items) {
        const res = await distributeSupply(item.supply_id, {
          team_id: item.team_id,
          quantity: item.quantity,
          notes: item.notes,
        });
        if (!res.success) return res;
        results.push(res.data);
      }
      return { success: true, data: results };
    }
    console.error("Lỗi bulkDistributeSupplies:", err);
    return { success: false, error: err.message };
  }
};

/**
 * Lấy danh sách phiếu xuất kho (có phân trang, lọc)
 * @param {object} params - { page, limit, team_id, supply_id }
 */
export const getDistributions = async (params = {}) => {
  try {
    const data = await suppliesApi.getDistributions(params);
    return {
      success: true,
      data: data?.data || [],
      pagination: data?.pagination || { page: 1, totalPages: 1, total: 0 },
    };
  } catch (err) {
    console.error("Lỗi getDistributions:", err);
    return { success: false, error: err.message, data: [], pagination: {} };
  }
};

// ─────────────────────────────────────────────
// ĐỢT NHẬP KHO (IMPORT BATCHES)
// ─────────────────────────────────────────────

/**
 * Lấy danh sách đợt nhập kho (có phân trang, lọc)
 * @param {object} params - { page, limit, source, status }
 */
export const getImportBatches = async (params = {}) => {
  try {
    const data = await importBatchesApi.getAll(params);
    return {
      success: true,
      data: data?.data || [],
      pagination: data?.pagination || { page: 1, totalPages: 1, total: 0 },
    };
  } catch (err) {
    console.error("Lỗi getImportBatches:", err);
    return { success: false, error: err.message, data: [], pagination: {} };
  }
};

/**
 * Lấy chi tiết một đợt nhập kho
 * @param {string} id - UUID của đợt nhập
 */
export const getImportBatchById = async (id) => {
  try {
    const data = await importBatchesApi.getById(id);
    return { success: true, data: data?.data || data };
  } catch (err) {
    console.error("Lỗi getImportBatchById:", err);
    return { success: false, error: err.message, data: null };
  }
};

/**
 * Tạo đợt nhập kho mới (status: draft)
 * @param {object} formData - { name*, source*, import_date*, donor_name?, donor_phone?, notes?, items*[] }
 */
export const createImportBatch = async (formData) => {
  try {
    const data = await importBatchesApi.create(formData);
    return { success: true, data: data?.data || data };
  } catch (err) {
    console.error("Lỗi createImportBatch:", err);
    return { success: false, error: err.message };
  }
};

/**
 * Hoàn tất đợt nhập kho (draft → completed), tồn kho được cập nhật
 * @param {string} id - UUID của đợt nhập
 */
export const completeImportBatch = async (id) => {
  try {
    const data = await importBatchesApi.complete(id);
    return { success: true, data: data?.data || data };
  } catch (err) {
    console.error("Lỗi completeImportBatch:", err);
    return { success: false, error: err.message };
  }
};

/**
 * Thêm mặt hàng vào đợt nhập (chỉ khi status = draft)
 * @param {string} batchId  - UUID của đợt nhập
 * @param {object} itemData - { supply_id*, quantity*, expiry_date?, condition?, notes? }
 */
export const addItemToBatch = async (batchId, itemData) => {
  try {
    const data = await importBatchesApi.addItem(batchId, itemData);
    return { success: true, data: data?.data || data };
  } catch (err) {
    console.error("Lỗi addItemToBatch:", err);
    return { success: false, error: err.message };
  }
};

/**
 * Xóa mặt hàng khỏi đợt nhập (chỉ khi status = draft)
 * @param {string} batchId - UUID của đợt nhập
 * @param {string} itemId  - UUID của item trong đợt nhập
 */
export const removeItemFromBatch = async (batchId, itemId) => {
  try {
    await importBatchesApi.removeItem(batchId, itemId);
    return { success: true };
  } catch (err) {
    console.error("Lỗi removeItemFromBatch:", err);
    return { success: false, error: err.message };
  }
};

// ─────────────────────────────────────────────
// BÁO CÁO SỬ DỤNG VẬT PHẨM (SUPPLY USAGES)
// ─────────────────────────────────────────────

const usageApiError = (err) => {
  const msg = err?.response?.data?.message || err?.response?.data?.error || err.message || "";
  const status = err?.response?.status;
  if (msg.includes("invalid input syntax") || msg.includes("Failed to retrieve supply") || status === 404) {
    return "API sử dụng vật phẩm chưa được triển khai trên server";
  }
  return msg;
};

/**
 * Báo cáo sử dụng 1 vật phẩm cho 1 mission
 */
export const reportSupplyUsage = async (data) => {
  try {
    const res = await suppliesApi.reportUsage(data);
    return { success: true, data: res?.data || res };
  } catch (err) {
    console.error("Lỗi reportSupplyUsage:", err);
    return { success: false, error: usageApiError(err) };
  }
};

/**
 * Báo cáo hàng loạt vật phẩm cho 1 mission
 */
export const bulkReportSupplyUsage = async (data) => {
  try {
    const res = await suppliesApi.bulkReportUsage(data);
    return { success: true, data: res?.data || res };
  } catch (err) {
    console.error("Lỗi bulkReportSupplyUsage:", err);
    return { success: false, error: usageApiError(err) };
  }
};

/**
 * Lấy tồn kho của đội mình (cho team member)
 */
export const getMyTeamInventory = async () => {
  try {
    const res = await suppliesApi.getMyTeamInventory();
    return { success: true, data: res?.data || res };
  } catch (err) {
    console.error("Lỗi getMyTeamInventory:", err);
    return { success: false, error: usageApiError(err), data: [] };
  }
};

/**
 * Lấy lịch sử sử dụng vật phẩm của đội mình
 */
export const getMyTeamUsages = async (params = {}) => {
  try {
    const res = await suppliesApi.getMyTeamUsages(params);
    return { success: true, data: res?.data || res };
  } catch (err) {
    console.error("Lỗi getMyTeamUsages:", err);
    return { success: false, error: usageApiError(err), data: [] };
  }
};

/**
 * Lấy danh sách tất cả usage (admin/manager/coordinator)
 */
export const getAllUsages = async (params = {}) => {
  try {
    const res = await suppliesApi.getAllUsages(params);
    return { success: true, data: res?.data || res };
  } catch (err) {
    console.error("Lỗi getAllUsages:", err);
    return { success: false, error: usageApiError(err), data: [] };
  }
};

/**
 * Lấy usage report cho 1 nhiệm vụ cụ thể
 */
export const getMissionUsages = async (missionId) => {
  try {
    const res = await suppliesApi.getMissionUsages(missionId);
    return { success: true, data: res?.data || res };
  } catch (err) {
    console.error("Lỗi getMissionUsages:", err);
    return { success: false, error: usageApiError(err), data: [] };
  }
};

/**
 * Lấy tồn kho của 1 đội bất kỳ (manager/admin xem)
 */
export const getTeamInventory = async (teamId) => {
  try {
    const res = await suppliesApi.getTeamInventory(teamId);
    return { success: true, data: res?.data || res };
  } catch (err) {
    console.error("Lỗi getTeamInventory:", err);
    return { success: false, error: usageApiError(err), data: [] };
  }
};

// ─────────────────────────────────────────────
// CÁC HÀM CŨ (backward-compatible) – deprecated
// ─────────────────────────────────────────────

/** @deprecated Sử dụng getSupplies() thay thế */
export const getAllWarehouses = getSupplies;

/** @deprecated Sử dụng distributeSupply() thay thế */
export const inventoryOut = (warehouseId, itemId, amount) =>
  distributeSupply(itemId, { quantity: amount });

/** @deprecated Sử dụng createImportBatch() thay thế */
export const inventoryIn = (warehouseId, itemData) =>
  createImportBatch(itemData);

/** @deprecated Sử dụng getDistributions() thay thế */
export const getDistributionHistory = getDistributions;
