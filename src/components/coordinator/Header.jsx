import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import avatarImg from "../../assets/images/avatar-user.svg";
import { useSocket } from "../../context/SocketContext"; // THÊM

const Header = () => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false); // THÊM
  const navigate = useNavigate();
  const { notifications, unreadCount, markAllRead, markRead } = useSocket(); // THÊM

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    navigate("/login");
  };

  // THÊM
  const handleNotifClick = (notif) => {
    markRead(notif.id);
    setShowNotifications(false);
    if (notif.rescue_request_id) {
      navigate(`/rescue-requests/${notif.rescue_request_id}`);
    }
  };

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3 shadow-sm">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg text-white">
            <span className="material-symbols-outlined text-2xl">
              emergency
            </span>
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight tracking-tight text-slate-900">
              Cứu Hộ Việt Nam
            </h1>
            <p className="text-xs font-medium text-blue-600 uppercase tracking-wider">
              Hệ thống điều phối Real-time
            </p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <a
            className="text-blue-600 text-sm font-semibold border-b-2 border-blue-600 pb-1"
            href="#"
          >
            Tổng quan
          </a>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden lg:flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          <span className="text-xs font-medium text-slate-700">
            Hệ thống: Sẵn sàng
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* SỬA: button notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications((v) => !v);
                if (!showNotifications) markAllRead();
              }}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors relative"
            >
              <span className="material-symbols-outlined">notifications</span>
              {/* Badge */}
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full px-1">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown thông báo */}
            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowNotifications(false)}
                />
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-20 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                    <span className="font-semibold text-sm text-slate-900">
                      Thông báo
                    </span>
                    {notifications.some((n) => !n.read) && (
                      <button
                        onClick={markAllRead}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Đánh dấu tất cả đã đọc
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-slate-400 text-sm">
                        Không có thông báo nào
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <button
                          key={notif.id}
                          onClick={() => handleNotifClick(notif)}
                          className={`w-full text-left px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors flex gap-3 items-start ${
                            !notif.read ? "bg-orange-50" : ""
                          }`}
                        >
                          <span className="text-lg mt-0.5">❌</span>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm ${!notif.read ? "font-semibold" : "font-normal"} text-slate-800 leading-snug`}
                            >
                              {notif.message}
                            </p>
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                              Lý do: {notif.reason}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                              {new Date(notif.timestamp).toLocaleString(
                                "vi-VN",
                              )}
                            </p>
                          </div>
                          {!notif.read && (
                            <span className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0 mt-1.5" />
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
            <span className="material-symbols-outlined">settings</span>
          </button>
        </div>

        {/* User Menu — giữ nguyên */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-9 h-9 bg-blue-100 rounded-full border border-blue-300 flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-blue-400 transition-all"
          >
            <img
              alt="Avatar"
              className="w-full h-full object-cover"
              src={avatarImg}
            />
          </button>

          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-20">
                <div className="px-4 py-3 border-b border-slate-200">
                  <p className="text-sm font-semibold text-slate-900">
                    Điều phối viên
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    coordinator@example.com
                  </p>
                </div>
                <div className="py-2">
                  <a
                    href="#"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <span className="material-symbols-outlined text-base">
                      person
                    </span>
                    Hồ sơ cá nhân
                  </a>
                  <a
                    href="#"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <span className="material-symbols-outlined text-base">
                      settings
                    </span>
                    Cài đặt
                  </a>
                  <a
                    href="#"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <span className="material-symbols-outlined text-base">
                      help
                    </span>
                    Trợ giúp
                  </a>
                </div>
                <div className="border-t border-slate-200 pt-2">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
                  >
                    <span className="material-symbols-outlined text-base">
                      logout
                    </span>
                    Đăng xuất
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
