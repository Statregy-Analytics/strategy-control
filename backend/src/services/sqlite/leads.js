const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const defaultDbFile =
  process.env.NODE_ENV === "test"
    ? path.join(__dirname, "../../../test.sqlite")
    : path.join(__dirname, "../../../dev.sqlite");
const dbFile = process.env.SQLITE_FILE || defaultDbFile;
try {
  const dir = path.dirname(dbFile);
  try {
    fs.mkdirSync(dir, { recursive: true });
  } catch (e) {}
  try {
    fs.openSync(dbFile, "a");
  } catch (e) {}
} catch (e) {
  // ignore
}
const db = new Database(dbFile);

// Create table leads (simple columns for compatibility)
db.prepare(
  `CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT
  )`
).run();

// Ensure `data` column exists for storing JSON payload
try {
  const cols = db.prepare("PRAGMA table_info('leads')").all();
  const hasDataCol = cols.some((c) => c.name === "data");
  if (!hasDataCol) {
    try {
      db.prepare("ALTER TABLE leads ADD COLUMN data TEXT").run();
    } catch (err) {
      if (process.env.NODE_ENV !== "test")
        console.error(
          "warning: could not add data column to leads",
          err && err.message
        );
    }
  }
} catch (e) {}

// Create audit table for leads
try {
  db.prepare(
    `CREATE TABLE IF NOT EXISTS leads_audit (
      audit_id INTEGER PRIMARY KEY AUTOINCREMENT,
      lead_id INTEGER,
      action TEXT,
      payload TEXT,
      user TEXT,
      user_id TEXT,
      user_email TEXT,
      user_role TEXT,
      created_at TEXT
    )`
  ).run();
} catch (err) {
  if (process.env.NODE_ENV !== "test")
    console.error(
      "warning: could not create leads_audit table",
      err && err.message
    );
}

// Indexes for audit
try {
  db.prepare(
    "CREATE INDEX IF NOT EXISTS idx_leads_audit_lead ON leads_audit(lead_id)"
  ).run();
  db.prepare(
    "CREATE INDEX IF NOT EXISTS idx_leads_audit_created_at ON leads_audit(created_at)"
  ).run();
  db.prepare(
    "CREATE INDEX IF NOT EXISTS idx_leads_audit_action ON leads_audit(action)"
  ).run();
  db.prepare(
    "CREATE INDEX IF NOT EXISTS idx_leads_audit_user_id ON leads_audit(user_id)"
  ).run();
} catch (e) {
  if (process.env.NODE_ENV !== "test")
    console.error(
      "warning: could not create leads_audit indexes",
      e && e.message
    );
}

// Migration: ensure normalized user columns exist and populate from legacy user
try {
  const auditCols = db.prepare("PRAGMA table_info('leads_audit')").all();
  const hasUserId = auditCols.some((c) => c.name === "user_id");
  const hasUserEmail = auditCols.some((c) => c.name === "user_email");
  const hasUserRole = auditCols.some((c) => c.name === "user_role");
  if (!hasUserId || !hasUserEmail || !hasUserRole) {
    try {
      if (!hasUserId)
        db.prepare("ALTER TABLE leads_audit ADD COLUMN user_id TEXT").run();
    } catch (e) {}
    try {
      if (!hasUserEmail)
        db.prepare("ALTER TABLE leads_audit ADD COLUMN user_email TEXT").run();
    } catch (e) {}
    try {
      if (!hasUserRole)
        db.prepare("ALTER TABLE leads_audit ADD COLUMN user_role TEXT").run();
    } catch (e) {}
    try {
      const rows = db.prepare("SELECT audit_id, user FROM leads_audit").all();
      const update = db.prepare(
        "UPDATE leads_audit SET user_id = ?, user_email = ?, user_role = ? WHERE audit_id = ?"
      );
      for (const r of rows) {
        if (!r || !r.user) continue;
        let uid = null,
          uemail = null,
          urole = null;
        try {
          const parsed = JSON.parse(r.user);
          if (parsed) {
            uid = parsed.id || parsed.userId || null;
            uemail = parsed.email || null;
            urole = parsed.role || null;
          }
        } catch (e) {
          uid = String(r.user);
        }
        if (uid || uemail || urole) update.run(uid, uemail, urole, r.audit_id);
      }
    } catch (e) {
      if (process.env.NODE_ENV !== "test")
        console.error(
          "warning: could not migrate leads_audit user column",
          e && e.message
        );
    }
  }
} catch (e) {
  if (process.env.NODE_ENV !== "test")
    console.error(
      "warning: could not inspect leads_audit columns",
      e && e.message
    );
}

