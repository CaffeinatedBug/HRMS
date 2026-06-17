import BaseApiManager from "../api/BaseApiManager";
import { DASHBOARD, NOTIFICATION } from "../api/endpoints";

export const dashboardService = {
  getHRDashboard: () =>
    BaseApiManager.get(DASHBOARD.HR),

  getEmployeeDashboard: () =>
    BaseApiManager.get(DASHBOARD.EMPLOYEE),

  getBirthdays: () =>
    BaseApiManager.get(NOTIFICATION.BIRTHDAYS),
};
