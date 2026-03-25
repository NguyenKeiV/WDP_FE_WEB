import React, { useState, useEffect, useCallback, useRef } from "react";
import Sidebar from "../../components/manager/Sidebar";
import { charityCampaignsApi } from "../../api/charityCampaigns";
import {
  VolunteerActivism as CampaignIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  CalendarMonth as CalendarIcon,
  LocationOn as LocationIcon,
  CheckCircle as ActiveIcon,
  Cancel as EndedIcon,
  StopCircle as StopIcon,
  Warning as WarningIcon,
  Image as ImageIcon,
  Upload as UploadIcon,
} from "@mui/icons-material";

const formatDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatDateTime = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ─── Toast ────────────────────────────────────────────────────────────────────
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
        <ActiveIcon sx={{ fontSize: 18 }} />
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

// ─── Modal tạo campaign ────────────────────────────────────────────────────────
function CreateCampaignModal({ open, onClose, onSave }) {
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    address: "",
    start_date: "",
    end_date: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    if (open) {
      setForm({
        title: "",
        description: "",
        address: "",
        start_date: "",
        end_date: "",
      });
      setImageFile(null);
      setImagePreview(null);
      setErrors({});
      setApiError("");
    }
  }, [open]);

  if (!open) return null;

  const set = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: "" }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrors((p) => ({ ...p, image: "Chỉ chấp nhận file ảnh" }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((p) => ({ ...p, image: "Ảnh không được vượt quá 5MB" }));
      return;
    }
    setImageFile(file);
    setErrors((p) => ({ ...p, image: "" }));
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = "Vui lòng nhập tiêu đề";
    if (!form.address.trim()) errs.address = "Vui lòng nhập địa chỉ";
    if (!form.start_date) errs.start_date = "Vui lòng chọn ngày bắt đầu";
    if (!form.end_date) errs.end_date = "Vui lòng chọn ngày kết thúc";
    if (
      form.start_date &&
      form.end_date &&
      new Date(form.start_date) >= new Date(form.end_date)
    ) {
      errs.end_date = "Ngày kết thúc phải sau ngày bắt đầu";
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setSaving(true);
    setApiError("");
    try {
      const fd = new FormData();
      fd.append("title", form.title.trim());
      fd.append("address", form.address.trim());
      fd.append("start_date", form.start_date);
      fd.append("end_date", form.end_date);
      if (form.description.trim())
        fd.append("description", form.description.trim());
      if (imageFile) fd.append("image", imageFile);
      await onSave(fd);
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
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-500 to-pink-600 p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-xl">
              <CampaignIcon sx={{ fontSize: 22, color: "white" }} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Tạo đợt quyên góp mới
              </h2>
              <p className="text-rose-100 text-xs mt-0.5">
                Thông báo sẽ hiển thị tới tất cả người dùng
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/70 hover:bg-white/20 transition"
          >
            <CloseIcon sx={{ fontSize: 20 }} />
          </button>
        </div>

        {/* Body */}
        <form
          onSubmit={handleSubmit}
          className="overflow-y-auto flex-1 p-6 space-y-4"
        >
          {apiError && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-300 text-red-700 rounded-xl px-4 py-3 text-sm">
              <WarningIcon
                sx={{ fontSize: 16, marginTop: "2px", flexShrink: 0 }}
              />
              <span>{apiError}</span>
            </div>
          )}

          {/* Tiêu đề */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Tiêu đề sự kiện <span className="text-red-500">*</span>
            </label>
            <input
              value={form.title}
              onChange={set("title")}
              placeholder="VD: Quyên góp hỗ trợ người dân vùng lũ Thủ Đức"
              className={inputCls(errors.title)}
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1">{errors.title}</p>
            )}
          </div>

          {/* Mô tả */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Mô tả{" "}
              <span className="text-gray-400 font-normal">(tuỳ chọn)</span>
            </label>
            <textarea
              value={form.description}
              onChange={set("description")}
              rows={3}
              placeholder="Mô tả chi tiết về đợt quyên góp, mục tiêu, cách thức tham gia..."
              className={`${inputCls(false)} resize-none`}
            />
          </div>

          {/* Địa chỉ */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Địa chỉ <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <LocationIcon
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                sx={{ fontSize: 16 }}
              />
              <input
                value={form.address}
                onChange={set("address")}
                placeholder="VD: Phường Linh Xuân, TP. Thủ Đức, TP.HCM"
                className={`pl-9 ${inputCls(errors.address)}`}
              />
            </div>
            {errors.address && (
              <p className="text-red-500 text-xs mt-1">{errors.address}</p>
            )}
          </div>

          {/* Ngày bắt đầu - kết thúc */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Ngày bắt đầu <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <CalendarIcon
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  sx={{ fontSize: 16 }}
                />
                <input
                  type="datetime-local"
                  value={form.start_date}
                  onChange={set("start_date")}
                  className={`pl-9 ${inputCls(errors.start_date)}`}
                />
              </div>
              {errors.start_date && (
                <p className="text-red-500 text-xs mt-1">{errors.start_date}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Ngày kết thúc <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <CalendarIcon
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  sx={{ fontSize: 16 }}
                />
                <input
                  type="datetime-local"
                  value={form.end_date}
                  onChange={set("end_date")}
                  className={`pl-9 ${inputCls(errors.end_date)}`}
                />
              </div>
              {errors.end_date && (
                <p className="text-red-500 text-xs mt-1">{errors.end_date}</p>
              )}
            </div>
          </div>

          {/* Upload ảnh poster */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Ảnh poster{" "}
              <span className="text-gray-400 font-normal">
                (tuỳ chọn, tối đa 5MB)
              </span>
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />

            {imagePreview ? (
              <div className="relative rounded-xl overflow-hidden border border-gray-200 group">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-white text-gray-800 rounded-xl text-sm font-semibold hover:bg-gray-100 transition"
                  >
                    Thay ảnh
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition"
                  >
                    Xóa ảnh
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 hover:border-rose-400 rounded-2xl p-8 text-center cursor-pointer transition-colors hover:bg-rose-50/30"
              >
                <ImageIcon
                  sx={{ fontSize: 40 }}
                  className="text-gray-300 mb-2"
                />
                <p className="text-sm font-semibold text-gray-500">
                  Nhấn để tải ảnh poster lên
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  PNG, JPG, WEBP — Tối đa 5MB
                </p>
              </div>
            )}
            {errors.image && (
              <p className="text-red-500 text-xs mt-1">{errors.image}</p>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="shrink-0 border-t border-gray-100 px-6 py-4 flex justify-end gap-3 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-100 transition"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 disabled:opacity-50 transition shadow-lg shadow-rose-500/25"
          >
            {saving ? (
              <>
                <RefreshIcon sx={{ fontSize: 16 }} className="animate-spin" />
                Đang tạo...
              </>
            ) : (
              <>
                <AddIcon sx={{ fontSize: 18 }} />
                Tạo sự kiện
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Card campaign ────────────────────────────────────────────────────────────
function CampaignCard({ campaign, onEnd, ending }) {
  const isActive = campaign.status === "active";
  const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(
    /\/api$/,
    "",
  );
  const imageUrl = campaign.image_url
    ? campaign.image_url.startsWith("http")
      ? campaign.image_url
      : `${API_BASE}${campaign.image_url}`
    : null;

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border-2 overflow-hidden transition-all hover:shadow-lg ${isActive ? "border-rose-200" : "border-gray-200 opacity-70"}`}
    >
      {/* Ảnh */}
      {imageUrl ? (
        <div className="h-44 overflow-hidden relative">
          <img
            src={imageUrl}
            alt={campaign.title}
            className="w-full h-full object-cover"
          />
          {isActive && (
            <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-rose-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              Đang diễn ra
            </div>
          )}
          {!isActive && (
            <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-gray-500 text-white px-3 py-1.5 rounded-full text-xs font-bold">
              <EndedIcon sx={{ fontSize: 12 }} />
              Đã kết thúc
            </div>
          )}
        </div>
      ) : (
        <div
          className={`h-44 flex items-center justify-center ${isActive ? "bg-gradient-to-br from-rose-400 to-pink-500" : "bg-gray-200"}`}
        >
          <CampaignIcon
            sx={{ fontSize: 56, color: isActive ? "white" : "#9ca3af" }}
          />
          {isActive && (
            <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-rose-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              Đang diễn ra
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-5">
        <h3 className="font-bold text-gray-900 text-base leading-tight mb-2 line-clamp-2">
          {campaign.title}
        </h3>

        {campaign.description && (
          <p className="text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed">
            {campaign.description}
          </p>
        )}

        <div className="space-y-2 mb-4">
          {campaign.address && (
            <div className="flex items-start gap-2 text-xs text-gray-600">
              <LocationIcon
                sx={{ fontSize: 14 }}
                className="text-rose-400 mt-0.5 shrink-0"
              />
              <span className="line-clamp-1">{campaign.address}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <CalendarIcon
              sx={{ fontSize: 14 }}
              className="text-blue-400 shrink-0"
            />
            <span>
              {formatDate(campaign.start_date)} —{" "}
              {formatDate(campaign.end_date)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            Tạo: {formatDateTime(campaign.createdAt || campaign.created_at)}
          </p>
          {isActive && (
            <button
              onClick={() => onEnd(campaign)}
              disabled={ending}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 transition"
            >
              {ending ? (
                <RefreshIcon sx={{ fontSize: 14 }} className="animate-spin" />
              ) : (
                <StopIcon sx={{ fontSize: 14 }} />
              )}
              Kết thúc
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function ManagerCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [activeCampaign, setActiveCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [endingId, setEndingId] = useState(null);
  const [confirmEnd, setConfirmEnd] = useState(null);
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => setToast({ msg, type });

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const res = await charityCampaignsApi.getAll();
      const list = res.campaigns || res.data || [];
      setCampaigns(Array.isArray(list) ? list : []);
      // lấy campaign đang active
      const active = (Array.isArray(list) ? list : []).find(
        (c) => c.status === "active",
      );
      setActiveCampaign(active || null);
    } catch (e) {
      showToast(e.message || "Không thể tải danh sách", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const handleCreate = async (formData) => {
    await charityCampaignsApi.create(formData);
    showToast("Tạo sự kiện thành công! Citizen sẽ thấy poster khi đăng nhập.");
    fetchCampaigns();
  };

  const handleEnd = async (campaign) => {
    setEndingId(campaign.id);
    try {
      await charityCampaignsApi.end(campaign.id);
      showToast("Đã kết thúc sự kiện. Poster sẽ không hiển thị nữa.");
      setConfirmEnd(null);
      fetchCampaigns();
    } catch (e) {
      showToast(e.message || "Kết thúc thất bại", "error");
    } finally {
      setEndingId(null);
    }
  };

  const activeCampaigns = campaigns.filter((c) => c.status === "active");
  const endedCampaigns = campaigns.filter((c) => c.status === "ended");

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-rose-50/20 to-pink-50/10">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-8 max-w-[1600px] mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-start justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                <CampaignIcon sx={{ fontSize: 40 }} className="text-rose-500" />
                Quản Lý Sự Kiện Quyên Góp
              </h1>
              <p className="text-slate-600 text-sm">
                Tạo và quản lý các đợt kêu gọi quyên góp — Poster sẽ hiển thị
                tới tất cả citizen khi đăng nhập
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchCampaigns}
                className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl transition shadow-sm text-sm font-semibold text-slate-600"
              >
                <RefreshIcon
                  sx={{ fontSize: 18 }}
                  className={loading ? "animate-spin" : ""}
                />
                Làm mới
              </button>
              <button
                onClick={() => setCreateModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white rounded-2xl shadow-lg shadow-rose-500/25 text-sm font-semibold transition"
              >
                <AddIcon sx={{ fontSize: 20 }} />
                Tạo sự kiện mới
              </button>
            </div>
          </div>

          {/* Banner active campaign */}
          {activeCampaign && (
            <div className="bg-gradient-to-r from-rose-500 to-pink-600 rounded-3xl p-6 mb-8 text-white shadow-xl shadow-rose-500/20">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-2xl">
                    <CampaignIcon sx={{ fontSize: 32 }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-xs font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        Đang hoạt động
                      </span>
                    </div>
                    <h2 className="text-xl font-bold">
                      {activeCampaign.title}
                    </h2>
                    <p className="text-rose-100 text-sm mt-0.5 flex items-center gap-1">
                      <LocationIcon sx={{ fontSize: 14 }} />
                      {activeCampaign.address}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-rose-100 text-xs mb-1">Thời gian</p>
                  <p className="font-bold text-sm">
                    {formatDate(activeCampaign.start_date)} —{" "}
                    {formatDate(activeCampaign.end_date)}
                  </p>
                  <button
                    onClick={() => setConfirmEnd(activeCampaign)}
                    className="mt-3 flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-semibold transition"
                  >
                    <StopIcon sx={{ fontSize: 16 }} />
                    Kết thúc sự kiện
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            {[
              {
                label: "Tổng sự kiện",
                value: campaigns.length,
                icon: <CampaignIcon sx={{ fontSize: 26 }} />,
                gradient: "from-slate-500 to-slate-600",
                sub: "Đã tạo từ trước đến nay",
              },
              {
                label: "Đang diễn ra",
                value: activeCampaigns.length,
                icon: <ActiveIcon sx={{ fontSize: 26 }} />,
                gradient: "from-rose-500 to-pink-600",
                sub:
                  activeCampaigns.length > 0
                    ? "Poster đang hiển thị"
                    : "Không có sự kiện nào",
                pulse: activeCampaigns.length > 0,
              },
              {
                label: "Đã kết thúc",
                value: endedCampaigns.length,
                icon: <EndedIcon sx={{ fontSize: 26 }} />,
                gradient: "from-gray-400 to-gray-500",
                sub: "Sự kiện đã hoàn tất",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="group relative bg-white rounded-3xl p-5 shadow-sm border border-slate-200/60 hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={`p-3 rounded-2xl bg-gradient-to-br ${s.gradient} text-white shadow-lg`}
                  >
                    {s.icon}
                  </div>
                  {s.pulse && (
                    <span className="relative flex h-3 w-3 mt-1">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
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

          {/* Hướng dẫn nếu chưa có campaign */}
          {!loading && campaigns.length === 0 && (
            <div className="bg-white rounded-3xl border-2 border-dashed border-rose-200 p-16 text-center">
              <CampaignIcon
                sx={{ fontSize: 64 }}
                className="text-rose-200 mb-4"
              />
              <h3 className="text-xl font-bold text-slate-700 mb-2">
                Chưa có sự kiện nào
              </h3>
              <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">
                Tạo sự kiện quyên góp đầu tiên. Poster sẽ hiển thị tự động tới
                tất cả citizen khi họ đăng nhập vào app.
              </p>
              <button
                onClick={() => setCreateModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-2xl font-semibold shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 transition"
              >
                <AddIcon sx={{ fontSize: 20 }} />
                Tạo sự kiện đầu tiên
              </button>
            </div>
          )}

          {/* Danh sách active */}
          {!loading && activeCampaigns.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                Đang diễn ra ({activeCampaigns.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {activeCampaigns.map((c) => (
                  <CampaignCard
                    key={c.id}
                    campaign={c}
                    onEnd={(camp) => setConfirmEnd(camp)}
                    ending={endingId === c.id}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Danh sách đã kết thúc */}
          {!loading && endedCampaigns.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <EndedIcon sx={{ fontSize: 18 }} className="text-gray-400" />
                Đã kết thúc ({endedCampaigns.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {endedCampaigns.map((c) => (
                  <CampaignCard
                    key={c.id}
                    campaign={c}
                    onEnd={() => {}}
                    ending={false}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-24">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-rose-500 border-t-transparent" />
              <span className="ml-3 text-slate-500 font-medium">
                Đang tải...
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Confirm end modal */}
      {confirmEnd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setConfirmEnd(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-orange-100 rounded-2xl">
                <StopIcon sx={{ fontSize: 28, color: "#f97316" }} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Kết thúc sự kiện?
                </h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  Poster sẽ ngừng hiển thị ngay lập tức
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-700 bg-slate-50 rounded-xl p-4 border border-slate-200 mb-5">
              Sự kiện{" "}
              <span className="font-bold text-slate-900">
                "{confirmEnd.title}"
              </span>{" "}
              sẽ bị kết thúc. Citizen sẽ không thấy poster này nữa.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmEnd(null)}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-100 transition"
              >
                Hủy
              </button>
              <button
                onClick={() => handleEnd(confirmEnd)}
                disabled={endingId === confirmEnd.id}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-50 transition"
              >
                {endingId === confirmEnd.id ? (
                  <RefreshIcon sx={{ fontSize: 16 }} className="animate-spin" />
                ) : (
                  <StopIcon sx={{ fontSize: 16 }} />
                )}
                Xác nhận kết thúc
              </button>
            </div>
          </div>
        </div>
      )}

      <CreateCampaignModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSave={handleCreate}
      />

      <Toast
        msg={toast.msg}
        type={toast.type}
        onClose={() => setToast({ msg: "", type: "success" })}
      />
    </div>
  );
}
