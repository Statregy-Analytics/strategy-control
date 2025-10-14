const request = require("supertest");

// For tests, force fakes adapter
process.env.USE_FAKES = "true";

const app = require("../src/app");

describe("Leads API (fakes)", () => {
  let createdId;

  test("GET /api/leads should return an array", async () => {
    const res = await request(app).get("/api/leads");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("POST /api/leads should create a lead", async () => {
    const payload = { lead: { name: "Lead Test", email: "lead@example.com" } };
    const res = await request(app).post("/api/leads").send(payload);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.lead.name).toBe("Lead Test");
    createdId = res.body.id;
  });

  test("PUT /api/leads/:id should update lead", async () => {
    const payload = {
      lead: { name: "Updated Lead", email: "updated@example.com" },
    };
    const res = await request(app).put(`/api/leads/${createdId}`).send(payload);
    expect(res.statusCode).toBe(200);
    expect(res.body.lead.name).toBe("Updated Lead");
  });

  test("DELETE /api/leads/:id should remove lead", async () => {
    const res = await request(app).delete(`/api/leads/${createdId}`);
    expect(res.statusCode).toBe(204);
    const getRes = await request(app).get(`/api/leads/${createdId}`);
    expect(getRes.statusCode).toBe(404);
  });
});
