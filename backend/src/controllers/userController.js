const User = require(
  "../models/User"
);

/*
|--------------------------------------------------------------------------
| Get All Users
|--------------------------------------------------------------------------
*/

exports.getAllUsers =
  async (req, res) => {
    try {
      const users =
        await User.find().sort(
          {
            createdAt:
              -1,
          }
        );

      res.status(200).json({
        success: true,
        count:
          users.length,
        users,
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
| Get User By Id
|--------------------------------------------------------------------------
*/

exports.getUserById =
  async (req, res) => {
    try {
      const user =
        await User.findById(
          req.params.id
        );

      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "User not found",
        });
      }

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
| Update Profile
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
          message:
            "User not found",
        });
      }

      Object.assign(
        user,
        req.body
      );

      await user.save();

      res.status(200).json({
        success: true,
        message:
          "Profile updated successfully",
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