import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSocket } from "../../context/SocketContext";

const NOTIF_CONFIG = {
  mission_rejected_by_team: { icon: "❌", bgUnread: "#FFF3E0", dot: "#F57C00" },
  volunteer_registration_reviewed: { icon: "📋", bgUnread: "#E8F5E9", dot: "#388E3C" },
  volunteer_campaign_invitation: { icon: "🙋", bgUnread: "#E3F2FD", dot: "#1976D2" },
  vehicle_return_reported: { icon: "🚗", bgUnread: "#EDE7F6", dot: "#5E35B1" },
};
const getNotifConfig = (type) =>
  NOTIF_CONFIG[type] || { icon: "🔔", bgUnread: "#FFF8E1", dot: "#FFA000" };

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { notifications, unreadCount, markAllRead, markRead } = useSocket();

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    navigate("/login");
  };

  return (
    <>
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
            to="/manager/charity-history"
            className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 hover:translate-x-1 ${
              location.pathname === "/manager/charity-history"
                ? "bg-gradient-to-r from-purple-100 via-purple-50 to-transparent border border-purple-300 text-purple-700 shadow-lg shadow-purple-200/50"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-transparent hover:border-gray-200"
            }`}
          >
            <div
              className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-300 group-hover:scale-110 ${
                location.pathname === "/manager/charity-history"
                  ? "bg-purple-200 group-hover:bg-purple-300"
                  : "bg-gray-200 group-hover:bg-gray-300"
              }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="m12 21.35-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54z" />
              </svg>
            </div>
            <span className="text-sm font-semibold">Quyên góp</span>
          </Link>

          <Link
            to="/manager/volunteer-campaigns"
            className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 hover:translate-x-1 ${
              location.pathname === "/manager/volunteer-campaigns"
                ? "bg-gradient-to-r from-rose-100 via-rose-50 to-transparent border border-rose-300 text-rose-700 shadow-lg shadow-rose-200/50"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-transparent hover:border-gray-200"
            }`}
          >
            <div
              className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-300 group-hover:scale-110 ${
                location.pathname === "/manager/volunteer-campaigns"
                  ? "bg-rose-200 group-hover:bg-rose-300"
                  : "bg-gray-200 group-hover:bg-gray-300"
              }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
              </svg>
            </div>
            <span className="text-sm font-semibold">Đợt tình nguyện</span>
          </Link>

          <Link
            to="/manager/volunteer-registrations"
            className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 hover:translate-x-1 ${
              location.pathname === "/manager/volunteer-registrations"
                ? "bg-gradient-to-r from-rose-100 via-rose-50 to-transparent border border-rose-300 text-rose-700 shadow-lg shadow-rose-200/50"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-transparent hover:border-gray-200"
            }`}
          >
            <div
              className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-300 group-hover:scale-110 ${
                location.pathname === "/manager/volunteer-registrations"
                  ? "bg-rose-200 group-hover:bg-rose-300"
                  : "bg-gray-200 group-hover:bg-gray-300"
              }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
            <span className="text-sm font-semibold">Tình nguyện viên</span>
          </Link>

          <Link
            to="/manager/charity-campaigns"
            className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 hover:translate-x-1 ${
              location.pathname === "/manager/charity-campaigns"
                ? "bg-gradient-to-r from-emerald-100 via-emerald-50 to-transparent border border-emerald-300 text-emerald-700 shadow-lg shadow-emerald-200/50"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-transparent hover:border-gray-200"
            }`}
          >
            <div
              className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-300 group-hover:scale-110 ${
                location.pathname === "/manager/charity-campaigns"
                  ? "bg-emerald-200 group-hover:bg-emerald-300"
                  : "bg-gray-200 group-hover:bg-gray-300"
              }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 11v2h4v-2zm-2 6.61c.96.71 2.21 1.65 3.2 2.39.4-.53.8-1.07 1.2-1.6-.99-.74-2.24-1.68-3.2-2.4-.4.54-.8 1.08-1.2 1.61M20.4 5.6c-.4-.53-.8-1.07-1.2-1.6-.99.74-2.24 1.68-3.2 2.4.4.53.8 1.07 1.2 1.6.96-.72 2.21-1.65 3.2-2.4M4 9c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h1v4h2v-4h1l5 3V6L8 9zm11.5 3c0-1.33-.58-2.53-1.5-3.35v6.69c.92-.81 1.5-2.01 1.5-3.34" />
              </svg>
            </div>
            <span className="text-sm font-semibold">Tạo đợt quyên góp</span>
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

          {/* ── Thông báo nav item ── */}
          <div>
            <button
              onClick={() => setNotifOpen(true)}
              className="group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 hover:translate-x-1 w-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-transparent hover:border-gray-200"
            >
              <div className="relative flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-300 group-hover:scale-110 bg-gray-200 group-hover:bg-gray-300">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-sm border-2 border-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </div>
              <span className="text-sm font-semibold flex-1 text-left">Thông báo</span>
              {unreadCount > 0 && (
                <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} mới
                </span>
              )}
            </button>
          </div>

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

      {/* Slide-over Drawer for Notifications */}
      {notifOpen && (
        <div className="fixed inset-0 z-[9999] overflow-hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
            onClick={() => setNotifOpen(false)}
          />
          {/* Panel */}
          <div className="absolute inset-y-0 right-0 max-w-sm w-full flex">
            <div className="w-full relative bg-white shadow-2xl flex flex-col animate-[slideInRight_0.3s_ease-out]">
              {/* Header */}
              <div className="px-6 py-5 border-b border-indigo-100 bg-indigo-50/50 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl shadow-inner shadow-white">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-800 tracking-tight">Thông báo</h2>
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">Cập nhật lúc {new Date().toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-white hover:bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-xl transition shadow-sm"
                    >
                      Đọc tất cả
                    </button>
                  )}
                  <button 
                    onClick={() => setNotifOpen(false)}
                    className="p-1.5 text-slate-400 hover:bg-white hover:text-slate-700 bg-transparent hover:shadow-sm border border-transparent hover:border-slate-200 rounded-xl transition"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto bg-slate-50 p-4">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-slate-300" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
                      </svg>
                    </div>
                    <p className="text-sm font-bold text-slate-700">Chưa có thông báo nào</p>
                    <p className="text-xs text-slate-500 mt-1">Khi có hoạt động mới, thông báo sẽ hiện ở đây.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((notif) => {
                      const cfg = getNotifConfig(notif.type);
                      return (
                        <div
                          key={notif.id}
                          onClick={() => {
                            markRead(notif.id);
                            if (notif.type === "vehicle_return_reported") {
                              navigate("/manager/vehicles?tab=requests&filter=pending_return");
                              setNotifOpen(false);
                            }
                          }}
                          className={`relative group flex gap-3.5 p-4 rounded-2xl cursor-pointer transition-all duration-300 border ${
                            notif.read ? "bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md shadow-sm" : "border-transparent shadow-md hover:-translate-y-0.5"
                          }`}
                          style={{ backgroundColor: notif.read ? "white" : cfg.bgUnread }}
                        >
                          <div className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-white shadow-sm border ${notif.read ? "border-slate-100" : "border-white"}`} style={!notif.read ? {borderColor: "rgba(255,255,255,0.5)"} : {}}>
                            <span className="text-2xl drop-shadow-sm">{cfg.icon}</span>
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <p
                              className={`text-[13px] leading-snug break-words ${notif.read ? "text-slate-600 font-medium" : "text-slate-900 font-bold"}`}
                            >
                              {notif.message}
                            </p>
                            <p className={`text-[11px] mt-1.5 font-semibold ${notif.read ? "text-slate-400" : "text-slate-600 mix-blend-multiply opacity-70"}`}>
                              {new Date(notif.timestamp).toLocaleString("vi-VN", { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}
                            </p>
                          </div>
                          {!notif.read && (
                            <div className="absolute top-4 right-4 flex items-center h-2.5">
                              <span
                                className="w-2.5 h-2.5 rounded-full ring-4"
                                style={{ backgroundColor: cfg.dot, ringColor: cfg.bgUnread }}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
