import { useCallback, useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import {
  CreditCard,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  IndianRupee,
  Calendar,
  Clock,
} from "lucide-react";
import { salaryService } from "../../services/salaryService";
import { getErrorMessage } from "../../utils/helper";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const STATUS_CONFIG = {
  Pending:   { className: "bg-yellow-100 text-yellow-700", label: "Pending" },
  Processed: { className: "bg-blue-100 text-blue-700",    label: "Processed" },
  Paid:      { className: "bg-green-100 text-green-700",  label: "Paid" },
};

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

const fmt = (n) =>
  `₹${Number(n ?? 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.Pending;
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${cfg.className}`}>
      {cfg.label}
    </span>
  );
};

const BreakdownRow = ({ label, value, highlight }) => (
  <div
    className={`flex items-center justify-between rounded-lg px-3 py-2 ${
      highlight ? "bg-blue-50" : "bg-gray-50"
    }`}
  >
    <p className={`text-sm ${highlight ? "font-bold text-blue-800" : "text-gray-600"}`}>
      {label}
    </p>
    <p className={`text-sm font-semibold ${highlight ? "text-blue-800" : "text-gray-800"}`}>
      {value}
    </p>
  </div>
);

const SalaryCard = ({ slip }) => {
  const [expanded, setExpanded] = useState(false);
  const monthName = MONTH_NAMES[(slip.month ?? 1) - 1];

  return (
    <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Card header */}
      <div
        className="flex cursor-pointer flex-wrap items-center justify-between gap-3 p-5"
        onClick={() => setExpanded((v) => !v)}
        role="button"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <CreditCard size={22} />
          </div>
          <div>
            <p className="font-bold text-gray-950">
              {monthName} {slip.year}
            </p>
            <p className="text-sm text-gray-500">
              {slip.presentDays ?? 0} / {slip.workingDays ?? 0} days present
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              Net Salary
            </p>
            <p className="text-xl font-bold text-gray-950">{fmt(slip.netSalary)}</p>
          </div>
          <StatusBadge status={slip.paymentStatus} />
          <span className="text-gray-400">
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </span>
        </div>
      </div>

      {/* Expandable breakdown */}
      {expanded && (
        <div className="border-t border-gray-100 px-5 pb-5 pt-4">
          <div className="grid gap-2 sm:grid-cols-2">
            {/* Earnings */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={14} className="text-green-600" />
                <p className="text-xs font-bold uppercase tracking-widest text-green-600">
                  Earnings
                </p>
              </div>
              <BreakdownRow label="Basic Salary"  value={fmt(slip.basicSalary)} />
              <BreakdownRow label="Allowances"    value={fmt(slip.allowances)} />
              <BreakdownRow label="Bonus"         value={fmt(slip.bonus)} />
            </div>

            {/* Deductions */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown size={14} className="text-red-500" />
                <p className="text-xs font-bold uppercase tracking-widest text-red-500">
                  Deductions
                </p>
              </div>
              <BreakdownRow label="Total Deductions" value={fmt(slip.deductions)} />

              {/* Attendance summary */}
              <div className="mt-4 flex items-center gap-2">
                <Calendar size={14} className="text-gray-400" />
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  Attendance
                </p>
              </div>
              <BreakdownRow label="Working Days" value={`${slip.workingDays ?? 0} days`} />
              <BreakdownRow label="Present"      value={`${slip.presentDays ?? 0} days`} />
              <BreakdownRow label="Absent"       value={`${slip.absentDays ?? 0} days`} />
              <BreakdownRow label="Leave"        value={`${slip.leaveDays ?? 0} days`} />
            </div>
          </div>

          {/* Net salary row */}
          <div className="mt-4">
            <BreakdownRow label="Net Salary (Take Home)" value={fmt(slip.netSalary)} highlight />
          </div>

          {/* Payment info */}
          {slip.paymentDate && (
            <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
              <Clock size={13} />
              <span>Paid on {dayjs(slip.paymentDate).format("DD MMM YYYY")}</span>
            </div>
          )}
          {slip.remarks && (
            <p className="mt-2 text-xs italic text-gray-400">Remarks: {slip.remarks}</p>
          )}
        </div>
      )}
    </article>
  );
};

// ---------------------------------------------------------------------------
// MySalary Page
// ---------------------------------------------------------------------------

const MySalary = () => {
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSalaries = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await salaryService.getMySalaries();
      setSalaries(res?.salaries ?? []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSalaries();
  }, [loadSalaries]);

  const stats = useMemo(() => {
    if (!salaries.length) return null;
    const totalNet = salaries.reduce((s, r) => s + (r.netSalary ?? 0), 0);
    const paid = salaries.filter((r) => r.paymentStatus === "Paid").length;
    const latest = salaries[0]; // already sorted desc by backend
    return { totalNet, paid, total: salaries.length, latest };
  }, [salaries]);

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
          <p className="font-semibold text-red-700">Failed to load salary records</p>
        </div>
        <p className="mt-1 text-sm text-red-600">{error}</p>
        <button
          onClick={loadSalaries}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-950">My Salary</h1>
        <p className="mt-1 text-sm text-gray-600">
          Your salary slips and payment history. Click any record to see the full breakdown.
        </p>
      </div>

      {/* Summary stats */}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
            <div className="flex items-center gap-2 text-blue-600 mb-2">
              <IndianRupee size={18} />
              <p className="text-xs font-bold uppercase tracking-widest">Latest Net Salary</p>
            </div>
            <p className="text-2xl font-bold text-blue-900">{fmt(stats.latest?.netSalary)}</p>
            <p className="mt-1 text-sm text-blue-700">
              {MONTH_NAMES[(stats.latest?.month ?? 1) - 1]} {stats.latest?.year}
            </p>
          </div>

          <div className="rounded-2xl border border-green-100 bg-green-50 p-5">
            <div className="flex items-center gap-2 text-green-600 mb-2">
              <CreditCard size={18} />
              <p className="text-xs font-bold uppercase tracking-widest">Paid Months</p>
            </div>
            <p className="text-2xl font-bold text-green-900">{stats.paid}</p>
            <p className="mt-1 text-sm text-green-700">out of {stats.total} records</p>
          </div>

          <div className="rounded-2xl border border-purple-100 bg-purple-50 p-5">
            <div className="flex items-center gap-2 text-purple-600 mb-2">
              <TrendingUp size={18} />
              <p className="text-xs font-bold uppercase tracking-widest">Total Earned (All Time)</p>
            </div>
            <p className="text-2xl font-bold text-purple-900">{fmt(stats.totalNet)}</p>
            <p className="mt-1 text-sm text-purple-700">across {stats.total} salary slips</p>
          </div>
        </div>
      )}

      {/* Salary slips */}
      {salaries.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white py-16 text-center shadow-sm">
          <CreditCard size={48} className="mb-3 text-gray-300" />
          <p className="font-semibold text-gray-700">No salary records found</p>
          <p className="mt-1 text-sm text-gray-500">
            Your salary slips will appear here once HR generates them.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {salaries.map((slip, i) => (
            <SalaryCard key={slip._id ?? i} slip={slip} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MySalary;
