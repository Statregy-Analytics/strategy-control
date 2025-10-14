const request = require("supertest");
const app = require("../src/app");

describe("Client name validation", () => {
  test("should return 400 when name is a single word", async () => {
    const payload = {
      cliente: {
        name: "Single",
        email: "single@example.com",
      },
    };

    const res = await request(app).post("/api/clients").send(payload);
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("errors");
    expect(Array.isArray(res.body.errors)).toBe(true);
    const detail = res.body.errors[0];
    expect(detail).toHaveProperty("field", "name");
    // message should include the localized instruction or default
    expect(detail.message).toMatch(/nome completo|nome e sobrenome|Informe/);
  });
});
