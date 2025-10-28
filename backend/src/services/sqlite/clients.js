const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");
// require advisors adapter to resolve advisor ids/names when storing/reading
const advisors = require("./advisors");

const dbFile =
  process.env.SQLITE_FILE || path.join(__dirname, "../../../dev.sqlite");
try {
  // ensure file exists so better-sqlite3 can open it in write mode
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

// Create table if not exists (data column may be added by migration step below)
db.prepare(
  `CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    cpf_cnpj TEXT,
    email TEXT,
    telefone TEXT
  )`
).run();

// Ensure `data` column exists (migration): add if missing
const cols = db.prepare("PRAGMA table_info('clients')").all();
const hasDataCol = cols.some((c) => c.name === "data");
if (!hasDataCol) {
  try {
    db.prepare("ALTER TABLE clients ADD COLUMN data TEXT").run();
  } catch (err) {
    if (process.env.NODE_ENV !== "test")
      console.error("warning: could not add data column", err && err.message);
  }
}
// Ensure telefone column exists
const hasTelefoneCol = cols.some((c) => c.name === "telefone");
if (!hasTelefoneCol) {
  try {
    db.prepare("ALTER TABLE clients ADD COLUMN telefone TEXT").run();
  } catch (err) {
    if (process.env.NODE_ENV !== "test")
      console.error(
        "warning: could not add telefone column",
        err && err.message
      );
  }
}

// Ensure unique index on cpf_cnpj (digits-only). If already exists, ignore error.
try {
  db.prepare(
    "CREATE UNIQUE INDEX IF NOT EXISTS idx_clients_cpf_cnpj ON clients(cpf_cnpj)"
  ).run();
} catch (err) {
  if (process.env.NODE_ENV !== "test")
    console.error(
      "warning: could not ensure unique index on cpf_cnpj",
      err && err.message
    );
}

// Create audit table for deletions (and other actions)
try {
  db.prepare(
    `CREATE TABLE IF NOT EXISTS clients_audit (
      audit_id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER,
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
      "warning: could not create clients_audit table",
      err && err.message
    );
}

// Create indexes to improve audit query performance
try {
  db.prepare(
    "CREATE INDEX IF NOT EXISTS idx_clients_audit_client ON clients_audit(client_id)"
  ).run();
  db.prepare(
    "CREATE INDEX IF NOT EXISTS idx_clients_audit_created_at ON clients_audit(created_at)"
  ).run();
  db.prepare(
    "CREATE INDEX IF NOT EXISTS idx_clients_audit_action ON clients_audit(action)"
  ).run();
  db.prepare(
    "CREATE INDEX IF NOT EXISTS idx_clients_audit_user_id ON clients_audit(user_id)"
  ).run();
} catch (err) {
  if (process.env.NODE_ENV !== "test")
    console.error(
      "warning: could not create clients_audit indexes",
      err && err.message
    );
}

// Migration: if normalized user columns are missing, add them and populate from legacy `user` text JSON
try {
  const auditCols = db.prepare("PRAGMA table_info('clients_audit')").all();
  const hasUserId = auditCols.some((c) => c.name === "user_id");
  const hasUserEmail = auditCols.some((c) => c.name === "user_email");
  const hasUserRole = auditCols.some((c) => c.name === "user_role");
  if (!hasUserId || !hasUserEmail || !hasUserRole) {
    try {
      if (!hasUserId)
        db.prepare("ALTER TABLE clients_audit ADD COLUMN user_id TEXT").run();
    } catch (e) {}
    try {
      if (!hasUserEmail)
        db.prepare(
          "ALTER TABLE clients_audit ADD COLUMN user_email TEXT"
        ).run();
    } catch (e) {}
    try {
      if (!hasUserRole)
        db.prepare("ALTER TABLE clients_audit ADD COLUMN user_role TEXT").run();
    } catch (e) {}
    // populate new columns from existing user JSON values
    try {
      const rows = db.prepare("SELECT audit_id, user FROM clients_audit").all();
      const update = db.prepare(
        "UPDATE clients_audit SET user_id = ?, user_email = ?, user_role = ? WHERE audit_id = ?"
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
          // if not JSON, maybe it's plain id string
          uid = String(r.user);
        }
        if (uid || uemail || urole) update.run(uid, uemail, urole, r.audit_id);
      }
    } catch (e) {
      if (process.env.NODE_ENV !== "test")
        console.error(
          "warning: could not migrate clients_audit user column",
          e && e.message
        );
    }
  }
} catch (e) {
  if (process.env.NODE_ENV !== "test")
    console.error(
      "warning: could not inspect clients_audit columns",
      e && e.message
    );
}

function toShape(row) {
  if (!row) return null;
  // normalize id: some sqlite files may have rows where `id` is null
  // fallback to internal rowid if available
  if (row.id == null && (row.rowid || row.ROWID || row._rowid_)) {
    // copy the fallback id into id so callers always receive a numeric id
    row.id = row.rowid || row.ROWID || row._rowid_;
  }

  if (row.data) {
    try {
      const parsed = JSON.parse(row.data);
      // if parsed looks like the nested cliente (legacy), keep compatibility
      if (
        parsed &&
        (parsed.name || parsed.cpf_cnpj || parsed.email) &&
        !parsed.cliente
      ) {
        const out = { id: row.id, cliente: parsed };
        // expose common top-level shortcuts for compatibility with UI
        out.name = parsed.name || null;
        out.email = parsed.email || null;
        out.avatar =
          parsed.avatar || (parsed.cliente && parsed.cliente.avatar) || null;
        return out;
      }
      // otherwise assume parsed contains the full saved object (possibly with cliente nested)
      if (parsed && typeof parsed === "object") {
        // merge but ensure the DB's id (row.id) takes precedence when parsed.id is null/undefined
        const merged = Object.assign({}, parsed);
        if (merged.id == null) merged.id = row.id;
        const out = Object.assign({ id: merged.id }, merged);
        // ensure top-level name/email/avatar exist for convenience if missing
        if (!out.name && out.cliente && out.cliente.name)
          out.name = out.cliente.name;
        if (!out.email && out.cliente && out.cliente.email)
          out.email = out.cliente.email;
        if (!out.avatar && out.cliente && out.cliente.avatar)
          out.avatar = out.cliente.avatar;
        // If investment.assessor is stored as an id, resolve to advisor name for display
        try {
          if (out.investment && out.investment.assessor != null) {
            const a = out.investment.assessor;
            // If it's a numeric id or numeric string, try to resolve to advisor name
            if (typeof a === "number" || String(a).match(/^\d+$/)) {
              const id = Number(a);
              const adv = advisors.get(id);
              // try multiple shapes: adv.name or adv.assessor.name or adv.assessor (string)
              const advisorName =
                (adv && adv.name) ||
                (adv && adv.assessor && adv.assessor.name) ||
                (adv && typeof adv.assessor === "string" && adv.assessor) ||
                null;
              if (advisorName) out.investment.assessor = advisorName;
            } else if (typeof a === "string" && a.trim()) {
              // Could be a name already; try to find a matching advisor to normalize the name
              const found = (advisors.list() || []).find((x) => {
                const xName =
                  (x && x.name) || (x && x.assessor && x.assessor.name) || null;
                return (
                  xName &&
                  String(xName).toLowerCase() === String(a).toLowerCase()
                );
              });
              if (found) {
                const xName =
                  (found && found.name) ||
                  (found && found.assessor && found.assessor.name) ||
                  null;
                if (xName) out.investment.assessor = xName;
              }
            }
            // Note: do NOT expose top-level `assessor` to avoid duplication.
            // Keep investment.assessor as the single source of truth.
          }
        } catch (e) {
          // ignore resolution errors
        }
        // Remove duplicated top-level fields that are present inside `cliente` or `investment`
        try {
          if (out.cliente && out.cliente.name) delete out.name;
          if (out.cliente && out.cliente.email) delete out.email;
          if (out.cliente && out.cliente.avatar) delete out.avatar;
          // don't expose top-level assessor if it would duplicate investment.assessor
          if (out.investment && out.investment.assessor != null)
            delete out.assessor;
        } catch (e) {}
        return out;
      }
    } catch (err) {
      if (process.env.NODE_ENV !== "test")
        console.error("warning: invalid json in clients.data for id", row.id);
    }
  }
  // Fallback: construct cliente from flat columns
  return {
    id: row.id,
    cliente: {
      name: row.name,
      cpf_cnpj: row.cpf_cnpj,
      email: row.email,
      telefone: row.telefone,
    },
  };
}

function list() {
  // include internal rowid so we can fallback when id column is null for legacy rows
  const rows = db.prepare("SELECT rowid, * FROM clients").all();
  return rows.map(toShape);
}

function get(id) {
  // Try to get by id column first
  let row = db.prepare("SELECT rowid, * FROM clients WHERE id = ?").get(id);
  if (!row) {
    // Fallback: maybe the table has id NULL and we need to lookup by rowid
    row = db.prepare("SELECT rowid, * FROM clients WHERE rowid = ?").get(id);
  }
  return toShape(row);
}

function create(data) {
  // Accept either full object (from frontend) or { cliente }
  const payloadObj = data || {};
  const cliente = payloadObj.cliente || payloadObj;
  // normalize advisor references: if assessor fields are names or objects, resolve/create to numeric id
  (function normalizeAdvisorRefs(obj) {
    try {
      if (!obj) return;
      // investment.assessor
      if (obj.investment && obj.investment.assessor != null) {
        const a = obj.investment.assessor;
        if (typeof a === "string" && a.trim()) {
          // try to find by name (case-insensitive)
          const found = (advisors.list() || []).find(
            (x) =>
              (x && x.name && String(x.name).toLowerCase()) ===
              String(a).toLowerCase()
          );
          if (found) obj.investment.assessor = found.id;
          else {
            // create advisor with given name
            const created = advisors.create({ name: a });
            if (created && created.id) obj.investment.assessor = created.id;
          }
        } else if (typeof a === "object" && a.name) {
          // create advisor record from object
          const created = advisors.create({
            name: a.name,
            email: a.email,
            avatar: a.avatar,
          });
          if (created && created.id) obj.investment.assessor = created.id;
        }
      }
      // top-level assessor
      if (obj.assessor != null) {
        const at = obj.assessor;
        if (typeof at === "string" && at.trim()) {
          const found = (advisors.list() || []).find(
            (x) =>
              (x && x.name && String(x.name).toLowerCase()) ===
              String(at).toLowerCase()
          );
          if (found) obj.assessor = found.id;
          else {
            const created = advisors.create({ name: at });
            if (created && created.id) obj.assessor = created.id;
          }
        } else if (typeof at === "object" && at.name) {
          const created = advisors.create({
            name: at.name,
            email: at.email,
            avatar: at.avatar,
          });
          if (created && created.id) obj.assessor = created.id;
        }
      }
    } catch (e) {
      // swallow - advisor resolution is best-effort
    }
  })(payloadObj);
  // normalize cpf_cnpj to digits only if present
  if (cliente && cliente.cpf_cnpj) {
    cliente.cpf_cnpj = String(cliente.cpf_cnpj).replace(/\D/g, "");
  }
  // ensure bank.created_at and each bankRegister item has created_at set to now if missing (on update)
  try {
    const now = new Date().toISOString();
    if (cliente) {
      if (!cliente.bank) cliente.bank = {};
      if (!cliente.bank.created_at) cliente.bank.created_at = now;
      if (Array.isArray(cliente.bankRegister)) {
        cliente.bankRegister = cliente.bankRegister.map((b) => {
          try {
            if (!b) return b;
            if (!b.created_at) b.created_at = now;
            return b;
          } catch (e) {
            return b;
          }
        });
      }
    }
  } catch (e) {}
  // store the whole payload object (so frontend structure is preserved)
  // Ensure we don't duplicate assessor at top-level: prefer investment.assessor as source of truth
  try {
    const obj = payloadObj.cliente ? payloadObj : payloadObj;
    if (obj && obj.assessor != null) {
      // remove top-level assessor to avoid duplication; keep investment.assessor
      delete obj.assessor;
    }
  } catch (e) {}
  // ensure bank.created_at and each bankRegister item has created_at set to now if missing
  try {
    const now = new Date().toISOString();
    if (cliente) {
      if (!cliente.bank) cliente.bank = {};
      if (!cliente.bank.created_at) cliente.bank.created_at = now;
      if (Array.isArray(cliente.bankRegister)) {
        cliente.bankRegister = cliente.bankRegister.map((b) => {
          try {
            if (!b) return b;
            if (!b.created_at) b.created_at = now;
            return b;
          } catch (e) {
            return b;
          }
        });
      }
    }
  } catch (e) {}
  const payload = JSON.stringify(
    payloadObj.cliente ? payloadObj : { cliente: payloadObj }
  );
  try {
    const info = db
      .prepare(
        "INSERT INTO clients (name, cpf_cnpj, email, telefone, data) VALUES (?, ?, ?, ?, ?)"
      )
      .run(
        (cliente && cliente.name) || payloadObj.name || null,
        (cliente && cliente.cpf_cnpj) || null,
        (cliente && cliente.email) || payloadObj.email || null,
        (cliente && cliente.telefone) || null,
        payload
      );
    // lastInsertRowid should contain the new row id; as fallback use lastInsertRowid
    const newId =
      info &&
      (info.lastInsertRowid != null
        ? info.lastInsertRowid
        : info.lastInsertROWID != null
        ? info.lastInsertROWID
        : null);
    if (newId != null) return get(newId);
    // As a final fallback, query the last row using ROWID
    const row = db
      .prepare("SELECT rowid, * FROM clients ORDER BY rowid DESC LIMIT 1")
      .get();
    return toShape(row);
  } catch (err) {
    // better-sqlite3 throws with .code like 'SQLITE_CONSTRAINT' or 'SQLITE_CONSTRAINT_UNIQUE'
    const isConstraint =
      (err &&
        err.code &&
        String(err.code).indexOf("SQLITE_CONSTRAINT") === 0) ||
      (err &&
        err.message &&
        String(err.message).toLowerCase().includes("unique constraint failed"));
    if (isConstraint) {
      const e = new Error("CPF/CNPJ already exists");
      e.status = 409;
      e.detail = { field: "cpf_cnpj", message: "CPF/CNPJ já cadastrado." };
      throw e;
    }
    throw err;
  }
}

function update(id, data) {
  const payloadObj = data || {};
  const cliente = payloadObj.cliente || payloadObj;
  // normalize advisor refs like in create()
  (function normalizeAdvisorRefs(obj) {
    try {
      if (!obj) return;
      if (obj.investment && obj.investment.assessor != null) {
        const a = obj.investment.assessor;
        if (typeof a === "string" && a.trim()) {
          const found = (advisors.list() || []).find(
            (x) =>
              (x && x.name && String(x.name).toLowerCase()) ===
              String(a).toLowerCase()
          );
          if (found) obj.investment.assessor = found.id;
          else {
            const created = advisors.create({ name: a });
            if (created && created.id) obj.investment.assessor = created.id;
          }
        } else if (typeof a === "object" && a.name) {
          const created = advisors.create({
            name: a.name,
            email: a.email,
            avatar: a.avatar,
          });
          if (created && created.id) obj.investment.assessor = created.id;
        }
      }
      if (obj.assessor != null) {
        const at = obj.assessor;
        if (typeof at === "string" && at.trim()) {
          const found = (advisors.list() || []).find(
            (x) =>
              (x && x.name && String(x.name).toLowerCase()) ===
              String(at).toLowerCase()
          );
          if (found) obj.assessor = found.id;
          else {
            const created = advisors.create({ name: at });
            if (created && created.id) obj.assessor = created.id;
          }
        } else if (typeof at === "object" && at.name) {
          const created = advisors.create({
            name: at.name,
            email: at.email,
            avatar: at.avatar,
          });
          if (created && created.id) obj.assessor = created.id;
        }
      }
    } catch (e) {}
  })(payloadObj);
  if (cliente && cliente.cpf_cnpj) {
    cliente.cpf_cnpj = String(cliente.cpf_cnpj).replace(/\D/g, "");
  }
  // Ensure we don't duplicate assessor at top-level on update; prefer investment.assessor as source of truth
  try {
    const obj = payloadObj.cliente ? payloadObj : payloadObj;
    if (obj && obj.assessor != null) {
      delete obj.assessor;
    }
  } catch (e) {}
  const payload = JSON.stringify(
    payloadObj.cliente ? payloadObj : { cliente: payloadObj }
  );
  try {
    const info = db
      .prepare(
        "UPDATE clients SET name = ?, cpf_cnpj = ?, email = ?, data = ? WHERE id = ?"
      )
      .run(
        (cliente && cliente.name) || payloadObj.name || null,
        (cliente && cliente.cpf_cnpj) || null,
        (cliente && cliente.email) || payloadObj.email || null,
        payload,
        id
      );
    if (info.changes === 0) return null;
    return get(id);
  } catch (err) {
    const isConstraint =
      (err &&
        err.code &&
        String(err.code).indexOf("SQLITE_CONSTRAINT") === 0) ||
      (err &&
        err.message &&
        String(err.message).toLowerCase().includes("unique constraint failed"));
    if (isConstraint) {
      const e = new Error("CPF/CNPJ already exists");
      e.status = 409;
      e.detail = { field: "cpf_cnpj", message: "CPF/CNPJ já cadastrado." };
      throw e;
    }
    throw err;
  }
}

function del(id, opts) {
  // fetch current row (including data) for audit
  const row = db.prepare("SELECT rowid, * FROM clients WHERE id = ?").get(id);
  if (!row) return false;

  // Prepare statements
  const insertAudit = db.prepare(
    "INSERT INTO clients_audit (client_id, action, payload, user, user_id, user_email, user_role, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  );
  const deleteStmt = db.prepare("DELETE FROM clients WHERE id = ?");

  // Run both ops atomically
  try {
    const tx = db.transaction(() => {
      const payload =
        row.data ||
        JSON.stringify({
          id: row.id,
          name: row.name,
          cpf_cnpj: row.cpf_cnpj,
          email: row.email,
        });
      let user = opts && opts.user ? opts.user : null;
      // if user is object, store as JSON string and extract normalized fields
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

function listAudit(clientId, opts) {
  // opts: { page, pageSize, action, from, to, userId }
  const _opts = opts || {};
  const p = {
    page: _opts.page != null ? Number(_opts.page) : 1,
    pageSize: _opts.pageSize != null ? Number(_opts.pageSize) : 20,
    action: _opts.action,
    from: _opts.from,
    to: _opts.to,
    userId: _opts.userId,
  };
  const filters = ["client_id = ?"];
  const params = [clientId];
  if (p.action) {
    filters.push("action = ?");
    params.push(p.action);
  }
  const userIdFilter = p.userId;
  if (userIdFilter) {
    // we'll handle userId filtering in JS to avoid SQL datatype/LIKE issues
    // do not add SQL filter for user here
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
    // total count (without userId filtering)
    const countRow = db
      .prepare(`SELECT COUNT(1) as cnt FROM clients_audit ${where}`)
      .get(...params);
    let total = countRow && countRow.cnt ? countRow.cnt : 0;

    // If userId filter is requested, fetch matching rows (without LIMIT) and filter in JS
    if (userIdFilter) {
      const rowsAll = db
        .prepare(
          `SELECT * FROM clients_audit ${where} ORDER BY created_at DESC`
        )
        .all(...params);
      const parsedAll = rowsAll.map((r) => {
        const copy = Object.assign({}, r);
        if (copy.user) {
          try {
            copy.user = JSON.parse(copy.user);
          } catch (e) {
            /* leave as-is */
          }
        }
        return copy;
      });
      const filtered = parsedAll.filter((r) => {
        if (!r.user) return false;
        if (typeof r.user === "string") {
          if (r.user === userIdFilter) return true;
          // match common JSON text patterns
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

    // pagination (no userId filter)
    const offset = (Math.max(1, Number(p.page)) - 1) * Number(p.pageSize);
    const rows = db
      .prepare(
        `SELECT * FROM clients_audit ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`
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
        "warning: could not read clients_audit",
        err && err.message
      );
    return { rows: [], total: 0 };
  }
}

module.exports = { list, get, create, update, delete: del, listAudit };
