const User = require(
  "../models/User"
);

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
|--------------------------------------------------------------------------
*/

exports.updateProfile =
  async (req, res) => {
    try {
      const user =
        await User.findById(
          req.user._id
        );

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