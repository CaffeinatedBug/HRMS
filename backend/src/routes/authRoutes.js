const express = require("express");

const router = express.Router();

const {
  register,
  login,
  getProfile,
  logout,
} = require(
  "../controllers/authController"
);

const authMiddleware = require(
  "../middleware/authMiddleware"
);

const validateMiddleware = require(
  "../middleware/validateMiddleware"
);

const {
  registerValidation,
  loginValidation,
} = require(
  "../validations/authValidation"
);

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

router.post(
  "/register",
  registerValidation,
  validateMiddleware,
  register
);

router.post(
  "/login",
  loginValidation,
  validateMiddleware,
  login
);

/*
|--------------------------------------------------------------------------
| Protected Routes
|--------------------------------------------------------------------------
*/

router.get(
  "/profile",
  authMiddleware,
  getProfile
);

router.post(
  "/logout",
  authMiddleware,
  logout
);

module.exports = router;