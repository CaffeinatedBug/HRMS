import { useCallback, useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import {
  CalendarCheck,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  Filter,
} from "lucide-react";

import { leaveService } from "../../services/leaveService";
import { getErrorMessage } from "../../utils/helper";
import LeaveActionModal from "../../components/hr/LeaveActionModal";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TABS = ["Pending", "Approved", "Rejected"];

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
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.Pending;
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${cfg.className}`}
    >
      <Icon size={12} />
      {cfg.label}
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
      <p className="mt-1 text-xs font-semibold uppercase tracking-widest opacity-70">
        {label}
      </p>
    </div>
  );
};

const SkeletonCard = () => (
  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-3 animate-pulse">
    <div className="flex justify-between">
      <div className="h-4 w-32 rounded bg-gray-200" />
      <div className="h-6 w-20 rounded-full bg-gray-200" />
    </div>
    <div className="h-3 w-48 rounded bg-gray-200" />
    <div className="h-3 w-40 rounded bg-gray-200" />
    <div className="flex gap-2 pt-1">
      <div className="h-8 w-20 rounded-lg bg-gray-200" />
      <div className="h-8 w-20 rounded-lg bg-gray-200" />
    </div>
  </div>
);

const EmptyState = ({ tab }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <CalendarCheck size={48} className="mb-3 text-gray-300" />
    <p className="font-semibold text-gray-700">
      No {tab.toLowerCase()} leave requests
    </p>
    <p className="mt-1 text-sm text-gray-500">
      {tab === "Pending"
        ? "All leave requests are up to date."
        : `There are no ${tab.toLowerCase()} requests to display.`}
    </p>
  </div>
);

// ---------------------------------------------------------------------------
// LeaveCard — individual leave record with approve/reject actions
// ---------------------------------------------------------------------------

const LeaveCard = ({ leave, onApprove, onReject, actionLoading }) => {
  const employeeName =
    leave.employee?.firstName
      ? `${leave.employee.firstName} ${leave.employee.lastName ?? ""}`.trim()
      : leave.employeeName ?? "Employee";
  const empId =
    leave.employee?.employeeId ?? leave.employeeId ?? leave.employee?._id ?? "—";
  const isPending = leave.status === "Pending";

  return (
    <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-wrap items-start justify-between gap-3">
        {/* Left — employee + leave info */}
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-gray-950">{employeeName}</p>
            <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-mono text-gray-500">
              {empId}
            </span>
          </div>

          <p className="text-sm font-semibold text-gray-700">{leave.leaveType}</p>

          <p className="text-sm text-gray-600">
            {dayjs(leave.fromDate).format("DD MMM YYYY")}
            {" — "}
            {dayjs(leave.toDate).format("DD MMM YYYY")}
            <span className="ml-2 font-medium text-gray-700">
              ({leave.totalDays} day{leave.totalDays !== 1 ? "s" : ""})
            </span>
          </p>

          {leave.reason && (
            <p className="text-sm italic text-gray-500">"{leave.reason}"</p>
          )}

          {leave.remarks && leave.status !== "Pending" && (
            <p className="text-xs text-gray-400 mt-1">
              Remarks: {leave.remarks}
            </p>
          )}

          <p className="text-xs text-gray-400 pt-0.5">
            Applied {dayjs(leave.createdAt).format("DD MMM YYYY, hh:mm A")}
          </p>
        </div>

        {/* Right — status badge + actions */}
        <div className="flex flex-col items-end gap-3 shrink-0">
          <StatusBadge status={leave.status} />

          {isPending && (
            <div className="flex items-center gap-2">
              <button
                id={`approve-leave-${leave._id}`}
                type="button"
                onClick={() => onApprove(leave)}
                disabled={actionLoading === leave._id}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-green-600 px-3 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {actionLoading === leave._id ? (
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <CheckCircle size={13} />
                )}
                Approve
              </button>

              <button
                id={`reject-leave-${leave._id}`}
                type="button"
                onClick={() => onReject(leave)}
                disabled={actionLoading === leave._id}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50 transition-colors"
              >
                <XCircle size={13} />
                Reject
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

// ---------------------------------------------------------------------------
// AllLeaves (Leave Management — HR Panel)
// ---------------------------------------------------------------------------

const AllLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("Pending");
  const [actionLoading, setActionLoading] = useState(null); // leave._id being actioned

  // Modal state
  const [modal, setModal] = useState({
    open: false,
    mode: "approve", // "approve" | "reject"
    leave: null,
  });

  // ── Data loading ─────────────────────────────────────────────────────────

  const loadLeaves = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await leaveService.getAll();
      // Backend may return { leaves: [] } or { data: [] } or raw array
      const raw =
        res?.leaves ?? res?.data ?? (Array.isArray(res) ? res : []);
      setLeaves(raw);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLeaves();
  }, [loadLeaves]);

  // ── Derived data ──────────────────────────────────────────────────────────

  const summary = useMemo(
    () => ({
      total: leaves.length,
      pending: leaves.filter((l) => l.status === "Pending").length,
      approved: leaves.filter((l) => l.status === "Approved").length,
      rejected: leaves.filter((l) => l.status === "Rejected").length,
    }),
    [leaves]
  );

  const tabLeaves = useMemo(
    () => leaves.filter((l) => l.status === activeTab),
    [leaves, activeTab]
  );

  // ── Modal handlers ────────────────────────────────────────────────────────

  const openApprove = (leave) =>
    setModal({ open: true, mode: "approve", leave });
  const openReject = (leave) =>
    setModal({ open: true, mode: "reject", leave });
  const closeModal = () =>
    setModal({ open: false, mode: "approve", leave: null });

  const handleConfirm = async (remarks) => {
    const { mode, leave } = modal;
    if (!leave) return;

    setActionLoading(leave._id);
    try {
      if (mode === "approve") {
        await leaveService.approve(leave._id, { remarks });
      } else {
        await leaveService.reject(leave._id, { remarks });
      }

      // Optimistic update — update status in local state
      setLeaves((prev) =>
        prev.map((l) =>
          l._id === leave._id
            ? {
                ...l,
                status: mode === "approve" ? "Approved" : "Rejected",
                remarks,
              }
            : l
        )
      );

      closeModal();
    } catch (err) {
      alert(`Action failed: ${getErrorMessage(err)}`);
    } finally {
      setActionLoading(null);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  if (!loading && error) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-950">Leave Management</h1>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="font-semibold text-red-700">Failed to load leave requests</p>
          </div>
          <p className="mt-1 text-sm text-red-600">{error}</p>
          <button
            onClick={loadLeaves}
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
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-950">Leave Management</h1>
            <p className="mt-1 text-sm text-gray-500">
              Review, approve, and reject employee leave requests.
            </p>
          </div>
          <button
            id="refresh-leaves-btn"
            type="button"
            onClick={loadLeaves}
            disabled={loading}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition-colors"
          >
            {loading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
            ) : null}
            Refresh
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid gap-4 sm:grid-cols-4">
          <SummaryCard label="Total" count={summary.total} color="blue" />
          <SummaryCard label="Pending" count={summary.pending} color="yellow" />
          <SummaryCard label="Approved" count={summary.approved} color="green" />
          <SummaryCard label="Rejected" count={summary.rejected} color="red" />
        </div>

        {/* Tab bar */}
        <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1 w-fit">
          {TABS.map((tab) => (
            <button
              key={tab}
              id={`tab-${tab.toLowerCase()}`}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`relative inline-flex h-8 items-center rounded-lg px-4 text-sm font-semibold transition-colors ${
                activeTab === tab
                  ? "bg-white text-gray-950 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab}
              {tab === "Pending" && summary.pending > 0 && (
                <span className="ml-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
                  {summary.pending}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Leave list */}
        <section className="rounded-2xl border border-gray-200 bg-gray-50/50 p-4">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : tabLeaves.length === 0 ? (
            <EmptyState tab={activeTab} />
          ) : (
            <div className="space-y-3">
              {tabLeaves.map((leave, i) => (
                <LeaveCard
                  key={leave._id ?? i}
                  leave={leave}
                  onApprove={openApprove}
                  onReject={openReject}
                  actionLoading={actionLoading}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Leave action modal */}
      <LeaveActionModal
        isOpen={modal.open}
        mode={modal.mode}
        leave={modal.leave}
        onConfirm={handleConfirm}
        onClose={closeModal}
        loading={actionLoading === modal.leave?._id}
      />
    </>
  );
};

export default AllLeaves;
