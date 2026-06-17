const Attendance =
  require(
    "../models/Attendance"
  );

const Leave = require(
  "../models/Leave"
);

const Salary = require(
  "../models/Salary"
);

/*
|--------------------------------------------------------------------------
| Attendance Report
|--------------------------------------------------------------------------
*/

exports.attendanceReport =
  async (req, res) => {
    try {
      const report =
        await Attendance.find()
          .populate(
            "employee",
            "firstName lastName"
          );

      res.status(200).json({
        success: true,
        report,
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
| Leave Report
|--------------------------------------------------------------------------
*/

exports.leaveReport =
  async (req, res) => {
    try {
      const report =
        await Leave.find()
          .populate(
            "employee",
            "firstName lastName"
          );

      res.status(200).json({
        success: true,
        report,
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
| Salary Report
|--------------------------------------------------------------------------
*/

exports.salaryReport =
  async (req, res) => {
    try {
      const report =
        await Salary.find()
          .populate(
            "employee",
            "firstName lastName"
          );

      res.status(200).json({
        success: true,
        report,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  };