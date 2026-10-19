const ready = (state) => state && !state.loading && !state.error && state.data != null
const zero = (value) =>
  ['number', 'string'].includes(typeof value) && String(value).trim() !== '' && Number(value) === 0
export function confirmedEmptyPortfolio(portfolio, composition, wallets) {
  return Boolean(
    ready(portfolio) &&
      ready(composition) &&
      ready(wallets) &&
      Array.isArray(portfolio.data.currencies) &&
      portfolio.data.currencies.length === 0 &&
      Array.isArray(composition.data.currencies) &&
      composition.data.currencies.every(
        (currency) =>
          zero(currency.total) &&
          Array.isArray(currency.items) &&
          currency.items.every((item) => zero(item.value)),
      ) &&
      Array.isArray(wallets.data) &&
      wallets.data.length === 0,
  )
}
export function portfolioCurrencies(portfolio, composition, wallets) {
  if (confirmedEmptyPortfolio(portfolio, composition, wallets))
    return [
      {
        currencyId: null,
        currencyIsoCode: 'BRL',
        baseEquity: 0,
        invested: 0,
        investable: 0,
        total: 0,
        empty: true,
      },
    ]
  return portfolio?.data?.currencies || []
}
export async function readCustomerStatement(wallets, read, assertCurrent = () => {}) {
  if (!Array.isArray(wallets)) throw new Error('Carteiras indisponíveis.')
  const rows = []
  const walletIds = new Set()
  for (const wallet of wallets) {
    if (!wallet.id || walletIds.has(wallet.id) || !wallet.currencyIsoCode)
      throw new Error('Carteiras inválidas.')
    walletIds.add(wallet.id)
    let page = 1,
      total = null,
      count = 0
    const keys = new Set()
    while (true) {
      assertCurrent()
      const result = await read(wallet.id, { page, pageSize: 100 })
      assertCurrent()
      const meta = result?.pagination
      if (
        result?.success === false ||
        !Array.isArray(result?.data) ||
        !Number.isInteger(meta?.totalItems) ||
        meta.totalItems < 0 ||
        typeof meta.hasNextPage !== 'boolean' ||
        (total !== null && total !== meta.totalItems)
      )
        throw new Error('Extrato incompleto.')
      total = meta.totalItems
      for (const entry of result.data) {
        const key = entry.transactionId + ':' + entry.direction
        if (
          !entry.transactionId ||
          keys.has(key) ||
          !Number.isFinite(Date.parse(entry.occurredAtUtc))
        )
          throw new Error('Lançamento inválido.')
        keys.add(key)
        rows.push({
          ...entry,
          key: wallet.id + ':' + key,
          wallet: wallet.type,
          currencyIsoCode: wallet.currencyIsoCode,
        })
      }
      count += result.data.length
      if (!meta.hasNextPage) break
      if (!result.data.length || count >= total) throw new Error('Extrato inconsistente.')
      page++
    }
    if (count !== total) throw new Error('Extrato incompleto.')
  }
  return rows.sort((a, b) => Date.parse(b.occurredAtUtc) - Date.parse(a.occurredAtUtc))
}
