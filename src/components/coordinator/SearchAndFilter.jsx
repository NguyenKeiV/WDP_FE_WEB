import React from "react";

const FILTER_BUTTONS = [
  {
    key: "all",
    label: "Tất cả",
    activeClass: "bg-blue-600 text-white",
    hoverClass: "bg-slate-100 text-slate-600 hover:bg-slate-200",
  },
  {
    key: "rescue",
    label: "🚨 Cứu hộ",
    activeClass: "bg-red-600 text-white",
    hoverClass:
      "bg-slate-100 text-slate-600 hover:bg-red-100 hover:text-red-600",
  },
  {
    key: "relief",
    label: "🤝 Cứu trợ",
    activeClass: "bg-green-600 text-white",
    hoverClass:
      "bg-slate-100 text-slate-600 hover:bg-green-100 hover:text-green-600",
  },
];

const SearchAndFilter = ({
  searchQuery,
  setSearchQuery,
  activeFilter,
  setActiveFilter,
}) => {
  return (
    <div className="p-4 flex flex-col gap-3 border-b border-slate-200">
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
          search
        </span>
        <input
          type="text"
          className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          placeholder="Tìm tên, khu vực, loại cứu hộ..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {FILTER_BUTTONS.map((btn) => (
          <button
            key={btn.key}
            onClick={() => setActiveFilter(btn.key)}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              activeFilter === btn.key ? btn.activeClass : btn.hoverClass
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SearchAndFilter;
