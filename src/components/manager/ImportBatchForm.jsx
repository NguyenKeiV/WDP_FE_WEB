import React, { useState, useRef, useEffect } from "react";
import {
  Add as AddIcon,
  Close as CloseIcon,
  Search as SearchIcon,
} from "@mui/icons-material";

const CATEGORY_LABELS = {
  food: "Lương thực",
  medicine: "Y tế",
  water: "Nước uống",
  clothing: "Quần áo",
  equipment: "Thiết bị",
  other: "Khác",
};

const VN_PHONE_REGEX = /^0\d{9}$/;

function SupplySelect({ supplies, value, onChange, searchQuery, onSearchChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = supplies.find((s) => String(s.id) === String(value));

  const q = searchQuery.trim().toLowerCase();
  const filtered = q
    ? supplies.filter(
        (s) =>
          (s.name || "").toLowerCase().includes(q) ||
          (CATEGORY_LABELS[s.category] || s.category || "").toLowerCase().includes(q) ||
          (s.unit || "").toLowerCase().includes(q),
      )
    : supplies;

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      {/* Search bar */}
      <div className="relative">
        <SearchIcon
          sx={{ fontSize: 16 }}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            onSearchChange(e.target.value);
            if (!open) setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Tìm mặt hàng theo tên, loại, đơn vị..."
          className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
        />
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-52 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="px-3 py-3 text-sm text-slate-400 text-center">
              Không tìm thấy mặt hàng nào.
            </p>
          ) : (
            filtered.map((s) => {
              const isSelected = String(s.id) === String(value);
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    onChange(s.id);
                    setOpen(false);
                    onSearchChange("");
                  }}
                  className={`w-full text-left px-3 py-2.5 transition-colors ${
                    isSelected
                      ? "bg-blue-50 border-l-4 border-blue-500"
                      : "hover:bg-slate-50 border-l-4 border-transparent"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={`text-sm font-medium truncate ${
                        isSelected ? "text-blue-700" : "text-slate-800"
                      }`}
                    >
                      {s.name}
                    </p>
                    {isSelected && (
                      <span className="shrink-0 text-[10px] font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded-full">
                        Đã chọn
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    {CATEGORY_LABELS[s.category] || s.category} · {s.unit}
                  </p>
                </button>
              );
            })
          )}
        </div>
      )}

      {/* Hidden selected display */}
      {selected && (
        <div className="mt-1.5 px-2 py-1 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
          Đã chọn: <span className="font-semibold">{selected.name}</span> (
          {CATEGORY_LABELS[selected.category] || selected.category} ·{" "}
          {selected.unit})
        </div>
      )}
    </div>
  );
}

/**
 * Form tạo đợt nhập kho (dùng chung Kho hàng & trang Quyên góp).
 */
export default function ImportBatchForm({
  supplies,
  onSubmit,
  onCancel,
  loading,
  /** Khi true: form quyên góp (người/SĐT). Khi false: đợt nhập kho mặc định nguồn Mua. */
  donateOnly = false,
}) {
  const [form, setForm] = useState({
    name: "",
    import_date: new Date().toISOString().slice(0, 10),
    donor_name: "",
    donor_phone: "",
    notes: "",
  });
  const [items, setItems] = useState([
    {
      supply_id: "",
      quantity: 1,
      expiry_date: "",
      condition: "new",
      notes: "",
      supply_search: "",
    },
  ]);

  const setField = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const setItemField = (idx, field) => (e) =>
    setItems((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: e.target.value };
      return next;
    });

  const addItem = () =>
    setItems((prev) => [
      ...prev,
      {
        supply_id: "",
        quantity: 1,
        expiry_date: "",
        condition: "new",
        notes: "",
        supply_search: "",
      },
    ]);

  const removeItem = (idx) =>
    setItems((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanItems = items
      .filter((it) => it.supply_id)
      .map((it) => ({
        supply_id: it.supply_id,
        quantity: Number(it.quantity),
        expiry_date: it.expiry_date || undefined,
        condition: it.condition,
        notes: it.notes || undefined,
      }));
    if (!cleanItems.length) {
      alert("Vui lòng thêm ít nhất một mặt hàng.");
      return;
    }
    const payload = {
      name: form.name,
      source: donateOnly ? "donate" : "purchase",
      import_date: form.import_date,
      notes: form.notes || undefined,
      items: cleanItems,
    };
    if (donateOnly) {
      const donorPhone = String(form.donor_phone || "").trim();
      if (!donorPhone) {
        alert("Vui lòng nhập số điện thoại cho quyên góp.");
        return;
      }
      if (!VN_PHONE_REGEX.test(donorPhone)) {
        alert("Số điện thoại không hợp lệ (10 chữ số, bắt đầu 0).");
        return;
      }
      payload.donor_name = form.donor_name;
      payload.donor_phone = donorPhone;
    }
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Tên đợt nhập <span className="text-red-500">*</span>
          </label>
          <input
            required
            value={form.name}
            onChange={setField("name")}
            placeholder="VD: Đợt nhập tháng 3/2026"
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Ngày nhập kho <span className="text-red-500">*</span>
          </label>
          <input
            required
            type="date"
            value={form.import_date}
            onChange={setField("import_date")}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        {donateOnly && (
          <>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Người/Tổ chức quyên góp <span className="text-red-500">*</span>
              </label>
              <input
                required
                value={form.donor_name}
                onChange={setField("donor_name")}
                placeholder="Tên nhà tài trợ..."
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Số điện thoại
              </label>
              <input
                required
                value={form.donor_phone}
                onChange={setField("donor_phone")}
                placeholder="0901234567"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </>
        )}

        <div className="col-span-2">
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Ghi chú đợt nhập
          </label>
          <input
            value={form.notes}
            onChange={setField("notes")}
            placeholder="Ghi chú thêm..."
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-bold text-slate-700">
            Danh sách mặt hàng <span className="text-red-500">*</span>
          </label>
          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
          >
            <AddIcon sx={{ fontSize: 14 }} />
            Thêm mặt hàng
          </button>
        </div>

        <div className="space-y-3">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Mặt hàng #{idx + 1}
                </span>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <CloseIcon sx={{ fontSize: 16 }} />
                  </button>
                )}
              </div>

              {/* Searchable supply dropdown */}
              <SupplySelect
                supplies={supplies}
                value={item.supply_id}
                onChange={(id) => setItemField(idx, "supply_id")({ target: { value: id } })}
                searchQuery={item.supply_search}
                onSearchChange={(v) => setItemField(idx, "supply_search")({ target: { value: v } })}
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    required
                    type="number"
                    min="1"
                    placeholder="Số lượng *"
                    value={item.quantity}
                    onChange={setItemField(idx, "quantity")}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <select
                    value={item.condition}
                    onChange={setItemField(idx, "condition")}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                  >
                    <option value="new">Mới</option>
                    <option value="good">Tốt</option>
                    <option value="damaged">Hư hỏng</option>
                  </select>
                </div>
                <div>
                  <input
                    type="date"
                    placeholder="Hạn sử dụng"
                    value={item.expiry_date}
                    onChange={setItemField(idx, "expiry_date")}
                    title="Hạn sử dụng (tùy chọn)"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <input
                    placeholder="Ghi chú mặt hàng"
                    value={item.notes}
                    onChange={setItemField(idx, "notes")}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>
            </div>
          ))}
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
          disabled={loading}
          className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/25 transition-all text-sm disabled:opacity-50"
        >
          {loading ? "Đang tạo..." : "Tạo đợt nhập"}
        </button>
      </div>
    </form>
  );
}
