import React from "react";

const TAB_CONFIG = [
  {
    key: "pending",
    label: "Chờ xử lý",
    icon: "pending_actions",
    activeClass: "bg-white text-blue-600 shadow-sm",
    badgeClass: "bg-blue-600",
    getCount: (stats) => stats.rescue + stats.relief,
  },
  {
    key: "inprogress",
    label: "Đang xử lý",
    icon: "autorenew",
    activeClass: "bg-white text-green-600 shadow-sm",
    badgeClass: "bg-green-600",
    getCount: (stats) => stats.inProgress,
  },
  {
    key: "completed",
    label: "Hoàn thành",
    icon: "task_alt",
    activeClass: "bg-white text-emerald-600 shadow-sm",
    badgeClass: "bg-emerald-600",
    getCount: (stats) => stats.completed,
  },
  {
    key: "cancelled",
    label: "Từ chối",
    icon: "cancel",
    activeClass: "bg-white text-gray-600 shadow-sm",
    badgeClass: "bg-gray-500",
    getCount: (stats) => stats.cancelled,
  },
];

const TabBar = ({ activeTab, setActiveTab, setActiveFilter, stats }) => {
  return (
    <div className="p-3 border-b border-slate-200">
      <div className="grid grid-cols-4 gap-1 bg-slate-100 rounded-lg p-1">
        {TAB_CONFIG.map((tab) => {
          const count = tab.getCount(stats);
          return (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setActiveFilter("all");
              }}
              className={`px-2 py-2 rounded-md text-xs font-semibold transition-all ${
                activeTab === tab.key
                  ? tab.activeClass
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="material-symbols-outlined text-base">
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
                {count > 0 && (
                  <span
                    className={`px-1.5 py-0.5 ${tab.badgeClass} text-white text-[10px] font-bold rounded-full`}
                  >
                    {count}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TabBar;
