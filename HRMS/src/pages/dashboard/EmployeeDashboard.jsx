import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Clock3,
  BellRing,
  Cake,
  ArrowRight,
} from "lucide-react";
import dayjs from "dayjs";

import AsyncPageState from "../../components/common/AsyncPageState";
import StatsCard from "../../components/dashboard/StatsCard";
import CalendarView from "../../components/dashboard/CalendarView";
import { dashboardService } from "../../services/dashboardService";
import { fetchAllEmployees } from "../../services/birthdayService";
import { getErrorMessage } from "../../utils/helper";
import {
  isBirthdayToday,
  daysUntilBirthday,
  birthdaysWithinDays,
} from "../../utils/birthdayUtils";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

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

const normalizeDashboardData = (payload) => {
  const src = payload?.data ?? payload ?? {};
  return {
    hasPunchedIn: src.todayAttendance ? 1 : 0,
    leaveCount: src.leaveCount ?? 0,
    unreadNotifications: src.unreadNotifications ?? 0,
    holidays: Array.isArray(src.upcomingHolidays) ? src.upcomingHolidays : [],
  };
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const SectionCard = ({ title, children, linkTo, linkLabel, navigate }) => (
  <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
    <div className="mb-4 flex items-center justify-between">
      <h2 className="font-semibold text-gray-950">{title}</h2>
      {linkTo && (
        <button
          onClick={() => navigate(linkTo)}
          className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
        >
          {linkLabel ?? "View all"} <ArrowRight size={12} />
        </button>
      )}
    </div>
    {children}
  </section>
);

const HolidayItem = ({ holiday }) => (
  <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
    <p className="text-sm font-semibold text-gray-900">
      {holiday.holidayName ?? holiday.name ?? "Holiday"}
    </p>
    <p className="text-xs font-medium text-gray-500">
      {dayjs(holiday.holidayDate ?? holiday.date).format("DD MMM")}
    </p>
  </div>
);

const BirthdayItem = ({ person, isSelf }) => {
  const daysUntil = daysUntilBirthday(person.dob);
  const fullName = `${person.firstName ?? ""} ${person.lastName ?? ""}`.trim();
  const isToday = daysUntil === 0;

  return (
    <div
      className={`flex items-center justify-between rounded-xl border px-4 py-3 ${
        isToday
          ? "border-pink-200 bg-pink-50"
          : "border-gray-100 bg-gray-50"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-xl">{isToday ? "🎂" : "🎈"}</span>
        <div>
          <p className="text-sm font-semibold text-gray-900">
            {fullName}
            {isSelf && (
              <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                You
              </span>
            )}
          </p>
          <p className="text-xs text-gray-500">
            {dayjs(person.dob).format("DD MMM")}
          </p>
        </div>
      </div>
      <span
        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
          isToday
            ? "bg-pink-100 text-pink-700"
            : "bg-blue-100 text-blue-700"
        }`}
      >
        {isToday ? "Today 🎉" : `In ${daysUntil}d`}
      </span>
    </div>
  );
};

// ---------------------------------------------------------------------------
// EmployeeDashboard
// ---------------------------------------------------------------------------

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const { user: self } = useSelector((state) => state.auth);

  const [pageState, setPageState] = useState({ loading: true, error: "", data: null });
  const [teamBirthdays, setTeamBirthdays] = useState([]);

  // ── Dashboard data ─────────────────────────────────────────────────────

  const fetchDashboard = useCallback(async () => {
    setPageState({ loading: true, error: "", data: null });
    try {
      const response = await dashboardService.getEmployeeDashboard();
      setPageState({ loading: false, error: "", data: normalizeDashboardData(response) });
    } catch (err) {
      setPageState({ loading: false, error: getErrorMessage(err), data: null });
    }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  // ── Team birthday data (available for both roles) ─

  useEffect(() => {
    fetchAllEmployees()
      .then((res) => {
        const members = (res?.users ?? []).filter((u) => !!u.dob);
        setTeamBirthdays(birthdaysWithinDays(members, 30));
      })
      .catch(() => {
        // API unavailable — fall back to own birthday only
        if (self?.dob) {
          setTeamBirthdays(
            birthdaysWithinDays([self], 30)
          );
        }
      });
  }, [self]);

  // ── Merge team + self, deduplicate, sort by soonest ───────────────────

  const upcomingBirthdays = useMemo(() => {
    const all = [...teamBirthdays];
    const ids = new Set(all.map((p) => String(p._id)));
    if (self?.dob && !ids.has(String(self._id))) {
      all.push(self);
    }
    return birthdaysWithinDays(all, 30).slice(0, 5);
  }, [teamBirthdays, self]);

  const selfBirthdayToday = isBirthdayToday(self?.dob);

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

        {/* Own birthday banner */}
        {selfBirthdayToday && (
          <div className="rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-orange-400 p-5 text-white shadow-md">
            <p className="text-lg font-bold">🎂 Happy Birthday, {self?.firstName}!</p>
            <p className="mt-1 text-sm text-pink-100">
              Wishing you a fantastic day. The entire team celebrates with you! 🎉
            </p>
          </div>
        )}

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

        {/* ── Calendar + side panels ── */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <CalendarView holidays={data?.holidays ?? []} leaves={[]} />
          </div>

          <div className="space-y-5">
            {/* Upcoming holidays */}
            <SectionCard
              title="Upcoming Holidays"
              linkTo="/employee/holidays"
              navigate={navigate}
            >
              {data?.holidays?.length ? (
                <div className="space-y-2">
                  {data.holidays.slice(0, 4).map((h, i) => (
                    <HolidayItem key={h._id ?? i} holiday={h} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No upcoming holidays.</p>
              )}
            </SectionCard>

            {/* Team birthdays */}
            {upcomingBirthdays.length > 0 && (
              <SectionCard
                title={`🎂 Upcoming Birthdays`}
                linkTo="/employee/birthdays"
                linkLabel="See all"
                navigate={navigate}
              >
                <div className="space-y-2">
                  {upcomingBirthdays.map((person, i) => (
                    <BirthdayItem
                      key={person._id ?? i}
                      person={person}
                      isSelf={String(person._id) === String(self?._id)}
                    />
                  ))}
                </div>
              </SectionCard>
            )}
          </div>
        </div>
      </div>
    </AsyncPageState>
  );
};

export default EmployeeDashboard;
