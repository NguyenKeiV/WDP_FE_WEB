/**
 * userService.js
 * Dịch vụ quản lý người dùng - kết nối với API users
 */

import { usersApi } from "../api/users";

export const getAllUsers = async (params = {}) => {
  try {
    const data = await usersApi.getAll(params);
    const users = Array.isArray(data) ? data : data?.users || data?.data || [];
    return { success: true, data: users };
  } catch (err) {
    console.error("Lỗi getAllUsers:", err);
    return { success: false, error: err.message, data: [] };
  }
};

export const getUserById = async (id) => {
  try {
    const data = await usersApi.getById(id);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message, data: null };
  }
};

export const getUserProfile = async () => {
  try {
    const data = await usersApi.getProfile();
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message, data: null };
  }
};

export const registerUser = async (userData) => {
  try {
    const data = await usersApi.register(userData);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

export const updateUser = async (id, updateData) => {
  try {
    const data = await usersApi.update(id, updateData);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

export const deleteUser = async (id) => {
  try {
    const data = await usersApi.delete(id);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
};
