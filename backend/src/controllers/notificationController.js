const Notification = require(
  "../models/Notification"
);

/*
|--------------------------------------------------------------------------
| Get My Notifications
|--------------------------------------------------------------------------
*/

exports.getMyNotifications =
  async (req, res) => {
    try {
      const notifications =
        await Notification.find({
          recipient:
            req.user._id,
          status: "Active",
        }).sort({
          createdAt: -1,
        });

      res.status(200).json({
        success: true,
        count:
          notifications.length,
        notifications,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  };

/*
|--------------------------------------------------------------------------
| Get Unread Count
|--------------------------------------------------------------------------
*/

exports.getUnreadCount =
  async (req, res) => {
    try {
      const count =
        await Notification.countDocuments(
          {
            recipient:
              req.user._id,
            isRead: false,
            status: "Active",
          }
        );

      res.status(200).json({
        success: true,
        unreadCount: count,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  };

/*
|--------------------------------------------------------------------------
| Mark Single Notification Read
|--------------------------------------------------------------------------
*/

exports.markAsRead =
  async (req, res) => {
    try {
      const notification =
        await Notification.findOne({
          _id:
            req.params.id,
          recipient:
            req.user._id,
        });

      if (!notification) {
        return res.status(404).json({
          success: false,
          message:
            "Notification not found",
        });
      }

      notification.isRead =
        true;

      notification.readAt =
        new Date();

      await notification.save();

      res.status(200).json({
        success: true,
        message:
          "Notification marked as read",
        notification,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  };

/*
|--------------------------------------------------------------------------
| Mark All Notifications Read
|--------------------------------------------------------------------------
*/

exports.markAllAsRead =
  async (req, res) => {
    try {
      await Notification.updateMany(
        {
          recipient:
            req.user._id,
          isRead: false,
        },
        {
          isRead: true,
          readAt:
            new Date(),
        }
      );

      res.status(200).json({
        success: true,
        message:
          "All notifications marked as read",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  };

/*
|--------------------------------------------------------------------------
| Delete Notification
|--------------------------------------------------------------------------
*/

exports.deleteNotification =
  async (req, res) => {
    try {
      const notification =
        await Notification.findOne({
          _id:
            req.params.id,
          recipient:
            req.user._id,
        });

      if (!notification) {
        return res.status(404).json({
          success: false,
          message:
            "Notification not found",
        });
      }

      notification.status =
        "Deleted";

      await notification.save();

      res.status(200).json({
        success: true,
        message:
          "Notification deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  };

/*
|--------------------------------------------------------------------------
| Create Notification (System Use)
|--------------------------------------------------------------------------
*/

exports.createNotification =
  async ({
    recipient,
    title,
    message,
    type = "General",
    sentBy = null,
  }) => {
    return await Notification.create({
      recipient,
      title,
      message,
      type,
      sentBy,
    });
  };