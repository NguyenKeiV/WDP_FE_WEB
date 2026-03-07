/**
 * userService.js
 * Dịch vụ quản lý người dùng - kết nối với API users
 */

import { usersApi } from "../api/users";

/**
 * Lấy tất cả người dùng
 */
export const getAllUsers = async (params = {}) => {
  try {
    const data = await usersApi.getAll(params);
    // API có thể trả về array hoặc object có trường data/users
    const users = Array.isArray(data) ? data : data?.users || data?.data || [];
    return { success: true, data: users };
  } catch (err) {
    console.error("Lỗi getAllUsers:", err);
    return { success: false, error: err.message, data: [] };
  }
};

/**
 * Lấy thông tin người dùng theo ID
 */
export const getUserById = async (id) => {
  try {
    const data = await usersApi.getById(id);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message, data: null };
  }
};

/**
 * Cập nhật thông tin người dùng
 */
export const updateUser = async (id, updateData) => {
  try {
    const data = await usersApi.update(id, updateData);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

/**
 * Xóa người dùng
 */
export const deleteUser = async (id) => {
  try {
    const data = await usersApi.delete(id);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
};
