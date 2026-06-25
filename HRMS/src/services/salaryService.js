import BaseApiManager from "../api/BaseApiManager";
import { SALARY } from "../api/endpoints";

export const salaryService = {
  getMySalaries: () => BaseApiManager.get(SALARY.MY_SALARIES),
  getById: (id) => BaseApiManager.get(SALARY.DETAILS(id)),
};
