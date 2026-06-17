export const AUTH = {
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  PROFILE: "/auth/profile",
};

export const EMPLOYEE = {
  LIST: "/employees",
  CREATE: "/employees",
  DETAILS: (id) => `/employees/${id}`,
  UPDATE: (id) => `/employees/${id}`,
};

export const ATTENDANCE = {
  PUNCH_IN: "/attendance/punch-in",
  PUNCH_OUT: "/attendance/punch-out",
  TODAY: "/attendance/today",
  HISTORY: "/attendance/history",
  ALL: "/attendance",
  MONTHLY: "/attendance/monthly",
};

export const LEAVE = {
  APPLY: "/leave/apply",
  MY_LEAVES: "/leave/my",
  ALL: "/leave",
  APPROVE: (id) => `/leave/${id}/approve`,
  REJECT: (id) => `/leave/${id}/reject`,
};

export const HOLIDAY = {
  LIST: "/holidays",
  CREATE: "/holidays",
  UPDATE: (id) => `/holidays/${id}`,
  DELETE: (id) => `/holidays/${id}`,
};

export const SALARY = {
  LIST: "/salary",
  DETAILS: (id) => `/salary/${id}`,
  CONFIRM: (id) => `/salary/${id}/confirm`,
};

export const DASHBOARD = {
  HR: "/dashboard/hr",
  EMPLOYEE: "/dashboard/employee",
};

export const NOTIFICATION = {
  LIST: "/notifications",
  BIRTHDAYS: "/notifications/birthdays",
};
