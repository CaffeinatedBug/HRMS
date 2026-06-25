import { useEffect } from "react";
import { X, IndianRupee, AlertTriangle } from "lucide-react";

// ---------------------------------------------------------------------------
// SalaryConfirmModal
//
// Props:
//   isOpen    {boolean}
//   mode      {"confirm"|"fail"}
//   salary    {object}    Salary record being actioned
//   onConfirm () => void
//   onClose   () => void
//   loading   {boolean}
// ---------------------------------------------------------------------------

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const fmt = (n) =>
  `₹${Number(n ?? 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

const SalaryConfirmModal = ({
  isOpen,
  mode,
  salary,
  onConfirm,
  onClose,
  loading = false,
}) => {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen || !salary) return null;

  const isFail = mode === "fail";
  const employeeName =
    salary.employee?.firstName
      ? `${salary.employee.firstName} ${salary.employee.lastName ?? ""}`.trim()
      : salary.employeeName ?? "Employee";
  const monthLabel =
    salary.month != null
      ? `${MONTH_NAMES[(salary.month ?? 1) - 1]} ${salary.year ?? ""}`
      : "—";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="salary-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-3">
            {isFail ? (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50">
                <AlertTriangle size={18} className="text-red-600" />
              </div>
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50">
                <IndianRupee size={18} className="text-emerald-600" />
              </div>
            )}
            <h2
              id="salary-modal-title"
              className="text-base font-semibold text-gray-950"
            >
              {isFail ? "Mark Salary as Failed" : "Confirm Salary Payment"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Salary summary card */}
          <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-900">{employeeName}</p>
              <p className="text-xs font-medium text-gray-500">{monthLabel}</p>
            </div>
            <div className="flex items-center justify-between border-t border-gray-200 pt-2">
              <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">
                Net Salary
              </p>
              <p className="text-lg font-bold text-gray-950">
                {fmt(salary.netSalary)}
              </p>
            </div>
          </div>

          {/* Warning message */}
          <p className="text-sm text-gray-600">
            {isFail ? (
              <>
                This will mark the salary for{" "}
                <span className="font-semibold text-gray-900">{employeeName}</span>{" "}
                as{" "}
                <span className="font-semibold text-red-700">Failed</span>.
                The record can still be re-processed by an admin.
              </>
            ) : (
              <>
                This will confirm payment of{" "}
                <span className="font-semibold text-gray-900">{fmt(salary.netSalary)}</span>{" "}
                to{" "}
                <span className="font-semibold text-gray-900">{employeeName}</span>.{" "}
                <span className="text-red-600 font-medium">
                  This action is irreversible.
                </span>
              </>
            )}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="inline-flex h-9 items-center rounded-lg border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            id={isFail ? "confirm-fail-btn" : "confirm-payment-btn"}
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`inline-flex h-9 items-center gap-2 rounded-lg px-4 text-sm font-semibold text-white disabled:opacity-60 transition-colors ${
              isFail
                ? "bg-red-600 hover:bg-red-700"
                : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {loading && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            {isFail ? "Mark as Failed" : "Confirm Payment"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SalaryConfirmModal;
