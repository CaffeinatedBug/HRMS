import { useEffect, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import { toast } from "react-toastify";

/*
|--------------------------------------------------------------------------
| useSocket
|
| Manages a Socket.io connection for the authenticated user.
|
| Features:
|  - Connects with JWT auth on mount, disconnects on unmount
|  - Joins private user room (handled server-side on connection)
|  - Listens for "notification" events → shows toast + calls onNotification cb
|  - Polling fallback every 35s when socket is disconnected
|
| Usage:
|   useSocket({ onNotification: (payload) => updateUnreadCount(count + 1) })
|--------------------------------------------------------------------------
*/

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? import.meta.env.VITE_API_URL?.replace("/api", "") ?? "";
const POLL_INTERVAL_MS = 35_000;

const useSocket = ({ onNotification } = {}) => {
  const { token, isAuthenticated } = useSelector((state) => state.auth);
  const socketRef = useRef(null);
  const pollTimerRef = useRef(null);
  const onNotificationRef = useRef(onNotification);

  // Keep callback ref fresh without re-triggering the effect
  useEffect(() => {
    onNotificationRef.current = onNotification;
  }, [onNotification]);

  // ── Polling fallback ────────────────────────────────────────────────────

  const startPolling = useCallback(async () => {
    if (pollTimerRef.current) return; // already polling

    const poll = async () => {
      try {
        const { default: BaseApiManager } = await import("../api/BaseApiManager");
        const res = await BaseApiManager.get("/notifications/unread-count");
        const count = res?.unreadCount ?? 0;
        if (count > 0) {
          onNotificationRef.current?.({ _polled: true, unreadCount: count });
        }
      } catch {
        // Silently ignore — user may have logged out
      }
    };

    await poll(); // immediate first tick
    pollTimerRef.current = setInterval(poll, POLL_INTERVAL_MS);
  }, []);

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  // ── Socket lifecycle ────────────────────────────────────────────────────

  useEffect(() => {
    if (!isAuthenticated || !token || !SOCKET_URL) {
      // Not logged in — start polling as primary strategy
      startPolling();
      return;
    }

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("🔌 Socket connected:", socket.id);
      stopPolling(); // socket is up — stop polling
    });

    socket.on("notification", (payload) => {
      // Show toast
      toast.info(`🔔 ${payload.title}`, {
        autoClose: 6000,
        toastId: `notif-${payload._id ?? Date.now()}`,
      });

      // Notify parent (e.g. update bell badge count)
      onNotificationRef.current?.(payload);
    });

    socket.on("disconnect", (reason) => {
      console.warn("Socket disconnected:", reason);
      // Start polling fallback when socket drops
      startPolling();
    });

    socket.on("connect_error", (err) => {
      console.warn("Socket connect error:", err.message);
      // Start polling fallback if socket can't connect (e.g. JWT invalid)
      startPolling();
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      stopPolling();
    };
  }, [isAuthenticated, token, startPolling, stopPolling]);
};

export default useSocket;
