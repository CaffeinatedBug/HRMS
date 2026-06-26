const Leave = require("../models/Leave");
const dayjs = require("dayjs");
const notificationService = require("../services/notificationService");

/*
|--------------------------------------------------------------------------
| Apply Leave
|--------------------------------------------------------------------------
*/

exports.applyLeave = async (
  req,
  res
) => {
  try {
    const {
      leaveType,
      fromDate,
      toDate,
      totalDays,
      reason,
    } = req.body;

    const leave =
      await Leave.create({
        employee: req.user._id,

        leaveType,

        fromDate,

        toDate,

        totalDays,

        reason,
      });

    res.status(201).json({
      success: true,
      message:
        "Leave applied successfully",

      leave,
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
| My Leaves
|--------------------------------------------------------------------------
*/

exports.getMyLeaves =
  async (req, res) => {
    try {
      const leaves =
        await Leave.find({
          employee:
            req.user._id,
        }).sort({
          createdAt: -1,
        });

      res.status(200).json({
        success: true,
        count: leaves.length,
        leaves,
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
| HR View All Leaves
|--------------------------------------------------------------------------
*/

exports.getAllLeaves =
  async (req, res) => {
    try {
      const leaves =
        await Leave.find()
          .populate(
            "employee",
            "firstName lastName email"
          )
          .sort({
            createdAt: -1,
          });

      res.status(200).json({
        success: true,
        count: leaves.length,
        leaves,
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
| Approve Leave
|--------------------------------------------------------------------------
*/

exports.approveLeave =
  async (req, res) => {
    try {
      const leave =
        await Leave.findById(
          req.params.id
        );

      if (!leave) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Leave not found",
          });
      }

      leave.status =
        "Approved";

      leave.approvedBy =
        req.user._id;

      leave.approvedAt =
        new Date();

      await leave.save();

      // Notify employee
      await notificationService.send({
        recipient: leave.employee,
        title: "Leave Approved ✅",
        message: `Your ${leave.leaveType} leave from ${dayjs(leave.fromDate).format("DD MMM")} to ${dayjs(leave.toDate).format("DD MMM YYYY")} has been approved.`,
        type: "Leave",
        sentBy: req.user._id,
      }).catch(console.error);

      res.status(200).json({
        success: true,
        message:
          "Leave approved successfully",

        leave,
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
| Reject Leave
|--------------------------------------------------------------------------
*/

exports.rejectLeave =
  async (req, res) => {
    try {
      const leave =
        await Leave.findById(
          req.params.id
        );

      if (!leave) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Leave not found",
          });
      }

      leave.status =
        "Rejected";

      leave.approvedBy =
        req.user._id;

      leave.approvedAt =
        new Date();

      await leave.save();

      // Notify employee
      await notificationService.send({
        recipient: leave.employee,
        title: "Leave Rejected ❌",
        message: `Your ${leave.leaveType} leave request from ${dayjs(leave.fromDate).format("DD MMM")} to ${dayjs(leave.toDate).format("DD MMM YYYY")} has been rejected.`,
        type: "Leave",
        sentBy: req.user._id,
      }).catch(console.error);

      res.status(200).json({
        success: true,
        message:
          "Leave rejected successfully",

        leave,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  };