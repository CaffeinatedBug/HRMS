import BaseApiManager from "../api/BaseApiManager";
import { LEAVE } from "../api/endpoints";

export const leaveService = {
  apply: (payload) =>
    BaseApiManager.post(LEAVE.APPLY, payload),

  getMine: (params) =>
    BaseApiManager.get(LEAVE.MY_LEAVES, params),

  getAll: (params) =>
    BaseApiManager.get(LEAVE.ALL, params),

  approve: (id) =>
    BaseApiManager.patch(LEAVE.APPROVE(id)),

  reject: (id) =>
    BaseApiManager.patch(LEAVE.REJECT(id)),
};
