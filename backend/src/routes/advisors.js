const express = require("express");
const router = express.Router();

const useFakes = (process.env.USE_FAKES || "true") === "true";

let adapter;
if (useFakes) {
  adapter = require("../services/fakes/advisors");
} else {
  adapter = require("../services/sqlite/advisors");
}

// List
router.get("/", (req, res) => {
  const list = adapter.list();
  res.json(list);
});

// Get by id
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  const item = adapter.get(id);
  if (!item) return res.status(404).json({ error: "Not found" });
  res.json(item);
});

// Create (no heavy validation for now)
router.post("/", (req, res) => {
  const data = req.body;
  const created = adapter.create(data);
  res.status(201).json(created);
});

// Update
router.put("/:id", (req, res) => {
  const id = Number(req.params.id);
  const data = req.body;
  const updated = adapter.update(id, data);
  if (!updated) return res.status(404).json({ error: "Not found" });
  res.json(updated);
});

// Delete
router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  // Prefer authenticated user (req.user), fallback to header X-User-Id for traceability
  const authUser = req.user || null;
  const userObj = {};
  if (authUser) {
    if (authUser.id) userObj.id = authUser.id;
    if (authUser.userId) userObj.id = userObj.id || authUser.userId;
    if (authUser.email) userObj.email = authUser.email;
    if (authUser.role) userObj.role = authUser.role;
  }
  // fallback to headers
  if (!userObj.id && req.get("X-User-Id")) userObj.id = req.get("X-User-Id");
  if (!userObj.email && req.get("X-User-Email"))
    userObj.email = req.get("X-User-Email");

  const ok = adapter.delete(id, {
    user: Object.keys(userObj).length ? userObj : null,
  });
  if (!ok) return res.status(404).json({ error: "Not found" });
  res.status(204).send();
});

// Simple admin-check middleware for audit endpoint
function auditAdminOnly(req, res, next) {
  // allow if req.user.role === 'admin'
  if (req.user && req.user.role === "admin") return next();
  // fallback to header X-Admin: 'true'
  const header = req.get("X-Admin");
  if (header && String(header).toLowerCase() === "true") return next();
  return res.status(403).json({ error: "Forbidden" });
}

// Audit list for a given advisor (protected)
router.get("/:id/audit", auditAdminOnly, (req, res) => {
  const id = Number(req.params.id);
  if (typeof adapter.listAudit === "function") {
    const opts = {
      page: req.query.page ? Number(req.query.page) : undefined,
      pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
      action: req.query.action || undefined,
      from: req.query.from || undefined,
      to: req.query.to || undefined,
      userId: req.query.userId || undefined,
    };
    const result = adapter.listAudit(id, opts);
    return res.json(result);
  }
  // adapter does not support audit listing (fakes), return 404
  res.status(404).json({ error: "Audit not available" });
});

module.exports = router;
