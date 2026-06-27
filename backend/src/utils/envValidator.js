/*
|--------------------------------------------------------------------------
| Environment Validator
|
| Industry Practice:
|   "Fail fast" — if the server starts with missing secrets it will
|   silently malfunction in unpredictable ways. It is far safer to crash
|   immediately with a clear message than to run with a broken config.
|
|   Called once, synchronously, at the very top of server.js — before any
|   DB connection or HTTP listener is opened.
|--------------------------------------------------------------------------
*/

const REQUIRED_VARS = [
  { key: "JWT_SECRET",        hint: "Secret key for signing JWTs. Min 32 random chars." },
  { key: "DB_URL",            hint: "MongoDB connection string (mongodb+srv://...)" },
  { key: "ALLOWED_OFFICE_IPS",hint: "Comma-separated list of office IP addresses for attendance." },
];

const validateEnv = () => {
  const missing = REQUIRED_VARS.filter(({ key }) => !process.env[key]);

  if (missing.length === 0) return; // all good

  console.error("\n❌  SERVER STARTUP FAILED — Missing environment variables:\n");
  missing.forEach(({ key, hint }) => {
    console.error(`   ${key}`);
    console.error(`     → ${hint}\n`);
  });
  console.error("Add the missing variables to your .env file and restart.\n");

  process.exit(1); // hard stop — do not continue
};

module.exports = validateEnv;
