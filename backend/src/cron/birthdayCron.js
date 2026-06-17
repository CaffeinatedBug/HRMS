const cron = require("node-cron");

const User = require("../models/User");
const Notification = require(
  "../models/Notification"
);

const birthdayCron = () => {
  cron.schedule(
    "0 8 * * *",
    async () => {
      try {
        const today =
          new Date();

        const month =
          today.getMonth() + 1;

        const day =
          today.getDate();

        const users =
          await User.find();

        for (const user of users) {
          if (!user.dob)
            continue;

          const dob =
            new Date(
              user.dob
            );

          if (
            dob.getMonth() + 1 ===
              month &&
            dob.getDate() ===
              day
          ) {
            await Notification.create(
              {
                recipient:
                  user._id,
                title:
                  "Happy Birthday 🎂",
                message: `Happy Birthday ${user.firstName}!`,
                type:
                  "Birthday",
              }
            );
          }
        }

        console.log(
          "Birthday cron executed"
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
  birthdayCron;