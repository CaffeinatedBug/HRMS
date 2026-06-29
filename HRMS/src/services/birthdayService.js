import BaseApiManager from "../api/BaseApiManager";
import { EMPLOYEE } from "../api/endpoints";

/**
 * Fetches birthday-safe user directory for both HR and employees.
 */
export const fetchAllEmployees = () => BaseApiManager.get(EMPLOYEE.BIRTHDAYS);
