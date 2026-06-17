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
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  approveLeave,
  rejectLeave,
} = require(
  "../controllers/leaveController"
);


router.post(
  "/apply",
  authMiddleware,
  applyLeave
);

router.get(
  "/my-leaves",
  authMiddleware,
  getMyLeaves
);


router.get(
  "/all",
  authMiddleware,
  roleMiddleware("HR"),
  getAllLeaves
);

router.put(
  "/approve/:id",
  authMiddleware,
  roleMiddleware("HR"),
  approveLeave
);

router.put(
  "/reject/:id",
  authMiddleware,
  roleMiddleware("HR"),
  rejectLeave
);

module.exports = router;