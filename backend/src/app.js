require("dotenv").config();
const express = require("express");
const clientsRouter = require("./routes/clients");
const advisorsRouter = require("./routes/advisors");
const leadsRouter = require("./routes/leads");
const cors = require("cors");
const authMiddleware = require("./middleware/auth");

const app = express();
app.use(express.json());
// Enable CORS for the frontend (allow override via CORS_ORIGIN env)
app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:9000" }));
// auth middleware (populates req.user from Authorization header in dev)
app.use(authMiddleware);

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
