import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link } from "react-router-dom";
import Sidebar from "../../components/manager/Sidebar";
import Modal from "../../components/manager/Modal";
import ImportBatchForm from "../../components/manager/ImportBatchForm";
import {
  UploadFile as UploadIcon,
  Description as FileIcon,
  Close as CloseIcon,
  Info as InfoIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import {
  parseMultiDonorExcel,
  downloadMultiDonorTemplate,
  readFirstSheetJson,
} from "../../utils/importBatchFromExcel";
import {
  createAndCompleteImportBatch,
  getSupplies,
} from "../../services/warehouseService";
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
        Tổng <span className="font-semibold text-slate-800">{total}</span> bản
        ghi
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
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
          type="button"
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

// ─────────────────────────────────────────────
// Sub-component: Modal Import nhiều đợt từ Excel
// ─────────────────────────────────────────────
function ImportMultiBatchModal({ supplies, onClose }) {
  const excelInputRef = useRef(null);
  const [fileName, setFileName] = useState("");
  const [parsedData, setParsedData] = useState(null); // { batches, unmatchedSupplies, skippedRows }
  const [parseError, setParseError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState(null); // [{ donorName, success, error, batchId }]

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!supplies.length) {
      setParseError("Chưa có danh sách mặt hàng. Vui lòng tải lại trang.");
      return;
    }
    setFileName(file.name);
    setParseError("");
    setParsedData(null);
    setResults(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const jsonData = readFirstSheetJson(evt.target.result);
        if (!jsonData.length) {
          setParseError("File không có dữ liệu.");
          return;
        }
        const parsed = parseMultiDonorExcel(supplies, jsonData);
        if (!parsed.batches.length) {
          setParseError(
            parsed.skippedRows.length
              ? "Tất cả dòng đều bị bỏ qua. Kiểm tra lại cột 'Người quyên góp', 'SĐT', và 'Tên mặt hàng'."
              : "Không đọc được dữ liệu từ file.",
          );
          return;
        }
        setParsedData(parsed);
      } catch {
        setParseError(
          "Không thể đọc file. Vui lòng dùng định dạng CSV hoặc Excel (.xlsx).",
        );
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleSubmit = async () => {
    if (!parsedData?.batches.length) return;
    setSubmitting(true);
    setResults(null);

    const today = new Date().toISOString().slice(0, 10);
    const outcome = [];

    for (const batch of parsedData.batches) {
      const payload = {
        name: `Quyên góp — ${batch.donorName} — ${today}`,
        source: "donate",
        import_date: today,
        donor_name: batch.donorName,
        donor_phone: batch.donorPhone || undefined,
        notes: `Import từ file: ${fileName}`,
        items: batch.items.map(
          ({ supply_id, quantity, condition, expiry_date, notes }) => ({
            supply_id,
            quantity,
            condition,
            expiry_date: expiry_date || undefined,
            notes: notes || undefined,
          }),
        ),
      };

      const res = await createAndCompleteImportBatch(payload);
      outcome.push({
        donorName: batch.donorName,
        donorPhone: batch.donorPhone,
        success: res.success,
        error: res.error,
        batchId: res.data?.id,
      });
    }

    setResults(outcome);
    setSubmitting(false);
  };

  const successCount = results?.filter((r) => r.success).length ?? 0;
  const failCount = results?.filter((r) => !r.success).length ?? 0;

  return (
    <Modal
      open
      onClose={onClose}
      title="Import nhiều đợt quyên góp từ Excel"
      maxWidth="max-w-3xl"
    >
      <div className="space-y-5">
        {/* File upload */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-bold text-slate-700">
              Chọn file dữ liệu
            </label>
            <button
              type="button"
              onClick={() => downloadMultiDonorTemplate()}
              className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
            >
              <FileIcon sx={{ fontSize: 14 }} />
              Tải file mẫu
            </button>
          </div>
          <div
            onClick={() => excelInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-2xl p-6 text-center cursor-pointer transition-colors hover:bg-blue-50/30"
          >
            <UploadIcon sx={{ fontSize: 40 }} className="text-slate-400 mb-2" />
            <p className="text-sm font-semibold text-slate-600">
              {fileName || "Nhấn để chọn file CSV hoặc Excel (.xlsx)"}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Cột bắt buộc: Người quyên góp, Tên mặt hàng, Số lượng
            </p>
          </div>
          <input
            ref={excelInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Parse error */}
        {parseError && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-2">
            <CancelIcon
              sx={{ fontSize: 16 }}
              className="text-red-500 mt-0.5 shrink-0"
            />
            <p className="text-sm text-red-700">{parseError}</p>
          </div>
        )}

        {/* Preview: skipped rows warning */}
        {parsedData?.skippedRows?.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <div className="flex items-start gap-2 mb-2">
              <InfoIcon
                sx={{ fontSize: 16 }}
                className="text-amber-600 mt-0.5 shrink-0"
              />
              <p className="text-sm font-semibold text-amber-800">
                {parsedData.skippedRows.length} dòng bị bỏ qua
              </p>
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {parsedData.skippedRows.slice(0, 10).map((s, i) => (
                <p key={i} className="text-xs text-amber-700">
                  Dòng {s.row}: {s.reason}
                </p>
              ))}
              {parsedData.skippedRows.length > 10 && (
                <p className="text-xs text-amber-600 italic">
                  …và {parsedData.skippedRows.length - 10} dòng nữa
                </p>
              )}
            </div>
          </div>
        )}

        {/* Preview: batches */}
        {parsedData?.batches?.length > 0 && (
          <div>
            <p className="text-sm font-bold text-slate-700 mb-3">
              Xem trước: {parsedData.batches.length} đợt quyên góp (
              {parsedData.batches.reduce((s, b) => s + b.items.length, 0)} mặt
              hàng)
            </p>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {parsedData.batches.map((batch, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-4"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {batch.donorName}
                      </p>
                      <p className="text-xs text-slate-600">
                        {batch.donorPhone || "—"} · {batch.items.length} mặt
                        hàng · {batch.totalQuantity} đơn vị
                      </p>
                    </div>
                    <span className="shrink-0 text-xs font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-lg">
                      #{idx + 1}
                    </span>
                  </div>
                  <div className="space-y-1 mt-2">
                    {batch.items.map((it, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between"
                      >
                        <span className="text-xs text-slate-700 truncate mr-2">
                          {it.supply_name}
                        </span>
                        <span className="text-xs font-semibold text-slate-800 shrink-0">
                          ×{it.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {results && (
          <div>
            <p className="text-sm font-bold text-slate-700 mb-3">Kết quả</p>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {results.map((r, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-2 px-4 py-2.5 rounded-xl text-sm ${
                    r.success
                      ? "bg-emerald-50 border border-emerald-200"
                      : "bg-red-50 border border-red-200"
                  }`}
                >
                  {r.success ? (
                    <CheckIcon
                      sx={{ fontSize: 16 }}
                      className="text-emerald-600 mt-0.5 shrink-0"
                    />
                  ) : (
                    <CancelIcon
                      sx={{ fontSize: 16 }}
                      className="text-red-500 mt-0.5 shrink-0"
                    />
                  )}
                  <div>
                    <p
                      className={`font-semibold ${r.success ? "text-emerald-800" : "text-red-800"}`}
                    >
                      {r.donorName}
                      {r.donorPhone ? ` (${r.donorPhone})` : ""}
                    </p>
                    {!r.success && (
                      <p className="text-xs text-red-600 mt-0.5">{r.error}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm text-center mt-3 font-semibold text-slate-700">
              <span className="text-emerald-600">{successCount} đợt</span>
              {failCount > 0 && (
                <>
                  {" · "}
                  <span className="text-red-600">{failCount} đợt thất bại</span>
                </>
              )}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 border border-slate-200 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 transition-colors text-sm"
          >
            {results ? "Đóng" : "Hủy"}
          </button>
          {!results && parsedData?.batches?.length > 0 && (
            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmit}
              className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/25 transition-all text-sm disabled:opacity-50"
            >
              {submitting
                ? `Đang tạo ${parsedData.batches.length} đợt…`
                : `Tạo ${parsedData.batches.length} đợt quyên góp`}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────
export default function ManagerCharityHistory() {
  const [subTab, setSubTab] = useState("import");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [histories, setHistories] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [lookupAttempted, setLookupAttempted] = useState(false);

  const [supplies, setSupplies] = useState([]);
  const [formLoading, setFormLoading] = useState(false);
  const [importFormKey, setImportFormKey] = useState(0);
  const [showImportModal, setShowImportModal] = useState(false);

  const limit = 20;

  const loadSuppliesForImport = useCallback(async () => {
    const res = await getSupplies({ page: 1, limit: 200 });
    if (res.success) setSupplies(res.data || []);
  }, []);

  useEffect(() => {
    if (subTab === "import") loadSuppliesForImport();
  }, [subTab, loadSuppliesForImport]);

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
      setLookupAttempted(true);
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

  const handleLookupClick = useCallback(() => {
    if (loading) return;
    loadHistory(1);
  }, [loading, loadHistory]);

  const handleCreateDonationBatch = async (formData) => {
    setFormLoading(true);
    try {
      const res = await createAndCompleteImportBatch(formData);
      if (res.success) {
        alert(
          "Tạo và hoàn tất đợt nhập quyên góp thành công. Tồn kho và lịch sử đã được cập nhật.",
        );
      } else {
        alert(res.error || "Không thể xử lý đợt nhập quyên góp.");
      }
      setImportFormKey((k) => k + 1);
    } finally {
      setFormLoading(false);
    }
  };

  const totalQuantity = useMemo(() => {
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
                Quyên góp
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-6 p-1.5 bg-white rounded-2xl shadow-sm border border-slate-200 w-fit">
            <button
              type="button"
              onClick={() => setSubTab("import")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                subTab === "import"
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              Nhập quyên góp
            </button>
            <button
              type="button"
              onClick={() => setSubTab("lookup")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                subTab === "lookup"
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              Tra cứu lịch sử
            </button>
          </div>

          {subTab === "import" && (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden p-6 space-y-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-bold text-slate-900">
                    Tạo đợt nhập quyên góp
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowImportModal(true)}
                  className="inline-flex items-center justify-center gap-2 shrink-0 px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl font-semibold shadow-lg shadow-indigo-500/25 transition-all text-sm w-full sm:w-auto"
                >
                  <UploadIcon sx={{ fontSize: 18 }} />
                  Import từ file Excel
                </button>
              </div>
              <ImportBatchForm
                key={importFormKey}
                supplies={supplies}
                loading={formLoading}
                donateOnly
                onSubmit={handleCreateDonationBatch}
                onCancel={() => setSubTab("lookup")}
              />
            </div>
          )}

          {subTab === "lookup" && (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex flex-wrap items-end gap-3">
                <div className="flex-1 min-w-[260px]">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    SĐT người quyên góp
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleLookupClick();
                      }
                    }}
                    placeholder="VD: 0901234567"
                    autoComplete="tel"
                    className="w-full h-11 px-4 box-border border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleLookupClick}
                  disabled={loading}
                  className="h-11 shrink-0 inline-flex items-center justify-center gap-2 px-5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-semibold text-sm shadow-lg shadow-purple-500/25 transition-all disabled:opacity-50"
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

              {!lookupAttempted && !loading && (
                <div className="flex items-center justify-center py-16 text-slate-400 text-sm">
                  Nhập SĐT và bấm Tra cứu hoặc Enter để xem lịch sử quyên góp.
                </div>
              )}

              {lookupAttempted &&
                histories.length === 0 &&
                !loading &&
                !error && (
                  <div className="flex items-center justify-center py-16 text-slate-400">
                    Không tìm thấy lịch sử cho SĐT này.
                  </div>
                )}

              {histories.length > 0 && (
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
                            <p className="text-xs text-slate-500">
                              Người quyên góp
                            </p>
                            <p className="font-semibold text-slate-900 mt-1">
                              {h.donor_name || "—"}
                            </p>
                            <p className="text-sm text-slate-600 mt-1">
                              SĐT: {h.donor_phone || "—"}
                            </p>
                          </div>
                          <div className="bg-white border border-slate-200 rounded-xl p-4">
                            <p className="text-xs text-slate-500">
                              Danh sách vật tư
                            </p>
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
          )}
        </div>
      </div>

      {showImportModal && (
        <ImportMultiBatchModal
          supplies={supplies}
          onClose={() => setShowImportModal(false)}
        />
      )}
    </div>
  );
}
