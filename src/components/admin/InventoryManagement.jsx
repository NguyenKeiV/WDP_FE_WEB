import React, { useState, useEffect } from "react";
import {
  MdMedication,
  MdWaterDrop,
  MdRiceBowl,
  MdAdd,
  MdEdit,
  MdDelete,
  MdClose,
} from "react-icons/md";
import {
  getAllItems,
  createItem,
  updateItem,
  deleteItem,
} from "../../services/adminCatalogService";

// Modal Component
const SupplyModal = ({ isOpen, onClose, item, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    itemType: "FOOD",
    capacity: "",
    status: "ACTIVE",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || "",
        itemType: item.itemType || "FOOD",
        capacity: item.capacity || "",
        status: item.status || "ACTIVE",
      });
    } else {
      setFormData({
        name: "",
        itemType: "FOOD",
        capacity: "",
        status: "ACTIVE",
      });
    }
  }, [item]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let response;
      if (item) {
        // Update
        response = await updateItem(item.id, formData);
      } else {
        // Create
        response = await createItem(formData);
      }

      if (response.success) {
        alert(item ? "Cập nhật thành công!" : "Thêm mới thành công!");
        onSave();
        onClose();
      } else {
        alert(response.message || "Có lỗi xảy ra");
      }
    } catch (err) {
      console.error("Error saving item:", err);
      alert("Có lỗi xảy ra khi lưu dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">
            {item ? "Cập nhật nhu yếu phẩm" : "Thêm nhu yếu phẩm mới"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MdClose className="text-xl text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên nhu yếu phẩm <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Loại nhu yếu phẩm <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.itemType}
              onChange={(e) =>
                setFormData({ ...formData, itemType: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Ví dụ: FOOD, MEDICINE, WATER"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Nhập loại nhu yếu phẩm (FOOD, MEDICINE, WATER, v.v.)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dung lượng
            </label>
            <input
              type="text"
              value={formData.capacity}
              onChange={(e) =>
                setFormData({ ...formData, capacity: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Ví dụ: 500ml, 1kg, 10 viên"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng thái <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:bg-gray-300"
              disabled={loading}
            >
              {loading ? "Đang lưu..." : item ? "Cập nhật" : "Thêm mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const InventoryManagement = () => {
  const [supplies, setSupplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSupplyModal, setShowSupplyModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Fetch items khi component mount
  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllItems();
      if (response.success) {
        setSupplies(response.data || []);
      } else {
        setError(response.message || "Không thể tải danh sách nhu yếu phẩm");
      }
    } catch (err) {
      console.error("Error fetching items:", err);
      setError("Có lỗi xảy ra khi tải danh sách nhu yếu phẩm");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSupply = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa nhu yếu phẩm này?")) {
      try {
        const response = await deleteItem(id);
        if (response.success) {
          // Refresh danh sách sau khi xóa thành công
          await fetchItems();
          alert("Xóa nhu yếu phẩm thành công!");
        } else {
          alert(response.message || "Không thể xóa nhu yếu phẩm");
        }
      } catch (err) {
        console.error("Error deleting item:", err);
        alert("Có lỗi xảy ra khi xóa nhu yếu phẩm");
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">
          Danh sách nhu yếu phẩm
        </h2>
        <button
          onClick={() => {
            setEditingItem(null);
            setShowSupplyModal(true);
          }}
          className="px-4 py-2 bg-emerald-500 hover:bg-teal-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <MdAdd className="text-lg" />
          Thêm nhu yếu phẩm
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                  ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                  Tên vật phẩm
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                  Loại
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                  Dung lượng
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
              {supplies.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    Chưa có nhu yếu phẩm nào
                  </td>
                </tr>
              ) : (
                supplies.map((supply) => (
                  <tr
                    key={supply.id}
                    className="hover:bg-emerald-50/40 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="text-gray-600 text-sm">#{supply.id}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900 font-semibold">
                        {supply.name}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        {supply.itemType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-600 text-sm">
                        {supply.capacity || "N/A"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          supply.status === "ACTIVE" ||
                          supply.status === "Active"
                            ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                            : "bg-gray-500/10 text-gray-600 border border-gray-500/20"
                        }`}
                      >
                        {supply.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingItem(supply);
                            setShowSupplyModal(true);
                          }}
                          className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        >
                          <MdEdit className="text-lg" />
                        </button>
                        <button
                          onClick={() => handleDeleteSupply(supply.id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <MdDelete className="text-lg" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <SupplyModal
        isOpen={showSupplyModal}
        onClose={() => {
          setShowSupplyModal(false);
          setEditingItem(null);
        }}
        item={editingItem}
        onSave={fetchItems}
      />
    </div>
  );
};

export default InventoryManagement;
