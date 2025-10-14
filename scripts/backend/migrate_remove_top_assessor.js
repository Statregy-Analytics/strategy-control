#!/usr/bin/env node
/*
  scripts/migrate_remove_top_assessor.js
  Migra registros na tabela clients removendo o campo top-level `assessor` do JSON
  em `data`. Se existir um assessor top-level e não houver `investment.assessor`,
  o valor será movido para `investment.assessor`.

  Uso:
    node scripts/migrate_remove_top_assessor.js --db ./backend/dev.sqlite
*/

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { db: null, dry: false };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--db") {
      out.db = args[i + 1];
      i++;
      continue;
    }
    if (a.startsWith("--db=")) {
      out.db = a.split("=")[1];
      continue;
    }
    if (a === "--dry") {
      out.dry = true;
      continue;
    }
  }
  return out;
}

async function main() {
  const args = parseArgs();
  const path = require("path");
  const Database = require("better-sqlite3");
  const dbFile =
    args.db || process.env.SQLITE_FILE || path.join(__dirname, "../dev.sqlite");
  const db = new Database(dbFile);

  const rows = db.prepare("SELECT id, data FROM clients").all();
  let updated = 0;
  // require advisors adapter to resolve names -> ids
  const advisors = require(path.join(
    __dirname,
    "..",
    "backend",
    "src",
    "services",
    "sqlite",
    "advisors.js"
  ));
  for (const r of rows) {
    if (!r.data) continue;
    let parsed;
    try {
      parsed = JSON.parse(r.data);
    } catch (e) {
      continue;
    }
    let changed = false;
    const root = parsed;

    function resolveAssessor(val) {
      if (val == null) return null;
      if (typeof val === "number" || String(val).match(/^\d+$/))
        return Number(val);
      const found = (advisors.list() || []).find(
        (x) =>
          x &&
          x.name &&
          String(x.name).toLowerCase() === String(val).toLowerCase()
      );
      if (found) return found.id;
      try {
        const created = advisors.create({ name: String(val) });
        if (created && created.id) return created.id;
      } catch (e) {}
      return null;
    }

    // Move top-level assessor into investment.assessor if present
    if (root.assessor !== undefined) {
      if (!root.investment) root.investment = {};
      const currentInv = root.investment.assessor;
      if (
        currentInv === undefined ||
        currentInv === null ||
        typeof currentInv === "string"
      ) {
        const resolved = resolveAssessor(root.assessor);
        if (resolved != null) root.investment.assessor = resolved;
        else if (currentInv === undefined)
          root.investment.assessor = root.assessor;
      }
      delete root.assessor;
      changed = true;
    }

    // Handle cliente.assessor legacy field
    if (root.cliente && root.cliente.assessor !== undefined) {
      if (!root.investment) root.investment = {};
      const resolved = resolveAssessor(root.cliente.assessor);
      if (resolved != null) root.investment.assessor = resolved;
      else if (root.investment.assessor === undefined)
        root.investment.assessor = root.cliente.assessor;
      delete root.cliente.assessor;
      changed = true;
    }

    // Normalize investment.assessor if it's a string
    if (
      root.investment &&
      root.investment.assessor != null &&
      typeof root.investment.assessor === "string"
    ) {
      const resolved = resolveAssessor(root.investment.assessor);
      if (resolved != null) {
        root.investment.assessor = resolved;
        changed = true;
      }
    }

    if (changed) {
      const newData = JSON.stringify(parsed);
      if (!args.dry)
        db.prepare("UPDATE clients SET data = ? WHERE id = ?").run(
          newData,
          r.id
        );
      updated++;
    }
  }
  db.close();
  console.log("Migration complete. Updated rows:", updated);
}

if (require.main === module) main();
