const Database = require("better-sqlite3");
const path = require("path");
const defaultDbFile =
  process.env.NODE_ENV === "test"
    ? path.join(__dirname, "test.sqlite")
    : path.join(__dirname, "dev.sqlite");
const dbFile = process.env.SQLITE_FILE || defaultDbFile;
const db = new Database(dbFile);
const clientId = 2;
const userId = "user-a";
const filters = ["client_id = ?"];
const params = [clientId];
filters.push("(user = ? OR user LIKE ?)");
params.push(userId);
params.push(`%"id":"${userId}"%`);
const where = "WHERE " + filters.join(" AND ");
const countSql = `SELECT COUNT(1) as cnt FROM clients_audit ${where}`;
const selSql = `SELECT * FROM clients_audit ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`;
console.log("countSql", countSql, "params", params);
const countRow = db.prepare(countSql).get(...params);
console.log("countRow", countRow);
const rows = db.prepare(selSql).all(...params, 10, 0);
console.log("rows", rows.length);
for (const r of rows) console.log(r);
