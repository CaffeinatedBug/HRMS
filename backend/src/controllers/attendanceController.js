const Attendance = require(
  "../models/Attendance"
);

const AuditLog = require(
  "../models/AuditLog"
);

/*
|--------------------------------------------------------------------------
| Punch In
|--------------------------------------------------------------------------
*/

exports.punchIn = async (
  req,
  res
) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(
      0,
      0,
      0,
      0
    );

    const endOfDay = new Date();
    endOfDay.setHours(
      23,
      59,
      59,
      999
    );

    const existingAttendance =
      await Attendance.findOne({
        employee: req.user._id,
        date: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message:
          "Already punched in today",
      });
    }

    const attendance =
      await Attendance.create({
        employee: req.user._id,
        date: new Date(),
        punchIn: new Date(),
        ipAddress:
          req.headers[
            "x-forwarded-for"
          ] ||
          req.socket.remoteAddress,
        deviceInfo:
          req.body.deviceInfo || "",
      });

    await AuditLog.create({
      user: req.user._id,
      action: "PUNCH_IN",
      module: "Attendance",
      description:
        "Employee punched in",
      status: "Success",
    });

    res.status(201).json({
      success: true,
      message:
        "Punch In successful",
      attendance,
    });
  } catch (error) {
      console.log("================================");
  console.log("PUNCH IN ERROR");
  console.log(error);
  console.log(error.stack);
  console.log("================================");
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| Punch Out
|--------------------------------------------------------------------------
*/

exports.punchOut = async (
  req,
  res
) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(
      0,
      0,
      0,
      0
    );

    const endOfDay = new Date();
    endOfDay.setHours(
      23,
      59,
      59,
      999
    );

    const attendance =
      await Attendance.findOne({
        employee: req.user._id,
        date: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message:
          "No attendance found",
      });
    }

    if (attendance.punchOut) {
      return res.status(400).json({
        success: false,
        message:
          "Already punched out",
      });
    }

    attendance.punchOut =
      new Date();

    const diff =
      attendance.punchOut -
      attendance.punchIn;

    attendance.totalHours =
      (
        diff /
        (1000 * 60 * 60)
      ).toFixed(2);

    await attendance.save();

    await AuditLog.create({
      user: req.user._id,
      action: "PUNCH_OUT",
      module: "Attendance",
      description:
        "Employee punched out",
      status: "Success",
    });

    res.status(200).json({
      success: true,
      message:
        "Punch Out successful",
      attendance,
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
| Today's Attendance
|--------------------------------------------------------------------------
*/

exports.todayAttendance =
  async (req, res) => {
    try {
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

      const attendance =
        await Attendance.findOne({
          employee:
            req.user._id,
          date: {
            $gte:
              startOfDay,
            $lte:
              endOfDay,
          },
        });

      res.status(200).json({
        success: true,
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

/*
|--------------------------------------------------------------------------
| Attendance History
|--------------------------------------------------------------------------
*/

exports.attendanceHistory =
  async (req, res) => {
    try {
      const attendance =
        await Attendance.find({
          employee:
            req.user._id,
        })
          .sort({
            date: -1,
          })
          .populate(
            "employee",
            "firstName lastName email"
          );

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