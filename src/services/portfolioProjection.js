// Read-only projection of confirmed Marco 3 balances. No FX or yield is inferred.
const money = (value) =>
  (typeof value === 'number' || typeof value === 'string') &&
  String(value).trim() !== '' &&
  Number.isFinite(Number(value))
    ? Number(value)
    : null
const sum = (values) =>
  values.some((value) => value === null)
    ? null
    : values.reduce((a, b) => a + Math.round(b * 100), 0) / 100
const validCode = (code) => typeof code === 'string' && /^[A-Z]{3}$/.test(code)
function walletAmounts(wallets, type, currency) {
  if (!Array.isArray(wallets)) return { balance: null, reserved: null, available: null }
  const rows = wallets.filter((row) => row.type === type && row.currencyIsoCode === currency)
  return Object.fromEntries(
    ['balance', 'reserved', 'available'].map((key) => [
      key,
      sum(rows.map((row) => money(row[key]))),
    ]),
  )
}
function finish(model, codes) {
  model.total = {
    currencies: codes.map((currency) => ({
      currency,
      balance: sum(
        ['deposit', 'strategy', 'assets'].map(
          (type) =>
            model[type]?.currencies.find((row) => row.currency === currency)?.balance ?? null,
        ),
      ),
    })),
  }
  model.principalCurrency = codes.length === 1 ? codes[0] : null
  for (const type of ['deposit', 'strategy', 'assets', 'total'])
    model[type].total = codes.length === 1 ? (model[type].currencies[0]?.balance ?? null) : null
  model.empty =
    codes.length > 0 &&
    ['deposit', 'strategy', 'assets'].every((type) =>
      model[type].currencies.every((row) => row.balance === 0 && !(row.count > 0)),
    )
  model.source = 'marco3'
  model.yieldAvailable = false
  return model
}
export function projectPortfolio(portfolio, emptyCurrency = 'BRL') {
  if (!portfolio || !Array.isArray(portfolio.currencies)) return null
  const currencies = portfolio.currencies
  const codes = currencies.map((row) => row.currencyIsoCode)
  if (codes.some((code) => !validCode(code)) || new Set(codes).size !== codes.length) return null
  const model = {
    deposit: { currencies: [] },
    strategy: { currencies: [] },
    assets: { currencies: [] },
  }
  for (const row of currencies) {
    const currency = row.currencyIsoCode
    if (
      !Array.isArray(row.wallets) ||
      row.wallets.some(
        (wallet) =>
          wallet.currencyIsoCode !== currency || !['Free', 'Applied'].includes(wallet.type),
      )
    )
      return null
    const free = walletAmounts(row.wallets, 'Free', currency),
      applied = walletAmounts(row.wallets, 'Applied', currency)
    const contracted = money(row.invested),
      equity = money(row.baseEquity)
    const updatedAt = portfolio.lastUpdatedAtUtc || null
    model.deposit.currencies.push({ currency, ...free, updatedAt })
    model.strategy.currencies.push({
      currency,
      balance: sum([contracted, applied.balance]),
      contracted,
      idle: applied.balance,
      available: applied.available,
      reserved: applied.reserved,
      yieldOrigin: 'Rendimento ainda não disponível',
      updatedAt,
    })
    model.assets.currencies.push({
      currency,
      balance: equity,
      declared: money(row.baseEquityBreakdown?.grossDeclaredValue),
      financed: money(row.baseEquityBreakdown?.financedBalance),
      count: money(row.baseEquityBreakdown?.assetCount),
      updatedAt,
    })
  }
  // A successful empty collection represents no positions, not a request failure.
  if (!codes.length) {
    const currency = validCode(emptyCurrency) ? emptyCurrency : 'BRL'
    codes.push(currency)
    for (const type of ['deposit', 'strategy', 'assets'])
      model[type].currencies.push({
        currency,
        balance: 0,
        available: 0,
        reserved: 0,
        contracted: 0,
        idle: 0,
        declared: 0,
        financed: 0,
        count: 0,
      })
  }
  finish(model, codes)
  model.assets.count = sum(model.assets.currencies.map((row) => row.count))
  model.assets.declared = codes.length === 1 ? model.assets.currencies[0].declared : null
  return model
}
export function walletDisplayAmounts(model, type) {
  if (!model) return []
  if (model.source === 'marco3') return model[type]?.currencies || []
  return [
    {
      currency: model.principalCurrency,
      balance:
        type === 'total'
          ? sum(['deposit', 'strategy', 'assets'].map((key) => money(model[key]?.total)))
          : money(model[type]?.total),
    },
  ]
}
export function projectClientWallets(home, wallets, emptyCurrency = 'BRL') {
  const summaries =
    home?.access?.financialStatus === 'Available' && Array.isArray(home.summaries)
      ? home.summaries
      : null
  const validWallets =
    Array.isArray(wallets) &&
    wallets.every((row) => validCode(row.currencyIsoCode) && ['Free', 'Applied'].includes(row.type))
      ? wallets
      : null
  if (!summaries && !validWallets) return null
  const codes = [
    ...new Set([
      ...(summaries || []).map((row) => row.currencyIsoCode),
      ...(validWallets || []).map((row) => row.currencyIsoCode),
    ]),
  ]
  if (codes.some((code) => !validCode(code))) return null
  if (!codes.length) codes.push(validCode(emptyCurrency) ? emptyCurrency : 'BRL')
  const model = {
    deposit: { currencies: [] },
    strategy: { currencies: [] },
    assets: { currencies: [] },
  }
  for (const currency of codes) {
    const summary = summaries?.find((row) => row.currencyIsoCode === currency)
    const contracted =
      summary?.contractedCapital?.status === 'Available'
        ? money(summary.contractedCapital.value)
        : summaries?.length === 0 &&
            home.contracts?.status === 'Available' &&
            Number(home.contracts.totalItems) === 0
          ? 0
          : null
    const free = walletAmounts(validWallets, 'Free', currency),
      applied = walletAmounts(validWallets, 'Applied', currency)
    model.deposit.currencies.push({ currency, ...free })
    model.strategy.currencies.push({
      currency,
      balance: sum([contracted, applied.balance]),
      contracted,
      idle: applied.balance,
      available: applied.available,
      reserved: applied.reserved,
      yieldOrigin: 'Rendimento ainda não disponível',
    })
    // ClientHome and ClientWallet do not expose baseEquity or assetCount.
    model.assets.currencies.push({ currency, balance: null })
  }
  return finish(model, codes)
}
