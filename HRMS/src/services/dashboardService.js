import BaseApiManager from "../api/BaseApiManager";
import { DASHBOARD } from "../api/endpoints";

export const dashboardService = {
  getHRDashboard: () =>
    BaseApiManager.get(DASHBOARD.HR),

  getEmployeeDashboard: () =>
    BaseApiManager.get(DASHBOARD.EMPLOYEE),

  getMonthlyAttendance: () =>
    BaseApiManager.get(DASHBOARD.MONTHLY_ATTENDANCE),
};
