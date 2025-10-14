const express = require("express");
const router = express.Router();

const useFakes = (process.env.USE_FAKES || "true") === "true";

let adapter;
if (useFakes) {
  adapter = require("../services/fakes/leads");
} else {
  // sqlite adapter may not exist yet; keep same pattern for future
  adapter = require("../services/sqlite/leads");
}

// List (supports search q). Return a simple array of items (no server-side pagination)
router.get("/", (req, res) => {
  const q = req.query.q ? String(req.query.q).toLowerCase() : null;

  const all = adapter.list() || [];
  let filtered = all;
  if (q) {
    filtered = all.filter((item) => {
      try {
        const lead = item.lead || item;
        const values = [];
        if (lead.name) values.push(String(lead.name).toLowerCase());
        if (lead.email) values.push(String(lead.email).toLowerCase());
        if (lead.phone) values.push(String(lead.phone).toLowerCase());
        return values.some((v) => v.includes(q));
      } catch (e) {
        return false;
      }
    });
  }
  res.json(filtered);
});

// Get by id
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  const item = adapter.get(id);
  if (!item) return res.status(404).json({ error: "Not found" });
  res.json(item);
});

// Simple validation using Joi
const Joi = require("joi");

const leadSchema = Joi.object({
  name: Joi.string().min(1).required(),
  email: Joi.string().email().optional(),
  phone: Joi.string().optional(),
}).unknown(true);

function ValidationError(detail, status = 400) {
  const e = new Error("Validation");
  e.detail = detail;
  e.status = status;
  return e;
}

function validateLeadBody(req, res, next) {
  const body = req.body;
  const lead = body && (body.lead || body);
  const { error } = leadSchema.validate(lead);
  if (error) {
    const detail = error.details && error.details[0];
    const key = detail && detail.context && detail.context.key;
    const message =
      detail && detail.message ? detail.message : "Payload inválido.";
    return next(ValidationError({ field: key || null, message }, 400));
  }
  next();
}

// Create
router.post("/", validateLeadBody, (req, res) => {
  const data = req.body;
  const created = adapter.create(data);
  res.status(201).json(created);
});

// Update
router.put("/:id", validateLeadBody, (req, res) => {
  const id = Number(req.params.id);
  const data = req.body;
  const updated = adapter.update(id, data);
  if (!updated) return res.status(404).json({ error: "Not found" });
  res.json(updated);
});

// Delete
router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  const authUser = req.user || null;
  const userObj = {};
  if (authUser) {
    if (authUser.id) userObj.id = authUser.id;
    if (authUser.userId) userObj.id = userObj.id || authUser.userId;
    if (authUser.email) userObj.email = authUser.email;
    if (authUser.role) userObj.role = authUser.role;
  }
  if (!userObj.id && req.get("X-User-Id")) userObj.id = req.get("X-User-Id");
  if (!userObj.email && req.get("X-User-Email"))
    userObj.email = req.get("X-User-Email");

  const ok = adapter.delete(id, {
    user: Object.keys(userObj).length ? userObj : null,
  });
  if (!ok) return res.status(404).json({ error: "Not found" });
  res.status(204).send();
});

// Audit list (if adapter supports it)
function auditAdminOnly(req, res, next) {
  if (req.user && req.user.role === "admin") return next();
  const header = req.get("X-Admin");
  if (header && String(header).toLowerCase() === "true") return next();
  return res.status(403).json({ error: "Forbidden" });
}

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
  res.status(404).json({ error: "Audit not available" });
});

module.exports = router;
