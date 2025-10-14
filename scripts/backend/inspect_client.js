#!/usr/bin/env node
const path = require("path");
const Database = require("better-sqlite3");
const args = process.argv.slice(2);
const id = Number(args[0]);
const dbFile = process.env.SQLITE_FILE || path.join(__dirname, "../dev.sqlite");
if (!id) {
  console.error("Usage: node scripts/inspect_client.js <id>");
  process.exit(1);
}
const db = new Database(dbFile);
const row = db.prepare("SELECT id, data FROM clients WHERE id = ?").get(id);
if (!row) {
  console.error("No row with id", id);
  process.exit(1);
}
let parsed;
try {
  parsed = JSON.parse(row.data);
} catch (e) {
  console.error("Invalid JSON in data");
  process.exit(1);
}
console.log(JSON.stringify(parsed, null, 2));
db.close();
