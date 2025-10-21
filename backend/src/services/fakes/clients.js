let rowsClient = [
  {
    id: 1,
    newWeLend: {},
    level: "A",
    weLend: [
      {
        status: "Ativo",
        valor: 10000,
        data_loan: "01/01/2025",
        value_dividendo: 250.0,
        value_now_dividendo: 250.0,
        value_finish: 10000,
        value_before: 10000,
        number_parcelas: 12,
        date_payment: "01/02/2025",
        contrato: "Contrato 1",
        vigencia: "31/12/2030",
        saldo: 5000,
      },
    ],
    investment: {
      classification: "A",
      saldo: 150000,
      assessor: 1,
      data_dividendo: "21/02/2025",
      valor_dividendo: 250.0,
    },
    bank: {},
    residential: {},
    bankRegister: [
      {
        chave_pix: "123456789",
        cpf_cnpj: "123.456.789-00",
        name: "Banco Exemplo",
        agency: "1234",
        account: "56789-0",
        type: "Conta Corrente",
        status: "Ativo",
      },
    ],
    cliente: {
      cpf_cnpj: "123.456.789-00",
      renda: 5000,
      profissao: "Engenheiro",
      birth: "01/01/1990",
      name: "Carlos Silva Nunes",
      client_code: "C123AB",
      apelido: "Carlos",
      rua: "Rua das Flores",
      numero_casa: "123",
      cidade: "São Paulo",
      estado: "SP",
      cep: "01234-567",
      pais: "Brasil",
      avatar:
        "https://sources.strategyanalytics.com.br/storage/users/_Avatar_.png",
      comprovante_endereco: [],
      certidao_casamento: [],
      certidao_nascimento: [],
      email: "carlos@gstrategyanalytics.com.br",
    },
    assessor: 1,
    saldo: 210000,
    contrato: { total: 30000.0, quantity: "2 contratos" },
    dividendo: { total: 250.0, data: "31/01/2030" },
    emprestimo: "Status",
  },
  {
    id: 2,
    newWeLend: {},
    level: "A",
    weLend: [],
    investment: {
      classification: "A",
      saldo: 150000,
      assessor: 1,
      data_dividendo: "21/02/2025",
      valor_dividendo: 250.0,
    },
    bank: {},
    residential: {},
    bankRegister: [],
    cliente: {
      cpf_cnpj: "987.654.321-00",
      renda: 8000,
      profissao: "Analista",
      birth: "02/02/1990",
      name: "Ana Oliveira",
      client_code: "A987XY",
      apelido: "Ana",
      rua: "Av. Central",
      numero_casa: "45B",
      cidade: "Rio de Janeiro",
      estado: "RJ",
      cep: "20000-000",
      pais: "Brasil",
      avatar:
        "https://sources.strategyanalytics.com.br/storage/users/_Avatar_.png",
      comprovante_endereco: [],
      certidao_casamento: [],
      certidao_nascimento: [],
      email: "ana@gstrategyanalytics.com.br",
    },
    assessor: 1,
    saldo: 150000,
    contrato: { total: 20000.0, quantity: "1 contrato" },
    dividendo: { total: 150.0, data: "31/12/2029" },
    emprestimo: "Status",
  },
];

let nextId = rowsClient.length + 1;

function list() {
  return rowsClient;
}

function get(id) {
  return rowsClient.find((r) => r.id === id) || null;
}

function create(data) {
  const item = { id: nextId++, cliente: data.cliente || data };
  rowsClient.push(item);
  return item;
}

function update(id, data) {
  const idx = rowsClient.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  rowsClient[idx] = { ...rowsClient[idx], cliente: data.cliente || data };
  return rowsClient[idx];
}

function del(id, opts) {
  const idx = rowsClient.findIndex((r) => r.id === id);
  if (idx === -1) return false;
  // In the fake adapter we do not persist audit, but accept the opts param for compatibility
  rowsClient.splice(idx, 1);
  return true;
}

function listAudit(clientId) {
  // Fake adapter does not implement audit storage; return empty array for compatibility
  return [];
}

module.exports = { list, get, create, update, delete: del };
