import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import {
  IndianRupee,
  AlertCircle,
  CheckCircle,
  XCircle,
  Search,
  Download,
  Clock,
  History,
} from "lucide-react";

import { salaryService } from "../../services/salaryService";
import { getErrorMessage } from "../../utils/helper";
import SalaryConfirmModal from "../../components/hr/SalaryConfirmModal";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const STATUS_CONFIG = {
  Pending: {
    label: "Pending",
    className: "bg-yellow-50 text-yellow-700 border-yellow-200",
    icon: Clock,
  },
  Processing: {
    label: "Processing",
    className: "bg-blue-50 text-blue-700 border-blue-200",
    icon: Clock,
  },
  Paid: {
    label: "Paid",
    className: "bg-green-50 text-green-700 border-green-200",
    icon: CheckCircle,
  },
  Failed: {
    label: "Failed",
    className: "bg-red-50 text-red-700 border-red-200",
    icon: XCircle,
  },
};

// Valid state-machine transitions
const CAN_CONFIRM = ["Pending", "Processing"];
const CAN_FAIL    = ["Pending", "Processing"];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const fmt = (n) =>
  `₹${Number(n ?? 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

const monthLabel = (s) => {
  if (!s) return "—";
  const [year, m] = s.split("-");
  const name = MONTH_NAMES[parseInt(m, 10) - 1] ?? m;
  return `${name} ${year}`;
};

// Build list of months available for filter
const buildMonthOptions = (records) => {
  const months = new Set(
    records
      .map((r) => {
        if (r.salaryMonth) return r.salaryMonth;
        if (r.month && r.year) {
          const m = String(r.month).padStart(2, "0");
          return `${r.year}-${m}`;
        }
        return null;
      })
      .filter(Boolean)
  );
  return ["all", ...Array.from(months).sort().reverse()];
};

// CSV export
const exportCSV = (records) => {
  const cols = [
    "Employee ID","Name","Salary Month","Gross Salary","Net Salary",
    "Payment Date","Status",
  ];
  const rows = records.map((r) => {
    const name =
      r.employee?.firstName
        ? `${r.employee.firstName} ${r.employee.lastName ?? ""}`.trim()
        : r.employeeName ?? "—";
    const empId = r.employee?.employeeId ?? r.employeeId ?? "—";
    const month =
      r.salaryMonth ??
      (r.month && r.year ? `${r.year}-${String(r.month).padStart(2,"0")}` : "—");
    return [
      empId,
      `"${name}"`,
      month,
      r.basicSalary ?? r.grossSalary ?? 0,
      r.netSalary ?? 0,
      r.paymentDate ? dayjs(r.paymentDate).format("DD MMM YYYY") : "—",
      r.paymentStatus ?? "—",
    ].join(",");
  });
  const csv = [cols.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `salary-records-${dayjs().format("YYYY-MM-DD")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.Pending;
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

const SummaryCard = ({ label, count, color }) => {
  const colorMap = {
    yellow: "bg-yellow-50 text-yellow-700 border-yellow-200",
    blue:   "bg-blue-50 text-blue-700 border-blue-200",
    green:  "bg-green-50 text-green-700 border-green-200",
    red:    "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <div className={`rounded-xl border px-5 py-4 text-center ${colorMap[color]}`}>
      <p className="text-2xl font-bold">{count}</p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-widest opacity-70">
        {label}
      </p>
    </div>
  );
};

const SkeletonRow = () => (
  <tr className="animate-pulse">
    {Array.from({ length: 8 }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <div className="h-4 rounded bg-gray-200" />
      </td>
    ))}
  </tr>
);

// ---------------------------------------------------------------------------
// SalaryList (Salary Confirmation Panel — HR)
// ---------------------------------------------------------------------------

