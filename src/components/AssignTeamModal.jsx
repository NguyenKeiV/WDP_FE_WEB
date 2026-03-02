import { useState, useEffect } from "react";
import { teamsApi } from "../api/teams";

const SPECIALIZATION_LABEL = {
  general: "🔧 Tổng hợp",
  medical: "🏥 Y tế",
  vehicle: "🚗 Cứu hộ xe",
  supplies: "📦 Nhu yếu phẩm",
};

export default function AssignTeamModal({ request, onConfirm, onClose }) {
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await teamsApi.getAvailable({
          province_city: request.province_city,
        });
        setTeams(res.data || []);
      } catch (e) {
        setError("Không thể tải danh sách đội");
      } finally {
        setLoading(false);
      }
    };
    fetchTeams();
  }, []);

  const handleConfirm = async () => {
    if (!selectedTeam) return;
    setSubmitting(true);
    try {
      await onConfirm(request.id, selectedTeam.id);
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg">
        <h2 className="text-lg font-bold text-gray-800 mb-1">
          Phân công đội cứu hộ
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Yêu cầu từ{" "}
          <span className="font-semibold">{request.phone_number}</span> —{" "}
          {request.province_city}
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8 text-gray-400">
            Đang tải danh sách đội...
          </div>
        ) : teams.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">😔</div>
            <p className="text-gray-500 text-sm">
              Không có đội nào khả dụng tại {request.province_city}
            </p>
            <p className="text-gray-400 text-xs mt-1">
              Thử tìm đội ở tỉnh/thành khác
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto mb-4">
            {teams.map((team) => (
              <div
                key={team.id}
                onClick={() => setSelectedTeam(team)}
                className={`border-2 rounded-xl p-3 cursor-pointer transition ${
                  selectedTeam?.id === team.id
                    ? "border-red-500 bg-red-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-800">{team.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      👨‍✈️ {team.leader_name} · 📞 {team.phone_number}
                    </p>
                    <p className="text-xs text-gray-500">
                      {SPECIALIZATION_LABEL[team.specialization]} · 📍{" "}
                      {team.province_city}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-1 rounded-full">
                      ✅ Sẵn sàng
                    </span>
                    <p className="text-xs text-gray-400 mt-1">
                      {team.current_members}/{team.capacity} người
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-300 text-gray-600 font-semibold py-2 rounded-lg hover:bg-gray-50 transition"
          >
            Hủy
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedTeam || submitting}
            className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-2 rounded-lg transition"
          >
            {submitting ? "Đang phân công..." : "Xác nhận phân công"}
          </button>
        </div>
      </div>
    </div>
  );
}
