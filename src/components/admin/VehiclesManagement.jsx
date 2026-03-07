import React, { useState, useEffect } from "react";
import {
  getAllVehicleTypes,
  createVehicleType,
  updateVehicleType,
  deleteVehicleType,
} from "../../services/adminCatalogService";
import {
  MdDirectionsBoat,
  MdAirportShuttle,
  MdFlight,
  MdAdd,
  MdEdit,
  MdDelete,
  MdSave,
  MdClose,
  MdRefresh,
  MdWarning,
  MdInventory2,
} from "react-icons/md";

const VehiclesManagement = () => {
  // Icon mapping helper
  const getIcon = (iconName, className = "text-xl") => {
    const iconMap = {
      sailing: <MdDirectionsBoat className={className} />,
      airport_shuttle: <MdAirportShuttle className={className} />,
      flight: <MdFlight className={className} />,
      directions_boat: <MdDirectionsBoat className={className} />,
    };
    return iconMap[iconName] || <MdDirectionsBoat className={className} />;
  };

  const [vehicles, setVehicles] = useState([]);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(false);
  const [vehicleError, setVehicleError] = useState(null);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [vehicleFormData, setVehicleFormData] = useState({
    name: "",
    status: "ACTIVE",
  });
  const [isSavingVehicle, setIsSavingVehicle] = useState(false);

  // Load vehicle types from API
  useEffect(() => {
    fetchVehicleTypes();
  }, []);

  const fetchVehicleTypes = async () => {
    setIsLoadingVehicles(true);
    setVehicleError(null);
    try {
      const response = await getAllVehicleTypes();
      if (response.success && response.data) {
        const mappedVehicles = response.data.map((vehicle) => ({
          id: vehicle.id,
          name: vehicle.name,
          description: vehicle.description || "",
          icon: vehicle.icon || "sailing",
          status: vehicle.status,
        }));
        setVehicles(mappedVehicles);
      }
    } catch (error) {
      console.error("Failed to fetch vehicle types:", error);

      if (error.response?.status === 403) {
        setVehicleError(
          "Bạn không có quyền truy cập. Vui lòng đăng nhập với tài khoản Admin.",
        );
      } else if (error.response?.status === 401) {
        setVehicleError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      } else if (error.code === "ERR_NETWORK") {
        setVehicleError(
          "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.",
        );
      } else {
        setVehicleError(
          "Không thể tải danh sách phương tiện. Vui lòng thử lại.",
        );
      }
    } finally {
      setIsLoadingVehicles(false);
    }
  };

  const handleDeleteVehicle = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa phương tiện này?")) {
      try {
        await deleteVehicleType(id);
        await fetchVehicleTypes();
      } catch (error) {
        console.error("Failed to delete vehicle type:", error);
        alert("Không thể xóa phương tiện. Vui lòng thử lại.");
      }
    }
  };

  const handleOpenVehicleModal = (vehicle = null) => {
    if (vehicle) {
      setEditingItem(vehicle);
      setVehicleFormData({
        name: vehicle.name,
        status: vehicle.status,
      });
    } else {
      setEditingItem(null);
      setVehicleFormData({
        name: "",
        status: "ACTIVE",
      });
    }
    setShowVehicleModal(true);
  };

  const handleCloseVehicleModal = () => {
    setShowVehicleModal(false);
    setEditingItem(null);
    setVehicleFormData({
      name: "",
      status: "ACTIVE",
    });
  };

  const handleSaveVehicle = async (e) => {
    e.preventDefault();

    if (!vehicleFormData.name.trim()) {
      alert("Vui lòng nhập tên phương tiện");
      return;
    }

    setIsSavingVehicle(true);
    try {
      if (editingItem) {
        await updateVehicleType(editingItem.id, {
          name: vehicleFormData.name,
          status: vehicleFormData.status,
        });
      } else {
        await createVehicleType({
          name: vehicleFormData.name,
          status: vehicleFormData.status,
        });
      }

      await fetchVehicleTypes();
      handleCloseVehicleModal();
    } catch (error) {
      console.error("Failed to save vehicle type:", error);
      alert(
        `Không thể ${editingItem ? "cập nhật" : "tạo"} phương tiện. Vui lòng thử lại.`,
      );
    } finally {
      setIsSavingVehicle(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">
          Danh sách phương tiện
        </h2>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchVehicleTypes}
            disabled={isLoadingVehicles}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MdRefresh
              className={`text-lg ${isLoadingVehicles ? "animate-spin" : ""}`}
            />
            Làm mới
          </button>
          <button
            onClick={() => handleOpenVehicleModal()}
            className="px-4 py-2 bg-[#3c8cdd] hover:bg-[#2563eb] text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <MdAdd className="text-lg" />
            Thêm phương tiện
          </button>
        </div>
      </div>

      {/* Error Message */}
      {vehicleError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <MdWarning className="text-xl flex-shrink-0" />
          <p className="text-sm">{vehicleError}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoadingVehicles ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          <p className="mt-4 text-gray-600">
            Đang tải danh sách phương tiện...
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          {vehicles.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <MdInventory2 className="text-5xl mx-auto mb-3 text-gray-300" />
              <p>Chưa có phương tiện nào được cấu hình</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                    Icon
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                    Tên phương tiện
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                    Mô tả
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {vehicles.map((vehicle) => (
                  <tr
                    key={vehicle.id}
                    className="hover:bg-emerald-50/40 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center">
                        {getIcon(vehicle.icon, "text-emerald-500 text-xl")}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900 font-semibold">
                        {vehicle.name}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-600 text-sm">
                        {vehicle.description}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          vehicle.status === "ACTIVE"
                            ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                            : "bg-gray-500/10 text-gray-600 border border-gray-500/20"
                        }`}
                      >
                        {vehicle.status === "ACTIVE"
                          ? "Hoạt động"
                          : "Ngừng hoạt động"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenVehicleModal(vehicle)}
                          className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        >
                          <MdEdit className="text-lg" />
                        </button>
                        <button
                          onClick={() => handleDeleteVehicle(vehicle.id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <MdDelete className="text-lg" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Vehicle Modal */}
      {showVehicleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                {editingItem ? "Chỉnh sửa phương tiện" : "Thêm phương tiện mới"}
              </h3>
              <button
                onClick={handleCloseVehicleModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MdClose className="text-xl text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSaveVehicle} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên phương tiện <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={vehicleFormData.name}
                  onChange={(e) =>
                    setVehicleFormData({
                      ...vehicleFormData,
                      name: e.target.value,
                    })
                  }
                  placeholder="Nhập tên phương tiện"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trạng thái
                </label>
                <select
                  value={vehicleFormData.status}
                  onChange={(e) =>
                    setVehicleFormData({
                      ...vehicleFormData,
                      status: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="ACTIVE">Hoạt động</option>
                  <option value="INACTIVE">Ngừng hoạt động</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseVehicleModal}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSavingVehicle}
                  className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSavingVehicle ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <MdSave className="text-lg" />
                      {editingItem ? "Cập nhật" : "Tạo mới"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehiclesManagement;
