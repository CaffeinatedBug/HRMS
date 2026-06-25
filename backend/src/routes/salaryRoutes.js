const express = require("express");

const router = express.Router();

const authMiddleware = require(
  "../middleware/authMiddleware"
);

const roleMiddleware = require(
  "../middleware/roleMiddleware"
);

const {
  generateSalary,
  getMySalaries,
  getSalaryById,
  getAllSalaries,
  confirmSalary,
  updateSalary,
  deleteSalary,
} = require(
  "../controllers/salaryController"
);

/*
|--------------------------------------------------------------------------
| Employee Routes
|--------------------------------------------------------------------------
*/

router.get(
  "/my-salaries",
  authMiddleware,
  getMySalaries
);

/*
|--------------------------------------------------------------------------
| HR Routes
|--------------------------------------------------------------------------
*/

router.post(
  "/generate",
  authMiddleware,
  roleMiddleware("HR"),
  generateSalary
);

// NOTE: /all must be registered BEFORE /:id, otherwise Express matches
// "all" as a param value and the controller throws an ObjectId cast error.
router.get(
  "/all",
  authMiddleware,
  roleMiddleware("HR"),
  getAllSalaries
);

router.get(
  "/:id",
  authMiddleware,
  getSalaryById
);

router.put(
  "/confirm/:id",
  authMiddleware,
  roleMiddleware("HR"),
  confirmSalary
);

router.put(
  "/update/:id",
  authMiddleware,
  roleMiddleware("HR"),
  updateSalary
);

router.delete(
  "/delete/:id",
  authMiddleware,
  roleMiddleware("HR"),
  deleteSalary
);

module.exports = router;