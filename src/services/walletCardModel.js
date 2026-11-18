import { WALLET_CURRENCIES, finiteMoney } from './walletModel.js'
import { globalWalletConverted } from './globalWalletFx.js'
export function walletCardCurrencies(row) {
  const native = Array.isArray(row?.currencies) ? row.currencies : []
  const codes = [
    ...new Set([
      ...WALLET_CURRENCIES.map((c) => c.code),
      ...native.map((c) => c.currency).filter(Boolean),
    ]),
  ]
  return codes.map((code) => ({
    currency: code,
    name: WALLET_CURRENCIES.find((c) => c.code === code)?.name || code,
    ...native.find((c) => c.currency === code),
  }))
}
export function walletCardConsolidated(row, fx, key = 'balance') {
  const native = (row?.currencies || []).map((c) => ({
    currency: c.currency,
    balance: key === 'current' && row.currencies.length === 1 ? row.currentTotal : c[key],
  }))
  if (native.length === 1)
    return {
      value: finiteMoney(native[0].balance),
      currency: native[0].currency,
      approximate: false,
    }
  if (!native.length) return { value: null, currency: null, approximate: false }
  const value = globalWalletConverted({ total: { currencies: native }, fx }, 'total').brl
  return { value, currency: 'BRL', approximate: value !== null }
}
export function walletCardPercent(value) {
  const number = finiteMoney(value)
  return number === null
    ? '—'
    : (number > 0 ? '+' : '') + number.toLocaleString('pt-BR', { maximumFractionDigits: 2 }) + '%'
}
export function walletCardCount(value, singular, plural) {
  return value == null ? '—' : value + ' ' + (Number(value) === 1 ? singular : plural)
}
