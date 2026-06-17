const { body } = require("express-validator");

exports.registerValidation = [
  body("firstName")
    .trim()
    .notEmpty()
    .withMessage("First name is required"),

  body("lastName")
    .trim()
    .notEmpty()
    .withMessage("Last name is required"),

  body("email")
    .trim()
    .isEmail()
    .withMessage("Please enter a valid email")
    .normalizeEmail(),

  body("password")
    .isLength({ min: 6 })
    .withMessage(
      "Password must be at least 6 characters"
    ),

  body("phone")
    .optional()
    .isMobilePhone("en-IN")
    .withMessage(
      "Please enter a valid phone number"
    ),

  body("role")
    .optional()
    .isIn(["HR", "EMPLOYEE"])
    .withMessage("Invalid role"),
];

exports.loginValidation = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Valid email is required"),

  body("password")
    .notEmpty()
    .withMessage("Password is required"),
];