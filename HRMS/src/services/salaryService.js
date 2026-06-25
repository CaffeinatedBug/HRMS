import BaseApiManager from "../api/BaseApiManager";
import { SALARY } from "../api/endpoints";

export const salaryService = {
  // ── Employee-facing ────────────────────────────────────────────────────────
  getMySalaries: () => BaseApiManager.get(SALARY.MY_SALARIES),
  getById: (id) => BaseApiManager.get(SALARY.DETAILS(id)),

  // ── HR-only ────────────────────────────────────────────────────────────────
  /**
   * Fetch all salary records — HR only.
   * @param {{ month?: string, status?: string }} params
   */
  getAll: (params) => BaseApiManager.get(SALARY.ALL, params),

  /**
   * Confirm a salary payment — moves status to Paid.
   * State machine: Pending | Processing → Paid
   * @param {string} id  Salary record _id
   */
  confirm: (id) => BaseApiManager.patch(SALARY.CONFIRM(id)),

  /**
   * Mark a salary record as Failed.
   * State machine: Pending | Processing → Failed
   * @param {string} id  Salary record _id
   */
  markFailed: (id) => BaseApiManager.patch(SALARY.UPDATE(id), { paymentStatus: "Failed" }),
};
