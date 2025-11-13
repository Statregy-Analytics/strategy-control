// Minimal frontend normalization helpers to mirror backend rules.
// Keeps logic small and dependency-free so UI shows the same Title Case / UF uppercase
// normalization that the backend applies when loading payloads.

const SMALL_WORDS = new Set([
  'e',
  'de',
  'da',
  'dos',
  'das',
  'do',
  'em',
  'no',
  'na',
  'nos',
  'nas',
  'com',
  'sem',
  'por',
  'para',
  'a',
  'o',
  'as',
  'os',
  'um',
  'uma',
  'uns',
  'umas',
  'sob',
  'sobre',
  'até',
  'ao',
  'à',
  'às',
  'até',
])

export function capitalizeFirst(str) {
  if (str == null) return str
  const s = String(str).trim()
  if (!s) return s
  return s[0].toUpperCase() + s.slice(1).toLowerCase()
}

function capitalizeHyphenated(word) {
  // handle parts like 'são-paulo' -> 'São-Paulo'
  return word
    .split('-')
    .map((p) => (p.length ? p[0].toUpperCase() + p.slice(1).toLowerCase() : p))
    .join('-')
}

export function titleCase(value) {
  if (value == null) return value
  const s = String(value).trim().replace(/\s+/g, ' ')
  if (!s) return s
  const parts = s.split(' ')
  return parts
    .map((p, i) => {
      const lower = p.toLowerCase()
      // keep small words lowercased unless it's the first word
      if (i !== 0 && SMALL_WORDS.has(lower)) return lower
      return capitalizeHyphenated(lower)
    })
    .join(' ')
}

export function normalizeStateValue(value) {
  if (value == null) return value
  const s = String(value).trim()
  if (s.length <= 2) return s.toUpperCase()
  return s
}

// Normalize a client object in-place for display: title-case name-like fields and
// uppercase small UF-like fields. This mirrors the backend normalizeClientFields used
// for persistence but is intentionally smaller and focused on UI presentation.
export function normalizeClientForDisplay(client) {
  if (!client || typeof client !== 'object') return client

  const titleKeys = [
    'name',
    'apelido',
    'contato_nome',
    'nacionalidade',
    'nome_pai',
    'nome_mae',
    'naturalidade_cidade',
    'rua',
    'address',
    'address_neighborhood',
    'address_city',
    'cidade',
    'pais',
    'property',
    'complement',
  ]

  const stateKeys = [
    'naturalidade_uf',
    'rg_expedicao_uf',
    'estado',
    'estado_civil',
    'address_state',
  ]

  try {
    for (const k of titleKeys) {
      if (client[k]) client[k] = titleCase(client[k])
    }
    // also try common nested residential/address shapes
    if (client.residential && typeof client.residential === 'object') {
      const r = client.residential
      if (r.city) r.city = titleCase(r.city)
      if (r.street) r.street = titleCase(r.street)
      if (r.neighborhood) r.neighborhood = titleCase(r.neighborhood)
      if (r.property) r.property = titleCase(r.property)
    }
    for (const k of stateKeys) {
      if (client[k]) client[k] = normalizeStateValue(client[k])
    }
    // also handle address_state on nested residential
    if (client.residential && client.residential.state)
      client.residential.state = normalizeStateValue(client.residential.state)
  } catch (e) {
    // best-effort normalization - don't throw in UI
    void e
  }
  return client
}

export default { capitalizeFirst, titleCase, normalizeStateValue, normalizeClientForDisplay }
