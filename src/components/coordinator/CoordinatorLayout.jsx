import React from "react";
import CoordinatorSidebar from "./CoordinatorSidebar";

export default function CoordinatorLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <CoordinatorSidebar />
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}
