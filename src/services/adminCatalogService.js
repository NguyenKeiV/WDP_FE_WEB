/**
 * adminCatalogService.js
 * Dịch vụ quản lý danh mục dành cho Admin
 * - Loại phương tiện (Vehicle Types)
 * - Vật tư / nhu yếu phẩm (Supply Items)
 */

import { vehiclesApi } from "../api/vehicles";
import { suppliesApi } from "../api/supplies";

// ============================================
// VEHICLE TYPES - Quản lý loại phương tiện
// ============================================

/**
 * Lấy tất cả loại phương tiện
 */
export const getAllVehicleTypes = async () => {
  try {
    const data = await vehiclesApi.getAll();
    const items = Array.isArray(data)
      ? data
      : data?.vehicleTypes || data?.data || [];
    return { success: true, data: items };
  } catch (err) {
    console.error("Lỗi getAllVehicleTypes:", err);
    return { success: false, error: err.message, data: [] };
  }
};

/**
 * Tạo mới loại phương tiện
 */
export const createVehicleType = async (vehicleTypeData) => {
  try {
    const data = await vehiclesApi.create(vehicleTypeData);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

/**
 * Cập nhật loại phương tiện
 */
export const updateVehicleType = async (id, vehicleTypeData) => {
  try {
    const data = await vehiclesApi.update(id, vehicleTypeData);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

/**
 * Xóa loại phương tiện
 */
export const deleteVehicleType = async (id) => {
  try {
    const data = await vehiclesApi.delete(id);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

// ============================================
// SUPPLY ITEMS - Quản lý danh mục vật tư
// ============================================

/**
 * Lấy tất cả vật tư / nhu yếu phẩm
 */
export const getAllItems = async () => {
  try {
    const data = await suppliesApi.getAll();
    const items = Array.isArray(data)
      ? data
      : data?.supplies || data?.items || data?.data || [];
    return { success: true, data: items };
  } catch (err) {
    console.error("Lỗi getAllItems:", err);
    return { success: false, error: err.message, data: [] };
  }
};

/**
 * Tạo mới vật tư
 */
export const createItem = async (itemData) => {
  try {
    const data = await suppliesApi.create(itemData);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

/**
 * Cập nhật vật tư
 */
export const updateItem = async (id, itemData) => {
  try {
    const data = await suppliesApi.update(id, itemData);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

/**
 * Xóa vật tư
 */
export const deleteItem = async (id) => {
  try {
    const data = await suppliesApi.delete(id);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
};
