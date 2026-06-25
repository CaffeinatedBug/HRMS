import BaseApiManager from "../api/BaseApiManager";
import { LEAVE } from "../api/endpoints";

export const leaveService = {
  apply: (payload) =>
    BaseApiManager.post(LEAVE.APPLY, payload),

  getMine: (params) =>
    BaseApiManager.get(LEAVE.MY_LEAVES, params),

  /**
   * Fetch all leave requests — HR only.
   * @param {{ status?: string }} params  Optional status filter (Pending | Approved | Rejected)
   */
  getAll: (params) =>
    BaseApiManager.get(LEAVE.ALL, params),

  /** Approve a leave request by ID — HR only. */
  approve: (id, payload = {}) =>
    BaseApiManager.put(LEAVE.APPROVE(id), payload),

  /**
   * Reject a leave request by ID — HR only.
   * @param {string} id
   * @param {{ remarks: string }} payload  Remarks are mandatory on rejection.
   */
  reject: (id, payload) =>
    BaseApiManager.put(LEAVE.REJECT(id), payload),
};
