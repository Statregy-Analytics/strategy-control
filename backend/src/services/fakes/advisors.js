let rows = [
  {
    id: 1,
    name: "João Silva",
    email: "joao@gstrategyanalytics.com.br",
    avatar:
      "https://sources.strategyanalytics.com.br/storage/users/_Avatar_.png",
  },
  {
    id: 2,
    name: "Maria Oliveira",
    email: "maria@gstrategyanalytics.com.br",
    avatar:
      "https://sources.strategyanalytics.com.br/storage/users/_Avatar_.png",
  },
];

let nextId = rows.length + 1;

function list() {
  return rows;
}

function get(id) {
  return rows.find((r) => r.id === id) || null;
}

function create(data) {
  const item = { id: nextId++, ...data };
  rows.push(item);
  return item;
}

function update(id, data) {
  const idx = rows.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  rows[idx] = Object.assign({}, rows[idx], data);
  return rows[idx];
}

function del(id, opts) {
  const idx = rows.findIndex((r) => r.id === id);
  if (idx === -1) return false;
  // fake adapter does not persist audit but accept opts param
  rows.splice(idx, 1);
  return true;
}

function listAudit(advisorId, opts) {
  // Fake adapter does not implement audit storage; return empty pagination shape
  return { rows: [], total: 0 };
}

module.exports = { list, get, create, update, delete: del, listAudit };
