const express = require("express");

const router = express.Router();

const authMiddleware = require(
  "../middleware/authMiddleware"
);

const roleMiddleware = require(
  "../middleware/roleMiddleware"
);

const {
  getHRDashboard,
  getEmployeeDashboard,
  getMonthlyAttendance,
} = require(
  "../controllers/dashboardController"
);

/*
|--------------------------------------------------------------------------
| HR Dashboard
|--------------------------------------------------------------------------
*/

router.get(
  "/hr",
  authMiddleware,
  roleMiddleware("HR"),
  getHRDashboard
);

/*
|--------------------------------------------------------------------------
| Employee Dashboard
|--------------------------------------------------------------------------
*/

router.get(
  "/employee",
  authMiddleware,
  getEmployeeDashboard
);

/*
|--------------------------------------------------------------------------
| Monthly Attendance
|--------------------------------------------------------------------------
*/

router.get(
  "/monthly-attendance",
  authMiddleware,
  getMonthlyAttendance
);

module.exports = router;