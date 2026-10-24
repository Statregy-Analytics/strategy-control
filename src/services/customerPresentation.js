// API values stay unchanged in requests and stored records.
export const customerStatusOptions = [
  { label: 'Todos', value: null },
  { label: 'Ativo', value: 'Active' },
  { label: 'Bloqueado', value: 'Suspended' },
  { label: 'Inativo', value: 'Inactive' },
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
// Compatibility is presentation-only: these aliases are never sent to the API.
export const complianceFilterValue = (value) =>
  ({ Clear: 'Ok', Approved: 'Ok', Attention: 'Alert', Warning: 'Alert' })[value] || value
export const customerComplianceOptions = [
  { label: 'OK', value: 'Ok' },
  { label: 'Pendente', value: 'Pending' },
  { label: 'Alerta', value: 'Alert' },
  { label: 'Bloqueado', value: 'Blocked' },
]
export function compliancePresentation(value) {
  const known = {
    Ok: ['OK', 'ok'],
    Pending: ['Pendente', 'pending'],
    Blocked: ['Bloqueado', 'blocked'],
    Rejected: ['Rejeitado', 'blocked'],
    Alert: ['Alerta', 'alert'],
  }
  const [label, tone] = known[complianceFilterValue(value)] || [value || '—', 'inactive']
  return { label, tone }
}
export function customerMaskedDocument(value) {
  if (!value) return 'Documento não informado'
  // Preserve the visible suffix supplied by the server; never reconstruct hidden characters.
  // If an unexpected unmasked value arrives, still expose at most its last four characters.
  const received = String(value).trim()
  if (/^\*{2,}[a-z0-9]{1,4}$/i.test(received)) return received
  const compact = received.replace(/[^a-z0-9*]/gi, '')
  const suffix = compact.split('*').at(-1).slice(-4)
  return `******${suffix}`
}
export function customerMatches(customer, filters) {
  return (
    (!filters.inactive || ['Prospect', 'Archived'].includes(customer.status)) &&
    (!filters.classification || customer.documentClassification === filters.classification) &&
    (!filters.compliance ||
      complianceFilterValue(customer.complianceStatus) === filters.compliance) &&
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
