const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const { getCalendarEvents } = require("../controllers/calendarController");

/*
|--------------------------------------------------------------------------
| GET /api/calendar/events
|
| Query params:
|   year  (optional, default = current year)
|   month (optional, 1-indexed — if omitted returns full year)
|
| Accessible by all authenticated users.
| Role-based data scoping is handled inside the controller.
|--------------------------------------------------------------------------
*/

router.get("/events", authMiddleware, getCalendarEvents);

module.exports = router;
