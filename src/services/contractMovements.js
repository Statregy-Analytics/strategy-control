export function contractMovements(rows, contractId, clientId = null) {
  const matching = rows.filter(
    (row) => row.status === 'Completed' && (!clientId || row.clientId === clientId),
  )
  const belongs = (endpoint) => endpoint?.kind === 'Contract' && endpoint.id === contractId
  return {
    deposits: matching.filter((row) => belongs(row.destination) && !belongs(row.source)),
    withdrawals: matching.filter((row) => belongs(row.source) && !belongs(row.destination)),
  }
}
export function movementTotal(rows, currency) {
  return rows.every(
    (row) =>
      row.currencyIsoCode === currency &&
      typeof row.amount === 'number' &&
      Number.isFinite(row.amount),
  )
    ? rows.reduce((sum, row) => sum + row.amount, 0)
    : null
}
