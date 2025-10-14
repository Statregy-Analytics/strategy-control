const fs = require("fs");
const path = require("path");
const request = require("supertest");

const tmpFile = path.join(
  __dirname,
  `test-sqlite-leads-audit-paging-${Date.now()}.db`
);
process.env.SQLITE_FILE = tmpFile;
process.env.USE_FAKES = "false";

const app = require("../src/app");

afterAll(() => {
  try {
    fs.unlinkSync(tmpFile);
  } catch (e) {}
});

jest.setTimeout(60000);
describe("Leads audit pagination and filters", () => {
  test("pagination and filters work", async () => {
    const createdIds = [];
    for (let i = 0; i < 25; i++) {
      const res = await request(app)
        .post("/api/leads")
        .send({ lead: { name: `Pessoa ${i}`, email: `p${i}@ex.com` } });
      createdIds.push(res.body.id);
    }

    for (let i = 0; i < createdIds.length; i++) {
      const uid = i % 2 === 0 ? `user-a` : `user-b`;
      await request(app)
        .delete(`/api/leads/${createdIds[i]}`)
        .set("X-User-Id", uid);
    }

    const sampleId = createdIds[0];

    const adminToken = Buffer.from(
      JSON.stringify({
        id: "admin-1",
        email: "admin@example.com",
        role: "admin",
      })
    ).toString("base64");
    const r1 = await request(app)
      .get(`/api/leads/${sampleId}/audit?page=1&pageSize=10`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(r1.statusCode).toBe(200);
    expect(r1.body).toHaveProperty("rows");
    expect(r1.body).toHaveProperty("total");

    const r2 = await request(app)
      .get(`/api/leads/${sampleId}/audit?userId=user-a`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(r2.statusCode).toBe(200);
    expect(r2.body.rows.length).toBeGreaterThanOrEqual(1);

    const from = new Date(Date.now() + 1000 * 60 * 60).toISOString();
    const r3 = await request(app)
      .get(`/api/leads/${sampleId}/audit?from=${encodeURIComponent(from)}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(r3.statusCode).toBe(200);
    expect(r3.body.rows.length).toBe(0);

    // combined action + date range filter (should return the delete rows)
    const fromBefore = new Date(Date.now() - 1000 * 60).toISOString();
    const toAfter = new Date(Date.now() + 1000 * 60).toISOString();
    const r4 = await request(app)
      .get(
        `/api/leads/${sampleId}/audit?action=delete&from=${encodeURIComponent(
          fromBefore
        )}&to=${encodeURIComponent(toAfter)}`
      )
      .set("Authorization", `Bearer ${adminToken}`);
    expect(r4.statusCode).toBe(200);
    expect(r4.body.rows.length).toBeGreaterThanOrEqual(1);
  });
});
