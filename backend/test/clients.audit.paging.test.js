const fs = require("fs");
const path = require("path");
const request = require("supertest");

const tmpFile = path.join(
  __dirname,
  `test-sqlite-audit-paging-${Date.now()}.db`
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
describe("Clients audit pagination and filters", () => {
  test("pagination and filters work", async () => {
    // create multiple entries by creating and deleting multiple clients
    const createdIds = [];
    for (let i = 0; i < 25; i++) {
      const res = await request(app)
        .post("/api/clients")
        .send({ cliente: { name: `Pessoa ${i}`, email: `p${i}@ex.com` } });
      createdIds.push(res.body.id);
    }

    // delete half with one user, half with another
    for (let i = 0; i < createdIds.length; i++) {
      const uid = i % 2 === 0 ? `user-a` : `user-b`;
      await request(app)
        .delete(`/api/clients/${createdIds[i]}`)
        .set("X-User-Id", uid);
    }

    // pick a client id to query its audit (they are unique per client)
    const sampleId = createdIds[0];

    // query with pageSize=10 page=1
    const adminToken = Buffer.from(
      JSON.stringify({
        id: "admin-1",
        email: "admin@example.com",
        role: "admin",
      })
    ).toString("base64");
    const r1 = await request(app)
      .get(`/api/clients/${sampleId}/audit?page=1&pageSize=10`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(r1.statusCode).toBe(200);
    expect(r1.body).toHaveProperty("rows");
    expect(r1.body).toHaveProperty("total");

    // filter by userId (should be 'user-a' for even indices, sampleId was index 0 -> user-a)
    const r2 = await request(app)
      .get(`/api/clients/${sampleId}/audit?userId=user-a`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(r2.statusCode).toBe(200);
    expect(r2.body.rows.length).toBeGreaterThanOrEqual(1);

    // date range filter: from future (no results)
    const from = new Date(Date.now() + 1000 * 60 * 60).toISOString();
    const r3 = await request(app)
      .get(`/api/clients/${sampleId}/audit?from=${encodeURIComponent(from)}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(r3.statusCode).toBe(200);
    expect(r3.body.rows.length).toBe(0);
  });
});
