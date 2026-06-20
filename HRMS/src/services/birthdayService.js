import BaseApiManager from "../api/BaseApiManager";
import { EMPLOYEE } from "../api/endpoints";

/**
 * Fetches all employees to build the birthday list.
 * This endpoint requires HR role; call inside a try/catch.
 * On failure, the UI should gracefully fall back to own-birthday only.
 */
export const fetchAllEmployees = () => BaseApiManager.get(EMPLOYEE.LIST);
