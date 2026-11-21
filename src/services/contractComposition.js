export const compositionFields = [
  { key: 'intradayPercentage', label: 'Intradiário (%)' },
  { key: 'corePercentage', label: 'Núcleo (%)' },
  { key: 'tacticalPercentage', label: 'Tática (%)' },
]
export function compositionPayload(value) {
  const raw = compositionFields.map((f) => value?.[f.key])
  if (raw.every((v) => v == null || v === '')) return null
  const numbers = raw.map((v) =>
    v == null || v === '' ? NaN : Number(String(v).replace(',', '.')),
  )
  if (
    numbers.some((n) => !Number.isFinite(n) || n < 0 || n > 100) ||
    Math.abs(numbers.reduce((a, b) => a + b, 0) - 100) > 0.000001
  )
    throw Error(
      'A composição estratégica deve conter três percentuais entre 0 e 100, somando 100%.',
    )
  return Object.fromEntries(compositionFields.map((f, i) => [f.key, numbers[i]]))
}
