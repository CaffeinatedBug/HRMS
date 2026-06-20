import { useCallback, useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  MinusCircle,
  AlertCircle,
  CalendarDays,
} from "lucide-react";
import BaseApiManager from "../../api/BaseApiManager";
import { DASHBOARD } from "../../api/endpoints";
import { attendanceService } from "../../services/attendanceService";
import { getErrorMessage } from "../../utils/helper";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Day status types
const STATUS = {
  PRESENT:  "present",
  ABSENT:   "absent",
  WEEKEND:  "weekend",
  FUTURE:   "future",
  TODAY:    "today",
};

const STATUS_STYLE = {
  [STATUS.PRESENT]: {
    cell: "bg-green-500 text-white font-semibold",
    label: "Present",
    icon: CheckCircle,
    color: "text-green-600",
  },
  [STATUS.ABSENT]: {
    cell: "bg-red-400 text-white font-semibold",
    label: "Absent",
    icon: XCircle,
    color: "text-red-500",
  },
  [STATUS.WEEKEND]: {
    cell: "bg-gray-100 text-gray-400",
    label: "Weekend",
    icon: MinusCircle,
    color: "text-gray-400",
  },
  [STATUS.FUTURE]: {
    cell: "text-gray-300",
    label: "Upcoming",
    icon: MinusCircle,
    color: "text-gray-300",
  },
  [STATUS.TODAY]: {
    cell: "ring-2 ring-blue-600 ring-offset-1 font-bold text-blue-700",
    label: "Today",
    icon: CalendarDays,
    color: "text-blue-600",
  },
};

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

const todayStr = dayjs().format("YYYY-MM-DD");

/**
 * Builds a Set of present-date strings from the raw attendance array.
 */
const buildPresentSet = (records) =>
  new Set(records.map((r) => dayjs(r.date).format("YYYY-MM-DD")));

/**
 * Determines the display status for a given calendar day.
 */
