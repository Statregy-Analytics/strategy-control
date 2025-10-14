#!/usr/bin/env node
/*
  scripts/populate_advisors_db.js
  Insere assessores diretamente no banco sqlite usado pelo backend

  Uso:
    node scripts/populate_advisors_db.js --count 50
    node scripts/populate_advisors_db.js -c 10 --db ./backend/dev.sqlite

  Observação: o script requer que as dependências do backend estejam instaladas (better-sqlite3).
  Ele reutiliza o adaptador em backend/src/services/sqlite/advisors.js para preservar formato.
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

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const firstNames = [
  "João",
  "Maria",
  "Pedro",
  "Ana",
  "Carlos",
  "Mariana",
  "Lucas",
  "Fernanda",
  "Rafael",
  "Beatriz",
];
const lastNames = [
  "Silva",
  "Santos",
  "Oliveira",
  "Pereira",
  "Costa",
  "Rodrigues",
  "Almeida",
  "Gomes",
];

function randomFullName() {
  const fn = firstNames[randInt(0, firstNames.length - 1)];
  const ln = lastNames[randInt(0, lastNames.length - 1)];
  return `${fn} ${ln}`;
}

function randomEmail(name) {
  const clean = String(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".");
  const domain = ["example.com", "mail.com", "test.com"][randInt(0, 2)];
  return `${clean}${randInt(1, 99)}@${domain}`;
}

function makeAdvisor() {
  const name = randomFullName();
  const email = randomEmail(name);
  // sometimes leave avatar empty so frontend can render initials
  const avatar =
    Math.random() < 0.5
      ? ""
      : "https://sources.strategyanalytics.com.br/storage/users/_Avatar_.png";
  const assessor = { name, email, avatar };
  const customers = {
    balance_contract: parseFloat((Math.random() * 100000).toFixed(2)),
    balance_customers: parseFloat((Math.random() * 50000).toFixed(2)),
    captured_customers: randInt(0, 50),
    linked_customers: randInt(0, 200),
  };
  const gastos = {
    value: parseFloat((Math.random() * 10000).toFixed(2)),
    limite: parseFloat((Math.random() * 20000).toFixed(2)),
    data: [],
  };
  const commission = {
    received: parseFloat((Math.random() * 10000).toFixed(2)),
    future: parseFloat((Math.random() * 5000).toFixed(2)),
    value: parseFloat((Math.random() * 15000).toFixed(2)),
  };

  return {
    id: null,
    assessor,
    clients_count: randInt(0, 200),
    customers,
    gastos,
    commission,
    comissao_recebida: commission.received,
    comissao_futura: commission.future,
    actions: "Ações",
  };
}

async function main() {
  const args = parseArgs();
  const count = args.count;
  if (args.db) process.env.SQLITE_FILE = args.db;

  const path = require("path");
  const adapterPath = path.join(
    __dirname,
    "..",
    "..",
    "backend",
    "src",
    "services",
    "sqlite",
    "advisors.js"
  );
  let adapter;
  try {
    adapter = require(adapterPath);
  } catch (e) {
    console.error("Could not load backend sqlite adapter at", adapterPath);
    console.error(
      "Make sure dependencies are installed (run npm install in backend/) and the path is correct."
    );
    process.exit(1);
  }

  // Always clear advisors table before inserting to ensure we start fresh.
  // Keep support for --clear flag for compatibility; behaviour is the same.
  try {
    const Database = require("better-sqlite3");
    const dbFile =
      process.env.SQLITE_FILE ||
      path.join(__dirname, "..", "..", "backend", "dev.sqlite");
    const db = new Database(dbFile);
    db.prepare("DELETE FROM advisors").run();
    db.close();
    console.log("Cleared advisors table (automatic)");
  } catch (e) {
    console.error("Could not clear advisors table:", e && e.message);
    // If better-sqlite3 is missing, give a helpful hint to install backend deps
    try {
      if (
        e &&
        e.code === "MODULE_NOT_FOUND" &&
        String(e.message).includes("better-sqlite3")
      ) {
        console.error(
          "Hint: parece que 'better-sqlite3' não está instalado. Instale dependências do backend:\n  cd ../backend && npm install\nou instale apenas o pacote:\n  npm install better-sqlite3 --prefix ../backend"
        );
      }
    } catch (errHint) {
      // ignore
    }
    process.exit(1);
  }

  console.log(`Inserting ${count} advisors using adapter at ${adapterPath}`);
  let created = 0;
  for (let i = 0; i < count; i++) {
    const adv = makeAdvisor();
    try {
      const res = adapter.create(adv);
      created++;
      process.stdout.write(`. (${created}/${count})`);
    } catch (err) {
      console.error("\nError inserting advisor:", err && err.message);
      console.error("Payload:", adv);
      process.exit(1);
    }
  }
  console.log(`\nDone. Created ${created} advisors.`);
}

if (require.main === module) main();
