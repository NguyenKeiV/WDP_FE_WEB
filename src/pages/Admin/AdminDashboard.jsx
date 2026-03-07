import React, { useState, useEffect } from "react";
import Sidebar from "../../components/admin/Sidebar";
import avatarUser from "../../assets/images/avatar-user.svg";
import { getAllUsers } from "../../services/userService";
import {
  People,
  CheckCircle,
  HourglassEmpty,
  Lock,
  ChevronRight,
  Add,
  Search,
  Close,
  KeyboardArrowDown,
  TableChart,
  Apps,
  Download,
  CalendarMonth,
  VpnKey,
  Edit,
  LockOpen,
} from "@mui/icons-material";

export default function AdminDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("table"); // table or grid
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Lấy danh sách người dùng từ API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await getAllUsers();
        if (response.success && response.data) {
          setUsers(response.data);
        }
      } catch (err) {
        console.error("Lỗi khi tải danh sách người dùng:", err);
        setError(err.message || "Không thể tải danh sách người dùng");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Hàm chuyển đổi vai trò từ tiếng Anh sang tiếng Việt
  const getRoleLabel = (role) => {
    const roleMap = {
      ADMIN: "Quản trị viên",
      MANAGER: "Quản lý",
      COORDINATOR: "Điều phối viên",
      RESCUE_TEAM: "Đội cứu hộ",
      CITIZEN: "Người dân",
    };
    return roleMap[role] || role;
  };

  // Hàm lấy màu cho vai trò
  const getRoleColor = (role) => {
    const colorMap = {
      ADMIN: "purple",
      MANAGER: "purple",
      COORDINATOR: "blue",
      RESCUE_TEAM: "orange",
      CITIZEN: "slate",
    };
    return colorMap[role] || "slate";
  };

  // Hàm chuyển đổi trạng thái
  const getStatusFromActive = (isActive) => {
    return isActive ? "active" : "locked";
  };

  // Hàm format ngày tháng
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Chuyển đổi dữ liệu API sang format hiển thị
  const transformedUsers = users.map((user) => ({
    id: user.id,
    name: user.fullName,
    email: user.email,
    phone: user.phoneNumber,
    avatar: avatarUser,
    role: getRoleLabel(user.role),
    roleColor: getRoleColor(user.role),
    unit: "Đơn vị chưa cập nhật", // API không trả về thông tin này
    joinDate: formatDate(user.createdAt),
    status: getStatusFromActive(user.isActive),
  }));

  // Tính toán thống kê từ dữ liệu thực tế
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.isActive).length;
  const lockedUsers = users.filter((u) => !u.isActive).length;

  // Statistics data - Cập nhật với dữ liệu thực tế
  const stats = [
    {
      id: 1,
      label: "Tổng người dùng",
      value: totalUsers.toString(),
      change: "+12%",
      changeType: "increase",
      icon: <People sx={{ fontSize: 24 }} />,
      bgColor: "from-emerald-500 to-teal-600",
      lightBg: "bg-emerald-500/10",
      lightBorder: "border-emerald-500/20",
    },
    {
      id: 2,
      label: "Đang hoạt động",
      value: activeUsers.toString(),
      change: "+8%",
      changeType: "increase",
      icon: <CheckCircle sx={{ fontSize: 24 }} />,
      bgColor: "from-green-500 to-green-600",
      lightBg: "bg-green-500/10",
      lightBorder: "border-green-500/20",
    },
    {
      id: 3,
      label: "Chờ duyệt",
      value: "0",
      change: "-3%",
      changeType: "decrease",
      icon: <HourglassEmpty sx={{ fontSize: 24 }} />,
      bgColor: "from-yellow-500 to-yellow-600",
      lightBg: "bg-yellow-500/10",
      lightBorder: "border-yellow-500/20",
    },
    {
      id: 4,
      label: "Đã khóa",
      value: lockedUsers.toString(),
      change: "+2%",
      changeType: "increase",
      icon: <Lock sx={{ fontSize: 24 }} />,
      bgColor: "from-red-500 to-red-600",
      lightBg: "bg-red-500/10",
      lightBorder: "border-red-500/20",
    },
  ];

  const getRoleBadgeClasses = (color) => {
    const colorMap = {
      purple: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      blue: "bg-teal-500/10 text-teal-400 border-teal-500/20",
      orange: "bg-green-500/10 text-green-400 border-green-500/20",
      slate: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    };
    return colorMap[color] || colorMap.slate;
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      active: {
        label: "Đang hoạt động",
        classes: "bg-green-500/10 text-green-400 border-green-500/20",
      },
      pending: {
        label: "Chờ duyệt",
        classes: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      },
      locked: {
        label: "Đã khóa",
        classes: "bg-red-500/10 text-red-400 border-red-500/20",
        icon: true,
      },
    };
    return statusMap[status] || statusMap.active;
  };

  // Hiển thị loading state
  if (loading) {
    return (
      <div className="h-screen overflow-hidden flex bg-gray-50">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
            <p className="text-gray-600">Đang tải dữ liệu...</p>
          </div>
        </main>
      </div>
    );
  }

  // Hiển thị error state
  if (error) {
    return (
      <div className="h-screen overflow-hidden flex bg-gray-50">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <p className="text-gray-900 font-semibold mb-2">Lỗi tải dữ liệu</p>
            <p className="text-gray-600">{error}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden flex bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Gradient Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500/50 z-10"></div>

        {/* Header Area */}
        <header className="bg-white border-b border-gray-200 px-8 py-6 shrink-0 z-0">
          <div className="max-w-7xl mx-auto w-full">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                  <span>Admin</span>
                  <ChevronRight sx={{ fontSize: 12 }} />
                  <span className="text-gray-900">Người dùng</span>
                </div>
                <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
                  Quản lý người dùng
                </h1>
                <p className="text-gray-600 mt-2 text-sm max-w-2xl leading-relaxed">
                  Quản lý hồ sơ nhân sự, phân quyền truy cập và giám sát hoạt
                  động của các đội cứu trợ
                </p>
              </div>
              <button className="flex items-center justify-center gap-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-teal-600 hover:to-emerald-500 text-white px-6 py-3 rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300 font-semibold text-sm whitespace-nowrap group hover:scale-105">
                <Add
                  sx={{ fontSize: 20 }}
                  className="group-hover:rotate-90 transition-transform duration-300"
                />
                <span>Thêm người dùng</span>
              </button>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {stats.map((stat) => (
                <div
                  key={stat.id}
                  className="group relative bg-white border border-gray-200 rounded-xl p-5 hover:border-emerald-400 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-200/50 hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className={`p-3 rounded-lg ${stat.lightBg} border ${stat.lightBorder} group-hover:scale-110 transition-transform duration-300`}
                    >
                      <div className="text-gray-700">{stat.icon}</div>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        stat.changeType === "increase"
                          ? "bg-green-500/10 text-green-400 border border-green-500/20"
                          : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}
                    >
                      {stat.change}
                    </span>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900 mb-1">
                      {stat.value}
                    </p>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                  </div>
                  <div
                    className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-xl`}
                  ></div>
                </div>
              ))}
            </div>

            {/* Filters & Search Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="relative w-full md:max-w-xl group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search
                    sx={{ fontSize: 20 }}
                    className="text-gray-500 group-focus-within:text-emerald-600 transition-all duration-300"
                  />
                </div>
                <input
                  className="block w-full pl-12 pr-20 py-3 border border-gray-300 rounded-xl leading-5 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent sm:text-sm transition-all shadow-sm hover:shadow-emerald-200/50 focus:shadow-emerald-300/50"
                  placeholder="Tìm kiếm theo tên, email, số điện thoại..."
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-2">
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="p-1 hover:bg-slate-700 rounded transition-colors"
                    >
                      <Close sx={{ fontSize: 16 }} className="text-gray-500" />
                    </button>
                  )}
                  <kbd className="hidden sm:inline-flex items-center border border-gray-300 rounded-md px-2 py-1 text-xs font-sans font-medium text-gray-600 bg-gray-50">
                    ⌘K
                  </kbd>
                </div>
              </div>

              {/* Filter Chips & View Mode */}
              <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 w-full md:w-auto items-center">
                <div className="relative group">
                  <select
                    className="appearance-none bg-white border border-gray-300 text-gray-900 text-sm rounded-xl pl-4 pr-10 py-3 cursor-pointer hover:border-emerald-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all shadow-sm"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                  >
                    <option value="all">Tất cả vai trò</option>
                    <option value="manager">Quản lý</option>
                    <option value="coordinator">Điều phối viên</option>
                    <option value="rescue">Đội cứu hộ</option>
                    <option value="citizen">Người dân</option>
                  </select>
                  <KeyboardArrowDown
                    sx={{ fontSize: 16 }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none group-hover:text-emerald-600 transition-colors"
                  />
                </div>

                <div className="relative group">
                  <select
                    className="appearance-none bg-white border border-gray-300 text-gray-900 text-sm rounded-xl pl-4 pr-10 py-3 cursor-pointer hover:border-emerald-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all shadow-sm"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="active">Đang hoạt động</option>
                    <option value="pending">Chờ duyệt</option>
                    <option value="locked">Đã khóa</option>
                  </select>
                  <KeyboardArrowDown
                    sx={{ fontSize: 16 }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none group-hover:text-emerald-600 transition-colors"
                  />
                </div>

                {/* View Mode Toggle */}
                <div className="flex gap-1 bg-white border border-gray-300 rounded-xl p-1 shadow-sm">
                  <button
                    onClick={() => setViewMode("table")}
                    className={`p-2 rounded-lg transition-all ${
                      viewMode === "table"
                        ? "bg-emerald-500 text-white shadow-lg"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                    title="Xem dạng bảng"
                  >
                    <TableChart sx={{ fontSize: 20 }} />
                  </button>
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-lg transition-all ${
                      viewMode === "grid"
                        ? "bg-emerald-500 text-white shadow-lg"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                    title="Xem dạng lưới"
                  >
                    <Apps sx={{ fontSize: 20 }} />
                  </button>
                </div>

                {/* Export Button */}
                <button
                  className="flex items-center justify-center gap-2 px-4 h-[48px] rounded-xl border border-gray-300 bg-white text-gray-600 hover:text-gray-900 hover:border-emerald-400 hover:bg-gray-50 transition-all shadow-sm hover:shadow-emerald-200/50"
                  title="Xuất dữ liệu"
                >
                  <Download sx={{ fontSize: 20 }} />
                  <span className="hidden lg:inline text-sm font-medium">
                    Xuất
                  </span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Table Content */}
        <div className="flex-1 overflow-auto bg-gray-50 px-8 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                    <th className="py-5 px-6 text-xs font-bold uppercase tracking-wider text-gray-700">
                      <div className="flex items-center gap-2">
                        <People
                          sx={{ fontSize: 16 }}
                          className="text-emerald-600"
                        />
                        Hồ sơ người dùng
                      </div>
                    </th>
                    <th className="py-5 px-6 text-xs font-bold uppercase tracking-wider text-gray-700">
                      <div className="flex items-center gap-2">
                        <CheckCircle
                          sx={{ fontSize: 16 }}
                          className="text-emerald-600"
                        />
                        Vai trò
                      </div>
                    </th>
                    <th className="py-5 px-6 text-xs font-bold uppercase tracking-wider text-gray-700">
                      <div className="flex items-center gap-2">
                        <CalendarMonth
                          sx={{ fontSize: 16 }}
                          className="text-emerald-600"
                        />
                        Ngày tham gia
                      </div>
                    </th>
                    <th className="py-5 px-6 text-xs font-bold uppercase tracking-wider text-gray-700">
                      <div className="flex items-center gap-2">
                        <CheckCircle
                          sx={{ fontSize: 16 }}
                          className="text-emerald-600"
                        />
                        Trạng thái
                      </div>
                    </th>
                    <th className="py-5 px-6 text-xs font-bold uppercase tracking-wider text-gray-700 text-right">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transformedUsers.map((user) => {
                    const statusBadge = getStatusBadge(user.status);
                    return (
                      <tr
                        key={user.id}
                        className="group hover:bg-gradient-to-r hover:from-emerald-50 hover:to-transparent transition-all duration-200 cursor-pointer border-l-4 border-transparent hover:border-l-emerald-500"
                      >
                        <td className="py-5 px-6">
                          <div className="flex items-center gap-4">
                            {user.avatar ? (
                              <div
                                className="bg-center bg-no-repeat bg-cover rounded-full w-12 h-12 shadow-md ring-2 ring-gray-200 group-hover:ring-emerald-400 transition-all"
                                style={{
                                  backgroundImage: `url("${user.avatar}")`,
                                }}
                              ></div>
                            ) : (
                              <div className="flex items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400 text-gray-700 font-bold rounded-full w-12 h-12 shadow-md ring-2 ring-gray-200 group-hover:ring-emerald-400 transition-all">
                                {user.initials}
                              </div>
                            )}
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
                                {user.name}
                              </span>
                              <span className="text-xs text-gray-600 group-hover:text-gray-700 transition-colors">
                                {user.email || user.phone}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-5 px-6">
                          <span
                            className={`inline-flex w-fit items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeClasses(user.roleColor)}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${user.roleColor === "purple" ? "bg-emerald-500" : user.roleColor === "blue" ? "bg-teal-500" : user.roleColor === "orange" ? "bg-green-500" : "bg-gray-500"}`}
                            ></span>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-5 px-6">
                          <div className="flex items-center gap-2">
                            <svg
                              className="w-4 h-4 text-gray-500"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" />
                            </svg>
                            <span className="text-sm text-gray-700 font-medium">
                              {user.joinDate}
                            </span>
                          </div>
                        </td>
                        <td className="py-5 px-6">
                          <span
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${statusBadge.classes} shadow-lg`}
                          >
                            {statusBadge.icon && (
                              <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                              </svg>
                            )}
                            {statusBadge.label}
                          </span>
                        </td>
                        <td className="py-5 px-6 text-right">
                          <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200">
                            <button
                              className="p-2.5 text-gray-500 hover:text-purple-600 hover:bg-purple-100 rounded-xl transition-all hover:scale-110 hover:shadow-lg"
                              title="Phân quyền"
                            >
                              <VpnKey sx={{ fontSize: 20 }} />
                            </button>
                            <button
                              className="p-2.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-100 rounded-xl transition-all hover:scale-110 hover:shadow-lg"
                              title="Chỉnh sửa"
                            >
                              <Edit sx={{ fontSize: 20 }} />
                            </button>
                            {user.status === "locked" ? (
                              <button
                                className="p-2.5 text-gray-500 hover:text-green-600 hover:bg-green-100 rounded-xl transition-all hover:scale-110 hover:shadow-lg"
                                title="Mở khóa tài khoản"
                              >
                                <LockOpen sx={{ fontSize: 20 }} />
                              </button>
                            ) : (
                              <button
                                className="p-2.5 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-xl transition-all hover:scale-110 hover:shadow-lg"
                                title="Khóa tài khoản"
                              >
                                <Lock sx={{ fontSize: 20 }} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Pagination Footer */}
              <div className="px-8 py-5 border-t-2 border-gray-200 bg-gradient-to-r from-gray-50 to-white flex flex-col md:flex-row gap-4 md:gap-0 items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-sm text-gray-700">
                    Hiển thị{" "}
                    <span className="font-bold text-gray-900 px-2 py-1 bg-emerald-100 rounded-md">
                      1-{transformedUsers.length}
                    </span>{" "}
                    trong tổng số{" "}
                    <span className="font-bold text-gray-900 px-2 py-1 bg-emerald-100 rounded-md">
                      {totalUsers}
                    </span>{" "}
                    người dùng
                  </div>
                  <select className="ml-2 bg-white border border-gray-300 text-gray-900 text-xs rounded-lg px-2 py-1 cursor-pointer hover:border-emerald-400 focus:outline-none focus:border-emerald-500 transition-all">
                    <option value="10">10 / trang</option>
                    <option value="25">25 / trang</option>
                    <option value="50">50 / trang</option>
                    <option value="100">100 / trang</option>
                  </select>
                </div>
                <div className="flex gap-1.5">
                  <button className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-gray-300 hover:border-emerald-400">
                    <div className="flex items-center gap-1.5">
                      <ChevronRight
                        sx={{ fontSize: 16 }}
                        className="rotate-180"
                      />
                      Trước
                    </div>
                  </button>
                  <button className="px-4 py-2 rounded-xl text-sm bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold shadow-lg shadow-emerald-300/50 scale-105">
                    1
                  </button>
                  <button className="px-4 py-2 rounded-xl text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all border border-gray-300 hover:border-emerald-400 font-medium">
                    2
                  </button>
                  <button className="px-4 py-2 rounded-xl text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all border border-gray-300 hover:border-emerald-400 font-medium">
                    3
                  </button>
                  <span className="px-3 py-2 text-gray-500 font-bold">...</span>
                  <button className="px-4 py-2 rounded-xl text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all border border-gray-300 hover:border-emerald-400 font-medium">
                    12
                  </button>
                  <button className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all border border-gray-300 hover:border-emerald-400">
                    <div className="flex items-center gap-1.5">
                      Sau
                      <ChevronRight sx={{ fontSize: 16 }} />
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Quick Action Button (Floating) */}
      <button className="fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-teal-600 hover:to-emerald-500 text-white rounded-2xl shadow-2xl shadow-emerald-300/50 hover:shadow-emerald-400/60 transition-all duration-300 hover:scale-110 group">
        <Add
          sx={{ fontSize: 24 }}
          className="group-hover:rotate-90 transition-transform duration-300"
        />
      </button>
    </div>
  );
}
