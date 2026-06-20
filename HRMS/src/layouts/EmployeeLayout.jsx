import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  LayoutDashboard,
  Clock,
  CalendarCheck,
  FilePlus,
  User,
  CalendarDays,
  IndianRupee,
  Bell,
  LogOut,
  Menu,
  X,
  BarChart2,
  Cake,
} from "lucide-react";
import { useState } from "react";
import { logoutUser } from "../redux/auth/authThunk";

// ---------------------------------------------------------------------------
// Nav config
// ---------------------------------------------------------------------------

const NAV_ITEMS = [
  { to: "/employee/dashboard",     label: "Dashboard",      icon: LayoutDashboard, end: true },
  { to: "/attendance",             label: "Attendance",      icon: Clock,           end: true },
  { to: "/attendance/monthly",     label: "Monthly Report", icon: BarChart2 },
  { to: "/my-leaves",              label: "My Leaves",       icon: CalendarCheck },
  { to: "/apply-leave",            label: "Apply Leave",     icon: FilePlus },
  { to: "/employee/birthdays",     label: "Birthdays",       icon: Cake },
  { to: "/employee/holidays",      label: "Holidays",        icon: CalendarDays },
  { to: "/my-salary",              label: "My Salary",       icon: IndianRupee },
  { to: "/employee/notifications", label: "Notifications",   icon: Bell },
  { to: "/profile",                label: "Profile",         icon: User },
];

// ---------------------------------------------------------------------------
// Avatar helper
// ---------------------------------------------------------------------------

const Avatar = ({ name, size = "md" }) => {
  const initials = (name ?? "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const sizeMap = {
    sm: "h-8 w-8 text-xs",
    md: "h-11 w-11 text-sm",
  };

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-white/20 font-bold text-white ${sizeMap[size]}`}
    >
      {initials}
    </div>
  );
};

// ---------------------------------------------------------------------------
// NavItem
// ---------------------------------------------------------------------------

const NavItem = ({ to, label, icon: Icon, onClick, end }) => (
  <NavLink
    to={to}
    end={end}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
        isActive
          ? "bg-white text-blue-900 shadow-sm"
          : "text-white/75 hover:bg-white/10 hover:text-white"
      }`
    }
  >
    <Icon size={18} className="shrink-0" />
    {label}
  </NavLink>
);

// ---------------------------------------------------------------------------
// Sidebar content (shared between desktop and mobile)
// ---------------------------------------------------------------------------

const SidebarContent = ({ user, onNavClick, onLogout }) => {
  const fullName = user?.firstName
    ? `${user.firstName} ${user.lastName ?? ""}`.trim()
    : "Employee";

  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="mb-6 flex items-center gap-3 px-1">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
          <LayoutDashboard size={18} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-bold tracking-wide text-white">HRMS</p>
          <p className="text-xs text-white/50">Employee Portal</p>
        </div>
      </div>

      {/* User info */}
      <div className="mb-6 flex items-center gap-3 rounded-xl bg-white/10 px-3 py-3">
        <Avatar name={fullName} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{fullName}</p>
          <p className="truncate text-xs text-white/60">{user?.designation || "Employee"}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.to} {...item} onClick={onNavClick} />
        ))}
      </nav>

      {/* Logout */}
      <button
        type="button"
        onClick={onLogout}
        className="mt-6 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
      >
        <LogOut size={18} className="shrink-0" />
        Logout
      </button>
    </div>
  );
};

// ---------------------------------------------------------------------------
// EmployeeLayout
// ---------------------------------------------------------------------------

const EmployeeLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/");
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* ── Desktop sidebar ── */}
      <aside className="hidden w-64 shrink-0 flex-col bg-blue-900 p-5 lg:flex">
        <SidebarContent
          user={user}
          onNavClick={undefined}
          onLogout={handleLogout}
        />
      </aside>

      {/* ── Mobile sidebar overlay ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-blue-900 p-5 transition-transform duration-200 lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          type="button"
          onClick={closeMobile}
          aria-label="Close sidebar"
          className="absolute right-4 top-4 text-white/60 hover:text-white"
        >
          <X size={20} />
        </button>
        <SidebarContent
          user={user}
          onNavClick={closeMobile}
          onLogout={handleLogout}
        />
      </aside>

      {/* ── Main area ── */}
      <div className="flex flex-1 flex-col min-w-0">

        {/* Mobile top bar */}
        <header className="flex items-center gap-4 border-b border-gray-200 bg-white px-4 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open sidebar"
            className="rounded-lg p-1.5 text-gray-600 hover:bg-gray-100"
          >
            <Menu size={22} />
          </button>
          <p className="text-sm font-bold text-gray-900">HRMS Employee Portal</p>
        </header>

        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default EmployeeLayout;
