import { useCallback, useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import {
  Bell,
  BellOff,
  Cake,
  CalendarDays,
  Clock,
  CreditCard,
  CheckCheck,
  Trash2,
  AlertCircle,
} from "lucide-react";
import BaseApiManager from "../../api/BaseApiManager";
import { NOTIFICATION } from "../../api/endpoints";
import { getErrorMessage } from "../../utils/helper";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TYPE_CONFIG = {
  Birthday: {
    label: "Birthday",
    icon: Cake,
    dotClass: "bg-pink-500",
    badgeClass: "bg-pink-50 text-pink-700 border-pink-200",
  },
  Leave: {
    label: "Leave",
    icon: CalendarDays,
    dotClass: "bg-orange-500",
    badgeClass: "bg-orange-50 text-orange-700 border-orange-200",
  },
  Salary: {
    label: "Salary",
    icon: CreditCard,
    dotClass: "bg-green-500",
    badgeClass: "bg-green-50 text-green-700 border-green-200",
  },
  Holiday: {
    label: "Holiday",
    icon: CalendarDays,
    dotClass: "bg-purple-500",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
  },
  Attendance: {
    label: "Attendance",
    icon: Clock,
    dotClass: "bg-blue-500",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
  },
  General: {
    label: "General",
    icon: Bell,
    dotClass: "bg-gray-400",
    badgeClass: "bg-gray-50 text-gray-600 border-gray-200",
  },
};

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

const notificationApi = {
  getAll: () => BaseApiManager.get(NOTIFICATION.LIST),
  markRead: (id) => BaseApiManager.put(NOTIFICATION.MARK_READ(id)),
  markAllRead: () => BaseApiManager.put(NOTIFICATION.MARK_ALL_READ),
  delete: (id) => BaseApiManager.delete(NOTIFICATION.DELETE(id)),
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const TypeBadge = ({ type }) => {
  const cfg = TYPE_CONFIG[type] ?? TYPE_CONFIG.General;
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${cfg.badgeClass}`}
    >
      <Icon size={11} />
      {cfg.label}
    </span>
  );
};

const NotificationCard = ({ notification, onMarkRead, onDelete }) => {
  const cfg = TYPE_CONFIG[notification.type] ?? TYPE_CONFIG.General;

  return (
    <article
      className={`relative flex gap-4 rounded-xl border p-4 transition ${
        notification.isRead
          ? "border-gray-100 bg-white"
          : "border-blue-100 bg-blue-50"
      }`}
    >
      {!notification.isRead && (
        <span className="absolute right-4 top-4 h-2 w-2 rounded-full bg-blue-600" />
      )}

      <div
        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${cfg.dotClass} text-white`}
      >
        <cfg.icon size={16} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-gray-900">{notification.title}</p>
            <p className="mt-0.5 text-sm text-gray-600 leading-relaxed">
              {notification.message}
            </p>
          </div>
          <TypeBadge type={notification.type} />
        </div>

        <div className="mt-3 flex items-center gap-3">
          <p className="text-xs text-gray-400">
            {dayjs(notification.createdAt).format("DD MMM YYYY, hh:mm A")}
          </p>

          {!notification.isRead && (
            <button
              onClick={() => onMarkRead(notification._id)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              Mark as read
            </button>
          )}

          <button
            onClick={() => onDelete(notification._id)}
            className="ml-auto flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
            aria-label="Delete notification"
          >
            <Trash2 size={13} />
            Delete
          </button>
        </div>
      </div>
    </article>
  );
};

const EmptyState = ({ unreadOnly }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <BellOff size={48} className="mb-3 text-gray-300" />
    <p className="font-semibold text-gray-700">
      {unreadOnly ? "No unread notifications" : "No notifications yet"}
    </p>
    <p className="mt-1 text-sm text-gray-500">
      {unreadOnly
        ? "You're all caught up! Switch to 'All' to see past notifications."
        : "You'll see birthday alerts, leave updates, salary info, and more here."}
    </p>
  </div>
);

// ---------------------------------------------------------------------------
// Notifications Page
// ---------------------------------------------------------------------------

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [actionError, setActionError] = useState("");

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await notificationApi.getAll();
      setNotifications(res?.notifications ?? []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  const visibleNotifications = useMemo(
    () =>
      filter === "unread" ? notifications.filter((n) => !n.isRead) : notifications,
    [notifications, filter]
  );

  const handleMarkRead = useCallback(async (id) => {
    setActionError("");
    try {
      await notificationApi.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  }, []);

  const handleMarkAllRead = useCallback(async () => {
    setActionError("");
    try {
      await notificationApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  }, []);

  const handleDelete = useCallback(async (id) => {
    setActionError("");
    try {
      await notificationApi.delete(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="font-semibold text-red-700">Failed to load notifications</p>
        </div>
        <p className="mt-1 text-sm text-red-600">{error}</p>
        <button
          onClick={loadNotifications}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-950">Notifications</h1>
          <p className="mt-1 text-sm text-gray-600">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}.`
              : "You're all caught up!"}
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            id="mark-all-read-btn"
            onClick={handleMarkAllRead}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            <CheckCheck size={16} />
            Mark all as read
          </button>
        )}
      </div>

      <div className="flex gap-2">
        {[
          { key: "all", label: `All (${notifications.length})` },
          { key: "unread", label: `Unread (${unreadCount})` },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              filter === key
                ? "bg-blue-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {actionError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

      <div className="space-y-3">
        {visibleNotifications.length === 0 ? (
          <EmptyState unreadOnly={filter === "unread"} />
        ) : (
          visibleNotifications.map((notification) => (
            <NotificationCard
              key={notification._id}
              notification={notification}
              onMarkRead={handleMarkRead}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
