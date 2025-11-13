// Helpers para normalização de texto usados por rotas e adapters

function capitalizeFirst(str) {
  if (!str || typeof str !== "string") return str;
  const s = str.trim();
  if (s.length === 0) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function titleCase(str) {
  if (!str || typeof str !== "string") return str;
  return str
    .trim()
    .split(/\s+/)
    .map((word, idx) => {
      const smallWords = new Set([
        "da",
        "de",
        "do",
        "das",
        "dos",
        "e",
        "em",
        "na",
        "no",
        "nas",
        "nos",
        "ao",
        "a",
        "à",
        "às",
        "pelo",
        "pela",
        "pelos",
        "pelas",
        "por",
        "para",
        "com",
        "sem",
        "sob",
        "sobre",
      ]);
      const lower = word.toLowerCase();
      if (idx > 0 && smallWords.has(lower)) return lower;
      return word
        .split("-")
        .map((part) => {
          const p = part.toLowerCase();
          return p.length === 0 ? p : p.charAt(0).toUpperCase() + p.slice(1);
        })
        .join("-");
    })
    .join(" ");
}

function normalizeStateValue(s) {
  if (s == null) return s;
  if (typeof s !== "string") return s;
  const t = s.trim();
  if (t.length <= 2) return t.toUpperCase();
  return titleCase(t);
}

// Normaliza campos comuns de cliente segundo regras de Title Case e UFs
function normalizeClientFields(cliente) {
  if (!cliente || typeof cliente !== "object") return;
  // Recursively normalize phone-like fields anywhere in the object
  const phoneKeyPattern = /tel|phone|celu|celular|mobile|whatsapp/i;
  function normalizePhones(obj) {
    if (!obj || typeof obj !== "object") return;
    if (Array.isArray(obj)) {
      for (const it of obj) normalizePhones(it);
      return;
    }
    for (const key of Object.keys(obj)) {
      try {
        const val = obj[key];
        if (val == null) continue;
        if (phoneKeyPattern.test(key)) {
          if (typeof val === "string")
            obj[key] = String(val).replace(/\D/g, "");
          else if (Array.isArray(val))
            obj[key] = val.map((v) =>
              typeof v === "string" ? String(v).replace(/\D/g, "") : v
            );
          else if (typeof val === "object") normalizePhones(val);
          continue;
        }
        if (typeof val === "object") normalizePhones(val);
      } catch (e) {}
    }
  }

  try {
    normalizePhones(cliente);
  } catch (e) {}

  const apelidoKeys = ["apelido", "nickname"];
  const phoneKeys = [
    "telefone",
    "phone",
    "contato_telefone",
    "contatoTelefone",
    "celular",
    "mobile",
    "phone_number",
  ];
  const titleKeys = [
    // address-like fields
    "rua",
    "ruas",
    "street",
    "streets",
    "bairro",
    "pais",
    "país",
    "country",
    "address",
    "address_city",
    "address_neighborhood",
    "address_country",
    "logradouro",
    "city",
    // person/name-like fields
    "name",
    "nome",
    "contato_nome",
    "nome_imovel",
    "nome_do_imovel",
    "property",
    "nacionalidade",
    "nome_pai",
    "nome_mae",
    "naturalidade_cidade",
  ];
  const stateKeys = [
    "estado",
    "state",
    "address_state",
    "uf",
    // naturalidade / rg expedição
    "naturalidade_uf",
    "rg_expedicao_uf",
  ];

  for (const k of apelidoKeys) {
    try {
      if (cliente[k] && typeof cliente[k] === "string")
        cliente[k] = capitalizeFirst(cliente[k]);
    } catch (e) {}
  }

  // Normalize phone fields to digits-only (remove +, spaces, punctuation)
  for (const k of phoneKeys) {
    try {
      if (cliente[k] && typeof cliente[k] === "string")
        cliente[k] = String(cliente[k]).replace(/\D/g, "");
      if (cliente[k] && Array.isArray(cliente[k])) {
        cliente[k] = cliente[k].map((v) =>
          typeof v === "string" ? String(v).replace(/\D/g, "") : v
        );
      }
    } catch (e) {}
  }

  for (const k of titleKeys) {
    try {
      if (cliente[k] && typeof cliente[k] === "string")
        cliente[k] = titleCase(cliente[k]);
      if (cliente[k] && Array.isArray(cliente[k])) {
        cliente[k] = cliente[k].map((v) =>
          typeof v === "string" ? titleCase(v) : v
        );
      }
    } catch (e) {}
  }

  for (const k of stateKeys) {
    try {
      if (cliente[k] && typeof cliente[k] === "string")
        cliente[k] = normalizeStateValue(cliente[k]);
    } catch (e) {}
  }

  // addresses array
  if (Array.isArray(cliente.addresses)) {
    cliente.addresses = cliente.addresses.map((a) => {
      try {
        if (a && typeof a === "object") {
          if (a.logradouro && typeof a.logradouro === "string")
            a.logradouro = titleCase(a.logradouro);
          if (a.city && typeof a.city === "string") a.city = titleCase(a.city);
          if (a.neighborhood && typeof a.neighborhood === "string")
            a.neighborhood = titleCase(a.neighborhood);
          if (a.state && typeof a.state === "string")
            a.state = normalizeStateValue(a.state);
          if (a.country && typeof a.country === "string")
            a.country = titleCase(a.country);
        }
      } catch (e) {}
      return a;
    });
  }

  // formatos soltos
  try {
    if (cliente.address && typeof cliente.address === "string")
      cliente.address = titleCase(cliente.address);
    if (cliente.address_city && typeof cliente.address_city === "string")
      cliente.address_city = titleCase(cliente.address_city);
    if (
      cliente.address_neighborhood &&
      typeof cliente.address_neighborhood === "string"
    )
      cliente.address_neighborhood = titleCase(cliente.address_neighborhood);
    if (cliente.address_state && typeof cliente.address_state === "string")
      cliente.address_state = normalizeStateValue(cliente.address_state);
    if (cliente.address_country && typeof cliente.address_country === "string")
      cliente.address_country = titleCase(cliente.address_country);
  } catch (e) {}
}

module.exports = {
  capitalizeFirst,
  titleCase,
  normalizeStateValue,
  normalizeClientFields,
};
