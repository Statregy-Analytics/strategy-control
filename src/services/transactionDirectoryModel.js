import { foldSearch } from './adminWorkspaceModel.js'
import { numberInputValue } from './numberInputValue.js'
import { contractEndpoint } from './contractTransactionView.js'

export const transactionWhen = (value, dateOnly = false) =>
  value && Number.isFinite(Date.parse(value))
    ? new Date(value).toLocaleString(
        'pt-BR',
        dateOnly
          ? { day: '2-digit', month: '2-digit', year: 'numeric' }
          : {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            },
      )
    : '—'
export function transactionMoney(value, currency) {
  const amount = numberInputValue(value)
  if (amount === null || !/^[A-Z]{3}$/.test(currency || '')) return 'Indisponível'
  try {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(amount)
  } catch {
    return 'Indisponível'
  }
}
export function transactionActor(actor) {
  return (
    actor?.displayName ||
    { Admin: 'Admin', Client: 'Cliente', Customer: 'Cliente', System: 'Sistema' }[actor?.type] ||
    'Indisponível'
  )
}
export function transactionEndpoint(endpoint) {
  const result = contractEndpoint(endpoint, null)
  return [result.title, result.detail].filter(Boolean).join(' · ')
}
export function transactionTone(row) {
  return row.status === 'Completed'
    ? 'completed'
    : ['Error', 'Rejected', 'Canceled', 'Cancelled'].includes(row.status)
      ? 'negative'
      : 'pending'
}
export function transactionCorrection(row, rows) {
  const original = row.correctsTransactionId
    ? rows.find((r) => r.id === row.correctsTransactionId)
    : null
  const correction = row.correctedByTransactionId
    ? rows.find((r) => r.id === row.correctedByTransactionId)
    : null
  return {
    original: original?.requestNumber || (row.correctsTransactionId ? 'Indisponível' : ''),
    originalDate: original ? transactionWhen(original.requestedAtUtc) : '',
    correctedBy: correction?.requestNumber || (row.correctedByTransactionId ? 'Indisponível' : ''),
  }
}
export function correctionFundingText(details) {
  if (!details || !Array.isArray(details.sources) || !details.sources.length) return ''
  const difference = transactionMoney(details.difference, details.currency)
  if (difference === 'Indisponível') return ''
  const sources = details.sources.map((s) => {
    const amount = transactionMoney(s.amount, details.currency)
    return s.label && amount !== 'Indisponível' ? s.label + ' ' + amount : null
  })
  return sources.every(Boolean)
    ? 'Diferença de ' + difference + ' tirada de: ' + sources.join(' · ')
    : ''
}
export function filterTransactionRows(rows, filters, now = new Date()) {
  const query = foldSearch(filters.search).trim()
  return rows.filter((row) => {
    if (filters.type && row.type !== filters.type) return false
    if (filters.status && row.status !== filters.status) return false
    if (filters.clientId && row.clientId !== filters.clientId) return false
    if (filters.actor && transactionActor(row.createdBy) !== filters.actor) return false
    if (filters.days) {
      const day = new Date(now)
      day.setHours(0, 0, 0, 0)
      day.setDate(day.getDate() - (Number(filters.days) - 1))
      const time = Date.parse(row.requestedAtUtc)
      if (!Number.isFinite(time) || time < +day || time > +now) return false
    }
    return (
      !query ||
      [
        row.requestNumber,
        row.clientName,
        row.clientId,
        transactionActor(row.createdBy),
        row.source?.contractName,
        row.source?.contractPublicCode,
        row.destination?.contractName,
        row.destination?.contractPublicCode,
      ].some((value) => typeof value === 'string' && foldSearch(value).includes(query))
    )
  })
}

export function transactionAmountTone(row, correction = false) {
  if (correction || row.correctsTransactionId || row.correctedByTransactionId) return 'positive'
  if (row.type === 'Withdrawal') return 'negative'
  if (
    ['Deposit', 'ContractContribution', 'AssignedContribution'].includes(row.type) ||
    (row.type === 'ContractOperation' && row.destination?.kind === 'Contract')
  )
    return 'positive'
  return 'neutral'
}

export function transactionStatusLabel(status, fallback = '—') {
  return (
    {
      Completed: 'Processada',
      Initiated: 'Iniciada',
      Rejected: 'Reprovada',
      Approved: 'Aguardando execução',
      PendingValidation: 'Pendente de validação',
    }[status] || fallback
  )
}
