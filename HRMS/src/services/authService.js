import BaseApiManager from "../api/BaseApiManager";
import { AUTH } from "../api/endpoints";

export const authService = {
  login: (credentials) =>
    BaseApiManager.post(AUTH.LOGIN, credentials),

  register: (payload) =>
    BaseApiManager.post(AUTH.REGISTER, payload),

  getProfile: () =>
    BaseApiManager.get(AUTH.PROFILE),
};
