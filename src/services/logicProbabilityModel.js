import { numberInputValue as probabilityNumber } from './numberInputValue.js'
export { probabilityNumber }

export function probabilityState(positiveValue, negativeValue) {
  const positive = probabilityNumber(positiveValue)
  const negative = probabilityNumber(negativeValue)
  const known = positive !== null && negative !== null
  const total = known ? positive + negative : null
  const rangeInvalid = [positive, negative].some(
    (value) => value !== null && (value < 0 || value > 100),
  )
  const valid = rangeInvalid ? false : known ? Math.abs(total - 100) <= 0.000001 : null
  const drawable = known && !rangeInvalid && total > 0
  const positiveWidth = drawable ? (positive / total) * 100 : null
  return {
    positive,
    negative,
    known,
    total,
    valid,
    rangeInvalid,
    drawable,
    positiveWidth,
    negativeWidth: drawable ? 100 - positiveWidth : null,
  }
}

export function probabilityLabel(value) {
  return typeof value === 'number' && Number.isFinite(value)
    ? new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 6 }).format(value) + '%'
    : 'Indisponível'
}