function toShape(row) {
  if (!row) return null;
  if (row.id == null && (row.rowid || row.ROWID || row._rowid_)) {
    row.id = row.rowid || row.ROWID || row._rowid_;
  }
  if (row.data) {
    try {
      const parsed = JSON.parse(row.data);
      if (parsed && typeof parsed === "object") {
        // Prefer explicit parsed.lead shape; if payload was stored flat, treat parsed as lead
        const leadObj =
          parsed.lead && typeof parsed.lead === "object" ? parsed.lead : parsed;
        const outId = parsed.id != null ? parsed.id : row.id;
        // Return a consistent shape without duplicating fields at top-level
        return { id: outId, lead: leadObj };
      }
    } catch (err) {
      if (process.env.NODE_ENV !== "test")
        console.error("warning: invalid json in leads.data for id", row.id);
    }
  }
  // Fallback: construct lead from flat columns (minimal shape)
  return { id: row.id, lead: { name: row.name, email: row.email } };
}

function list() {
  const rows = db.prepare("SELECT rowid, * FROM leads").all();
  return rows.map(toShape);
}

function get(id) {
  let row = db.prepare("SELECT rowid, * FROM leads WHERE id = ?").get(id);
  if (!row)
    row = db.prepare("SELECT rowid, * FROM leads WHERE rowid = ?").get(id);
  return toShape(row);
}

function create(data) {
  const payloadObj = data || {};
  const lead = payloadObj.lead || payloadObj;
  const payload = JSON.stringify(
    payloadObj.lead ? payloadObj : { lead: payloadObj }
  );
  try {
    const info = db
      .prepare("INSERT INTO leads (name, email, data) VALUES (?, ?, ?)")
      .run(
        (lead && lead.name) || payloadObj.name || null,
        (lead && lead.email) || payloadObj.email || null,
        payload
      );
    const newId =
      info &&
      (info.lastInsertRowid != null
        ? info.lastInsertRowid
        : info.lastInsertROWID != null
        ? info.lastInsertROWID
        : null);
    if (newId != null) return get(newId);
    const row = db
      .prepare("SELECT rowid, * FROM leads ORDER BY rowid DESC LIMIT 1")
      .get();
    return toShape(row);
  } catch (err) {
    throw err;
  }
}

function update(id, data) {
  const payloadObj = data || {};
  const lead = payloadObj.lead || payloadObj;
  const payload = JSON.stringify(
    payloadObj.lead ? payloadObj : { lead: payloadObj }
  );
  try {
    const info = db
      .prepare("UPDATE leads SET name = ?, email = ?, data = ? WHERE id = ?")
      .run(
        (lead && lead.name) || payloadObj.name || null,
        (lead && lead.email) || payloadObj.email || null,
        payload,
        id
      );
    if (info.changes === 0) return null;
    return get(id);
  } catch (err) {
    throw err;
  }
}

