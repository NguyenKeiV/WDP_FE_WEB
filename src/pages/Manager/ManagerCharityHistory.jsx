import React, { useCallback, useMemo, useState } from "react";
import Sidebar from "../../components/manager/Sidebar";
import { getCharityHistoryByPhone } from "../../services/charityService";

const VN_PHONE_REGEX = /^0\d{9}$/;

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("vi-VN");
};

function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.totalPages <= 1) return null;
  const { page, totalPages, total } = pagination;

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
      <p className="text-sm text-slate-500">
        Tổng <span className="font-semibold text-slate-800">{total}</span> bản ghi
      </p>
      <div className="flex items-center gap-2">
        <button
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Trước
        </button>
        <span className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-xl">
          {page} / {totalPages}
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Sau
        </button>
      </div>
    </div>
  );
}

export default function ManagerCharityHistory() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [histories, setHistories] = useState([]);
  const [pagination, setPagination] = useState(null);

  const limit = 20;

  const validatePhone = useCallback((raw) => {
    const p = String(raw || "").trim();
    if (!p) return { ok: false, message: "Vui lòng nhập SĐT." };
    if (!VN_PHONE_REGEX.test(p))
      return {
        ok: false,
        message: "Số điện thoại không hợp lệ (10 chữ số, bắt đầu 0).",
      };
    return { ok: true, value: p };
  }, []);

  const loadHistory = useCallback(
    async (page = 1) => {
      const v = validatePhone(phone);
      if (!v.ok) {
        setError(v.message);
        setHistories([]);
        setPagination(null);
        return;
      }

      setLoading(true);
      setError("");
      try {
        const res = await getCharityHistoryByPhone({
          donorPhone: v.value,
          page,
          limit,
        });
        if (!res.success) {
          setError(res.error || "Không thể tải lịch sử quyên góp.");
          setHistories([]);
          setPagination(null);
          return;
        }
        setHistories(res.histories || []);
        setPagination(res.pagination || null);
      } finally {
        setLoading(false);
      }
    },
    [limit, phone, validatePhone],
  );

  const totalQuantity = useMemo(() => {
    // BE trả về items theo từng lịch sử; ở đây chỉ tổng cho view hiện tại
    return histories.reduce((sum, h) => {
      const itemsSum = (h.items || []).reduce(
        (s, it) => s + (Number(it.quantity) || 0),
        0,
      );
      return sum + itemsSum;
    }, 0);
  }, [histories]);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-8 max-w-[1600px] mx-auto">
          <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
                Lịch sử quyên góp
              </h1>
              <p className="text-slate-600 text-base">
                Tra cứu theo số điện thoại người quyên góp (SĐT quy định: 0XXXXXXXXX)
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[260px]">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  SĐT người quyên góp
                </label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="VD: 0901234567"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <button
                type="button"
                onClick={() => loadHistory(1)}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-2xl font-semibold text-sm shadow-lg shadow-purple-500/25 transition-all disabled:opacity-50"
              >
                {loading ? "Đang tìm..." : "Tra cứu"}
              </button>
            </div>

            {error && (
              <div className="px-6 py-4">
                <div className="text-sm font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  {error}
                </div>
              </div>
            )}

            {histories.length === 0 && !loading && !error ? (
              <div className="flex items-center justify-center py-16 text-slate-400">
                Chưa có dữ liệu
              </div>
            ) : (
              <div className="p-4">
                <div className="text-sm text-slate-500 px-2 mb-3">
                  Tổng số lượng item (trong kết quả hiện tại):{" "}
                  <span className="font-semibold text-slate-800">
                    {totalQuantity}
                  </span>
                </div>

                <div className="space-y-4">
                  {histories.map((h) => (
                    <div
                      key={h.receipt_code}
                      className="bg-slate-50 border border-slate-200 rounded-2xl p-5"
                    >
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                            Mã biên nhận
                          </p>
                          <p className="text-lg font-bold text-slate-900">
                            {h.receipt_code || "—"}
                          </p>
                        </div>
                        <div className="text-sm text-slate-600 md:text-right">
                          <div>
                            <span className="font-semibold text-slate-700">
                              Ngày:
                            </span>{" "}
                            {formatDate(h.import_date)}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-700">
                              Người hoàn tất:
                            </span>{" "}
                            {h.manager?.username || "—"}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-white border border-slate-200 rounded-xl p-4">
                          <p className="text-xs text-slate-500">Người quyên góp</p>
                          <p className="font-semibold text-slate-900 mt-1">
                            {h.donor_name || "—"}
                          </p>
                          <p className="text-sm text-slate-600 mt-1">
                            SĐT: {h.donor_phone || "—"}
                          </p>
                        </div>
                        <div className="bg-white border border-slate-200 rounded-xl p-4">
                          <p className="text-xs text-slate-500">Danh sách vật tư</p>
                          <div className="mt-2 space-y-2">
                            {(h.items || []).map((it) => (
                              <div
                                key={it.supply_id || it.supply_name}
                                className="flex items-center justify-between gap-3"
                              >
                                <span className="text-sm font-semibold text-slate-800 truncate">
                                  {it.supply_name || "—"}
                                </span>
                                <span className="text-sm text-slate-600 whitespace-nowrap">
                                  {it.quantity} {it.unit || ""}
                                </span>
                              </div>
                            ))}
                            {(h.items || []).length === 0 && (
                              <div className="text-sm text-slate-400">
                                Không có item
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Pagination
              pagination={pagination}
              onPageChange={(p) => loadHistory(p)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

