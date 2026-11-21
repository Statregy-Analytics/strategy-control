const financeGet = async (...args) => (await import('./financeService.js')).financeGet(...args)
const financeWrite = async (...args) => (await import('./financeService.js')).financeWrite(...args)
export const contractRequestUnavailable =
  'Não foi possível consultar as solicitações de contrato. Tente novamente.'
export const contractRequestWriteUnavailable =
  'Não foi possível atualizar a solicitação. Os dados foram mantidos; tente novamente.'
export function contractRequestModel(row) {
  if (!row?.id || !row.client?.clientId) throw Error(contractRequestUnavailable)
  return {
    ...row,
    code: row.publicCode,
    client: { ...row.client, customerId: row.client.clientId },
    answers: { ...row.answers, currencyCode: row.answers?.currencyIsoCode },
    attendanceNote: row.serviceNotes,
  }
}
export async function listContractRequests(params = {}, read = financeGet) {
  const result = (await read('admin/contracts/requests', params)).data
  if (!Array.isArray(result?.items)) throw Error(contractRequestUnavailable)
  return {
    ...result,
    items: result.items.map(contractRequestModel),
    counts: Object.fromEntries(
      Object.entries({
        All: 'all',
        New: 'new',
        InContact: 'inContact',
        Fulfilled: 'fulfilled',
        Canceled: 'canceled',
      }).map(([key, field]) => [key, result.counts?.[field] ?? null]),
    ),
  }
}
export async function readContractRequest(id, read = financeGet) {
  return contractRequestModel(
    (await read(`admin/contracts/requests/${encodeURIComponent(id)}`)).data,
  )
}
export async function writeContractRequest(
  id,
  { status, attendanceNote, reason } = {},
  write = financeWrite,
) {
  if (!['InContact', 'Canceled'].includes(status)) throw Error(contractRequestWriteUnavailable)
  const path = `admin/contracts/requests/${encodeURIComponent(id)}`
  await write('patch', path, { serviceNotes: attendanceNote || null })
  return write(
    'post',
    `${path}/${status === 'Canceled' ? 'cancel' : 'contacted'}`,
    status === 'Canceled' ? { reason } : undefined,
  )
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
      : ['Single', 'SinglePayment'].includes(a.modality)
        ? 'Aplicação Única'
        : 'Indisponível'
}

export const requestModalityName = (value) =>
  ({
    SinglePayment: 'Aplicação Única',
    Single: 'Aplicação Única',
    Recurring: 'Aportes Recorrentes',
    Hybrid: 'Aplicação Híbrida',
  })[value] || 'Indisponível'
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
