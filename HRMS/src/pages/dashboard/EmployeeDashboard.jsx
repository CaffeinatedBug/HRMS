import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock3, BellRing } from "lucide-react";
import dayjs from "dayjs";

import AsyncPageState from "../../components/common/AsyncPageState";
import StatsCard from "../../components/dashboard/StatsCard";
import CalendarView from "../../components/dashboard/CalendarView";
import { dashboardService } from "../../services/dashboardService";
import { getErrorMessage } from "../../utils/helper";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STAT_CARD_CONFIG = [
  {
    key: "hasPunchedIn",
    label: "Today's Attendance",
    hint: "Your punch status for today",
    icon: Clock3,
  },
  {
    key: "leaveCount",
    label: "Total Leaves",
    hint: "Your total leave applications",
    icon: CalendarDays,
  },
  {
    key: "unreadNotifications",
    label: "Notifications",
    hint: "Unread notifications",
    icon: BellRing,
  },
];

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

/**
 * Maps the backend's getEmployeeDashboard() response shape into a stable
 * internal model the component relies on.
 *
 * Backend response (data field):
 *  - todayAttendance : Attendance object | null
 *  - leaveCount      : number
 *  - unreadNotifications : number
 *  - latestSalary    : Salary object | null
 *  - upcomingHolidays: Holiday[]
 *
 * @param {Object} payload  raw API response
 * @returns {{ hasPunchedIn: number, leaveCount: number, unreadNotifications: number, holidays: Object[] }}
 */
const normalizeDashboardData = (payload) => {
  const src = payload?.data ?? payload ?? {};

  return {
    // todayAttendance is an object or null — convert to a 0/1 for the stat card
    hasPunchedIn: src.todayAttendance ? 1 : 0,
    leaveCount: src.leaveCount ?? 0,
    unreadNotifications: src.unreadNotifications ?? 0,
    holidays: Array.isArray(src.upcomingHolidays) ? src.upcomingHolidays : [],
    latestSalary: src.latestSalary ?? null,
  };
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const DashboardListSection = ({ title, emptyMessage, children }) => (
  <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
    <h2 className="text-xl font-semibold text-gray-950">{title}</h2>
    <div className="mt-5 grid gap-3">
      {children ?? <p className="text-sm text-gray-600">{emptyMessage}</p>}
    </div>
  </section>
);

const HolidayListItem = ({ holiday }) => (
  <article className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
    <p className="font-semibold text-gray-900">
      {holiday.holidayName ?? holiday.name ?? "Holiday"}
    </p>
    <p className="text-sm font-medium text-gray-700">
      {dayjs(holiday.holidayDate ?? holiday.date).format("MMM DD, YYYY")}
    </p>
  </article>
);

// ---------------------------------------------------------------------------
// EmployeeDashboard
// ---------------------------------------------------------------------------

const EmployeeDashboard = () => {
  const [pageState, setPageState] = useState({
    loading: true,
    error: "",
    data: null,
  });

  const fetchDashboard = useCallback(async () => {
    setPageState({ loading: true, error: "", data: null });

    try {
      const response = await dashboardService.getEmployeeDashboard();
      setPageState({
        loading: false,
        error: "",
        data: normalizeDashboardData(response),
      });
    } catch (err) {
      setPageState({
        loading: false,
        error: getErrorMessage(err),
        data: null,
      });
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const { data } = pageState;

  const statCards = useMemo(
    () =>
      STAT_CARD_CONFIG.map(({ key, label, hint, icon }) => ({
        label,
        hint,
        icon,
        value: data?.[key] ?? 0,
      })),
    [data]
  );

  return (
    <AsyncPageState
      title="Employee Dashboard"
      description="Your attendance summary, leave status, upcoming holidays, and team birthdays."
      loading={pageState.loading}
      error={pageState.error}
      isEmpty={!pageState.loading && !pageState.error && data === null}
      emptyTitle="No dashboard data available"
      emptyDescription="Your dashboard data could not be loaded or is currently empty."
      onRetry={fetchDashboard}
    >
      <div className="space-y-6">
        {/* ── Stats row ── */}
        <div className="grid gap-4 md:grid-cols-3">
          {statCards.map(({ label, value, hint, icon: Icon }) => (
            <div key={label} className="relative">
              <div className="pointer-events-none absolute right-4 top-4 text-gray-300">
                <Icon size={20} />
              </div>
              <StatsCard label={label} value={value} hint={hint} />
            </div>
          ))}
        </div>

        {/* ── Calendar + side lists ── */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <CalendarView holidays={data?.holidays ?? []} leaves={[]} />
          </div>

          <div className="space-y-6">
            <DashboardListSection
              title="Upcoming Holidays"
              emptyMessage="No upcoming holidays scheduled."
            >
              {data?.holidays?.length
                ? data.holidays.map((holiday, i) => (
                    <HolidayListItem key={holiday._id ?? i} holiday={holiday} />
                  ))
                : null}
            </DashboardListSection>

            {data?.latestSalary && (
              <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-950">Latest Salary</h2>
                <div className="mt-4">
                  <p className="text-sm text-gray-600">
                    {data.latestSalary.month} / {data.latestSalary.year}
                  </p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    ₹{(data.latestSalary.netSalary ?? data.latestSalary.amount ?? 0).toLocaleString()}
                  </p>
                  <span
                    className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                      data.latestSalary.status === "Paid"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {data.latestSalary.status ?? "Pending"}
                  </span>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </AsyncPageState>
  );
};

export default EmployeeDashboard;
