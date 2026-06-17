const OFFICE_IPS = [
  "122.177.224.58", // Your office Wifi first IP
   "49.36.242.27", // Your Office WiFi Second IP
  "127.0.0.1",    // Localhost
  "::1",          // IPv6 Localhost
];

const officeWifiMiddleware = (
  req,
  res,
  next
) => {
  try {
    const clientIp =
      req.headers["x-forwarded-for"] ||
      req.socket.remoteAddress ||
      req.ip;

    const cleanIp = String(clientIp)
      .replace("::ffff:", "")
      .split(",")[0]
      .trim();

    /*
    |--------------------------------------------------------------------------
    | Debug Logs
    |--------------------------------------------------------------------------
    */

    console.log("\n========== OFFICE WIFI CHECK ==========");
    console.log("req.ip:", req.ip);
    console.log(
      "req.socket.remoteAddress:",
      req.socket.remoteAddress
    );
    console.log(
      "x-forwarded-for:",
      req.headers["x-forwarded-for"]
    );
    console.log("Detected IP:", cleanIp);
    console.log(
      "Allowed IPs:",
      OFFICE_IPS
    );
    console.log(
      "NODE_ENV:",
      process.env.NODE_ENV
    );
    console.log("=======================================\n");

    /*
    |--------------------------------------------------------------------------
    | Development Mode Bypass
    |--------------------------------------------------------------------------
    */

    if (
      process.env.NODE_ENV !==
      "production"
    ) {
      console.log(
        "✅ Development Mode - Office IP Check Skipped"
      );

      return next();
    }

    /*
    |--------------------------------------------------------------------------
    | Production Office IP Check
    |--------------------------------------------------------------------------
    */

    if (
      !OFFICE_IPS.includes(cleanIp)
    ) {
      console.log(
        "❌ Attendance Blocked - Non Office Network"
      );

      return res.status(403).json({
        success: false,
        message:
          "Attendance allowed only from office network",
        detectedIp: cleanIp,
      });
    }

    console.log(
      "✅ Office Network Verified"
    );

    next();
  } catch (error) {
    console.error(
      "Office Wifi Middleware Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports =
  officeWifiMiddleware;