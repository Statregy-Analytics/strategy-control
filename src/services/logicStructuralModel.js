import { numberInputValue } from './numberInputValue.js'
import { projectedFinalIndex } from './adminWorkspaceModel.js'
export const unavailable = 'Indisponível'
export function structuralNumber(value, digits = 2, signed = false, grouped = false) {
  const n = numberInputValue(value)
  return n === null
    ? unavailable
    : n.toLocaleString('pt-BR', {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits === 0 ? 6 : digits,
        useGrouping: grouped,
        signDisplay: signed ? 'exceptZero' : 'auto',
      })
}
export function structuralPercent(value, digits = 2, signed = false) {
  const n = numberInputValue(value)
  return n === null ? unavailable : structuralNumber(n, digits, signed) + '%'
}
export function structuralDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return unavailable
  const d = new Date(value + 'T00:00:00Z')
  return Number.isFinite(d.getTime()) && d.toISOString().slice(0, 10) === value
    ? value.slice(8, 10) + '/' + value.slice(5, 7) + '/' + value.slice(0, 4)
    : unavailable
}
export function structuralTime(value, seconds = false) {
  if (typeof value !== 'string') return unavailable
  if (/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(value)) return seconds ? value : value.slice(0, 5)
  if (!/^\d{4}-\d{2}-\d{2}T/.test(value) || !Number.isFinite(Date.parse(value))) return unavailable
  return new Date(value).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    ...(seconds ? { second: '2-digit' } : {}),
  })
}
export function structuralCycle(start, end) {
  const a = structuralDate(start),
    b = structuralDate(end)
  return a === unavailable || b === unavailable
    ? unavailable
    : (start.slice(0, 4) === end.slice(0, 4) ? a.slice(0, 5) : a) + ' — ' + b
}
// Catalog identity does not provide any operational parameter. No defaults from creation.
export function catalogLogicForm(row) {
  return {
    name: row?.name || '',
    description: row?.description || '',
    status: null,
    initialIndex: null,
    target: null,
    startDate: '',
    endDate: '',
    interval: null,
    updatesPerDay: null,
    estimatedUpdates: null,
    lastRun: null,
    positive: null,
    negative: null,
    intensityMode: null,
    intensity: null,
    dailyCeiling: null,
    dailyFloor: null,
    monthlyCeiling: null,
    monthlyFloor: null,
    dayOpeningIndex: null,
    monthOpeningIndex: null,
    buffer: null,
    closingAt: null,
  }
}
export function structuralProjection(form) {
  const n = numberInputValue,
    amount = n(form.intensity),
    ceiling = n(form.dailyCeiling),
    floor = n(form.dailyFloor)
  const relative =
    form.intensityMode === 'Percentual da Banda Diária' &&
    amount !== null &&
    amount >= 0 &&
    amount <= 100
  const positive = relative && ceiling !== null && ceiling >= 0 ? (ceiling * amount) / 100 : null
  const negative = relative && floor !== null && floor <= 0 ? (floor * amount) / 100 : null
  function band(open, limit, sign) {
    const x = n(open),
      y = n(limit)
    return x !== null && x > 0 && y !== null && (sign > 0 ? y >= 0 : y <= 0)
      ? x * (1 + y / 100)
      : null
  }
  const dailyTop = band(form.dayOpeningIndex, form.dailyCeiling, 1),
    dailyBottom = band(form.dayOpeningIndex, form.dailyFloor, -1),
    monthlyTop = band(form.monthOpeningIndex, form.monthlyCeiling, 1),
    monthlyBottom = band(form.monthOpeningIndex, form.monthlyFloor, -1)
  return {
    finalIndex:
      n(form.initialIndex) !== null && n(form.initialIndex) > 0 && n(form.target) !== null
        ? projectedFinalIndex(form)
        : null,
    positive,
    negative,
    dailyTop,
    dailyBottom,
    monthlyTop,
    monthlyBottom,
    effectiveTop: dailyTop === null || monthlyTop === null ? null : Math.min(dailyTop, monthlyTop),
    effectiveBottom:
      dailyBottom === null || monthlyBottom === null ? null : Math.max(dailyBottom, monthlyBottom),
  }
}

export function validateStructuralDraft(form, baseline = {}) {
  const fields = {
    target: {},
    positive: { min: 0, max: 100 },
    intensity: { min: 0, max: 100 },
    dailyCeiling: { min: 0 },
    monthlyCeiling: { min: 0 },
    dailyFloor: { max: 0 },
    monthlyFloor: { max: 0 },
  }
  for (const [key, bounds] of Object.entries(fields)) {
    if (form[key] === baseline[key]) continue
    const n = numberInputValue(form[key])
    if (
      n === null ||
      (bounds.min !== undefined && n < bounds.min) ||
      (bounds.max !== undefined && n > bounds.max)
    )
      return 'Revise os valores dos parâmetros em edição.'
  }
  const n = numberInputValue
  if (
    n(form.dailyCeiling) !== null &&
    n(form.monthlyCeiling) !== null &&
    n(form.dailyCeiling) >= n(form.monthlyCeiling)
  )
    return 'Os limites diários devem ser menores que os mensais.'
  if (
    n(form.dailyFloor) !== null &&
    n(form.monthlyFloor) !== null &&
    Math.abs(n(form.dailyFloor)) >= Math.abs(n(form.monthlyFloor))
  )
    return 'Os limites diários devem ser menores que os mensais.'
  return ''
}

export function structuralDateTime(value) {
  if (
    typeof value !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}T/.test(value) ||
    !Number.isFinite(Date.parse(value))
  )
    return unavailable
  return new Date(value)
    .toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
    .replace(', ', ' ')
}
