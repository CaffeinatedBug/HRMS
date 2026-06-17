const mongoose = require("mongoose");

const holidaySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Holiday title is required"],
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    holidayDate: {
      type: Date,
      required: [true, "Holiday date is required"],
    },

    holidayType: {
      type: String,
      enum: [
        "National",
        "Festival",
        "Company",
        "Optional"
      ],
      default: "Festival",
    },

    isPaidHoliday: {
      type: Boolean,
      default: true,
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
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

holidaySchema.index({
  holidayDate: 1,
});

module.exports = mongoose.model(
  "Holiday",
  holidaySchema
);