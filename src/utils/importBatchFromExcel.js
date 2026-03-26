import * as XLSX from "xlsx";

export function normalizeExpiryCell(val) {
  if (val === "" || val == null) return "";
  if (typeof val === "number" && val > 20000) {
    const ms = Math.round((val - 25569) * 86400 * 1000);
    const d = new Date(ms);
    if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  }
  const s = String(val).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  return s;
}

export function normalizeConditionCell(raw) {
  const s = String(raw || "new").toLowerCase().trim();
  if (["new", "mới", "moi"].includes(s)) return "new";
  if (["good", "tốt", "tot"].includes(s)) return "good";
  if (["damaged", "hư hỏng", "hư", "hỏng"].includes(s)) return "damaged";
  if (["new", "good", "damaged"].includes(s)) return s;
  return "new";
}

export function readFirstSheetJson(arrayBuffer) {
  const data = new Uint8Array(arrayBuffer);
  const workbook = XLSX.read(data, { type: "array" });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(firstSheet, { defval: "" });
}

/**
 * Đọc file → nhóm dòng theo người quyên góp → trả về danh sách đợt.
 * Mỗi đợt: { donorName, donorPhone, items[], unmatchedSupplies[], skippedRows[] }
 *
 * @param {Array<{id, name}>} supplies
 * @param {Array<Record<string,unknown>>} jsonData
 * @returns {{ batches: Array, unmatchedSupplies: Set, skippedRows: Array }}
 */
export function parseMultiDonorExcel(supplies, jsonData) {
  const VN_PHONE_REGEX = /^0\d{9}$/;

  // key = "Người quyên góp|donor_phone"
  const groupMap = {};

  const unmatchedSupplies = new Set();
  const skippedRows = [];

  for (let i = 0; i < jsonData.length; i++) {
    const row = jsonData[i];

    const donorName = (row["Người quyên góp"] || row["Nguoi quyen gop"] || "").toString().trim();
    const donorPhone = (row["SĐT"] || row["SDT"] || row["donor_phone"] || "").toString().trim();

    const supplyName = (
      row["Tên mặt hàng"] ||
      row["ten_mat_hang"] ||
      row["name"] ||
      ""
    )
      .toString()
      .trim();

    // Bỏ qua dòng trống hoàn toàn
    if (!donorName && !donorPhone && !supplyName) {
      skippedRows.push({ row: i + 2, reason: "Dòng trống", data: row });
      continue;
    }

    // Thiếu tên người quyên góp
    if (!donorName) {
      skippedRows.push({
        row: i + 2,
        reason: "Thiếu 'Người quyên góp'",
        data: row,
      });
      continue;
    }

    // SĐT không hợp lệ
    if (donorPhone && !VN_PHONE_REGEX.test(donorPhone)) {
      skippedRows.push({
        row: i + 2,
        reason: "SĐT không hợp lệ (cần 10 số, bắt đầu 0)",
        data: row,
      });
      continue;
    }

    // Không có mặt hàng
    if (!supplyName) {
      skippedRows.push({
        row: i + 2,
        reason: "Thiếu 'Tên mặt hàng'",
        data: row,
      });
      continue;
    }

    const matchedSupply = supplies.find(
      (s) => s.name.toLowerCase() === supplyName.toLowerCase(),
    );
    if (!matchedSupply) {
      unmatchedSupplies.add(supplyName);
      skippedRows.push({
        row: i + 2,
        reason: `Mặt hàng "${supplyName}" không tồn tại trong kho`,
        data: row,
      });
      continue;
    }

    const key = `${donorName}|${donorPhone}`;
    if (!groupMap[key]) {
      groupMap[key] = {
        donorName,
        donorPhone,
        items: [],
      };
    }

    const qty = Number(row["Số lượng"] || row["so_luong"] || row["quantity"] || 1);
    groupMap[key].items.push({
      supply_id: matchedSupply.id,
      supply_name: matchedSupply.name,
      quantity: Number.isFinite(qty) && qty > 0 ? qty : 1,
      condition: normalizeConditionCell(
        row["Tình trạng"] || row["condition"] || "new",
      ),
      expiry_date: normalizeExpiryCell(
        row["Hạn sử dụng"] || row["expiry_date"] || "",
      ),
      notes: (row["Ghi chú"] || row["notes"] || "").toString().trim(),
    });
  }

  const batches = Object.values(groupMap);

  // Tính tổng số lượng mặt hàng mỗi đợt
  batches.forEach((b) => {
    b.totalItems = b.items.length;
    b.totalQuantity = b.items.reduce((s, it) => s + it.quantity, 0);
  });

  return { batches, unmatchedSupplies, skippedRows };
}

export function downloadMultiDonorTemplate(filename = "mau_quyen_gop_nhieu_nguoi.xlsx") {
  const templateData = [
    {
      "Người quyên góp": "Công ty ABC",
      "SĐT": "0901234567",
      "Tên mặt hàng": "Mì Tôm",
      "Số lượng": 1,
      "Tình trạng": "new",
      "Hạn sử dụng": "2027-01-01",
      "Ghi chú": "",
    },
    {
      "Người quyên góp": "Công ty ABC",
      "SĐT": "0901234567",
      "Tên mặt hàng": "Nước lọc",
      "Số lượng": 1,
      "Tình trạng": "new",
      "Hạn sử dụng": "2026-12-01",
      "Ghi chú": "Chai 500ml",
    },
    {
      "Người quyên góp": "Bà Nguyễn Thị X",
      "SĐT": "0912345678",
      "Tên mặt hàng": "Gạo",
      "Số lượng": 2,
      "Tình trạng": "good",
      "Hạn sử dụng": "2026-03-26",
      "Ghi chú": "",
    },
    {
      "Người quyên góp": "Bà Nguyễn Thị X",
      "SĐT": "0912345678",
      "Tên mặt hàng": "Trứng",
      "Số lượng": 2,
      "Tình trạng": "new",
      "Hạn sử dụng": "2026-03-26",
      "Ghi chú": "",
    },
  ];
  const ws = XLSX.utils.json_to_sheet(templateData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Danh sách quyên góp");
  XLSX.writeFile(wb, filename);
}
