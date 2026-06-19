import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock3, Umbrella } from "lucide-react";
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
    key: "attendanceToday",
    label: "Today's Attendance",
    hint: "Your punch record for today",
    icon: Clock3,
  },
  {
    key: "pendingLeaves",
    label: "Pending Leaves",
    hint: "Your unapproved leave requests",
    icon: Umbrella,
  },
  {
    key: "holidaysThisMonth",
    label: "Holidays This Month",
    hint: "Upcoming company holidays",
    icon: CalendarDays,
  },
];

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

/**
 * Normalises the various shapes the backend may return into a stable object
 * the component can rely on.
 *
 * @param {Object} dashboardPayload  - response from getEmployeeDashboard()
 * @param {unknown} birthdaysPayload - response from getBirthdays()
 * @returns {{ attendanceToday: number, pendingLeaves: number, holidaysThisMonth: number, birthdays: Object[], holidays: Object[], leaves: Object[] }}
 */
const normalizeDashboardData = (dashboardPayload, birthdaysPayload) => {
  const src = dashboardPayload?.data ?? dashboardPayload?.dashboard ?? dashboardPayload ?? {};

  const toArray = (val) => (Array.isArray(val) ? val : []);

  return {
    attendanceToday:
      src.todayAttendance ?? src.presentToday ?? src.attendanceCount ?? 0,
    pendingLeaves:
      src.pendingLeaves ?? src.leaveApprovalsPending ?? 0,
    holidaysThisMonth:
      src.holidaysThisMonth ?? src.monthlyHolidays ?? 0,
    birthdays: toArray(
      birthdaysPayload?.data ?? birthdaysPayload?.birthdays ?? birthdaysPayload
    ),
    holidays: toArray(src.holidays ?? src.upcomingHolidays),
    leaves: toArray(src.leaves ?? src.myLeaves),
  };
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/**
 * A reusable list section card used for both "Upcoming Holidays" and
 * "Upcoming Birthdays" to avoid JSX duplication.
 */
const DashboardListSection = ({ title, emptyMessage, children }) => (
  <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
    <h2 className="text-xl font-semibold text-gray-950">{title}</h2>
    <div className="mt-5 grid gap-3">
      {children ?? (
        <p className="text-sm text-gray-600">{emptyMessage}</p>
      )}
    </div>
  </section>
);

const HolidayListItem = ({ holiday }) => (
  <article className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
    <p className="font-semibold text-gray-900">{holiday.name ?? "Holiday"}</p>
    <p className="text-sm font-medium text-gray-700">
      {dayjs(holiday.date).format("MMM DD, YYYY")}
    </p>
  </article>
);

const BirthdayListItem = ({ employee }) => (
  <article className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
    <div>
      <p className="font-semibold text-gray-900">
        {employee.name ?? employee.fullName ?? employee.employeeName ?? "Employee"}
      </p>
      <p className="text-sm text-gray-600">
        {employee.department ?? employee.team ?? "Team not available"}
      </p>
    </div>
    <p className="text-sm font-medium text-gray-700">
      {employee.date ?? employee.birthday ?? employee.birthDate ?? "Date pending"}
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
      const [dashboardResponse, birthdaysResponse] = await Promise.all([
        dashboardService.getEmployeeDashboard(),
        dashboardService.getBirthdays(),
      ]);

      setPageState({
        loading: false,
        error: "",
        data: normalizeDashboardData(dashboardResponse, birthdaysResponse),
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

  // Memoised so the array identity is stable between renders when data hasn't changed.
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
            <CalendarView
              holidays={data?.holidays ?? []}
              leaves={data?.leaves ?? []}
            />
          </div>

          <div className="space-y-6">
            <DashboardListSection
              title="Upcoming Holidays"
              emptyMessage="No upcoming holidays scheduled."
            >
              {data?.holidays?.length
                ? data.holidays.map((holiday, i) => (
                    <HolidayListItem key={holiday.id ?? i} holiday={holiday} />
                  ))
                : null}
            </DashboardListSection>

            <DashboardListSection
              title="Upcoming Birthdays"
              emptyMessage="No upcoming birthdays right now."
            >
              {data?.birthdays?.length
                ? data.birthdays.map((employee, i) => (
                    <BirthdayListItem
                      key={employee.id ?? employee._id ?? employee.email ?? i}
                      employee={employee}
                    />
                  ))
                : null}
            </DashboardListSection>
          </div>
        </div>
      </div>
    </AsyncPageState>
  );
};

export default EmployeeDashboard;
