/**
 * missionService.js
 * Dịch vụ quản lý nhiệm vụ cứu hộ (Mission Management)
 * Kết nối với API requests và teams
 */

import { requestsApi } from "../api/requests";
import { teamsApi } from "../api/teams";
import { vehiclesApi } from "../api/vehicles";

const missionService = {
  /**
   * Lấy thông tin nhiệm vụ theo ID yêu cầu cứu hộ
   */
  getMissionByRequestId: async (requestId) => {
    try {
      const data = await requestsApi.getById(requestId);
      // Lấy thông tin mission từ trong request (nếu API trả về)
      const mission = data?.mission || data;
      return { success: true, data: mission };
    } catch (err) {
      return { success: false, error: err.message, data: null };
    }
  },

  /**
   * Kiểm tra tình trạng phương tiện có sẵn sàng không
   */
  checkVehicleAvailability: async (vehicleId) => {
    try {
      const data = await vehiclesApi.getById(vehicleId);
      const isAvailable =
        data?.status === "AVAILABLE" || data?.status === "ready";
      return {
        success: true,
        data: { available: isAvailable, vehicle: data },
      };
    } catch (err) {
      return { success: false, error: err.message, data: { available: false } };
    }
  },

  /**
   * Giao đội cứu hộ cho nhiệm vụ
   */
  assignTeam: async (missionId, { teamId, missionRole, notes }) => {
    try {
      const data = await requestsApi.assignTeam(missionId, teamId);
      return {
        success: true,
        message: "Đã giao đội cứu hộ thành công",
        data,
      };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Giao phương tiện cho nhiệm vụ
   */
  assignVehicle: async (missionId, vehicleId) => {
    try {
      // Sử dụng endpoint assign-team với vehicle info
      const data = await requestsApi.approve(missionId, `vehicle:${vehicleId}`);
      return {
        success: true,
        message: "Đã giao phương tiện thành công",
        data,
      };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Lấy danh sách đội cứu hộ có sẵn
   */
  getAvailableTeams: async () => {
    try {
      const data = await teamsApi.getAvailable();
      const teams = Array.isArray(data)
        ? data
        : data?.teams || data?.data || [];
      return { success: true, data: teams };
    } catch (err) {
      return { success: false, error: err.message, data: [] };
    }
  },

  /**
   * Lấy danh sách phương tiện có sẵn
   */
  getAvailableVehicles: async () => {
    try {
      const data = await vehiclesApi.getAll({ status: "AVAILABLE" });
      const vehicles = Array.isArray(data)
        ? data
        : data?.vehicles || data?.data || [];
      return { success: true, data: vehicles };
    } catch (err) {
      return { success: false, error: err.message, data: [] };
    }
  },
};

export default missionService;
