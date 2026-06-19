export const AUTH = {
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  PROFILE: "/auth/profile",
};

// Backend mounts at /api/users (not /api/employees)
export const EMPLOYEE = {
  LIST: "/users",
  CREATE: "/users",
  DETAILS: (id) => `/users/${id}`,
  UPDATE: (id) => `/users/${id}`,
};

export const ATTENDANCE = {
  PUNCH_IN: "/attendance/punch-in",
  PUNCH_OUT: "/attendance/punch-out",
  TODAY: "/attendance/today",
  HISTORY: "/attendance/history",
  ALL: "/attendance",
  MONTHLY: "/attendance/monthly",
};

// Backend mounts at /api/leave; route sub-paths differ from original
export const LEAVE = {
  APPLY: "/leave/apply",
  MY_LEAVES: "/leave/my-leaves",          // backend: GET /leave/my-leaves
  ALL: "/leave/all",                       // backend: GET /leave/all
  APPROVE: (id) => `/leave/approve/${id}`, // backend: PUT /leave/approve/:id
  REJECT: (id) => `/leave/reject/${id}`,   // backend: PUT /leave/reject/:id
};

// Backend mounts at /api/holiday (singular)
export const HOLIDAY = {
  LIST: "/holiday/all",
  UPCOMING: "/holiday/upcoming",
  CREATE: "/holiday/add",
  UPDATE: (id) => `/holiday/update/${id}`,
  DELETE: (id) => `/holiday/delete/${id}`,
};

export const SALARY = {
  LIST: "/salary",
  DETAILS: (id) => `/salary/${id}`,
  CONFIRM: (id) => `/salary/${id}/confirm`,
};

export const DASHBOARD = {
  HR: "/dashboard/hr",
  EMPLOYEE: "/dashboard/employee",
  MONTHLY_ATTENDANCE: "/dashboard/monthly-attendance",
};

export const NOTIFICATION = {
  LIST: "/notifications",
  UNREAD_COUNT: "/notifications/unread-count",
  MARK_READ: (id) => `/notifications/read/${id}`,
  MARK_ALL_READ: "/notifications/read-all",
  DELETE: (id) => `/notifications/delete/${id}`,
};
