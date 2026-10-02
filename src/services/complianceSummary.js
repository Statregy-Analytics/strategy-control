// Totals cover all active/in-review flags; recentAlerts contains at most five.
export function summarizeCompliance(card, alerts) {
  const summary = alerts ?? card?.summary
  const rawCount = summary?.activeCount
  const count = rawCount == null || rawCount === '' ? NaN : Number(rawCount)
  const activeCount = Number.isInteger(count) && count >= 0 ? count : null
  const primaryAlert = summary?.primaryAlert ?? card?.primaryAlert
  return {
    available: Boolean(summary),
    activeCount,
    recentAlerts: Array.isArray(summary?.recentAlerts) ? summary.recentAlerts : [],
    status: activeCount === 0 ? 'Sem flags pendentes'
      : primaryAlert?.title || (activeCount > 0 ? 'Flags pendentes' : 'Indisponível'),
    color: activeCount === null ? '' : activeCount > 0 ? 'text-negative' : 'text-positive',
  }
}
