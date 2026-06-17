const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const fileUpload = require("express-fileupload");

const app = express();

/*
|--------------------------------------------------------------------------
| Middlewares
|--------------------------------------------------------------------------
*/

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use(helmet());

app.use(morgan("dev"));

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
    createParentPath: true,
  })
);

/*
|--------------------------------------------------------------------------
| Import Routes
|--------------------------------------------------------------------------
*/

const authRoutes = require(
  "./routes/authRoutes"
);

const userRoutes = require(
  "./routes/userRoutes"
);

const attendanceRoutes = require(
  "./routes/attendanceRoutes"
);

const leaveRoutes = require(
  "./routes/leaveRoutes"
);

const holidayRoutes = require(
  "./routes/holidayRoutes"
);

const notificationRoutes = require(
  "./routes/notificationRoutes"
);

const salaryRoutes = require(
  "./routes/salaryRoutes"
);

const dashboardRoutes = require(
  "./routes/dashboardRoutes"
);

const reportRoutes = require(
  "./routes/reportRoutes"
);

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/users",
  userRoutes
);

app.use(
  "/api/attendance",
  attendanceRoutes
);

app.use(
  "/api/leave",
  leaveRoutes
);

app.use(
  "/api/holiday",
  holidayRoutes
);

app.use(
  "/api/notifications",
  notificationRoutes
);

app.use(
  "/api/salary",
  salaryRoutes
);

app.use(
  "/api/dashboard",
  dashboardRoutes
);

app.use(
  "/api/reports",
  reportRoutes
);

/*
|--------------------------------------------------------------------------
| Root Route
|--------------------------------------------------------------------------
*/

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message:
      "HRMS Backend Running Successfully 🚀",
    version: "1.0.0",
  });
});

/*
|--------------------------------------------------------------------------
| 404 Route Handler
|--------------------------------------------------------------------------
*/

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

/*
|--------------------------------------------------------------------------
| Global Error Handler
|--------------------------------------------------------------------------
*/

app.use(
  (err, req, res, next) => {
    console.error(err);

    res.status(
      err.status || 500
    ).json({
      success: false,
      message:
        err.message ||
        "Internal Server Error",
    });
  }
);

module.exports = app;