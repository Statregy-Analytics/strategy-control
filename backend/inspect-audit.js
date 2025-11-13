const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");
const defaultDbFile =
  process.env.NODE_ENV === "test"
    ? path.join(__dirname, "test.sqlite")
    : path.join(__dirname, "dev.sqlite");
const tmp = process.env.SQLITE_FILE || defaultDbFile;
console.log("DB file:", tmp);
const db = new Database(tmp);
const rows = db
  .prepare(
    "SELECT audit_id, client_id, action, payload, user, typeof(user) as user_type, created_at FROM clients_audit ORDER BY audit_id"
  )
  .all();
console.log("audit rows:", rows.length);
for (const r of rows) console.log(r);
