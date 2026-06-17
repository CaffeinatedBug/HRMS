const Leave = require("../models/Leave");

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