import { useCallback, useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Flag,
  Building2,
  Star,
  AlertCircle,
} from "lucide-react";
import { holidayService } from "../../services/holidayService";
import { fetchIndiaHolidays } from "../../services/calendarificService";
import { getErrorMessage } from "../../utils/helper";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const TYPE_CONFIG = {
  National: {
    label: "National Holiday",
    calendarClass: "bg-orange-500 text-white",
    badgeClass: "bg-orange-50 text-orange-700 border-orange-200",
    icon: Flag,
  },
  Festival: {
    label: "Festival",
    calendarClass: "bg-purple-500 text-white",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
    icon: Star,
  },
  Company: {
    label: "Company Holiday",
    calendarClass: "bg-blue-500 text-white",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
    icon: Building2,
  },
  Optional: {
    label: "Optional",
    calendarClass: "bg-gray-400 text-white",
    badgeClass: "bg-gray-50 text-gray-600 border-gray-200",
    icon: Calendar,
  },
};

const todayStr = dayjs().format("YYYY-MM-DD");

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

const normaliseBackendHoliday = (h) => ({
  date: dayjs(h.holidayDate).format("YYYY-MM-DD"),
  name: h.title ?? h.holidayName ?? "Holiday",
  description: h.description ?? "",
  type: h.holidayType ?? "Company",
  source: "company",
  isPaid: h.isPaidHoliday ?? true,
});

