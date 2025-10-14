#!/usr/bin/env node
/*
  scripts/populate_leads_db.js
  Insere leads diretamente no banco sqlite usado pelo backend

  Uso:
    node scripts/populate_leads_db.js --count 50
    node scripts/populate_leads_db.js -c 10 --db ./backend/dev.sqlite

  Observação: o script requer que as dependências do backend estejam instaladas (better-sqlite3).
  Ele reutiliza o adaptador em backend/src/services/sqlite/leads.js para preservar formato e validações.
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
const helpers = require(path.join(__dirname, "_data_helpers.js"));
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

function randomPhone() {
  const ddd = String(randInt(11, 99));
  const part1 = String(randInt(9000, 9999));
  const part2 = String(randInt(1000, 9999));
  return `+55 ${ddd} ${part1}-${part2}`;
}

function randomBirth() {
  const year = randInt(1955, 2002);
  const month = String(randInt(1, 12)).padStart(2, "0");
  const day = String(randInt(1, 28)).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function randomCNH() {
  let s = "";
  for (let i = 0; i < 11; i++) s += String(randInt(0, 9));
  return s;
}

function makeLead() {
  const name = helpers.randomFullName();
  const email = helpers.randomEmail(name);
  const avatar =
    Math.random() < 0.2
      ? ""
      : "https://sources.strategyanalytics.com.br/storage/users/_Avatar_.png";
  const utm = {
    campaign: `camp${randInt(1, 5)}`,
    source: ["google", "facebook", "email", "organic"][randInt(0, 3)],
  };
  const notes = [
    "Interessado em demo",
    "Solicitar contato",
    "Alta prioridade",
    "Follow-up em 7 dias",
  ][randInt(0, 3)];
  // Additional fields to match frontend expected shape
  const cpf = helpers.randomCPF
    ? helpers.randomCPF()
    : `${randInt(100, 999)}.${randInt(100, 999)}.${randInt(100, 999)}-${randInt(
        10,
        99
      )}`;
  const rg = `${randInt(10, 99)}.${randInt(100, 999)}.${randInt(
    100,
    999
  )}-${randInt(0, 9)}`;
  const profission = [
    "Engenheiro",
    "Médica",
    "Professor",
    "Advogada",
    "Designer",
    "Analista",
  ][randInt(0, 5)];
  const situacao_rf = ["Regular", "Pendente", "Irregular"][randInt(0, 2)];
  const estagio_lead = ["Novo", "Contato Feito", "Em Negociação", "Fechado"][
    randInt(0, 3)
  ];
  const address = [
    {
      logradouro: `${randInt(1, 9999)} Avenida Central`,
      city: "São Paulo/SP",
      zipcode: `${randInt(10000, 99999)}-${randInt(100, 999)}`,
    },
  ];
  const partner = [
    {
      razao_social: `${
        helpers.randomCompanyName ? helpers.randomCompanyName() : "Empresa LTDA"
      }`,
      cnpj: `${randInt(10, 99)}.${randInt(100, 999)}.${randInt(
        100,
        999
      )}/${randInt(1000, 9999)}-${randInt(10, 99)}`,
      position: "Sócio Administrador",
      member_since: "04/03/2025",
    },
  ];
  const related_person = [
    {
      name: helpers.randomFullName(),
      relate: "Sócio",
      phone: randomPhone(),
      mail: helpers.randomEmail(helpers.randomFullName()),
    },
  ];
  const bankRegister = [
    {
      chave_pix: `${randInt(100000000, 999999999)}`,
      cpf_cnpj: cpf,
      name: "Banco Exemplo",
      agency: `${randInt(1000, 9999)}`,
      account: `${randInt(10000, 99999)}-${randInt(0, 9)}`,
      type: "Conta Corrente",
      status: "Ativo",
    },
  ];
  const emprestimo = `${randInt(1, 5)}x`;
  const dividendo = {
    total: randInt(1000, 20000),
    data: new Date().toISOString().split("T")[0],
  };
  const contrato = {
    total: randInt(1, 5) * 1000,
    quantity: `${randInt(1, 5)}`,
  };
  const saldo = randInt(0, 50000);

  return {
    lead: {
      name,
      email,
      rg,
      cpf,
      phone: randomPhone(),
      birth: randomBirth(),
      cnh: randomCNH(),
      profission,
      situacao_rf,
      estagio_lead,
      address,
      partner,
      related_person,
      bankRegister,
      emprestimo,
      dividendo,
      contrato,
      saldo,
      source: ["Landing Page", "Evento", "Campanha", "Indicação"][
        randInt(0, 3)
      ],
      avatar,
      utm,
      notes,
      created_at: new Date().toISOString(),
    },
  };
}

async function main() {
  const args = parseArgs();
  const count = args.count;
  if (args.db) process.env.SQLITE_FILE = args.db;

  const adapterPath = path.join(
    __dirname,
    "..",
    "..",
    "backend",
    "src",
    "services",
    "sqlite",
    "leads.js"
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

  if (args.clear) {
    try {
      const Database = require("better-sqlite3");
      const dbFile =
        process.env.SQLITE_FILE ||
        path.join(__dirname, "..", "..", "backend", "dev.sqlite");
      const db = new Database(dbFile);
      db.prepare("DELETE FROM leads").run();
      db.prepare("DELETE FROM leads_audit").run();
      db.close();
      console.log("Cleared leads and leads_audit tables");
    } catch (e) {
      console.error("Could not clear tables:", e && e.message);
      process.exit(1);
    }
  }

  console.log(`Inserting ${count} leads using adapter at ${adapterPath}`);
  let created = 0;
  for (let i = 0; i < count; i++) {
    const lead = makeLead();
    try {
      adapter.create(lead);
      created++;
      process.stdout.write(`. (${created}/${count})`);
    } catch (err) {
      console.error(`\nError inserting lead: ${err && err.message}`);
      console.error("Payload:", lead);
      process.exit(1);
    }
  }
  console.log(`\nDone. Created ${created} leads.`);
}

if (require.main === module)
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
