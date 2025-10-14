const fs = require("fs");
const path = require("path");
const request = require("supertest");

const tmpFile = path.join(
  __dirname,
  `test-sqlite-advisors-audit-auth-${Date.now()}.db`
);
process.env.SQLITE_FILE = tmpFile;
process.env.USE_FAKES = "false";

const app = require("../src/app");

afterAll(() => {
  try {
    fs.unlinkSync(tmpFile);
  } catch (e) {}
});

describe("Advisors audit endpoint auth", () => {
  test("audit endpoint protected: 403 without admin, 200 with X-Admin header", async () => {
    // create and delete to generate audit
    const created = await request(app)
      .post("/api/advisors")
      .send({ name: "Auth Adv", email: "auth@adv.com" });
    const id = created.body.id;
    await request(app).delete(`/api/advisors/${id}`).set("X-User-Id", "u");

    // try to fetch audit without admin privileges
    const r1 = await request(app).get(`/api/advisors/${id}/audit`);
    expect(r1.statusCode).toBe(403);

    // with Authorization Bearer token containing role=admin
    const adminToken = Buffer.from(
      JSON.stringify({
        id: "admin-1",
        email: "admin@example.com",
        role: "admin",
      })
    ).toString("base64");
    const r2 = await request(app)
      .get(`/api/advisors/${id}/audit`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(r2.statusCode).toBe(200);
    expect(r2.body).toHaveProperty("rows");
    expect(r2.body).toHaveProperty("total");
    expect(Array.isArray(r2.body.rows)).toBe(true);
    expect(r2.body.rows.length).toBeGreaterThanOrEqual(1);
  });
});
