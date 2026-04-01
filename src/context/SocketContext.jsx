import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

const STORAGE_KEY = "app_notifications";

const loadFromStorage = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
};

const saveToStorage = (notifications) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
};

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef(null);

  const [notifications, setNotifications] = useState(() => loadFromStorage());
  const [unreadCount, setUnreadCount] = useState(
    () => loadFromStorage().filter((n) => !n.read).length,
  );

  useEffect(() => {
    if (!user) return;

    const BASE_URL = (
      import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"
    ).replace(/\/api$/, "");

    socketRef.current = io(BASE_URL, {
      transports: ["websocket", "polling"],
      withCredentials: true,
    });

    socketRef.current.emit("join", { user_id: user.id });

    socketRef.current.on("mission_rejected_by_team", (data) => {
      const newNotif = {
        id: Date.now(),
        type: "mission_rejected_by_team",
        message: `Đội ${data.team_name} từ chối nhiệm vụ tại ${data.district}`,
        reason: data.reason,
        rescue_request_id: data.rescue_request_id,
        timestamp: data.timestamp,
        read: false,
      };

      setNotifications((prev) => {
        const updated = [newNotif, ...prev];
        saveToStorage(updated); // lưu vào localStorage
        return updated;
      });
      setUnreadCount((prev) => prev + 1);
    });

    socketRef.current.on("volunteer_registration_reviewed", (data) => {
      const actionLabel =
        data.new_status === "approved"
          ? "được duyệt"
          : data.new_status === "rejected"
          ? "bị từ chối"
          : data.new_status === "cancelled"
          ? "bị hủy"
          : `chuyển sang ${data.new_status}`;
      const newNotif = {
        id: Date.now(),
        type: "volunteer_registration_reviewed",
        message: `Đơn tình nguyện ${actionLabel}! ${data.reviewer_name || "Quản lý"} đã xử lý đơn của bạn.`,
        note: data.note,
        registration_id: data.registration_id,
        new_status: data.new_status,
        timestamp: data.reviewed_at,
        read: false,
      };

      setNotifications((prev) => {
        const updated = [newNotif, ...prev];
        saveToStorage(updated);
        return updated;
      });
      setUnreadCount((prev) => prev + 1);
    });

    socketRef.current.on("volunteer_campaign_invitation", (data) => {
      const newNotif = {
        id: Date.now(),
        type: "volunteer_campaign_invitation",
        message: `Bạn được mời tham gia đợt tình nguyện "${data.campaign_title}"!`,
        campaign_id: data.campaign_id,
        invitation_id: data.invitation_id,
        scheduled_at: data.scheduled_at,
        location: data.location,
        timestamp: new Date().toISOString(),
        read: false,
      };

      setNotifications((prev) => {
        const updated = [newNotif, ...prev];
        saveToStorage(updated);
        return updated;
      });
      setUnreadCount((prev) => prev + 1);
    });

    socketRef.current.on("vehicle_return_reported", (data) => {
      const VEHICLE_TYPE_LABELS = {
        car: "Ô tô", boat: "Xuồng/Thuyền", helicopter: "Trực thăng",
        truck: "Xe tải", motorcycle: "Xe máy", other: "Phương tiện",
      };
      const typeLabel = VEHICLE_TYPE_LABELS[data.vehicle_type] || "Phương tiện";
      const newNotif = {
        id: Date.now(),
        type: "vehicle_return_reported",
        message: `🚗 ${data.team_name} đã báo trả ${typeLabel} — chờ xác nhận thu hồi`,
        vehicle_request_id: data.vehicle_request_id,
        team_name: data.team_name,
        timestamp: data.timestamp,
        read: false,
      };

      setNotifications((prev) => {
        const updated = [newNotif, ...prev];
        saveToStorage(updated);
        return updated;
      });
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [user]);

  const markAllRead = () => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      saveToStorage(updated);
      return updated;
    });
    setUnreadCount(0);
  };

  const markRead = (id) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      saveToStorage(updated);
      return updated;
    });
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  return (
    <SocketContext.Provider
      value={{ notifications, unreadCount, markAllRead, markRead }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
