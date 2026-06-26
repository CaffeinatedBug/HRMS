import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck, Trash2, BellOff } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import BaseApiManager from "../../api/BaseApiManager";
import { NOTIFICATION } from "../../api/endpoints";
import useSocket from "../../hooks/useSocket";

dayjs.extend(relativeTime);

// ---------------------------------------------------------------------------
// Type colours
// ---------------------------------------------------------------------------

const TYPE_DOT = {
  Birthday:   "bg-pink-500",
  Leave:      "bg-orange-500",
  Salary:     "bg-green-500",
  Holiday:    "bg-purple-500",
  Attendance: "bg-blue-500",
  General:    "bg-gray-400",
};

// ---------------------------------------------------------------------------
// NotificationBell
// ---------------------------------------------------------------------------

const NotificationBell = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);

  // ── Fetch notifications ──────────────────────────────────────────────────

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await BaseApiManager.get(NOTIFICATION.LIST);
      const list = res?.notifications ?? [];
      setNotifications(list.slice(0, 8)); // show latest 8 in panel
      setUnreadCount(list.filter((n) => !n.isRead).length);
    } catch {
      // Fail silently — bell is non-critical UI
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // ── Socket / polling ─────────────────────────────────────────────────────

  const handleIncoming = useCallback(
    (payload) => {
      if (payload._polled) {
        // Polling update — just refresh unread count
        setUnreadCount(payload.unreadCount);
        return;
      }
      // Real-time socket event — prepend to list
      setNotifications((prev) => [
        {
          _id: payload._id ?? Date.now(),
          title: payload.title,
          message: payload.message,
          type: payload.type ?? "General",
          isRead: false,
          createdAt: payload.createdAt ?? new Date().toISOString(),
        },
        ...prev.slice(0, 7),
      ]);
      setUnreadCount((c) => c + 1);
    },
    []
  );

  useSocket({ onNotification: handleIncoming });

  // ── Close on outside click ────────────────────────────────────────────────

  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Mark single as read ───────────────────────────────────────────────────

  const markRead = useCallback(async (id) => {
    try {
      await BaseApiManager.put(NOTIFICATION.MARK_READ(id));
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // ignore
    }
  }, []);

  // ── Mark all read ────────────────────────────────────────────────────────

  const markAllRead = useCallback(async () => {
    try {
      await BaseApiManager.put(NOTIFICATION.MARK_ALL_READ);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  }, []);

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        id="notification-bell-btn"
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-11 z-50 w-80 rounded-2xl border border-gray-200 bg-white shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <p className="text-sm font-bold text-gray-950">Notifications</p>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                <CheckCheck size={13} />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex h-24 items-center justify-center">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <BellOff size={32} className="mb-2 text-gray-300" />
                <p className="text-sm text-gray-500">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {notifications.map((n) => (
                  <div
                    key={n._id}
                    className={`flex gap-3 px-4 py-3 transition hover:bg-gray-50 ${
                      !n.isRead ? "bg-blue-50/40" : ""
                    }`}
                  >
                    {/* Type dot */}
                    <div
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                        TYPE_DOT[n.type] ?? TYPE_DOT.General
                      }`}
                    />

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 leading-snug">
                        {n.title}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500 leading-snug line-clamp-2">
                        {n.message}
                      </p>
                      <p className="mt-1 text-[10px] text-gray-400">
                        {dayjs(n.createdAt).fromNow()}
                      </p>
                    </div>

                    {!n.isRead && (
                      <button
                        onClick={() => markRead(n._id)}
                        className="shrink-0 self-center text-[10px] font-semibold text-blue-600 hover:text-blue-700"
                      >
                        Read
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 px-4 py-3">
            <button
              onClick={() => {
                setOpen(false);
                navigate(
                  window.location.pathname.startsWith("/dashboard") ||
                    window.location.pathname.startsWith("/employees") ||
                    window.location.pathname.startsWith("/leave-management") ||
                    window.location.pathname.startsWith("/salary") ||
                    window.location.pathname.startsWith("/holidays") ||
                    window.location.pathname.startsWith("/reports")
                    ? "/notifications"
                    : "/employee/notifications"
                );
              }}
              className="w-full text-center text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
