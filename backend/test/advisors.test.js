const request = require("supertest");

// Force use of fakes adapter for predictable state
process.env.USE_FAKES = "true";

const app = require("../src/app");

describe("Advisors API (fakes)", () => {
  let createdId;

  test("GET /api/advisors should return an array", async () => {
    const res = await request(app).get("/api/advisors");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("POST /api/advisors should create an advisor", async () => {
    const payload = {
      name: "Test Advisor",
      email: "advisor@example.com",
      avatar: "",
    };
    const res = await request(app).post("/api/advisors").send(payload);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.name).toBe("Test Advisor");
    expect(res.body.email).toBe("advisor@example.com");
    createdId = res.body.id;
  });

  test("GET /api/advisors/:id should return the created advisor", async () => {
    const res = await request(app).get(`/api/advisors/${createdId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("id", createdId);
    expect(res.body.name).toBe("Test Advisor");
  });

  test("PUT /api/advisors/:id should update advisor", async () => {
    const payload = {
      name: "Updated Advisor",
      email: "updated@example.com",
      avatar: "",
    };
    const res = await request(app)
      .put(`/api/advisors/${createdId}`)
      .send(payload);
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe("Updated Advisor");
    expect(res.body.email).toBe("updated@example.com");
  });

  test("DELETE /api/advisors/:id should remove advisor", async () => {
    const res = await request(app).delete(`/api/advisors/${createdId}`);
    expect(res.statusCode).toBe(204);
    const getRes = await request(app).get(`/api/advisors/${createdId}`);
    expect(getRes.statusCode).toBe(404);
  });
});
