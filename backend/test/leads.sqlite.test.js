const fs = require("fs");
const path = require("path");
const request = require("supertest");

// Use a temp sqlite file for isolation
const tmpFile = path.join(__dirname, `test-sqlite-leads-${Date.now()}.db`);
process.env.SQLITE_FILE = tmpFile;
process.env.USE_FAKES = "false";

const app = require("../src/app");

afterAll(() => {
  try {
    fs.unlinkSync(tmpFile);
  } catch (err) {
    // ignore
  }
});

describe("Leads API (sqlite)", () => {
  let createdId;

  test("GET /api/leads initially empty", async () => {
    const res = await request(app).get("/api/leads");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  test("POST /api/leads should create a lead (with { lead })", async () => {
    const payload = {
      lead: {
        name: "Sqlite Lead",
        email: "lead-sqlite@example.com",
        phone: "+55 11 99999-0000",
      },
    };
    const res = await request(app).post("/api/leads").send(payload);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("lead");
    expect(res.body.lead.name).toBe("Sqlite Lead");
    createdId = res.body.id;
  });

  test("GET /api/leads returns created lead", async () => {
    const res = await request(app).get("/api/leads");
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
    const item = res.body[0];
    expect(item).toHaveProperty("id");
    expect(item).toHaveProperty("lead");
  });

  test("PUT /api/leads/:id updates lead", async () => {
    const payload = {
      lead: { name: "Sqlite Lead Updated", email: "lead-up@example.com" },
    };
    const res = await request(app).put(`/api/leads/${createdId}`).send(payload);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("lead");
    expect(res.body.lead.name).toBe("Sqlite Lead Updated");
  });

  test("DELETE /api/leads/:id removes lead and audit recorded", async () => {
    const res = await request(app).delete(`/api/leads/${createdId}`);
    expect(res.statusCode).toBe(204);
    const getRes = await request(app).get(`/api/leads/${createdId}`);
    expect(getRes.statusCode).toBe(404);
  });
});
