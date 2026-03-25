/**
 * missionService.js
 * Dịch vụ hỗ trợ quản lý nhiệm vụ cứu hộ
 * Kết nối với API rescue-requests, rescue-teams, vehicles, vehicle-requests
 *
 * Trạng thái xe (API): available | in_use | maintenance
 * Trạng thái đội (API): available | on_mission | unavailable
 */

import { requestsApi } from "../api/requests";
import { teamsApi } from "../api/teams";
import { vehiclesApi } from "../api/vehicles";
import { vehicleRequestsApi } from "../api/vehicleRequests";

const missionService = {
  /**
   * Lấy chi tiết yêu cầu cứu hộ theo ID
   */
  getMissionByRequestId: async (requestId) => {
    try {
      const response = await requestsApi.getById(requestId);
      const data = response?.data ?? response;
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message, data: null };
    }
  },

  /**
   * Kiểm tra tình trạng phương tiện (status === "available")
   */
  checkVehicleAvailability: async (vehicleId) => {
    try {
      const response = await vehiclesApi.getById(vehicleId);
      const vehicle = response?.data ?? response;
      // API dùng lowercase: available | in_use | maintenance
      const isAvailable = vehicle?.status === "available";
      return { success: true, available: isAvailable, data: vehicle };
    } catch (err) {
      return { success: false, error: err.message, available: false };
    }
  },

  /**
   * Phân công đội cứu hộ cho yêu cầu
   * POST /api/rescue-requests/:id/assign-team { team_id }
   * → Yêu cầu chuyển sang status: on_mission
   */
  assignTeam: async (requestId, teamId, reason) => {
    const tryAssign = async () =>
      await requestsApi.assignTeam(requestId, teamId, reason);

    try {
      const response = await tryAssign();
      return {
        success: true,
        message: "Đã giao đội cứu hộ thành công",
        data: response?.data ?? response,
      };
    } catch (err) {
      const msg = String(err?.message || "");
      const shouldFallbackReopen =
        msg.includes(
          "Cannot assign team to request with status 'partially_completed'",
        ) ||
        msg.includes("Cannot assign team to request with status 'verified'");

      // Tương thích với BE cũ chưa cho phép assign trực tiếp từ partially_completed/verified
      // => chuyển tạm về pending_verification rồi assign lại.
      if (shouldFallbackReopen) {
        try {
          await requestsApi.update(requestId, {
            status: "pending_verification",
            notes:
              "[Auto-reopen] FE chuyển trạng thái về pending_verification để điều phối lại đội hỗ trợ.",
          });

          const retryResponse = await tryAssign();
          return {
            success: true,
            message:
              "Đã tự động mở lại yêu cầu và điều phối đội thành công (tương thích BE hiện tại).",
            data: retryResponse?.data ?? retryResponse,
          };
        } catch (retryErr) {
          return { success: false, error: retryErr.message };
        }
      }

      return { success: false, error: err.message };
    }
  },

  /**
   * Tạo yêu cầu cấp phương tiện (Coordinator → Manager duyệt)
   * POST /api/vehicle-requests
   */
  createVehicleRequest: async ({
    rescueRequestId,
    teamId,
    vehicleType,
    quantityNeeded,
    reason,
  }) => {
    try {
      const response = await vehicleRequestsApi.create({
        rescue_request_id: rescueRequestId,
        team_id: teamId,
        vehicle_type: vehicleType,
        quantity_needed: quantityNeeded,
        reason,
      });
      return {
        success: true,
        message: "Yêu cầu phương tiện đã được gửi, chờ quản lý phê duyệt",
        data: response?.data ?? response,
      };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Lấy danh sách đội cứu hộ đang sẵn sàng
   * GET /api/rescue-teams/available
   */
  getAvailableTeams: async (params = {}) => {
    try {
      const response = await teamsApi.getAvailable(params);
      const teams = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
          ? response
          : [];
      // Defensive filter: chỉ cho phép team thực sự available
      const availableOnly = teams.filter((t) => t?.status === "available");
      return { success: true, data: availableOnly };
    } catch (err) {
      return { success: false, error: err.message, data: [] };
    }
  },

  /**
   * Lấy chi tiết yêu cầu phương tiện theo ID (dùng để poll status)
   * GET /api/vehicle-requests/:id
   */
  getVehicleRequestById: async (id) => {
    try {
      const response = await vehicleRequestsApi.getById(id);
      const data = response?.data ?? response;
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Lấy danh sách phương tiện đang sẵn sàng
   * GET /api/vehicles?status=available
   */
  getAvailableVehicles: async () => {
    try {
      const response = await vehiclesApi.getAll({ status: "available" });
      const vehicles = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
          ? response
          : [];
      return { success: true, data: vehicles };
    } catch (err) {
      return { success: false, error: err.message, data: [] };
    }
  },
};

export default missionService;
