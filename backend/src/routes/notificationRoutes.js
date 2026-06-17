const express = require("express");

const router = express.Router();

const authMiddleware = require(
  "../middleware/authMiddleware"
);

const {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require(
  "../controllers/notificationController"
);

/*
|--------------------------------------------------------------------------
| Get All Notifications
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  authMiddleware,
  getMyNotifications
);

/*
|--------------------------------------------------------------------------
| Get Unread Notification Count
|--------------------------------------------------------------------------
*/

router.get(
  "/unread-count",
  authMiddleware,
  getUnreadCount
);

/*
|--------------------------------------------------------------------------
| Mark Single Notification As Read
|--------------------------------------------------------------------------
*/

router.put(
  "/read/:id",
  authMiddleware,
  markAsRead
);

/*
|--------------------------------------------------------------------------
| Mark All Notifications As Read
|--------------------------------------------------------------------------
*/

router.put(
  "/read-all",
  authMiddleware,
  markAllAsRead
);

/*
|--------------------------------------------------------------------------
| Delete Notification
|--------------------------------------------------------------------------
*/

router.delete(
  "/delete/:id",
  authMiddleware,
  deleteNotification
);

module.exports = router;