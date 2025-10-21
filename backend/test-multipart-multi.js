/* quick test script to POST multiple files (avatar + comprovante_endereco + certidao) to /api/clients
   It requires axios and form-data (node) -- but we can rely on node built-in FormData via form-data package
*/
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const FormData = require("form-data");

const url = process.env.API_URL || "http://localhost:3000/api/clients";

async function run() {
  const fd = new FormData();
  const payload = {
    cliente: {
      name: "Teste Multipart Multi",
      email: "multi@test.com",
      cpf_cnpj: "12345678901",
    },
  };
  fd.append("payload", JSON.stringify(payload));
  // attach files if present in repo
  const sampleImg = path.join(__dirname, "sample.png");
  const samplePdf = path.join(__dirname, "sample.pdf");
  if (fs.existsSync(sampleImg))
    fd.append("avatar", fs.createReadStream(sampleImg), "sample.png");
  if (fs.existsSync(sampleImg))
    fd.append(
      "comprovante_endereco",
      fs.createReadStream(sampleImg),
      "comp1.png"
    );
  if (fs.existsSync(samplePdf))
    fd.append("certidao_casamento", fs.createReadStream(samplePdf), "cert.pdf");

  try {
    const headers = fd.getHeaders();
    const res = await axios.post(url, fd, { headers });
    console.log("status", res.status);
    console.log(res.data);
  } catch (err) {
    if (err.response)
      console.error("error", err.response.status, err.response.data);
    else console.error(err.message);
  }
}

run();
