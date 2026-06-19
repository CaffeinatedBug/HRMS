import { useCallback, useMemo, useState } from "react";
import dayjs from "dayjs";
import { ChevronLeft, ChevronRight } from "lucide-react";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

/**
 * Build a Set of "YYYY-MM-DD" strings for fast O(1) membership checks.
 *
 * @param {Array<Object>} items
 * @param {string[]} dateKeys - candidate property names to read the date from
 * @returns {Set<string>}
 */
const buildDateSet = (items, dateKeys) => {
  const set = new Set();
  for (const item of items) {
    const raw = dateKeys.reduce((found, key) => found ?? item[key], undefined);
    if (raw) set.add(dayjs(raw).format("YYYY-MM-DD"));
  }
  return set;
};

/**
 * Returns the Tailwind classes for a single calendar day cell.
 *
 * @param {{ isToday: boolean, isHoliday: boolean, isLeave: boolean }} status
 * @returns {string}
 */
const getDayCellClass = ({ isToday, isHoliday, isLeave }) => {
  if (isToday) {
    return "bg-blue-600 text-white hover:bg-blue-700";
  }
  if (isHoliday) {
    return "border border-green-200 bg-green-50 text-green-700 hover:bg-green-100";
  }
  if (isLeave) {
    return "border border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100";
  }
  return "text-gray-700 hover:bg-gray-50";
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const LegendItem = ({ color, label }) => (
  <div className="flex items-center gap-1.5">
    <div className={`h-3 w-3 rounded-full ${color}`} />
    <span>{label}</span>
  </div>
);

const DayCell = ({ day, isToday, isHoliday, isLeave }) => {
  const dotColor = isHoliday ? "bg-green-500" : "bg-orange-500";
  const showDot = (isHoliday || isLeave) && !isToday;

  return (
    <div
      className={`mx-auto flex h-12 w-12 cursor-pointer flex-col items-center justify-center rounded-lg transition-colors ${getDayCellClass({ isToday, isHoliday, isLeave })}`}
    >
      <span className="text-sm font-medium">{day}</span>
      {showDot && <div className={`mt-1 h-1.5 w-1.5 rounded-full ${dotColor}`} />}
    </div>
  );
};

// ---------------------------------------------------------------------------
// CalendarView
// ---------------------------------------------------------------------------

/**
 * A lightweight monthly calendar built on top of dayjs.
 *
 * Highlights:
 *  - Today    → blue fill
 *  - Holidays → green tint + green dot
 *  - Leaves   → orange tint + orange dot
 *
 * Date lookup is O(1) via pre-built Sets — no per-day linear scans.
 *
 * @param {{ holidays: Object[], leaves: Object[] }} props
 */
const CalendarView = ({ holidays = [], leaves = [] }) => {
  const [viewDate, setViewDate] = useState(() => dayjs());

  // Stable today string — computed once on mount, not inside render loops.
  const todayStr = useMemo(() => dayjs().format("YYYY-MM-DD"), []);

  // Derived calendar grid values
  const { daysInMonth, firstDayOfWeek } = useMemo(() => ({
    daysInMonth: viewDate.daysInMonth(),
    firstDayOfWeek: viewDate.startOf("month").day(),
  }), [viewDate]);

  // O(1) date membership sets — recomputed only when input arrays change.
  const holidaySet = useMemo(
    () => buildDateSet(holidays, ["date", "holidayDate"]),
    [holidays]
  );
  const leaveSet = useMemo(
    () => buildDateSet(leaves, ["date", "leaveDate"]),
    [leaves]
  );

  const goToPrevMonth = useCallback(
    () => setViewDate((d) => d.subtract(1, "month")),
    []
  );
  const goToNextMonth = useCallback(
    () => setViewDate((d) => d.add(1, "month")),
    []
  );

  const getDayStatus = useCallback(
    (day) => {
      const dateStr = viewDate.date(day).format("YYYY-MM-DD");
      return {
        isToday: dateStr === todayStr,
        isHoliday: holidaySet.has(dateStr),
        isLeave: leaveSet.has(dateStr),
      };
    },
    [viewDate, todayStr, holidaySet, leaveSet]
  );

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-950">
          {viewDate.format("MMMM YYYY")}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={goToPrevMonth}
            aria-label="Previous month"
            className="rounded-full p-2 transition-colors hover:bg-gray-100"
          >
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
          <button
            onClick={goToNextMonth}
            aria-label="Next month"
            className="rounded-full p-2 transition-colors hover:bg-gray-100"
          >
            <ChevronRight size={20} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Weekday labels */}
      <div className="mb-2 grid grid-cols-7 gap-1 text-center">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="py-2 text-xs font-semibold text-gray-500">
            {label}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {Array.from({ length: firstDayOfWeek }, (_, i) => (
          <div key={`pad-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
          <DayCell key={day} day={day} {...getDayStatus(day)} />
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-center gap-4 text-xs text-gray-500">
        <LegendItem color="bg-blue-600" label="Today" />
        <LegendItem color="bg-green-500" label="Holiday" />
        <LegendItem color="bg-orange-500" label="Leave" />
      </div>
    </div>
  );
};

export default CalendarView;
