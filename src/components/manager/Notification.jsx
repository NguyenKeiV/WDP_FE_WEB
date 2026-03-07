import React, { useState } from "react";
import {
  Close as CloseIcon,
  ErrorOutline as ErrorOutlineIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Delete as DeleteIcon,
  DoneAll as DoneAllIcon,
  FilterList as FilterListIcon,
  Notifications as NotificationsIcon,
  NotificationsActive as NotificationsActiveIcon,
} from "@mui/icons-material";

export default function Notification({
  isOpen,
  onClose,
  alerts: initialAlerts,
}) {
  const [alerts, setAlerts] = useState(initialAlerts || []);
  const [filter, setFilter] = useState("all");

  if (!isOpen) return null;

  const getAlertIcon = (type) => {
    switch (type) {
      case "critical":
        return <ErrorOutlineIcon sx={{ fontSize: 24 }} />;
      case "warning":
        return <WarningIcon sx={{ fontSize: 24 }} />;
      case "success":
        return <CheckCircleIcon sx={{ fontSize: 24 }} />;
      default:
        return <InfoIcon sx={{ fontSize: 24 }} />;
    }
  };

  const getAlertStyles = (type) => {
    const styles = {
      critical: {
        bg: "bg-red-50",
        border: "border-red-200",
        iconBg: "bg-red-100",
        iconColor: "text-red-600",
        titleColor: "text-red-900",
        messageColor: "text-red-700",
        buttonBg: "bg-red-600 hover:bg-red-700",
      },
      warning: {
        bg: "bg-amber-50",
        border: "border-amber-200",
        iconBg: "bg-amber-100",
        iconColor: "text-amber-600",
        titleColor: "text-amber-900",
        messageColor: "text-amber-700",
        buttonBg: "bg-amber-600 hover:bg-amber-700",
      },
      success: {
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        iconBg: "bg-emerald-100",
        iconColor: "text-emerald-600",
        titleColor: "text-emerald-900",
        messageColor: "text-emerald-700",
        buttonBg: "bg-emerald-600 hover:bg-emerald-700",
      },
      info: {
        bg: "bg-blue-50",
        border: "border-blue-200",
        iconBg: "bg-blue-100",
        iconColor: "text-blue-600",
        titleColor: "text-blue-900",
        messageColor: "text-blue-700",
        buttonBg: "bg-blue-600 hover:bg-blue-700",
      },
    };
    return styles[type] || styles.info;
  };

  const handleDismiss = (id) => {
    setAlerts(alerts.filter((alert) => alert.id !== id));
  };

  const handleDismissAll = () => {
    setAlerts([]);
  };

  const filteredAlerts =
    filter === "all" ? alerts : alerts.filter((a) => a.type === filter);

  const alertCounts = {
    all: alerts.length,
    critical: alerts.filter((a) => a.type === "critical").length,
    warning: alerts.filter((a) => a.type === "warning").length,
    info: alerts.filter((a) => a.type === "info").length,
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={onClose}
      ></div>

      {/* Notification Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                <NotificationsActiveIcon sx={{ fontSize: 28 }} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Thông Báo</h2>
                <p className="text-blue-100 text-sm">
                  {alerts.length} thông báo mới
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors"
            >
              <CloseIcon sx={{ fontSize: 24 }} />
            </button>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-2">
            {[
              { key: "all", label: "Tất cả", count: alertCounts.all },
              {
                key: "critical",
                label: "Khẩn cấp",
                count: alertCounts.critical,
              },
              { key: "warning", label: "Cảnh báo", count: alertCounts.warning },
              { key: "info", label: "Thông tin", count: alertCounts.info },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  filter === tab.key
                    ? "bg-white text-blue-600 shadow-lg"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      filter === tab.key
                        ? "bg-blue-100 text-blue-600"
                        : "bg-white/20 text-white"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Actions bar */}
        {alerts.length > 0 && (
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <FilterListIcon sx={{ fontSize: 18 }} />
              <span className="font-medium">
                Hiển thị {filteredAlerts.length} thông báo
              </span>
            </div>
            <button
              onClick={handleDismissAll}
              className="flex items-center gap-2 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-sm font-semibold transition-colors"
            >
              <DoneAllIcon sx={{ fontSize: 18 }} />
              <span>Xóa tất cả</span>
            </button>
          </div>
        )}

        {/* Notifications list */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredAlerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <NotificationsIcon
                  sx={{ fontSize: 48 }}
                  className="text-slate-400"
                />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Không có thông báo
              </h3>
              <p className="text-slate-500 max-w-sm">
                {filter === "all"
                  ? "Bạn đã xem hết tất cả thông báo. Chúng tôi sẽ thông báo khi có cập nhật mới."
                  : `Không có thông báo loại "${
                      filter === "critical"
                        ? "Khẩn cấp"
                        : filter === "warning"
                          ? "Cảnh báo"
                          : "Thông tin"
                    }".`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAlerts.map((alert) => {
                const styles = getAlertStyles(alert.type);
                return (
                  <div
                    key={alert.id}
                    className={`group relative ${styles.bg} ${styles.border} border-2 rounded-2xl p-5 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]`}
                  >
                    {/* Delete button */}
                    <button
                      onClick={() => handleDismiss(alert.id)}
                      className="absolute top-3 right-3 p-2 opacity-0 group-hover:opacity-100 hover:bg-white/50 rounded-lg transition-all"
                    >
                      <DeleteIcon
                        sx={{ fontSize: 18 }}
                        className="text-slate-500"
                      />
                    </button>

                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div
                        className={`p-3 ${styles.iconBg} ${styles.iconColor} rounded-xl flex-shrink-0`}
                      >
                        {getAlertIcon(alert.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 pr-8">
                        <div className="flex items-center gap-2 mb-2">
                          <h4
                            className={`font-bold text-base ${styles.titleColor}`}
                          >
                            {alert.title}
                          </h4>
                          <span className="text-xs text-slate-500 font-medium">
                            • {alert.time}
                          </span>
                        </div>
                        <p className={`text-sm ${styles.messageColor} mb-4`}>
                          {alert.message}
                        </p>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2">
                          {alert.type !== "info" &&
                            alert.type !== "success" && (
                              <button
                                className={`px-4 py-2 ${styles.buttonBg} text-white rounded-xl text-xs font-semibold transition-colors shadow-sm`}
                              >
                                {alert.type === "critical"
                                  ? "Xử lý ngay"
                                  : "Kiểm tra"}
                              </button>
                            )}
                          <button className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors">
                            Chi tiết
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Priority indicator */}
                    {alert.type === "critical" && (
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-500 rounded-l-2xl"></div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>Cập nhật lần cuối: Vừa xong</span>
            <button className="text-blue-600 hover:text-blue-700 font-semibold">
              Xem lịch sử →
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
