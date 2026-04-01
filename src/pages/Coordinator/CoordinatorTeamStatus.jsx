import React, { useCallback, useEffect, useMemo, useState } from "react";
import Header from "../../components/coordinator/Header";
import { teamsApi } from "../../api/teams";
import { requestsApi } from "../../api/requests";

const TEAM_STATUS = {
  available: {
    label: "Sẵn sàng",
    color: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-600/30",
    dot: "bg-emerald-500",
    bg: "bg-emerald-50",
  },
  on_mission: {
    label: "Đang làm nhiệm vụ",
    color: "bg-blue-100 text-blue-700 ring-1 ring-blue-600/30",
    dot: "bg-blue-500",
    bg: "bg-blue-50",
  },
  unavailable: {
    label: "Không sẵn sàng",
    color: "bg-slate-100 text-slate-600 ring-1 ring-slate-400/30",
    dot: "bg-slate-400",
    bg: "bg-slate-50",
  },
};

const PRIORITY_COLOR = {
  urgent: "bg-red-100 text-red-700",
  high: "bg-orange-100 text-orange-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-blue-100 text-blue-700",
};

const formatDate = (d) => {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return String(d);
  }
};

function TeamStatusBadge({ status }) {
  const cfg = TEAM_STATUS[status] || {
    label: status || "?",
    color: "bg-slate-100 text-slate-600",
    dot: "bg-slate-400",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ring-inset ${cfg.color}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function MissionDetailModal({ request, onClose }) {
  if (!request) return null;
  const priorityCfg =
    PRIORITY_COLOR[request.priority] || "bg-slate-100 text-slate-600";
  const team = request.assigned_team;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2.5 rounded-xl">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-white text-lg font-bold">
                Chi tiết nhiệm vụ
              </h2>
              <p className="text-blue-100 text-sm">Mã: {request.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="bg-white/10 hover:bg-white/25 text-white p-2 rounded-xl transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {request.priority && (
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${priorityCfg}`}
              >
                {request.priority === "urgent"
                  ? "Khẩn cấp"
                  : request.priority === "high"
                    ? "Cao"
                    : request.priority === "medium"
                      ? "Trung bình"
                      : "Thấp"}
              </span>
              <span className="text-xs text-slate-400">Ưu tiên</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500 font-medium mb-1">
                Người yêu cầu
              </p>
              <p className="font-semibold text-slate-800">
                {request.requester_name || request.name || "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium mb-1">
                SĐT liên lạc
              </p>
              <p className="font-semibold text-slate-800">
                {request.requester_phone || request.phone_number || "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium mb-1">
                Quận / Huyện
              </p>
              <p className="font-semibold text-slate-800">
                {request.district || "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium mb-1">Loại</p>
              <p className="font-semibold text-slate-800">
                {request.category === "rescue" ? "Cứu hộ" : "Cứu trợ"}
              </p>
            </div>
          </div>

          {request.gps_location && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <p className="text-xs text-slate-500 font-medium mb-1">
                Vị trí GPS
              </p>
              <p className="text-sm font-semibold text-slate-700">
                {request.gps_location.latitude},{" "}
                {request.gps_location.longitude}
              </p>
            </div>
          )}

          {request.description && (
            <div>
              <p className="text-xs text-slate-500 font-medium mb-1">
                Mô tả tình trạng
              </p>
              <p className="text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-3">
                {request.description}
              </p>
            </div>
          )}

          {request.notes && (
            <div>
              <p className="text-xs text-slate-500 font-medium mb-1">Ghi chú</p>
              <p className="text-sm text-slate-700 bg-amber-50 border border-amber-200 rounded-xl p-3">
                {request.notes}
              </p>
            </div>
          )}

          {team && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-xs text-blue-500 font-bold uppercase mb-2">
                Đội cứu hộ
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
                  {(team.name || "?").charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-slate-800">{team.name}</p>
                  <p className="text-xs text-slate-500">
                    {team.district} · {team.phone_number}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="border-t border-slate-100 pt-3 space-y-1.5">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Tiếp nhận lúc:</span>
              <span className="font-medium text-slate-700">
                {formatDate(request.created_at)}
              </span>
            </div>
            <div className="flex justify-between text-xs text-slate-500">
              <span>Cập nhật lúc:</span>
              <span className="font-medium text-slate-700">
                {formatDate(request.updated_at)}
              </span>
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-slate-100 bg-slate-50/60 flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/25"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CoordinatorTeamStatus() {
  const [allTeams, setAllTeams] = useState([]);
  const [onMissionRequests, setOnMissionRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [error, setError] = useState("");

  const [filterStatus, setFilterStatus] = useState("");
  const [filterDistrict, setFilterDistrict] = useState("");
  const [filterSpec, setFilterSpec] = useState("");
  const [search, setSearch] = useState("");
  const [detailRequest, setDetailRequest] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadingRequests(true);
    setError("");

    try {
      const [teamsRes, requestsRes] = await Promise.all([
        teamsApi.getAll({ limit: 200 }),
        requestsApi.getAll({ status: "on_mission", limit: 200 }),
      ]);

      const teams = Array.isArray(teamsRes?.data)
        ? teamsRes.data
        : Array.isArray(teamsRes)
          ? teamsRes
          : [];

      const requests = Array.isArray(requestsRes?.data)
        ? requestsRes.data
        : Array.isArray(requestsRes)
          ? requestsRes
          : [];

      setAllTeams(teams);
      setOnMissionRequests(requests);
    } catch (e) {
      setError(e?.message || "Không thể tải dữ liệu");
    } finally {
      setLoading(false);
      setLoadingRequests(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(
    () => ({
      total: allTeams.length,
      available: allTeams.filter((t) => t.status === "available").length,
      on_mission: allTeams.filter((t) => t.status === "on_mission").length,
      unavailable: allTeams.filter((t) => t.status === "unavailable").length,
    }),
    [allTeams],
  );

  const filtered = useMemo(() => {
    let list = allTeams;
    if (filterStatus) list = list.filter((t) => t.status === filterStatus);
    if (filterSpec) list = list.filter((t) => t.specialization === filterSpec);
    if (filterDistrict) {
      const q = filterDistrict.trim().toLowerCase();
      list = list.filter((t) => (t.district || "").toLowerCase().includes(q));
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (t) =>
          (t.name || "").toLowerCase().includes(q) ||
          (t.phone_number || "").toLowerCase().includes(q) ||
          (t.district || "").toLowerCase().includes(q),
      );
    }
    return list;
  }, [allTeams, filterStatus, filterDistrict, filterSpec, search]);

  const getTeamMission = (teamId) => {
    return (
      onMissionRequests.find((r) => r.assigned_team?.id === teamId) || null
    );
  };

  const tableRows = useMemo(() => {
    return filtered.map((team) => ({ team, type: "team" }));
  }, [filtered]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Page Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Tình trạng đội cứu hộ
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              Theo dõi trạng thái và nhiệm vụ hiện tại của tất cả đội cứu hộ.
            </p>
          </div>
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors shadow-sm"
          >
            <svg
              className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {loading ? "Đang tải..." : "Làm mới"}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            {
              key: "",
              label: "Tất cả",
              value: stats.total,
              color: "from-slate-400 to-slate-500",
              bg: "bg-slate-50",
              text: "text-slate-700",
              active: !filterStatus,
            },
            {
              key: "available",
              label: "Sẵn sàng",
              value: stats.available,
              color: "from-emerald-400 to-teal-500",
              bg: "bg-emerald-50",
              text: "text-emerald-700",
              active: filterStatus === "available",
            },
            {
              key: "on_mission",
              label: "Đang nhiệm vụ",
              value: stats.on_mission,
              color: "from-blue-400 to-indigo-500",
              bg: "bg-blue-50",
              text: "text-blue-700",
              active: filterStatus === "on_mission",
            },
            {
              key: "unavailable",
              label: "Không sẵn sàng",
              value: stats.unavailable,
              color: "from-slate-400 to-gray-500",
              bg: "bg-slate-50",
              text: "text-slate-600",
              active: filterStatus === "unavailable",
            },
          ].map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() =>
                setFilterStatus(filterStatus === s.key ? "" : s.key)
              }
              className={`rounded-2xl p-4 border transition-all text-left ${
                s.active
                  ? `${s.bg} border-blue-300 ring-2 ring-blue-200`
                  : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-xs font-semibold uppercase tracking-wide ${s.text}`}
                >
                  {s.label}
                </span>
                <div
                  className={`w-7 h-7 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center shadow-sm`}
                >
                  <span className="text-white text-xs font-bold">
                    {s.value}
                  </span>
                </div>
              </div>
              <p className={`text-2xl font-bold ${s.text}`}>{s.value}</p>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-4">
          <div className="p-4 flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo tên đội, SĐT, quận..."
                className="w-full h-10 px-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <select
              value={filterSpec}
              onChange={(e) => setFilterSpec(e.target.value)}
              className="h-10 px-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
            >
              <option value="">Tất cả chuyên môn</option>
              <option value="rescue">Cứu hộ</option>
              <option value="relief">Cứu trợ</option>
            </select>

            <input
              type="text"
              value={filterDistrict}
              onChange={(e) => setFilterDistrict(e.target.value)}
              placeholder="Quận/Huyện"
              className="h-10 px-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />

            {(filterStatus || filterSpec || filterDistrict || search) && (
              <button
                type="button"
                onClick={() => {
                  setFilterStatus("");
                  setFilterSpec("");
                  setFilterDistrict("");
                  setSearch("");
                }}
                className="h-10 px-4 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-semibold text-sm transition-colors"
              >
                Đặt lại
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-slate-400 text-sm gap-2">
              <svg
                className="w-5 h-5 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Đang tải danh sách đội...
            </div>
          ) : error ? (
            <div className="px-6 py-4">
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm font-semibold text-red-600">
                {error}
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center text-slate-400 text-sm">
              Không có đội cứu hộ nào phù hợp.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-slate-600 w-8"></th>
                  <th className="px-4 py-3 text-left font-bold text-slate-600">
                    Đội cứu hộ
                  </th>
                  <th className="px-4 py-3 text-left font-bold text-slate-600">
                    Chuyên môn
                  </th>
                  <th className="px-4 py-3 text-left font-bold text-slate-600">
                    Quận/Huyện
                  </th>
                  <th className="px-4 py-3 text-left font-bold text-slate-600">
                    SĐT
                  </th>
                  <th className="px-4 py-3 text-left font-bold text-slate-600">
                    Sức chứa
                  </th>
                  <th className="px-4 py-3 text-left font-bold text-slate-600">
                    Trạng thái
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tableRows.map((row) => {
                  const team = row.team;
                  const mission =
                    team.status === "on_mission"
                      ? getTeamMission(team.id)
                      : null;
                  return (
                    <tr
                      key={team.id}
                      className={`hover:bg-slate-50/70 transition-colors ${team.status === "on_mission" ? "bg-blue-50/30" : ""}`}
                    >
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 ${
                              team.status === "available"
                                ? "bg-emerald-500"
                                : team.status === "on_mission"
                                  ? "bg-blue-500"
                                  : "bg-slate-400"
                            }`}
                          >
                            {(team.name || "?").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">
                              {team.name || "—"}
                            </p>
                            {team.leader_account && (
                              <p className="text-xs text-slate-400">
                                Tài khoản:{" "}
                                {team.leader_account.username ||
                                  team.leader_account.email}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            team.specialization === "rescue"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-cyan-100 text-cyan-700"
                          }`}
                        >
                          {team.specialization === "rescue"
                            ? "Cứu hộ"
                            : "Cứu trợ"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {team.district || "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {team.phone_number || "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {team.capacity
                          ? `${team.available_members || 0}/${team.capacity}`
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <TeamStatusBadge status={team.status} />
                          {mission && (
                            <button
                              type="button"
                              onClick={() => setDetailRequest(mission)}
                              className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap"
                            >
                              Chi tiết
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {filtered.length > 0 && (
          <p className="mt-3 text-xs text-slate-400 text-center">
            Hiển thị {filtered.length} / {allTeams.length} đội cứu hộ
          </p>
        )}
      </div>

      {detailRequest && (
        <MissionDetailModal
          request={detailRequest}
          onClose={() => setDetailRequest(null)}
        />
      )}
    </div>
  );
}
