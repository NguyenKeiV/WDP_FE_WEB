import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import Sidebar from "../../components/manager/Sidebar";
import Modal from "../../components/manager/Modal";
import ImportBatchForm from "../../components/manager/ImportBatchForm";
import { teamsApi } from "../../api/teams";
import * as XLSX from "xlsx";
import {
  Inventory2 as BoxIcon,
  Warning as WarningIcon,
  Add as AddIcon,
  CheckCircle as CheckIcon,
  Refresh as RefreshIcon,
  LocalHospital as MedicalIcon,
  Restaurant as FoodIcon,
  Water as WaterIcon,
  Checkroom as ClothIcon,
  Build as EquipIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocalShipping as ShipIcon,
  Close as CloseIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  HourglassEmpty as HourIcon,
  Inventory as InventoryIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  ContentPaste as PasteIcon,
  Category as CategoryIcon,
  Layers as LayersIcon,
  AccessTime as ExpiryIcon,
  UploadFile as UploadIcon,
  Description as FileIcon,
} from "@mui/icons-material";
import {
  getWarehouseOverview,
  getSupplies,
  createSupply,
  updateSupply,
  deleteSupply,
  bulkDistributeSupplies,
  getDistributions,
  getImportBatches,
  createAndCompleteImportBatch,
  completeImportBatch,
  removeItemFromBatch,
  getStockBySupply,
  getAllUsages,
} from "../../services/warehouseService";

// ─────────────────────────────────────────────
// Hằng số
// ─────────────────────────────────────────────
const CATEGORY_OPTIONS = [
  { value: "", label: "Tất cả danh mục" },
  { value: "food", label: "Lương thực" },
  { value: "medicine", label: "Y tế" },
  { value: "water", label: "Nước uống" },
  { value: "clothing", label: "Quần áo" },
  { value: "equipment", label: "Thiết bị" },
  { value: "other", label: "Khác" },
];

const CATEGORY_LABELS = {
  food: "Lương thực",
  medicine: "Y tế",
  water: "Nước uống",
  clothing: "Quần áo",
  equipment: "Thiết bị",
  other: "Khác",
};

const CONDITION_LABELS = {
  new: "Mới",
  good: "Tốt",
  damaged: "Hư hỏng",
};

const SOURCE_LABELS = {
  purchase: "Mua",
  donate: "Quyên góp",
};

// Regex VN (theo BE): bắt đầu bằng 0 và đủ 10 chữ số.
// ─────────────────────────────────────────────
// Helper: icon và màu theo category
// ─────────────────────────────────────────────
const getCategoryIcon = (category, size = 20) => {
  const props = { sx: { fontSize: size } };
  switch (category) {
    case "food":
      return <FoodIcon {...props} />;
    case "medicine":
      return <MedicalIcon {...props} />;
    case "water":
      return <WaterIcon {...props} />;
    case "clothing":
      return <ClothIcon {...props} />;
    case "equipment":
      return <EquipIcon {...props} />;
    default:
      return <BoxIcon {...props} />;
  }
};

const getCategoryColor = (category) => {
  switch (category) {
    case "food":
      return "text-amber-600 bg-amber-50";
    case "medicine":
      return "text-red-600 bg-red-50";
    case "water":
      return "text-cyan-600 bg-cyan-50";
    case "clothing":
      return "text-purple-600 bg-purple-50";
    case "equipment":
      return "text-slate-600 bg-slate-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("vi-VN");
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("vi-VN");
};

// ─────────────────────────────────────────────
// Sub-component: Phân trang
// ─────────────────────────────────────────────
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
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ArrowBackIcon sx={{ fontSize: 16 }} />
        </button>
        <span className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-xl">
          {page} / {totalPages}
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ArrowForwardIcon sx={{ fontSize: 16 }} />
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sub-component: Form tạo/sửa mặt hàng
// ─────────────────────────────────────────────
function SupplyForm({ initial, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    name: initial?.name || "",
    category: initial?.category || "food",
    unit: initial?.unit || "cái",
    province_city: initial?.province_city || "Toàn quốc",
    min_quantity: initial?.min_quantity ?? 10,
    notes: initial?.notes || "",
  });

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      province_city: (form.province_city || "Toàn quốc").trim(),
      min_quantity: Number(form.min_quantity),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          Tên mặt hàng <span className="text-red-500">*</span>
        </label>
        <input
          required
          value={form.name}
          onChange={set("name")}
          placeholder="VD: Mì gói, Nước uống..."
          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Danh mục <span className="text-red-500">*</span>
          </label>
          <select
            required
            value={form.category}
            onChange={set("category")}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
          >
            {CATEGORY_OPTIONS.slice(1).map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Đơn vị tính
          </label>
          <input
            value={form.unit}
            onChange={set("unit")}
            placeholder="cái, kg, thùng..."
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          Ngưỡng cảnh báo hết hàng
        </label>
        <input
          type="number"
          min="0"
          value={form.min_quantity}
          onChange={set("min_quantity")}
          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          Ghi chú
        </label>
        <textarea
          value={form.notes}
          onChange={set("notes")}
          rows={3}
          placeholder="Ghi chú thêm về mặt hàng..."
          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 border border-slate-200 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 transition-colors text-sm"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/25 transition-all text-sm disabled:opacity-50"
        >
          {loading ? "Đang lưu..." : initial ? "Cập nhật" : "Tạo mặt hàng"}
        </button>
      </div>
    </form>
  );
}

