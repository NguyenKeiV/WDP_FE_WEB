import React from "react";

const readValue = (source, paths = [], fallback = 0) => {
  for (const path of paths) {
    let current = source;
    const keys = path.split(".");
    for (const key of keys) {
      if (current == null) break;
      current = current[key];
    }
    if (current !== undefined && current !== null) return current;
  }
  return fallback;
};

const formatUpdatedAt = (updatedAt) => {
  if (!updatedAt) return "Chưa có dữ liệu";
  const date = updatedAt instanceof Date ? updatedAt : new Date(updatedAt);
  if (Number.isNaN(date.getTime())) return "Chưa có dữ liệu";
  return `Cập nhật: ${date.toLocaleTimeString("vi-VN")}`;
};

const MapSection = ({ mapRef, tacticalData, loading, updatedAt }) => {
  const summaryCards = [
    {
      label: "Điểm SOS khẩn cấp",
      value: readValue(tacticalData, [
        "summary.emergency_zones",
        "summary.emergency",
        "emergency_zones",
        "emergency",
      ]),
      dot: "bg-red-600",
    },
    {
      label: "Đội đang làm nhiệm vụ",
      value: readValue(tacticalData, [
        "summary.active_teams",
        "summary.teams_on_mission",
        "active_teams",
        "teams_on_mission",
      ]),
      dot: "bg-blue-600",
    },
    {
      label: "Điểm an toàn",
      value: readValue(tacticalData, [
        "summary.safe_points",
        "summary.safe_zones",
        "safe_points",
        "safe_zones",
      ]),
      dot: "bg-emerald-500",
    },
  ];

  const weatherItems = [
    {
      label: "Mực nước",
      value: readValue(tacticalData, [
        "weather.water_level",
        "water_level",
        "conditions.water_level",
      ], "—"),
    },
    {
      label: "Gió",
      value: readValue(tacticalData, [
        "weather.wind_speed",
        "wind_speed",
        "conditions.wind_speed",
      ], "—"),
    },
    {
      label: "Liên lạc",
      value: readValue(tacticalData, [
        "communications.status",
        "communications.quality",
        "communication_status",
      ], "—"),
    },
  ];

  return (
    <section className="flex-1 relative bg-slate-100 overflow-hidden">
      {/* Map Container */}
      <div ref={mapRef} className="absolute inset-0 w-full h-full" />

      {/* Map Overlay */}
      <div className="absolute inset-0 z-10 p-8 flex flex-col justify-between pointer-events-none">
        {/* Top Row */}
        <div className="flex justify-between items-start">
          {/* Legend */}
          <div className="bg-white/95 backdrop-blur-md p-4 rounded-xl border border-slate-200 shadow-lg pointer-events-auto">
            <h2 className="text-slate-900 font-bold mb-1">
              TP. Hồ Chí Minh - VN
            </h2>
            <p className="text-xs text-slate-500">{formatUpdatedAt(updatedAt)}</p>
            <div className="mt-4 space-y-2">
              {loading ? (
                <div className="text-xs text-slate-500">Đang tải thống kê bản đồ...</div>
              ) : (
                summaryCards.map((item) => (
                  <div key={item.label} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`w-3 h-3 rounded-full shadow-sm ${item.dot}`}></span>
                      <span className="text-xs font-medium text-slate-700 truncate">{item.label}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                      {item.value}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Bottom Status Bar */}
        <div className="flex justify-center w-full">
          <div className="bg-white/95 backdrop-blur-md px-6 py-3 rounded-full border border-slate-200 shadow-lg flex items-center gap-6 pointer-events-auto">
            {weatherItems.map((item, idx) => (
              <React.Fragment key={item.label}>
                {idx > 0 && <div className="w-px h-4 bg-slate-300"></div>}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">
                    {item.label}
                  </span>
                  <span className="text-sm font-bold text-slate-900">{item.value || "—"}</span>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MapSection;
