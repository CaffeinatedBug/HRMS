const express = require("express");
const mongoSanitize = require("express-mongo-sanitize");
const fs = require("fs");
const path = require("path");

const logPath = path.join(__dirname, "..", "debug-4b61f8.log");
const log = (msg, data, hypothesisId) => {
  fs.appendFileSync(
    logPath,
    JSON.stringify({
      sessionId: "4b61f8",
      location: "test-sanitize-fix.js",
      message: msg,
      data,
      hypothesisId,
      runId: "verify",
      timestamp: Date.now(),
    }) + "\n"
  );
};

const app = express();
app.use(express.json());
const opts = { replaceWith: "_" };

app.use((req, res, next) => {
  try {
    log("middleware entry", { method: req.method, path: req.path }, "A");
    if (req.body) req.body = mongoSanitize.sanitize(req.body, opts);
    if (req.query) mongoSanitize.sanitize(req.query, opts);
    log("middleware exit", { method: req.method }, "A");
    next();
  } catch (err) {
    log("middleware error", { error: err.message }, "A");
    next(err);
  }
});

app.post("/test", (req, res) => res.json({ ok: true }));

const server = app.listen(0, () => {
  const port = server.address().port;
  const http = require("http");
  const req = http.request(
    {
      hostname: "127.0.0.1",
      port,
      path: "/test",
      method: "POST",
      headers: { "Content-Type": "application/json" },
    },
    (res) => {
      let body = "";
      res.on("data", (c) => (body += c));
      res.on("end", () => {
        log("http response", { status: res.statusCode, body }, "A");
        server.close();
      });
    }
  );
  req.on("error", (e) => log("http error", { error: e.message }, "A"));
  req.write(JSON.stringify({ email: "test@test.com", password: "pass" }));
  req.end();
});
