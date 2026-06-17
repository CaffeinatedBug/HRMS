const express = require("express");

const router = express.Router();

const authMiddleware = require(
  "../middleware/authMiddleware"
);

const roleMiddleware = require(
  "../middleware/roleMiddleware"
);

const {
  addHoliday,
  getAllHolidays,
  getUpcomingHolidays,
  updateHoliday,
  deleteHoliday,
} = require(
  "../controllers/holidayController"
);

/*
|--------------------------------------------------------------------------
| Employee + HR Routes
|--------------------------------------------------------------------------
*/

router.get(
  "/all",
  authMiddleware,
  getAllHolidays
);

router.get(
  "/upcoming",
  authMiddleware,
  getUpcomingHolidays
);

/*
|--------------------------------------------------------------------------
| HR Only Routes
|--------------------------------------------------------------------------
*/

router.post(
  "/add",
  authMiddleware,
  roleMiddleware("HR"),
  addHoliday
);

router.put(
  "/update/:id",
  authMiddleware,
  roleMiddleware("HR"),
  updateHoliday
);

router.delete(
  "/delete/:id",
  authMiddleware,
  roleMiddleware("HR"),
  deleteHoliday
);

module.exports = router;