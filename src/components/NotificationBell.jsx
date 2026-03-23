import { useState, useRef, useEffect } from "react";
import { useSocket } from "../context/SocketContext";
import { useNavigate } from "react-router-dom";

export default function NotificationBell() {
  const { notifications, unreadCount, markAllRead, markRead } = useSocket();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotifClick = (notif) => {
    markRead(notif.id);
    setOpen(false);
    if (notif.rescue_request_id) {
      navigate(`/rescue-requests/${notif.rescue_request_id}`);
    }
  };

  return (
    <div style={{ position: "relative" }} ref={dropdownRef}>
      {/* Bell icon + badge */}
      <button
        onClick={() => {
          setOpen((v) => !v);
          if (open) markAllRead();
        }}
        style={{
          position: "relative",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "8px",
          fontSize: "22px",
        }}
        title="Thông báo"
      >
        🔔
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: 2,
              right: 2,
              backgroundColor: "#E53935",
              color: "#fff",
              fontSize: "11px",
              fontWeight: 700,
              borderRadius: "50%",
              minWidth: 18,
              height: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 4px",
            }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "110%",
            width: 340,
            backgroundColor: "#fff",
            borderRadius: 12,
            boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
            zIndex: 1000,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "14px 16px",
              borderBottom: "1px solid #f0f0f0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 15 }}>Thông báo</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                style={{
                  fontSize: 12,
                  color: "#1976D2",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div
              style={{
                padding: 24,
                textAlign: "center",
                color: "#9e9e9e",
                fontSize: 13,
              }}
            >
              Không có thông báo nào
            </div>
          ) : (
            <div style={{ maxHeight: 360, overflowY: "auto" }}>
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotifClick(notif)}
                  style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid #f5f5f5",
                    cursor: "pointer",
                    backgroundColor: notif.read ? "#fff" : "#FFF3E0",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#f5f5f5")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = notif.read
                      ? "#fff"
                      : "#FFF3E0")
                  }
                >
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      alignItems: "flex-start",
                    }}
                  >
                    <span style={{ fontSize: 18 }}>❌</span>
                    <div style={{ flex: 1 }}>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 13,
                          fontWeight: notif.read ? 400 : 700,
                          color: "#212121",
                        }}
                      >
                        {notif.message}
                      </p>
                      <p
                        style={{
                          margin: "4px 0 0",
                          fontSize: 12,
                          color: "#757575",
                        }}
                      >
                        Lý do: {notif.reason}
                      </p>
                      <p
                        style={{
                          margin: "4px 0 0",
                          fontSize: 11,
                          color: "#9e9e9e",
                        }}
                      >
                        {new Date(notif.timestamp).toLocaleString("vi-VN")}
                      </p>
                    </div>
                    {!notif.read && (
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          backgroundColor: "#F57C00",
                          flexShrink: 0,
                          marginTop: 4,
                        }}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
