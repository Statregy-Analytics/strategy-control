export const WALLET_CURRENCIES = [
  { code: 'BRL', symbol: 'R$', name: 'Real brasileiro', reference: 'CDI' },
  { code: 'USD', symbol: 'US$', name: 'Dólar americano', reference: 'Fed Funds / SOFR' },
  { code: 'EUR', symbol: '€', name: 'Euro', reference: '€STR' },
  { code: 'CAD', symbol: 'C$', name: 'Dólar canadense', reference: 'Bank of Canada' },
  { code: 'JPY', symbol: '¥', name: 'Iene japonês', reference: 'TONA' },
  { code: 'CNY', symbol: 'CN¥', name: 'Yuan chinês', reference: 'PBoC repo 7 dias' },
  { code: 'AUD', symbol: 'A$', name: 'Dólar australiano', reference: 'RBA cash rate' },
]
export const WALLET_TYPES = [
  {
    key: 'deposit',
    label: 'Carteira de Depósito',
    description:
      'Entrada e saída de dinheiro. Sem rendimento. Disponível para saque em até 1 dia útil.',
  },
  {
    key: 'strategy',
    label: 'Carteira Strategy',
    description:
      'Valores em contratos e saldo parado rendendo. Transferência de volta para Depósito em até 30 dias corridos.',
  },
  {
    key: 'assets',
    label: 'Patrimônio',
    description:
      'Imóveis, veículos, consórcios e investimentos externos declarados. Não é saldo disponível para movimentação.',
  },
  {
    key: 'total',
    label: 'Carteira Total',
    description:
      'Depósito + Strategy + Patrimônio. Conversão pela cotação diária, somente para exibição na moeda principal.',
  },
]
export const YIELD_DESCRIPTION =
  'Saldo parado na Strategy: até 60 dias, 70% do índice; de 61 a 180 dias, 85%; acima de 180 dias, 100%. Cada entrada tem sua própria idade. Rendimento composto em dias úteis (base 252), a partir do primeiro dia útil seguinte à entrada. Índices por moeda sujeitos à confirmação.'
export const finiteMoney = (value) =>
  value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value))
    ? Number(value)
    : null
