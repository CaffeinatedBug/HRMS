/**
 * birthdayUtils.js
 *
 * All birthday-related pure helper functions.
 * Works with any user object that has a `dob` field (ISO date string or Date).
 */

import dayjs from "dayjs";

/**
 * Returns true if the given dob falls on today (month+day match, year ignored).
 */
export const isBirthdayToday = (dob) => {
  if (!dob) return false;
  const d = dayjs(dob);
  const today = dayjs();
  return d.month() === today.month() && d.date() === today.date();
};

/**
 * Returns the next birthday date for a given dob (as a dayjs object).
 * If birthday already occurred this year, returns next year's date.
 */
export const nextBirthday = (dob) => {
  if (!dob) return null;
  const d = dayjs(dob);
  const today = dayjs();
  const thisYear = dayjs().year(today.year()).month(d.month()).date(d.date());
  return thisYear.isBefore(today, "day") ? thisYear.add(1, "year") : thisYear;
};

/**
 * Returns number of days until next birthday (0 = today).
 */
export const daysUntilBirthday = (dob) => {
  if (!dob) return null;
  const next = nextBirthday(dob);
  if (!next) return null;
  return next.diff(dayjs().startOf("day"), "day");
};

/**
 * Returns the age a person turns on their next birthday.
 */
export const turningAge = (dob) => {
  if (!dob) return null;
  const d = dayjs(dob);
  return dayjs().year() - d.year() + (isBirthdayToday(dob) ? 0 : 1);
};

/**
 * Given an array of user objects (each with a `dob` field),
 * returns them sorted by how soon their next birthday is.
 * Filters out users with no dob.
 */
export const sortByUpcomingBirthday = (users) =>
  users
    .filter((u) => !!u.dob)
    .map((u) => ({ ...u, _daysUntil: daysUntilBirthday(u.dob) }))
    .sort((a, b) => a._daysUntil - b._daysUntil);

/**
 * Returns users whose birthday falls within the next N days (inclusive of today).
 */
export const birthdaysWithinDays = (users, days = 30) =>
  sortByUpcomingBirthday(users).filter((u) => u._daysUntil <= days);
