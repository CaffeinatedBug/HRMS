const User = require("../models/User");
const Attendance = require("../models/Attendance");
const Leave = require("../models/Leave");
const Holiday = require("../models/Holiday");
const Notification = require("../models/Notification");
const Salary = require("../models/Salary");

/*
|--------------------------------------------------------------------------
| HR Dashboard
|--------------------------------------------------------------------------
*/

exports.getHRDashboard = async (
  req,
  res
) => {
  try {
    const today = new Date();

    const startOfDay = new Date(
      today.setHours(0, 0, 0, 0)
    );

    const endOfDay = new Date(
      today.setHours(23, 59, 59, 999)
    );

    const totalEmployees =
      await User.countDocuments({
        role: "EMPLOYEE",
        status: "Active",
      });

    const presentToday =
      await Attendance.countDocuments({
        date: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      });

    const pendingLeaves =
      await Leave.countDocuments({
        status: "Pending",
      });

    const upcomingHolidays =
      await Holiday.find({
        holidayDate: {
          $gte: new Date(),
        },
        status: "Active",
      })
        .sort({
          holidayDate: 1,
        })
        .limit(5);

    res.status(200).json({
      success: true,

      data: {
        totalEmployees,

        presentToday,

        absentToday:
          totalEmployees -
          presentToday,

        pendingLeaves,

        upcomingHolidays,
      },
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
| Employee Dashboard
|--------------------------------------------------------------------------
*/

exports.getEmployeeDashboard =
  async (req, res) => {
    try {
      const employeeId =
        req.user._id;

      const today =
        new Date();

      const startOfDay =
        new Date();

      startOfDay.setHours(
        0,
        0,
        0,
        0
      );

      const endOfDay =
        new Date();

      endOfDay.setHours(
        23,
        59,
        59,
        999
      );

      const todayAttendance =
        await Attendance.findOne({
          employee:
            employeeId,
          date: {
            $gte:
              startOfDay,
            $lte:
              endOfDay,
          },
        });

      const leaveCount =
        await Leave.countDocuments(
          {
            employee:
              employeeId,
          }
        );

      const unreadNotifications =
        await Notification.countDocuments(
          {
            recipient:
              employeeId,
            isRead:
              false,
          }
        );

      const latestSalary =
        await Salary.findOne({
          employee:
            employeeId,
        }).sort({
          year: -1,
          month: -1,
        });

      const upcomingHolidays =
        await Holiday.find({
          holidayDate: {
            $gte:
              new Date(),
          },
          status:
            "Active",
        })
          .sort({
            holidayDate: 1,
          })
          .limit(5);

      res.status(200).json({
        success: true,

        data: {
          todayAttendance,

          leaveCount,

          unreadNotifications,

          latestSalary,

          upcomingHolidays,
        },
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
| Monthly Attendance Summary
|--------------------------------------------------------------------------
*/

exports.getMonthlyAttendance =
  async (req, res) => {
    try {
      const employeeId =
        req.user._id;

      const now =
        new Date();

      const startDate =
        new Date(
          now.getFullYear(),
          now.getMonth(),
          1
        );

      const endDate =
        new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          0
        );

      const attendance =
        await Attendance.find({
          employee:
            employeeId,
          date: {
            $gte:
              startDate,
            $lte:
              endDate,
          },
        });

      res.status(200).json({
        success: true,
        count:
          attendance.length,
        attendance,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  };