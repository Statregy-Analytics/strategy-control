const fs = require("fs");
const path = require("path");
const os = require("os");
describe("advisors audit on delete", () => {
  const tmpDb = path.join(
    os.tmpdir(),
    `test-advisors-audit-${Date.now()}.sqlite`
  );
  let svc;

  beforeAll(() => {
    // instruct module to use our tmp DB before requiring it
    process.env.SQLITE_FILE = tmpDb;
    process.env.USE_FAKES = "false";
    // require the actual sqlite-backed service
    svc = require("../src/services/sqlite/advisors");
  });

  afterAll(() => {
    try {
      fs.unlinkSync(tmpDb);
    } catch (e) {}
  });

  test("deleting an advisor writes an audit row", () => {
    const advisor = { name: "Audit Advisor", email: "adv-audit@example.com" };
    const created = svc.create(advisor);
    expect(created).toBeDefined();
    const id = created.id || created.rowid;
    expect(id).toBeGreaterThan(0);

    // delete
    const ok = svc.delete(id);
    expect(ok).toBe(true);

    // check audit table directly against the sqlite file
    const Database = require("better-sqlite3");
    const direct = new Database(tmpDb);
    const audit = direct
      .prepare("SELECT * FROM advisors_audit WHERE advisor_id = ?")
      .get(id);
    expect(audit).toBeDefined();
    expect(audit.action).toBe("delete");
    direct.close();
  });
});
