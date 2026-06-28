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

const {
  completeProfile,
  updateProfile: updateOwnProfile,
} = require(
  "../controllers/profileController"
);

/*
|--------------------------------------------------------------------------
| Profile
|--------------------------------------------------------------------------
*/

router.put(
  "/profile",
  authMiddleware,
  updateOwnProfile
);

/*
|--------------------------------------------------------------------------
| Complete Profile (First-time DOB wall)
|
| POST /api/users/complete-profile
| Allows any authenticated user to set their DOB for the first time.
|--------------------------------------------------------------------------
*/

router.post(
  "/complete-profile",
  authMiddleware,
  completeProfile
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