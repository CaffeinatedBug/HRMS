const express =
  require("express");

const router =
  express.Router();

const authMiddleware =
  require(
    "../middleware/authMiddleware"
  );

const roleMiddleware =
  require(
    "../middleware/roleMiddleware"
  );

const {
  attendanceReport,
  leaveReport,
  salaryReport,
} = require(
  "../controllers/reportController"
);

router.get(
  "/attendance",
  authMiddleware,
  roleMiddleware(
    "HR"
  ),
  attendanceReport
);

router.get(
  "/leave",
  authMiddleware,
  roleMiddleware(
    "HR"
  ),
  leaveReport
);

router.get(
  "/salary",
  authMiddleware,
  roleMiddleware(
    "HR"
  ),
  salaryReport
);

module.exports =
  router;