const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoSanitize = require("express-mongo-sanitize");
const fileUpload = require("express-fileupload");
const rateLimit = require("express-rate-limit");
const logger = require("./utils/logger");

const app = express();

/*
|--------------------------------------------------------------------------
| Trust Proxy
|
| Required so req.ip resolves to the real client IP when the app sits
| behind Nginx or any other reverse proxy. Without this, req.ip is the
| proxy's address, not the client's.
|--------------------------------------------------------------------------
*/

app.set("trust proxy", 1);

/*
|--------------------------------------------------------------------------
| Rate Limiters
|
| auth   — 10 attempts per 15 min per IP (brute-force protection)
| punch  — 20 requests per 15 min per IP (attendance fraud prevention)
|--------------------------------------------------------------------------
*/

// auth — 10 attempts per 15 min (brute-force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many attempts. Please try again after 15 minutes.",
  },
});

// punch — 20 requests per 15 min (attendance fraud prevention)
const punchLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many punch requests. Please try again later.",
  },
});

// Global backstop — 150 req per 15 min for all /api/ routes
// Industry Practice: defence-in-depth — even if a specific limiter
// is misconfigured, the global cap prevents runaway traffic.
const globalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please slow down.",
  },
});

/*
|--------------------------------------------------------------------------
| Middlewares
|--------------------------------------------------------------------------
*/

app.use(
  cors({
    origin: "*", // TODO: restrict to ALLOWED_ORIGINS once deployed to production
    credentials: true,
  })
);

/*
 * Helmet — sets 14 security headers in one call.
 * CSP tuned for Cloudinary (profile images) and same-origin scripts.
 * Industry Practice: explicit CSP is far safer than the default open policy.
 */
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc:  ["'self'"],
        styleSrc:   ["'self'", "'unsafe-inline'"],
        imgSrc:     ["'self'", "data:", "https://res.cloudinary.com"],
        connectSrc: ["'self'"],
        fontSrc:    ["'self'", "data:"],
        objectSrc:  ["'none'"],
        frameAncestors: ["'none'"],
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" }, // needed for Cloudinary images
  })
);

// Routes morgan HTTP logs through winston so every entry is structured JSON
app.use(morgan("combined", { stream: logger.stream }));

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

/*
 * express-mongo-sanitize — strips $ and . from req.body, req.params, req.query.
 * Industry Practice: prevents NoSQL injection attacks (e.g. { "$where": "..." } payloads).
 * Zero configuration needed — just mount it after body parsing.
 */
app.use(mongoSanitize());

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
    createParentPath: true,
  })
);

// Global API rate limiter (backstop for all /api/ routes)
app.use("/api/", globalApiLimiter);

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

const calendarRoutes = require(
  "./routes/calendarRoutes"
);

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

app.use(
  "/api/auth",
  authLimiter,
  authRoutes
);

app.use(
  "/api/users",
  userRoutes
);

app.use(
  "/api/attendance",
  punchLimiter,
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

app.use(
  "/api/calendar",
  calendarRoutes
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