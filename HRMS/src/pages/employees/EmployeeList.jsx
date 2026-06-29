import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import {
  Search,
  Users,
  ChevronLeft,
  ChevronRight,
  Eye,
  AlertCircle,
  Building2,
  Briefcase,
} from "lucide-react";

import BaseApiManager from "../../api/BaseApiManager";
import { EMPLOYEE } from "../../api/endpoints";
import { getErrorMessage } from "../../utils/helper";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PAGE_SIZE = 15;

const ROLE_CONFIG = {
  HR: "bg-purple-50 text-purple-700 border-purple-200",
  EMPLOYEE: "bg-blue-50 text-blue-700 border-blue-200",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const getInitials = (firstName, lastName) =>
  `${(firstName?.[0] ?? "").toUpperCase()}${(lastName?.[0] ?? "").toUpperCase()}`;

const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-purple-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-indigo-500",
  "bg-orange-500",
];

const avatarColor = (id) =>
  AVATAR_COLORS[(id?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const RoleBadge = ({ role }) => {
  const cls = ROLE_CONFIG[role] ?? ROLE_CONFIG.EMPLOYEE;
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
      {role === "HR" ? "HR Admin" : "Employee"}
    </span>
  );
};

const Avatar = ({ user, size = "md" }) => {
  const initials = getInitials(user.firstName, user.lastName);
  const color = avatarColor(user._id);
  const sizeClass = size === "sm" ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm";

  if (user.profileImage) {
    return (
      <img
        src={user.profileImage}
        alt={initials}
        className={`${sizeClass} rounded-full object-cover`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} ${color} flex shrink-0 items-center justify-center rounded-full font-bold text-white`}
    >
      {initials}
    </div>
  );
};

const SkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="px-5 py-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-gray-200" />
        <div className="space-y-2">
          <div className="h-4 w-28 rounded bg-gray-200" />
          <div className="h-3 w-20 rounded bg-gray-200" />
        </div>
      </div>
    </td>
    {Array.from({ length: 5 }).map((_, i) => (
      <td key={i} className="px-4 py-4">
        <div className="h-4 w-24 rounded bg-gray-200" />
      </td>
    ))}
  </tr>
);

// ---------------------------------------------------------------------------
// EmployeeList
// ---------------------------------------------------------------------------

const EmployeeList = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [page, setPage] = useState(1);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await BaseApiManager.get(EMPLOYEE.LIST);
      // Response: { success, count, users: [] }
      const raw = res?.users ?? res?.data ?? (Array.isArray(res) ? res : []);
      setEmployees(raw);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // ── Derived data ───────────────────────────────────────────────────────────

  const departments = useMemo(() => {
    const set = new Set(employees.map((e) => e.department).filter(Boolean));
    return Array.from(set).sort();
  }, [employees]);

  const summary = useMemo(
    () => ({
      total: employees.length,
    }),
    [employees]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return employees.filter((emp) => {
      const fullName =
        `${emp.firstName ?? ""} ${emp.lastName ?? ""}`.toLowerCase();
      const empId = (emp.employeeId ?? "").toLowerCase();
      const email = (emp.email ?? "").toLowerCase();

      const matchesSearch =
        !q ||
        fullName.includes(q) ||
        empId.includes(q) ||
        email.includes(q);
      const matchesDept =
        deptFilter === "all" || emp.department === deptFilter;

      return matchesSearch && matchesDept;
    });
  }, [employees, search, deptFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  const resetPage = () => setPage(1);

  // ── Error state ────────────────────────────────────────────────────────────

  if (!loading && error) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-950">Employees</h1>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="font-semibold text-red-700">
              Failed to load employee records
            </p>
          </div>
          <p className="mt-1 text-sm text-red-600">{error}</p>
          <button
            onClick={load}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  // ── Main render ─────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-950">Employees</h1>
          <p className="mt-1 text-sm text-gray-500">
            All registered employees — view profiles and manage records.
          </p>
        </div>
        <button
          id="refresh-employees-btn"
          type="button"
          onClick={load}
          disabled={loading}
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition-colors"
        >
          {loading && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
          )}
          Refresh
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-1">
        <div className="flex items-center gap-4 rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 text-blue-800">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/60">
            <Users size={20} className="text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{loading ? "—" : summary.total}</p>
            <p className="text-xs font-semibold uppercase tracking-widest opacity-70">
              Total Employees
            </p>
          </div>
        </div>
      </div>

      {/* Filters toolbar */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            id="employee-search"
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              resetPage();
            }}
            placeholder="Search name, ID, or email…"
            className="h-9 w-full rounded-lg border border-gray-200 pl-8 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
        </div>

        {/* Department filter */}
        <select
          id="dept-filter"
          value={deptFilter}
          onChange={(e) => {
            setDeptFilter(e.target.value);
            resetPage();
          }}
          className="h-9 rounded-lg border border-gray-200 px-3 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-gray-300"
        >
          <option value="all">All Departments</option>
          {departments.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <p className="ml-auto text-xs text-gray-400">
          {loading ? "…" : `${filtered.length} result${filtered.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      {/* Table */}
      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left">
                {["Employee", "Emp ID", "Department", "Designation", "Joined", "Role", ""].map(
                  (col) => (
                    <th
                      key={col}
                      className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 whitespace-nowrap"
                    >
                      {col}
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
              ) : paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-16 text-center"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Users size={40} className="text-gray-300" />
                      <p className="font-semibold text-gray-600">
                        No employees found
                      </p>
                      <p className="text-sm text-gray-400">
                        Try adjusting your search or filters.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((emp) => (
                  <tr
                    key={emp._id}
                    className="hover:bg-gray-50/70 transition-colors cursor-pointer"
                    onClick={() => navigate(`/employees/${emp._id}`)}
                  >
                    {/* Employee name + email + avatar */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar user={emp} />
                        <div>
                          <p className="font-semibold text-gray-950">
                            {emp.firstName} {emp.lastName}
                          </p>
                          <p className="text-xs text-gray-500">{emp.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Employee ID */}
                    <td className="px-4 py-4">
                      <span className="font-mono text-xs text-gray-600">
                        {emp.employeeId}
                      </span>
                    </td>

                    {/* Department */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        {emp.department ? (
                          <>
                            <Building2 size={12} className="text-gray-400" />
                            {emp.department}
                          </>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </div>
                    </td>

                    {/* Designation */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        {emp.designation ? (
                          <>
                            <Briefcase size={12} className="text-gray-400" />
                            {emp.designation}
                          </>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </div>
                    </td>

                    {/* Joined date */}
                    <td className="px-4 py-4 text-gray-600 whitespace-nowrap">
                      {emp.joiningDate
                        ? dayjs(emp.joiningDate).format("DD MMM YYYY")
                        : "—"}
                    </td>

                    {/* Role */}
                    <td className="px-4 py-4">
                      <RoleBadge role={emp.role} />
                    </td>

                    {/* View action */}
                    <td className="px-4 py-4">
                      <button
                        id={`view-employee-${emp._id}`}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/employees/${emp._id}`);
                        }}
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-gray-200 px-3 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <Eye size={12} />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between border-t border-gray-100 px-6 py-3">
            <p className="text-xs text-gray-500">
              Showing{" "}
              <span className="font-semibold text-gray-700">
                {(safePage - 1) * PAGE_SIZE + 1}–
                {Math.min(safePage * PAGE_SIZE, filtered.length)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-700">
                {filtered.length}
              </span>{" "}
              employees
            </p>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40"
                aria-label="Previous page"
              >
                <ChevronLeft size={14} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (p) =>
                    p === 1 ||
                    p === totalPages ||
                    Math.abs(p - safePage) <= 1
                )
                .reduce((acc, p, i, arr) => {
                  if (i > 0 && arr[i - 1] !== p - 1) acc.push("…");
                  acc.push(p);
                  return acc;
                }, [])
                .map((item, i) =>
                  item === "…" ? (
                    <span
                      key={`e-${i}`}
                      className="px-1 text-xs text-gray-400"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setPage(item)}
                      className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold transition-colors ${
                        item === safePage
                          ? "bg-gray-950 text-white"
                          : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {item}
                    </button>
                  )
                )}

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40"
                aria-label="Next page"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default EmployeeList;
