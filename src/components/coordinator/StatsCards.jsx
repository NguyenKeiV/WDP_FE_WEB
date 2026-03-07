import React from "react";

const STAT_ITEMS = [
  {
    key: "emergency",
    label: "Nguy kịch",
    bgClass: "bg-red-50",
    borderClass: "border-red-100",
    labelClass: "text-red-600",
    valueClass: "text-red-700",
  },
  {
    key: "rescue",
    label: "Cứu hộ",
    bgClass: "bg-blue-50",
    borderClass: "border-blue-100",
    labelClass: "text-blue-600",
    valueClass: "text-blue-700",
  },
  {
    key: "inProgress",
    label: "Đang XL",
    bgClass: "bg-green-50",
    borderClass: "border-green-100",
    labelClass: "text-green-600",
    valueClass: "text-green-700",
  },
  {
    key: "completed",
    label: "Hoàn thành",
    bgClass: "bg-emerald-50",
    borderClass: "border-emerald-100",
    labelClass: "text-emerald-600",
    valueClass: "text-emerald-700",
  },
];

const StatsCards = ({ stats }) => {
  return (
    <div className="p-3 grid grid-cols-4 gap-2 border-b border-slate-200">
      {STAT_ITEMS.map((item) => (
        <div
          key={item.key}
          className={`${item.bgClass} p-2.5 rounded-xl border ${item.borderClass}`}
        >
          <p className={`text-[9px] font-bold ${item.labelClass} uppercase`}>
            {item.label}
          </p>
          <p className={`text-lg font-black ${item.valueClass}`}>
            {stats[item.key]}
          </p>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
