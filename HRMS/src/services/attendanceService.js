import BaseApiManager from "../api/BaseApiManager";
import { ATTENDANCE } from "../api/endpoints";

export const attendanceService = {
  punchIn: (payload) =>
    BaseApiManager.post(ATTENDANCE.PUNCH_IN, payload),

  punchOut: (payload) =>
    BaseApiManager.post(ATTENDANCE.PUNCH_OUT, payload),

  getToday: () =>
    BaseApiManager.get(ATTENDANCE.TODAY),

  getHistory: (params) =>
    BaseApiManager.get(ATTENDANCE.HISTORY, params),

  getAll: (params) =>
    BaseApiManager.get(ATTENDANCE.ALL, params),
};
