import { useCallback, useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { CalendarCheck, Clock, XCircle, CheckCircle, AlertCircle } from "lucide-react";
import { leaveService } from "../../services/leaveService";
import { getErrorMessage } from "../../utils/helper";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STATUS_CONFIG = {
  Pending: {
    label: "Pending",
    className: "bg-yellow-50 text-yellow-700 border-yellow-200",
    icon: Clock,
  },
  Approved: {
    label: "Approved",
    className: "bg-green-50 text-green-700 border-green-200",
    icon: CheckCircle,
  },
  Rejected: {
    label: "Rejected",
    className: "bg-red-50 text-red-700 border-red-200",
    icon: XCircle,
  },
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.Pending;
  const Icon = config.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${config.className}`}
    >
      <Icon size={12} />
      {config.label}
    </span>
  );
};

const SummaryCard = ({ label, count, color }) => {
  const colorMap = {
    yellow: "bg-yellow-50 text-yellow-700 border-yellow-200",
    green: "bg-green-50 text-green-700 border-green-200",
    red: "bg-red-50 text-red-700 border-red-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
  };
  return (
    <div className={`rounded-xl border px-5 py-4 text-center ${colorMap[color]}`}>
      <p className="text-2xl font-bold">{count}</p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-widest opacity-70">{label}</p>
    </div>
  );
};

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <CalendarCheck size={48} className="mb-3 text-gray-300" />
    <p className="font-semibold text-gray-700">No leave applications yet</p>
    <p className="mt-1 text-sm text-gray-500">
      Use <strong>Apply Leave</strong> from the sidebar to submit a request.
    </p>
  </div>
);

// ---------------------------------------------------------------------------
// MyLeaves Page
// ---------------------------------------------------------------------------

const MyLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadLeaves = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await leaveService.getMine();
      setLeaves(res?.leaves ?? []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLeaves();
  }, [loadLeaves]);

  const summary = useMemo(
    () => ({
      total: leaves.length,
      pending: leaves.filter((l) => l.status === "Pending").length,
      approved: leaves.filter((l) => l.status === "Approved").length,
      rejected: leaves.filter((l) => l.status === "Rejected").length,
    }),
    [leaves]
  );

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
          <p className="font-semibold text-red-700">Failed to load leaves</p>
        </div>
        <p className="mt-1 text-sm text-red-600">{error}</p>
        <button
          onClick={loadLeaves}
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
        <h1 className="text-2xl font-bold text-gray-950">My Leaves</h1>
        <p className="mt-1 text-sm text-gray-600">
          All your leave applications and their current status.
        </p>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-4">
        <SummaryCard label="Total" count={summary.total} color="blue" />
        <SummaryCard label="Pending" count={summary.pending} color="yellow" />
        <SummaryCard label="Approved" count={summary.approved} color="green" />
        <SummaryCard label="Rejected" count={summary.rejected} color="red" />
      </div>

      {/* Leave list */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        {leaves.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            {leaves.map((leave, i) => (
              <article
                key={leave._id ?? i}
                className="rounded-xl border border-gray-200 bg-gray-50 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-900">{leave.leaveType}</p>
                    <p className="mt-1 text-sm text-gray-600">
                      {dayjs(leave.fromDate).format("DD MMM YYYY")}
                      {" — "}
                      {dayjs(leave.toDate).format("DD MMM YYYY")}
                      <span className="ml-2 font-medium text-gray-700">
                        ({leave.totalDays} day{leave.totalDays !== 1 ? "s" : ""})
                      </span>
                    </p>
                    {leave.reason && (
                      <p className="mt-1.5 text-sm text-gray-500 italic">"{leave.reason}"</p>
                    )}
                  </div>
                  <StatusBadge status={leave.status} />
                </div>
                <p className="mt-2 text-xs text-gray-400">
                  Applied {dayjs(leave.createdAt).format("DD MMM YYYY, hh:mm A")}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default MyLeaves;
