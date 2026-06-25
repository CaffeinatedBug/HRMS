import BaseApiManager from "../api/BaseApiManager";
import { HOLIDAY } from "../api/endpoints";

export const holidayService = {
  getAll: () => BaseApiManager.get(HOLIDAY.LIST),
  getUpcoming: () => BaseApiManager.get(HOLIDAY.UPCOMING),
};
