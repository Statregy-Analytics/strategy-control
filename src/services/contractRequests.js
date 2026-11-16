// Contract-request endpoints are not yet documented. Keep the UI adapter explicit;
// never guess a URL, persist an example request or turn a missing service into an empty list.
export const contractRequestUnavailable =
  'Não foi possível consultar as solicitações de contrato. Tente novamente.'
export const contractRequestWriteUnavailable =
  'Não foi possível atualizar a solicitação. Os dados foram mantidos; tente novamente.'
export async function listContractRequests() {
  throw Error(contractRequestUnavailable)
}
export async function readContractRequest() {
  throw Error(contractRequestUnavailable)
}
export async function writeContractRequest() {
  throw Error(contractRequestWriteUnavailable)
}
export const requestStatuses = [
  { value: 'All', label: 'Todas' },
  { value: 'New', label: 'Novas' },
  { value: 'InContact', label: 'Em contato' },
  { value: 'Fulfilled', label: 'Atendidas' },
  { value: 'Canceled', label: 'Canceladas' },
]
export const requestStatusLabel = (value) =>
  ({ New: 'Nova', InContact: 'Em contato', Fulfilled: 'Atendida', Canceled: 'Cancelada' })[value] ||
  'Indisponível'
export const requestCanAttend = (row) => ['New', 'InContact'].includes(row?.status)
export function requestContext(row) {
  if (!row?.id || !row.client?.customerId) throw Error('Dados da solicitação indisponíveis.')
  return {
    id: row.id,
    code: row.code,
    submittedAtUtc: row.submittedAtUtc,
    client: { ...row.client },
    answers: { ...row.answers },
  }
}
export function requestAmountLabel(row, money) {
  const a = row.answers || {}
  if (a.modality === 'Recurring') return money(a.monthlyAmount, a.currencyCode) + '/mês'
  return money(a.initialAmount, a.currencyCode)
}
export function requestModalityLabel(row, money) {
  const a = row.answers || {}
  return a.modality === 'Hybrid'
    ? 'Híbrida · ' + money(a.monthlyAmount, a.currencyCode) + '/mês'
    : a.modality === 'Recurring'
      ? 'Aportes Recorrentes'
      : a.modality === 'Single'
        ? 'Aplicação Única'
        : 'Indisponível'
}

export const requestModalityName = (value) =>
  ({ Single: 'Aplicação Única', Recurring: 'Aportes Recorrentes', Hybrid: 'Aplicação Híbrida' })[
    value
  ] || 'Indisponível'
export function requestApplicationLabel(row, money) {
  const a = row.answers || {}
  return (
    requestModalityName(a.modality) +
    ': ' +
    (a.modality === 'Recurring'
      ? money(a.monthlyAmount, a.currencyCode) + ' por mês'
      : money(a.initialAmount, a.currencyCode) +
        (a.modality === 'Hybrid'
          ? ' no início e ' + money(a.monthlyAmount, a.currencyCode) + ' por mês'
          : ''))
  )
}
