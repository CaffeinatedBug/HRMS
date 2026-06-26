const Holiday = require("../models/Holiday");
const Leave = require("../models/Leave");
const {
  refreshBirthdayCache,
  getBirthdayCache,
} = require("../cron/birthdayCron");

/*
|--------------------------------------------------------------------------
| GET /api/calendar/events
|
| Unified calendar event aggregator.
|
| Returns all events for a given year/month (or full year if no month given):
|   - Holidays    → from DB (static, low churn)
|   - Birthdays   → from in-memory daily cache (no extra DB query)
|   - Leaves      → from DB (dynamic; employee sees own, HR sees all)
|
| Response shape:
| {
|   success: true,
|   events: [
|     { id, title, date, type }   // type: "holiday" | "birthday" | "leave"
|   ]
| }
|--------------------------------------------------------------------------
*/

exports.getCalendarEvents = async (req, res) => {
  try {
    const {
      year = new Date().getFullYear(),
      month, // optional — 1-indexed; if omitted returns full year
    } = req.query;

    const y = Number(year);

    // ── Date range filter ────────────────────────────────────────────────

    let rangeStart, rangeEnd;

    if (month) {
      const m = Number(month);
      rangeStart = new Date(y, m - 1, 1);
      rangeEnd = new Date(y, m, 0, 23, 59, 59, 999); // last day of month
    } else {
      rangeStart = new Date(y, 0, 1);
      rangeEnd = new Date(y, 11, 31, 23, 59, 59, 999);
    }

    // ── 1. Holidays (DB query — filtered by range) ───────────────────────

    const holidays = await Holiday.find({
      status: "Active",
      holidayDate: { $gte: rangeStart, $lte: rangeEnd },
    })
      .select("title holidayDate holidayType")
      .lean();

    const holidayEvents = holidays.map((h) => ({
      id: String(h._id),
      title: h.title,
      date: h.holidayDate,
      type: "holiday",
      subtype: h.holidayType ?? "Public",
    }));

    // ── 2. Birthdays (from in-memory cache — no DB query) ────────────────
    // Cache auto-refreshes if stale.

    const cache = await refreshBirthdayCache();

    // For the calendar we also want upcoming birthdays this month/year,
    // not just today. So we do one additional lean query for DOBs only.
    // For the calendar we want all birthdays that fall in the month/year view.
    // Use birthMonth index for an efficient range query.
    const birthdayQuery = month
      ? { birthMonth: Number(month), birthDay: { $exists: true, $ne: null } }
      : { birthMonth: { $exists: true, $ne: null }, birthDay: { $exists: true, $ne: null } };

    const allUsersWithDob = await require("../models/User")
      .find(birthdayQuery, "firstName lastName dob birthMonth birthDay _id")
      .lean();

    const birthdayEvents = [];

    for (const u of allUsersWithDob) {
      // Use pre-computed indexed fields — no date parsing needed
      const bMonth = u.birthMonth;
      const bDay   = u.birthDay;
      if (!bMonth || !bDay) continue;

      const birthdayThisYear = new Date(y, bMonth - 1, bDay);

      if (birthdayThisYear >= rangeStart && birthdayThisYear <= rangeEnd) {
        birthdayEvents.push({
          id: `bday-${u._id}`,
          title: `🎂 ${u.firstName} ${u.lastName}'s Birthday`,
          date: birthdayThisYear,
          type: "birthday",
        });
      }
    }

    // ── 3. Leaves (DB query — role-scoped) ──────────────────────────────

    const leaveQuery = {
      status: "Approved",
      fromDate: { $lte: rangeEnd },
      toDate: { $gte: rangeStart },
    };

    // Employees see only their own approved leaves
    if (req.user.role !== "HR") {
      leaveQuery.employee = req.user._id;
    }

    const leaves = await Leave.find(leaveQuery)
      .select("employee leaveType fromDate toDate totalDays")
      .populate("employee", "firstName lastName")
      .lean();

    const leaveEvents = leaves.map((l) => {
      const name =
        req.user.role === "HR"
          ? `${l.employee?.firstName ?? ""} ${l.employee?.lastName ?? ""}`.trim()
          : "My Leave";

      return {
        id: String(l._id),
        title: `${name} — ${l.leaveType}`,
        date: l.fromDate,
        endDate: l.toDate,
        type: "leave",
        totalDays: l.totalDays,
      };
    });

    // ── Merge + sort chronologically ─────────────────────────────────────

    const events = [
      ...holidayEvents,
      ...birthdayEvents,
      ...leaveEvents,
    ].sort((a, b) => new Date(a.date) - new Date(b.date));

    res.status(200).json({
      success: true,
      count: events.length,
      events,
      meta: {
        year: y,
        month: month ? Number(month) : null,
        holidayCount: holidayEvents.length,
        birthdayCount: birthdayEvents.length,
        leaveCount: leaveEvents.length,
        birthdayCacheDate: cache.date,
      },
    });
  } catch (error) {
    console.error("calendarController.getCalendarEvents error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
