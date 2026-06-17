const express = require("express");

const router =
  express.Router();

const authMiddleware = require(
  "../middleware/authMiddleware"
);

const officeWifiMiddleware = require(
  "../middleware/officeWifiMiddleware"
);

const {
  punchIn,
  punchOut,
  todayAttendance,
  attendanceHistory,
} = require(
  "../controllers/attendanceController"
);

router.post(
  "/punch-in",
  authMiddleware,
  officeWifiMiddleware,
  punchIn
);

router.post(
  "/punch-out",
  authMiddleware,
  officeWifiMiddleware,
  punchOut
);

router.get(
  "/today",
  authMiddleware,
  todayAttendance
);

router.get(
  "/history",
  authMiddleware,
  attendanceHistory
);

module.exports = router;