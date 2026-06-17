const fs = require("fs");
const path =
  require("path");

const logFile =
  path.join(
    __dirname,
    "../../logs/app.log"
  );

const logger = (
  message
) => {
  const log =
    `[${new Date().toISOString()}] ${message}\n`;

  fs.appendFileSync(
    logFile,
    log
  );
};

module.exports =
  logger;