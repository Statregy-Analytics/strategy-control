// Use the server's latest PTAX quote for each direction. Never sum native currencies.
export async function readGlobalWalletFx(read, model, current = () => true) {
  const codes = [...new Set(model?.total?.currencies?.map((r) => r.currency) || [])]
  const pairs = [['USD', 'BRL'], ...codes.filter((c) => c !== 'USD').map((c) => [c, 'USD'])]
  const results = await Promise.allSettled(
    pairs.map(async ([from, to]) => {
      const response = await read('admin/exchange-rates/latest', { from, to })
      const quote = response?.data
      if (
        response?.success === false ||
        quote?.fromIsoCode !== from ||
        quote?.toIsoCode !== to ||
        !Number.isFinite(Number(quote.rate)) ||
        Number(quote.rate) <= 0
      )
        throw Error('Cotação indisponível.')
      return [from + '-' + to, quote]
    }),
  )
  if (!current()) return null
  const quotes = results.filter((r) => r.status === 'fulfilled').map((r) => r.value)
  if (!quotes.length) throw Error('Cotação indisponível.')
  return Object.fromEntries(quotes)
}
export function globalWalletConverted(model, type) {
  if (model?.totals) return model.totals[type] || { usd: null, brl: null }
  const rows = model?.[type]?.currencies
  const quotes = model?.fx
  if (!Array.isArray(rows) || !rows.length) return { usd: null, brl: null }
  let usd = 0
  for (const row of rows) {
    const value =
      row.balance == null || String(row.balance).trim() === '' ? NaN : Number(row.balance)
    const rate = row.currency === 'USD' ? 1 : Number(quotes?.[row.currency + '-USD']?.rate)
    if (!Number.isFinite(value) || (value !== 0 && (!Number.isFinite(rate) || rate <= 0)))
      return { usd: null, brl: null }
    usd += value === 0 ? 0 : value * rate
  }
  const rate = Number(quotes?.['USD-BRL']?.rate)
  return {
    usd: Math.round(usd * 100) / 100,
    brl: Number.isFinite(rate) && rate > 0 ? Math.round(usd * rate * 100) / 100 : null,
  }
}
