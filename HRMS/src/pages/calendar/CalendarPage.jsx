import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  AlertCircle,
} from "lucide-react";
import BaseApiManager from "../../api/BaseApiManager";
import { getErrorMessage } from "../../utils/helper";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const TYPE_CONFIG = {
  holiday:  { color: "bg-green-500",  bg: "bg-green-50  border-green-200",  text: "text-green-800",  label: "Holiday",  dot: "bg-green-500"  },
  birthday: { color: "bg-blue-500",   bg: "bg-blue-50   border-blue-200",   text: "text-blue-800",   label: "Birthday", dot: "bg-blue-500"   },
  leave:    { color: "bg-yellow-400", bg: "bg-yellow-50 border-yellow-200", text: "text-yellow-800", label: "Leave",    dot: "bg-yellow-400" },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Build a map: "YYYY-MM-DD" → event[]
 */
const buildEventMap = (events) => {
  const map = new Map();
  for (const evt of events) {
    const key = dayjs(evt.date).format("YYYY-MM-DD");
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(evt);
  }
  return map;
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const LegendDot = ({ color, label }) => (
  <div className="flex items-center gap-1.5">
    <div className={`h-2.5 w-2.5 rounded-full ${color}`} />
    <span className="text-xs text-gray-500">{label}</span>
  </div>
);

const EventBadge = ({ type, label }) => {
  const cfg = TYPE_CONFIG[type] ?? TYPE_CONFIG.holiday;
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold leading-tight border ${cfg.bg} ${cfg.text}`}
    >
      {label}
    </span>
  );
};

const DayCell = ({ day, dateStr, todayStr, events, onSelect, isSelected }) => {
  const isToday = dateStr === todayStr;
  const hasEvents = events.length > 0;

  // Determine primary highlight (priority: holiday > birthday > leave)
  const primary = events.find((e) => e.type === "holiday")
    ?? events.find((e) => e.type === "birthday")
    ?? events[0];

  const dotColor = primary ? TYPE_CONFIG[primary.type]?.dot : null;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(dateStr, events)}
      onKeyDown={(e) => e.key === "Enter" && onSelect(dateStr, events)}
      className={`mx-auto flex h-12 w-12 cursor-pointer flex-col items-center justify-center rounded-xl transition-all select-none ${
        isSelected
          ? "ring-2 ring-blue-500 ring-offset-1"
          : ""
      } ${
        isToday
          ? "bg-blue-600 text-white font-bold shadow"
          : hasEvents
          ? "hover:bg-gray-50"
          : "text-gray-700 hover:bg-gray-50"
      }`}
    >
      <span className="text-sm font-medium">{day}</span>
      {dotColor && !isToday && (
        <div className={`mt-0.5 h-1.5 w-1.5 rounded-full ${dotColor}`} />
      )}
      {hasEvents && isToday && (
        <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-white/70" />
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// CalendarPage
// ---------------------------------------------------------------------------

const CalendarPage = () => {
  const { user } = useSelector((state) => state.auth);
  const [viewDate, setViewDate] = useState(dayjs());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvents, setSelectedEvents] = useState([]);

  const todayStr = useMemo(() => dayjs().format("YYYY-MM-DD"), []);

  // ── Fetch events for current view month ────────────────────────────────

  const fetchEvents = useCallback(async (date) => {
    setLoading(true);
    setError("");
    try {
      const res = await BaseApiManager.get("/calendar/events", {
        year: date.year(),
        month: date.month() + 1,
      });
      setEvents(res?.events ?? []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents(viewDate);
  }, [fetchEvents, viewDate]);

  // ── Build event map ─────────────────────────────────────────────────────

  const eventMap = useMemo(() => buildEventMap(events), [events]);

  // ── Calendar grid ───────────────────────────────────────────────────────

  const { daysInMonth, firstDayOfWeek } = useMemo(
    () => ({
      daysInMonth: viewDate.daysInMonth(),
      firstDayOfWeek: viewDate.startOf("month").day(),
    }),
    [viewDate]
  );

  const handleSelectDate = useCallback((dateStr, evts) => {
    setSelectedDate(dateStr);
    setSelectedEvents(evts);
  }, []);

  const goToPrev = () => {
    const d = viewDate.subtract(1, "month");
    setViewDate(d);
    setSelectedDate(null);
    setSelectedEvents([]);
  };

  const goToNext = () => {
    const d = viewDate.add(1, "month");
    setViewDate(d);
    setSelectedDate(null);
    setSelectedEvents([]);
  };

  const goToToday = () => {
    setViewDate(dayjs());
    setSelectedDate(todayStr);
    setSelectedEvents(eventMap.get(todayStr) ?? []);
  };

  // ── Upcoming events sidebar ─────────────────────────────────────────────

  const upcomingEvents = useMemo(() => {
    const now = dayjs().startOf("day");
    return events
      .filter((e) => dayjs(e.date).isSame(now) || dayjs(e.date).isAfter(now))
      .slice(0, 8);
  }, [events]);

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-950">Calendar</h1>
        <p className="mt-1 text-sm text-gray-500">
          Holidays, leaves, and birthdays — all in one place.
          {user?.role === "HR" && " Showing all employee leaves."}
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <AlertCircle size={16} className="text-red-500" />
          <p className="text-sm text-red-700">{error}</p>
          <button
            onClick={() => fetchEvents(viewDate)}
            className="ml-auto text-xs font-semibold text-red-600 hover:underline"
          >
            Retry
          </button>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        {/* ── Calendar ── */}
        <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          {/* Navigation */}
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-950">
              {viewDate.format("MMMM YYYY")}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={goToToday}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition"
              >
                Today
              </button>
              <button
                onClick={goToPrev}
                aria-label="Previous month"
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100 transition"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={goToNext}
                aria-label="Next month"
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100 transition"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Weekday labels */}
          <div className="mb-2 grid grid-cols-7 gap-1 text-center">
            {WEEKDAY_LABELS.map((l) => (
              <div key={l} className="py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {l}
              </div>
            ))}
          </div>

          {/* Day cells */}
          {loading ? (
            <div className="flex h-56 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1 text-center">
              {Array.from({ length: firstDayOfWeek }, (_, i) => (
                <div key={`pad-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const dateStr = viewDate.date(day).format("YYYY-MM-DD");
                const dayEvents = eventMap.get(dateStr) ?? [];
                return (
                  <DayCell
                    key={day}
                    day={day}
                    dateStr={dateStr}
                    todayStr={todayStr}
                    events={dayEvents}
                    onSelect={handleSelectDate}
                    isSelected={selectedDate === dateStr}
                  />
                );
              })}
            </div>
          )}

          {/* Legend */}
          <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-gray-100 pt-4">
            <LegendDot color="bg-blue-600" label="Today" />
            <LegendDot color="bg-green-500" label="Holiday" />
            <LegendDot color="bg-blue-500" label="Birthday" />
            <LegendDot color="bg-yellow-400" label="Leave" />
          </div>
        </div>

        {/* ── Side panel ── */}
        <div className="space-y-4">
          {/* Selected day events */}
          {selectedDate && (
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="mb-3 text-sm font-bold text-gray-950">
                {dayjs(selectedDate).format("dddd, DD MMMM")}
              </h3>
              {selectedEvents.length === 0 ? (
                <p className="text-sm text-gray-400">No events on this day.</p>
              ) : (
                <div className="space-y-2.5">
                  {selectedEvents.map((evt, i) => (
                    <div key={evt.id ?? i} className="flex items-start gap-2">
                      <div
                        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                          TYPE_CONFIG[evt.type]?.dot ?? "bg-gray-400"
                        }`}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 leading-snug">
                          {evt.title}
                        </p>
                        <EventBadge type={evt.type} label={TYPE_CONFIG[evt.type]?.label ?? evt.type} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Upcoming events */}
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <CalendarDays size={15} className="text-gray-400" />
              <h3 className="text-sm font-bold text-gray-950">Upcoming Events</h3>
            </div>

            {loading ? (
              <div className="space-y-2.5">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="h-8 w-8 rounded-lg bg-gray-100 shrink-0" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-3 w-3/4 rounded bg-gray-100" />
                      <div className="h-2.5 w-1/2 rounded bg-gray-100" />
                    </div>
                  </div>
                ))}
              </div>
            ) : upcomingEvents.length === 0 ? (
              <p className="text-sm text-gray-400">No upcoming events this month.</p>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map((evt, i) => {
                  const cfg = TYPE_CONFIG[evt.type] ?? TYPE_CONFIG.holiday;
                  return (
                    <button
                      key={evt.id ?? i}
                      type="button"
                      onClick={() => handleSelectDate(dayjs(evt.date).format("YYYY-MM-DD"), [evt])}
                      className="flex w-full items-center gap-3 text-left hover:bg-gray-50 rounded-lg p-1.5 -mx-1.5 transition"
                    >
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-xs font-bold ${cfg.bg} ${cfg.text}`}
                      >
                        {dayjs(evt.date).format("DD")}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-900">
                          {evt.title}
                        </p>
                        <p className="text-xs text-gray-400">
                          {dayjs(evt.date).format("ddd, DD MMM")}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
