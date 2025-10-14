#!/usr/bin/env node
/*
  scripts/populate_clients_db.js
  Insere clientes diretamente no banco sqlite usado pelo backend

  Uso:
    node scripts/populate_clients_db.js --count 50
    node scripts/populate_clients_db.js -c 10 --db ./backend/dev.sqlite

  Observação: o script requer que as dependências do backend estejam instaladas (better-sqlite3).
  Ele reutiliza o adaptador em backend/src/services/sqlite/clients.js para preservar formato e validações.
*/

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { count: 10, db: null, avatar: "default" };
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
    if (a === "--avatar" || a.startsWith("--avatar=")) {
      if (a === "--avatar") {
        out.avatar = args[i + 1] || out.avatar;
        i++;
      } else {
        out.avatar = a.split("=")[1] || out.avatar;
      }
      continue;
    }
  }
  return out;
}

// Will be set in main() after parsing args so helper can use it
let AVATAR_MODE = "random"; // 'random' | 'default' | 'empty'
const path = require("path");
const helpers = require(path.join(__dirname, "_data_helpers.js"));

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const firstNames = [
  "Ana",
  "Bruno",
  "Carlos",
  "Daniela",
  "Eduardo",
  "Felipe",
  "Gabriela",
  "Helena",
  "Igor",
  "Julia",
  "Karla",
  "Lucas",
  "Mariana",
  "Nicolas",
  "Olivia",
  "Paulo",
  "Quenia",
  "Rafael",
  "Sofia",
  "Thiago",
];
const lastNames = [
  "Alves",
  "Barbosa",
  "Cardoso",
  "Dias",
  "Esteves",
  "Fernandes",
  "Gomes",
  "Henrique",
  "Ibrahim",
  "Jardim",
  "Klein",
  "Lima",
  "Melo",
  "Nascimento",
  "Oliveira",
  "Pereira",
  "Queiroz",
  "Ribeiro",
  "Silva",
  "Teixeira",
];

function randomFullName() {
  const fn = firstNames[randInt(0, firstNames.length - 1)];
  const ln = lastNames[randInt(0, lastNames.length - 1)];
  if (Math.random() < 0.4) {
    const mn = lastNames[randInt(0, lastNames.length - 1)];
    return `${fn} ${mn} ${ln}`;
  }
  return `${fn} ${ln}`;
}

function randomEmail(name) {
  const clean = String(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".");
  const domain = ["example.com", "mail.com", "test.com", "demo.org"][
    randInt(0, 3)
  ];
  return `${clean}${randInt(1, 99)}@${domain}`;
}

function randomBirth() {
  const year = randInt(1950, 2005);
  const month = String(randInt(1, 12)).padStart(2, "0");
  const day = String(randInt(1, 28)).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const states = [
  "SP",
  "RJ",
  "MG",
  "BA",
  "RS",
  "PR",
  "SC",
  "CE",
  "PE",
  "GO",
  "ES",
  "MA",
  "PB",
  "PI",
  "RN",
  "AM",
  "PA",
  "AP",
  "AC",
  "RO",
  "RR",
  "TO",
];
const cities = [
  "São Paulo",
  "Rio de Janeiro",
  "Belo Horizonte",
  "Salvador",
  "Porto Alegre",
  "Curitiba",
  "Florianópolis",
  "Fortaleza",
  "Recife",
  "Goiânia",
  "Vitória",
  "São Luís",
  "João Pessoa",
  "Teresina",
  "Natal",
  "Manaus",
  "Belém",
];

function randomZip() {
  return String(randInt(10000000, 99999999));
}

function randomStreet() {
  const streets = [
    "Rua das Flores",
    "Avenida Brasil",
    "Rua Principal",
    "Travessa do Sol",
    "Alameda Santos",
    "Praça da Sé",
    "Rua das Acácias",
    "Avenida Central",
  ];
  return streets[randInt(0, streets.length - 1)];
}

function generateCnpj() {
  const n = [];
  for (let i = 0; i < 12; i++) n.push(randInt(0, 9));
  const calc = (slice) => {
    let pos = slice.length - 7;
    let sum = 0;
    for (let i = slice.length; i >= 1; i--) {
      sum += slice[slice.length - i] * pos--;
      if (pos < 2) pos = 9;
    }
    const res = sum % 11;
    return res < 2 ? 0 : 11 - res;
  };
  n.push(calc(n));
  n.push(calc(n));
  return n.join("");
}

function generateCpf() {
  const n = [];
  for (let i = 0; i < 9; i++) n.push(randInt(0, 9));
  const calc = (arr) => {
    let sum = 0;
    for (let i = 0; i < arr.length; i++) sum += arr[i] * (arr.length + 1 - i);
    let r = 11 - (sum % 11);
    if (r === 10 || r === 11) r = 0;
    return r;
  };
  n.push(calc(n));
  n.push(calc(n));
  return n.join("");
}

function makeClient() {
  // use shared helper to ensure consistent sample shape
  const sample = helpers.makeClientSample();
  // map AVATAR_MODE behavior
  if (AVATAR_MODE === "empty") sample.cliente.avatar = "";
  if (AVATAR_MODE === "default")
    sample.cliente.avatar =
      "https://sources.strategyanalytics.com.br/storage/users/_Avatar_.png";
  // pick random assessor name for now (adapter will normalize to id)
  const advisorNames = ["Joe Doe", "Maria Silva", "Assessor X", "John Doe"];
  const chosen = advisorNames[randInt(0, advisorNames.length - 1)];
  // only set investment.assessor (source of truth) — do not duplicate at top-level
  sample.investment.assessor = chosen;
  return sample;
}

async function main() {
  const args = parseArgs();
  AVATAR_MODE = args.avatar || AVATAR_MODE;
  const count = args.count;
  // If user provided DB path override backend env
  if (args.db) process.env.SQLITE_FILE = args.db;

  // require the backend sqlite adapter (reuses its DB path and migrations)
  const path = require("path");
  const adapterPath = path.join(
    __dirname,
    "..",
    "backend",
    "src",
    "services",
    "sqlite",
    "clients.js"
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

  // If requested, clear clients and clients_audit tables before populating
  if (args.clear) {
    try {
      const Database = require("better-sqlite3");
      const dbFile =
        process.env.SQLITE_FILE || path.join(__dirname, "../dev.sqlite");
      const db = new Database(dbFile);
      db.prepare("DELETE FROM clients").run();
      db.prepare("DELETE FROM clients_audit").run();
      db.close();
      console.log("Cleared clients and clients_audit tables");
    } catch (e) {
      console.error("Could not clear tables:", e && e.message);
      process.exit(1);
    }
  }

  console.log(`Inserting ${count} clients using adapter at ${adapterPath}`);
  let created = 0;
  for (let i = 0; i < count; i++) {
    let attempts = 0;
    while (attempts < 6) {
      attempts++;
      const cli = makeClient();
      try {
        // adapter.create expects either flat or { cliente } shape; passing our object will be stored in data column
        const res = adapter.create(cli);
        created++;
        process.stdout.write(`. (${created}/${count}` + `)`);
        break;
      } catch (err) {
        // if cpf duplicate, generate another and retry
        if (err && err.status === 409) {
          // try again
          continue;
        }
        console.error("\nError inserting client:", err && err.message);
        console.error("Payload:", cli);
        process.exit(1);
      }
    }
    if (attempts >= 6) {
      console.error(
        "\nCould not generate unique CPF after several attempts. Aborting."
      );
      break;
    }
  }
  console.log(`\nDone. Created ${created} clients.`);
}

if (require.main === module)
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
