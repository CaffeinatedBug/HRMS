const Notification = require("../models/Notification");

/*
|--------------------------------------------------------------------------
| NotificationService
|
| Centralized notification pipeline. Every module that needs to notify
| a user MUST go through this service instead of calling Notification.create
| or socket.emit directly.
|
| Flow:
|   caller → notificationService.send() → DB insert → socket emit to user room
|--------------------------------------------------------------------------
*/

const notificationService = {
  /**
   * Create a DB notification record and emit it via Socket.io in real-time.
   *
   * @param {object}   opts
   * @param {string}   opts.recipient  - MongoDB ObjectId of the target user
   * @param {string}   opts.title      - Notification title
   * @param {string}   opts.message    - Notification body text
   * @param {string}  [opts.type]      - One of: Birthday | Leave | Salary | Holiday | Attendance | General
   * @param {string}  [opts.sentBy]    - ObjectId of the acting user (HR, system, etc.)
   * @returns {Promise<Document>}      - The saved Notification document
   */
  async send({ recipient, title, message, type = "General", sentBy = null }) {
    try {
      // 1. Persist to DB
      const notification = await Notification.create({
        recipient,
        title,
        message,
        type,
        sentBy,
      });

      // 2. Emit in real-time via Socket.io (lazy-require avoids circular dep)
      try {
        const { getIO } = require("../config/socket");
        const io = getIO();

        // Emit to the recipient's private room (userId string)
        io.to(String(recipient)).emit("notification", {
          _id: notification._id,
          title,
          message,
          type,
          isRead: false,
          createdAt: notification.createdAt,
        });
      } catch (socketErr) {
        // Socket not yet initialized or user offline — DB record is enough
        console.warn("NotificationService: socket emit skipped —", socketErr.message);
      }

      return notification;
    } catch (err) {
      console.error("NotificationService.send error:", err);
      throw err;
    }
  },

  /**
   * Broadcast a notification to multiple recipients.
   * Each recipient gets their own DB record and socket event.
   *
   * @param {string[]} recipientIds
   * @param {object}   opts - same as send() minus recipient
   */
  async broadcast(recipientIds, opts) {
    const results = await Promise.allSettled(
      recipientIds.map((id) => this.send({ ...opts, recipient: id }))
    );

    const failed = results.filter((r) => r.status === "rejected");
    if (failed.length) {
      console.error(
        `NotificationService.broadcast: ${failed.length} of ${recipientIds.length} failed`
      );
    }

    return results;
  },
};

module.exports = notificationService;
