const cron = require("node-cron");

const User = require("../models/User");
const Salary = require(
  "../models/Salary"
);

const salaryCron = () => {
  cron.schedule(
    "0 1 1 * *",
    async () => {
      try {
        const users =
          await User.find({
            role:
              "EMPLOYEE",
            status:
              "Active",
          });

        const now =
          new Date();

        const month =
          now.getMonth() + 1;

        const year =
          now.getFullYear();

        for (const user of users) {
          const existingSalary =
            await Salary.findOne(
              {
                employee:
                  user._id,
                month,
                year,
              }
            );

          if (
            existingSalary
          )
            continue;

          await Salary.create({
            employee:
              user._id,
            month,
            year,
            basicSalary:
              user.salary ||
              0,
            workingDays:
              26,
            presentDays:
              26,
            absentDays:
              0,
            leaveDays:
              0,
            generatedBy:
              null,
          });
        }

        console.log(
          "Salary cron executed"
        );
      } catch (error) {
        console.error(
          error
        );
      }
    }
  );
};

module.exports =
  salaryCron;