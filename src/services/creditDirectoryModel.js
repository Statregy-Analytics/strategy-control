export const creditStages = [
  'Iniciada',
  'Pendente',
  'Pré-proposta',
  'Documentação',
  'Proposta Final',
  'Assinatura',
  'Contratada',
]
export function creditStageGroups(rows) {
  if (!Array.isArray(rows) || rows.some((r) => !creditStages.includes(r.stage))) return null
  return creditStages.map((stage) => ({ stage, rows: rows.filter((r) => r.stage === stage) }))
}
export const creditCount = (value) =>
  ['number', 'string'].includes(typeof value) &&
  String(value).trim() !== '' &&
  Number.isInteger(Number(value)) &&
  Number(value) >= 0
    ? Number(value)
    : null
export function creditCounts(record) {
  return {
    partners: creditCount(record.partnerCount),
    proposals: creditCount(record.proposalCount),
    pending: creditCount(record.pendingDocumentCount),
  }
}
export function creditOperationGroup(status) {
  if (['Settled', 'Closed', 'PaidOff'].includes(status)) return 'closed'
  if (['Cancelled', 'Canceled', 'Rejected'].includes(status)) return 'cancelled'
  return 'open'
}

export function creditUpdatedLabel(value, now = new Date()) {
  if (!value) return '—'
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return '—'
  const key = (d) => [d.getFullYear(), d.getMonth(), d.getDate()].join('-')
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const day = key(date) === key(now) ? 'Hoje' : key(date) === key(yesterday) ? 'Ontem' : null
  return day
    ? day + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : date.toLocaleDateString('pt-BR')
}