export function walletMoney(value, currency) {
  const definition = WALLET_CURRENCIES.find((item) => item.code === currency)
  if (finiteMoney(value) === null || !definition) return '—'
  return (
    definition.symbol +
    ' ' +
    new Intl.NumberFormat(currency === 'BRL' ? 'pt-BR' : 'en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(value))
  )
}
// Presentation-only model. No HTTP schema is inferred here. A future API adapter
// must explicitly supply per-wallet balances, daily FX totals and instructions.
export function walletRows(model, type) {
  return WALLET_CURRENCIES.map((currency) => {
    const row = model?.[type]?.currencies?.find((row) => row.currency === currency.code)
    return {
      ...row,
      currency: currency.code,
      reference: currency.reference,
      balance: finiteMoney(row?.balance),
    }
  })
}
export function walletBalance(model, type, currency) {
  return walletRows(model, type).find((row) => row.currency === currency)?.balance ?? null
}
export function balanceAfter(balance, amount) {
  const available = finiteMoney(balance),
    value = finiteMoney(amount)
  return available === null || value === null || value < 0 || value > available
    ? null
    : Math.round((available - value) * 100) / 100
}
export function transferDeadline(from) {
  return from === 'deposit' ? 'Imediato' : 'Até 30 dias corridos'
}
export function bankCurrency(bank) {
  return bank?.currencyIsoCode || null
}
export function compatibleBanks(banks, currency) {
  return (banks || []).filter((bank) => bank.status === 'Active' && bankCurrency(bank) === currency)
}
export function validateWalletOperation({
  mode,
  amount,
  currency,
  from = 'deposit',
  bank,
  password,
  model,
}) {
  if (!WALLET_CURRENCIES.some((item) => item.code === currency)) return 'Selecione uma moeda.'
  if (finiteMoney(amount) === null || Number(amount) <= 0) return 'Informe um valor positivo.'
  if (mode === 'deposit') {
    const minimum = finiteMoney(model?.instructions?.[currency]?.minimum)
    if (minimum !== null && amount < minimum)
      return 'O valor está abaixo do mínimo para esta moeda.'
  } else {
    const balance = walletBalance(model, mode === 'withdrawal' ? 'deposit' : from, currency)
    if (balance === null) return 'Aguarde a confirmação do saldo disponível.'
    if (amount > balance) return 'O valor excede o saldo disponível.'
  }
  if (
    mode === 'withdrawal' &&
    (!bank || bank.status !== 'Active' || bankCurrency(bank) !== currency)
  )
    return 'Selecione uma conta ativa na mesma moeda.'
  if (mode === 'withdrawal' && !password) return 'Informe sua Senha de Saque.'
  return ''
}

// Read the complete bank collection; never silently truncate at the first page.
export async function readWalletBankAccounts(readPage, active = () => true) {
  const rows = []
  let page = 1,
    totalPages = 1
  do {
    if (!active()) return []
    const result = await readPage(page)
    if (!active()) return []
    if (!Array.isArray(result?.data)) throw new Error('Contas bancárias indisponíveis.')
    rows.push(...result.data)
    totalPages = Number(result.pagination?.totalPages ?? 1)
    if (!Number.isInteger(totalPages) || totalPages < 0 || totalPages > 10000)
      throw new Error('Paginação bancária inválida.')
    page++
  } while (page <= totalPages)
  return rows
}

// All three totals must already be converted by the adapter to principalCurrency.
// Never add native BRL/USD/etc. balances or reinterpret legacy "invested" fields.
export function consolidatedWalletTotal(model) {
  if (!WALLET_CURRENCIES.some((item) => item.code === model?.principalCurrency)) return null
  const totals = ['deposit', 'strategy', 'assets'].map((type) => finiteMoney(model?.[type]?.total))
  if (totals.some((value) => value === null)) return null
  return totals.reduce((sum, value) => sum + Math.round(value * 100), 0) / 100
}

// Presentation projection only; the new wallet HTTP adapter is still pending.
export function walletIsEmpty(model) {
  return (
    consolidatedWalletTotal(model) === 0 &&
    ['deposit', 'strategy', 'assets'].every((type) => finiteMoney(model?.[type]?.total) === 0)
  )
}
export function walletCompositionRows(model) {
  const rows = []
  for (const type of ['deposit', 'strategy']) {
    for (const row of model?.[type]?.currencies || []) {
      if (!WALLET_CURRENCIES.some((item) => item.code === row.currency)) continue
      const parts =
        type === 'deposit'
          ? [['balance', 'Depósito', 'Disponível']]
          : [
              ['contracted', 'Strategy', 'Em contratos'],
              ['idle', 'Strategy', 'Parado, rendendo'],
            ]
      for (const [key, wallet, situation] of parts) {
        if (!(finiteMoney(row[key]) > 0)) continue
        rows.push({
          key: `${type}-${row.currency}-${key}`,
          wallet: `${wallet} · ${row.currency}`,
          situation,
          value: row[key],
          currency: row.currency,
          origin: type === 'deposit' ? 'Sem rendimento' : row.yieldOrigin || '—',
          updatedAt: row.updatedAt,
        })
      }
    }
  }
  if (finiteMoney(model?.assets?.total) > 0)
    rows.push({
      key: 'assets',
      wallet: 'Patrimônio',
      situation: Number.isInteger(model.assets.count)
        ? `${model.assets.count} bens`
        : 'Bens vinculados',
      value: model.assets.total,
      currency: model.principalCurrency,
      origin: 'Valorização dos bens',
      updatedAt: model.assets.updatedAt,
    })
  return rows
}
