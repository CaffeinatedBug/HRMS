/*
|--------------------------------------------------------------------------
| Allowed Office IPs
|
| IPs are loaded from ALLOWED_OFFICE_IPS environment variable.
| Format: comma-separated list of IPv4 addresses.
|
| Example .env:
|   ALLOWED_OFFICE_IPS=47.15.115.109,122.177.224.58,49.36.242.27
|
| Localhost (127.0.0.1 and ::1) are always allowed so the server
| itself can make internal requests.
|
| ⚠  NO DEVELOPMENT BYPASS — IP check is enforced in every environment.
|    Add your machine's public IP to ALLOWED_OFFICE_IPS in backend/.env.
|--------------------------------------------------------------------------
*/

const logger = require("../utils/logger");

const buildAllowedIps = () => {
  const envIps = (process.env.ALLOWED_OFFICE_IPS ?? "")
    .split(",")
    .map((ip) => ip.trim())
    .filter(Boolean);

  return [
    "127.0.0.1", // IPv4 localhost — always allowed
    "::1",       // IPv6 localhost — always allowed
    ...envIps,
  ];
};

const officeWifiMiddleware = (req, res, next) => {
  try {
    const ALLOWED_IPS = buildAllowedIps();

    /*
    |--------------------------------------------------------------------------
    | IP Extraction
    |
    | Priority: X-Forwarded-For header (set by Nginx/proxy)
    |           → socket.remoteAddress (direct TCP)
    |           → req.ip  (Express normalised, requires trust proxy)
    |
    | Strip ::ffff: prefix that Node appends to IPv4-mapped IPv6 addresses.
    | Take only the first address from XFF (leftmost = original client).
    |--------------------------------------------------------------------------
    */

    const rawIp =
      req.headers["x-forwarded-for"] ||
      req.socket.remoteAddress ||
      req.ip;

    const clientIp = String(rawIp)
      .split(",")[0]
      .trim()
      .replace(/^::ffff:/, "");

    // Debug-only: log detected IP. Suppressed in production (level=info).
    logger.debug("Office WiFi check", { clientIp });

    /*
    |--------------------------------------------------------------------------
    | Enforcement — active in ALL environments (no dev bypass)
    |--------------------------------------------------------------------------
    */

    if (!ALLOWED_IPS.includes(clientIp)) {
      logger.warn("Attendance blocked — IP not whitelisted", { clientIp });

      return res.status(403).json({
        success: false,
        message: "Attendance allowed only on office network",
      });
    }

    logger.debug("Office network verified", { clientIp });
    next();
  } catch (error) {
    logger.error("officeWifiMiddleware error", { error: error.message, stack: error.stack });

    return res.status(500).json({
      success: false,
      message: "Could not verify network access.",
    });
  }
};

module.exports = officeWifiMiddleware;