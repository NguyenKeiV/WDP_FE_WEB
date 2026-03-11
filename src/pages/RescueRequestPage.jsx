import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { requestsApi } from "../api/requests";
import authService from "../services/authService";

const CATEGORY_OPTIONS = [
  { value: "rescue", label: "Cứu hộ", icon: "emergency", desc: "Ngập nước, sập nhà, mắc kẹt..." },
  { value: "relief", label: "Cứu trợ", icon: "volunteer_activism", desc: "Thiếu lương thực, nước uống, y tế..." },
];

const PRIORITY_OPTIONS = [
  { value: "urgent", label: "Nguy kịch", color: "bg-red-100 text-red-700 border-red-300" },
  { value: "high", label: "Ưu tiên cao", color: "bg-orange-100 text-orange-700 border-orange-300" },
  { value: "medium", label: "Trung bình", color: "bg-yellow-100 text-yellow-700 border-yellow-300" },
  { value: "low", label: "Thấp", color: "bg-slate-100 text-slate-600 border-slate-300" },
];

export default function RescueRequestPage() {
  const navigate = useNavigate();
  const isLoggedIn = authService.isAuthenticated();
  const currentUser = authService.getCurrentUser();

  const [form, setForm] = useState({
    phone_number: "",
    district: "",
    address: "",
    description: "",
    category: "rescue",
    priority: "medium",
    location_type: "manual",
    num_people: "",
    latitude: "",
    longitude: "",
  });
  const [mediaUrlInput, setMediaUrlInput] = useState("");
  const [mediaUrls, setMediaUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [geoLoading, setGeoLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn && currentUser) {
      setForm((prev) => ({
        ...prev,
        phone_number: currentUser.phone_number || prev.phone_number,
      }));
    }
  }, [isLoggedIn, currentUser]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (error) setError("");
  };

  const addMediaUrl = () => {
    const url = mediaUrlInput.trim();
    if (!url) return;
    if (mediaUrls.length >= 5) {
      setError("Tối đa 5 ảnh/video");
      return;
    }
    try {
      new URL(url);
    } catch {
      setError("URL không hợp lệ");
      return;
    }
    setMediaUrls((prev) => [...prev, url]);
    setMediaUrlInput("");
  };

  const removeMediaUrl = (idx) => {
    setMediaUrls((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError("Trình duyệt không hỗ trợ định vị");
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((prev) => ({
          ...prev,
          location_type: "gps",
          latitude: String(pos.coords.latitude),
          longitude: String(pos.coords.longitude),
        }));
        setGeoLoading(false);
      },
      () => {
        setError("Không thể lấy vị trí. Vui lòng nhập địa chỉ thủ công.");
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.phone_number.trim()) {
      setError("Vui lòng nhập số điện thoại liên lạc");
      return;
    }
    if (!form.district.trim()) {
      setError("Vui lòng nhập quận/huyện");
      return;
    }
    if (!form.description.trim() || form.description.trim().length < 10) {
      setError("Vui lòng mô tả tình huống (tối thiểu 10 ký tự)");
      return;
    }
    if (form.location_type === "manual" && !form.address.trim()) {
      setError("Vui lòng nhập địa chỉ cụ thể");
      return;
    }
    if (form.location_type === "gps" && (!form.latitude || !form.longitude)) {
      setError("Chưa có tọa độ GPS. Vui lòng bấm 'Lấy vị trí' hoặc chọn nhập thủ công.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const payload = {
        phone_number: form.phone_number.trim(),
        district: form.district.trim(),
        description: form.description.trim(),
        category: form.category,
        priority: form.priority,
        location_type: form.location_type,
      };
      if (form.num_people) payload.num_people = Number(form.num_people);
      if (mediaUrls.length > 0) payload.media_urls = mediaUrls;

      if (form.location_type === "gps") {
        payload.latitude = Number(form.latitude);
        payload.longitude = Number(form.longitude);
      } else {
        payload.address = form.address.trim();
      }

      await requestsApi.create(payload);
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Không thể gửi yêu cầu. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl border border-emerald-100 p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-emerald-600 text-4xl">check_circle</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Gửi yêu cầu thành công!</h2>
          <p className="text-slate-500 mb-6">
            Yêu cầu {form.category === "rescue" ? "cứu hộ" : "cứu trợ"} của bạn đã được tiếp nhận.
            Đội điều phối sẽ xử lý trong thời gian sớm nhất.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setSuccess(false);
                setForm({ phone_number: currentUser?.phone_number || "", district: "", address: "", description: "", category: "rescue", priority: "medium", location_type: "manual", num_people: "", latitude: "", longitude: "" });
                setMediaUrls([]);
                setMediaUrlInput("");
              }}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
            >
              Gửi yêu cầu mới
            </button>
            {isLoggedIn && (
              <button
                onClick={() => navigate(-1)}
                className="flex-1 py-3 border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
              >
                Quay lại
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#063660] text-white rounded-xl flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-xl">emergency</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Yêu cầu Cứu hộ / Cứu trợ</h1>
              <p className="text-xs text-slate-500">Hệ thống Cứu hộ Việt Nam</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-semibold text-emerald-700">
                <span className="material-symbols-outlined text-sm">verified_user</span>
                {currentUser?.username || "Đã đăng nhập"}
              </div>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="px-4 py-2 text-sm font-semibold text-[#063660] border border-[#063660] rounded-xl hover:bg-[#063660] hover:text-white transition-colors"
              >
                Đăng nhập
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Form */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        {!isLoggedIn && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
            <span className="material-symbols-outlined text-blue-500 text-xl mt-0.5">info</span>
            <div>
              <p className="text-sm font-semibold text-blue-800">Bạn đang gửi yêu cầu mà chưa đăng nhập</p>
              <p className="text-xs text-blue-600 mt-1">
                Yêu cầu vẫn sẽ được xử lý, nhưng đăng nhập giúp bạn theo dõi trạng thái yêu cầu.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3">
              Loại yêu cầu <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {CATEGORY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, category: opt.value }))}
                  className={`relative p-4 rounded-2xl border-2 transition-all text-left ${
                    form.category === opt.value
                      ? "border-blue-500 bg-blue-50 shadow-md shadow-blue-100"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      form.category === opt.value ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
                    }`}>
                      <span className="material-symbols-outlined text-xl">{opt.icon}</span>
                    </div>
                    <span className="font-bold text-slate-900">{opt.label}</span>
                  </div>
                  <p className="text-xs text-slate-500">{opt.desc}</p>
                  {form.category === opt.value && (
                    <div className="absolute top-3 right-3">
                      <span className="material-symbols-outlined text-blue-600">check_circle</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3">
              Mức độ khẩn cấp <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {PRIORITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, priority: opt.value }))}
                  className={`px-4 py-2 rounded-xl border-2 text-sm font-semibold transition-all ${
                    form.priority === opt.value
                      ? opt.color + " border-current shadow-sm"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Phone + District */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">phone</span>
                <input
                  type="tel"
                  value={form.phone_number}
                  onChange={handleChange("phone_number")}
                  placeholder="0901234567"
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">
                Quận / Huyện <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">location_on</span>
                <input
                  type="text"
                  value={form.district}
                  onChange={handleChange("district")}
                  placeholder="VD: Quận Bình Thạnh"
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Location Type */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Vị trí <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, location_type: "manual" }))}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all flex items-center justify-center gap-2 ${
                  form.location_type === "manual"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                <span className="material-symbols-outlined text-base">edit_location</span>
                Nhập địa chỉ
              </button>
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={geoLoading}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all flex items-center justify-center gap-2 ${
                  form.location_type === "gps"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 text-slate-600 hover:border-slate-300"
                } disabled:opacity-50`}
              >
                {geoLoading ? (
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                ) : (
                  <span className="material-symbols-outlined text-base">my_location</span>
                )}
                Lấy vị trí GPS
              </button>
            </div>

            {form.location_type === "manual" && (
              <input
                type="text"
                value={form.address}
                onChange={handleChange("address")}
                placeholder="Nhập địa chỉ cụ thể: số nhà, đường, phường..."
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            )}
            {form.location_type === "gps" && form.latitude && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-base">check_circle</span>
                <span className="text-sm text-emerald-700">
                  Đã lấy tọa độ: {Number(form.latitude).toFixed(6)}, {Number(form.longitude).toFixed(6)}
                </span>
              </div>
            )}
          </div>

          {/* Num people */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              Số người cần hỗ trợ
            </label>
            <div className="relative max-w-xs">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">groups</span>
              <input
                type="number"
                min="1"
                value={form.num_people}
                onChange={handleChange("num_people")}
                placeholder="VD: 5"
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              Mô tả tình huống <span className="text-red-500">*</span> <span className="text-xs font-normal text-slate-400">(tối thiểu 10 ký tự)</span>
            </label>
            <textarea
              value={form.description}
              onChange={handleChange("description")}
              rows={4}
              placeholder="Mô tả chi tiết tình huống cần cứu hộ/cứu trợ: mức nước, số người, tình trạng sức khỏe..."
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>

          {/* Media URLs */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              Hình ảnh / Video đính kèm <span className="text-xs font-normal text-slate-400">(tối đa 5 link, tùy chọn)</span>
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="url"
                value={mediaUrlInput}
                onChange={(e) => setMediaUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addMediaUrl())}
                placeholder="Dán link ảnh/video (https://...)"
                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={addMediaUrl}
                disabled={!mediaUrlInput.trim() || mediaUrls.length >= 5}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold disabled:opacity-40 transition-colors"
              >
                Thêm
              </button>
            </div>
            {mediaUrls.length > 0 && (
              <div className="space-y-2">
                {mediaUrls.map((url, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                    <span className="material-symbols-outlined text-slate-400 text-sm">image</span>
                    <span className="flex-1 text-xs text-slate-600 truncate">{url}</span>
                    <button
                      type="button"
                      onClick={() => removeMediaUrl(idx)}
                      className="p-1 text-red-400 hover:text-red-600 transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-2">
              <span className="material-symbols-outlined text-red-500 text-lg mt-0.5">error</span>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-slate-300 disabled:to-slate-300 text-white font-bold text-lg rounded-2xl shadow-xl shadow-red-500/25 transition-all flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                Đang gửi yêu cầu...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-xl">sos</span>
                GỬI YÊU CẦU {form.category === "rescue" ? "CỨU HỘ" : "CỨU TRỢ"}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
