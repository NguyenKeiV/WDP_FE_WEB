import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    navigate("/login");
  };

  return (
    <aside className="w-72 bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 flex flex-col shrink-0 shadow-2xl h-screen sticky top-0">
      {/* Header Section */}
      <div className="p-6 pb-4 flex-1 overflow-y-auto">
        <div className="flex items-center gap-3 mb-8 p-3 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/20">
            <svg
              className="w-6 h-6 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M20 6h-2.18c.11-.31.18-.65.18-1a2.996 2.996 0 0 0-5.5-1.65l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z" />
            </svg>
          </div>
          <div>
            <h1 className="text-gray-800 text-lg font-bold leading-tight tracking-tight">
              ReliefOps VN
            </h1>
            <p className="text-gray-600 text-xs font-medium mt-0.5">
              Quản lý cứu trợ thông minh
            </p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex flex-col gap-1">
          <Link
            to="/manager/dashboard"
            className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 hover:translate-x-1 ${
              location.pathname === "/manager/dashboard"
                ? "bg-gradient-to-r from-blue-100 via-blue-50 to-transparent border border-blue-300 text-blue-700 shadow-lg shadow-blue-200/50"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-transparent hover:border-gray-200"
            }`}
          >
            <div
              className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-300 group-hover:scale-110 ${
                location.pathname === "/manager/dashboard"
                  ? "bg-blue-200 group-hover:bg-blue-300"
                  : "bg-gray-200 group-hover:bg-gray-300"
              }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
              </svg>
            </div>
            <span className="text-sm font-semibold">Tổng quan</span>
          </Link>

          <Link
            to="/manager/vehicles"
            className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 hover:translate-x-1 ${
              location.pathname === "/manager/vehicles"
                ? "bg-gradient-to-r from-blue-100 via-blue-50 to-transparent border border-blue-300 text-blue-700 shadow-lg shadow-blue-200/50"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-transparent hover:border-gray-200"
            }`}
          >
            <div
              className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-300 group-hover:scale-110 ${
                location.pathname === "/manager/vehicles"
                  ? "bg-blue-200 group-hover:bg-blue-300"
                  : "bg-gray-200 group-hover:bg-gray-300"
              }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
              </svg>
            </div>
            <span className="text-sm font-semibold">Quản lý phương tiện</span>
          </Link>

          <Link
            to="/manager/inventory"
            className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 hover:translate-x-1 ${
              location.pathname === "/manager/inventory"
                ? "bg-gradient-to-r from-blue-100 via-blue-50 to-transparent border border-blue-300 text-blue-700 shadow-lg shadow-blue-200/50"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-transparent hover:border-gray-200"
            }`}
          >
            <div
              className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-300 group-hover:scale-110 ${
                location.pathname === "/manager/inventory"
                  ? "bg-blue-200 group-hover:bg-blue-300"
                  : "bg-gray-200 group-hover:bg-gray-300"
              }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 2H4c-1 0-2 .9-2 2v3.01c0 .72.43 1.34 1 1.69V20c0 1.1 1.1 2 2 2h14c.9 0 2-.9 2-2V8.7c.57-.35 1-.97 1-1.69V4c0-1.1-1-2-2-2zm-5 12H9v-2h6v2zm5-7H4V4h16v3z" />
              </svg>
            </div>
            <span className="text-sm font-semibold">Quản lý kho hàng</span>
          </Link>

          <Link
            to="/manager/teams"
            className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 hover:translate-x-1 ${
              location.pathname === "/manager/teams"
                ? "bg-gradient-to-r from-blue-100 via-blue-50 to-transparent border border-blue-300 text-blue-700 shadow-lg shadow-blue-200/50"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-transparent hover:border-gray-200"
            }`}
          >
            <div
              className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-300 group-hover:scale-110 ${
                location.pathname === "/manager/teams"
                  ? "bg-blue-200 group-hover:bg-blue-300"
                  : "bg-gray-200 group-hover:bg-gray-300"
              }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
              </svg>
            </div>
            <span className="text-sm font-semibold">Đội nhóm</span>
          </Link>

          <Link
            to="/manager/reports"
            className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 hover:translate-x-1 ${
              location.pathname === "/manager/reports"
                ? "bg-gradient-to-r from-blue-100 via-blue-50 to-transparent border border-blue-300 text-blue-700 shadow-lg shadow-blue-200/50"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-transparent hover:border-gray-200"
            }`}
          >
            <div
              className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-300 group-hover:scale-110 ${
                location.pathname === "/manager/reports"
                  ? "bg-blue-200 group-hover:bg-blue-300"
                  : "bg-gray-200 group-hover:bg-gray-300"
              }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
              </svg>
            </div>
            <span className="text-sm font-semibold">Báo cáo thống kê</span>
          </Link>

          <div className="relative my-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
          </div>
        </nav>
      </div>

      {/* User Menu Section */}
      <div className="mt-auto p-4 border-t border-gray-200 bg-white/80 backdrop-blur-sm relative">
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="group flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 cursor-pointer transition-all duration-300 border border-transparent hover:border-gray-200 hover:shadow-lg w-full"
        >
          <div className="relative">
            <div
              className="bg-center bg-no-repeat bg-cover rounded-full w-11 h-11 border-2 border-blue-300 shadow-lg group-hover:border-blue-500 transition-all duration-300 group-hover:scale-105"
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuB3KdN6FBpwEbTMy4gd3fOtxJim3gyInXJABrlB1yjj_H3OTtYXrOAn3RgOs3lb_PxPcVAD9GF4a9i6wVOjGvrKtb2dicDeEJOK2SuL50rGjAeAhpB5MXMXMhtxYWnbvmTTVzWAVbCT9Pj82OYxDhy_jIaekKTjTD17L9bS4ZG-LLuITocX-MArXdkpiI1a7VOuvgkNoOM8xnTQNLl462S9dc96-yvCSPwZvzzQYjOTJWj6rIge_nQTO95XtIbZKayRs5mSJvciGaY")',
              }}
            ></div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full shadow-lg shadow-green-500/50 animate-pulse"></div>
          </div>
          <div className="flex-1 overflow-hidden text-left">
            <p className="text-gray-800 text-sm font-semibold truncate group-hover:text-blue-600 transition-colors">
              Quản lý Cứu Trợ
            </p>
            <p className="text-gray-600 text-xs truncate font-medium">
              manager@reliefops.vn
            </p>
          </div>
          <svg
            className={`w-5 h-5 text-gray-500 group-hover:text-blue-600 transition-all duration-300 ${
              showUserMenu ? "rotate-90" : ""
            }`}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {showUserMenu && (
          <>
            <div
              className="fixed inset-0 z-30"
              onClick={() => setShowUserMenu(false)}
            />
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-white rounded-2xl shadow-2xl border border-gray-200 py-2 z-40">
              <div className="px-4 py-3 border-b border-gray-200">
                <p className="text-sm font-bold text-gray-900">
                  Manager - Quản lý Cứu Trợ
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Khu vực Miền Trung
                </p>
              </div>

              <div className="py-2">
                <a
                  href="#"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                  Hồ sơ cá nhân
                </a>
                <a
                  href="#"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94L14.4 2.81c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
                  </svg>
                  Cài đặt
                </a>
                <a
                  href="#"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                  </svg>
                  Trợ giúp
                </a>
              </div>

              <div className="border-t border-gray-200 pt-2">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full font-semibold"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
                  </svg>
                  Đăng xuất
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
