import { useCallback, useEffect, useState } from "react";
import {
  Users,
  Clock3,
  BellRing,
  CalendarDays,
  UserMinus,
  IndianRupee,
} from "lucide-react";

import { dashboardService } from "../../services/dashboardService";
import { getErrorMessage } from "../../utils/helper";
import StatsCard from "../../components/dashboard/StatsCard";
import EmployeeTable from "../../components/hr/EmployeeTable";
import AttendanceSummary from "../../components/hr/AttendanceSummary";
import Loader from "../../components/common/Loader";

// ---------------------------------------------------------------------------
// Normalise — tolerates many different backend response shapes
// ---------------------------------------------------------------------------

const normalise = (payload) => {
  const src =
    payload?.data ?? payload?.dashboard ?? payload ?? {};

  const employees =
    src.employees ??
    src.totalEmployees ??
    src.employeeCount ??
    src.totalUsers ??
    [];

  return {
    totalEmployees:
      Array.isArray(employees)
        ? employees.length
        : (src.totalEmployees ?? src.employeeCount ?? src.totalUsers ?? 0),
    presentToday:
      src.presentToday ?? src.todayAttendance ?? src.attendanceCount ?? 0,
    onLeave: src.onLeave ?? src.employeesOnLeave ?? 0,
    pendingLeaves:
      src.pendingLeaves ?? src.leaveApprovalsPending ?? 0,
    pendingSalaryConfirmations:
      src.pendingSalaryConfirmations ?? src.pendingSalaries ?? 0,
    holidaysThisMonth:
      src.holidaysThisMonth ?? src.monthlyHolidays ?? 0,
    employees: Array.isArray(employees) ? employees : [],
    attendanceSummary: src.attendanceSummary ?? src,
    birthdays:
      Array.isArray(src.birthdays)
        ? src.birthdays
        : Array.isArray(src.upcomingBirthdays)
        ? src.upcomingBirthdays
        : [],
  };
};

// ---------------------------------------------------------------------------
// Stat card definitions
// ---------------------------------------------------------------------------

const statDefs = (data) => [
  {
    label: "Total Employees",
    value: data?.totalEmployees ?? 0,
    hint: "Active employee records",
    icon: Users,
    accent: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    label: "Present Today",
    value: data?.presentToday ?? 0,
    hint: "Punch records captured today",
    icon: Clock3,
    accent: "text-green-600",
    bg: "bg-green-50",
  },
  {
    label: "On Leave",
    value: data?.onLeave ?? 0,
    hint: "Employees on approved leave",
    icon: UserMinus,
    accent: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    label: "Pending Leaves",
    value: data?.pendingLeaves ?? 0,
    hint: "Requests awaiting HR action",
    icon: BellRing,
    accent: "text-orange-600",
    bg: "bg-orange-50",
  },
  {
    label: "Salary Confirmations",
    value: data?.pendingSalaryConfirmations ?? 0,
    hint: "Salary records pending confirmation",
    icon: IndianRupee,
    accent: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    label: "Holidays This Month",
    value: data?.holidaysThisMonth ?? 0,
    hint: "Listed company holidays",
    icon: CalendarDays,
    accent: "text-pink-600",
    bg: "bg-pink-50",
  },
];

// ---------------------------------------------------------------------------
// Skeleton stats row
// ---------------------------------------------------------------------------

const StatsSkeleton = () => (
  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
    {Array.from({ length: 6 }).map((_, i) => (
      <div
        key={i}
        className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
      >
        <div className="h-3 w-20 rounded bg-gray-200 animate-pulse mb-4" />
        <div className="h-8 w-14 rounded bg-gray-200 animate-pulse mb-2" />
        <div className="h-3 w-28 rounded bg-gray-200 animate-pulse" />
      </div>
    ))}
  </div>
);

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

const Dashboard = () => {
  const [state, setState] = useState({
    loading: true,
    error: "",
    data: null,
  });

  const load = useCallback(async () => {
    setState({ loading: true, error: "", data: null });
    try {
      const [dashRes, birthdayRes] = await Promise.all([
        dashboardService.getHRDashboard(),
        dashboardService.getBirthdays?.() ?? Promise.resolve([]),
      ]);

      const merged = normalise({
        ...dashRes,
        birthdays:
          birthdayRes?.data ??
          birthdayRes?.birthdays ??
          birthdayRes ??
          [],
      });

      setState({ loading: false, error: "", data: merged });
    } catch (err) {
      setState({
        loading: false,
        error: getErrorMessage(err),
        data: null,
      });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const { loading, error, data } = state;
  const cards = statDefs(data);

  return (
    <section className="space-y-6">
      {/* Page header */}
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-950">HR Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Operational overview — attendance, leaves, salary confirmations.
          </p>
        </div>
        <button
          type="button"
          id="refresh-dashboard-btn"
          onClick={load}
          disabled={loading}
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition-colors"
        >
          {loading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
          ) : null}
          Refresh
        </button>
      </header>

      {/* Error banner */}
      {!loading && error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <p className="font-semibold text-red-800">Could not load dashboard</p>
          <p className="mt-1 text-sm text-red-600">{error}</p>
          <button
            type="button"
            onClick={load}
            className="mt-3 inline-flex h-9 items-center rounded-lg bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700"
          >
            Try again
          </button>
        </div>
      )}

      {/* Stats cards */}
      {loading ? (
        <StatsSkeleton />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          {cards.map(({ label, value, hint, icon: Icon, accent, bg }) => (
            <article
              key={label}
              className="relative rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div
                className={`absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full ${bg} ${accent}`}
              >
                <Icon size={16} />
              </div>
              <StatsCard label={label} value={value} hint={hint} />
            </article>
          ))}
        </div>
      )}

      {/* Attendance summary */}
      <AttendanceSummary data={data?.attendanceSummary} loading={loading} />

      {/* Employee table */}
      <EmployeeTable employees={data?.employees ?? []} loading={loading} />

      {/* Upcoming birthdays */}
      {!loading && data?.birthdays?.length > 0 && (
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-gray-950">
            Upcoming Birthdays
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {data.birthdays.map((emp, i) => (
              <article
                key={emp.id ?? emp._id ?? emp.email ?? i}
                className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"
              >
                <div>
                  <p className="font-semibold text-gray-900 text-sm">
                    {emp.name ?? emp.fullName ?? emp.employeeName ?? "—"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {emp.department ?? emp.team ?? "—"}
                  </p>
                </div>
                <p className="text-xs font-semibold text-gray-600">
                  {emp.date ?? emp.birthday ?? emp.birthDate ?? "—"}
                </p>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {!loading && !error && !data && (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
          <p className="font-semibold text-gray-700">No data yet</p>
          <p className="mt-1 text-sm text-gray-500">
            As employees, attendance, and leave records are added, the dashboard will surface summaries here.
          </p>
        </div>
      )}
    </section>
  );
};

export default Dashboard;
