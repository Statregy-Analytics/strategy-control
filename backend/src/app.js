const path = require("path");
const dotenv = require("dotenv");
// Load environment files in a robust way:
// 1) .env.<NODE_ENV> (if NODE_ENV is set)
// 2) .env (fallback)
// This ensures the app finds the `.env` when started from different working dirs (server/docker).
dotenv.config({
  path: path.resolve(
    __dirname,
    "..",
    `.env.${process.env.NODE_ENV || "development"}`
  ),
});
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });
const express = require("express");
const clientsRouter = require("./routes/clients");
const advisorsRouter = require("./routes/advisors");
const leadsRouter = require("./routes/leads");
const cors = require("cors");
const authMiddleware = require("./middleware/auth");

const app = express();
// Enable CORS for the frontend. Allow flexible dev origins (localhost ports)
// or override via CORS_ORIGIN env (comma-separated list).
const allowedOriginsRaw = process.env.CORS_ORIGIN || "";
const allowedOrigins = allowedOriginsRaw
  .split(",")
  .map((s) => (s || "").trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // allow non-browser requests (curl, server-to-server) which have no origin
      if (!origin) return callback(null, true);
      // if configured list contains '*', allow any origin
      if (allowedOrigins.includes("*")) return callback(null, true);
      // if configured list contains this origin, allow
      if (allowedOrigins.length && allowedOrigins.includes(origin))
        return callback(null, true);
      // allow any localhost origin (different dev ports like 9000,9001)
      try {
        const u = new URL(origin);
        if (u.hostname === "localhost" || u.hostname === "127.0.0.1")
          return callback(null, true);
      } catch (e) {
        // ignore
      }
      // otherwise reject
      return callback(new Error("Not allowed by CORS"), false);
    },
  })
);
// auth middleware (populates req.user from Authorization header in dev)
app.use(authMiddleware);
// Increase JSON / urlencoded limits so large base64 payloads (avatar) are accepted
app.use(express.json({ limit: "12mb" }));
app.use(express.urlencoded({ limit: "12mb", extended: true }));

// Ensure storage directory exists and serve static files for uploaded assets
const fs = require("fs");
const storageDir = path.join(__dirname, "..", "storage");
try {
  fs.mkdirSync(storageDir, { recursive: true });
} catch (e) {}
app.use("/storage", express.static(storageDir));

// Mount API routes under /api prefix
app.use("/api/clients", clientsRouter);
app.use("/api/advisors", advisorsRouter);
app.use("/api/leads", leadsRouter);

// global error handler: normalize errors to { errors: [{ field, message }] }
app.use((err, req, res, next) => {
  // if error already has an errors array, forward it
  if (!err) return next();
  if (err.errors && Array.isArray(err.errors)) {
    return res.status(err.status || 400).json({ errors: err.errors });
  }

  // Joi style detail? allow err.detail from thrown ValidationError
  if (err.detail) {
    // err.detail expected to be an object { field, message }
    return res.status(err.status || 400).json({ errors: [err.detail] });
  }

  // generic handling
  const message = err.message || "Internal error";
  return res
    .status(err.status || 500)
    .json({ errors: [{ field: null, message }] });
});

module.exports = app;
