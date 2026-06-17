const cron = require(
  "node-cron"
);

const User = require(
  "../models/User"
);

const Attendance =
  require(
    "../models/Attendance"
  );

const attendanceCron =
  () => {
    cron.schedule(
      "59 23 * * *",
      async () => {
        try {
          const users =
            await User.find(
              {
                role:
                  "EMPLOYEE",
              }
            );

          const today =
            new Date();

          for (const user of users) {
            const attendance =
              await Attendance.findOne(
                {
                  employee:
                    user._id,
                  date: {
                    $gte:
                      new Date(
                        today.setHours(
                          0,
                          0,
                          0,
                          0
                        )
                      ),
                  },
                }
              );

            if (
              !attendance
            ) {
              await Attendance.create(
                {
                  employee:
                    user._id,

                  date:
                    new Date(),

                  status:
                    "Absent",
                }
              );
            }
          }

          console.log(
            "Attendance cron executed"
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
  attendanceCron;