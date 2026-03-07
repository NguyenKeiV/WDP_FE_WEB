import React from "react";

const EmergencyFAB = () => {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button className="w-16 h-16 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 group">
        <span className="material-symbols-outlined text-4xl group-hover:scale-110 transition-transform">
          emergency_share
        </span>
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-red-600 text-[10px] font-black rounded-full flex items-center justify-center border-2 border-red-600">
          !
        </span>
      </button>
    </div>
  );
};

export default EmergencyFAB;
