/**
 * permissions.js
 * Định nghĩa các quyền hạn trong hệ thống
 * Phân quyền dựa trên vai trò (Role-Based Access Control)
 */

export const Permission = {
  // Quyền quản lý người dùng
  MANAGE_USERS: "MANAGE_USERS",
  VIEW_USERS: "VIEW_USERS",

  // Quyền quản lý phương tiện
  MANAGE_VEHICLES: "MANAGE_VEHICLES",
  VIEW_VEHICLES: "VIEW_VEHICLES",

  // Quyền quản lý tồn kho / vật tư
  MANAGE_INVENTORY: "MANAGE_INVENTORY",
  VIEW_INVENTORY: "VIEW_INVENTORY",

  // Quyền phân phối vật tư
  TRACK_DISTRIBUTIONS: "TRACK_DISTRIBUTIONS",
  CREATE_DISTRIBUTION: "CREATE_DISTRIBUTION",

  // Quyền báo cáo
  VIEW_RESOURCE_REPORTS: "VIEW_RESOURCE_REPORTS",
  VIEW_ADMIN_REPORTS: "VIEW_ADMIN_REPORTS",

  // Quyền điều phối cứu hộ
  COORDINATE_RESCUE: "COORDINATE_RESCUE",
  ASSIGN_TEAMS: "ASSIGN_TEAMS",
};

/**
 * Bảng phân quyền theo vai trò
 */
export const RolePermissions = {
  admin: Object.values(Permission),
  manager: [
    Permission.MANAGE_VEHICLES,
    Permission.VIEW_VEHICLES,
    Permission.MANAGE_INVENTORY,
    Permission.VIEW_INVENTORY,
    Permission.TRACK_DISTRIBUTIONS,
    Permission.CREATE_DISTRIBUTION,
    Permission.VIEW_RESOURCE_REPORTS,
    Permission.VIEW_USERS,
  ],
  coordinator: [
    Permission.COORDINATE_RESCUE,
    Permission.ASSIGN_TEAMS,
    Permission.VIEW_VEHICLES,
    Permission.VIEW_INVENTORY,
    Permission.VIEW_RESOURCE_REPORTS,
  ],
};

export default Permission;
