const cron = require("node-cron");
const dayjs = require("dayjs");
const User = require("../models/User");
const notificationService = require("../services/notificationService");

/*
|--------------------------------------------------------------------------
| Birthday Cache
|
| DB is queried ONCE per day at 00:01. All subsequent requests reuse
| the in-memory cache until the next day.
|
| Structure:
|   birthdayCache = {
|     date: "2026-06-26",          // today's date (invalidation key)
|     birthdays: [                 // employees whose birthday is today
|       { _id, firstName, lastName, dob, email }
|     ]
|   }
|--------------------------------------------------------------------------
*/

let birthdayCache = {
  date: null,
  birthdays: [],
};

/*
|--------------------------------------------------------------------------
| refreshBirthdayCache
|
| Queries DB only if cache is stale (date mismatch).
| Exported so calendarController can call it for /api/calendar/events.
|--------------------------------------------------------------------------
*/

const refreshBirthdayCache = async () => {
  const today = dayjs().format("YYYY-MM-DD");

  if (birthdayCache.date === today) {
    return birthdayCache; // cache hit — no DB query
  }

  const todayMonth = dayjs().month() + 1; // 1-indexed
  const todayDay = dayjs().date();

  // Uses compound index { birthMonth: 1, birthDay: 1 } — no full scan
  const todaysBirthdays = await User.find(
    { birthMonth: todayMonth, birthDay: todayDay },
    "firstName lastName dob email _id"
  ).lean();

  birthdayCache = { date: today, birthdays: todaysBirthdays };

  console.log(
    `🎂 Birthday cache refreshed for ${today}: ${todaysBirthdays.length} birthday(s)`
  );

  return birthdayCache;
};

/*
|--------------------------------------------------------------------------
| getBirthdayCache
|
| Returns the current cache (possibly stale — caller decides to refresh).
| Used by calendarController for fast reads.
|--------------------------------------------------------------------------
*/

const getBirthdayCache = () => birthdayCache;

/*
|--------------------------------------------------------------------------
| birthdayCron
|
| Runs at 00:01 every day.
|
| Notification logic:
|   - Birthday person → personal birthday message (celebrate yourself!)
|   - All OTHER employees → "It's [name]'s birthday today" notification
|   - Never notifies a person about their own birthday in the colleague flow
|--------------------------------------------------------------------------
*/

const birthdayCron = () => {
  cron.schedule("1 0 * * *", async () => {
    try {
      const cache = await refreshBirthdayCache();

      if (cache.birthdays.length === 0) {
        console.log("🎂 Birthday cron: no birthdays today");
        return;
      }

      // Fetch all active users for colleague notifications
      const allUsers = await User.find({}, "_id").lean();
      const allUserIds = allUsers.map((u) => String(u._id));

      for (const birthdayPerson of cache.birthdays) {
        const pid = String(birthdayPerson._id);
        const fullName = `${birthdayPerson.firstName} ${birthdayPerson.lastName}`;

        // 1. Notify the birthday person
        await notificationService.send({
          recipient: birthdayPerson._id,
          title: "🎂 Happy Birthday!",
          message: `Wishing you a fantastic birthday, ${birthdayPerson.firstName}! The whole team celebrates with you.`,
          type: "Birthday",
        });

        // 2. Notify all OTHER employees (not the birthday person)
        const colleagues = allUserIds.filter((id) => id !== pid);
        await notificationService.broadcast(colleagues, {
          title: `🎉 It's ${fullName}'s Birthday!`,
          message: `Today is ${fullName}'s birthday. Send them your wishes! 🎂`,
          type: "Birthday",
        });
      }

      console.log(
        `🎂 Birthday cron complete: notified for ${cache.birthdays.length} birthday(s)`
      );
    } catch (error) {
      console.error("Birthday cron error:", error);
    }
  });
};

module.exports = birthdayCron;
module.exports.refreshBirthdayCache = refreshBirthdayCache;
module.exports.getBirthdayCache = getBirthdayCache;