const buildDateMap = (holidays) => {
  const map = new Map();
  const sorted = [
    ...holidays.filter((h) => h.source === "national"),
    ...holidays.filter((h) => h.source === "company"),
  ];
  for (const h of sorted) {
    map.set(h.date, h);
  }
  return map;
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const TypeBadge = ({ type }) => {
  const cfg = TYPE_CONFIG[type] ?? TYPE_CONFIG.Optional;
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${cfg.badgeClass}`}
    >
      <Icon size={11} />
      {cfg.label}
    </span>
  );
};

const LegendItem = ({ type, label }) => {
  const cfg = TYPE_CONFIG[type] ?? TYPE_CONFIG.Optional;
  return (
    <div className="flex items-center gap-1.5">
      <div className={`h-3 w-3 rounded-full ${cfg.calendarClass}`} />
      <span className="text-xs text-gray-600">{label}</span>
    </div>
  );
};

const HolidayListItem = ({ holiday }) => (
  <article className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 transition hover:bg-gray-100">
    <div className="min-w-0">
      <p className="font-semibold text-gray-900">{holiday.name}</p>
      <p className="mt-0.5 text-sm text-gray-500">
        {dayjs(holiday.date).format("dddd, DD MMMM YYYY")}
      </p>
      {holiday.source === "company" && (
        <p className="mt-0.5 text-xs text-gray-400">
          {holiday.isPaid ? "Paid holiday" : "Unpaid holiday"}
        </p>
      )}
    </div>
    <TypeBadge type={holiday.type} />
  </article>
);

// ---------------------------------------------------------------------------
// Calendar sub-component
// ---------------------------------------------------------------------------

const HolidayCalendar = ({ dateMap, viewDate, onPrev, onNext }) => {
  const daysInMonth = viewDate.daysInMonth();
  const firstDayOfWeek = viewDate.startOf("month").day();

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-950">
          {viewDate.format("MMMM YYYY")}
        </h2>
        <div className="flex items-center gap-1">
          <button
            onClick={onPrev}
            aria-label="Previous month"
            className="rounded-full p-2 transition-colors hover:bg-gray-100"
          >
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
          <button
            onClick={onNext}
            aria-label="Next month"
            className="rounded-full p-2 transition-colors hover:bg-gray-100"
          >
            <ChevronRight size={20} className="text-gray-600" />
          </button>
        </div>
      </div>

      <div className="mb-1 grid grid-cols-7 gap-1 text-center">
        {WEEKDAY_LABELS.map((d) => (
          <div key={d} className="py-2 text-xs font-semibold text-gray-400">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDayOfWeek }, (_, i) => (
          <div key={`pad-${i}`} />
        ))}

        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const dateStr = viewDate.date(day).format("YYYY-MM-DD");
          const holiday = dateMap.get(dateStr);
          const isToday = dateStr === todayStr;
          const cfg = holiday ? (TYPE_CONFIG[holiday.type] ?? TYPE_CONFIG.Optional) : null;

          return (
            <div
              key={day}
              title={holiday?.name}
              className={`relative mx-auto flex h-10 w-10 flex-col items-center justify-center rounded-full text-sm font-medium transition-colors
                ${isToday && !holiday ? "ring-2 ring-blue-600 ring-offset-1 font-bold text-blue-700" : ""}
                ${holiday ? `${cfg.calendarClass} cursor-pointer hover:opacity-90` : "text-gray-700 hover:bg-gray-100"}
              `}
            >
              {day}
              {isToday && holiday && (
                <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-blue-600" />
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-gray-100 pt-4">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full ring-2 ring-blue-600" />
          <span className="text-xs text-gray-600">Today</span>
        </div>
        <LegendItem type="National" label="National / Gazetted" />
        <LegendItem type="Festival" label="Festival" />
        <LegendItem type="Company" label="Company Holiday" />
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Holidays Page
// ---------------------------------------------------------------------------

const Holidays = () => {
  const [viewDate, setViewDate] = useState(() => dayjs());
  const [companyHolidays, setCompanyHolidays] = useState([]);
  const [nationalHolidays, setNationalHolidays] = useState([]);
  const [loadingCompany, setLoadingCompany] = useState(true);
  const [loadingNational, setLoadingNational] = useState(true);
  const [companyError, setCompanyError] = useState("");
  const [nationalError, setNationalError] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const fetchCompanyHolidays = useCallback(async () => {
    setLoadingCompany(true);
    setCompanyError("");
    try {
      const res = await holidayService.getAll();
      setCompanyHolidays((res?.holidays ?? []).map(normaliseBackendHoliday));
    } catch (err) {
      setCompanyError(getErrorMessage(err));
    } finally {
      setLoadingCompany(false);
    }
  }, []);

  const fetchNationalHolidays = useCallback(async (year) => {
    setLoadingNational(true);
    setNationalError("");
    try {
      const holidays = await fetchIndiaHolidays(year);
      setNationalHolidays(holidays);
    } catch (err) {
      setNationalError(getErrorMessage(err));
    } finally {
      setLoadingNational(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanyHolidays();
  }, [fetchCompanyHolidays]);

  useEffect(() => {
    fetchNationalHolidays(viewDate.year());
  }, [fetchNationalHolidays, viewDate.year()]);

  const allHolidays = useMemo(() => {
    const companyDates = new Set(companyHolidays.map((h) => h.date));
    const filteredNational = nationalHolidays.filter((h) => !companyDates.has(h.date));
    return [...companyHolidays, ...filteredNational].sort((a, b) =>
      a.date.localeCompare(b.date)
    );
  }, [companyHolidays, nationalHolidays]);

  const monthHolidays = useMemo(() => {
    const prefix = viewDate.format("YYYY-MM");
    return allHolidays.filter((h) => h.date.startsWith(prefix));
  }, [allHolidays, viewDate]);

  const filteredList = useMemo(() => {
    if (activeTab === "national")
      return allHolidays.filter((h) => h.source === "national");
    if (activeTab === "company")
      return allHolidays.filter((h) => h.source === "company");
    return allHolidays;
  }, [allHolidays, activeTab]);

  const dateMap = useMemo(() => buildDateMap(monthHolidays), [monthHolidays]);

  const goToPrev = useCallback(() => setViewDate((d) => d.subtract(1, "month")), []);
  const goToNext = useCallback(() => setViewDate((d) => d.add(1, "month")), []);

  const isLoading = loadingCompany || loadingNational;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-950">Holidays</h1>
        <p className="mt-1 text-sm text-gray-600">
          India's national holidays (via Calendarific) and company-specific holidays.
        </p>
      </div>

      <div className="space-y-2">
        {nationalError && (
          <div className="flex items-center gap-3 rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3">
            <AlertCircle size={16} className="shrink-0 text-yellow-600" />
            <p className="text-sm text-yellow-700">
              Could not load India national holidays: {nationalError}
            </p>
          </div>
        )}
        {companyError && (
          <div className="flex items-center gap-3 rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3">
            <AlertCircle size={16} className="shrink-0 text-yellow-600" />
            <p className="text-sm text-yellow-700">
              Could not load company holidays: {companyError}
            </p>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <HolidayCalendar
              dateMap={dateMap}
              viewDate={viewDate}
              onPrev={goToPrev}
              onNext={goToNext}
            />

            {monthHolidays.length > 0 && (
              <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <h3 className="mb-3 font-semibold text-gray-800">
                  Holidays in {viewDate.format("MMMM YYYY")}
                </h3>
                <div className="space-y-2">
                  {monthHolidays.map((h, i) => (
                    <HolidayListItem key={`${h.date}-${i}`} holiday={h} />
                  ))}
                </div>
              </section>
            )}

            {monthHolidays.length === 0 && (
              <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
                <p className="text-sm text-gray-500">No holidays in {viewDate.format("MMMM YYYY")}.</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <section className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="flex border-b border-gray-100">
                {[
                  { key: "all", label: "All" },
                  { key: "national", label: "National" },
                  { key: "company", label: "Company" },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`flex-1 py-3 text-xs font-semibold transition-colors ${
                      activeTab === key
                        ? "border-b-2 border-blue-600 text-blue-700"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="max-h-[520px] overflow-y-auto p-4 space-y-2">
                {filteredList.length === 0 ? (
                  <p className="py-8 text-center text-sm text-gray-500">No holidays to show.</p>
                ) : (
                  filteredList.map((h, i) => (
                    <HolidayListItem key={`${h.date}-list-${i}`} holiday={h} />
                  ))
                )}
              </div>
            </section>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-orange-200 bg-orange-50 p-3 text-center">
                <p className="text-2xl font-bold text-orange-700">
                  {allHolidays.filter((h) => h.source === "national").length}
                </p>
                <p className="mt-0.5 text-xs font-semibold text-orange-600">National</p>
              </div>
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-center">
                <p className="text-2xl font-bold text-blue-700">
                  {allHolidays.filter((h) => h.source === "company").length}
                </p>
                <p className="mt-0.5 text-xs font-semibold text-blue-600">Company</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Holidays;
