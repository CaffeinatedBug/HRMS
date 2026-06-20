import { useCallback, useMemo, useState } from "react";
import dayjs from "dayjs";
import { Send, AlertCircle } from "lucide-react";
import { leaveService } from "../../services/leaveService";
import { getErrorMessage } from "../../utils/helper";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const LEAVE_TYPES = [
  "Casual Leave",
  "Sick Leave",
  "Earned Leave",
  "Maternity Leave",
  "Paternity Leave",
  "Unpaid Leave",
];

const INITIAL_FORM = {
  leaveType: "",
  fromDate: "",
  toDate: "",
  reason: "",
};

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

/** Calculates calendar day difference inclusive of both endpoints. */
const calcTotalDays = (from, to) => {
  if (!from || !to) return 0;
  const diff = dayjs(to).diff(dayjs(from), "day");
  return diff < 0 ? 0 : diff + 1;
};

/** Returns today's date string in YYYY-MM-DD format for min date validation. */
const todayISO = () => dayjs().format("YYYY-MM-DD");

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const FormField = ({ label, required, children }) => (
  <div>
    <label className="mb-2 block text-sm font-semibold text-gray-700">
      {label}
      {required && <span className="ml-1 text-red-500">*</span>}
    </label>
    {children}
  </div>
);

// ---------------------------------------------------------------------------
// ApplyLeave Page
// ---------------------------------------------------------------------------

const ApplyLeave = () => {
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const totalDays = useMemo(
    () => calcTotalDays(form.fromDate, form.toDate),
    [form.fromDate, form.toDate]
  );

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear messages on any edit
    setSuccessMessage("");
    setErrorMessage("");
  }, []);

  const isFormValid =
    form.leaveType &&
    form.fromDate &&
    form.toDate &&
    form.reason.trim().length > 0 &&
    totalDays > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setSubmitting(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const payload = {
        leaveType: form.leaveType,
        fromDate: form.fromDate,
        toDate: form.toDate,
        totalDays,
        reason: form.reason.trim(),
      };

      const res = await leaveService.apply(payload);
      setSuccessMessage(res?.message ?? "Leave applied successfully!");
      setForm(INITIAL_FORM);
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-950">Apply Leave</h1>
        <p className="mt-1 text-sm text-gray-600">
          Fill in the form below to submit a leave request to HR.
        </p>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Leave type */}
          <FormField label="Leave Type" required>
            <select
              id="leaveType"
              name="leaveType"
              value={form.leaveType}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Select leave type</option>
              {LEAVE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </FormField>

          {/* Date range */}
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="From Date" required>
              <input
                id="fromDate"
                type="date"
                name="fromDate"
                value={form.fromDate}
                min={todayISO()}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </FormField>

            <FormField label="To Date" required>
              <input
                id="toDate"
                type="date"
                name="toDate"
                value={form.toDate}
                min={form.fromDate || todayISO()}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </FormField>
          </div>

          {/* Total days calculated */}
          {totalDays > 0 && (
            <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
              <p className="text-sm font-semibold text-blue-700">
                Total: {totalDays} day{totalDays !== 1 ? "s" : ""}
              </p>
            </div>
          )}

          {/* Reason */}
          <FormField label="Reason" required>
            <textarea
              id="reason"
              name="reason"
              value={form.reason}
              onChange={handleChange}
              rows={4}
              placeholder="Briefly describe the reason for your leave..."
              className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </FormField>

          {/* Feedback messages */}
          {successMessage && (
            <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
              {successMessage}
            </div>
          )}

          {errorMessage && (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
              <p className="text-sm font-medium text-red-700">{errorMessage}</p>
            </div>
          )}

          <button
            id="submit-leave-btn"
            type="submit"
            disabled={!isFormValid || submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send size={16} />
            {submitting ? "Submitting..." : "Submit Leave Request"}
          </button>
        </form>
      </section>
    </div>
  );
};

export default ApplyLeave;
