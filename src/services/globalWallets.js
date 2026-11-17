import { readCurrentPages } from './requestContext.js'
import { projectPortfolio } from './portfolioProjection.js'

const typeNames = { deposit: 'Free', strategy: 'Applied' }
const amount = (value) =>
  (typeof value === 'number' || typeof value === 'string') &&
  value !== '' &&
  Number.isFinite(Number(value))
    ? Number(value)
    : null
const sum = (values) =>
  values.some((v) => amount(v) === null)
    ? null
    : values.reduce((n, v) => n + Math.round(Number(v) * 100), 0) / 100

// Every total comes from the customer's full portfolio, including contracts and assets.
// The wallet directory endpoint alone only contains ledger balances.
export async function readGlobalPortfolios(read, current = () => true) {
  const [cards, wallets] = await Promise.all([
    readCurrentPages((page) => read('admin/customers/cards', { page, pageSize: 100 }), current),
    readCurrentPages((page) => read('admin/wallets', { page, pageSize: 100 }), current),
  ])
  if (!current() || !cards || !wallets) return null
  const customers = new Map(cards.map((c) => [c.customerId, c]))
  for (const w of wallets) {
    if (!w.id || !w.client?.id) throw Error('Carteira sem identificação.')
    if (!customers.has(w.client.id))
      customers.set(w.client.id, { customerId: w.client.id, displayName: w.client.name })
  }
  const list = [...customers.values()]
  if (list.some((c) => !c.customerId)) throw Error('Cliente sem identificação.')
  const records = new Array(list.length)
  let next = 0
  async function worker() {
    while (current() && next < list.length) {
      const index = next++,
        client = list[index]
      try {
        const p = (await read(`admin/customers/${client.customerId}/portfolio`)).data
        if (!current()) return
        if (p?.customerId !== client.customerId || !Array.isArray(p.currencies))
          throw Error('Carteira inválida.')
        const model = projectPortfolio(p)
        if (!model) throw Error('Carteira inválida.')
        records[index] = { client, portfolio: p, model }
      } catch {
        if (current()) records[index] = { client, error: true }
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(4, list.length) }, worker))
  if (current() && records.length && records.every((r) => r.error))
    throw Error('Carteiras indisponíveis.')
  return current() ? { records, wallets } : null
}
export function globalWalletRows(data) {
  if (!data) return null
  const rows = []
  for (const record of data.records) {
    const { client, portfolio, model } = record
    if (record.error) continue
    for (const type of ['deposit', 'strategy', 'assets']) {
      const native = (portfolio.currencies || []).filter((c) => {
        const ledger = c.wallets?.some((w) => w.type === typeNames[type])
        return (
          ledger ||
          (type === 'strategy' &&
            ((amount(c.invested) !== null && amount(c.invested) !== 0) ||
              c.investedBreakdown?.contractCount > 0)) ||
          (type === 'assets' &&
            ((amount(c.baseEquity) !== null && amount(c.baseEquity) !== 0) ||
              c.baseEquityBreakdown?.assetCount > 0))
        )
      })
      if (!native.length) continue
      const currencies = native.map((c) => ({
        ...model[type].currencies.find((v) => v.currency === c.currencyIsoCode),
        currencyId: c.currencyId,
      }))
      const wallets = data.wallets.filter(
        (w) => w.client.id === client.customerId && w.type === typeNames[type],
      )
      const states = [...new Set(wallets.map((w) => w.status))]
      const lastMovement =
        wallets
          .map((w) => w.lastMovementAtUtc)
          .filter((v) => v && Number.isFinite(Date.parse(v)))
          .sort((a, b) => Date.parse(b) - Date.parse(a))[0] || null
      rows.push({
        key: `${client.customerId}:${type}`,
        type,
        customerId: client.customerId,
        clientName: client.displayName,
        clientCode: client.strategyId || null,
        maskedDocument: client.maskedDocument || null,
        code: wallets.length === 1 ? wallets[0].id : null,
        ledgerWalletIds: wallets.map((w) => w.id),
        status: states.length === 1 ? states[0] : null,
        currencies,
        principalCurrency: currencies.length === 1 ? currencies[0].currency : null,
        total: currencies.length === 1 ? currencies[0].balance : null,
        declared: currencies.length === 1 ? currencies[0].declared : null,
        base: null,
        yieldPercentage: null,
        appreciation: null,
        lastMovement,
        model,
        contractCount:
          type === 'strategy' ? sum(native.map((c) => c.investedBreakdown?.contractCount)) : null,
        assetCount:
          type === 'assets' ? sum(native.map((c) => c.baseEquityBreakdown?.assetCount)) : null,
      })
    }
  }
  return rows
}
export function globalWalletSummary(data) {
  if (!data) return null
  const codes = [
    ...new Set(
      data.records.flatMap((r) => r.portfolio?.currencies?.map((c) => c.currencyIsoCode) || []),
    ),
  ]
  const result = { source: 'marco3', yieldAvailable: false }
  for (const type of ['deposit', 'strategy', 'assets', 'total']) {
    result[type] = {
      currencies: codes.map((currency) => {
        const values = data.records.map((r) => {
          if (r.error) return null
          const value = r.model[type].currencies.find((c) => c.currency === currency)?.balance
          return (
            value ?? (r.portfolio.currencies.some((c) => c.currencyIsoCode === currency) ? null : 0)
          )
        })
        return { currency, balance: sum(values) }
      }),
    }
  }
  return result
}
