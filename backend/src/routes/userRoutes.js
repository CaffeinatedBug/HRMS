const express = require("express");

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
  getAllUsers,
  getUserById,
  updateProfile,
} = require(
  "../controllers/userController"
);

/*
|--------------------------------------------------------------------------
| Profile
|--------------------------------------------------------------------------
*/

router.put(
  "/profile",
  authMiddleware,
  updateProfile
);

/*
|--------------------------------------------------------------------------
| HR Only
|--------------------------------------------------------------------------
*/

router.get(
  "/all",
  authMiddleware,
  roleMiddleware("HR"),
  getAllUsers
);

router.get(
  "/:id",
  authMiddleware,
  roleMiddleware("HR"),
  getUserById
);

module.exports = router;