// ─────────────────────────────────────────────
// Sub-component: Form xuất kho (hỗ trợ nhiều mặt hàng)
// ─────────────────────────────────────────────
function DistributeForm({
  initialSupply,
  allSupplies,
  teams,
  onSubmit,
  onCancel,
  loading,
}) {
  const [teamId, setTeamId] = useState("");
  const [teamQuery, setTeamQuery] = useState("");
  const [showTeamDropdown, setShowTeamDropdown] = useState(false);
  const [notes, setNotes] = useState("");
  const teamSearchRef = useRef(null);
  const [items, setItems] = useState(() => {
    if (initialSupply) {
      return [{ supply_id: initialSupply.id, quantity: 1, _key: Date.now() }];
    }
    return [{ supply_id: "", quantity: 1, _key: Date.now() }];
  });

  const getSupplyInfo = (id) =>
    allSupplies.find((s) => s.id === id || s.supply_id === id);

  const updateItem = (idx, field, value) =>
    setItems((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, [field]: value } : it)),
    );

  const addItem = () =>
    setItems((prev) => [
      ...prev,
      { supply_id: "", quantity: 1, _key: Date.now() + Math.random() },
    ]);

  const removeItem = (idx) =>
    setItems((prev) => prev.filter((_, i) => i !== idx));

  const usedSupplyIds = items.map((it) => it.supply_id).filter(Boolean);

  const teamOptions = useMemo(
    () =>
      teams.map((t) => ({
        id: t.id,
        label: `${t.name} ${t.specialization === "rescue" ? "(Cứu hộ)" : "(Cứu trợ)"}`,
      })),
    [teams],
  );

  const filteredTeamOptions = useMemo(() => {
    const q = teamQuery.trim().toLowerCase();
    if (!q) return teamOptions;
    return teamOptions.filter((opt) => opt.label.toLowerCase().includes(q));
  }, [teamOptions, teamQuery]);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (teamSearchRef.current && !teamSearchRef.current.contains(e.target)) {
        setShowTeamDropdown(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const handleTeamSearchChange = (value) => {
    setTeamQuery(value);
    setShowTeamDropdown(true);
    const matched = teamOptions.find(
      (opt) => opt.label.toLowerCase() === value.trim().toLowerCase(),
    );
    setTeamId(matched?.id || "");
  };

  const pickTeam = (opt) => {
    setTeamQuery(opt.label);
    setTeamId(opt.id);
    setShowTeamDropdown(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const builtItems = items
      .filter((it) => it.supply_id && it.quantity > 0)
      .map((it) => {
        const info = getSupplyInfo(it.supply_id);
        const itemNote = `Đem theo ${it.quantity} ${info?.unit || "đơn vị"} ${info?.name || ""}`;
        return {
          supply_id: it.supply_id,
          team_id: teamId,
          quantity: Number(it.quantity),
          notes: notes ? `${itemNote} — ${notes}` : itemNote,
        };
      });
    if (builtItems.length === 0) return;
    onSubmit(builtItems);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          Đội nhận hàng <span className="text-red-500">*</span>
        </label>
        <div className="relative" ref={teamSearchRef}>
          <input
            value={teamQuery}
            onChange={(e) => handleTeamSearchChange(e.target.value)}
            onFocus={() => setShowTeamDropdown(true)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setShowTeamDropdown(false);
            }}
            placeholder="Tìm và chọn đội nhận hàng..."
            className="w-full px-4 py-2.5 pr-9 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
          />
          <button
            type="button"
            onClick={() => setShowTeamDropdown((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-700"
            tabIndex={-1}
          >
            <ExpandIcon sx={{ fontSize: 18 }} />
          </button>

          {showTeamDropdown && (
            <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-56 overflow-auto">
              {filteredTeamOptions.length > 0 ? (
                filteredTeamOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => pickTeam(opt)}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 transition-colors ${
                      teamId === opt.id
                        ? "bg-blue-50 text-blue-700 font-semibold"
                        : "text-slate-700"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))
              ) : (
                <p className="px-3 py-2 text-sm text-slate-500">
                  Không tìm thấy đội phù hợp.
                </p>
              )}
            </div>
          )}
        </div>
        <input
          required
          value={teamId}
          onChange={() => {}}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
        />
        {teamQuery && !teamId && (
          <p className="text-xs text-amber-600 mt-1.5">
            Vui lòng chọn đội từ danh sách gợi ý.
          </p>
        )}
      </div>

      {/* Danh sách mặt hàng xuất kho */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-semibold text-slate-700">
            Mặt hàng xuất kho <span className="text-red-500">*</span>
          </label>
          <button
            type="button"
            onClick={addItem}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors"
          >
            + Thêm mặt hàng
          </button>
        </div>
        <div className="space-y-3">
          {items.map((item, idx) => {
            const info = getSupplyInfo(item.supply_id);
            return (
              <div
                key={item._key}
                className="flex gap-2 items-start p-3 bg-slate-50 rounded-xl border border-slate-200"
              >
                <div className="flex-1 space-y-2">
                  <select
                    required
                    value={item.supply_id}
                    onChange={(e) =>
                      updateItem(idx, "supply_id", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                  >
                    <option value="">-- Chọn mặt hàng --</option>
                    {allSupplies.map((s) => {
                      const sid = s.id || s.supply_id;
                      const disabled =
                        usedSupplyIds.includes(sid) && item.supply_id !== sid;
                      return (
                        <option key={sid} value={sid} disabled={disabled}>
                          {s.name} (Tồn:{" "}
                          {s.total_remaining ?? s.quantity ?? "?"}{" "}
                          {s.unit || ""})
                        </option>
                      );
                    })}
                  </select>
                  <div className="flex items-center gap-2">
                    <input
                      required
                      type="number"
                      min="1"
                      max={info?.total_remaining ?? info?.quantity ?? 99999}
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(idx, "quantity", e.target.value)
                      }
                      className="w-28 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="SL"
                    />
                    {info && (
                      <span className="text-xs text-slate-500">
                        {info.unit || ""} — Tồn kho:{" "}
                        <span className="font-semibold text-slate-700">
                          {info.total_remaining ?? info.quantity ?? "?"}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    className="mt-2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Xóa mặt hàng"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            );
          })}
        </div>
        {items.length > 0 && (
          <p className="text-xs text-slate-400 mt-2">
            Tổng:{" "}
            <span className="font-bold text-slate-700">
              {items.filter((i) => i.supply_id).length}
            </span>{" "}
            mặt hàng sẽ được xuất
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          Ghi chú chung (định lượng, điểm đến, lưu ý)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="VD: Phân phối cho 25 hộ gia đình tại Q.Bình Thạnh..."
          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 border border-slate-200 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 transition-colors text-sm"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={loading || items.filter((i) => i.supply_id).length === 0}
          className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl font-semibold shadow-lg shadow-orange-500/25 transition-all text-sm disabled:opacity-50"
        >
          {loading
            ? "Đang xuất kho..."
            : `Xác nhận xuất kho (${items.filter((i) => i.supply_id).length} mặt hàng)`}
        </button>
      </div>
    </form>
  );
}

// ─────────────────────────────────────────────
// Sub-component: Import từ file (CSV/Excel)
// ─────────────────────────────────────────────
function ImportFromFileForm({ supplies, onSubmit, onCancel, loading }) {
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState("");
  const [parsedItems, setParsedItems] = useState([]);
  const [parseError, setParseError] = useState("");
  const [form, setForm] = useState({
    name: "",
    import_date: new Date().toISOString().slice(0, 10),
    notes: "",
  });

  const setField = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setParseError("");

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { defval: "" });

        if (jsonData.length === 0) {
          setParseError("File không có dữ liệu");
          return;
        }

        const items = jsonData.map((row) => {
          const supplyName = (
            row["Tên mặt hàng"] ||
            row["ten_mat_hang"] ||
            row["name"] ||
            ""
          )
            .toString()
            .trim();
          const matchedSupply = supplies.find(
            (s) => s.name.toLowerCase() === supplyName.toLowerCase(),
          );
          return {
            supply_id: matchedSupply?.id || "",
            supply_name: supplyName,
            matched: !!matchedSupply,
            quantity: Number(
              row["Số lượng"] || row["so_luong"] || row["quantity"] || 1,
            ),
            condition: (row["Tình trạng"] || row["condition"] || "new")
              .toString()
              .toLowerCase(),
            expiry_date: row["Hạn sử dụng"] || row["expiry_date"] || "",
            notes: (row["Ghi chú"] || row["notes"] || "").toString(),
          };
        });
        setParsedItems(items);
      } catch {
        setParseError(
          "Không thể đọc file. Vui lòng kiểm tra định dạng (CSV, XLSX).",
        );
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validItems = parsedItems
      .filter((it) => it.supply_id)
      .map((it) => ({
        supply_id: it.supply_id,
        quantity: it.quantity,
        condition: ["new", "good", "damaged"].includes(it.condition)
          ? it.condition
          : "new",
        expiry_date: it.expiry_date || undefined,
        notes: it.notes || undefined,
      }));

    if (!validItems.length) {
      setParseError("Không có mặt hàng hợp lệ nào (cần khớp tên trong kho).");
      return;
    }

    onSubmit({
      name: form.name || `Nhập từ file — ${fileName}`,
      source: "purchase",
      import_date: form.import_date,
      notes: form.notes || `Import từ file: ${fileName}`,
      items: validItems,
    });
  };

  const downloadTemplate = () => {
    const templateData = [
      {
        "Tên mặt hàng": "Mì tôm",
        "Số lượng": 1,
        "Tình trạng": "new",
        "Hạn sử dụng": "2027-01-01",
        "Ghi chú": "",
      },
      {
        "Tên mặt hàng": "Nước lọc",
        "Số lượng": 1,
        "Tình trạng": "new",
        "Hạn sử dụng": "2026-12-01",
        "Ghi chú": "Chai 500ml",
      },
    ];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Danh sách");
    XLSX.writeFile(wb, "mau_nhap_kho.xlsx");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* File upload */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-bold text-slate-700">
            Chọn file dữ liệu <span className="text-red-500">*</span>
          </label>
          <button
            type="button"
            onClick={downloadTemplate}
            className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
          >
            <FileIcon sx={{ fontSize: 14 }} />
            Tải file mẫu
          </button>
        </div>

        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-2xl p-6 text-center cursor-pointer transition-colors hover:bg-blue-50/30"
        >
          <UploadIcon sx={{ fontSize: 40 }} className="text-slate-400 mb-2" />
          <p className="text-sm font-semibold text-slate-600">
            {fileName || "Nhấn để chọn file CSV hoặc Excel (.xlsx)"}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Cột bắt buộc: Tên mặt hàng, Số lượng
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {parseError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
          <WarningIcon sx={{ fontSize: 16 }} className="text-red-500 mt-0.5" />
          <p className="text-sm text-red-700">{parseError}</p>
        </div>
      )}

      {/* Parsed preview */}
      {parsedItems.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <p className="text-sm font-bold text-slate-700">
              Xem trước: {parsedItems.length} mặt hàng
            </p>
            <p className="text-xs text-slate-500">
              <span className="text-emerald-600 font-semibold">
                {parsedItems.filter((i) => i.matched).length}
              </span>{" "}
              khớp
              {" / "}
              <span className="text-red-500 font-semibold">
                {parsedItems.filter((i) => !i.matched).length}
              </span>{" "}
              chưa khớp
            </p>
          </div>
          <div className="max-h-48 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-bold text-slate-500">
                    Tên
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-bold text-slate-500">
                    SL
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-bold text-slate-500">
                    Trạng thái
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-bold text-slate-500">
                    Khớp?
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {parsedItems.map((item, idx) => (
                  <tr key={idx} className={item.matched ? "" : "bg-red-50/50"}>
                    <td className="px-3 py-2 text-slate-800 font-medium">
                      {item.supply_name}
                    </td>
                    <td className="px-3 py-2 text-right font-bold">
                      {item.quantity}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          item.condition === "new"
                            ? "bg-emerald-100 text-emerald-700"
                            : item.condition === "good"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {CONDITION_LABELS[item.condition] || item.condition}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center">
                      {item.matched ? (
                        <CheckIcon
                          sx={{ fontSize: 16 }}
                          className="text-emerald-500"
                        />
                      ) : (
                        <WarningIcon
                          sx={{ fontSize: 16 }}
                          className="text-red-400"
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {parsedItems.some((i) => !i.matched) && (
            <div className="px-4 py-2 bg-amber-50 border-t border-amber-200 text-xs text-amber-700">
              Mặt hàng chưa khớp sẽ bị bỏ qua. Hãy đảm bảo tên trong file trùng
              với tên trong kho.
            </div>
          )}
        </div>
      )}

      {/* Batch info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Tên đợt nhập
          </label>
          <input
            value={form.name}
            onChange={setField("name")}
            placeholder={`VD: Nhập mua từ ${fileName || "file"}`}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Ngày nhập
          </label>
          <input
            type="date"
            value={form.import_date}
            onChange={setField("import_date")}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 border border-slate-200 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 transition-colors text-sm"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={
            loading || parsedItems.filter((i) => i.matched).length === 0
          }
          className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/25 transition-all text-sm disabled:opacity-50"
        >
          {loading
            ? "Đang tạo..."
            : `Import ${parsedItems.filter((i) => i.matched).length} mặt hàng`}
        </button>
      </div>
    </form>
  );
}

// ─────────────────────────────────────────────
// Main Component: ManagerInventory
// ─────────────────────────────────────────────
export default function ManagerInventory() {
  const [activeTab, setActiveTab] = useState("supplies");

  // Overview
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [overview, setOverview] = useState(null);

  // Toast
  const [toast, setToast] = useState(null);

  // Supplies
  const [supplies, setSupplies] = useState([]);
  const [suppliesLoading, setSuppliesLoading] = useState(false);
  const [suppliesPagination, setSuppliesPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [categoryFilter, setCategoryFilter] = useState("");

  // Import Batches
  const [importBatches, setImportBatches] = useState([]);
  const [batchesLoading, setBatchesLoading] = useState(false);
  const [batchesPagination, setBatchesPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [batchStatusFilter, setBatchStatusFilter] = useState("");
  const [batchSourceFilter, setBatchSourceFilter] = useState("");
  const [expandedBatch, setExpandedBatch] = useState(null);

  // Distributions
  const [distributions, setDistributions] = useState([]);
  const [distLoading, setDistLoading] = useState(false);
  const [distPagination, setDistPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  // Supply Usages
  const [usages, setUsages] = useState([]);
  const [usagesLoading, setUsagesLoading] = useState(false);
  const [usagesError, setUsagesError] = useState(null);
  const [usagesUnsupported, setUsagesUnsupported] = useState(false);
  const [usagesPagination, setUsagesPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  // Teams (cho form xuất kho)
  const [teams, setTeams] = useState([]);

  // Modal states
  const [supplyModal, setSupplyModal] = useState({
    open: false,
    mode: "create",
    data: null,
  });
  const [importBatchModal, setImportBatchModal] = useState({ open: false });
  const [importFileModal, setImportFileModal] = useState({ open: false });
  const [distributeModal, setDistributeModal] = useState({
    open: false,
    supply: null,
  });
  const [deleteConfirm, setDeleteConfirm] = useState({
    open: false,
    supply: null,
  });
  const [stockModal, setStockModal] = useState({
    open: false,
    supply: null,
    data: null,
    loading: false,
  });
  const [formLoading, setFormLoading] = useState(false);

  const importableSupplies = useMemo(() => {
    const base = supplies.length ? supplies : overview?.supplies || [];
    const map = new Map();

    base.forEach((s) => {
      const id = s?.id || s?.supply_id;
      if (!id || map.has(id)) return;
      map.set(id, {
        ...s,
        id,
        name: s?.name || "Mặt hàng",
        category: s?.category || "other",
        unit: s?.unit || "đơn vị",
      });
    });

    return Array.from(map.values());
  }, [supplies, overview]);

  // ─── Toast helper ─────────────────────────────
  const showToast = useCallback((type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // ─── Data loaders ─────────────────────────────
  const loadOverview = useCallback(async () => {
    setOverviewLoading(true);
    const res = await getWarehouseOverview();
    if (res.success) setOverview(res.data);
    else showToast("error", "Không thể tải tổng quan kho: " + res.error);
    setOverviewLoading(false);
  }, [showToast]);

  const loadSupplies = useCallback(
    async (page = 1) => {
      setSuppliesLoading(true);
      const res = await getSupplies({
        page,
        limit: 10,
        ...(categoryFilter ? { category: categoryFilter } : {}),
      });
      if (res.success) {
        setSupplies(res.data);
        setSuppliesPagination(res.pagination);
      } else {
        showToast("error", "Không thể tải danh sách mặt hàng: " + res.error);
      }
      setSuppliesLoading(false);
    },
    [categoryFilter, showToast],
  );

  const loadImportBatches = useCallback(
    async (page = 1) => {
      setBatchesLoading(true);
      const res = await getImportBatches({
        page,
        limit: 10,
        ...(batchStatusFilter ? { status: batchStatusFilter } : {}),
        ...(batchSourceFilter ? { source: batchSourceFilter } : {}),
      });
      if (res.success) {
        setImportBatches(res.data);
        setBatchesPagination(res.pagination);
      } else {
        showToast("error", "Không thể tải đợt nhập kho: " + res.error);
      }
      setBatchesLoading(false);
    },
    [batchStatusFilter, batchSourceFilter, showToast],
  );

  const loadDistributions = useCallback(
    async (page = 1) => {
      setDistLoading(true);
      const res = await getDistributions({ page, limit: 10 });
      if (res.success) {
        setDistributions(res.data);
        setDistPagination(res.pagination);
      } else {
        showToast("error", "Không thể tải lịch sử xuất kho: " + res.error);
      }
      setDistLoading(false);
    },
    [showToast],
  );

  const loadUsages = useCallback(async (page = 1) => {
    setUsagesLoading(true);
    setUsagesError(null);
    const res = await getAllUsages({ page, limit: 10 });
    if (res.success) {
      const payload = res.data;
      const data = Array.isArray(payload) ? payload : payload?.data || [];
      setUsages(data);
      setUsagesPagination(
        payload?.pagination || { page: 1, totalPages: 1, total: data.length },
      );
    } else {
      setUsagesError(res.error);
      // If the backend doesn't have the endpoints deployed yet, stop further calls.
      if (
        res.error === "API sử dụng vật phẩm chưa được triển khai trên server"
      ) {
        setUsagesUnsupported(true);
      }
    }
    setUsagesLoading(false);
  }, []);

  const loadTeams = useCallback(async () => {
    try {
      const res = await teamsApi.getAll({ limit: 100 });
      setTeams(res?.data || []);
    } catch {
      // không bắt buộc, bỏ qua lỗi
    }
  }, []);

  // ─── Effects ──────────────────────────────────
  useEffect(() => {
    loadOverview();
    loadTeams();
    loadSupplies(1); // tải supplies ngay từ đầu (cần cho form nhập kho)
  }, [loadOverview, loadTeams]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (activeTab === "supplies") loadSupplies(1);
  }, [categoryFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (activeTab === "import-batches") loadImportBatches(1);
  }, [activeTab, batchStatusFilter, batchSourceFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (activeTab === "distributions") loadDistributions(1);
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (activeTab === "usages" && !usagesUnsupported) loadUsages(1);
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Handlers: Supplies ───────────────────────
  const handleCreateSupply = async (formData) => {
    setFormLoading(true);
    const res = await createSupply(formData);
    setFormLoading(false);
    if (res.success) {
      showToast("success", "Tạo mặt hàng thành công!");
      setSupplyModal({ open: false, mode: "create", data: null });
      loadSupplies(1);
      loadOverview();
    } else {
      showToast("error", res.error);
    }
  };

  const handleUpdateSupply = async (formData) => {
    setFormLoading(true);
    const res = await updateSupply(supplyModal.data.id, formData);
    setFormLoading(false);
    if (res.success) {
      showToast("success", "Cập nhật mặt hàng thành công!");
      setSupplyModal({ open: false, mode: "create", data: null });
      loadSupplies(suppliesPagination.page);
    } else {
      showToast("error", res.error);
    }
  };

  const handleDeleteSupply = async () => {
    const res = await deleteSupply(deleteConfirm.supply.id);
    if (res.success) {
      showToast("success", "Xóa mặt hàng thành công!");
      setDeleteConfirm({ open: false, supply: null });
      loadSupplies(1);
      loadOverview();
    } else {
      showToast("error", res.error);
      setDeleteConfirm({ open: false, supply: null });
    }
  };

  const openImportBatchModal = useCallback(async () => {
    if (importableSupplies.length === 0) {
      const res = await getSupplies({ page: 1, limit: 100 });
      if (res.success) {
        setSupplies(res.data || []);
      } else {
        showToast("error", "Không thể tải danh sách mặt hàng: " + res.error);
      }
    }
    setImportBatchModal({ open: true });
  }, [importableSupplies.length, showToast]);

  const openImportFileModal = useCallback(async () => {
    if (importableSupplies.length === 0) {
      const res = await getSupplies({ page: 1, limit: 100 });
      if (res.success) {
        setSupplies(res.data || []);
      } else {
        showToast("error", "Không thể tải danh sách mặt hàng: " + res.error);
      }
    }
    setImportFileModal({ open: true });
  }, [importableSupplies.length, showToast]);

  // ─── Handler: Xem lô hàng (FIFO stock) ────────
  const handleOpenStockModal = async (supply) => {
    setStockModal({ open: true, supply, data: null, loading: true });
    const res = await getStockBySupply(supply.id);
    if (res.success) {
      setStockModal({ open: true, supply, data: res.data, loading: false });
    } else {
      showToast("error", "Không thể tải thông tin lô hàng: " + res.error);
      setStockModal({ open: false, supply: null, data: null, loading: false });
    }
  };

  // ─── Handler: Xuất kho (hàng loạt) ──────────────
  const handleDistribute = async (builtItems) => {
    setFormLoading(true);
    const res = await bulkDistributeSupplies(builtItems);
    setFormLoading(false);
    if (res.success) {
      showToast(
        "success",
        `Xuất kho thành công ${builtItems.length} mặt hàng!`,
      );
      setDistributeModal({ open: false, supply: null });
      loadOverview();
      loadSupplies(suppliesPagination.page);
    } else {
      showToast("error", res.error);
    }
  };

  // ─── Handlers: Import Batches ─────────────────
  const handleCreateBatch = async (formData) => {
    setFormLoading(true);
    try {
      const res = await createAndCompleteImportBatch(formData);
      if (res.success) {
        showToast(
          "success",
          "Tạo và hoàn tất đợt nhập thành công. Tồn kho đã được cập nhật.",
        );
        setImportBatchModal({ open: false });
        setActiveTab("import-batches");
        loadImportBatches(1);
        loadOverview();
        loadSupplies(1);
      } else {
        showToast("error", res.error);
        if (res.createdOnly) {
          setImportBatchModal({ open: false });
          setActiveTab("import-batches");
          loadImportBatches(1);
          loadOverview();
        }
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleCreateBatchFromFile = async (formData) => {
    setFormLoading(true);
    try {
      const res = await createAndCompleteImportBatch(formData);
      if (res.success) {
        showToast(
          "success",
          "Import và hoàn tất đợt nhập thành công. Tồn kho đã được cập nhật.",
        );
        setImportFileModal({ open: false });
        setActiveTab("import-batches");
        loadImportBatches(1);
        loadOverview();
        loadSupplies(1);
      } else {
        showToast("error", res.error);
        if (res.createdOnly) {
          setImportFileModal({ open: false });
          setActiveTab("import-batches");
          loadImportBatches(1);
          loadOverview();
        }
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleCompleteBatch = async (batchId) => {
    if (
      !window.confirm(
        "Bạn có chắc muốn hoàn tất đợt nhập này? Sau khi hoàn tất không thể chỉnh sửa.",
      )
    )
      return;
    const res = await completeImportBatch(batchId);
    if (res.success) {
      showToast("success", "Đợt nhập đã hoàn tất! Tồn kho được cập nhật.");
      loadImportBatches(batchesPagination.page);
      loadOverview();
      loadSupplies(1);
    } else {
      showToast("error", res.error);
    }
  };

  const handleRemoveBatchItem = async (batchId, itemId) => {
    if (!window.confirm("Xóa mặt hàng này khỏi đợt nhập?")) return;
    const res = await removeItemFromBatch(batchId, itemId);
    if (res.success) {
      showToast("success", "Đã xóa mặt hàng khỏi đợt nhập.");
      loadImportBatches(batchesPagination.page);
    } else {
      showToast("error", res.error);
    }
  };

  // ─── Render: Overview Cards ───────────────────
  const renderOverviewCards = () => {
    if (overviewLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 animate-pulse"
            >
              <div className="h-4 bg-slate-200 rounded w-2/3 mb-4"></div>
              <div className="h-10 bg-slate-100 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-slate-100 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      );
    }

    const cards = [
      {
        title: "Tổng mặt hàng",
        value: overview?.total_items ?? 0,
        unit: "mặt hàng",
        icon: <InventoryIcon sx={{ fontSize: 28 }} />,
        iconBg: "bg-gradient-to-br from-blue-500 to-indigo-600",
        sub: "Đang quản lý trong kho",
        alert: false,
      },
      {
        title: "Sắp hết hàng",
        value: overview?.low_stock ?? 0,
        unit: "mặt hàng",
        icon: <WarningIcon sx={{ fontSize: 28 }} />,
        iconBg: "bg-gradient-to-br from-amber-500 to-orange-600",
        sub: "Dưới mức tồn kho tối thiểu",
        alert: (overview?.low_stock ?? 0) > 0,
      },
      {
        title: "Sắp hết hạn",
        value: overview?.expiring_soon ?? 0,
        unit: "mặt hàng",
        icon: <HourIcon sx={{ fontSize: 28 }} />,
        iconBg: "bg-gradient-to-br from-red-500 to-pink-600",
        sub: "Hết hạn trong 7 ngày tới",
        alert: (overview?.expiring_soon ?? 0) > 0,
      },
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {cards.map((card, i) => (
          <div
            key={i}
            className={`relative bg-white rounded-3xl p-6 shadow-sm border-2 transition-all duration-300 hover:shadow-xl ${
              card.alert
                ? "border-amber-200 hover:border-amber-300"
                : "border-slate-200 hover:border-blue-200"
            }`}
          >
            {card.alert && (
              <div className="absolute top-4 right-4">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                </span>
              </div>
            )}
            <div
              className={`inline-flex p-3.5 rounded-2xl ${card.iconBg} text-white shadow-lg mb-4`}
            >
              {card.icon}
            </div>
            <p className="text-4xl font-bold text-slate-900">
              {card.value}
              <span className="text-base font-semibold text-slate-500 ml-2">
                {card.unit}
              </span>
            </p>
            <p className="text-sm font-bold text-slate-800 mt-1">
              {card.title}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>
    );
  };

  // ─── Render: Low Stock Alert ──────────────────
  const renderLowStockAlert = () => {
    const lowStockItems = (overview?.supplies || []).filter(
      (s) => s.is_low_stock,
    );
    if (!lowStockItems.length) return null;

    return (
      <div className="bg-gradient-to-r from-amber-50 via-amber-50/50 to-transparent rounded-3xl p-6 border-2 border-amber-200 shadow-lg shadow-amber-100/50 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-amber-100 rounded-2xl text-amber-600">
              <WarningIcon sx={{ fontSize: 32 }} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-amber-900 mb-1">
                Cảnh báo tồn kho thấp
              </h3>
              <p className="text-sm text-amber-700">
                {lowStockItems.length} mặt hàng dưới mức tối thiểu — cần nhập bổ
                sung ngay
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setActiveTab("import-batches");
              openImportBatchModal();
            }}
            className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white text-sm font-bold rounded-2xl transition-all shadow-lg shadow-amber-500/30 whitespace-nowrap"
          >
            Tạo đợt nhập kho
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lowStockItems.slice(0, 6).map((item) => (
            <div
              key={item.id}
              className="bg-white border-2 border-amber-100 hover:border-amber-300 p-4 rounded-2xl flex items-center justify-between transition-all hover:shadow-lg"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center ${getCategoryColor(item.category)}`}
                >
                  {getCategoryIcon(item.category)}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {item.name}
                  </p>
                  <p className="text-xs text-amber-600 font-semibold">
                    Còn: {item.total_remaining}
                  </p>
                </div>
              </div>
              <button
                onClick={openImportBatchModal}
                className="text-xs bg-amber-100 hover:bg-amber-600 hover:text-white px-3 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap"
              >
                Nhập ngay
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ─── Render: Tab Mặt hàng ─────────────────────
  const renderSuppliesTab = () => (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Filter bar */}
      <div className="p-6 border-b border-slate-100 flex flex-wrap items-center gap-3">
        <CategoryIcon sx={{ fontSize: 18 }} className="text-slate-400" />
        <span className="text-sm font-semibold text-slate-600">Danh mục:</span>
        <div className="flex flex-wrap gap-1 flex-1">
          {CATEGORY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setCategoryFilter(opt.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                categoryFilter === opt.value
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <button
          onClick={() =>
            setSupplyModal({ open: true, mode: "create", data: null })
          }
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-semibold text-sm shadow-lg shadow-blue-500/25 transition-all"
        >
          <AddIcon sx={{ fontSize: 18 }} />
          Thêm mặt hàng
        </button>
        <button
          onClick={() => setDistributeModal({ open: true, supply: null })}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-2xl font-semibold text-sm shadow-lg shadow-orange-500/25 transition-all"
        >
          <ShipIcon sx={{ fontSize: 18 }} />
          Xuất kho hàng loạt
        </button>
      </div>

      {/* Table */}
      {suppliesLoading ? (
        <div className="flex items-center justify-center py-20 text-slate-500">
          <RefreshIcon sx={{ fontSize: 32 }} className="animate-spin mr-3" />
          Đang tải dữ liệu...
        </div>
      ) : supplies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <BoxIcon sx={{ fontSize: 56 }} className="mb-4 opacity-30" />
          <p className="font-semibold">Chưa có mặt hàng nào</p>
          <p className="text-sm mt-1">Nhấn "Thêm mặt hàng" để bắt đầu</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Mặt hàng
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Danh mục
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Tồn kho
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {supplies.map((item) => (
                <tr
                  key={item.id}
                  className={`hover:bg-slate-50 transition-colors ${item.is_low_stock ? "bg-amber-50/40" : ""}`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${getCategoryColor(item.category)}`}
                      >
                        {getCategoryIcon(item.category)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          {item.name}
                        </p>
                        {item.notes && (
                          <p className="text-xs text-slate-400 truncate max-w-[180px]">
                            {item.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-semibold ${getCategoryColor(item.category)}`}
                    >
                      {CATEGORY_LABELS[item.category] || item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="text-lg font-bold text-slate-900">
                      {item.quantity ?? 0}
                      <span className="text-xs font-normal text-slate-500 ml-1">
                        {item.unit}
                      </span>
                    </p>
                    <p className="text-xs text-slate-400">
                      Tối thiểu: {item.min_quantity}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {item.is_low_stock ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                        Sắp hết
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Đủ hàng
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        title="Xem lô hàng"
                        onClick={() => handleOpenStockModal(item)}
                        className="p-2 hover:bg-indigo-100 text-indigo-600 rounded-xl transition-colors"
                      >
                        <LayersIcon sx={{ fontSize: 18 }} />
                      </button>
                      <button
                        title="Xuất kho"
                        onClick={() =>
                          setDistributeModal({ open: true, supply: item })
                        }
                        className="p-2 hover:bg-orange-100 text-orange-600 rounded-xl transition-colors"
                      >
                        <ShipIcon sx={{ fontSize: 18 }} />
                      </button>
                      <button
                        title="Chỉnh sửa"
                        onClick={() =>
                          setSupplyModal({
                            open: true,
                            mode: "edit",
                            data: item,
                          })
                        }
                        className="p-2 hover:bg-blue-100 text-blue-600 rounded-xl transition-colors"
                      >
                        <EditIcon sx={{ fontSize: 18 }} />
                      </button>
                      <button
                        title="Xóa"
                        onClick={() =>
                          setDeleteConfirm({ open: true, supply: item })
                        }
                        className="p-2 hover:bg-red-100 text-red-500 rounded-xl transition-colors"
                      >
                        <DeleteIcon sx={{ fontSize: 18 }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination pagination={suppliesPagination} onPageChange={loadSupplies} />
    </div>
  );

  // ─── Render: Tab Đợt nhập kho ─────────────────
  const renderImportBatchesTab = () => (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Filter bar */}
      <div className="p-6 border-b border-slate-100 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-600">
            Trạng thái:
          </span>
          {[
            { value: "", label: "Tất cả" },
            { value: "draft", label: "Đang nhập" },
            { value: "completed", label: "Hoàn tất" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setBatchStatusFilter(opt.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                batchStatusFilter === opt.value
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-600">Nguồn:</span>
          {[
            { value: "", label: "Tất cả" },
            { value: "donate", label: "Quyên góp" },
            { value: "purchase", label: "Mua" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setBatchSourceFilter(opt.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                batchSourceFilter === opt.value
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={openImportFileModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-2xl font-semibold text-sm shadow-lg shadow-purple-500/25 transition-all"
          >
            <UploadIcon sx={{ fontSize: 18 }} />
            Import từ file
          </button>
          <button
            onClick={openImportBatchModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl font-semibold text-sm shadow-lg shadow-emerald-500/25 transition-all"
          >
            <AddIcon sx={{ fontSize: 18 }} />
            Tạo đợt nhập
          </button>
        </div>
      </div>

      {/* List */}
      {batchesLoading ? (
        <div className="flex items-center justify-center py-20 text-slate-500">
          <RefreshIcon sx={{ fontSize: 32 }} className="animate-spin mr-3" />
          Đang tải dữ liệu...
        </div>
      ) : importBatches.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <PasteIcon sx={{ fontSize: 56 }} className="mb-4 opacity-30" />
          <p className="font-semibold">Chưa có đợt nhập kho nào</p>
          <p className="text-sm mt-1">Nhấn "Tạo đợt nhập" để bắt đầu</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {importBatches.map((batch) => (
            <div
              key={batch.id}
              className="hover:bg-slate-50/50 transition-colors"
            >
              {/* Batch header row */}
              <div className="px-6 py-4 flex items-center gap-4">
                <button
                  onClick={() =>
                    setExpandedBatch(
                      expandedBatch === batch.id ? null : batch.id,
                    )
                  }
                  className="p-1.5 hover:bg-slate-200 rounded-xl transition-colors text-slate-500 flex-shrink-0"
                >
                  {expandedBatch === batch.id ? (
                    <CollapseIcon sx={{ fontSize: 20 }} />
                  ) : (
                    <ExpandIcon sx={{ fontSize: 20 }} />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">
                    {batch.name}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500">
                    <span>📅 {formatDate(batch.import_date)}</span>
                    {batch.donor_name && <span>👤 {batch.donor_name}</span>}
                    {batch.source === "donate" && batch.donor_phone && (
                      <span>📞 {batch.donor_phone}</span>
                    )}
                    {batch.manager && <span>🔑 {batch.manager.username}</span>}
                    {batch.notes && (
                      <span className="truncate max-w-[200px]">
                        📝 {batch.notes}
                      </span>
                    )}
                  </div>
                </div>

                <span
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap ${
                    batch.source === "donate"
                      ? "bg-purple-50 text-purple-700 border border-purple-200"
                      : "bg-blue-50 text-blue-700 border border-blue-200"
                  }`}
                >
                  {SOURCE_LABELS[batch.source] || batch.source}
                </span>

                <span
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap ${
                    batch.status === "completed"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}
                >
                  {batch.status === "completed" ? "✓ Hoàn tất" : "⏳ Đang nhập"}
                </span>

                <span className="text-sm font-semibold text-slate-600 whitespace-nowrap">
                  {(batch.items || []).length} mặt hàng
                </span>

                {batch.status === "draft" && (
                  <button
                    onClick={() => handleCompleteBatch(batch.id)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm whitespace-nowrap"
                  >
                    <CheckIcon sx={{ fontSize: 16 }} />
                    Hoàn tất
                  </button>
                )}
              </div>

              {/* Expanded: items table */}
              {expandedBatch === batch.id && Array.isArray(batch.items) && (
                <div className="px-6 pb-5">
                  {batch.items.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-4">
                      Chưa có mặt hàng nào trong đợt nhập này.
                    </p>
                  ) : (
                    <div className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-200">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-slate-100">
                            <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">
                              Mặt hàng
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">
                              Số lượng nhập
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">
                              Còn lại
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase">
                              Hạn sử dụng
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase">
                              Tình trạng
                            </th>
                            {batch.status === "draft" && (
                              <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">
                                Xóa
                              </th>
                            )}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {batch.items.map((it) => (
                            <tr
                              key={it.id}
                              className="hover:bg-white transition-colors"
                            >
                              <td className="px-4 py-3">
                                <p className="font-semibold text-slate-800">
                                  {it.supply?.name || it.supply_id}
                                </p>
                                {it.notes && (
                                  <p className="text-xs text-slate-400">
                                    {it.notes}
                                  </p>
                                )}
                              </td>
                              <td className="px-4 py-3 text-right font-bold text-slate-800">
                                {it.quantity}
                                <span className="text-xs font-normal text-slate-500 ml-1">
                                  {it.supply?.unit}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right font-bold text-emerald-700">
                                {it.remaining ?? it.quantity}
                              </td>
                              <td className="px-4 py-3 text-center text-slate-600">
                                {it.expiry_date
                                  ? formatDate(it.expiry_date)
                                  : "—"}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span
                                  className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold ${
                                    it.condition === "new"
                                      ? "bg-emerald-100 text-emerald-700"
                                      : it.condition === "good"
                                        ? "bg-blue-100 text-blue-700"
                                        : "bg-red-100 text-red-700"
                                  }`}
                                >
                                  {CONDITION_LABELS[it.condition] ||
                                    it.condition}
                                </span>
                              </td>
                              {batch.status === "draft" && (
                                <td className="px-4 py-3 text-right">
                                  <button
                                    onClick={() =>
                                      handleRemoveBatchItem(batch.id, it.id)
                                    }
                                    className="p-1.5 hover:bg-red-100 text-red-500 rounded-lg transition-colors"
                                  >
                                    <DeleteIcon sx={{ fontSize: 16 }} />
                                  </button>
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Pagination
        pagination={batchesPagination}
        onPageChange={loadImportBatches}
      />
    </div>
  );

  // ─── Render: Tab Lịch sử xuất kho ────────────
  const renderDistributionsTab = () => (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <p className="text-sm text-slate-600 font-semibold">
          Tất cả phiếu xuất kho
        </p>
        <button
          onClick={() => loadDistributions(1)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-semibold text-slate-700 transition-colors"
        >
          <RefreshIcon sx={{ fontSize: 16 }} />
          Làm mới
        </button>
      </div>

      {distLoading ? (
        <div className="flex items-center justify-center py-20 text-slate-500">
          <RefreshIcon sx={{ fontSize: 32 }} className="animate-spin mr-3" />
          Đang tải dữ liệu...
        </div>
      ) : distributions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <ShipIcon sx={{ fontSize: 56 }} className="mb-4 opacity-30" />
          <p className="font-semibold">Chưa có phiếu xuất kho nào</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Mặt hàng
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Đội nhận
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Số lượng
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Người xuất
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Thời gian
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Ghi chú
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {distributions.map((dist) => (
                <tr
                  key={dist.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${getCategoryColor(dist.supply?.category)}`}
                      >
                        {getCategoryIcon(dist.supply?.category, 16)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          {dist.supply?.name || "—"}
                        </p>
                        <p className="text-xs text-slate-400">
                          {CATEGORY_LABELS[dist.supply?.category] ||
                            dist.supply?.category ||
                            "—"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                    {dist.team?.name || "—"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="text-lg font-bold text-slate-900">
                      {dist.quantity}
                      <span className="text-xs font-normal text-slate-500 ml-1">
                        {dist.supply?.unit}
                      </span>
                    </p>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {dist.manager?.username || "—"}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">
                    {formatDateTime(dist.created_at)}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 max-w-[200px] truncate">
                    {dist.notes || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        pagination={distPagination}
        onPageChange={loadDistributions}
      />
    </div>
  );

  // ─── Render: Tab Lịch sử sử dụng vật phẩm ───
  const renderUsagesTab = () => (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Lịch sử sử dụng vật phẩm
          </h3>
          <p className="text-sm text-slate-500 mt-0.5">
            Báo cáo vật phẩm đội đã dùng trong các nhiệm vụ
          </p>
        </div>
      </div>

      {usagesLoading ? (
        <div className="flex items-center justify-center py-20 text-slate-500">
          <RefreshIcon sx={{ fontSize: 32 }} className="animate-spin mr-3" />
          Đang tải dữ liệu...
        </div>
      ) : usagesUnsupported ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 text-center">
          <WarningIcon sx={{ fontSize: 48 }} className="mb-3 text-amber-400" />
          <p className="font-semibold text-slate-700">
            API chưa sẵn sàng: chức năng sử dụng vật phẩm đang được triển khai.
          </p>
          <p className="text-sm mt-1 text-slate-500">
            Vui lòng thử lại sau khi backend được deploy đầy đủ.
          </p>
        </div>
      ) : usagesError ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <WarningIcon sx={{ fontSize: 48 }} className="mb-3 text-amber-400" />
          <p className="font-semibold text-slate-600">{usagesError}</p>
          <p className="text-sm mt-1">
            Tính năng này yêu cầu backend đã triển khai API supply usages
          </p>
        </div>
      ) : usages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <PasteIcon sx={{ fontSize: 56 }} className="mb-4 opacity-30" />
          <p className="font-semibold">Chưa có báo cáo sử dụng nào</p>
          <p className="text-sm mt-1">
            Dữ liệu sẽ xuất hiện khi đội báo cáo vật phẩm đã dùng
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Vật phẩm
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Đội
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Số lượng dùng
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Người báo cáo
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Thời gian
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Ghi chú
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {usages.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-slate-800">
                      {u.supply?.name || u.Supply?.name || "—"}
                    </p>
                    <p className="text-xs text-slate-400">
                      {u.supply?.unit || u.Supply?.unit || ""}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-700">
                      {u.team?.name || u.RescueTeam?.name || "—"}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-bold text-red-600">
                      -{u.quantity_used}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-600">
                      {u.reporter?.username ||
                        u.reported_by_user?.username ||
                        "—"}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs text-slate-500">
                      {u.created_at
                        ? new Date(u.created_at).toLocaleString("vi-VN")
                        : "—"}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs text-slate-500 max-w-[200px] truncate">
                      {u.notes || "—"}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination pagination={usagesPagination} onPageChange={loadUsages} />
    </div>
  );

  // ─── Main render ──────────────────────────────
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        <div className="p-8 max-w-[1800px] mx-auto">
          {/* Toast notification */}
          {toast && (
            <div
              className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl text-white text-sm font-semibold animate-bounce-once ${
                toast.type === "success" ? "bg-emerald-600" : "bg-red-600"
              }`}
            >
              {toast.type === "success" ? (
                <CheckIcon sx={{ fontSize: 20 }} />
              ) : (
                <WarningIcon sx={{ fontSize: 20 }} />
              )}
              {toast.message}
            </div>
          )}

          {/* Header */}
          <div className="mb-8 flex items-start justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-5xl font-bold text-slate-900 tracking-tight">
                Quản Lý Kho Hàng
              </h1>
              <p className="text-slate-600 text-base">
                Theo dõi, nhập kho, xuất kho và kiểm soát hàng cứu trợ •{" "}
                <span className="text-slate-900 font-semibold">
                  {new Date().toLocaleDateString("vi-VN", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </p>
            </div>
            <button
              onClick={() => {
                loadOverview();
                if (activeTab === "supplies")
                  loadSupplies(suppliesPagination.page);
                else if (activeTab === "import-batches")
                  loadImportBatches(batchesPagination.page);
                else if (activeTab === "distributions")
                  loadDistributions(distPagination.page);
                else if (activeTab === "usages")
                  !usagesUnsupported && loadUsages(usagesPagination.page);
              }}
              className="flex items-center gap-2 px-5 py-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 font-semibold transition-all shadow-sm hover:shadow-lg text-sm whitespace-nowrap"
            >
              <RefreshIcon sx={{ fontSize: 20 }} />
              Làm mới
            </button>
          </div>

          {/* Overview Stats */}
          {renderOverviewCards()}

          {/* Low stock alert */}
          {!overviewLoading && overview && renderLowStockAlert()}

          {/* Tab navigation */}
          <div className="flex items-center gap-2 mb-6 p-1.5 bg-white rounded-2xl shadow-sm border border-slate-200 w-fit">
            {[
              {
                key: "supplies",
                label: "Mặt hàng",
                icon: <BoxIcon sx={{ fontSize: 18 }} />,
              },
              {
                key: "import-batches",
                label: "Đợt nhập kho",
                icon: <InventoryIcon sx={{ fontSize: 18 }} />,
              },
              {
                key: "distributions",
                label: "Lịch sử xuất kho",
                icon: <ShipIcon sx={{ fontSize: 18 }} />,
              },
              {
                key: "usages",
                label: "Sử dụng vật phẩm",
                icon: <PasteIcon sx={{ fontSize: 18 }} />,
              },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === tab.key
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === "supplies" && renderSuppliesTab()}
          {activeTab === "import-batches" && renderImportBatchesTab()}
          {activeTab === "distributions" && renderDistributionsTab()}
          {activeTab === "usages" && renderUsagesTab()}

          {/* Footer */}
          <div className="mt-8 border-t border-slate-200 pt-6 text-center">
            <p className="text-xs text-slate-500">
              © 2026 ReliefOps System — Inventory Module
            </p>
          </div>
        </div>
      </div>

      {/* ── Modal: Tạo / Chỉnh sửa mặt hàng ── */}
      <Modal
        open={supplyModal.open}
        onClose={() =>
          setSupplyModal({ open: false, mode: "create", data: null })
        }
        title={
          supplyModal.mode === "edit"
            ? "Chỉnh sửa mặt hàng"
            : "Thêm mặt hàng mới"
        }
      >
        <SupplyForm
          initial={supplyModal.data}
          loading={formLoading}
          onSubmit={
            supplyModal.mode === "edit"
              ? handleUpdateSupply
              : handleCreateSupply
          }
          onCancel={() =>
            setSupplyModal({ open: false, mode: "create", data: null })
          }
        />
      </Modal>

      {/* ── Modal: Xuất kho ── */}
      <Modal
        open={distributeModal.open}
        onClose={() => setDistributeModal({ open: false, supply: null })}
        title="Xuất kho cho đội cứu hộ"
        maxWidth="max-w-xl"
      >
        <DistributeForm
          initialSupply={distributeModal.supply}
          allSupplies={overview?.supplies || supplies}
          teams={teams}
          loading={formLoading}
          onSubmit={handleDistribute}
          onCancel={() => setDistributeModal({ open: false, supply: null })}
        />
      </Modal>

      {/* ── Modal: Tạo đợt nhập kho ── */}
      <Modal
        open={importBatchModal.open}
        onClose={() => setImportBatchModal({ open: false })}
        title="Tạo đợt nhập kho mới"
        maxWidth="max-w-2xl"
      >
        <ImportBatchForm
          supplies={importableSupplies}
          loading={formLoading}
          onSubmit={handleCreateBatch}
          onCancel={() => setImportBatchModal({ open: false })}
        />
      </Modal>

      {/* ── Modal: Xem lô hàng FIFO ── */}
      <Modal
        open={stockModal.open}
        onClose={() =>
          setStockModal({
            open: false,
            supply: null,
            data: null,
            loading: false,
          })
        }
        title={`Lô hàng tồn kho — ${stockModal.supply?.name || ""}`}
        maxWidth="max-w-2xl"
      >
        {stockModal.loading ? (
          <div className="flex items-center justify-center py-16 text-slate-500">
            <RefreshIcon sx={{ fontSize: 32 }} className="animate-spin mr-3" />
            Đang tải thông tin lô hàng...
          </div>
        ) : stockModal.data ? (
          <div className="space-y-5">
            {/* Tổng quan */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                <p className="text-xs font-bold text-blue-500 uppercase tracking-wide mb-1">
                  Tổng tồn kho thực tế
                </p>
                <p className="text-3xl font-bold text-blue-800">
                  {stockModal.data.total_remaining}
                  <span className="text-base font-semibold text-blue-600 ml-2">
                    {stockModal.supply?.unit}
                  </span>
                </p>
              </div>
              <div
                className={`border rounded-2xl p-4 ${
                  stockModal.data.expiring_soon?.length > 0
                    ? "bg-red-50 border-red-200"
                    : "bg-emerald-50 border-emerald-200"
                }`}
              >
                <p
                  className={`text-xs font-bold uppercase tracking-wide mb-1 ${
                    stockModal.data.expiring_soon?.length > 0
                      ? "text-red-500"
                      : "text-emerald-500"
                  }`}
                >
                  Lô sắp hết hạn (≤7 ngày)
                </p>
                <p
                  className={`text-3xl font-bold ${
                    stockModal.data.expiring_soon?.length > 0
                      ? "text-red-700"
                      : "text-emerald-700"
                  }`}
                >
                  {stockModal.data.expiring_soon?.length ?? 0}
                  <span className="text-base font-semibold ml-2">lô</span>
                </p>
              </div>
            </div>

            {/* Danh sách lô hàng */}
            <div>
              <p className="text-sm font-bold text-slate-700 mb-3">
                Danh sách lô hàng tồn kho
              </p>
              {stockModal.data.lots?.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">
                  Chưa có lô hàng nào.
                </p>
              ) : (
                <div className="space-y-3">
                  {stockModal.data.lots.map((lot, idx) => {
                    const isExpiringSoon = stockModal.data.expiring_soon?.some(
                      (e) => e.id === lot.id,
                    );
                    const isFirst = idx === 0;
                    const pct =
                      lot.quantity > 0
                        ? Math.round((lot.remaining / lot.quantity) * 100)
                        : 0;
                    const today = new Date();
                    const expDate = lot.expiry_date
                      ? new Date(lot.expiry_date)
                      : null;
                    const daysLeft = expDate
                      ? Math.ceil((expDate - today) / (1000 * 60 * 60 * 24))
                      : null;

                    return (
                      <div
                        key={lot.id}
                        className={`relative border-2 rounded-2xl p-4 transition-all ${
                          isFirst
                            ? "border-indigo-300 bg-indigo-50/50 shadow-md shadow-indigo-100"
                            : isExpiringSoon
                              ? "border-red-200 bg-red-50/30"
                              : "border-slate-200 bg-white"
                        }`}
                      >
                        {/* Badge thứ tự */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center justify-center w-7 h-7 rounded-xl text-xs font-black flex-shrink-0 ${
                                isFirst
                                  ? "bg-indigo-600 text-white"
                                  : "bg-slate-200 text-slate-600"
                              }`}
                            >
                              {idx + 1}
                            </span>
                            <div>
                              <p className="text-sm font-bold text-slate-800">
                                {lot.batch?.name || "Lô không tên"}
                              </p>
                              <p className="text-xs text-slate-500">
                                Ngày nhập:{" "}
                                {lot.batch?.import_date
                                  ? formatDate(lot.batch.import_date)
                                  : "—"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            {isFirst && (
                              <span className="px-2.5 py-1 bg-indigo-600 text-white text-xs font-bold rounded-xl">
                                ▶ Xuất trước
                              </span>
                            )}
                            {isExpiringSoon && (
                              <span className="flex items-center gap-1 px-2.5 py-1 bg-red-600 text-white text-xs font-bold rounded-xl">
                                <ExpiryIcon sx={{ fontSize: 12 }} />
                                Sắp hết hạn
                              </span>
                            )}
                            <span
                              className={`px-2.5 py-1 rounded-xl text-xs font-semibold ${
                                lot.condition === "new"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : lot.condition === "good"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-red-100 text-red-700"
                              }`}
                            >
                              {CONDITION_LABELS[lot.condition] || lot.condition}
                            </span>
                          </div>
                        </div>

                        {/* Số lượng và progress bar */}
                        <div className="mb-3">
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="text-xs font-semibold text-slate-600">
                              Còn lại:{" "}
                              <span
                                className={`font-bold ${
                                  isFirst ? "text-indigo-700" : "text-slate-800"
                                }`}
                              >
                                {lot.remaining}
                              </span>
                              /{lot.quantity} {stockModal.supply?.unit}
                            </span>
                            <span className="text-xs font-bold text-slate-500">
                              {pct}%
                            </span>
                          </div>
                          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                pct >= 60
                                  ? isFirst
                                    ? "bg-indigo-500"
                                    : "bg-emerald-500"
                                  : pct >= 30
                                    ? "bg-amber-500"
                                    : "bg-red-500"
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>

                        {/* Hạn sử dụng */}
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">
                            <ExpiryIcon
                              sx={{ fontSize: 12 }}
                              className="mr-1 text-slate-400"
                            />
                            Hạn sử dụng:{" "}
                            <span
                              className={`font-semibold ${
                                isExpiringSoon
                                  ? "text-red-600"
                                  : daysLeft !== null && daysLeft <= 30
                                    ? "text-amber-600"
                                    : "text-slate-700"
                              }`}
                            >
                              {lot.expiry_date
                                ? formatDate(lot.expiry_date)
                                : "Không có HSD"}
                              {daysLeft !== null && (
                                <span className="ml-1">
                                  (
                                  {daysLeft > 0
                                    ? `còn ${daysLeft} ngày`
                                    : "Đã hết hạn"}
                                  )
                                </span>
                              )}
                            </span>
                          </span>
                          {lot.notes && (
                            <span className="text-slate-400 italic truncate max-w-[160px]">
                              📝 {lot.notes}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </Modal>

      {/* ── Modal: Import từ file ── */}
      <Modal
        open={importFileModal.open}
        onClose={() => setImportFileModal({ open: false })}
        title="Import đợt nhập từ file"
        maxWidth="max-w-2xl"
      >
        <ImportFromFileForm
          supplies={importableSupplies}
          loading={formLoading}
          onSubmit={handleCreateBatchFromFile}
          onCancel={() => setImportFileModal({ open: false })}
        />
      </Modal>

      {/* ── Modal: Xác nhận xóa mặt hàng ── */}
      <Modal
        open={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, supply: null })}
        title="Xác nhận xóa mặt hàng"
        maxWidth="max-w-sm"
      >
        <div className="space-y-5">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
            <p className="text-sm font-semibold text-red-800">
              Bạn có chắc muốn xóa mặt hàng{" "}
              <strong>"{deleteConfirm.supply?.name}"</strong>?
            </p>
            <p className="text-xs text-red-600 mt-2">
              ⚠️ Chỉ xóa được khi tồn kho = 0. Thao tác này không thể hoàn tác.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setDeleteConfirm({ open: false, supply: null })}
              className="flex-1 py-3 border border-slate-200 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 transition-colors text-sm"
            >
              Hủy
            </button>
            <button
              onClick={handleDeleteSupply}
              className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-semibold shadow-lg transition-all text-sm"
            >
              Xác nhận xóa
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
