const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    action: {
      type: String,
      required: true,
      trim: true,
    },

    module: {
      type: String,
      enum: [
        "Auth",
        "Attendance",
        "Leave",
        "Salary",
        "Holiday",
        "Profile",
        "Notification",
        "Employee",
        "System",
      ],
      required: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    ipAddress: {
      type: String,
      default: "",
    },

    userAgent: {
      type: String,
      default: "",
    },

    oldData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    newData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    status: {
      type: String,
      enum: [
        "Success",
        "Failed",
        "Warning",
      ],
      default: "Success",
    },
  },
  {
    timestamps: true,
  }
);

/*
|--------------------------------------------------------------------------
| Indexes
|--------------------------------------------------------------------------
*/

auditLogSchema.index({
  user: 1,
  createdAt: -1,
});

auditLogSchema.index({
  module: 1,
  createdAt: -1,
});

module.exports = mongoose.model(
  "AuditLog",
  auditLogSchema
);