const getDayStatus = (dateStr, presentSet, isCurrentMonth) => {
  if (!isCurrentMonth) return null;

  const d = dayjs(dateStr);
  const dow = d.day(); // 0=Sun, 6=Sat

  if (dateStr === todayStr) return STATUS.TODAY;
  if (dow === 0 || dow === 6) return STATUS.WEEKEND;
  if (d.isAfter(dayjs(), "day")) return STATUS.FUTURE;
  if (presentSet.has(dateStr)) return STATUS.PRESENT;
  return STATUS.ABSENT;
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const LegendItem = ({ statusKey }) => {
  const cfg = STATUS_STYLE[statusKey];
  const Icon = cfg.icon;
  return (
    <div className="flex items-center gap-1.5">
      <Icon size={14} className={cfg.color} />
      <span className="text-xs text-gray-600">{cfg.label}</span>
    </div>
  );
};

const StatBox = ({ label, count, color }) => {
  const colorMap = {
    green:  "bg-green-50 border-green-200 text-green-700",
    red:    "bg-red-50 border-red-200 text-red-700",
    gray:   "bg-gray-50 border-gray-200 text-gray-600",
    blue:   "bg-blue-50 border-blue-200 text-blue-700",
  };
  return (
    <div className={`rounded-xl border px-4 py-3 text-center ${colorMap[color]}`}>
      <p className="text-2xl font-bold">{count}</p>
      <p className="mt-0.5 text-xs font-semibold uppercase tracking-widest opacity-70">{label}</p>
    </div>
  );
};

// ---------------------------------------------------------------------------
// MonthlyAttendance Page
// ---------------------------------------------------------------------------

const MonthlyAttendance = () => {
  const [viewDate, setViewDate] = useState(() => dayjs().startOf("month"));
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // Use attendance history (all records) — filter client-side by month
      const res = await attendanceService.getHistory();
      setHistory(res?.attendance ?? []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const presentSet = useMemo(() => buildPresentSet(history), [history]);

  // Filter records for current view month
  const monthRecords = useMemo(() => {
    const prefix = viewDate.format("YYYY-MM");
    return history.filter((r) => dayjs(r.date).format("YYYY-MM") === prefix);
  }, [history, viewDate]);

  const stats = useMemo(() => {
    const daysInMonth = viewDate.daysInMonth();
    const today = dayjs();
    const isCurrentMonth = viewDate.isSame(today, "month");
    const lastDay = isCurrentMonth ? today.date() : daysInMonth;

    let weekdays = 0;
    for (let d = 1; d <= lastDay; d++) {
      const dow = viewDate.date(d).day();
      if (dow !== 0 && dow !== 6) weekdays++;
    }

    const present = monthRecords.length;
    const absent = Math.max(0, weekdays - present);

    return { present, absent, weekdays, totalHours: monthRecords.reduce((s, r) => s + parseFloat(r.totalHours ?? 0), 0) };
  }, [viewDate, monthRecords]);

  const daysInMonth = viewDate.daysInMonth();
  const firstDayOfWeek = viewDate.startOf("month").day();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-950">Monthly Attendance</h1>
        <p className="mt-1 text-sm text-gray-600">
          Visual calendar view of your attendance. Navigate months to see your history.
        </p>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="font-semibold text-red-700">Failed to load attendance</p>
          </div>
          <p className="mt-1 text-sm text-red-600">{error}</p>
          <button onClick={loadHistory} className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
            Try again
          </button>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-4">
            <StatBox label="Present Days"  count={stats.present}  color="green" />
            <StatBox label="Absent Days"   count={stats.absent}   color="red" />
            <StatBox label="Working Days"  count={stats.weekdays} color="gray" />
            <StatBox label="Hours Worked"  count={`${stats.totalHours.toFixed(1)}h`} color="blue" />
          </div>

          {/* Calendar */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            {/* Header */}
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-950">
                {viewDate.format("MMMM YYYY")}
              </h2>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setViewDate((d) => d.subtract(1, "month"))}
                  aria-label="Previous month"
                  className="rounded-full p-2 transition-colors hover:bg-gray-100"
                >
                  <ChevronLeft size={20} className="text-gray-600" />
                </button>
                <button
                  onClick={() => setViewDate(dayjs().startOf("month"))}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Today
                </button>
                <button
                  onClick={() => setViewDate((d) => d.add(1, "month"))}
                  aria-label="Next month"
                  disabled={viewDate.isSame(dayjs().startOf("month"), "month")}
                  className="rounded-full p-2 transition-colors hover:bg-gray-100 disabled:opacity-40"
                >
                  <ChevronRight size={20} className="text-gray-600" />
                </button>
              </div>
            </div>

            {/* Weekday headers */}
            <div className="mb-2 grid grid-cols-7 gap-2 text-center">
              {WEEKDAY_LABELS.map((d) => (
                <div key={d} className="py-1 text-xs font-semibold text-gray-400">
                  {d}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: firstDayOfWeek }, (_, i) => (
                <div key={`pad-${i}`} />
              ))}

              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const dateStr = viewDate.date(day).format("YYYY-MM-DD");
                const statusKey = getDayStatus(dateStr, presentSet, true);
                const style = statusKey ? STATUS_STYLE[statusKey] : null;

                return (
                  <div
                    key={day}
                    title={style?.label}
                    className={`mx-auto flex h-10 w-10 items-center justify-center rounded-full text-sm transition-colors ${
                      style?.cell ?? "text-gray-300"
                    }`}
                  >
                    {day}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-gray-100 pt-4">
              <LegendItem statusKey={STATUS.PRESENT} />
              <LegendItem statusKey={STATUS.ABSENT} />
              <LegendItem statusKey={STATUS.WEEKEND} />
              <LegendItem statusKey={STATUS.TODAY} />
              <LegendItem statusKey={STATUS.FUTURE} />
            </div>
          </section>

          {/* Day-level detail for this month */}
          {monthRecords.length > 0 && (
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-semibold text-gray-950">
                Punch Records — {viewDate.format("MMMM YYYY")}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {["Date", "Punch In", "Punch Out", "Hours"].map((h) => (
                        <th key={h} className="py-3 text-left text-xs font-semibold uppercase tracking-widest text-gray-400">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {monthRecords
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .map((record, i) => (
                        <tr key={record._id ?? i} className="hover:bg-gray-50">
                          <td className="py-2.5 font-medium text-gray-900">
                            {dayjs(record.date).format("ddd, DD MMM")}
                          </td>
                          <td className="py-2.5 text-gray-700">
                            {record.punchIn ? dayjs(record.punchIn).format("hh:mm A") : "—"}
                          </td>
                          <td className="py-2.5 text-gray-700">
                            {record.punchOut ? dayjs(record.punchOut).format("hh:mm A") : "—"}
                          </td>
                          <td className="py-2.5 text-gray-700">
                            {record.totalHours ? `${record.totalHours} hrs` : "—"}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default MonthlyAttendance;
