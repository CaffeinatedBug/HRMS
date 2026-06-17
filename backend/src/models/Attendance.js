const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Employee is required"],
    },

    date: {
      type: Date,
      required: true,
      default: Date.now,
    },

    punchIn: {
      type: Date,
      default: null,
    },

    punchOut: {
      type: Date,
      default: null,
    },

    totalHours: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: [
        "Present",
        "Absent",
        "Late",
        "Half Day",
      ],
      default: "Present",
    },

    ipAddress: {
      type: String,
      default: "",
    },

    deviceInfo: {
      type: String,
      default: "",
    },

    location: {
      type: String,
      default: "",
    },

    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

/*
|--------------------------------------------------------------------------
| Auto Calculate Total Hours
|--------------------------------------------------------------------------
*/

attendanceSchema.pre("save", function () {
  if (this.punchIn && this.punchOut) {
    const diff =
      this.punchOut.getTime() -
      this.punchIn.getTime();

    this.totalHours = Number(
      (diff / (1000 * 60 * 60)).toFixed(2)
    );
  }
});

/*
|--------------------------------------------------------------------------
| Indexes
|--------------------------------------------------------------------------
*/

attendanceSchema.index({
  employee: 1,
  date: -1,
});

attendanceSchema.index({
  status: 1,
});

/*
|--------------------------------------------------------------------------
| Export Model
|--------------------------------------------------------------------------
*/

module.exports = mongoose.model(
  "Attendance",
  attendanceSchema
);