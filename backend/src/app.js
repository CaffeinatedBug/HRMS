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

const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(",") 
  : ["http://localhost:5173"];

app.use(
  cors({
    origin: allowedOrigins,
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
 * Express 5 defines req.query as a getter-only property; the default middleware
 * reassigns req.query and throws. Sanitize query in place; body/params may be reassigned.
 */
const mongoSanitizeOptions = { replaceWith: "_" };

app.use((req, res, next) => {
  try {
    // #region agent log
    fetch("http://127.0.0.1:7814/ingest/eddf7cf6-1202-43f1-8fd7-e2ec93221482", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "4b61f8" },
      body: JSON.stringify({
        sessionId: "4b61f8",
        location: "app.js:mongoSanitizeMiddleware:entry",
        message: "mongoSanitize middleware entered",
        data: {
          method: req.method,
          path: req.path,
          hasBody: Boolean(req.body && Object.keys(req.body).length),
          hasQuery: Boolean(req.query && Object.keys(req.query).length),
        },
        timestamp: Date.now(),
        hypothesisId: "A",
        runId: "post-fix",
      }),
    }).catch(() => {});
    // #endregion

    if (req.body) {
      req.body = mongoSanitize.sanitize(req.body, mongoSanitizeOptions);
    }
    if (req.params) {
      req.params = mongoSanitize.sanitize(req.params, mongoSanitizeOptions);
    }
    if (req.query) {
      mongoSanitize.sanitize(req.query, mongoSanitizeOptions);
    }

    // #region agent log
    fetch("http://127.0.0.1:7814/ingest/eddf7cf6-1202-43f1-8fd7-e2ec93221482", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "4b61f8" },
      body: JSON.stringify({
        sessionId: "4b61f8",
        location: "app.js:mongoSanitizeMiddleware:exit",
        message: "mongoSanitize middleware completed",
        data: { method: req.method, path: req.path },
        timestamp: Date.now(),
        hypothesisId: "A",
        runId: "post-fix",
      }),
    }).catch(() => {});
    // #endregion

    next();
  } catch (err) {
    // #region agent log
    fetch("http://127.0.0.1:7814/ingest/eddf7cf6-1202-43f1-8fd7-e2ec93221482", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "4b61f8" },
      body: JSON.stringify({
        sessionId: "4b61f8",
        location: "app.js:mongoSanitizeMiddleware:error",
        message: "mongoSanitize middleware failed",
        data: { error: err.message, method: req.method, path: req.path },
        timestamp: Date.now(),
        hypothesisId: "A",
        runId: "post-fix",
      }),
    }).catch(() => {});
    // #endregion
    next(err);
  }
});

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