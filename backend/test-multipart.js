const request = require("supertest");
const app = require("./src/app");
const fs = require("fs");
const path = require("path");

async function run() {
  const tmp = path.join(__dirname, "tmp-avatar.txt");
  fs.writeFileSync(tmp, "dummy avatar content");
  const payload = {
    cliente: { name: "Multipart Test", email: "multipart@test.com" },
  };
  try {
    const res = await request(app)
      .post("/api/clients")
      .field("payload", JSON.stringify(payload))
      .attach("avatar", tmp);
    console.log("status", res.status);
    console.log("body", JSON.stringify(res.body, null, 2));
  } catch (err) {
    console.error("error", err && err.message);
  } finally {
    try {
      fs.unlinkSync(tmp);
    } catch (e) {}
  }
}

run();
