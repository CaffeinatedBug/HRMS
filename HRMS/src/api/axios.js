import axios from "axios";
import { toast } from "react-toastify";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Request interceptor — attach Bearer token ─────────────────────────────

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor — handle 401 session expiry ─────────────────────
//
// When the backend returns 401 (expired or invalid JWT) we:
//   1. Clear localStorage (token + user)
//   2. Dispatch a Redux reset by importing the store lazily (avoids
//      circular import: store → authSlice → axios → store)
//   3. Show a toast notification
//   4. Redirect to login with ?session=expired so the page can display
//      an informative banner
//
// A one-shot flag prevents multiple rapid 401s from triggering the flow
// more than once while the redirect is in-flight.

let isLoggingOut = false;

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;

    if (status === 401 && !isLoggingOut) {
      // Ignore 401s on the login/register endpoints themselves —
      // those are handled by the auth form's own error display.
      const url = error.config?.url ?? "";
      const isAuthEndpoint =
        url.includes("/auth/login") || url.includes("/auth/register");

      if (!isAuthEndpoint) {
        isLoggingOut = true;

        // Clear persisted session
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // Lazy-import store to avoid circular dependency
        const { store } = await import("../app/store");
        const { logoutUser } = await import("../redux/auth/authThunk");
        await store.dispatch(logoutUser());

        toast.warn("Your session has expired. Please log in again.", {
          toastId: "session-expired",
          autoClose: 4000,
        });

        // Small delay so the toast is visible before the redirect
        setTimeout(() => {
          window.location.href = "/?session=expired";
          isLoggingOut = false;
        }, 500);
      }
    }

    return Promise.reject(error);
  }
);

export default API;