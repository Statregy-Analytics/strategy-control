import { capitalCents, centsDecimal } from './contractDistribution.js'
import { walletContributionState } from './contractWalletCapital.js'
export const participantEntryBlocked =
  'Não foi possível confirmar a inclusão. Os dados foram mantidos nesta tela e nenhum saldo foi debitado.'
function percentUnits(value) {
  const text = String(value ?? '')
  if (!/^\d+(?:\.\d{1,12})?$/.test(text)) return null
  const [whole, fraction = ''] = text.split('.')
  const result = BigInt(whole) * 10n ** 12n + BigInt(fraction.padEnd(12, '0'))
  return result <= 100n * 10n ** 12n ? result : null
}
function apportion(weights) {
  const total = weights.reduce((sum, value) => sum + value, 0n)
  if (total <= 0n) return weights.map(() => null)
  const rows = weights.map((value, index) => ({
    index,
    units: (value * 10000n) / total,
    remainder: (value * 10000n) % total,
  }))
  let left = 10000n - rows.reduce((sum, row) => sum + row.units, 0n)
  for (const row of [...rows].sort((a, b) =>
    a.remainder === b.remainder ? a.index - b.index : a.remainder > b.remainder ? -1 : 1,
  ))
    if (left-- > 0n) row.units++
  return rows.map((row) => centsDecimal(row.units))
}
export function participantEntryImpact(contract, amount, client) {
  const capital = capitalCents(contract?.currentBalance),
    contribution = capitalCents(amount)
  const participants = contract?.participants
  const shares = Array.isArray(participants)
    ? participants.map((row) => percentUnits(row.allocationPercentage))
    : []
  const sum = shares.every((value) => value !== null)
    ? shares.reduce((total, value) => total + value, 0n)
    : null
  const expected = 100n * 10n ** 12n
  const valid =
    capital !== null &&
    capital > 0n &&
    contribution !== null &&
    contribution > 0n &&
    participants?.length > 0 &&
    sum > 0n &&
    (sum > expected ? sum - expected : expected - sum) <= BigInt(participants.length) * 10n ** 8n &&
    new Set(participants.map((row) => row.clientId)).size === participants.length &&
    participants.every((row) => row.clientId) &&
    client?.customerId &&
    !participants.some((row) => row.clientId === client.customerId)
  const total = capital !== null && contribution !== null ? capital + contribution : null
  if (!valid)
    return {
      valid: false,
      capital,
      contribution,
      total,
      rows: [],
      newShare: null,
      previousShare: null,
    }
  const before = apportion(shares)
  const after = apportion([...shares.map((share) => share * capital), sum * contribution])
  const newShare = after.at(-1)
  return {
    valid: true,
    capital,
    contribution,
    total,
    newShare,
    previousShare: centsDecimal(10000n - capitalCents(newShare)),
    rows: [
      ...participants.map((row, index) => ({
        clientId: row.clientId,
        name: row.displayName,
        before: before[index],
        after: after[index],
        isNew: false,
      })),
      {
        clientId: client.customerId,
        name: client.displayName,
        before: null,
        after: newShare,
        isNew: true,
      },
    ],
  }
}
export function participantEntryIndex(engines, primaryEngineId) {
  const engine = engines?.find(
    (row) =>
      row.engineId === primaryEngineId &&
      row.role === 'Primary' &&
      row.connectionStatus === 'Connected',
  )
  const value = engine?.currentIndex
  return value !== null &&
    value !== undefined &&
    value !== '' &&
    Number.isFinite(Number(value)) &&
    Number(value) > 0
    ? new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 4,
        maximumFractionDigits: 4,
        useGrouping: false,
      }).format(Number(value))
    : 'Indisponível'
}
export function validEntryDate(value) {
  const parsed = new Date(value + 'T12:00:00Z')
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value || '') &&
    Number.isFinite(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  )
}

export function canAddContractParticipant(contract) {
  return (
    ['Created', 'Finalized'].includes(contract?.registrationStatus) &&
    contract?.businessStatus?.code === 'ACTIVE'
  )
}

export function participantEntryPayload(input, currency, contractRequestId = null) {
  const state = walletContributionState(input.walletSources || [], currency)
  if (!input.clientId || !state.valid || state.total !== capitalCents(input.allocatedAmount))
    throw Error('Confira as carteiras e os valores do aporte antes de confirmar.')
  if (
    !input.password ||
    !(Number(input.engineIndexAtEntry) > 0) ||
    !Number.isFinite(Number(input.engineIndexAtEntry))
  )
    throw Error('Informe a senha do admin e aguarde o índice atual do motor.')
  return {
    clientId: input.clientId,
    allocatedAmount: centsDecimal(state.total),
    contributions: state.rows.map((row) => ({
      wallet: row.type,
      currencyId: row.currencyId,
      amount: row.amount,
    })),
    engineIndexAtEntry: input.engineIndexAtEntry,
    password: input.password,
    observation: input.note?.trim() || null,
    ...(contractRequestId ? { contractRequestId } : {}),
  }
}

export function participantEntryRawIndex(engines, primaryEngineId) {
  const value = engines?.find(
    (row) =>
      row.engineId === primaryEngineId &&
      row.role === 'Primary' &&
      row.connectionStatus === 'Connected',
  )?.currentIndex
  return value != null && Number.isFinite(Number(value)) && Number(value) > 0 ? value : null
}