function del(id, opts) {
  const row = db.prepare("SELECT rowid, * FROM leads WHERE id = ?").get(id);
  if (!row) return false;
  const insertAudit = db.prepare(
    "INSERT INTO leads_audit (lead_id, action, payload, user, user_id, user_email, user_role, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  );
  const deleteStmt = db.prepare("DELETE FROM leads WHERE id = ?");
  try {
    const tx = db.transaction(() => {
      const payload =
        row.data ||
        JSON.stringify({ id: row.id, name: row.name, email: row.email });
      let user = opts && opts.user ? opts.user : null;
      const userStr =
        user && typeof user === "object" ? JSON.stringify(user) : user;
      let userId = null,
        userEmail = null,
        userRole = null;
      if (user) {
        if (typeof user === "object") {
          userId = user.id || user.userId || null;
          userEmail = user.email || null;
          userRole = user.role || null;
        } else {
          userId = String(user);
        }
      }
      insertAudit.run(
        row.id || row.rowid,
        "delete",
        payload,
        userStr,
        userId,
        userEmail,
        userRole,
        new Date().toISOString()
      );
      const info = deleteStmt.run(id);
      return info.changes > 0;
    });
    return tx();
  } catch (err) {
    if (process.env.NODE_ENV !== "test")
      console.error(
        "error: failed to perform atomic audit+delete",
        err && err.message
      );
    return false;
  }
}

function listAudit(leadId, opts) {
  const _opts = opts || {};
  const p = {
    page: _opts.page != null ? Number(_opts.page) : 1,
    pageSize: _opts.pageSize != null ? Number(_opts.pageSize) : 20,
    action: _opts.action,
    from: _opts.from,
    to: _opts.to,
    userId: _opts.userId,
  };
  const filters = ["lead_id = ?"];
  const params = [leadId];
  if (p.action) {
    filters.push("action = ?");
    params.push(p.action);
  }
  if (p.from) {
    filters.push("created_at >= ?");
    params.push(p.from);
  }
  if (p.to) {
    filters.push("created_at <= ?");
    params.push(p.to);
  }
  const where = filters.length ? "WHERE " + filters.join(" AND ") : "";
  try {
    const countRow = db
      .prepare(`SELECT COUNT(1) as cnt FROM leads_audit ${where}`)
      .get(...params);
    let total = countRow && countRow.cnt ? countRow.cnt : 0;
    if (p.userId) {
      const rowsAll = db
        .prepare(`SELECT * FROM leads_audit ${where} ORDER BY created_at DESC`)
        .all(...params);
      const parsedAll = rowsAll.map((r) => {
        const copy = Object.assign({}, r);
        if (copy.user) {
          try {
            copy.user = JSON.parse(copy.user);
          } catch (e) {}
        }
        return copy;
      });
      const filtered = parsedAll.filter((r) => {
        if (!r.user) return false;
        if (typeof r.user === "string") {
          if (r.user === p.userId) return true;
          if (r.user.includes(`"id":"${p.userId}"`)) return true;
          if (r.user.includes(p.userId)) return true;
          return false;
        }
        if (typeof r.user === "object")
          return (
            (r.user.id && String(r.user.id) === String(p.userId)) ||
            (r.user.userId && String(r.user.userId) === String(p.userId))
          );
        return false;
      });
      total = filtered.length;
      const page = Math.max(1, Number(p.page));
      const pageSize = Number(p.pageSize);
      const offset = (page - 1) * pageSize;
      const pageRows = filtered.slice(offset, offset + pageSize);
      return { rows: pageRows, total };
    }
    const offset = (Math.max(1, Number(p.page)) - 1) * Number(p.pageSize);
    const rows = db
      .prepare(
        `SELECT * FROM leads_audit ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`
      )
      .all(...params, Number(p.pageSize), offset);
    const parsed = rows.map((r) => {
      const copy = Object.assign({}, r);
      if (copy.user) {
        try {
          copy.user = JSON.parse(copy.user);
        } catch (e) {}
      }
      return copy;
    });
    return { rows: parsed, total };
  } catch (err) {
    if (process.env.NODE_ENV !== "test")
      console.error("warning: could not read leads_audit", err && err.message);
    return { rows: [], total: 0 };
  }
}

module.exports = { list, get, create, update, delete: del, listAudit };
