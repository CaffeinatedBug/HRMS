const { createLogger, format, transports } = require("winston");
const path = require("path");
const fs = require("fs");

/*
|--------------------------------------------------------------------------
| Logger (Winston)
|
| Industry Practice:
|   - Structured JSON logs in production (machine-parseable, works with
|     Datadog / Loki / CloudWatch without extra config)
|   - Human-readable colorized output in development
|   - Separate error.log so alerting systems can watch one file
|   - combined.log receives ALL levels (info, warn, error)
|   - morgan stream integration: HTTP request logs feed into winston
|     so every log line has the same timestamp + JSON format
|--------------------------------------------------------------------------
*/

const LOG_DIR = path.join(__dirname, "../../logs");

// Ensure logs/ directory exists at startup
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const isProd = process.env.NODE_ENV === "production";

const logger = createLogger({
  level: isProd ? "info" : "debug",

  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DDTHH:mm:ss.SSSZ" }),
    format.errors({ stack: true }),  // includes stack traces on Error objects
    format.json()                    // machine-readable in all files
  ),

  transports: [
    // All levels → combined.log
    new transports.File({
      filename: path.join(LOG_DIR, "combined.log"),
      maxsize: 10 * 1024 * 1024,   // 10 MB per file
      maxFiles: 7,                  // keep 7 rotated files (~70 MB max)
      tailable: true,
    }),

    // Errors only → error.log (easy to tail / alert on)
    new transports.File({
      filename: path.join(LOG_DIR, "error.log"),
      level: "error",
      maxsize: 5 * 1024 * 1024,
      maxFiles: 14,
      tailable: true,
    }),
  ],
});

// Console transport — pretty in dev, JSON in prod (for container stdout)
if (!isProd) {
  logger.add(
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(
          ({ timestamp, level, message, ...meta }) =>
            `${timestamp} [${level}] ${message}${
              Object.keys(meta).length ? " " + JSON.stringify(meta) : ""
            }`
        )
      ),
    })
  );
} else {
  // In production stream all logs to stdout so the process manager
  // (PM2, Docker, systemd) can capture them centrally
  logger.add(
    new transports.Console({ format: format.json() })
  );
}

// morgan-compatible write stream (used in app.js)
logger.stream = {
  write: (message) => logger.http(message.trim()),
};

module.exports = logger;