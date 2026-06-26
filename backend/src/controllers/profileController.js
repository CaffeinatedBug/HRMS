const User = require("../models/User");

/*
|--------------------------------------------------------------------------
| Get My Profile
|--------------------------------------------------------------------------
*/

exports.getProfile =
  async (req, res) => {
    try {
      const user =
        await User.findById(
          req.user._id
        );

      res.status(200).json({
        success: true,
        user,
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
| Update My Profile
|
| DOB Rules:
|   - Employees: can set DOB only if it has never been set before (once locked)
|   - HR: can always update DOB on behalf of employees via userController
|   - If employee tries to update an already-set DOB → 403
|--------------------------------------------------------------------------
*/

exports.updateProfile =
  async (req, res) => {
    try {
      const user =
        await User.findById(
          req.user._id
        );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const { dob, ...otherFields } = req.body;

      // ── DOB lock enforcement ──────────────────────────────────────────
      if (dob !== undefined) {
        if (user.dob) {
          // DOB already set — employee cannot change it
          return res.status(403).json({
            success: false,
            message:
              "Date of birth is locked and cannot be changed. Contact HR to update your DOB.",
          });
        }

        // First-time DOB save — allowed
        user.dob = new Date(dob);
      }

      // ── Apply remaining safe fields ────────────────────────────────────
      // Strip fields that employees must never be able to self-update
      const PROTECTED = [
        "role", "status", "employeeId", "salary",
        "designation", "department", "joiningDate",
        "firstName", "lastName", "email", "password",
        "birthMonth", "birthDay",
      ];

      for (const [key, value] of Object.entries(otherFields)) {
        if (!PROTECTED.includes(key)) {
          user[key] = value;
        }
      }

      await user.save();

      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        user,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

/*
|--------------------------------------------------------------------------
| Complete Profile (DOB First-Time Setup)
|
| POST /api/users/complete-profile
|
| Used by the "Complete Profile" wall shown to users without a DOB.
| Only accepts dob — nothing else.
|--------------------------------------------------------------------------
*/

exports.completeProfile =
  async (req, res) => {
    try {
      const { dob } = req.body;

      if (!dob) {
        return res.status(400).json({
          success: false,
          message: "Date of birth is required",
        });
      }

      const user = await User.findById(req.user._id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      if (user.dob) {
        return res.status(403).json({
          success: false,
          message:
            "Date of birth is already set. Contact HR if you need to change it.",
        });
      }

      user.dob = new Date(dob);
      await user.save();

      res.status(200).json({
        success: true,
        message: "Profile completed successfully",
        user,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };