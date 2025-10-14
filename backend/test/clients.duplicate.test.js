const request = require("supertest");
const fs = require("fs");
const path = require("path");

describe("SQLite duplicate cpf_cnpj", () => {
  const sqliteFile = path.join(__dirname, "tmp-dup.sqlite");
  let app;
  beforeAll(() => {
    // ensure env points to a temp sqlite for this test and remove any previous file
    process.env.SQLITE_FILE = sqliteFile;
    try {
      fs.unlinkSync(sqliteFile);
    } catch (e) {}
    // require the app after setting env so adapter initializes this file
    app = require("../src/app");
  });
  afterAll(() => {
    try {
      fs.unlinkSync(sqliteFile);
    } catch (e) {}
  });

  test("creating duplicate cpf_cnpj returns 409 structured error", async () => {
    const cliente = {
      name: "Alice Silva",
      email: "a@example.com",
      cpf_cnpj: "123.456.789-09",
    };
    const res1 = await request(app).post("/api/clients").send({ cliente });
    expect(res1.status).toBe(201);
    // attempt to create duplicate (same digits, different mask)
    const cliente2 = {
      name: "Bruno Costa",
      email: "b@example.com",
      cpf_cnpj: "12345678909",
    };
    const res2 = await request(app)
      .post("/api/clients")
      .send({ cliente: cliente2 });
    expect(res2.status).toBe(409);
    expect(res2.body).toHaveProperty("errors");
    expect(Array.isArray(res2.body.errors)).toBe(true);
    const err = res2.body.errors[0];
    expect(err.field).toBe("cpf_cnpj");
    expect(err.message).toBeDefined();
  });
});
