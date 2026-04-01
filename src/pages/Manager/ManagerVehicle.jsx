import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "../../components/manager/Sidebar";
import {
  LocalShipping as TruckIcon,
  DirectionsBoat as BoatIcon,
  Flight as HelicopterIcon,
  TwoWheeler as MotorcycleIcon,
  DirectionsCar as CarIcon,
  Category as OtherIcon,
  CheckCircle as AvailableIcon,
  Build as MaintenanceIcon,
  AssignmentTurnedIn as InUseIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  ChevronRight,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  AssignmentReturn as ReturnIcon,
  Visibility as ViewIcon,
  PendingActions as PendingIcon,
} from "@mui/icons-material";
import { vehiclesApi } from "../../api/vehicles";
import { vehicleRequestsApi } from "../../api/vehicleRequests";

// ─── Cấu hình loại phương tiện ──────────────────────────────────────────────
const VEHICLE_TYPE_CONFIG = {
  car: {
    label: "Ô tô",
    icon: <CarIcon sx={{ fontSize: 18 }} />,
    color: "text-blue-600 bg-blue-100",
  },
  boat: {
    label: "Xuồng / Thuyền",
    icon: <BoatIcon sx={{ fontSize: 18 }} />,
    color: "text-cyan-600 bg-cyan-100",
  },
  helicopter: {
    label: "Trực thăng",
    icon: <HelicopterIcon sx={{ fontSize: 18 }} />,
    color: "text-purple-600 bg-purple-100",
  },
  truck: {
    label: "Xe tải",
    icon: <TruckIcon sx={{ fontSize: 18 }} />,
    color: "text-orange-600 bg-orange-100",
  },
  motorcycle: {
    label: "Xe máy",
    icon: <MotorcycleIcon sx={{ fontSize: 18 }} />,
    color: "text-green-600 bg-green-100",
  },
  other: {
    label: "Khác",
    icon: <OtherIcon sx={{ fontSize: 18 }} />,
    color: "text-slate-600 bg-slate-100",
  },
};

// ─── Cấu hình trạng thái phương tiện ────────────────────────────────────────
const VEHICLE_STATUS_CONFIG = {
  available: {
    label: "Sẵn sàng",
    badgeCls: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    icon: <AvailableIcon sx={{ fontSize: 14 }} />,
  },
  in_use: {
    label: "Đang sử dụng",
    badgeCls: "bg-blue-50 text-blue-700 border border-blue-200",
    icon: <InUseIcon sx={{ fontSize: 14 }} />,
  },
  maintenance: {
    label: "Bảo dưỡng",
    badgeCls: "bg-amber-50 text-amber-700 border border-amber-200",
    icon: <MaintenanceIcon sx={{ fontSize: 14 }} />,
  },
};

// ─── Cấu hình trạng thái yêu cầu ────────────────────────────────────────────
const REQUEST_STATUS_CONFIG = {
  pending: {
    label: "Chờ duyệt",
    badgeCls: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    icon: <PendingIcon sx={{ fontSize: 14 }} />,
  },
  approved: {
    label: "Đã duyệt",
    badgeCls: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    icon: <ApproveIcon sx={{ fontSize: 14 }} />,
  },
  rejected: {
    label: "Từ chối",
    badgeCls: "bg-red-50 text-red-700 border border-red-200",
    icon: <RejectIcon sx={{ fontSize: 14 }} />,
  },
  returned: {
    label: "Đã thu hồi",
    badgeCls: "bg-slate-50 text-slate-700 border border-slate-200",
    icon: <ReturnIcon sx={{ fontSize: 14 }} />,
  },
  pending_return: {
    label: "Chờ quản lý xác nhận",
    badgeCls: "bg-indigo-50 text-indigo-700 border border-indigo-200",
    icon: <PendingIcon sx={{ fontSize: 14 }} />,
  },
};

