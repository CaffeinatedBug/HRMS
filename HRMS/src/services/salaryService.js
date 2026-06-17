import BaseApiManager from "../api/BaseApiManager";
import { SALARY } from "../api/endpoints";

export const salaryService = {
  getAll: (params) =>
    BaseApiManager.get(SALARY.LIST, params),

  getDetails: (id) =>
    BaseApiManager.get(SALARY.DETAILS(id)),

  confirm: (id, payload) =>
    BaseApiManager.patch(SALARY.CONFIRM(id), payload),
};
