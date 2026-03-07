/**
 * usePermission.js
 * Custom hook kiểm tra quyền hạn của người dùng hiện tại
 */

import { useMemo } from "react";
import authService from "../services/authService";
import { RolePermissions } from "../constants/permissions";

export const usePermission = () => {
  const user = authService.getCurrentUser();
  const isAuthenticated = authService.isAuthenticated();
  const userRole = user?.role || null;

  /**
   * Kiểm tra người dùng có một trong các role được chỉ định không
   * @param {string[]} roles - Danh sách role cần kiểm tra
   */
  const hasRole = useMemo(
    () => (roles) => {
      if (!userRole) return false;
      return roles.includes(userRole);
    },
    [userRole],
  );

  /**
   * Kiểm tra người dùng có quyền cụ thể không
   * @param {string} permission - Quyền cần kiểm tra
   */
  const hasPermission = useMemo(
    () => (permission) => {
      if (!userRole) return false;
      const permissions = RolePermissions[userRole] || [];
      return permissions.includes(permission);
    },
    [userRole],
  );

  /**
   * Kiểm tra nhiều quyền cùng lúc (AND - phải có tất cả)
   * @param {string[]} permissions
   */
  const hasAllPermissions = useMemo(
    () => (permissions) => {
      if (!userRole) return false;
      const userPermissions = RolePermissions[userRole] || [];
      return permissions.every((p) => userPermissions.includes(p));
    },
    [userRole],
  );

  /**
   * Kiểm tra có ít nhất một trong các quyền (OR)
   * @param {string[]} permissions
   */
  const hasAnyPermission = useMemo(
    () => (permissions) => {
      if (!userRole) return false;
      const userPermissions = RolePermissions[userRole] || [];
      return permissions.some((p) => userPermissions.includes(p));
    },
    [userRole],
  );

  return {
    isAuthenticated,
    userRole,
    user,
    hasRole,
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
  };
};

export default usePermission;