// ─── Format date ─────────────────────────────────────────────────────────────
const formatDate = (isoStr) => {
  if (!isoStr) return "—";
  return new Date(isoStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ─── Modal thêm / sửa phương tiện ────────────────────────────────────────────
function VehicleFormModal({ open, onClose, onSave, editingVehicle }) {
  const isEdit = !!editingVehicle;
  const EMPTY = {
    name: "",
    type: "car",
    province_city: "",
    license_plate: "",
    status: "available",
    notes: "",
  };
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editingVehicle) {
      setForm({
        name: editingVehicle.name ?? "",
        type: editingVehicle.type ?? "car",
        province_city: editingVehicle.province_city ?? "",
        license_plate: editingVehicle.license_plate ?? "",
        status: editingVehicle.status ?? "available",
        notes: editingVehicle.notes ?? "",
      });
    } else {
      setForm(EMPTY);
    }
    setErrors({});
    setApiError("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingVehicle, open]);

  if (!open) return null;

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Vui lòng nhập tên phương tiện";
    if (!form.type) errs.type = "Vui lòng chọn loại phương tiện";
    if (!form.province_city.trim())
      errs.province_city = "Vui lòng nhập quận/huyện";
    return errs;
  };

  const handleChange = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    const payload = {
      name: form.name.trim(),
      type: form.type,
      province_city: form.province_city.trim(),
    };
    if (form.license_plate.trim())
      payload.license_plate = form.license_plate.trim();
    if (form.notes.trim()) payload.notes = form.notes.trim();
    if (isEdit) payload.status = form.status;

    setSaving(true);
    setApiError("");
    try {
      await onSave(payload);
      onClose();
    } catch (err) {
      setApiError(err.message || "Đã xảy ra lỗi, vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  const inputCls = (err) =>
    `w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition ${
      err
        ? "border-red-400 bg-red-50"
        : "border-gray-200 hover:border-gray-300 bg-white"
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <TruckIcon sx={{ fontSize: 22, color: "white" }} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {isEdit ? "Cập nhật phương tiện" : "Thêm phương tiện mới"}
              </h2>
              <p className="text-blue-100 text-xs mt-0.5">
                {isEdit
                  ? "Chỉnh sửa thông tin"
                  : "Điền đầy đủ thông tin bên dưới"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/70 hover:bg-white/20 transition"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
          <div className="p-6 space-y-4">
            {apiError && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-300 text-red-700 rounded-xl px-4 py-3 text-sm">
                <WarningIcon
                  sx={{ fontSize: 16, marginTop: "2px", flexShrink: 0 }}
                />
                <span>{apiError}</span>
              </div>
            )}

            {/* Tên */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Tên phương tiện <span className="text-red-500">*</span>
              </label>
              <input
                className={inputCls(errors.name)}
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="VD: Xe tải cứu hộ số 01"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            {/* Loại */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Loại phương tiện <span className="text-red-500">*</span>
              </label>
              <select
                className={inputCls(errors.type)}
                value={form.type}
                onChange={(e) => handleChange("type", e.target.value)}
              >
                {Object.entries(VEHICLE_TYPE_CONFIG).map(([val, cfg]) => (
                  <option key={val} value={val}>
                    {cfg.label}
                  </option>
                ))}
              </select>
              {errors.type && (
                <p className="text-red-500 text-xs mt-1">{errors.type}</p>
              )}
            </div>

            {/* Quận/Huyện */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Quận / Huyện <span className="text-red-500">*</span>
              </label>
              <input
                className={inputCls(errors.province_city)}
                value={form.province_city}
                onChange={(e) => handleChange("province_city", e.target.value)}
                placeholder="VD: Quận 1, Bình Thạnh"
              />
              {errors.province_city && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.province_city}
                </p>
              )}
            </div>

            {/* Biển số */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Biển số xe
                <span className="text-slate-400 font-normal ml-1">
                  (tuỳ chọn)
                </span>
              </label>
              <input
                className={inputCls(errors.license_plate)}
                value={form.license_plate}
                onChange={(e) => handleChange("license_plate", e.target.value)}
                placeholder="VD: 51A-12345"
              />
              {errors.license_plate && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.license_plate}
                </p>
              )}
            </div>

            {/* Trạng thái — chỉ khi sửa */}
            {isEdit && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Trạng thái
                </label>
                <select
                  className={inputCls(false)}
                  value={form.status}
                  onChange={(e) => handleChange("status", e.target.value)}
                >
                  <option value="available">Sẵn sàng</option>
                  <option value="in_use">Đang sử dụng</option>
                  <option value="maintenance">Bảo dưỡng</option>
                </select>
              </div>
            )}

            {/* Ghi chú */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Ghi chú
                <span className="text-slate-400 font-normal ml-1">
                  (tuỳ chọn)
                </span>
              </label>
              <textarea
                className={inputCls(false) + " resize-none"}
                rows={3}
                value={form.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder="Thông tin bổ sung về phương tiện..."
              />
            </div>
          </div>

          {/* Footer */}
          <div className="shrink-0 border-t border-gray-100 px-6 py-4 flex justify-end gap-3 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-100 transition"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 transition shadow-md shadow-blue-200"
            >
              {saving ? "Đang lưu..." : isEdit ? "Cập nhật" : "Thêm mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Modal xác nhận xoá ───────────────────────────────────────────────────────
function DeleteConfirmModal({ open, onClose, onConfirm, vehicle, deleting }) {
  if (!open || !vehicle) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-red-100 rounded-2xl">
            <DeleteIcon sx={{ fontSize: 28, color: "#ef4444" }} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Xác nhận xoá</h3>
            <p className="text-sm text-slate-500">
              Hành động này không thể hoàn tác
            </p>
          </div>
        </div>
        <p className="text-sm text-slate-700 bg-slate-50 rounded-xl p-4 border border-slate-200 mb-5">
          Bạn có chắc muốn xoá phương tiện{" "}
          <span className="font-bold text-slate-900">{vehicle.name}</span>?
          {vehicle.status === "in_use" && (
            <span className="block mt-2 text-red-600 font-semibold">
              ⚠️ Không thể xoá phương tiện đang được sử dụng.
            </span>
          )}
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-100 transition"
          >
            Huỷ
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting || vehicle.status === "in_use"}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 transition shadow-md shadow-red-200"
          >
            {deleting ? "Đang xoá..." : "Xoá"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal duyệt yêu cầu (chọn phương tiện) ─────────────────────────────────
function ApproveRequestModal({
  open,
  onClose,
  onApprove,
  request,
  availableVehicles,
  approving,
}) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [apiError, setApiError] = useState("");
  const [vehicleSearch, setVehicleSearch] = useState("");

  if (!open || !request) return null;

  const handleClose = () => {
    setSelectedIds([]);
    setApiError("");
    setVehicleSearch("");
    onClose();
  };

  const toggleVehicle = (id) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const handleSubmit = async () => {
    if (selectedIds.length === 0) {
      setApiError("Vui lòng chọn ít nhất 1 phương tiện.");
      return;
    }
    setApiError("");
    try {
      await onApprove(selectedIds);
      handleClose();
    } catch (err) {
      setApiError(err.message || "Đã xảy ra lỗi.");
    }
  };

  const q = vehicleSearch.trim().toLowerCase();
  const filterVehicles = (list) =>
    q === ""
      ? list
      : list.filter(
          (v) =>
            (v.name || "").toLowerCase().includes(q) ||
            (v.license_plate || "").toLowerCase().includes(q) ||
            (v.province_city || "").toLowerCase().includes(q),
        );

  const allAvailable = availableVehicles.filter(
    (v) => v.status === "available",
  );
  const matchingVehicles = filterVehicles(
    allAvailable.filter((v) => v.type === request.vehicle_type),
  );
  const otherVehicles = filterVehicles(
    allAvailable.filter((v) => v.type !== request.vehicle_type),
  );
  const totalShown = matchingVehicles.length + otherVehicles.length;
  const totalAvailable = availableVehicles.filter(
    (v) => v.status === "available",
  ).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <ApproveIcon sx={{ fontSize: 20, color: "white" }} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Duyệt yêu cầu & Gán phương tiện
              </h2>
              <p className="text-emerald-100 text-xs mt-0.5">
                Yêu cầu{" "}
                {VEHICLE_TYPE_CONFIG[request.vehicle_type]?.label ??
                  request.vehicle_type}{" "}
                ×{request.quantity_needed}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-xl text-white/70 hover:bg-white/20 transition"
          >
            <CloseIcon sx={{ fontSize: 20 }} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          {apiError && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-300 text-red-700 rounded-xl px-4 py-3 text-sm">
              <WarningIcon sx={{ fontSize: 16, marginTop: "2px" }} />
              <span>{apiError}</span>
            </div>
          )}

          <div className="bg-slate-50 rounded-xl p-4 text-sm space-y-1.5 border border-slate-200">
            <p>
              <span className="text-slate-500">Đội:</span>{" "}
              <span className="font-semibold text-slate-800">
                {request.team?.name}
              </span>
            </p>
            <p>
              <span className="text-slate-500">Loại cần:</span>{" "}
              <span className="font-semibold text-slate-800">
                {VEHICLE_TYPE_CONFIG[request.vehicle_type]?.label}
              </span>{" "}
              × {request.quantity_needed}
            </p>
            <p>
              <span className="text-slate-500">Lý do:</span>{" "}
              <span className="text-slate-700">{request.reason}</span>
            </p>
          </div>

          {/* Search phuong tien */}
          <div className="relative">
            <SearchIcon
              sx={{ fontSize: 18 }}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              value={vehicleSearch}
              onChange={(e) => setVehicleSearch(e.target.value)}
              placeholder="Tìm theo tên, biển số, tỉnh/thành..."
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-300 transition"
            />
          </div>

          {q !== "" && (
            <p className="text-xs text-slate-500">
              {totalShown === 0
                ? "Không tìm thấy phương tiện nào."
                : `Tìm thấy ${totalShown} / ${totalAvailable} phương tiện sẵn sàng`}
            </p>
          )}

          {/* Matching vehicles */}
          {matchingVehicles.length > 0 && (
            <div>
              <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">
                Phương tiện phù hợp ({matchingVehicles.length})
              </p>
              <div className="space-y-2">
                {matchingVehicles.map((v) => (
                  <label
                    key={v.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition ${
                      selectedIds.includes(v.id)
                        ? "border-emerald-400 bg-emerald-50"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(v.id)}
                      onChange={() => toggleVehicle(v.id)}
                      className="accent-emerald-600 w-4 h-4"
                    />
                    <div
                      className={`p-1.5 rounded-lg ${VEHICLE_TYPE_CONFIG[v.type]?.color}`}
                    >
                      {VEHICLE_TYPE_CONFIG[v.type]?.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800">
                        {v.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {v.license_plate || "Không có biển số"} ·{" "}
                        {v.province_city}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Other available vehicles */}
          {otherVehicles.length > 0 && (
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Phương tiện khác đang sẵn sàng ({otherVehicles.length})
              </p>
              <div className="space-y-2">
                {otherVehicles.map((v) => (
                  <label
                    key={v.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition ${
                      selectedIds.includes(v.id)
                        ? "border-blue-400 bg-blue-50"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(v.id)}
                      onChange={() => toggleVehicle(v.id)}
                      className="accent-blue-600 w-4 h-4"
                    />
                    <div
                      className={`p-1.5 rounded-lg ${VEHICLE_TYPE_CONFIG[v.type]?.color}`}
                    >
                      {VEHICLE_TYPE_CONFIG[v.type]?.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800">
                        {v.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {VEHICLE_TYPE_CONFIG[v.type]?.label} ·{" "}
                        {v.license_plate || "Không có biển số"} ·{" "}
                        {v.province_city}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {matchingVehicles.length === 0 && otherVehicles.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <TruckIcon sx={{ fontSize: 40, opacity: 0.3 }} />
              <p className="mt-2 text-sm">
                Không có phương tiện nào đang sẵn sàng.
              </p>
            </div>
          )}

          {selectedIds.length > 0 && (
            <p className="text-xs text-center text-emerald-700 font-semibold">
              Đã chọn {selectedIds.length} phương tiện
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-gray-100 px-5 py-4 flex justify-end gap-3 bg-gray-50">
          <button
            onClick={handleClose}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-100 transition"
          >
            Huỷ
          </button>
          <button
            onClick={handleSubmit}
            disabled={approving || selectedIds.length === 0}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 transition shadow-md"
          >
            {approving
              ? "Đang duyệt..."
              : `Duyệt & Gán ${selectedIds.length > 0 ? `(${selectedIds.length})` : ""}`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal từ chối yêu cầu ────────────────────────────────────────────────────
function RejectRequestModal({ open, onClose, onReject, request, rejecting }) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  if (!open || !request) return null;

  const handleClose = () => {
    setReason("");
    setError("");
    onClose();
  };

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setError("Vui lòng nhập lý do từ chối.");
      return;
    }
    setError("");
    try {
      await onReject(reason.trim());
      handleClose();
    } catch (err) {
      setError(err.message || "Đã xảy ra lỗi.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center gap-4 mb-5">
          <div className="p-3 bg-red-100 rounded-2xl">
            <RejectIcon sx={{ fontSize: 28, color: "#ef4444" }} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Từ chối yêu cầu
            </h3>
            <p className="text-sm text-slate-500">Đội: {request.team?.name}</p>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-300 text-red-700 rounded-xl px-4 py-3 text-sm mb-4">
            <WarningIcon sx={{ fontSize: 16, marginTop: "2px" }} />
            <span>{error}</span>
          </div>
        )}

        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Lý do từ chối <span className="text-red-500">*</span>
        </label>
        <textarea
          className={`w-full px-4 py-2.5 border rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-400 transition ${
            error ? "border-red-400 bg-red-50" : "border-gray-200"
          }`}
          rows={4}
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            setError("");
          }}
          placeholder="Nhập lý do từ chối yêu cầu cấp phương tiện..."
        />

        <div className="flex gap-3 justify-end mt-5">
          <button
            onClick={handleClose}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-100 transition"
          >
            Huỷ
          </button>
          <button
            onClick={handleSubmit}
            disabled={rejecting}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 transition shadow-md shadow-red-200"
          >
            {rejecting ? "Đang từ chối..." : "Từ chối"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Helper row ───────────────────────────────────────────────────────────────
function Row({ label, value }) {
  return (
    <div className="flex gap-2">
      <span className="text-slate-500 shrink-0 w-36">{label}:</span>
      <span className="font-semibold text-slate-800 break-words">{value}</span>
    </div>
  );
}

// ─── Modal xem báo cáo trả xe từ rescue team ─────────────────────────────────
function ReturnReportModal({ open, onClose, request, onConfirmReturn, returnLoading }) {
  const [managerNotes, setManagerNotes] = React.useState("");
  if (!open || !request) return null;

  const report = request.return_report ?? {};
  const checklist = Array.isArray(report.checklist) ? report.checklist : [];
  const mediaUrls = Array.isArray(report.return_media_urls) ? report.return_media_urls : [];

  const handleConfirm = () => {
    onConfirmReturn(request, managerNotes.trim() || undefined);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <ReturnIcon sx={{ fontSize: 20, color: "white" }} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Báo cáo trả xe từ đội</h2>
              <p className="text-indigo-200 text-xs mt-0.5">
                Đội: {request.team?.name ?? "—"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-white/70 hover:bg-white/20 transition">
            <CloseIcon sx={{ fontSize: 20 }} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          {/* Thông tin tổng quan */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 space-y-2 text-sm">
            <Row label="Đội cứu hộ" value={request.team?.name ?? "—"} />
            <Row label="Loại phương tiện" value={VEHICLE_TYPE_CONFIG[request.vehicle_type]?.label ?? request.vehicle_type} />
            <Row label="Thời gian báo" value={formatDate(report.reported_at)} />
          </div>

          {/* Xe được gán */}
          {request.assigned_vehicles?.length > 0 && (
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Phương tiện trả ({request.assigned_vehicles.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {request.assigned_vehicles.map((v) => (
                  <span key={v.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-xl text-xs font-semibold text-slate-700">
                    {VEHICLE_TYPE_CONFIG[v.type]?.icon}
                    {v.name} {v.license_plate ? `· ${v.license_plate}` : ""}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Mức nhiên liệu */}
          {report.fuel_level !== null && report.fuel_level !== undefined && (
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Mức nhiên liệu còn lại</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-slate-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      Number(report.fuel_level) >= 60 ? "bg-emerald-500" :
                      Number(report.fuel_level) >= 30 ? "bg-amber-400" : "bg-red-500"
                    }`}
                    style={{ width: `${Math.min(100, Number(report.fuel_level))}%` }}
                  />
                </div>
                <span className={`text-sm font-bold ${
                  Number(report.fuel_level) >= 60 ? "text-emerald-600" :
                  Number(report.fuel_level) >= 30 ? "text-amber-600" : "text-red-600"
                }`}>
                  {report.fuel_level}%
                </span>
              </div>
            </div>
          )}

          {/* Checklist */}
          {checklist.length > 0 && (
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Checklist kiểm tra</p>
              <div className="space-y-1.5">
                {checklist.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-slate-700">
                    <span className="text-emerald-500 font-bold">✓</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tình trạng hư hỏng */}
          {report.damage_report && (
            <div>
              <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1.5">Tình trạng hư hỏng ghi nhận</p>
              <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3">
                {report.damage_report}
              </p>
            </div>
          )}

          {/* Ghi chú trả xe */}
          {report.return_notes && (
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Ghi chú của đội</p>
              <p className="text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-3">
                {report.return_notes}
              </p>
            </div>
          )}

          {/* Ảnh minh chứng */}
          {mediaUrls.length > 0 && (
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Ảnh minh chứng ({mediaUrls.length})</p>
              <div className="grid grid-cols-3 gap-2">
                {mediaUrls.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                    <img
                      src={url}
                      alt={`Ảnh ${i + 1}`}
                      className="w-full h-24 object-cover rounded-xl border border-slate-200 hover:opacity-80 transition cursor-pointer"
                      onError={(e) => { e.target.style.display = "none"; }}
                    />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Trường hợp không có report */}
          {!report.reported_at && (
            <div className="text-center py-6 text-slate-400 text-sm">
              Đội chưa gửi báo cáo chi tiết.
            </div>
          )}

          {/* Ghi chú manager khi xác nhận */}
          <div className="border-t border-slate-200 pt-4">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Ghi chú của quản lý
              <span className="text-slate-400 font-normal ml-1">(tuỳ chọn)</span>
            </label>
            <textarea
              value={managerNotes}
              onChange={(e) => setManagerNotes(e.target.value)}
              rows={2}
              placeholder="Nhập ghi chú trước khi xác nhận thu hồi..."
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t px-5 py-4 flex justify-end gap-3 bg-gray-50">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-100 transition"
          >
            Đóng
          </button>
          {request.status === "pending_return" && (
            <button
              onClick={handleConfirm}
              disabled={!!returnLoading}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50 transition shadow-md"
            >
              {returnLoading ? "Đang xử lý..." : "✓ Xác nhận thu hồi"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Modal xem chi tiết yêu cầu ──────────────────────────────────────────────
function RequestDetailModal({ open, onClose, request }) {
  if (!open || !request) return null;
  const statusCfg = REQUEST_STATUS_CONFIG[request.status] ?? {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <ViewIcon sx={{ fontSize: 20, color: "white" }} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Chi tiết yêu cầu
              </h2>
              <p className="text-blue-100 text-xs mt-0.5">
                ID: {request.id?.slice(0, 8)}...
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-white/70 hover:bg-white/20 transition"
          >
            <CloseIcon sx={{ fontSize: 20 }} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ${statusCfg.badgeCls}`}
            >
              {statusCfg.icon} {statusCfg.label}
            </span>
            <span className="text-xs text-slate-400">
              {formatDate(request.created_at)}
            </span>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 space-y-2.5 text-sm border border-slate-200">
            <Row label="Đội cứu hộ" value={request.team?.name ?? "—"} />
            <Row
              label="Coordinator"
              value={request.coordinator?.username ?? "—"}
            />
            <Row
              label="Loại phương tiện"
              value={
                VEHICLE_TYPE_CONFIG[request.vehicle_type]?.label ??
                request.vehicle_type
              }
            />
            <Row
              label="Số lượng cần"
              value={`${request.quantity_needed} phương tiện`}
            />
            <Row
              label="Yêu cầu cứu hộ"
              value={request.rescue_request?.description ?? "—"}
            />
            <Row
              label="Địa bàn"
              value={request.rescue_request?.district ?? "—"}
            />
          </div>

          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Lý do cần phương tiện
            </p>
            <p className="text-sm text-slate-700 bg-blue-50 border border-blue-100 rounded-xl p-3">
              {request.reason}
            </p>
          </div>

          {request.notes && (
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Ghi chú
              </p>
              <p className="text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-3">
                {request.notes}
              </p>
            </div>
          )}

          {request.reject_reason && (
            <div>
              <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-1.5">
                Lý do từ chối
              </p>
              <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">
                {request.reject_reason}
              </p>
            </div>
          )}

          {request.assigned_vehicles?.length > 0 && (
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Phương tiện được gán ({request.assigned_vehicles.length})
              </p>
              <div className="space-y-2">
                {request.assigned_vehicles.map((v) => {
                  const vStatus = VEHICLE_STATUS_CONFIG[v.status] ?? {};
                  return (
                    <div
                      key={v.id}
                      className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl"
                    >
                      <div
                        className={`p-1.5 rounded-lg ${VEHICLE_TYPE_CONFIG[v.type]?.color}`}
                      >
                        {VEHICLE_TYPE_CONFIG[v.type]?.icon}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-800">
                          {v.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {v.license_plate || "Không có biển số"}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${vStatus.badgeCls}`}
                      >
                        {vStatus.icon} {vStatus.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {request.manager && (
            <div className="text-xs text-slate-500 text-right">
              Xử lý bởi:{" "}
              <span className="font-semibold text-slate-700">
                {request.manager.username}
              </span>
            </div>
          )}
        </div>

        <div className="shrink-0 border-t px-5 py-4 flex justify-end bg-gray-50">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-100 transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Toast notification ────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }) {
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [msg, onClose]);
  if (!msg) return null;
  return (
    <div
      className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-semibold transition-all ${
        type === "success"
          ? "bg-emerald-600 text-white"
          : "bg-red-600 text-white"
      }`}
    >
      {type === "success" ? (
        <ApproveIcon sx={{ fontSize: 18 }} />
      ) : (
        <WarningIcon sx={{ fontSize: 18 }} />
      )}
      {msg}
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">
        <CloseIcon sx={{ fontSize: 16 }} />
      </button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ManagerVehicle() {
  const [activeTab, setActiveTab] = useState("vehicles"); // "vehicles" | "requests"

  // ── Vehicles state ──
  const [vehicles, setVehicles] = useState([]);
  const [vehicleLoading, setVehicleLoading] = useState(false);
  const [vehicleError, setVehicleError] = useState("");
  const [vehiclePagination, setVehiclePagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState("");
  const [vehicleStatusFilter, setVehicleStatusFilter] = useState("");

  // ── Vehicle requests state ──
  const [requests, setRequests] = useState([]);
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [requestPagination, setRequestPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [requestStatusFilter, setRequestStatusFilter] = useState("");

  // ── Modal states ──
  const [vehicleFormOpen, setVehicleFormOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingVehicle, setDeletingVehicle] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [approvingRequest, setApprovingRequest] = useState(null);
  const [approveLoading, setApproveLoading] = useState(false);

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectingRequest, setRejectingRequest] = useState(null);
  const [rejectLoading, setRejectLoading] = useState(false);

  const [returnLoading, setReturnLoading] = useState(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailRequest, setDetailRequest] = useState(null);

  // Modal báo cáo trả xe
  const [returnReportOpen, setReturnReportOpen] = useState(false);
  const [returnReportRequest, setReturnReportRequest] = useState(null);

  // ── Toast ──
  const [toast, setToast] = useState({ msg: "", type: "success" });
  const showToast = (msg, type = "success") => setToast({ msg, type });

  // ── Available vehicles for approve modal ──
  const [availableVehicles, setAvailableVehicles] = useState([]);

  // ── Fetch vehicles ──────────────────────────────────────────────────────────
  const fetchVehicles = useCallback(
    async (page = 1) => {
      setVehicleLoading(true);
      setVehicleError("");
      try {
        const params = { page, limit: vehiclePagination.limit };
        if (vehicleTypeFilter) params.type = vehicleTypeFilter;
        if (vehicleStatusFilter) params.status = vehicleStatusFilter;
        const res = await vehiclesApi.getAll(params);
        setVehicles(res.data ?? []);
        if (res.pagination) setVehiclePagination(res.pagination);
      } catch (err) {
        setVehicleError(err.message || "Không thể tải danh sách phương tiện.");
      } finally {
        setVehicleLoading(false);
      }
    },
    [vehiclePagination.limit, vehicleTypeFilter, vehicleStatusFilter],
  );

  // ── Fetch requests ──────────────────────────────────────────────────────────
  const fetchRequests = useCallback(
    async (page = 1) => {
      setRequestLoading(true);
      setRequestError("");
      try {
        const params = { page, limit: requestPagination.limit };
        if (requestStatusFilter) params.status = requestStatusFilter;
        const res = await vehicleRequestsApi.getAll(params);
        setRequests(res.data ?? []);
        if (res.pagination) setRequestPagination(res.pagination);
      } catch (err) {
        setRequestError(err.message || "Không thể tải danh sách yêu cầu.");
      } finally {
        setRequestLoading(false);
      }
    },
    [requestPagination.limit, requestStatusFilter],
  );

  const fetchAvailableVehicles = async () => {
    try {
      const res = await vehiclesApi.getAll({ status: "available", limit: 100 });
      setAvailableVehicles(res.data ?? []);
    } catch {
      setAvailableVehicles([]);
    }
  };

  useEffect(() => {
    fetchVehicles(1);
  }, [fetchVehicles]);

  useEffect(() => {
    fetchRequests(1);
  }, [fetchRequests]);

  // ── Stats ────────────────────────────────────────────────────────────────────
  const stats = {
    total: vehiclePagination.total || vehicles.length,
    available: vehicles.filter((v) => v.status === "available").length,
    inUse: vehicles.filter((v) => v.status === "in_use").length,
    maintenance: vehicles.filter((v) => v.status === "maintenance").length,
  };
  const pendingRequests = requests.filter((r) => r.status === "pending").length;

  // ── Client-side search filter ─────────────────────────────────────────────
  const filteredVehicles = vehicles.filter((v) => {
    if (!vehicleSearch) return true;
    const q = vehicleSearch.toLowerCase();
    return (
      v.name?.toLowerCase().includes(q) ||
      v.license_plate?.toLowerCase().includes(q) ||
      v.province_city?.toLowerCase().includes(q) ||
      v.assigned_team?.name?.toLowerCase().includes(q)
    );
  });

  // ── Handlers — Vehicles ──────────────────────────────────────────────────────
  const handleAddVehicle = () => {
    setEditingVehicle(null);
    setVehicleFormOpen(true);
  };
  const handleEditVehicle = (v) => {
    setEditingVehicle(v);
    setVehicleFormOpen(true);
  };
  const handleDeleteVehicle = (v) => {
    setDeletingVehicle(v);
    setDeleteModalOpen(true);
  };

  const handleSaveVehicle = async (payload) => {
    if (editingVehicle) {
      await vehiclesApi.update(editingVehicle.id, payload);
      showToast("Cập nhật phương tiện thành công!");
    } else {
      await vehiclesApi.create(payload);
      showToast("Thêm phương tiện mới thành công!");
    }
    fetchVehicles(vehiclePagination.page);
  };

  const handleConfirmDelete = async () => {
    if (!deletingVehicle) return;
    setDeleteLoading(true);
    try {
      await vehiclesApi.delete(deletingVehicle.id);
      showToast("Đã xoá phương tiện.");
      setDeleteModalOpen(false);
      setDeletingVehicle(null);
      fetchVehicles(vehiclePagination.page);
    } catch (err) {
      showToast(err.message || "Xoá thất bại.", "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Handlers — Requests ──────────────────────────────────────────────────────
  const handleOpenApprove = async (req) => {
    setApprovingRequest(req);
    await fetchAvailableVehicles();
    setApproveModalOpen(true);
  };

  const handleApprove = async (vehicleIds) => {
    setApproveLoading(true);
    try {
      await vehicleRequestsApi.approve(approvingRequest.id, vehicleIds);
      showToast("Đã duyệt và gán phương tiện thành công!");
      fetchRequests(requestPagination.page);
      fetchVehicles(vehiclePagination.page);
    } finally {
      setApproveLoading(false);
    }
  };

  const handleOpenReject = (req) => {
    setRejectingRequest(req);
    setRejectModalOpen(true);
  };

  const handleReject = async (reason) => {
    setRejectLoading(true);
    try {
      await vehicleRequestsApi.reject(rejectingRequest.id, reason);
      showToast("Đã từ chối yêu cầu.");
      fetchRequests(requestPagination.page);
    } finally {
      setRejectLoading(false);
    }
  };

  const handleOpenReturnReport = (req) => {
    setReturnReportRequest(req);
    setReturnReportOpen(true);
  };

  const handleReturn = async (req, managerNotes) => {
    setReturnLoading(req.id);
    try {
      await vehicleRequestsApi.return(req.id, {
        manager_notes: managerNotes || undefined,
      });
      showToast("Đã xác nhận thu hồi phương tiện thành công!");
      setReturnReportOpen(false);
      setReturnReportRequest(null);
      fetchRequests(requestPagination.page);
      fetchVehicles(vehiclePagination.page);
    } catch (err) {
      showToast(err.message || "Thu hồi thất bại.", "error");
    } finally {
      setReturnLoading(null);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-8 max-w-[1800px] mx-auto">
          {/* ── Breadcrumb & Header ── */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-500 font-medium">Manager</span>
                  <ChevronRight
                    sx={{ fontSize: 16 }}
                    className="text-slate-400"
                  />
                  <span className="text-slate-900 font-semibold">
                    Quản lý phương tiện
                  </span>
                </div>
                <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
                  Quản Lý Phương Tiện
                </h1>
                <p className="text-slate-500 text-sm">
                  Quản lý xe, tàu, máy bay cứu hộ — Xét duyệt yêu cầu cấp phương
                  tiện
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    fetchVehicles(vehiclePagination.page);
                    fetchRequests(requestPagination.page);
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl transition shadow-sm text-sm font-semibold text-slate-600"
                >
                  <RefreshIcon sx={{ fontSize: 18 }} />
                  Làm mới
                </button>
                {activeTab === "vehicles" && (
                  <button
                    onClick={handleAddVehicle}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl shadow-lg shadow-blue-500/25 text-sm font-semibold transition"
                  >
                    <AddIcon sx={{ fontSize: 20 }} />
                    Thêm phương tiện
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ── Stats Cards ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
            {[
              {
                label: "Tổng phương tiện",
                value: stats.total,
                icon: <TruckIcon sx={{ fontSize: 26 }} />,
                gradient: "from-blue-500 to-indigo-600",
                ring: "hover:border-blue-300/60",
                sub: `${vehiclePagination.totalPages} trang`,
              },
              {
                label: "Sẵn sàng",
                value: stats.available,
                icon: <AvailableIcon sx={{ fontSize: 26 }} />,
                gradient: "from-emerald-500 to-teal-600",
                ring: "hover:border-emerald-300/60",
                sub: "Có thể điều phối",
              },
              {
                label: "Đang sử dụng",
                value: stats.inUse,
                icon: <InUseIcon sx={{ fontSize: 26 }} />,
                gradient: "from-blue-400 to-sky-500",
                ring: "hover:border-sky-300/60",
                sub: "Đang trên nhiệm vụ",
              },
              {
                label: "Chờ duyệt",
                value: pendingRequests,
                icon: <PendingIcon sx={{ fontSize: 26 }} />,
                gradient: "from-amber-500 to-orange-500",
                ring: "hover:border-amber-300/60",
                sub: "Yêu cầu chờ xử lý",
                pulse: pendingRequests > 0,
              },
            ].map((s) => (
              <div
                key={s.label}
                className={`group relative bg-white rounded-3xl p-5 shadow-sm border border-slate-200/60 ${s.ring} hover:shadow-xl transition-all duration-500 overflow-hidden`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={`p-3 rounded-2xl bg-gradient-to-br ${s.gradient} text-white shadow-lg transform group-hover:scale-110 transition-all duration-300`}
                  >
                    {s.icon}
                  </div>
                  {s.pulse && (
                    <span className="relative flex h-3 w-3 mt-1">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                    </span>
                  )}
                </div>
                <h3 className="text-3xl font-bold text-slate-900">{s.value}</h3>
                <p className="text-sm font-semibold text-slate-700 mt-0.5">
                  {s.label}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* ── Tabs ── */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab("vehicles")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                activeTab === "vehicles"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              <TruckIcon sx={{ fontSize: 18 }} />
              Phương tiện
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  activeTab === "vehicles"
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {vehiclePagination.total || vehicles.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("requests")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                activeTab === "requests"
                  ? "bg-amber-500 text-white shadow-lg shadow-amber-500/25"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              <PendingIcon sx={{ fontSize: 18 }} />
              Yêu cầu cấp phương tiện
              {pendingRequests > 0 && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    activeTab === "requests"
                      ? "bg-white/20 text-white"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {pendingRequests} chờ duyệt
                </span>
              )}
            </button>
          </div>

          {/* ══ VEHICLES TAB ══ */}
          {activeTab === "vehicles" && (
            <div className="space-y-5">
              {/* Filters */}
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/60">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative flex-1 min-w-56 max-w-sm">
                    <SearchIcon
                      sx={{ fontSize: 18 }}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      value={vehicleSearch}
                      onChange={(e) => setVehicleSearch(e.target.value)}
                      placeholder="Tìm tên, biển số, quận huyện..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition"
                    />
                  </div>
                  <select
                    value={vehicleTypeFilter}
                    onChange={(e) => setVehicleTypeFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-400 outline-none cursor-pointer font-medium text-slate-700"
                  >
                    <option value="">Tất cả loại</option>
                    {Object.entries(VEHICLE_TYPE_CONFIG).map(([val, cfg]) => (
                      <option key={val} value={val}>
                        {cfg.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={vehicleStatusFilter}
                    onChange={(e) => setVehicleStatusFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-400 outline-none cursor-pointer font-medium text-slate-700"
                  >
                    <option value="">Tất cả trạng thái</option>
                    <option value="available">Sẵn sàng</option>
                    <option value="in_use">Đang sử dụng</option>
                    <option value="maintenance">Bảo dưỡng</option>
                  </select>
                  {(vehicleTypeFilter ||
                    vehicleStatusFilter ||
                    vehicleSearch) && (
                    <button
                      onClick={() => {
                        setVehicleTypeFilter("");
                        setVehicleStatusFilter("");
                        setVehicleSearch("");
                      }}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-700 px-3 py-2 hover:bg-slate-100 rounded-xl transition"
                    >
                      Xoá bộ lọc
                    </button>
                  )}
                </div>
              </div>

              {/* Table */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
                {vehicleLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
                    <span className="ml-3 text-slate-500 font-medium">
                      Đang tải...
                    </span>
                  </div>
                ) : vehicleError ? (
                  <div className="flex flex-col items-center justify-center py-16 text-red-600">
                    <WarningIcon sx={{ fontSize: 40, opacity: 0.5 }} />
                    <p className="mt-2 font-medium">{vehicleError}</p>
                    <button
                      onClick={() => fetchVehicles(1)}
                      className="mt-4 px-4 py-2 bg-red-50 hover:bg-red-100 rounded-xl text-sm font-semibold transition"
                    >
                      Thử lại
                    </button>
                  </div>
                ) : filteredVehicles.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                    <TruckIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                    <p className="mt-3 font-medium">Không có phương tiện nào</p>
                    <p className="text-xs mt-1">
                      Thử thay đổi bộ lọc hoặc thêm mới
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200">
                            {[
                              "Tên phương tiện",
                              "Loại",
                              "Biển số",
                              "Quận/Huyện",
                              "Trạng thái",
                              "Đội đang dùng",
                              "Hành động",
                            ].map((h) => (
                              <th
                                key={h}
                                className="px-5 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap"
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredVehicles.map((v) => {
                            const typeCfg =
                              VEHICLE_TYPE_CONFIG[v.type] ??
                              VEHICLE_TYPE_CONFIG.other;
                            const statusCfg =
                              VEHICLE_STATUS_CONFIG[v.status] ??
                              VEHICLE_STATUS_CONFIG.available;
                            return (
                              <tr
                                key={v.id}
                                className="group hover:bg-slate-50/70 transition-colors"
                              >
                                <td className="px-5 py-4">
                                  <p className="text-sm font-bold text-slate-900">
                                    {v.name}
                                  </p>
                                  {v.notes && (
                                    <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[180px]">
                                      {v.notes}
                                    </p>
                                  )}
                                </td>
                                <td className="px-5 py-4 whitespace-nowrap">
                                  <div
                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ${typeCfg.color}`}
                                  >
                                    {typeCfg.icon}
                                    {typeCfg.label}
                                  </div>
                                </td>
                                <td className="px-5 py-4 whitespace-nowrap">
                                  <span className="text-sm text-slate-600 font-medium font-mono">
                                    {v.license_plate || (
                                      <span className="text-slate-300 italic font-sans">
                                        —
                                      </span>
                                    )}
                                  </span>
                                </td>
                                <td className="px-5 py-4 whitespace-nowrap">
                                  <span className="text-sm text-slate-600">
                                    {v.province_city}
                                  </span>
                                </td>
                                <td className="px-5 py-4 whitespace-nowrap">
                                  <span
                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ${statusCfg.badgeCls}`}
                                  >
                                    {statusCfg.icon}
                                    {statusCfg.label}
                                  </span>
                                </td>
                                <td className="px-5 py-4">
                                  {v.assigned_team ? (
                                    <div>
                                      <p className="text-xs font-semibold text-slate-700">
                                        {v.assigned_team.name}
                                      </p>
                                      <p className="text-xs text-slate-400">
                                        {v.assigned_team.district}
                                      </p>
                                    </div>
                                  ) : (
                                    <span className="text-xs text-slate-300 italic">
                                      Chưa gán
                                    </span>
                                  )}
                                </td>
                                <td className="px-5 py-4 whitespace-nowrap text-right">
                                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={() => handleEditVehicle(v)}
                                      className="p-2 rounded-xl text-blue-600 hover:bg-blue-50 transition"
                                      title="Chỉnh sửa"
                                    >
                                      <EditIcon sx={{ fontSize: 18 }} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteVehicle(v)}
                                      disabled={v.status === "in_use"}
                                      className="p-2 rounded-xl text-red-500 hover:bg-red-50 transition disabled:opacity-30 disabled:cursor-not-allowed"
                                      title={
                                        v.status === "in_use"
                                          ? "Không thể xoá khi đang sử dụng"
                                          : "Xoá"
                                      }
                                    >
                                      <DeleteIcon sx={{ fontSize: 18 }} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                      <p className="text-xs text-slate-500">
                        Trang{" "}
                        <span className="font-bold text-slate-700">
                          {vehiclePagination.page}
                        </span>{" "}
                        /{" "}
                        <span className="font-bold text-slate-700">
                          {vehiclePagination.totalPages}
                        </span>{" "}
                        — Tổng{" "}
                        <span className="font-bold text-slate-700">
                          {vehiclePagination.total}
                        </span>{" "}
                        phương tiện
                      </p>
                      <div className="flex gap-2">
                        <button
                          disabled={vehiclePagination.page <= 1}
                          onClick={() =>
                            fetchVehicles(vehiclePagination.page - 1)
                          }
                          className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                          ← Trước
                        </button>
                        <button
                          disabled={
                            vehiclePagination.page >=
                            vehiclePagination.totalPages
                          }
                          onClick={() =>
                            fetchVehicles(vehiclePagination.page + 1)
                          }
                          className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                          Sau →
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* ══ REQUESTS TAB ══ */}
          {activeTab === "requests" && (
            <div className="space-y-5">
              {/* Filters */}
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/60">
                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={requestStatusFilter}
                    onChange={(e) => setRequestStatusFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-400 outline-none cursor-pointer font-medium text-slate-700"
                  >
                    <option value="">Tất cả trạng thái</option>
                    <option value="pending">Chờ duyệt</option>
                    <option value="approved">Đã duyệt</option>
                    <option value="pending_return">Chờ quản lý xác nhận</option>
                    <option value="rejected">Từ chối</option>
                    <option value="returned">Đã thu hồi</option>
                  </select>
                  {requestStatusFilter && (
                    <button
                      onClick={() => setRequestStatusFilter("")}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-700 px-3 py-2 hover:bg-slate-100 rounded-xl transition"
                    >
                      Xoá bộ lọc
                    </button>
                  )}
                  <span className="ml-auto text-xs text-slate-400">
                    Tổng {requestPagination.total} yêu cầu
                  </span>
                </div>
              </div>

              {/* Table */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
                {requestLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-amber-500 border-t-transparent"></div>
                    <span className="ml-3 text-slate-500 font-medium">
                      Đang tải...
                    </span>
                  </div>
                ) : requestError ? (
                  <div className="flex flex-col items-center justify-center py-16 text-red-600">
                    <WarningIcon sx={{ fontSize: 40, opacity: 0.5 }} />
                    <p className="mt-2 font-medium">{requestError}</p>
                    <button
                      onClick={() => fetchRequests(1)}
                      className="mt-4 px-4 py-2 bg-red-50 hover:bg-red-100 rounded-xl text-sm font-semibold transition"
                    >
                      Thử lại
                    </button>
                  </div>
                ) : requests.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                    <PendingIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                    <p className="mt-3 font-medium">Không có yêu cầu nào</p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200">
                            {[
                              "Đội cứu hộ",
                              "Loại phương tiện",
                              "Số lượng",
                              "Lý do",
                              "Trạng thái",
                              "Thời gian",
                              "Hành động",
                            ].map((h) => (
                              <th
                                key={h}
                                className="px-5 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap"
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {requests.map((req) => {
                            const statusCfg =
                              REQUEST_STATUS_CONFIG[req.status] ?? {};
                            const typeCfg =
                              VEHICLE_TYPE_CONFIG[req.vehicle_type] ??
                              VEHICLE_TYPE_CONFIG.other;
                            return (
                              <tr
                                key={req.id}
                                className="group hover:bg-slate-50/70 transition-colors"
                              >
                                <td className="px-5 py-4">
                                  <p className="text-sm font-bold text-slate-900">
                                    {req.team?.name ?? "—"}
                                  </p>
                                  <p className="text-xs text-slate-400">
                                    {req.team?.district ?? ""}
                                  </p>
                                </td>
                                <td className="px-5 py-4 whitespace-nowrap">
                                  <div
                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ${typeCfg.color}`}
                                  >
                                    {typeCfg.icon}
                                    {typeCfg.label}
                                  </div>
                                </td>
                                <td className="px-5 py-4 whitespace-nowrap">
                                  <span className="text-sm font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg">
                                    ×{req.quantity_needed}
                                  </span>
                                </td>
                                <td className="px-5 py-4">
                                  <p
                                    className="text-xs text-slate-600 max-w-[200px] truncate"
                                    title={req.reason}
                                  >
                                    {req.reason}
                                  </p>
                                </td>
                                <td className="px-5 py-4 whitespace-nowrap">
                                  <span
                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ${statusCfg.badgeCls}`}
                                  >
                                    {statusCfg.icon}
                                    {statusCfg.label}
                                  </span>
                                </td>
                                <td className="px-5 py-4 whitespace-nowrap">
                                  <span className="text-xs text-slate-400">
                                    {formatDate(req.created_at)}
                                  </span>
                                </td>
                                <td className="px-5 py-4 whitespace-nowrap">
                                  <div className="flex items-center gap-2">
                                    {/* View detail */}
                                    <button
                                      onClick={() => {
                                        setDetailRequest(req);
                                        setDetailOpen(true);
                                      }}
                                      className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition"
                                      title="Xem chi tiết"
                                    >
                                      <ViewIcon sx={{ fontSize: 17 }} />
                                    </button>

                                    {/* Approve */}
                                    {req.status === "pending" && (
                                      <button
                                        onClick={() => handleOpenApprove(req)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition"
                                      >
                                        <ApproveIcon sx={{ fontSize: 15 }} />
                                        Duyệt
                                      </button>
                                    )}

                                    {/* Reject */}
                                    {req.status === "pending" && (
                                      <button
                                        onClick={() => handleOpenReject(req)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-red-50 text-red-600 hover:bg-red-500 hover:text-white transition"
                                      >
                                        <RejectIcon sx={{ fontSize: 15 }} />
                                        Từ chối
                                      </button>
                                    )}

                                    {/* Xem báo cáo trả xe từ đội (pending_return) */}
                                    {req.status === "pending_return" && (
                                      <button
                                        onClick={() => handleOpenReturnReport(req)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-sm animate-pulse"
                                      >
                                        <ReturnIcon sx={{ fontSize: 15 }} />
                                        Xem báo cáo
                                      </button>
                                    )}

                                    {/* Thu hồi thủ công khi approved (chưa có báo cáo từ đội) */}
                                    {req.status === "approved" && (
                                      <button
                                        onClick={() => handleReturn(req)}
                                        disabled={returnLoading === req.id}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white disabled:opacity-50 transition"
                                      >
                                        <ReturnIcon sx={{ fontSize: 15 }} />
                                        {returnLoading === req.id ? "..." : "Thu hồi"}
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                      <p className="text-xs text-slate-500">
                        Trang{" "}
                        <span className="font-bold text-slate-700">
                          {requestPagination.page}
                        </span>{" "}
                        /{" "}
                        <span className="font-bold text-slate-700">
                          {requestPagination.totalPages}
                        </span>{" "}
                        — Tổng{" "}
                        <span className="font-bold text-slate-700">
                          {requestPagination.total}
                        </span>{" "}
                        yêu cầu
                      </p>
                      <div className="flex gap-2">
                        <button
                          disabled={requestPagination.page <= 1}
                          onClick={() =>
                            fetchRequests(requestPagination.page - 1)
                          }
                          className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                          ← Trước
                        </button>
                        <button
                          disabled={
                            requestPagination.page >=
                            requestPagination.totalPages
                          }
                          onClick={() =>
                            fetchRequests(requestPagination.page + 1)
                          }
                          className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                          Sau →
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-10 pt-6 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-400">
              © 2026 ReliefOps System · Quản lý phương tiện cứu hộ
            </p>
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      <VehicleFormModal
        open={vehicleFormOpen}
        onClose={() => {
          setVehicleFormOpen(false);
          setEditingVehicle(null);
        }}
        onSave={handleSaveVehicle}
        editingVehicle={editingVehicle}
      />
      <DeleteConfirmModal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeletingVehicle(null);
        }}
        onConfirm={handleConfirmDelete}
        vehicle={deletingVehicle}
        deleting={deleteLoading}
      />
      <ApproveRequestModal
        open={approveModalOpen}
        onClose={() => {
          setApproveModalOpen(false);
          setApprovingRequest(null);
        }}
        onApprove={handleApprove}
        request={approvingRequest}
        availableVehicles={availableVehicles}
        approving={approveLoading}
      />
      <RejectRequestModal
        open={rejectModalOpen}
        onClose={() => {
          setRejectModalOpen(false);
          setRejectingRequest(null);
        }}
        onReject={handleReject}
        request={rejectingRequest}
        rejecting={rejectLoading}
      />
      <RequestDetailModal
        open={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          setDetailRequest(null);
        }}
        request={detailRequest}
      />
      <ReturnReportModal
        open={returnReportOpen}
        onClose={() => {
          setReturnReportOpen(false);
          setReturnReportRequest(null);
        }}
        request={returnReportRequest}
        onConfirmReturn={handleReturn}
        returnLoading={returnLoading === returnReportRequest?.id}
      />

      {/* ── Toast ── */}
      <Toast
        msg={toast.msg}
        type={toast.type}
        onClose={() => setToast({ msg: "", type: "success" })}
      />
    </div>
  );
}
