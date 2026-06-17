import {
  useEffect,
  useState,
} from "react";
import { BellRing, CalendarDays, Clock3, Users } from "lucide-react";

import AsyncPageState from "../../components/common/AsyncPageState";
import StatsCard from "../../components/dashboard/StatsCard";
import { dashboardService } from "../../services/dashboardService";

const getErrorMessage = (
  error
) => {
  if (!error) {
    return "Unknown error";
  }

  return (
    error.message ||
    error.error ||
    "Unknown error"
  );
};

const normalizeDashboardResponse = (
  payload
) => {
  const source =
    payload?.data ||
    payload?.dashboard ||
    payload || {};

  const birthdayList =
    source.birthdays ||
    source.upcomingBirthdays ||
    payload?.birthdays ||
    [];

  return {
    employees:
      source.totalEmployees ??
      source.employeeCount ??
      source.totalUsers ??
      0,
    attendanceToday:
      source.todayAttendance ??
      source.presentToday ??
      source.attendanceCount ??
      0,
    pendingLeaves:
      source.pendingLeaves ??
      source.leaveApprovalsPending ??
      0,
    holidaysThisMonth:
      source.holidaysThisMonth ??
      source.monthlyHolidays ??
      0,
    birthdays: Array.isArray(
      birthdayList
    )
      ? birthdayList
      : [],
  };
};

const Dashboard = () => {
  const [pageState,
    setPageState] =
    useState({
      loading: true,
      error: "",
      data: null,
    });

  const loadDashboard =
    async (
      shouldReset = true
    ) => {
      if (shouldReset) {
        setPageState({
          loading: true,
          error: "",
          data: null,
        });
      }

      try {
        const [
          dashboardResponse,
          birthdaysResponse,
        ] = await Promise.all([
          dashboardService.getHRDashboard(),
          dashboardService.getBirthdays(),
        ]);

        const mergedData =
          normalizeDashboardResponse(
            {
              ...dashboardResponse,
              birthdays:
                birthdaysResponse?.data ||
                birthdaysResponse?.birthdays ||
                birthdaysResponse ||
                [],
            }
          );

        setPageState({
          loading: false,
          error: "",
          data: mergedData,
        });
      } catch (error) {
        setPageState({
          loading: false,
          error:
            getErrorMessage(error),
          data: null,
        });
      }
    };

  useEffect(() => {
    const runInitialLoad =
      async () => {
        await loadDashboard(
          false
        );
      };

    runInitialLoad();
  }, []);

  const dashboardData =
    pageState.data;

  const statCards = [
    {
      label: "Employees",
      value:
        dashboardData?.employees ??
        0,
      hint: "Active employee records",
      icon: Users,
    },
    {
      label: "Today Attendance",
      value:
        dashboardData?.attendanceToday ??
        0,
      hint: "Punch records captured today",
      icon: Clock3,
    },
    {
      label: "Pending Leaves",
      value:
        dashboardData?.pendingLeaves ??
        0,
      hint: "Requests awaiting HR action",
      icon: BellRing,
    },
    {
      label: "This Month Holidays",
      value:
        dashboardData?.holidaysThisMonth ??
        0,
      hint: "Listed company holidays",
      icon: CalendarDays,
    },
  ];

  const hasContent =
    dashboardData &&
    (
      dashboardData.employees > 0 ||
      dashboardData.attendanceToday > 0 ||
      dashboardData.pendingLeaves > 0 ||
      dashboardData.holidaysThisMonth > 0 ||
      dashboardData.birthdays
        ?.length > 0
    );

  return (
    <AsyncPageState
      title="HR Dashboard"
      description="A single page pattern for summary data: load, fail clearly, show an empty state when nothing exists, and render content only when the page is ready."
      loading={
        pageState.loading
      }
      error={pageState.error}
      isEmpty={!hasContent}
      emptyTitle="No HR dashboard data yet"
      emptyDescription="As employees, attendance, and leave records appear, this dashboard will surface the summary here."
      onRetry={() =>
        loadDashboard()
      }
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map(
            ({
              label,
              value,
              hint,
              icon: Icon,
            }) => (
              <div
                key={label}
                className="relative"
              >
                <div className="pointer-events-none absolute right-4 top-4 text-gray-300">
                  <Icon size={20} />
                </div>

                <StatsCard
                  label={label}
                  value={value}
                  hint={hint}
                />
              </div>
            )
          )}
        </div>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-gray-950">
                Upcoming Birthdays
              </h2>

              <p className="mt-1 text-sm text-gray-600">
                Keep this section for birthday notifications across HR and employee views.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            {dashboardData?.birthdays
              ?.length ? (
              dashboardData.birthdays.map(
                (
                  employee,
                  index
                ) => (
                  <article
                    key={
                      employee.id ||
                      employee._id ||
                      employee.email ||
                      index
                    }
                    className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">
                        {employee.name ||
                          employee.fullName ||
                          employee.employeeName ||
                          "Employee"}
                      </p>

                      <p className="text-sm text-gray-600">
                        {employee.department ||
                          employee.team ||
                          "Team not available"}
                      </p>
                    </div>

                    <p className="text-sm font-medium text-gray-700">
                      {employee.date ||
                        employee.birthday ||
                        employee.birthDate ||
                        "Date pending"}
                    </p>
                  </article>
                )
              )
            ) : (
              <p className="text-sm text-gray-600">
                No birthday notifications are available right now.
              </p>
            )}
          </div>
        </section>
      </div>
    </AsyncPageState>
  );
};

export default Dashboard;
