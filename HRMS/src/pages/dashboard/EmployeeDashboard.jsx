import { useEffect, useState } from "react";
import { CalendarDays, Clock3, Umbrella } from "lucide-react";
import dayjs from "dayjs";

import AsyncPageState from "../../components/common/AsyncPageState";
import StatsCard from "../../components/dashboard/StatsCard";
import CalendarView from "../../components/dashboard/CalendarView";
import { dashboardService } from "../../services/dashboardService";

const getErrorMessage = (error) => {
  if (!error) return "Unknown error";
  return error.message || error.error || "Unknown error";
};

const normalizeDashboardResponse = (payload) => {
  const source = payload?.data || payload?.dashboard || payload || {};
  const birthdayList = source.birthdays || source.upcomingBirthdays || payload?.birthdays || [];
  const holidayList = source.holidays || source.upcomingHolidays || [];
  const leaveList = source.leaves || source.myLeaves || [];

  return {
    attendanceToday: source.todayAttendance ?? source.presentToday ?? source.attendanceCount ?? 0,
    pendingLeaves: source.pendingLeaves ?? source.leaveApprovalsPending ?? 0,
    holidaysThisMonth: source.holidaysThisMonth ?? source.monthlyHolidays ?? 0,
    birthdays: Array.isArray(birthdayList) ? birthdayList : [],
    holidays: Array.isArray(holidayList) ? holidayList : [],
    leaves: Array.isArray(leaveList) ? leaveList : [],
  };
};

const EmployeeDashboard = () => {
  const [pageState, setPageState] = useState({
    loading: true,
    error: "",
    data: null,
  });

  const loadDashboard = async (shouldReset = true) => {
    if (shouldReset) {
      setPageState({ loading: true, error: "", data: null });
    }

    try {
      const [dashboardResponse, birthdaysResponse] = await Promise.all([
        dashboardService.getEmployeeDashboard(),
        dashboardService.getBirthdays(),
      ]);

      const mergedData = normalizeDashboardResponse({
        ...dashboardResponse,
        birthdays: birthdaysResponse?.data || birthdaysResponse?.birthdays || birthdaysResponse || [],
      });

      setPageState({
        loading: false,
        error: "",
        data: mergedData,
      });
    } catch (error) {
      setPageState({
        loading: false,
        error: getErrorMessage(error),
        data: null,
      });
    }
  };

  useEffect(() => {
    loadDashboard(false);
  }, []);

  const dashboardData = pageState.data;

  const statCards = [
    {
      label: "Today's Attendance",
      value: dashboardData?.attendanceToday ?? 0,
      hint: "Your punch record for today",
      icon: Clock3,
    },
    {
      label: "Pending Leaves",
      value: dashboardData?.pendingLeaves ?? 0,
      hint: "Your unapproved leave requests",
      icon: Umbrella,
    },
    {
      label: "Holidays This Month",
      value: dashboardData?.holidaysThisMonth ?? 0,
      hint: "Upcoming company holidays",
      icon: CalendarDays,
    },
  ];

  const hasContent = dashboardData !== null;

  return (
    <AsyncPageState
      title="Employee Dashboard"
      description="View your attendance summary, leaves, upcoming holidays, and team birthdays."
      loading={pageState.loading}
      error={pageState.error}
      isEmpty={!hasContent && !pageState.loading && !pageState.error}
      emptyTitle="No dashboard data available"
      emptyDescription="Your dashboard data could not be loaded or is currently empty."
      onRetry={() => loadDashboard()}
    >
      <div className="space-y-6">
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

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <CalendarView 
              holidays={dashboardData?.holidays || []}
              leaves={dashboardData?.leaves || []}
            />
          </div>

          <div className="space-y-6">
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold text-gray-950">Upcoming Holidays</h2>
              </div>
              <div className="mt-5 grid gap-3">
                {dashboardData?.holidays?.length ? (
                  dashboardData.holidays.map((holiday, index) => (
                    <article
                      key={holiday.id || index}
                      className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">{holiday.name || "Holiday"}</p>
                      </div>
                      <p className="text-sm font-medium text-gray-700">
                        {dayjs(holiday.date).format("MMM DD, YYYY")}
                      </p>
                    </article>
                  ))
                ) : (
                  <p className="text-sm text-gray-600">No upcoming holidays scheduled.</p>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold text-gray-950">Upcoming Birthdays</h2>
              </div>
              <div className="mt-5 grid gap-3">
                {dashboardData?.birthdays?.length ? (
                  dashboardData.birthdays.map((employee, index) => (
                    <article
                      key={employee.id || employee._id || employee.email || index}
                      className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">
                          {employee.name || employee.fullName || employee.employeeName || "Employee"}
                        </p>
                        <p className="text-sm text-gray-600">
                          {employee.department || employee.team || "Team not available"}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-gray-700">
                        {employee.date || employee.birthday || employee.birthDate || "Date pending"}
                      </p>
                    </article>
                  ))
                ) : (
                  <p className="text-sm text-gray-600">No upcoming birthdays right now.</p>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </AsyncPageState>
  );
};

export default EmployeeDashboard;
