import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  LayoutDashboard,
  Users,
  CalendarCheck2,
  CalendarDays,
  Wallet,
  Bell,
  BarChart3,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { logoutUser } from "../redux/auth/authThunk";
import NotificationBell from "../components/notifications/NotificationBell";

// ---------------------------------------------------------------------------
// Nav item definitions
// ---------------------------------------------------------------------------

const NAV_ITEMS = [
  {
    to: "/dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
  },
  {
    to: "/employees",
    icon: Users,
    label: "Employees",
  },
  {
    to: "/leave-management",
    icon: CalendarCheck2,
    label: "Leave Management",
  },
  {
    to: "/holidays",
    icon: CalendarDays,
    label: "Holidays",
  },
  {
    to: "/salary",
    icon: Wallet,
    label: "Salary Panel",
  },
  {
    to: "/notifications",
    icon: Bell,
    label: "Notifications",
  },
  {
    to: "/reports",
    icon: BarChart3,
    label: "Reports",
  },
];

// ---------------------------------------------------------------------------
// HRLayout
// ---------------------------------------------------------------------------

const HRLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/");
  };

  const initials = user?.firstName
    ? `${user.firstName[0]}${user.lastName?.[0] ?? ""}`.toUpperCase()
    : "HR";

  const fullName = user?.firstName
    ? `${user.firstName} ${user.lastName ?? ""}`.trim()
    : "HR Admin";

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* ── Sidebar ───────────────────────────────────────────────────── */}
      <aside className="flex w-64 shrink-0 flex-col border-r border-gray-900/10 bg-gray-950">

        {/* Brand */}
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
            <span className="text-xs font-bold text-white">HR</span>
          </div>
          <span className="text-sm font-bold tracking-wide text-white">
            HR Portal
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              id={`nav-${label.toLowerCase().replace(/\s+/g, "-")}`}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-white/15 text-white"
                    : "text-white/60 hover:bg-white/8 hover:text-white"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={17}
                    className={`shrink-0 transition-colors ${
                      isActive ? "text-white" : "text-white/50 group-hover:text-white"
                    }`}
                  />
                  <span className="flex-1">{label}</span>
                  {isActive && (
                    <ChevronRight size={13} className="text-white/40" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User block + logout */}
        <div className="border-t border-white/10 px-4 py-4 space-y-3">
          {/* User info */}
          <div className="flex items-center gap-3 rounded-lg bg-white/8 px-3 py-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20 text-xs font-bold text-white">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                {fullName}
              </p>
              <p className="text-xs text-white/50">HR Admin</p>
            </div>
          </div>

          {/* Logout */}
          <button
            id="logout-btn"
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-white/60 transition-all hover:bg-white/8 hover:text-red-400"
          >
            <LogOut size={16} className="shrink-0" />
            Log out
          </button>
        </div>
      </aside>

      {/* ── Main content ──────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-6 py-8">
          {/* Top bar with notification bell */}
          <div className="mb-6 flex items-center justify-end">
            <NotificationBell />
          </div>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default HRLayout;
