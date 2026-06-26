import { useCallback, useEffect, useState } from "react";
import dayjs from "dayjs";
import { Clock3, LogIn, LogOut, AlertCircle, WifiOff } from "lucide-react";
import { attendanceService } from "../../services/attendanceService";
import { getErrorMessage } from "../../utils/helper";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STATUS = {
  IDLE: "idle",
  LOADING: "loading",
  SUCCESS: "success",
  ERROR: "error",
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const TimeDisplay = ({ label, time }) => (
  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center">
    <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">{label}</p>
    <p className="mt-2 text-2xl font-bold text-gray-900">
      {time ? dayjs(time).format("hh:mm A") : "—"}
    </p>
    {time && (
      <p className="mt-1 text-xs text-gray-500">{dayjs(time).format("DD MMM YYYY")}</p>
    )}
  </div>
);

const StatBadge = ({ label, value, color = "blue" }) => {
  const colorMap = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    green: "bg-green-50 text-green-700 border-green-200",
    orange: "bg-orange-50 text-orange-700 border-orange-200",
  };
  return (
    <div className={`rounded-xl border px-4 py-3 text-center ${colorMap[color]}`}>
      <p className="text-xs font-semibold uppercase tracking-widest opacity-70">{label}</p>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Attendance Page
// ---------------------------------------------------------------------------

const Attendance = () => {
  const [todayRecord, setTodayRecord] = useState(null);
  const [history, setHistory] = useState([]);
  const [fetchStatus, setFetchStatus] = useState(STATUS.LOADING);
  const [fetchError, setFetchError] = useState("");
  const [actionStatus, setActionStatus] = useState(STATUS.IDLE);
  const [actionMessage, setActionMessage] = useState("");
  // null = unknown, true = on office network, false = blocked
  const [officeNetwork, setOfficeNetwork] = useState(null);

  // ── Data fetching ──────────────────────────────────────────────────────

  const loadAttendanceData = useCallback(async () => {
    setFetchStatus(STATUS.LOADING);
    setFetchError("");

    try {
      const [todayRes, historyRes] = await Promise.all([
        attendanceService.getToday(),
        attendanceService.getHistory(),
      ]);

      setTodayRecord(todayRes?.attendance ?? null);
      setHistory(historyRes?.attendance ?? []);
      setOfficeNetwork(true);
      setFetchStatus(STATUS.SUCCESS);
    } catch (err) {
      setFetchError(getErrorMessage(err));
      setFetchStatus(STATUS.ERROR);
    }
  }, []);

  useEffect(() => {
    loadAttendanceData();
  }, [loadAttendanceData]);

  // ── Punch actions ──────────────────────────────────────────────────────

  const handlePunch = useCallback(
    async (type) => {
      setActionStatus(STATUS.LOADING);
      setActionMessage("");

      try {
        const res =
          type === "in"
            ? await attendanceService.punchIn({})
            : await attendanceService.punchOut({});

        setActionMessage(res?.message ?? (type === "in" ? "Punched In!" : "Punched Out!"));
        setActionStatus(STATUS.SUCCESS);
        await loadAttendanceData();
      } catch (err) {
        // 403 = IP not whitelisted
        if (err?.status === 403 || err?.response?.status === 403) {
          setOfficeNetwork(false);
          setActionStatus(STATUS.IDLE);
        } else {
          setActionMessage(getErrorMessage(err));
          setActionStatus(STATUS.ERROR);
        }
      }
    },
    [loadAttendanceData]
  );

  // ── Derived state ──────────────────────────────────────────────────────

  const hasPunchedIn = Boolean(todayRecord?.punchIn);
  const hasPunchedOut = Boolean(todayRecord?.punchOut);
  const onNetwork = officeNetwork === true;
  const canPunchIn = !hasPunchedIn && onNetwork;
  const canPunchOut = hasPunchedIn && !hasPunchedOut && onNetwork;

  const punchDisabledReason = !onNetwork
    ? "Connect to office Wi-Fi to punch attendance"
    : undefined;

  const totalHoursWorked = history.reduce(
    (sum, r) => sum + parseFloat(r.totalHours ?? 0),
    0
  );

  // ── Render ─────────────────────────────────────────────────────────────

  if (fetchStatus === STATUS.LOADING) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (fetchStatus === STATUS.ERROR) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="font-semibold text-red-700">Failed to load attendance data</p>
        </div>
        <p className="mt-1 text-sm text-red-600">{fetchError}</p>
        <button
          onClick={loadAttendanceData}
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
        <h1 className="text-2xl font-bold text-gray-950">Attendance</h1>
        <p className="mt-1 text-sm text-gray-600">
          Mark your attendance for today. Punch In/Out is restricted to office network.
        </p>
      </div>

      {/* ── Office network warning banner ── */}
      {officeNetwork === false && (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100">
              <WifiOff size={18} className="text-amber-600" />
            </div>
            <div>
              <p className="font-semibold text-amber-900">⚠ Attendance Unavailable</p>
              <p className="mt-1 text-sm text-amber-700">
                You are not connected to the office Wi-Fi or network.
                Punch In / Punch Out is restricted to whitelisted office IPs only.
              </p>
              <p className="mt-2 text-xs text-amber-600 font-medium">
                Connect to office network and refresh the page to enable attendance.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ── Today's punch card ── */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <Clock3 className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-950">
            Today — {dayjs().format("dddd, DD MMMM YYYY")}
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 mb-6">
          <TimeDisplay label="Punch In" time={todayRecord?.punchIn} />
          <TimeDisplay label="Punch Out" time={todayRecord?.punchOut} />
        </div>

        {todayRecord?.totalHours && (
          <div className="mb-6">
            <StatBadge
              label="Hours Worked Today"
              value={`${todayRecord.totalHours} hrs`}
              color="green"
            />
          </div>
        )}

        {/* Generic action message (non-403 errors / success) */}
        {actionMessage && (
          <div
            className={`mb-4 rounded-xl px-4 py-3 text-sm font-medium ${
              actionStatus === STATUS.ERROR
                ? "bg-red-50 text-red-700 border border-red-200"
                : "bg-green-50 text-green-700 border border-green-200"
            }`}
          >
            {actionMessage}
          </div>
        )}

        {/* Punch buttons — disabled when off office network */}
        <div className="flex gap-3">
          <button
            id="punch-in-btn"
            onClick={() => handlePunch("in")}
            disabled={!canPunchIn || actionStatus === STATUS.LOADING}
            title={punchDisabledReason}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <LogIn size={18} />
            {actionStatus === STATUS.LOADING ? "Processing..." : "Punch In"}
          </button>

          <button
            id="punch-out-btn"
            onClick={() => handlePunch("out")}
            disabled={!canPunchOut || actionStatus === STATUS.LOADING}
            title={punchDisabledReason}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <LogOut size={18} />
            {actionStatus === STATUS.LOADING ? "Processing..." : "Punch Out"}
          </button>
        </div>
      </section>

      {/* ── History ── */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-950">Attendance History</h2>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            {history.length} records
          </span>
        </div>

        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          <StatBadge label="Total Present Days" value={history.length} color="green" />
          <StatBadge
            label="Total Hours Worked"
            value={`${totalHoursWorked.toFixed(1)} hrs`}
            color="blue"
          />
        </div>

        {history.length === 0 ? (
          <p className="text-sm text-gray-600">No attendance history found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="py-3 text-left text-xs font-semibold uppercase tracking-widest text-gray-500">
                    Date
                  </th>
                  <th className="py-3 text-left text-xs font-semibold uppercase tracking-widest text-gray-500">
                    Punch In
                  </th>
                  <th className="py-3 text-left text-xs font-semibold uppercase tracking-widest text-gray-500">
                    Punch Out
                  </th>
                  <th className="py-3 text-left text-xs font-semibold uppercase tracking-widest text-gray-500">
                    Hours
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {history.map((record, i) => (
                  <tr key={record._id ?? i} className="hover:bg-gray-50">
                    <td className="py-3 font-medium text-gray-900">
                      {dayjs(record.date).format("DD MMM YYYY")}
                    </td>
                    <td className="py-3 text-gray-700">
                      {record.punchIn ? dayjs(record.punchIn).format("hh:mm A") : "—"}
                    </td>
                    <td className="py-3 text-gray-700">
                      {record.punchOut ? dayjs(record.punchOut).format("hh:mm A") : "—"}
                    </td>
                    <td className="py-3 text-gray-700">
                      {record.totalHours ? `${record.totalHours} hrs` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default Attendance;
