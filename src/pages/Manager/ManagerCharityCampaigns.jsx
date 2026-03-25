import React, { useEffect, useMemo, useRef, useState } from "react";
import Sidebar from "../../components/manager/Sidebar";
import { createCharityCampaign, getCharityCampaigns } from "../../services/charityCampaignsService";

import {
  Add as AddIcon,
  Close as CloseIcon,
  Image as ImageIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";

const formatDateOnly = (d) => {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("vi-VN");
  } catch {
    return String(d);
  }
};

export default function ManagerCharityCampaigns() {
  const posterInputRef = useRef(null);

  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState("");
  const [campaigns, setCampaigns] = useState([]);
  const [pagination, setPagination] = useState(null);

  const [campaignName, setCampaignName] = useState("");
  const [address, setAddress] = useState("");
  const [startAt, setStartAt] = useState(new Date().toISOString().slice(0, 10));
  const [endAt, setEndAt] = useState("");
  const [reason, setReason] = useState("");
  const [posterFiles, setPosterFiles] = useState([]);
  const [posterPreviews, setPosterPreviews] = useState([]);

  const postersCount = posterFiles.length;

  const canSubmit = useMemo(() => {
    return (
      campaignName.trim().length > 0 &&
      address.trim().length > 0 &&
      reason.trim().length > 0 &&
      String(startAt || "").trim().length > 0 &&
      String(endAt || "").trim().length > 0 &&
      postersCount > 0
    );
  }, [campaignName, address, endAt, postersCount, reason, startAt]);

  const load = async (page = 1) => {
    setListLoading(true);
    setListError("");
    try {
      const res = await getCharityCampaigns({ page, limit: 20 });
      if (res?.success) {
        setCampaigns(res?.data || []);
        setPagination(res?.pagination || null);
      } else {
        setCampaigns([]);
        setPagination(null);
        setListError(res?.error || "Không thể tải danh sách chiến dịch");
      }
    } catch (e) {
      setCampaigns([]);
      setPagination(null);
      setListError(e?.message || "Không thể tải danh sách chiến dịch");
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    load(1);
  }, []);

  useEffect(() => {
    // Create previews for selected poster files.
    const previews = posterFiles.map((f) => URL.createObjectURL(f));
    setPosterPreviews(previews);
    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p));
    };
  }, [posterFiles]);

  const handleChoosePosters = () => {
    posterInputRef.current?.click();
  };

  const handlePosterChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setPosterFiles(files);
  };

  const handleRemovePoster = (idx) => {
    setPosterFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) {
      alert(
        "Vui lòng nhập đầy đủ: tên đợt quyên góp, địa chỉ, thời gian bắt đầu, thời gian kết thúc, lý do và ít nhất 1 ảnh poster.",
      );
      return;
    }
    try {
      const res = await createCharityCampaign({
        name: campaignName.trim(),
        address: address.trim(),
        start_at: startAt,
        end_at: endAt,
        reason: reason.trim(),
        posterFiles,
      });

      if (res?.success) {
        // Reset form
        setCampaignName("");
        setAddress("");
        setReason("");
        setEndAt("");
        setPosterFiles([]);
        if (posterInputRef.current) posterInputRef.current.value = "";
        // Refresh list
        await load(1);
      } else {
        alert(res?.error || res?.message || "Tạo đợt quyên góp thất bại");
      }
    } catch (err) {
      alert(err?.message || "Tạo đợt quyên góp thất bại");
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-8 max-w-[1600px] mx-auto">
          <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
                Tạo đợt quyên góp
              </h1>
              <p className="text-slate-600 text-base">
                Manager tạo chiến dịch, BE sẽ gửi push tới người dùng có `expo_push_token`.
              </p>
            </div>
            <button
              type="button"
              onClick={() => load(1)}
              className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold transition-colors shadow-sm"
            >
              <RefreshIcon sx={{ fontSize: 20 }} />
              Làm mới
            </button>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Thông tin chiến dịch</h2>
            </div>

            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Tên đợt quyên góp <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      value={campaignName}
                      onChange={(e) => setCampaignName(e.target.value)}
                      placeholder="VD: Đợt quyên góp mùa mưa"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Địa chỉ <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="VD: Địa chỉ nhận hàng quyên góp..."
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Thời gian bắt đầu <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="date"
                      value={startAt}
                      onChange={(e) => setStartAt(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Thời gian kết thúc <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="date"
                      value={endAt}
                      onChange={(e) => setEndAt(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Lý do <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="VD: Quyên góp nhu yếu phẩm cho khu vực..."
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  <div className="flex items-start justify-between gap-3 flex-col sm:flex-row sm:items-center">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Ảnh poster <span className="text-red-500">*</span>
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={handleChoosePosters}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-xl text-blue-700 font-semibold transition-colors text-sm"
                    >
                      <AddIcon sx={{ fontSize: 18 }} />
                      Chọn ảnh
                    </button>
                    <input
                      ref={posterInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePosterChange}
                      className="hidden"
                    />
                  </div>

                  {posterPreviews.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">
                      {posterPreviews.map((src, idx) => (
                        <div
                          key={src}
                          className="relative rounded-2xl overflow-hidden border border-slate-200 bg-white"
                        >
                          <img
                            src={src}
                            alt={`Poster ${idx + 1}`}
                            className="w-full h-28 object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemovePoster(idx)}
                            className="absolute top-2 right-2 w-7 h-7 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
                          >
                            <CloseIcon sx={{ fontSize: 16 }} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-4 flex items-center gap-2 text-slate-500 text-sm">
                      <ImageIcon sx={{ fontSize: 18 }} />
                      Chưa chọn ảnh
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/25 transition-all text-sm disabled:opacity-50"
                  >
                    Tạo đợt quyên góp
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="mt-6 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Danh sách chiến dịch gần đây
                </h2>
              </div>
            </div>

            {listLoading ? (
              <div className="py-16 text-center text-slate-500 text-sm">
                Đang tải...
              </div>
            ) : listError ? (
              <div className="px-6 py-4">
                <div className="text-sm font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  {listError}
                </div>
              </div>
            ) : campaigns.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-sm">
                Chưa có chiến dịch nào
              </div>
            ) : (
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {campaigns.map((c) => (
                    <div
                      key={c.id}
                      className="bg-slate-50 border border-slate-200 rounded-3xl p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                            {c.status === "active" ? "Đang hoạt động" : "Đã dừng"}
                          </p>
                          <p className="text-lg font-bold text-slate-900 truncate mt-1">
                            {c.name || c.reason || "—"}
                          </p>
                          <p className="text-sm text-slate-600 mt-2">
                            {c.reason ? `📝 ${c.reason}` : ""}
                          </p>
                          <p className="text-sm text-slate-600 mt-1">
                            📍 {c.address || "—"}
                          </p>
                          <p className="text-sm text-slate-600 mt-1">
                            🗓️ {formatDateOnly(c.start_at)}{" "}
                            {c.end_at ? `- ${formatDateOnly(c.end_at)}` : ""}
                          </p>
                          <p className="text-sm text-slate-500 mt-2">
                            Manager: {c.manager?.username || "—"}
                          </p>
                        </div>
                      </div>

                      {(c.poster_urls || []).length > 0 && (
                        <div className="mt-4 grid grid-cols-3 gap-2">
                          {(c.poster_urls || []).slice(0, 6).map((url, idx) => (
                            <div
                              key={`${c.id}-p-${idx}`}
                              className="rounded-2xl overflow-hidden border border-slate-200 bg-white"
                            >
                              <img
                                src={url}
                                alt={`Poster ${idx + 1}`}
                                className="w-full h-24 object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pagination could be added later if needed */}
          </div>
        </div>
      </div>
    </div>
  );
}

