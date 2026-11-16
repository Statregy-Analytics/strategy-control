// Money is compared as integer cents; percentages are display values, never payload fields.
export function contractPercentageLabel(value) {
  if (value === null || value === undefined || value === '' || !Number.isFinite(Number(value)))
    return 'Indisponível'
  return (
    new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(value)) + '%'
  )
}

export function capitalCents(value) {
  if (value === null || value === undefined || value === '') return null
  const text = String(value)
  if (text.length > 18 || !/^\d+(?:\.\d{1,2})?$/.test(text)) return null
  const [whole, fraction = ''] = text.split('.')
  const cents = BigInt(whole) * 100n + BigInt(fraction.padEnd(2, '0'))
  return cents <= 999999999999999n ? cents : null
}

export function centsDecimal(cents) {
  const sign = cents < 0n ? '-' : ''
  const value = cents < 0n ? -cents : cents
  return `${sign}${value / 100n}.${String(value % 100n).padStart(2, '0')}`
}

export function localizedDecimal(value) {
  const raw = String(value ?? '')
    .trim()
    .replace(/\s/g, '')
  if (!/^(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d{0,2})?$/.test(raw)) return null
  const text = raw.replace(/\./g, '')
  return text.replace(',', '.').replace(/\.$/, '')
}

export function amountFromPercent(value, capital) {
  const percent = capitalCents(localizedDecimal(value))
  const base = capitalCents(capital)
  if (percent === null || base === null || base <= 0n) return null
  const amount = (base * percent + 5000n) / 10000n
  return amount <= 999999999999999n ? centsDecimal(amount) : null
}

export function distributionState(rows, capital) {
  const base = capitalCents(capital) ?? 0n
  const amounts = rows.map((row) => capitalCents(row.allocatedAmount))
  const total = amounts.reduce((sum, amount) => sum + (amount ?? 0n), 0n)
  // Round the aggregate first and distribute the leftover basis points by largest
  // remainder. Array order breaks ties, so a closed allocation displays 100.00%.
  const shares = amounts.map((amount, index) => ({
    index,
    value: base > 0n ? ((amount ?? 0n) * 10000n) / base : 0n,
    remainder: base > 0n ? ((amount ?? 0n) * 10000n) % base : 0n,
  }))
  const target = base > 0n ? (total * 10000n + base / 2n) / base : 0n
  let remaining = target - shares.reduce((sum, share) => sum + share.value, 0n)
  for (const share of [...shares].sort((a, b) =>
    a.remainder === b.remainder ? a.index - b.index : a.remainder > b.remainder ? -1 : 1,
  )) {
    if (remaining-- > 0n) share.value++
  }
  return {
    base,
    total,
    remaining: base - total,
    closed: base > 0n && total === base,
    valid:
      base > 0n &&
      total === base &&
      rows.length > 0 &&
      new Set(rows.map((row) => row.clientId)).size === rows.length &&
      rows.every((row, index) => row.clientId && amounts[index] !== null && amounts[index] > 0n),
    percentages: shares.map((share) => centsDecimal(share.value)),
    totalPercentage: centsDecimal(target),
  }
}
