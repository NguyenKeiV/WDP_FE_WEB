import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function CoordinatorSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    navigate("/login");
  };

  const navItems = [
    {
      to: "/coordinator/dashboard",
      label: "Điều phối",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
        </svg>
      ),
    },
    {
      to: "/coordinator/teams-status",
      label: "Trạng thái đội",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
        </svg>
      ),
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 h-screen sticky top-0 shadow-xl">
      {/* Header */}
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-md">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-800 leading-tight">Cứu Hộ Việt Nam</h1>
            <p className="text-xs text-blue-600 font-medium">Điều phối viên</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {navItems.map((item) => {
          const active = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:translate-x-1 ${
                active
                  ? "bg-blue-50 border border-blue-200 text-blue-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent"
              }`}
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                active ? "bg-blue-100" : "bg-slate-100 group-hover:bg-slate-200"
              }`}>
                <span className={active ? "text-blue-600" : "text-slate-500"}>
                  {item.icon}
                </span>
              </div>
              <span className="text-sm font-semibold">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Menu */}
      <div className="p-4 border-t border-slate-100">
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="group flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-all duration-200 w-full border border-transparent hover:border-slate-200"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow">
            C
          </div>
          <div className="flex-1 text-left overflow-hidden">
            <p className="text-sm font-semibold text-slate-800 truncate">Điều phối viên</p>
            <p className="text-xs text-slate-500 truncate">coordinator@reliefops.vn</p>
          </div>
          <svg className={`w-4 h-4 text-slate-400 transition-transform ${showUserMenu ? "rotate-90" : ""}`} fill="currentColor" viewBox="0 0 24 24">
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
          </svg>
        </button>

        {showUserMenu && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setShowUserMenu(false)} />
            <div className="absolute left-4 right-4 mb-2 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-40">
              <div className="border-b border-slate-100 px-4 py-3">
                <p className="text-sm font-bold text-slate-900">Điều phối viên</p>
                <p className="text-xs text-slate-500">Hệ thống Cứu Hộ</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full font-semibold"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                </svg>
                Đăng xuất
              </button>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
