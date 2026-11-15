export const dampingRanges = [
  { key: 'center', label: 'Centro' },
  { key: 'nearCeiling', label: 'Próximo do teto' },
  { key: 'upperExtreme', label: 'Extremo superior' },
  { key: 'nearFloor', label: 'Próximo do piso' },
  { key: 'lowerExtreme', label: 'Extremo inferior' },
]

// Presentation data only: these keys are not an assumed backend payload.
export function dampingRows(values) {
  return dampingRanges.map((range) => ({
    ...range,
    ...(values?.[range.key] || {}),
    key: range.key,
    label: range.label,
  }))
}

export function dampingPercent(value, signed = false) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 'Indisponível'
  return (
    new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: signed ? 2 : 0,
      maximumFractionDigits: 2,
      signDisplay: signed ? 'exceptZero' : 'auto',
    }).format(value) + '%'
  )
}

export function dampingTone(value) {
  return typeof value === 'number' && Number.isFinite(value)
    ? value > 0
      ? 'positive'
      : value < 0
        ? 'negative'
        : null
    : null
}
