const fs = require("fs");
const path = require("path");
const os = require("os");
describe("leads audit on delete", () => {
  const tmpDb = path.join(os.tmpdir(), `test-leads-audit-${Date.now()}.sqlite`);
  let svc;

  beforeAll(() => {
    process.env.SQLITE_FILE = tmpDb;
    process.env.USE_FAKES = "false";
    svc = require("../src/services/sqlite/leads");
  });

  afterAll(() => {
    try {
      fs.unlinkSync(tmpDb);
    } catch (e) {}
  });

  test("deleting a lead writes an audit row", () => {
    const lead = {
      name: "Audit Lead",
      email: "audit-lead@example.com",
      phone: "+55 11 90000-0000",
    };
    const created = svc.create(lead);
    expect(created).toBeDefined();
    const id = created.id || (created.lead && created.lead.id) || created.rowid;
    expect(id).toBeGreaterThan(0);

    // delete with user object to test normalized columns and payload
    const ok = svc.delete(id, {
      user: { id: "user-123", email: "u@example.com", role: "operator" },
    });
    expect(ok).toBe(true);

    const Database = require("better-sqlite3");
    const direct = new Database(tmpDb);
    const audit = direct
      .prepare("SELECT * FROM leads_audit WHERE lead_id = ?")
      .get(id);
    expect(audit).toBeDefined();
    expect(audit.action).toBe("delete");
    // payload should be stored as JSON
    expect(audit.payload).toBeDefined();
    let parsed = null;
    try {
      parsed = JSON.parse(audit.payload);
    } catch (e) {
      parsed = null;
    }
    expect(parsed).not.toBeNull();
    const payloadLead = parsed.lead || parsed;
    expect(
      payloadLead.name || (payloadLead.cliente && payloadLead.cliente.name)
    ).toBeDefined();
    // normalized user columns
    expect(String(audit.user_id)).toBe("user-123");
    expect(audit.user_email).toBe("u@example.com");
    expect(audit.user_role).toBe("operator");
    direct.close();
  });
});
