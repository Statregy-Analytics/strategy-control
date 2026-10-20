// Canonical decimal strings keep the precision accepted by the HTTP contract.
export function profileDecimal(value) {
  if (value == null || (typeof value === 'string' && !value.trim())) return null
  if (!['string', 'number'].includes(typeof value)) throw Error('Valor financeiro inválido.')
  const text = String(value).trim()
  if (!/^\d+(?:\.\d+)?$/.test(text) || !Number.isFinite(Number(text)))
    throw Error('Valor financeiro inválido.')
  const [integer, fraction = ''] = text.split('.')
  const units = integer.replace(/^0+(?=\d)/, '')
  const decimals = fraction.replace(/0+$/, '')
  return decimals ? units + '.' + decimals : units
}
export function compareProfileDecimals(first, second) {
  const [a, af = ''] = profileDecimal(first).split('.')
  const [b, bf = ''] = profileDecimal(second).split('.')
  if (a.length !== b.length) return a.length > b.length ? 1 : -1
  if (a !== b) return a > b ? 1 : -1
  const width = Math.max(af.length, bf.length)
  const x = af.padEnd(width, '0'), y = bf.padEnd(width, '0')
  return x === y ? 0 : x > y ? 1 : -1
}
