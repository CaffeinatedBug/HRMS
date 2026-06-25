import { useEffect, useRef, useState } from "react";
import { X, AlertTriangle, CheckCircle } from "lucide-react";

// ---------------------------------------------------------------------------
// LeaveActionModal
//
// Props:
//   isOpen      {boolean}         Controls visibility
//   mode        {"approve"|"reject"}
//   leave       {object}          The leave record being actioned
//   onConfirm   (remarks) => void Called with remarks string (or "" for approve)
//   onClose     () => void        Close without action
//   loading     {boolean}         Shows spinner on confirm button
// ---------------------------------------------------------------------------

const LeaveActionModal = ({
  isOpen,
  mode,
  leave,
  onConfirm,
  onClose,
  loading = false,
}) => {
  const [remarks, setRemarks] = useState("");
  const [remarksError, setRemarksError] = useState("");
  const textareaRef = useRef(null);

  // Reset state whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setRemarks("");
      setRemarksError("");
      // Auto-focus textarea for reject flow
      if (mode === "reject") {
        setTimeout(() => textareaRef.current?.focus(), 50);
      }
    }
  }, [isOpen, mode]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen || !leave) return null;

  const isReject = mode === "reject";
  const employeeName =
    leave.employee?.firstName
      ? `${leave.employee.firstName} ${leave.employee.lastName ?? ""}`.trim()
      : leave.employeeName ?? "Employee";

  const handleConfirm = () => {
    if (isReject && !remarks.trim()) {
      setRemarksError("Remarks are required when rejecting a leave request.");
      textareaRef.current?.focus();
      return;
    }
    onConfirm(remarks.trim());
  };

  return (
    // Overlay
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="leave-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Panel */}
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-3">
            {isReject ? (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50">
                <AlertTriangle size={18} className="text-red-600" />
              </div>
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-50">
                <CheckCircle size={18} className="text-green-600" />
              </div>
            )}
            <h2
              id="leave-modal-title"
              className="text-base font-semibold text-gray-950"
            >
              {isReject ? "Reject Leave Request" : "Approve Leave Request"}
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
          {/* Leave summary */}
          <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 space-y-1.5">
            <p className="text-sm font-semibold text-gray-900">{employeeName}</p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">{leave.leaveType}</span>
              {" · "}
              {leave.totalDays} day{leave.totalDays !== 1 ? "s" : ""}
            </p>
            {leave.reason && (
              <p className="text-xs italic text-gray-500">"{leave.reason}"</p>
            )}
          </div>

          {/* Remarks field — only for reject */}
          {isReject && (
            <div className="space-y-1.5">
              <label
                htmlFor="reject-remarks"
                className="block text-sm font-semibold text-gray-700"
              >
                Remarks{" "}
                <span className="text-red-500">*</span>
                <span className="ml-1 font-normal text-gray-400">(required)</span>
              </label>
              <textarea
                id="reject-remarks"
                ref={textareaRef}
                value={remarks}
                onChange={(e) => {
                  setRemarks(e.target.value.slice(0, 500));
                  if (e.target.value.trim()) setRemarksError("");
                }}
                placeholder="Enter reason for rejection (e.g. project deadline conflict)…"
                rows={3}
                className={`w-full resize-none rounded-xl border px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                  remarksError
                    ? "border-red-300 focus:ring-red-200"
                    : "border-gray-200 focus:ring-gray-300"
                }`}
              />
              <div className="flex items-center justify-between">
                {remarksError ? (
                  <p className="text-xs text-red-600">{remarksError}</p>
                ) : (
                  <span />
                )}
                <p className="text-xs text-gray-400">
                  {remarks.length}/500
                </p>
              </div>
            </div>
          )}

          {/* Approve confirmation message */}
          {!isReject && (
            <p className="text-sm text-gray-600">
              Are you sure you want to{" "}
              <span className="font-semibold text-green-700">approve</span>{" "}
              this leave request for{" "}
              <span className="font-semibold text-gray-900">{employeeName}</span>?
              This action cannot be undone.
            </p>
          )}
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
            id={isReject ? "confirm-reject-btn" : "confirm-approve-btn"}
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className={`inline-flex h-9 items-center gap-2 rounded-lg px-4 text-sm font-semibold text-white disabled:opacity-60 transition-colors ${
              isReject
                ? "bg-red-600 hover:bg-red-700"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            {isReject ? "Reject Request" : "Approve Request"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeaveActionModal;
