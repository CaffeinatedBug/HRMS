const Salary = require("../models/Salary");

/*
|--------------------------------------------------------------------------
| Generate Salary
|--------------------------------------------------------------------------
*/

exports.generateSalary = async (
  req,
  res
) => {
  try {
    const {
      employee,
      month,
      year,
      basicSalary,
      allowances,
      bonus,
      deductions,
      workingDays,
      presentDays,
      absentDays,
      leaveDays,
      remarks,
    } = req.body;

    const existingSalary =
      await Salary.findOne({
        employee,
        month,
        year,
      });

    if (existingSalary) {
      return res.status(400).json({
        success: false,
        message:
          "Salary already generated for this month",
      });
    }

    const salary =
      await Salary.create({
        employee,
        month,
        year,
        basicSalary,
        allowances,
        bonus,
        deductions,
        workingDays,
        presentDays,
        absentDays,
        leaveDays,
        remarks,
        generatedBy:
          req.user._id,
      });

    res.status(201).json({
      success: true,
      message:
        "Salary generated successfully",
      salary,
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
| Get My Salaries
|--------------------------------------------------------------------------
*/

exports.getMySalaries =
  async (req, res) => {
    try {
      const salaries =
        await Salary.find({
          employee:
            req.user._id,
        }).sort({
          year: -1,
          month: -1,
        });

      res.status(200).json({
        success: true,
        count:
          salaries.length,
        salaries,
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
| Get Salary By ID
|--------------------------------------------------------------------------
*/

exports.getSalaryById =
  async (req, res) => {
    try {
      const salary =
        await Salary.findById(
          req.params.id
        )
          .populate(
            "employee",
            "firstName lastName email"
          )
          .populate(
            "generatedBy",
            "firstName lastName"
          );

      if (!salary) {
        return res.status(404).json({
          success: false,
          message:
            "Salary record not found",
        });
      }

      res.status(200).json({
        success: true,
        salary,
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
| Get All Salaries (HR)
|--------------------------------------------------------------------------
*/

exports.getAllSalaries =
  async (req, res) => {
    try {
      const salaries =
        await Salary.find()
          .populate(
            "employee",
            "firstName lastName email department designation"
          )
          .sort({
            createdAt: -1,
          });

      res.status(200).json({
        success: true,
        count:
          salaries.length,
        salaries,
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
| Confirm Salary Payment
|--------------------------------------------------------------------------
*/

exports.confirmSalary =
  async (req, res) => {
    try {
      const salary =
        await Salary.findById(
          req.params.id
        );

      if (!salary) {
        return res.status(404).json({
          success: false,
          message:
            "Salary record not found",
        });
      }

      salary.paymentStatus =
        "Paid";

      salary.paymentDate =
        new Date();

      await salary.save();

      res.status(200).json({
        success: true,
        message:
          "Salary marked as paid",
        salary,
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
| Update Salary
|--------------------------------------------------------------------------
*/

exports.updateSalary =
  async (req, res) => {
    try {
      const salary =
        await Salary.findByIdAndUpdate(
          req.params.id,
          req.body,
          {
            new: true,
            runValidators: true,
          }
        );

      if (!salary) {
        return res.status(404).json({
          success: false,
          message:
            "Salary record not found",
        });
      }

      res.status(200).json({
        success: true,
        message:
          "Salary updated successfully",
        salary,
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
| Delete Salary
|--------------------------------------------------------------------------
*/

exports.deleteSalary =
  async (req, res) => {
    try {
      const salary =
        await Salary.findById(
          req.params.id
        );

      if (!salary) {
        return res.status(404).json({
          success: false,
          message:
            "Salary record not found",
        });
      }

      await salary.deleteOne();

      res.status(200).json({
        success: true,
        message:
          "Salary deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  }; 