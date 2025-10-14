#!/usr/bin/env node
/*
  scripts/populate_clients_with_assessors.js
  Workflow:
    - clears advisors and clients tables
    - inserts a small set of advisors
    - inserts clients and links them to advisors (by creating advisor records when necessary)

  Usage:
    node scripts/populate_clients_with_assessors.js --db ./backend/dev.sqlite
    node scripts/populate_clients_with_assessors.js --count 20
    node scripts/populate_clients_with_assessors.js --clear
*/

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { count: 10, db: null };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--count" || a === "-c") {
      out.count = Number(args[i + 1]) || out.count;
      i++;
      continue;
    }
    if (a.startsWith("--count=")) {
      out.count = Number(a.split("=")[1]) || out.count;
      continue;
    }
    if (a === "--db") {
      out.db = args[i + 1];
      i++;
      continue;
    }
    if (a.startsWith("--db=")) {
      out.db = a.split("=")[1];
      continue;
    }
    if (a === "--clear" || a === "-x") {
      out.clear = true;
      continue;
    }
  }
  return out;
}

const path = require("path");
const os = require("os");

async function main() {
  const args = parseArgs();
  if (args.db) process.env.SQLITE_FILE = args.db;

  const advisorsAdapter = require(path.join(
    __dirname,
    "..",
    "..",
    "backend",
    "src",
    "services",
    "sqlite",
    "advisors.js"
  ));
  const clientsAdapter = require(path.join(
    __dirname,
    "..",
    "..",
    "backend",
    "src",
    "services",
    "sqlite",
    "clients.js"
  ));

  // clear tables
  try {
    const Database = require("better-sqlite3");
    const dbFile =
      process.env.SQLITE_FILE ||
      path.join(__dirname, "..", "..", "backend", "dev.sqlite");
    const db = new Database(dbFile);
    db.prepare("DELETE FROM clients").run();
    db.prepare("DELETE FROM clients_audit").run();
    db.prepare("DELETE FROM advisors").run();
    db.close();
    console.log("Cleared clients, clients_audit and advisors tables");
  } catch (e) {
    console.error("Could not clear tables:", e && e.message);
    process.exit(1);
  }

  // insert sample advisors
  const child = require("child_process");
  const dbFile =
    process.env.SQLITE_FILE ||
    path.join(__dirname, "..", "..", "backend", "dev.sqlite");
  const advCount = args.advisors || Math.min(10, args.count || 10);
  const advScript = path.join(__dirname, "populate_advisors_db.js");
  try {
    const advArgs = [advScript, "--count", String(advCount), "--db", dbFile];
    if (args.clear) advArgs.push("--clear");
    const res = child.spawnSync(process.execPath, advArgs, {
      stdio: "inherit",
      env: process.env,
    });
    if (res.status !== 0) {
      console.error("Advisor population script failed");
      process.exit(1);
    }
  } catch (e) {
    console.error("Failed to run advisor population script:", e && e.message);
    process.exit(1);
  }

  const allAdvisors = advisorsAdapter.list();
  if (!allAdvisors || allAdvisors.length === 0) {
    console.error("No advisors found after running advisor script");
    process.exit(1);
  }
  console.log("Found advisors:", allAdvisors.length);

  const helpers = require(path.join(__dirname, "_data_helpers.js"));
  const clients = [];

  try {
    const firstAdvisor = allAdvisors[0];
    if (!firstAdvisor)
      throw new Error("No advisors available to link client to");
    const oneClient = helpers.makeClientSample();
    oneClient.assessor = firstAdvisor.id;
    if (!oneClient.investment) oneClient.investment = {};
    oneClient.investment.assessor = firstAdvisor.id;
    oneClient.investment.saldo = parseFloat(
      (Math.random() * 500000).toFixed(2)
    );
    const r1 = clientsAdapter.create(oneClient);
    clients.push(r1);
    console.log(
      "Inserted single client linked to existing advisor:",
      firstAdvisor.id
    );
  } catch (e) {
    console.error("Failed to insert single client:", e && e.message);
    process.exit(1);
  }

  for (let i = 1; i < args.count; i++) {
    const cli = helpers.makeClientSample();
    const chosen = allAdvisors[i % allAdvisors.length];
    cli.assessor = chosen.id;
    if (!cli.investment) cli.investment = {};
    cli.investment.assessor = chosen.id;
    cli.investment.saldo = parseFloat((Math.random() * 500000).toFixed(2));
    const r = clientsAdapter.create(cli);
    clients.push(r);
    process.stdout.write(".");
  }
  console.log("\nInserted clients:", clients.length);
}

if (require.main === module) main();
