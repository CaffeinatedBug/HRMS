const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const logger = require("../utils/logger");

/*
|--------------------------------------------------------------------------
| Register User
|--------------------------------------------------------------------------
*/

exports.register = async (req, res) => {
  try {
    const {
      employeeId,
      firstName,
      lastName,
      email,
      password,
      phone,
      role,
      dob,
    } = req.body;

    if (!dob) {
      return res.status(400).json({
        success: false,
        message: "Date of birth is required for registration",
      });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    const user = await User.create({
      employeeId,
      firstName,
      lastName,
      email: email.toLowerCase(),
      password,
      phone,
      dob: new Date(dob),
      role: role || "EMPLOYEE",
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        phone: user.phone,
        dob: user.dob,
      },
    });
  } catch (error) {
    logger.error("Register error", { error: error.message, stack: error.stack });

    res.status(500).json({
      success: false,
      message: "Registration failed. Please try again.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Login User
|--------------------------------------------------------------------------
*/

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      email: email.toLowerCase(),
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (user.status !== "Active") {
      return res.status(403).json({
        success: false,
        message: "Account is inactive",
      });
    }

    const isMatch =
      await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    await User.updateOne(
      { _id: user._id },
      { $set: { lastLogin: new Date() } }
    );

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        phone: user.phone,
        status: user.status,
        dob: user.dob ?? null,
      },
    });
  } catch (error) {
    logger.error("Login error", { error: error.message, stack: error.stack });

    res.status(500).json({
      success: false,
      message: "Login failed. Please try again.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Get Logged In User Profile
|--------------------------------------------------------------------------
*/

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(
      req.user._id
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    logger.error("GetProfile error", { error: error.message, stack: error.stack });

    res.status(500).json({
      success: false,
      message: "Failed to fetch profile.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Logout User
|--------------------------------------------------------------------------
*/

exports.logout = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    logger.error("Logout error", { error: error.message, stack: error.stack });

    res.status(500).json({
      success: false,
      message: "Logout failed. Please try again.",
    });
  }
};