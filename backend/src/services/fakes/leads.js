let rowsLead = [
  {
    id: 1,
    lead: {
      name: "João Silva",
      email: "joao.silva@example.com",
      phone: "+55 11 91234-5678",
      source: "Landing Page",
      avatar:
        "https://sources.strategyanalytics.com.br/storage/users/_Avatar_.png",
      utm: { campaign: "camp1", source: "google" },
      notes: "Interessado em produtos X",
      created_at: new Date().toISOString(),
    },
  },
  {
    id: 2,
    lead: {
      name: "Maria Santos",
      email: "maria.santos@example.com",
      phone: "+55 21 99876-5432",
      source: "Evento",
      avatar:
        "https://sources.strategyanalytics.com.br/storage/users/_Avatar_.png",
      utm: { campaign: "camp-event", source: "facebook" },
      notes: "Fez contato no stand",
      created_at: new Date().toISOString(),
    },
  },
];

let nextId = rowsLead.length + 1;

function list() {
  return rowsLead;
}

function get(id) {
  return rowsLead.find((r) => r.id === id) || null;
}

function create(data) {
  // Accept either { lead } or flat lead object
  const payload = data && data.lead ? data.lead : data;
  const item = { id: nextId++, lead: payload };
  rowsLead.push(item);
  return item;
}

function update(id, data) {
  const idx = rowsLead.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  rowsLead[idx] = {
    ...rowsLead[idx],
    lead: data && data.lead ? data.lead : data,
  };
  return rowsLead[idx];
}

function del(id, opts) {
  const idx = rowsLead.findIndex((r) => r.id === id);
  if (idx === -1) return false;
  rowsLead.splice(idx, 1);
  return true;
}

function listAudit(leadId) {
  // Fake adapter: no audit storage yet
  return [];
}

module.exports = { list, get, create, update, delete: del, listAudit };
