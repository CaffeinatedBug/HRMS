require("dotenv").config();

const http = require("http");

const app = require("./app");

const connectDB = require(
  "./config/db"
);

const {
  initializeSocket,
} = require(
  "./config/socket"
);

const birthdayCron = require(
  "./cron/birthdayCron"
);

const salaryCron = require(
  "./cron/salaryCron"
);

const attendanceCron = require(
  "./cron/attendanceCron"
);

const PORT =
  process.env.PORT || 5000;

/*
|--------------------------------------------------------------------------
| Database
|--------------------------------------------------------------------------
*/

connectDB();

/*
|--------------------------------------------------------------------------
| Server
|--------------------------------------------------------------------------
*/

const server =
  http.createServer(app);

/*
|--------------------------------------------------------------------------
| Socket.io
|--------------------------------------------------------------------------
*/

initializeSocket(server);

/*
|--------------------------------------------------------------------------
| Cron Jobs
|--------------------------------------------------------------------------
*/

birthdayCron();

salaryCron();

attendanceCron();

/*
|--------------------------------------------------------------------------
| Start Server
|--------------------------------------------------------------------------
*/

server.listen(
  PORT,
  () => {
    console.log(
      `🚀 Server Running On Port ${PORT}`
    );
  }
);