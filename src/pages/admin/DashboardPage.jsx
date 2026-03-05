import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { requestsApi } from "../../api/requests";
import { teamsApi } from "../../api/teams";
import { usersApi } from "../../api/users";
import { vehiclesApi } from "../../api/vehicles";
import { suppliesApi } from "../../api/supplies";

const STATUS_CONFIG = {
  new: { label: "Mới tạo", color: "bg-blue-100 text-blue-700" },
  pending_verification: {
    label: "Chờ phân công",
    color: "bg-yellow-100 text-yellow-700",
  },
  on_mission: { label: "Đang cứu hộ", color: "bg-red-100 text-red-700" },
  completed: { label: "Hoàn thành", color: "bg-green-100 text-green-700" },
  rejected: { label: "Từ chối", color: "bg-gray-100 text-gray-600" },
};

const CATEGORY_LABEL = {
  rescue: "🆘 Cần cứu hộ người",
  supplies: "📦 Cần nhu yếu phẩm",
  vehicle_rescue: "🚗 Cần cứu hộ xe",
  other: "❓ Khác",
};

export default function DashboardPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [stats, setStats] = useState(null);
  const [teams, setTeams] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [suppliesData, setSuppliesData] = useState([]);
  const [users, setUsers] = useState([]);
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const promises = [
          requestsApi.getStats(),
          teamsApi.getAll({ limit: 100 }),
          requestsApi.getAll({ limit: 5, page: 1 }),
          vehiclesApi.getAll({ limit: 100 }),
          suppliesApi.getAll({ limit: 100 }),
        ];

        if (isAdmin) {
          promises.push(usersApi.getAll({ limit: 100 }));
        }

        const results = await Promise.all(promises);

        setStats(results[0].data);
        setTeams(results[1].data || []);
        setRecentRequests(results[2].data || []);
        setVehicles(results[3].data || []);
        setSuppliesData(results[4].data || []);
        if (isAdmin) {
          setUsers(results[5].data || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [isAdmin]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-32 text-gray-400">
        Đang tải...
      </div>
    );
  }

  const availableTeams = teams.filter((t) => t.status === "available").length;
  const onMissionTeams = teams.filter((t) => t.status === "on_mission").length;
  const totalTeams = teams.length;
  const totalVehicles = vehicles.length;
  const availableVehicles = vehicles.filter((v) => v.status === "available").length;
  const totalSupplies = suppliesData.length;
  const totalUsers = users.length;

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-1">📊 Dashboard</h2>
      <p className="text-sm text-gray-500 mb-6">
        {isAdmin ? "Tổng quan hệ thống cứu hộ" : "Tổng quan hoạt động điều phối"}
      </p>

      {/* Top stats */}
      <div className={`grid ${isAdmin ? "grid-cols-5" : "grid-cols-4"} gap-4 mb-8`}>
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <p className="text-3xl font-bold text-gray-800">
            {stats?.total || 0}
          </p>
          <p className="text-sm text-gray-500 mt-1">Tổng yêu cầu</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <p className="text-3xl font-bold text-green-600">{availableTeams}</p>
          <p className="text-sm text-gray-500 mt-1">Đội đang rảnh</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <p className="text-3xl font-bold text-red-600">{onMissionTeams}</p>
          <p className="text-sm text-gray-500 mt-1">Đội đang nhiệm vụ</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <p className="text-3xl font-bold text-purple-600">{totalVehicles}</p>
          <p className="text-sm text-gray-500 mt-1">Phương tiện</p>
        </div>
        {isAdmin && (
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <p className="text-3xl font-bold text-blue-600">{totalUsers}</p>
            <p className="text-sm text-gray-500 mt-1">Tổng người dùng</p>
          </div>
        )}
      </div>

      {/* Resource summary */}
      <div className="bg-white rounded-xl p-5 shadow-sm mb-6">
        <h3 className="font-bold text-gray-700 mb-4">Tài nguyên</h3>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <p className="text-sm font-semibold text-gray-600 mb-2">
              Đội cứu hộ ({totalTeams})
            </p>
            <div className="flex gap-2 flex-wrap">
              <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700 font-semibold">
                Sẵn sàng: {availableTeams}
              </span>
              <span className="text-xs px-3 py-1 rounded-full bg-red-100 text-red-700 font-semibold">
                Đang nhiệm vụ: {onMissionTeams}
              </span>
              <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-700 font-semibold">
                Không khả dụng: {teams.filter((t) => t.status === "unavailable").length}
              </span>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-600 mb-2">
              Phương tiện ({totalVehicles})
            </p>
            <div className="flex gap-2 flex-wrap">
              <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700 font-semibold">
                Sẵn sàng: {availableVehicles}
              </span>
              <span className="text-xs px-3 py-1 rounded-full bg-red-100 text-red-700 font-semibold">
                Đang sử dụng: {vehicles.filter((v) => v.status === "in_use").length}
              </span>
              <span className="text-xs px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 font-semibold">
                Bảo trì: {vehicles.filter((v) => v.status === "maintenance").length}
              </span>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-600 mb-2">
              Nhu yếu phẩm ({totalSupplies} loại)
            </p>
            <div className="flex gap-2 flex-wrap">
              <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-semibold">
                Tổng: {suppliesData.reduce((sum, s) => sum + (s.quantity || 0), 0)} đơn vị
              </span>
              <span className="text-xs px-3 py-1 rounded-full bg-orange-100 text-orange-700 font-semibold">
                Sắp hết (≤10): {suppliesData.filter((s) => s.quantity <= 10).length}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* By status */}
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h3 className="font-bold text-gray-700 mb-4">
            Yêu cầu theo trạng thái
          </h3>
          <div className="space-y-3">
            {(stats?.by_status || []).map((s) => {
              const cfg = STATUS_CONFIG[s.status];
              if (!cfg) return null;
              const percent =
                stats.total > 0 ? Math.round((s.count / stats.total) * 100) : 0;
              return (
                <div key={s.status}>
                  <div className="flex justify-between text-sm mb-1">
                    <span
                      className={`font-semibold px-2 py-0.5 rounded-full text-xs ${cfg.color}`}
                    >
                      {cfg.label}
                    </span>
                    <span className="text-gray-600 font-semibold">
                      {s.count} ({percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full transition-all"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* By category */}
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h3 className="font-bold text-gray-700 mb-4">Yêu cầu theo loại</h3>
          <div className="space-y-3">
            {(stats?.by_category || []).map((c) => {
              const label = CATEGORY_LABEL[c.category] || c.category;
              const percent =
                stats.total > 0 ? Math.round((c.count / stats.total) * 100) : 0;
              return (
                <div key={c.category}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{label}</span>
                    <span className="text-gray-600 font-semibold">
                      {c.count} ({percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent requests */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200">
          <h3 className="font-bold text-gray-700">Yêu cầu gần đây</h3>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">
                Loại
              </th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">
                Mô tả
              </th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">
                Địa điểm
              </th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">
                Trạng thái
              </th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">
                Thời gian
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {recentRequests.map((req) => {
              const status = STATUS_CONFIG[req.status];
              return (
                <tr key={req.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-xs">
                    {CATEGORY_LABEL[req.category] || req.category}
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <p className="truncate text-gray-700">{req.description}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    📍 {req.province_city}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${status?.color}`}
                    >
                      {status?.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {new Date(req.created_at).toLocaleString("vi-VN")}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
