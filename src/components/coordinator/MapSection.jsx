import React from "react";

const MapSection = ({ mapRef }) => {
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
            <p className="text-xs text-slate-500">
              Dữ liệu cập nhật: 15 giây trước
            </p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 bg-red-600 rounded-full shadow-sm"></span>
                <span className="text-xs font-medium text-slate-700">
                  Vùng SOS khẩn cấp
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 bg-blue-600 rounded-full shadow-sm"></span>
                <span className="text-xs font-medium text-slate-700">
                  Đội cứu hộ hoạt động
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 bg-green-500 rounded-full shadow-sm"></span>
                <span className="text-xs font-medium text-slate-700">
                  Điểm tập kết an toàn
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Status Bar */}
        <div className="flex justify-center w-full">
          <div className="bg-white/95 backdrop-blur-md px-6 py-3 rounded-full border border-slate-200 shadow-lg flex items-center gap-6 pointer-events-auto">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase">
                Mực nước
              </span>
              <span className="text-sm font-bold text-red-600">+1.2m</span>
            </div>
            <div className="w-px h-4 bg-slate-300"></div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase">
                Gió
              </span>
              <span className="text-sm font-bold text-slate-900">45 km/h</span>
            </div>
            <div className="w-px h-4 bg-slate-300"></div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase">
                Trạng thái liên lạc
              </span>
              <span className="text-sm font-bold text-green-600">
                Tốt (85%)
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MapSection;
