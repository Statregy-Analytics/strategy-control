#!/usr/bin/env node
"use strict";

// Script para apagar dados das tabelas de clients, advisors e leads
// Uso:
//   NODE_PATH=./backend/node_modules node scripts/clear_dbs.js --db ./backend/dev.sqlite --yes
// Opções:
//   --db   Caminho para o arquivo sqlite (padrão: ./backend/dev.sqlite)
//   --yes  Confirma execução. Sem --yes o script apenas mostra o que faria.

const path = require("path");
const fs = require("fs");

function parseArgs() {
  const args = {};
  const raw = process.argv.slice(2);
  for (let i = 0; i < raw.length; i++) {
    const a = raw[i];
    if (a === "--db") {
      args.db = raw[i + 1];
      i++;
    } else if (a === "--yes") {
      args.yes = true;
    } else if (a === "--remove-file" || a === "--delete-file") {
      args.removeFile = true;
    } else if (a === "-h" || a === "--help") {
      args.help = true;
    }
  }
  return args;
}

function showHelp() {
  console.log(
    "clear_dbs.js - Zera dados das tabelas de clients/advisors/leads\n"
  );
  console.log(
    "Uso: NODE_PATH=./backend/node_modules node scripts/clear_dbs.js --db ./backend/dev.sqlite --yes\n"
  );
  console.log(
    "--db    Caminho para o arquivo sqlite (padrão: ./backend/dev.sqlite)"
  );
  console.log(
    "--yes   Executa as deleções. Sem --yes apenas mostra as ações que seriam tomadas."
  );
}

async function main() {
  const args = parseArgs();
  if (args.help) return showHelp();

  // padrão esperado: <project-root>/backend/dev.sqlite
  const dbPath =
    args.db || path.join(__dirname, "..", "..", "backend", "dev.sqlite");
  if (!fs.existsSync(dbPath)) {
    console.error(`Arquivo de DB não encontrado: ${dbPath}`);
    process.exit(1);
  }

  const toDelete = [
    "clients",
    "clients_audit",
    "advisors",
    "advisors_audit",
    "leads",
    "leads_audit",
  ];

  console.log(`Banco: ${dbPath}`);
  console.log("Tabelas alvo:");
  toDelete.forEach((t) => console.log(`  - ${t}`));

  if (args.removeFile) {
    console.log("Opção: remover arquivo do DB após limpar as tabelas.");
  }

  if (!args.yes) {
    console.log(
      "\nSem --yes: execução em modo dry-run. Use --yes para confirmar e executar as deleções."
    );
    if (args.removeFile) {
      console.log(
        "Com --remove-file mas sem --yes: o arquivo do DB NÃO será removido. Use --yes para confirmar remoção."
      );
    }
    process.exit(0);
  }

  // Tenta carregar better-sqlite3 na pasta backend/node_modules (onde os outros scripts esperam)
  let Database;
  let db;
  try {
    try {
      Database = require(path.join(
        __dirname,
        "..",
        "backend",
        "node_modules",
        "better-sqlite3"
      ));
    } catch (e) {
      // fallback para require normal
      Database = require("better-sqlite3");
    }
  } catch (e) {
    Database = null;
  }

  if (Database) {
    try {
      db = new Database(dbPath);
    } catch (e) {
      console.error("Erro ao abrir DB com better-sqlite3:", e && e.message);
      process.exit(1);
    }

    try {
      db.transaction(() => {
        toDelete.forEach((t) => {
          try {
            db.prepare(`DELETE FROM ${t}`).run();
            console.log(`Limpou tabela: ${t}`);
          } catch (e) {
            console.warn(
              `Aviso: não foi possível apagar tabela ${t}: ${e && e.message}`
            );
          }
        });
      })();
    } finally {
      db.close();
    }
  } else {
    // Fallback usando sqlite3 (callback-based) se better-sqlite3 não estiver instalado
    let sqlite3;
    try {
      sqlite3 = require(path.join(
        __dirname,
        "..",
        "backend",
        "node_modules",
        "sqlite3"
      ));
    } catch (e) {
      try {
        sqlite3 = require("sqlite3");
      } catch (e2) {
        console.error(
          "Nenhum driver sqlite disponível (better-sqlite3 ou sqlite3). Instale um ou use NODE_PATH=./backend/node_modules"
        );
        process.exit(1);
      }
    }

    const sqlite = sqlite3.verbose();
    db = new sqlite.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
      if (err) {
        console.error("Erro ao abrir DB com sqlite3:", err && err.message);
        process.exit(1);
      }
      // executar deletions sequencialmente
      const runNext = (i) => {
        if (i >= toDelete.length) {
          db.close();
          console.log(
            "\nPronto. O banco foi zerado (tabelas tentadas: " +
              toDelete.join(", ") +
              ")"
          );
          // se solicitado, remover o arquivo do DB (apenas quando --yes foi passado)
          if (args.removeFile) {
            try {
              fs.unlinkSync(dbPath);
              console.log(`Arquivo removido: ${dbPath}`);
            } catch (e) {
              console.warn(
                `Aviso: não foi possível remover arquivo ${dbPath}: ${
                  e && e.message
                }`
              );
            }
          }
          return;
        }
        const t = toDelete[i];
        db.run(`DELETE FROM ${t}`, function (err2) {
          if (err2) {
            console.warn(
              `Aviso: não foi possível apagar tabela ${t}: ${
                err2 && err2.message
              }`
            );
          } else {
            console.log(`Limpou tabela: ${t}`);
          }
          runNext(i + 1);
        });
      };
      runNext(0);
    });
    // não fazer o console final aqui: será chamado ao terminar a execução acima
    return;
  }

  console.log(
    "\nPronto. O banco foi zerado (tabelas tentadas: " +
      toDelete.join(", ") +
      ")"
  );

  // se solicitado, remover o arquivo do DB (apenas quando --yes foi passado)
  if (args.removeFile) {
    try {
      fs.unlinkSync(dbPath);
      console.log(`Arquivo removido: ${dbPath}`);
    } catch (e) {
      console.warn(
        `Aviso: não foi possível remover arquivo ${dbPath}: ${e && e.message}`
      );
    }
  }
}

main();
