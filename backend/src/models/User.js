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

module.exports = mongoose.model(
  "User",
  userSchema
);