import React, { useState } from "react";
import { MdAdd, MdClose, MdRefresh } from "react-icons/md";

const DisasterManagement = () => {
  const [disasterZones, setDisasterZones] = useState([
    { id: 1, name: "Thái Nguyên", active: true },
    { id: 2, name: "Lào Cai", active: true },
    { id: 3, name: "Yên Bái", active: false, note: "Đã qua đỉnh lũ" },
  ]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">Vùng thiên tai</h2>
        <button className="px-4 py-2 bg-emerald-500 hover:bg-teal-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
          <MdAdd className="text-lg" />
          Thêm vùng mới
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex flex-wrap gap-3">
          {disasterZones.map((zone) => (
            <div
              key={zone.id}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${
                zone.active
                  ? "bg-red-500/10 border border-red-500/30 text-red-700"
                  : "bg-gray-100 border border-gray-200 text-gray-600"
              }`}
            >
              {zone.active && (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              )}
              <span className="font-medium">{zone.name}</span>
              {zone.note && <span className="text-xs">({zone.note})</span>}
              <button className="ml-2 hover:text-red-600">
                {zone.active ? (
                  <MdClose className="text-base" />
                ) : (
                  <MdRefresh className="text-base" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DisasterManagement;
