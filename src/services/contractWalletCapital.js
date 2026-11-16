import { capitalCents, centsDecimal } from './contractDistribution.js'
import { WALLET_CURRENCIES } from './walletModel.js'

export const walletCapitalCurrencies = WALLET_CURRENCIES
export const walletCapitalTypes = [
  {
    key: 'Applied',
    label: 'Carteira Strategy',
    short: 'Strategy',
    balance: 'Saldo parado',
    after: 'Saldo parado após',
  },
  {
    key: 'Free',
    label: 'Carteira de Depósito',
    short: 'Depósito',
    balance: 'Saldo',
    after: 'Saldo após',
  },
]
export const walletCapitalType = (type) => walletCapitalTypes.find((item) => item.key === type)
export const walletLineKey = (line) => `${line.type}:${line.currencyIsoCode}`
export const walletCapitalBlocked =
  'Não foi possível salvar os vínculos por carteira. Os valores foram mantidos nesta tela e nenhum saldo foi debitado.'

export function sourceWalletOptions(wallets, type) {
  if (!Array.isArray(wallets)) throw Error('Saldos indisponíveis.')
  return walletCapitalCurrencies.map((currency) => {
    const matches = wallets.filter(
      (wallet) => wallet.type === type && wallet.currencyIsoCode === currency.code,
    )
    if (matches.length > 1) throw Error('Não foi possível identificar a carteira de origem.')
    const wallet = matches[0]
    return {
      ...currency,
      type,
      walletId: wallet?.id || null,
      currencyId: wallet?.currencyId || null,
      available: wallet ? capitalCents(wallet.available) : 0n,
      active: !wallet?.status || wallet.status === 'Active',
    }
  })
}

function decimalRatio(value) {
  const text = String(value ?? '')
  if (text.length > 40 || !/^\d+(?:\.\d{1,18})?$/.test(text)) return null
  const [whole, fraction = ''] = text.split('.')
  const numerator = BigInt(whole + fraction)
  return numerator > 0n ? { numerator, denominator: 10n ** BigInt(fraction.length) } : null
}
export function validWalletQuote(quote, from, to) {
  return (
    quote?.fromIsoCode === from &&
    quote?.toIsoCode === to &&
    quote?.source === 'BcbPtax' &&
    /^\d{4}-\d{2}-\d{2}$/.test(quote.referenceDate || '') &&
    !!decimalRatio(quote.rate) &&
    Array.isArray(quote.quotes) &&
    quote.quotes.length > 0 &&
    quote.quotes.every((item) => item.id)
  )
}

export function convertedWalletCents(amount, from, to, quote) {
  const cents = capitalCents(amount)
  if (cents === null || (from === 'JPY' && cents % 100n !== 0n)) return null
  if (from === to) return cents
  if (!validWalletQuote(quote, from, to)) return null
  const { numerator, denominator } = decimalRatio(quote.rate)
  const unit = to === 'JPY' ? 100n : 1n
  const divisor = denominator * unit
  const result = ((cents * numerator + divisor / 2n) / divisor) * unit
  return result <= 999999999999999n ? result : null
}

export function walletContributionState(lines, currency) {
  const seen = new Set()
  const rows = lines.map((line) => {
    const amount = capitalCents(line.amount),
      available = capitalCents(line.available)
    const key = walletLineKey(line),
      duplicate = seen.has(key)
    seen.add(key)
    const exceeds = amount !== null && available !== null && amount > available
    const converted = convertedWalletCents(line.amount, line.currencyIsoCode, currency, line.quote)
    return {
      ...line,
      amountCents: amount,
      availableCents: available,
      exceeds,
      after: amount !== null && available !== null && !exceeds ? available - amount : null,
      converted,
      valid:
        !!line.walletId &&
        !!line.currencyId &&
        !!walletCapitalType(line.type) &&
        !duplicate &&
        amount !== null &&
        amount > 0n &&
        available !== null &&
        !exceeds &&
        converted !== null &&
        converted > 0n,
    }
  })
  const valid = rows.length > 0 && rows.every((row) => row.valid)
  return {
    rows,
    exceeds: rows.some((row) => row.exceeds),
    valid,
    total: valid ? rows.reduce((sum, row) => sum + row.converted, 0n) : null,
  }
}

export function walletCapitalTotal(allocations) {
  const values = allocations.map((row) => capitalCents(row.allocatedAmount))
  return values.some((value) => value === null)
    ? null
    : values.reduce((sum, value) => sum + value, 0n)
}
export function walletMoney(cents, currency) {
  if (cents === null || cents === undefined) return 'Indisponível'
  const definition = walletCapitalCurrencies.find((item) => item.code === currency)
  const digits = currency === 'JPY' ? 0 : 2
  return `${definition?.symbol || currency} ${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(Number(centsDecimal(cents)))}`
}
export const walletRateLabel = (rate) =>
  new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
    useGrouping: false,
  }).format(Number(rate))
export const walletQuoteDate = (value) =>
  /^\d{4}-\d{2}-\d{2}$/.test(value || '') ? value.split('-').reverse().join('/') : 'Indisponível'
export function walletOriginLabel(line) {
  const amount = walletMoney(capitalCents(line.amount), line.currencyIsoCode)
  return line.quote
    ? `${amount} × ${walletRateLabel(line.quote.rate)} (PTAX de ${walletQuoteDate(line.quote.referenceDate)})`
    : amount
}