const SalaryList = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [monthFilter, setMonthFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState(null); // record._id

  // Modal state
  const [modal, setModal] = useState({
    open: false,
    mode: "confirm", // "confirm" | "fail"
    record: null,
  });

  // ── Data loading ──────────────────────────────────────────────────────────

  const loadRecords = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await salaryService.getAll();
      const raw =
        res?.salaries ?? res?.data ?? (Array.isArray(res) ? res : []);
      setRecords(raw);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  // ── Derived data ──────────────────────────────────────────────────────────

  const monthOptions = useMemo(() => buildMonthOptions(records), [records]);

  const summary = useMemo(
    () => ({
      pending:    records.filter((r) => r.paymentStatus === "Pending").length,
      processing: records.filter((r) => r.paymentStatus === "Processing").length,
      paid:       records.filter((r) => r.paymentStatus === "Paid").length,
      failed:     records.filter((r) => r.paymentStatus === "Failed").length,
    }),
    [records]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return records.filter((r) => {
      const name =
        r.employee?.firstName
          ? `${r.employee.firstName} ${r.employee.lastName ?? ""}`.toLowerCase()
          : (r.employeeName ?? "").toLowerCase();
      const empId = (
        r.employee?.employeeId ?? r.employeeId ?? ""
      ).toLowerCase();

      const matchesSearch = !q || name.includes(q) || empId.includes(q);

      const recMonth =
        r.salaryMonth ??
        (r.month && r.year
          ? `${r.year}-${String(r.month).padStart(2, "0")}`
          : null);
      const matchesMonth =
        monthFilter === "all" || recMonth === monthFilter;

      const matchesStatus =
        statusFilter === "all" || r.paymentStatus === statusFilter;

      return matchesSearch && matchesMonth && matchesStatus;
    });
  }, [records, search, monthFilter, statusFilter]);

  // ── Modal handlers ────────────────────────────────────────────────────────

  const openConfirm = (record) =>
    setModal({ open: true, mode: "confirm", record });
  const openFail = (record) =>
    setModal({ open: true, mode: "fail", record });
  const closeModal = () =>
    setModal({ open: false, mode: "confirm", record: null });

  const handleConfirm = async () => {
    const { mode, record } = modal;
    if (!record) return;

    setActionLoading(record._id);
    try {
      if (mode === "confirm") {
        await salaryService.confirm(record._id);
      } else {
        await salaryService.markFailed(record._id);
      }

      // Optimistic update
      const newStatus = mode === "confirm" ? "Paid" : "Failed";
      setRecords((prev) =>
        prev.map((r) =>
          r._id === record._id
            ? { ...r, paymentStatus: newStatus }
            : r
        )
      );
      closeModal();
    } catch (err) {
      alert(`Action failed: ${getErrorMessage(err)}`);
    } finally {
      setActionLoading(null);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (!loading && error) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-950">Salary Panel</h1>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="font-semibold text-red-700">Failed to load salary records</p>
          </div>
          <p className="mt-1 text-sm text-red-600">{error}</p>
          <button
            onClick={loadRecords}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-gray-950">Salary Panel</h1>
            <p className="mt-1 text-sm text-gray-500">
              Confirm payments, mark failures, and track salary status across all employees.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="export-csv-btn"
              type="button"
              onClick={() => exportCSV(filtered)}
              disabled={filtered.length === 0}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              <Download size={14} />
              Export CSV
            </button>
            <button
              id="refresh-salary-btn"
              type="button"
              onClick={loadRecords}
              disabled={loading}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
              ) : null}
              Refresh
            </button>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid gap-4 sm:grid-cols-4">
          <SummaryCard label="Pending" count={summary.pending} color="yellow" />
          <SummaryCard label="Processing" count={summary.processing} color="blue" />
          <SummaryCard label="Paid" count={summary.paid} color="green" />
          <SummaryCard label="Failed" count={summary.failed} color="red" />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
          <div className="relative flex-1 min-w-[180px]">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              id="salary-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search employee name or ID…"
              className="h-9 w-full rounded-lg border border-gray-200 pl-8 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
          </div>

          <select
            id="month-filter"
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="h-9 rounded-lg border border-gray-200 px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white"
          >
            <option value="all">All Months</option>
            {monthOptions.slice(1).map((m) => (
              <option key={m} value={m}>
                {monthLabel(m)}
              </option>
            ))}
          </select>

          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-lg border border-gray-200 px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Paid">Paid</option>
            <option value="Failed">Failed</option>
          </select>

          <p className="ml-auto text-xs text-gray-400">
            {filtered.length} record{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Salary table */}
        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left">
                  {[
                    "Emp ID","Name","Salary Month","Gross Salary",
                    "Net Salary","Payment Date","Status","Actions",
                  ].map((col) => (
                    <th
                      key={col}
                      className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 whitespace-nowrap"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {loading
                  ? Array.from({ length: 8 }).map((_, i) => (
                      <SkeletonRow key={i} />
                    ))
                  : filtered.length === 0
                  ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-4 py-14 text-center text-sm text-gray-500"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <IndianRupee size={36} className="text-gray-300" />
                          <p className="font-semibold text-gray-600">
                            No salary records found
                          </p>
                          <p className="text-gray-400">
                            Try adjusting your filters.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )
                  : filtered.map((r, idx) => {
                      const name =
                        r.employee?.firstName
                          ? `${r.employee.firstName} ${r.employee.lastName ?? ""}`.trim()
                          : r.employeeName ?? "—";
                      const empId =
                        r.employee?.employeeId ?? r.employeeId ?? "—";
                      const month =
                        r.salaryMonth ??
                        (r.month && r.year
                          ? `${r.year}-${String(r.month).padStart(2,"0")}`
                          : null);
                      const gross =
                        r.basicSalary ?? r.grossSalary ?? 0;
                      const canConfirm = CAN_CONFIRM.includes(r.paymentStatus);
                      const canFail    = CAN_FAIL.includes(r.paymentStatus);
                      const isActioning = actionLoading === r._id;

                      return (
                        <tr
                          key={r._id ?? idx}
                          className="hover:bg-gray-50/60 transition-colors"
                        >
                          <td className="px-4 py-3 font-mono text-xs text-gray-600 whitespace-nowrap">
                            {empId}
                          </td>
                          <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">
                            {name}
                          </td>
                          <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                            {month ? monthLabel(month) : "—"}
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {fmt(gross)}
                          </td>
                          <td className="px-4 py-3 font-semibold text-gray-900">
                            {fmt(r.netSalary)}
                          </td>
                          <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                            {r.paymentDate
                              ? dayjs(r.paymentDate).format("DD MMM YYYY")
                              : "—"}
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={r.paymentStatus} />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {canConfirm && (
                                <button
                                  id={`confirm-salary-${r._id ?? idx}`}
                                  type="button"
                                  onClick={() => openConfirm(r)}
                                  disabled={isActioning}
                                  className="inline-flex h-7 items-center gap-1 rounded-lg bg-emerald-600 px-2.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                                >
                                  {isActioning ? (
                                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                  ) : (
                                    <CheckCircle size={11} />
                                  )}
                                  Confirm
                                </button>
                              )}

                              {canFail && (
                                <button
                                  id={`fail-salary-${r._id ?? idx}`}
                                  type="button"
                                  onClick={() => openFail(r)}
                                  disabled={isActioning}
                                  className="inline-flex h-7 items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50 transition-colors"
                                >
                                  <XCircle size={11} />
                                  Mark Failed
                                </button>
                              )}

                              <button
                                id={`history-salary-${r._id ?? idx}`}
                                type="button"
                                onClick={() =>
                                  navigate(`/salary/${r._id}`)
                                }
                                className="inline-flex h-7 items-center gap-1 rounded-lg border border-gray-200 px-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                              >
                                <History size={11} />
                                History
                              </button>

                              {!canConfirm && !canFail && r.paymentStatus === "Paid" && (
                                <span className="text-xs text-gray-400 italic">
                                  Confirmed
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Salary confirm/fail modal */}
      <SalaryConfirmModal
        isOpen={modal.open}
        mode={modal.mode}
        salary={modal.record}
        onConfirm={handleConfirm}
        onClose={closeModal}
        loading={actionLoading === modal.record?._id}
      />
    </>
  );
};

export default SalaryList;
