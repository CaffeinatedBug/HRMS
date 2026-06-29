const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: [true, "Employee ID is required"],
      unique: true,
      trim: true,
    },

    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },

    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },

    phone: {
      type: String,
      default: "",
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },

    designation: {
      type: String,
      default: "",
    },

    department: {
      type: String,
      default: "",
    },

    address: {
      type: String,
      default: "",
    },

    profileImage: {
      type: String,
      default: "",
    },

    dob: {
      type: Date,
      default: null,
    },

    // Derived from dob — populated by pre-save hook
    // Used by birthday cron/queries for O(1) indexed lookup
    birthMonth: {
      type: Number, // 1–12
      default: null,
    },

    birthDay: {
      type: Number, // 1–31
      default: null,
    },

    joiningDate: {
      type: Date,
      default: Date.now,
    },

    salary: {
      type: Number,
      default: 0,
    },

    role: {
      type: String,
      enum: ["HR", "EMPLOYEE"],
      default: "EMPLOYEE",
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },

    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

/*
|--------------------------------------------------------------------------
| Auto-populate birthMonth + birthDay from dob
|--------------------------------------------------------------------------
*/

userSchema.pre("save", function () {
  if (this.isModified("dob") && this.dob) {
    const d = new Date(this.dob);
    this.birthMonth = d.getUTCMonth() + 1; // 1-indexed
    this.birthDay   = d.getUTCDate();
  } else if (this.isModified("dob") && !this.dob) {
    this.birthMonth = null;
    this.birthDay   = null;
  }
});

/*
|--------------------------------------------------------------------------
| Hash Password Before Save
|--------------------------------------------------------------------------
*/

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(10);

  this.password = await bcrypt.hash(
    this.password,
    salt
  );
});

/*
|--------------------------------------------------------------------------
| Compare Password
|--------------------------------------------------------------------------
*/

userSchema.methods.matchPassword =
  async function (enteredPassword) {
    return await bcrypt.compare(
      enteredPassword,
      this.password
    );
  };

/*
|--------------------------------------------------------------------------
| Full Name Virtual
|--------------------------------------------------------------------------
*/

userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

/*
|--------------------------------------------------------------------------
| Include Virtuals
|--------------------------------------------------------------------------
*/

userSchema.set("toJSON", {
  virtuals: true,
});

userSchema.set("toObject", {
  virtuals: true,
});

/*
|--------------------------------------------------------------------------
| Indexes
|--------------------------------------------------------------------------
*/

// Compound index for birthday cron — replaces full-collection scan
userSchema.index({ birthMonth: 1, birthDay: 1 });

module.exports = mongoose.model(
  "User",
  userSchema
);