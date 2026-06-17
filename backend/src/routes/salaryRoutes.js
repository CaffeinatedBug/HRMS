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

router.get(
  "/:id",
  authMiddleware,
  getSalaryById
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

router.get(
  "/all",
  authMiddleware,
  roleMiddleware("HR"),
  getAllSalaries
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