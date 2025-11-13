const request = require("supertest");
const app = require("../src/app");

describe("Clients normalization", () => {
  test("POST birth in dd/mm/yyyy is stored as ISO yyyy-mm-dd", async () => {
    const payload = {
      cliente: {
        name: "Teste Normalizacao",
        email: "teste@example.com",
        birth: "31/12/1990",
      },
    };
    const res = await request(app).post("/api/clients").send(payload);
    expect(res.statusCode).toBe(201);
    expect(res.body).toBeDefined();
    expect(res.body.cliente).toBeDefined();
    expect(res.body.cliente.birth).toBe("1990-12-31");
  });

  test("POST patrimonio_valor in pt-BR format is stored as Number", async () => {
    const payload = {
      cliente: {
        name: "Patrimonio Test",
        email: "patrimonio@example.com",
        patrimonio_valor: "1.234.567,89",
      },
    };
    const res = await request(app).post("/api/clients").send(payload);
    expect(res.statusCode).toBe(201);
    expect(res.body).toBeDefined();
    expect(res.body.cliente).toBeDefined();
    expect(typeof res.body.cliente.patrimonio_valor).toBe("number");
    // allow floating point precision small tolerance
    expect(
      Math.abs(res.body.cliente.patrimonio_valor - 1234567.89)
    ).toBeLessThan(0.0001);
  });

  test("POST telefone with + and without + are stored as digits-only", async () => {
    const payloadPlus = {
      cliente: {
        name: "Phone Plus",
        email: "phoneplus@example.com",
        telefone: "+55 11 91234-5678",
      },
    };
    const res1 = await request(app).post("/api/clients").send(payloadPlus);
    expect(res1.statusCode).toBe(201);
    expect(res1.body.cliente.telefone).toBe("5511912345678");

    const payloadNoPlus = {
      cliente: {
        name: "Phone NoPlus",
        email: "phoneno@example.com",
        telefone: "5511912345678",
      },
    };
    const res2 = await request(app).post("/api/clients").send(payloadNoPlus);
    expect(res2.statusCode).toBe(201);
    expect(res2.body.cliente.telefone).toBe("5511912345678");
  });

  test("POST should capitalize first letter for apelido, address fields and state/country", async () => {
    const payload = {
      cliente: {
        name: "Caps Test",
        email: "caps@example.com",
        apelido: "maria",
        address: "rua das flores",
        address_neighborhood: "centro",
        address_city: "sao paulo",
        address_state: "sp",
        address_country: "brasil",
      },
    };
    const res = await request(app).post("/api/clients").send(payload);
    expect(res.statusCode).toBe(201);
    expect(res.body).toBeDefined();
    expect(res.body.cliente).toBeDefined();
    expect(res.body.cliente.apelido).toBe("Maria");
    expect(res.body.cliente.address).toBe("Rua das Flores");
    expect(res.body.cliente.address_neighborhood).toBe("Centro");
    expect(res.body.cliente.address_city).toBe("Sao Paulo");
    expect(res.body.cliente.address_state).toBe("SP");
    expect(res.body.cliente.address_country).toBe("Brasil");
  });

  test("POST should capitalize fields inside addresses array objects", async () => {
    const payload = {
      cliente: {
        name: "Addr Array Test",
        email: "addr@example.com",
        addresses: [
          {
            logradouro: "rua azul",
            city: "sao paulo",
            neighborhood: "centro",
            state: "sp",
            country: "brasil",
          },
        ],
      },
    };
    const res = await request(app).post("/api/clients").send(payload);
    expect(res.statusCode).toBe(201);
    expect(res.body).toBeDefined();
    expect(res.body.cliente).toBeDefined();
    expect(Array.isArray(res.body.cliente.addresses)).toBe(true);
    const a = res.body.cliente.addresses[0];
    expect(a.logradouro).toBe("Rua Azul");
    expect(a.city).toBe("Sao Paulo");
    expect(a.neighborhood).toBe("Centro");
    expect(a.state).toBe("SP");
    expect(a.country).toBe("Brasil");
  });
});
