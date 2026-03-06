import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  {
    label: "Yêu cầu cứu hộ",
    icon: "🆘",
    page: "requests",
    roles: ["coordinator", "admin", "manager"],
  },
  {
    label: "Dashboard",
    icon: "📊",
    page: "dashboard",
    roles: ["admin"],
  },
  {
    label: "Quản lý User",
    icon: "👥",
    page: "users",
    roles: ["admin"],
  },
  {
    label: "Đội cứu hộ",
    icon: "🚒",
    page: "teams",
    roles: ["admin"],
  },
  {
    label: "Đội cứu hộ",
    icon: "🚒",
    page: "manager_teams",
    roles: ["manager"],
  },
  {
    label: "Phương tiện",
    icon: "🚗",
    page: "vehicles",
    roles: ["manager"],
  },
  {
    label: "Nhu yếu phẩm",
    icon: "📦",
    page: "supplies",
    roles: ["manager"],
  },
];

export default function Sidebar({ currentPage, onNavigate }) {
  const { user, logout } = useAuth();

  const visibleItems = NAV_ITEMS.filter((item) =>
    item.roles.includes(user?.role),
  );

  const roleLabel = {
    admin: "Quản trị viên",
    coordinator: "Điều phối viên",
    manager: "Quản lý",
  };

  return (
    <div className="w-60 min-h-screen bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🚨</span>
          <div>
            <h1 className="font-bold text-gray-800 text-sm">Hệ Thống Cứu Hộ</h1>
            <p className="text-xs text-gray-500">{roleLabel[user?.role]}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {visibleItems.map((item) => (
          <button
            key={item.page}
            onClick={() => onNavigate(item.page)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
              currentPage === item.page
                ? "bg-red-50 text-red-600"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* User info */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-sm">
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">
              {user?.username}
            </p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full text-sm text-red-600 hover:text-red-700 font-semibold text-left px-2 py-1"
        >
          Đăng xuất →
        </button>
      </div>
    </div>
  );
}
