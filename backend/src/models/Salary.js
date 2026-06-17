const mongoose = require("mongoose");

const salarySchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },

    year: {
      type: Number,
      required: true,
    },

    basicSalary: {
      type: Number,
      required: true,
      default: 0,
    },

    allowances: {
      type: Number,
      default: 0,
    },

    bonus: {
      type: Number,
      default: 0,
    },

    deductions: {
      type: Number,
      default: 0,
    },

    workingDays: {
      type: Number,
      default: 0,
    },

    presentDays: {
      type: Number,
      default: 0,
    },

    absentDays: {
      type: Number,
      default: 0,
    },

    leaveDays: {
      type: Number,
      default: 0,
    },

    netSalary: {
      type: Number,
      default: 0,
    },

    paymentStatus: {
      type: String,
      enum: [
        "Pending",
        "Processed",
        "Paid"
      ],
      default: "Pending",
    },

    paymentDate: {
      type: Date,
      default: null,
    },

    remarks: {
      type: String,
      default: "",
    },

    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    }
  },
  {
    timestamps: true,
  }
);

/*
|--------------------------------------------------------------------------
| Auto Calculate Net Salary
|--------------------------------------------------------------------------
*/

salarySchema.pre("save", function (next) {
  this.netSalary =
    this.basicSalary +
    this.allowances +
    this.bonus -
    this.deductions;

  next();
});

/*
|--------------------------------------------------------------------------
| One Salary Record Per Employee Per Month
|--------------------------------------------------------------------------
*/

salarySchema.index(
  {
    employee: 1,
    month: 1,
    year: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model(
  "Salary",
  salarySchema
);