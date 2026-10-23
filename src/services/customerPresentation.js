// API values stay unchanged in requests and stored records.
export const customerStatusOptions = [
  { label: 'Ativo', value: 'Active' },
  { label: 'Inativo', value: 'Inactive' },
  { label: 'Bloqueado', value: 'Suspended' },
]
export const customerStatusLabel = (status) =>
  ({
    Active: 'Ativo',
    Prospect: 'Inativo',
    Archived: 'Inativo',
    Suspended: 'Bloqueado',
    Inactive: 'Inativo',
  })[status] || '—'
export const customerStatusTone = (status) =>
  status === 'Active' ? 'ok' : status === 'Suspended' ? 'blocked' : 'inactive'
export function compliancePresentation(value) {
  const known = {
    Ok: ['OK', 'ok'],
    Pending: ['Pendente', 'pending'],
    Blocked: ['Bloqueado', 'blocked'],
    Rejected: ['Rejeitado', 'blocked'],
    Attention: ['Atenção', 'pending'],
  }
  const [label, tone] = known[value] || [value || '—', 'inactive']
  return { label, tone }
}
export function customerMaskedDocument(value) {
  if (!value) return 'Documento não informado'
  // Never reconstruct a server-masked document. Also mask the first/last three
  // positions locally when an endpoint returns more visible digits than needed.
  const characters = [...String(value)]
  const positions = characters
    .map((char, index) => (/[\d*]/.test(char) ? index : -1))
    .filter((index) => index >= 0)
  for (const index of [...positions.slice(0, 3), ...positions.slice(-3)]) characters[index] = '*'
  return characters.join('')
}
export function customerMatches(customer, filters) {
  return (
    (!filters.inactive || ['Prospect', 'Archived'].includes(customer.status)) &&
    (!filters.classification || customer.documentClassification === filters.classification) &&
    (!filters.compliance || customer.complianceStatus === filters.compliance) &&
    (filters.level == null || customer.documentLevel === filters.level)
  )
}
export async function readCustomerSelection(read, query, filters, isCurrent = () => true) {
  // Fetch the complete server search before applying filters absent from the
  // HTTP contract; filtering a single page silently loses matching customers.
  const first = await read({ ...query, page: 1, pageSize: 100 })
  const rows = [...(first.data || [])]
  for (let page = 2; page <= (first.pagination?.totalPages || 1); page++) {
    if (!isCurrent()) return undefined
    const next = await read({ ...query, page, pageSize: first.pagination?.pageSize || 100 })
    rows.push(...(next.data || []))
  }
  const filtered = rows.filter((row) => customerMatches(row, filters))
  const totalPages = Math.ceil(filtered.length / query.pageSize)
  const page = Math.max(1, Math.min(query.page, totalPages || 1))
  return {
    classifications: [
      ...new Set(rows.map((row) => row.documentClassification).filter(Boolean)),
    ].sort(),
    data: filtered.slice((page - 1) * query.pageSize, page * query.pageSize),
    pagination: { page, pageSize: query.pageSize, totalItems: filtered.length, totalPages },
  }
}
