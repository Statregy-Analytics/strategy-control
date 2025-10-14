const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const dbFile =
  process.env.SQLITE_FILE || path.join(__dirname, "../../../dev.sqlite");
try {
  const dir = path.dirname(dbFile);
  try {
    fs.mkdirSync(dir, { recursive: true });
  } catch (e) {}
  try {
    fs.openSync(dbFile, "a");
  } catch (e) {}
} catch (e) {}
const db = new Database(dbFile);

db.prepare(
  `CREATE TABLE IF NOT EXISTS advisors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  email TEXT,
  avatar TEXT
)`
).run();

// Ensure `data` column exists for extensibility
const cols = db.prepare("PRAGMA table_info('advisors')").all();
const hasDataCol = cols.some((c) => c.name === "data");
if (!hasDataCol) {
  try {
    db.prepare("ALTER TABLE advisors ADD COLUMN data TEXT").run();
  } catch (e) {}
}

// Create audit table for deletions (and other actions)
try {
  db.prepare(
    `CREATE TABLE IF NOT EXISTS advisors_audit (
      audit_id INTEGER PRIMARY KEY AUTOINCREMENT,
      advisor_id INTEGER,
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
      "warning: could not create advisors_audit table",
      err && err.message
    );
}

// Create indexes to improve audit query performance
try {
  db.prepare(
    "CREATE INDEX IF NOT EXISTS idx_advisors_audit_advisor ON advisors_audit(advisor_id)"
  ).run();
  db.prepare(
    "CREATE INDEX IF NOT EXISTS idx_advisors_audit_created_at ON advisors_audit(created_at)"
  ).run();
  db.prepare(
    "CREATE INDEX IF NOT EXISTS idx_advisors_audit_action ON advisors_audit(action)"
  ).run();
  db.prepare(
    "CREATE INDEX IF NOT EXISTS idx_advisors_audit_user_id ON advisors_audit(user_id)"
  ).run();
} catch (err) {
  if (process.env.NODE_ENV !== "test")
    console.error(
      "warning: could not create advisors_audit indexes",
      err && err.message
    );
}

// Migration: ensure normalized user columns exist in advisors_audit
try {
  const auditCols = db.prepare("PRAGMA table_info('advisors_audit')").all();
  const hasUserId = auditCols.some((c) => c.name === "user_id");
  const hasUserEmail = auditCols.some((c) => c.name === "user_email");
  const hasUserRole = auditCols.some((c) => c.name === "user_role");
  if (!hasUserId || !hasUserEmail || !hasUserRole) {
    try {
      if (!hasUserId)
        db.prepare("ALTER TABLE advisors_audit ADD COLUMN user_id TEXT").run();
    } catch (e) {}
    try {
      if (!hasUserEmail)
        db.prepare(
          "ALTER TABLE advisors_audit ADD COLUMN user_email TEXT"
        ).run();
    } catch (e) {}
    try {
      if (!hasUserRole)
        db.prepare(
          "ALTER TABLE advisors_audit ADD COLUMN user_role TEXT"
        ).run();
    } catch (e) {}
    // populate from legacy `user` JSON if present
    try {
      const rows = db
        .prepare("SELECT audit_id, user FROM advisors_audit")
        .all();
      const update = db.prepare(
        "UPDATE advisors_audit SET user_id = ?, user_email = ?, user_role = ? WHERE audit_id = ?"
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
          "warning: could not migrate advisors_audit user column",
          e && e.message
        );
    }
  }
} catch (e) {
  if (process.env.NODE_ENV !== "test")
    console.error(
      "warning: could not inspect advisors_audit columns",
      e && e.message
    );
}

// (data column already ensured earlier)

function toShape(row) {
  if (!row) return null;
  if (row.data) {
    try {
      const parsed = JSON.parse(row.data);
      const merged = Object.assign({}, parsed);
      if (merged.id == null) merged.id = row.id;
      return Object.assign({ id: merged.id }, merged);
    } catch (e) {
      // ignore
    }
  }
  return { id: row.id, name: row.name, email: row.email, avatar: row.avatar };
}

function list() {
  const rows = db.prepare("SELECT * FROM advisors ORDER BY id").all();
  return rows.map(toShape);
}

function get(id) {
  const row = db.prepare("SELECT * FROM advisors WHERE id = ?").get(id);
  return toShape(row);
}

function create(data) {
  const payload = JSON.stringify(data);
  const info = db
    .prepare(
      "INSERT INTO advisors (name, email, avatar, data) VALUES (?, ?, ?, ?)"
    )
    .run(data.name || null, data.email || null, data.avatar || null, payload);
  const newId =
    info &&
    (info.lastInsertRowid != null
      ? info.lastInsertRowid
      : info.lastInsertROWID != null
      ? info.lastInsertROWID
      : null);
  if (newId != null) return get(newId);
  const row = db
    .prepare("SELECT * FROM advisors ORDER BY rowid DESC LIMIT 1")
    .get();
  return toShape(row);
}

function update(id, data) {
  const payload = JSON.stringify(data);
  const info = db
    .prepare(
      "UPDATE advisors SET name = ?, email = ?, avatar = ?, data = ? WHERE id = ?"
    )
    .run(
      data.name || null,
      data.email || null,
      data.avatar || null,
      payload,
      id
    );
  if (info.changes === 0) return null;
  return get(id);
}

function del(id, opts) {
  // prefer atomic delete with audit when possible
  return delWithAudit(id, opts);
}

// Delete with audit recording
function delWithAudit(id, opts) {
  // fetch current row
  const row = db.prepare("SELECT rowid, * FROM advisors WHERE id = ?").get(id);
  if (!row) return false;

  const insertAudit = db.prepare(
    "INSERT INTO advisors_audit (advisor_id, action, payload, user, user_id, user_email, user_role, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  );
  const deleteStmt = db.prepare("DELETE FROM advisors WHERE id = ?");

  try {
    const tx = db.transaction(() => {
      const payload =
        row.data ||
        JSON.stringify({
          id: row.id,
          name: row.name,
          email: row.email,
          avatar: row.avatar,
        });
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
        "error: failed to perform atomic advisors audit+delete",
        err && err.message
      );
    return false;
  }
}

function listAudit(advisorId, opts) {
  const _opts = opts || {};
  const p = {
    page: _opts.page != null ? Number(_opts.page) : 1,
    pageSize: _opts.pageSize != null ? Number(_opts.pageSize) : 20,
    action: _opts.action,
    from: _opts.from,
    to: _opts.to,
    userId: _opts.userId,
  };
  const filters = ["advisor_id = ?"];
  const params = [advisorId];
  if (p.action) {
    filters.push("action = ?");
    params.push(p.action);
  }
  const userIdFilter = p.userId;
  if (userIdFilter) {
    // handle in JS filtering like clients
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
      .prepare(`SELECT COUNT(1) as cnt FROM advisors_audit ${where}`)
      .get(...params);
    let total = countRow && countRow.cnt ? countRow.cnt : 0;

    if (userIdFilter) {
      const rowsAll = db
        .prepare(
          `SELECT * FROM advisors_audit ${where} ORDER BY created_at DESC`
        )
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
          if (r.user === userIdFilter) return true;
          if (r.user.includes(`"id":"${userIdFilter}"`)) return true;
          if (r.user.includes(userIdFilter)) return true;
          return false;
        }
        if (typeof r.user === "object")
          return (
            (r.user.id && String(r.user.id) === String(userIdFilter)) ||
            (r.user.userId && String(r.user.userId) === String(userIdFilter))
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
        `SELECT * FROM advisors_audit ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`
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
      console.error(
        "warning: could not read advisors_audit",
        err && err.message
      );
    return { rows: [], total: 0 };
  }
}

module.exports = { list, get, create, update, delete: del, listAudit };
