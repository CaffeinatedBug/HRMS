const Holiday = require("../models/Holiday");

/*
|--------------------------------------------------------------------------
| Add Holiday
|--------------------------------------------------------------------------
*/

exports.addHoliday = async (
  req,
  res
) => {
  try {
    const {
      title,
      description,
      holidayDate,
      holidayType,
      isPaidHoliday,
    } = req.body;

    const holiday =
      await Holiday.create({
        title,
        description,
        holidayDate,
        holidayType,
        isPaidHoliday,
        createdBy: req.user._id,
      });

    res.status(201).json({
      success: true,
      message:
        "Holiday added successfully",
      holiday,
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
| Get All Holidays
|--------------------------------------------------------------------------
*/

exports.getAllHolidays =
  async (req, res) => {
    try {
      const holidays =
        await Holiday.find({
          status: "Active",
        }).sort({
          holidayDate: 1,
        });

      res.status(200).json({
        success: true,
        count: holidays.length,
        holidays,
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
| Get Upcoming Holidays
|--------------------------------------------------------------------------
*/

exports.getUpcomingHolidays =
  async (req, res) => {
    try {
      const today = new Date();

      const holidays =
        await Holiday.find({
          holidayDate: {
            $gte: today,
          },
          status: "Active",
        }).sort({
          holidayDate: 1,
        });

      res.status(200).json({
        success: true,
        holidays,
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
| Update Holiday
|--------------------------------------------------------------------------
*/

exports.updateHoliday =
  async (req, res) => {
    try {
      const holiday =
        await Holiday.findByIdAndUpdate(
          req.params.id,
          req.body,
          {
            new: true,
          }
        );

      if (!holiday) {
        return res.status(404).json({
          success: false,
          message:
            "Holiday not found",
        });
      }

      res.status(200).json({
        success: true,
        message:
          "Holiday updated successfully",
        holiday,
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
| Delete Holiday
|--------------------------------------------------------------------------
*/

exports.deleteHoliday =
  async (req, res) => {
    try {
      const holiday =
        await Holiday.findById(
          req.params.id
        );

      if (!holiday) {
        return res.status(404).json({
          success: false,
          message:
            "Holiday not found",
        });
      }

      holiday.status =
        "Inactive";

      await holiday.save();

      res.status(200).json({
        success: true,
        message:
          "Holiday deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  };