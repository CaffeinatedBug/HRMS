import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Clock,
  UserCheck,
  UserX,
} from "lucide-react";

// ---------------------------------------------------------------------------
// EmployeeTable
//
// Props:
//   employees  {Array}   Raw employee array from API
//   loading    {boolean}
// ---------------------------------------------------------------------------

const PAGE_SIZE = 20;

const ATTENDANCE_STATUS = {
  present: {
    label: "Present",
    className: "bg-green-50 text-green-700 border-green-200",
    icon: UserCheck,
  },
  absent: {
    label: "Absent",
    className: "bg-red-50 text-red-700 border-red-200",
    icon: UserX,
  },
  leave: {
    label: "On Leave",
    className: "bg-blue-50 text-blue-700 border-blue-200",
    icon: Clock,
  },
};

const AttendanceBadge = ({ status }) => {
  const key = (status ?? "absent").toLowerCase();
  const cfg = ATTENDANCE_STATUS[key] ?? ATTENDANCE_STATUS.absent;
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cfg.className}`}
    >
      <Icon size={11} />
      {cfg.label}
    </span>
  );
};

const SalaryStageBadge = ({ status }) => {
  const map = {
    Paid: "bg-green-50 text-green-700 border-green-200",
    Pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
    Processing: "bg-blue-50 text-blue-700 border-blue-200",
    Failed: "bg-red-50 text-red-700 border-red-200",
  };
  const cls = map[status] ?? map.Pending;
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
      {status ?? "—"}
    </span>
  );
};

// Skeleton row
const SkeletonRow = ({ cols }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <div className="h-4 rounded-md bg-gray-200 animate-pulse" />
      </td>
    ))}
  </tr>
);

const EmployeeTable = ({ employees = [], loading = false }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  // Unique departments for filter dropdown
  const departments = useMemo(() => {
    const set = new Set(employees.map((e) => e.department).filter(Boolean));
    return ["all", ...Array.from(set).sort()];
  }, [employees]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return employees.filter((emp) => {
      const fullName =
        `${emp.firstName ?? ""} ${emp.lastName ?? ""}`.toLowerCase();
      const empId = (emp.employeeId ?? emp._id ?? "").toLowerCase();

      const matchesSearch =
        !q || fullName.includes(q) || empId.includes(q);
      const matchesDept =
        deptFilter === "all" || emp.department === deptFilter;
      const matchesStatus =
        statusFilter === "all" ||
        (emp.todayAttendance?.status ?? "absent").toLowerCase() ===
          statusFilter;

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [employees, search, deptFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };
  const handleDeptChange = (e) => {
    setDeptFilter(e.target.value);
    setPage(1);
  };
  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  const formatTime = (ts) => {
    if (!ts) return "—";
    try {
      return new Date(ts).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return ts;
    }
  };

  return (
    <section className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 px-6 py-4">
        <h2 className="text-base font-semibold text-gray-950 mr-auto">
          Employee Overview
        </h2>

        {/* Search */}
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            id="emp-search"
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search name or ID…"
            className="h-9 w-52 rounded-lg border border-gray-200 pl-8 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
        </div>

        {/* Department filter */}
        <select
          id="dept-filter"
          value={deptFilter}
          onChange={handleDeptChange}
          className="h-9 rounded-lg border border-gray-200 px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white"
        >
          <option value="all">All Departments</option>
          {departments.slice(1).map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        {/* Attendance status filter */}
        <select
          id="status-filter"
          value={statusFilter}
          onChange={handleStatusChange}
          className="h-9 rounded-lg border border-gray-200 px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white"
        >
          <option value="all">All Statuses</option>
          <option value="present">Present</option>
          <option value="absent">Absent</option>
          <option value="leave">On Leave</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-left">
              {[
                "Emp ID",
                "Name",
                "Department",
                "Attendance",
                "Punch In",
                "Punch Out",
                "Leave Status",
                "Salary",
                "Actions",
              ].map((col) => (
                <th
                  key={col}
                  className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <SkeletonRow key={i} cols={9} />
                ))
              : paginated.length === 0
              ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-12 text-center text-sm text-gray-500"
                  >
                    No employees found matching your filters.
                  </td>
                </tr>
              )
              : paginated.map((emp, idx) => {
                  const fullName =
                    `${emp.firstName ?? ""} ${emp.lastName ?? ""}`.trim() ||
                    "—";
                  const attendance = emp.todayAttendance;
                  const latestLeave = emp.latestLeave;

                  return (
                    <tr
                      key={emp._id ?? idx}
                      className="hover:bg-gray-50/60 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-gray-600">
                        {emp.employeeId ?? emp._id?.slice(-6) ?? "—"}
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        {fullName}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {emp.department ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <AttendanceBadge
                          status={attendance?.status ?? "absent"}
                        />
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {formatTime(attendance?.punchIn)}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {formatTime(attendance?.punchOut)}
                      </td>
                      <td className="px-4 py-3">
                        {latestLeave?.status ? (
                          <SalaryStageBadge status={latestLeave.status} />
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {emp.latestSalary?.paymentStatus ? (
                          <SalaryStageBadge
                            status={emp.latestSalary.paymentStatus}
                          />
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            id={`view-profile-${emp._id ?? idx}`}
                            type="button"
                            onClick={() =>
                              navigate(`/employees/${emp._id}`)
                            }
                            className="inline-flex h-7 items-center gap-1 rounded-lg border border-gray-200 px-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            <Eye size={11} />
                            Profile
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft size={14} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (p) =>
                  p === 1 || p === totalPages || Math.abs(p - safePage) <= 1
              )
              .reduce((acc, p, i, arr) => {
                if (i > 0 && arr[i - 1] !== p - 1) {
                  acc.push("…");
                }
                acc.push(p);
                return acc;
              }, [])
              .map((item, i) =>
                item === "…" ? (
                  <span key={`ellipsis-${i}`} className="px-1 text-xs text-gray-400">
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
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors"
              aria-label="Next page"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default EmployeeTable;
