const fs = require("fs");
const path = require("path");
const os = require("os");
describe("Clients with advisors linking", () => {
  const tmpDb = path.join(
    os.tmpdir(),
    `test-clients-assessor-${Date.now()}.sqlite`
  );
  let clientsSvc, advisorsSvc;

  beforeAll(() => {
    process.env.SQLITE_FILE = tmpDb;
    process.env.USE_FAKES = "false";
    clientsSvc = require("../src/services/sqlite/clients");
    advisorsSvc = require("../src/services/sqlite/advisors");
  });

  afterAll(() => {
    try {
      fs.unlinkSync(tmpDb);
    } catch (e) {}
  });

  test("create advisor and client links by name -> stored as id and returned with name", () => {
    // clear tables
    const Database = require("better-sqlite3");
    const db = new Database(tmpDb);
    db.prepare("DELETE FROM clients").run();
    db.prepare("DELETE FROM clients_audit").run();
    db.prepare("DELETE FROM advisors").run();
    db.close();

    const adv = advisorsSvc.create({
      name: "Linker",
      email: "link@example.com",
    });
    expect(adv).toBeDefined();
    expect(adv.id).toBeGreaterThan(0);

    // create client referencing advisor by name
    const payload = {
      name: "C1",
      cpf_cnpj: "98765432100",
      email: "c1@example.com",
      assessor: "Linker",
      investment: { classification: "Ações", saldo: 100, assessor: "Linker" },
    };
    const created = clientsSvc.create(payload);
    expect(created).toBeDefined();
    const id = created.id || (created.cliente && created.cliente.id);
    expect(id).toBeGreaterThan(0);

    // fetch raw row from sqlite to ensure stored payload uses numeric id
    const direct = new Database(tmpDb);
    const row = direct.prepare("SELECT * FROM clients WHERE id = ?").get(id);
    expect(row).toBeDefined();
    const parsed = JSON.parse(row.data);
    // parsed may be { cliente: {...} } or flat; inspect nested
    const stored = parsed.cliente || parsed;
    // stored.assessor should be numeric OR investment.assessor numeric
    const invAssessor = stored.investment && stored.investment.assessor;
    expect(
      typeof stored.assessor === "number" || typeof invAssessor === "number"
    ).toBe(true);

    // When retrieving via service, assessor should be resolved to name
    const got = clientsSvc.get(id);
    expect(got).toBeDefined();
    if (got.investment) expect(typeof got.investment.assessor).toBe("string");
    if (got.assessor) expect(typeof got.assessor).toBe("string");
    direct.close();
  });
});
