# 📦 TÀI LIỆU API - QUẢN LÝ KHO

> **Base URL:** `http://localhost:<PORT>/api`
> **Xác thực:** JWT Bearer Token — gửi qua header `Authorization: Bearer <token>`

---

## 🔐 Phân quyền

| Middleware | Vai trò được phép |
|---|---|
| `requireViewAccess` | `admin`, `coordinator`, `manager` |
| `requireManager` | `manager`, `admin` |

---

## 📂 MỤC LỤC

1. [Mặt hàng (Supplies)](#1-mặt-hàng-supplies)
   - [Lấy danh sách mặt hàng](#11-lấy-danh-sách-mặt-hàng)
   - [Lấy chi tiết mặt hàng](#12-lấy-chi-tiết-mặt-hàng)
   - [Tạo mặt hàng mới](#13-tạo-mặt-hàng-mới)
   - [Cập nhật mặt hàng](#14-cập-nhật-mặt-hàng)
   - [Xóa mặt hàng](#15-xóa-mặt-hàng)
   - [Xuất kho cho đội cứu hộ](#16-xuất-kho-cho-đội-cứu-hộ)
   - [Lấy danh sách phiếu xuất kho](#17-lấy-danh-sách-phiếu-xuất-kho)
2. [Đợt nhập kho (Import Batches)](#2-đợt-nhập-kho-import-batches)
   - [Tổng quan kho](#21-tổng-quan-kho)
   - [Tồn kho theo mặt hàng](#22-tồn-kho-theo-mặt-hàng)
   - [Lấy danh sách đợt nhập](#23-lấy-danh-sách-đợt-nhập)
   - [Lấy chi tiết đợt nhập](#24-lấy-chi-tiết-đợt-nhập)
   - [Tạo đợt nhập mới](#25-tạo-đợt-nhập-mới)
   - [Hoàn tất đợt nhập](#26-hoàn-tất-đợt-nhập)
   - [Thêm mặt hàng vào đợt nhập](#27-thêm-mặt-hàng-vào-đợt-nhập)
   - [Xóa mặt hàng khỏi đợt nhập](#28-xóa-mặt-hàng-khỏi-đợt-nhập)

---

## 1. Mặt hàng (Supplies)

**Prefix route:** `/api/supplies`

---

### 1.1 Lấy danh sách mặt hàng

| Thuộc tính | Giá trị |
|---|---|
| **Method** | `GET` |
| **Endpoint** | `/api/supplies` |
| **Quyền** | `admin`, `coordinator`, `manager` |

#### Query Parameters

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `page` | `number` | Không | Trang hiện tại (mặc định: `1`) |
| `limit` | `number` | Không | Số bản ghi mỗi trang (mặc định: `20`) |
| `category` | `string` | Không | Lọc theo danh mục: `food`, `medicine`, `water`, `clothing`, `equipment`, `other` |
| `province_city` | `string` | Không | Lọc theo tỉnh/thành phố |

#### Response thành công `200`

```json
{
  "success": true,
  "message": "Supplies retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "name": "Mì gói",
      "category": "food",
      "unit": "thùng",
      "min_quantity": 10,
      "province_city": "Hà Nội",
      "notes": "Ghi chú",
      "quantity": 150,
      "is_low_stock": false,
      "created_at": "2026-03-01T00:00:00.000Z",
      "updated_at": "2026-03-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

> **Lưu ý:** `quantity` là tồn kho thực tế tính từ các lô nhập đã hoàn tất (FIFO). `is_low_stock = true` khi `quantity < min_quantity`.

---

### 1.2 Lấy chi tiết mặt hàng

| Thuộc tính | Giá trị |
|---|---|
| **Method** | `GET` |
| **Endpoint** | `/api/supplies/:id` |
| **Quyền** | `admin`, `coordinator`, `manager` |

#### Path Parameters

| Tham số | Kiểu | Mô tả |
|---|---|---|
| `id` | `UUID` | ID của mặt hàng |

#### Response thành công `200`

```json
{
  "success": true,
  "message": "Supply retrieved successfully",
  "data": {
    "id": "uuid",
    "name": "Mì gói",
    "category": "food",
    "unit": "thùng",
    "min_quantity": 10,
    "province_city": "Hà Nội",
    "notes": "Ghi chú",
    "created_at": "2026-03-01T00:00:00.000Z",
    "updated_at": "2026-03-01T00:00:00.000Z"
  }
}
```

#### Response lỗi `404`

```json
{
  "success": false,
  "message": "Failed to retrieve supply",
  "error": "Supply not found"
}
```

---

### 1.3 Tạo mặt hàng mới

| Thuộc tính | Giá trị |
|---|---|
| **Method** | `POST` |
| **Endpoint** | `/api/supplies` |
| **Quyền** | `manager`, `admin` |

#### Request Body (JSON)

| Trường | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `name` | `string` | ✅ | Tên mặt hàng |
| `category` | `string` | ✅ | Danh mục: `food`, `medicine`, `water`, `clothing`, `equipment`, `other` |
| `province_city` | `string` | ✅ | Tỉnh/thành phố |
| `unit` | `string` | Không | Đơn vị tính (mặc định: `"cái"`) |
| `min_quantity` | `number` | Không | Ngưỡng cảnh báo hết hàng (mặc định: `10`) |
| `notes` | `string` | Không | Ghi chú thêm |

#### Ví dụ Request

```json
{
  "name": "Nước uống đóng chai",
  "category": "water",
  "unit": "thùng",
  "province_city": "Đà Nẵng",
  "min_quantity": 20,
  "notes": "Thùng 24 chai 500ml"
}
```

#### Response thành công `201`

```json
{
  "success": true,
  "message": "Supply created successfully",
  "data": {
    "id": "uuid-mới",
    "name": "Nước uống đóng chai",
    "category": "water",
    "unit": "thùng",
    "min_quantity": 20,
    "province_city": "Đà Nẵng",
    "notes": "Thùng 24 chai 500ml",
    "created_at": "2026-03-07T00:00:00.000Z",
    "updated_at": "2026-03-07T00:00:00.000Z"
  }
}
```

---

### 1.4 Cập nhật mặt hàng

| Thuộc tính | Giá trị |
|---|---|
| **Method** | `PUT` |
| **Endpoint** | `/api/supplies/:id` |
| **Quyền** | `manager`, `admin` |

#### Path Parameters

| Tham số | Kiểu | Mô tả |
|---|---|---|
| `id` | `UUID` | ID của mặt hàng cần cập nhật |

#### Request Body (JSON) — Chỉ cần gửi các trường muốn thay đổi

| Trường | Kiểu | Mô tả |
|---|---|---|
| `name` | `string` | Tên mặt hàng |
| `category` | `string` | Danh mục: `food`, `medicine`, `water`, `clothing`, `equipment`, `other` |
| `unit` | `string` | Đơn vị tính |
| `province_city` | `string` | Tỉnh/thành phố |
| `min_quantity` | `number` | Ngưỡng cảnh báo hết hàng |
| `notes` | `string` | Ghi chú |

#### Ví dụ Request

```json
{
  "min_quantity": 30,
  "notes": "Cập nhật ngưỡng cảnh báo"
}
```

#### Response thành công `200`

```json
{
  "success": true,
  "message": "Supply updated successfully",
  "data": { ... }
}
```

---

### 1.5 Xóa mặt hàng

| Thuộc tính | Giá trị |
|---|---|
| **Method** | `DELETE` |
| **Endpoint** | `/api/supplies/:id` |
| **Quyền** | `manager`, `admin` |

#### Path Parameters

| Tham số | Kiểu | Mô tả |
|---|---|---|
| `id` | `UUID` | ID của mặt hàng cần xóa |

> **Ràng buộc:** Không thể xóa mặt hàng nếu tồn kho còn > 0 (soft delete).

#### Response thành công `200`

```json
{
  "success": true,
  "message": "Supply deleted successfully"
}
```

#### Response lỗi `400`

```json
{
  "success": false,
  "message": "Failed to delete supply",
  "error": "Không thể xóa mặt hàng còn 50 trong kho"
}
```

---

### 1.6 Xuất kho cho đội cứu hộ

| Thuộc tính | Giá trị |
|---|---|
| **Method** | `POST` |
| **Endpoint** | `/api/supplies/:id/distribute` |
| **Quyền** | `manager`, `admin` |

Phân phối hàng hóa từ kho đến đội cứu hộ theo thuật toán **FIFO** (First In First Out — ưu tiên xuất lô có hạn sử dụng sớm nhất).

#### Path Parameters

| Tham số | Kiểu | Mô tả |
|---|---|---|
| `id` | `UUID` | ID của mặt hàng cần xuất kho |

#### Request Body (JSON)

| Trường | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `team_id` | `UUID` | ✅ | ID đội cứu hộ nhận hàng |
| `quantity` | `number` | ✅ | Số lượng xuất kho (≥ 1) |
| `notes` | `string` | Không | Ghi chú phiếu xuất |

#### Ví dụ Request

```json
{
  "team_id": "uuid-đội-cứu-hộ",
  "quantity": 50,
  "notes": "Phân phối cho đội cứu hộ miền Trung"
}
```

#### Response thành công `200`

```json
{
  "success": true,
  "message": "Supply distributed successfully",
  "data": {
    "id": "uuid-phiếu-xuất",
    "supply_id": "uuid-mặt-hàng",
    "team_id": "uuid-đội-cứu-hộ",
    "quantity": 50,
    "distributed_by": "uuid-manager",
    "notes": "Phân phối cho đội cứu hộ miền Trung",
    "created_at": "2026-03-07T00:00:00.000Z"
  }
}
```

#### Response lỗi `400`

```json
{
  "success": false,
  "message": "Failed to distribute supply",
  "error": "Không đủ số lượng. Hiện có: 30 thùng"
}
```

---

### 1.7 Lấy danh sách phiếu xuất kho

| Thuộc tính | Giá trị |
|---|---|
| **Method** | `GET` |
| **Endpoint** | `/api/supplies/distributions` |
| **Quyền** | `admin`, `coordinator`, `manager` |

#### Query Parameters

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `page` | `number` | Không | Trang hiện tại (mặc định: `1`) |
| `limit` | `number` | Không | Số bản ghi mỗi trang (mặc định: `20`) |
| `team_id` | `UUID` | Không | Lọc theo đội cứu hộ |
| `supply_id` | `UUID` | Không | Lọc theo mặt hàng |

#### Response thành công `200`

```json
{
  "success": true,
  "message": "Distributions retrieved successfully",
  "data": [
    {
      "id": "uuid-phiếu-xuất",
      "supply_id": "uuid",
      "team_id": "uuid",
      "quantity": 50,
      "distributed_by": "uuid-manager",
      "notes": "...",
      "created_at": "2026-03-07T00:00:00.000Z",
      "supply": {
        "id": "uuid",
        "name": "Mì gói",
        "category": "food",
        "unit": "thùng"
      },
      "team": {
        "id": "uuid",
        "name": "Đội cứu hộ số 1"
      },
      "manager": {
        "id": "uuid",
        "username": "manager01",
        "email": "manager01@example.com"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

## 2. Đợt nhập kho (Import Batches)

**Prefix route:** `/api/import-batches`

Quản lý các đợt nhập kho. Mỗi đợt nhập có trạng thái `draft` → `completed`. Khi hoàn tất (`completed`), hàng hóa mới được tính vào tồn kho.

---

### 2.1 Tổng quan kho

| Thuộc tính | Giá trị |
|---|---|
| **Method** | `GET` |
| **Endpoint** | `/api/import-batches/overview` |
| **Quyền** | `admin`, `coordinator`, `manager` |

Trả về tổng quan toàn bộ kho hàng: tồn kho thực tế, hàng sắp hết, hàng sắp hết hạn.

#### Response thành công `200`

```json
{
  "success": true,
  "message": "Warehouse overview retrieved successfully",
  "data": {
    "total_items": 15,
    "low_stock": 3,
    "expiring_soon": 2,
    "supplies": [
      {
        "id": "uuid",
        "name": "Mì gói",
        "category": "food",
        "unit": "thùng",
        "min_quantity": 10,
        "province_city": "Hà Nội",
        "total_remaining": 150,
        "expiring_soon": 0,
        "is_low_stock": false
      },
      {
        "id": "uuid",
        "name": "Thuốc cảm",
        "category": "medicine",
        "unit": "hộp",
        "min_quantity": 50,
        "province_city": "Hà Nội",
        "total_remaining": 8,
        "expiring_soon": 2,
        "is_low_stock": true
      }
    ]
  }
}
```

> **Chú thích:**
> - `low_stock`: Số mặt hàng có tồn kho dưới ngưỡng `min_quantity`
> - `expiring_soon`: Số mặt hàng có lô hàng sắp hết hạn trong **7 ngày** tới

---

### 2.2 Tồn kho theo mặt hàng

| Thuộc tính | Giá trị |
|---|---|
| **Method** | `GET` |
| **Endpoint** | `/api/import-batches/stock/:id` |
| **Quyền** | `admin`, `coordinator`, `manager` |

Lấy chi tiết tồn kho từng lô nhập của một mặt hàng cụ thể, bao gồm cảnh báo sắp hết hạn.

#### Path Parameters

| Tham số | Kiểu | Mô tả |
|---|---|---|
| `id` | `UUID` | ID của mặt hàng (supply) |

#### Response thành công `200`

```json
{
  "success": true,
  "message": "Stock retrieved successfully",
  "data": {
    "supply_id": "uuid-mặt-hàng",
    "total_remaining": 120,
    "lots": [
      {
        "id": "uuid-lô",
        "batch_id": "uuid-đợt-nhập",
        "supply_id": "uuid",
        "quantity": 100,
        "remaining": 70,
        "expiry_date": "2026-06-01",
        "condition": "new",
        "notes": null,
        "batch": {
          "id": "uuid",
          "name": "Đợt nhập tháng 3",
          "import_date": "2026-03-01"
        }
      },
      {
        "id": "uuid-lô-2",
        "batch_id": "uuid-đợt-nhập-2",
        "supply_id": "uuid",
        "quantity": 80,
        "remaining": 50,
        "expiry_date": "2026-09-15",
        "condition": "good",
        "notes": null
      }
    ],
    "expiring_soon": [
      {
        "id": "uuid-lô",
        "remaining": 70,
        "expiry_date": "2026-03-10"
      }
    ]
  }
}
```

> **Lưu ý:** `expiring_soon` chứa các lô còn hàng và hết hạn trong **7 ngày** tới.

---

### 2.3 Lấy danh sách đợt nhập

| Thuộc tính | Giá trị |
|---|---|
| **Method** | `GET` |
| **Endpoint** | `/api/import-batches` |
| **Quyền** | `admin`, `coordinator`, `manager` |

#### Query Parameters

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `page` | `number` | Không | Trang hiện tại (mặc định: `1`) |
| `limit` | `number` | Không | Số bản ghi mỗi trang (mặc định: `20`) |
| `source` | `string` | Không | Lọc theo nguồn: `donate` (quyên góp), `purchase` (mua) |
| `status` | `string` | Không | Lọc theo trạng thái: `draft`, `completed` |

#### Response thành công `200`

```json
{
  "success": true,
  "message": "Import batches retrieved successfully",
  "data": [
    {
      "id": "uuid-đợt-nhập",
      "name": "Đợt nhập tháng 3/2026",
      "source": "donate",
      "donor_name": "Công ty ABC",
      "donor_phone": "0901234567",
      "import_date": "2026-03-01",
      "status": "completed",
      "notes": "Ghi chú",
      "created_by": "uuid-manager",
      "created_at": "2026-03-01T08:00:00.000Z",
      "manager": {
        "id": "uuid",
        "username": "manager01",
        "email": "manager01@example.com"
      },
      "items": [
        {
          "id": "uuid-item",
          "supply_id": "uuid",
          "quantity": 100,
          "remaining": 70,
          "expiry_date": "2026-06-01",
          "condition": "new",
          "supply": {
            "id": "uuid",
            "name": "Mì gói",
            "category": "food",
            "unit": "thùng"
          }
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 10,
    "totalPages": 1
  }
}
```

---

### 2.4 Lấy chi tiết đợt nhập

| Thuộc tính | Giá trị |
|---|---|
| **Method** | `GET` |
| **Endpoint** | `/api/import-batches/:id` |
| **Quyền** | `admin`, `coordinator`, `manager` |

#### Path Parameters

| Tham số | Kiểu | Mô tả |
|---|---|---|
| `id` | `UUID` | ID của đợt nhập |

#### Response thành công `200`

```json
{
  "success": true,
  "message": "Import batch retrieved successfully",
  "data": {
    "id": "uuid-đợt-nhập",
    "name": "Đợt nhập tháng 3/2026",
    "source": "donate",
    "donor_name": "Công ty ABC",
    "donor_phone": "0901234567",
    "import_date": "2026-03-01",
    "status": "draft",
    "notes": "Ghi chú",
    "manager": { ... },
    "items": [ ... ]
  }
}
```

#### Response lỗi `404`

```json
{
  "success": false,
  "message": "Failed to retrieve batch",
  "error": "Import batch not found"
}
```

---

### 2.5 Tạo đợt nhập mới

| Thuộc tính | Giá trị |
|---|---|
| **Method** | `POST` |
| **Endpoint** | `/api/import-batches` |
| **Quyền** | `manager`, `admin` |

Tạo một đợt nhập kho mới với trạng thái `draft`. Phải có ít nhất 1 mặt hàng.

#### Request Body (JSON)

| Trường | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `name` | `string` | ✅ | Tên đợt nhập, VD: `"Đợt 1 tháng 3/2026"` |
| `source` | `string` | ✅ | Nguồn nhập: `donate` (quyên góp) hoặc `purchase` (mua) |
| `import_date` | `string` | ✅ | Ngày nhập kho (định dạng `YYYY-MM-DD`) |
| `donor_name` | `string` | ✅ nếu `source = donate` | Tên người/tổ chức quyên góp |
| `donor_phone` | `string` | Không | Số điện thoại người quyên góp |
| `notes` | `string` | Không | Ghi chú đợt nhập |
| `items` | `array` | ✅ | Danh sách mặt hàng (tối thiểu 1) |
| `items[].supply_id` | `UUID` | ✅ | ID mặt hàng |
| `items[].quantity` | `number` | ✅ | Số lượng nhập (≥ 1) |
| `items[].expiry_date` | `string` | Không | Hạn sử dụng (`YYYY-MM-DD`), dùng cho thực phẩm/thuốc |
| `items[].condition` | `string` | Không | Tình trạng: `new` (mặc định), `good`, `damaged` |
| `items[].notes` | `string` | Không | Ghi chú cho từng mặt hàng |

#### Ví dụ Request

```json
{
  "name": "Đợt nhập tháng 3/2026",
  "source": "donate",
  "donor_name": "Công ty Cổ phần ABC",
  "donor_phone": "0901234567",
  "import_date": "2026-03-07",
  "notes": "Hàng được vận chuyển về kho trung tâm",
  "items": [
    {
      "supply_id": "uuid-mì-gói",
      "quantity": 200,
      "expiry_date": "2026-09-01",
      "condition": "new",
      "notes": "Mì 3 miền"
    },
    {
      "supply_id": "uuid-nước-uống",
      "quantity": 100,
      "condition": "new"
    }
  ]
}
```

#### Response thành công `201`

```json
{
  "success": true,
  "message": "Import batch created successfully",
  "data": {
    "id": "uuid-đợt-nhập-mới",
    "name": "Đợt nhập tháng 3/2026",
    "source": "donate",
    "donor_name": "Công ty Cổ phần ABC",
    "donor_phone": "0901234567",
    "import_date": "2026-03-07",
    "status": "draft",
    "notes": "Hàng được vận chuyển về kho trung tâm",
    "created_by": "uuid-manager",
    "manager": { ... },
    "items": [ ... ]
  }
}
```

---

### 2.6 Hoàn tất đợt nhập

| Thuộc tính | Giá trị |
|---|---|
| **Method** | `POST` |
| **Endpoint** | `/api/import-batches/:id/complete` |
| **Quyền** | `manager`, `admin` |

Chuyển trạng thái đợt nhập từ `draft` → `completed`. Sau khi hoàn tất, tồn kho được cập nhật và **không thể thêm/xóa mặt hàng** trong đợt này nữa.

#### Path Parameters

| Tham số | Kiểu | Mô tả |
|---|---|---|
| `id` | `UUID` | ID của đợt nhập |

#### Response thành công `200`

```json
{
  "success": true,
  "message": "Batch completed successfully. Stock has been updated.",
  "data": {
    "id": "uuid",
    "name": "Đợt nhập tháng 3/2026",
    "status": "completed",
    ...
  }
}
```

#### Các lỗi có thể xảy ra

| Lỗi | HTTP | Mô tả |
|---|---|---|
| `Batch is already completed` | `400` | Đợt nhập đã hoàn tất rồi |
| `Cannot complete batch with no items` | `400` | Đợt nhập không có mặt hàng nào |
| `Import batch not found` | `404` | Không tìm thấy đợt nhập |

---

### 2.7 Thêm mặt hàng vào đợt nhập

| Thuộc tính | Giá trị |
|---|---|
| **Method** | `POST` |
| **Endpoint** | `/api/import-batches/:id/items` |
| **Quyền** | `manager`, `admin` |

Thêm một mặt hàng vào đợt nhập đang ở trạng thái `draft`.

#### Path Parameters

| Tham số | Kiểu | Mô tả |
|---|---|---|
| `id` | `UUID` | ID của đợt nhập |

#### Request Body (JSON)

| Trường | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `supply_id` | `UUID` | ✅ | ID mặt hàng |
| `quantity` | `number` | ✅ | Số lượng nhập (≥ 1) |
| `expiry_date` | `string` | Không | Hạn sử dụng (`YYYY-MM-DD`) |
| `condition` | `string` | Không | Tình trạng: `new` (mặc định), `good`, `damaged` |
| `notes` | `string` | Không | Ghi chú |

#### Ví dụ Request

```json
{
  "supply_id": "uuid-thuốc-cảm",
  "quantity": 50,
  "expiry_date": "2027-01-15",
  "condition": "new",
  "notes": "Thuốc Paracetamol 500mg"
}
```

#### Response thành công `201`

```json
{
  "success": true,
  "message": "Item added to batch successfully",
  "data": {
    "id": "uuid-item-mới",
    "batch_id": "uuid-đợt-nhập",
    "supply_id": "uuid-thuốc-cảm",
    "quantity": 50,
    "remaining": 50,
    "expiry_date": "2027-01-15",
    "condition": "new",
    "notes": "Thuốc Paracetamol 500mg"
  }
}
```

#### Response lỗi `400`

```json
{
  "success": false,
  "message": "Failed to add item",
  "error": "Cannot add items to completed batch"
}
```

---

### 2.8 Xóa mặt hàng khỏi đợt nhập

| Thuộc tính | Giá trị |
|---|---|
| **Method** | `DELETE` |
| **Endpoint** | `/api/import-batches/:id/items/:itemId` |
| **Quyền** | `manager`, `admin` |

Xóa một mặt hàng khỏi đợt nhập đang ở trạng thái `draft`.

#### Path Parameters

| Tham số | Kiểu | Mô tả |
|---|---|---|
| `id` | `UUID` | ID của đợt nhập |
| `itemId` | `UUID` | ID của mặt hàng trong đợt nhập |

#### Response thành công `200`

```json
{
  "success": true,
  "message": "Item removed successfully"
}
```

#### Các lỗi có thể xảy ra

| Lỗi | HTTP | Mô tả |
|---|---|---|
| `Cannot remove items from completed batch` | `400` | Không thể xóa khi đợt nhập đã hoàn tất |
| `Item not found in this batch` | `404` | Mặt hàng không tồn tại trong đợt nhập này |

---

## 📊 Cấu trúc dữ liệu (Models)

### Supply (Mặt hàng)

| Trường | Kiểu | Mô tả |
|---|---|---|
| `id` | `UUID` | Khóa chính |
| `name` | `string(100)` | Tên mặt hàng |
| `category` | `enum` | `food`, `medicine`, `water`, `clothing`, `equipment`, `other` |
| `unit` | `string(20)` | Đơn vị tính (cái, kg, lít, thùng...) |
| `min_quantity` | `integer` | Ngưỡng cảnh báo sắp hết hàng |
| `province_city` | `string(100)` | Tỉnh/thành phố |
| `notes` | `text` | Ghi chú |
| `created_at` | `datetime` | Thời gian tạo |
| `updated_at` | `datetime` | Thời gian cập nhật |
| `deleted_at` | `datetime` | Soft delete |

### ImportBatch (Đợt nhập kho)

| Trường | Kiểu | Mô tả |
|---|---|---|
| `id` | `UUID` | Khóa chính |
| `name` | `string(200)` | Tên đợt nhập |
| `source` | `enum` | `donate` (quyên góp), `purchase` (mua) |
| `donor_name` | `string(200)` | Tên người/tổ chức quyên góp |
| `donor_phone` | `string(20)` | SĐT người quyên góp |
| `import_date` | `date` | Ngày nhập kho |
| `status` | `enum` | `draft` (đang nhập), `completed` (hoàn tất) |
| `notes` | `text` | Ghi chú |
| `created_by` | `UUID` | Manager tạo phiếu nhập |

### SupplyImport (Chi tiết mặt hàng trong lô nhập)

| Trường | Kiểu | Mô tả |
|---|---|---|
| `id` | `UUID` | Khóa chính |
| `batch_id` | `UUID` | FK → ImportBatch |
| `supply_id` | `UUID` | FK → Supply |
| `quantity` | `integer` | Số lượng nhập |
| `remaining` | `integer` | Số lượng còn lại chưa xuất |
| `expiry_date` | `date` | Hạn sử dụng |
| `condition` | `enum` | `new`, `good`, `damaged` |
| `notes` | `text` | Ghi chú |

### SupplyDistribution (Phiếu xuất kho)

| Trường | Kiểu | Mô tả |
|---|---|---|
| `id` | `UUID` | Khóa chính |
| `supply_id` | `UUID` | FK → Supply |
| `team_id` | `UUID` | FK → RescueTeam |
| `quantity` | `integer` | Số lượng xuất |
| `distributed_by` | `UUID` | FK → User (Manager thực hiện) |
| `notes` | `text` | Ghi chú |
| `created_at` | `datetime` | Thời gian xuất kho |

---

## 🔄 Quy trình nghiệp vụ

### Nhập kho

```
Tạo đợt nhập (POST /import-batches)
       ↓  status: "draft"
Thêm/xóa mặt hàng (POST/DELETE /:id/items)
       ↓
Hoàn tất đợt nhập (POST /:id/complete)
       ↓  status: "completed"
Tồn kho được cập nhật tự động
```

### Xuất kho (FIFO)

```
Gọi POST /supplies/:id/distribute
       ↓
Hệ thống tự động trừ số lượng từ các lô nhập
theo thứ tự hạn sử dụng sớm nhất (FIFO)
       ↓
Tạo phiếu xuất kho (SupplyDistribution)
```

---

## ⚠️ Lưu ý quan trọng

- **Tồn kho thực tế** = Tổng `remaining` của tất cả `SupplyImport` thuộc các lô có `status = "completed"`
- **Thuật toán FIFO**: Khi xuất kho, ưu tiên trừ hàng từ lô có **hạn sử dụng sớm nhất** trước
- **Soft delete**: Mặt hàng (`Supply`) sử dụng soft delete — chỉ xóa được khi tồn kho = 0
- **Cảnh báo hết hạn**: Lô hàng có hạn sử dụng trong **7 ngày** tới sẽ xuất hiện trong `expiring_soon`
- **Cảnh báo hết hàng**: `is_low_stock = true` khi tồn kho thực tế < `min_quantity`
