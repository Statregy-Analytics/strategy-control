import { foldSearch } from './adminWorkspaceModel.js'
export const logicImage = (name) => '/icons/logics/directory/' + name + '.svg'
export function logicNumber(value) {
  return value == null || typeof value === 'boolean' || String(value).trim() === ''
    ? null
    : Number.isFinite(Number(value))
      ? Number(value)
      : null
}
export function logicState(value) {
  return (
    {
      Active: 'active',
      Ativo: 'active',
      Ativa: 'active',
      Paused: 'paused',
      Pausado: 'paused',
      Pausada: 'paused',
      UnderReview: 'analysis',
      'Em Análise': 'analysis',
      Inactive: 'inactive',
      Inativo: 'inactive',
      Inativa: 'inactive',
      Closed: 'closed',
      Encerrado: 'closed',
    }[value] || null
  )
}
export function logicStateLabel(value) {
  return (
    {
      active: 'Ativo',
      paused: 'Pausado',
      analysis: 'Em Análise',
      inactive: 'Inativo',
      closed: 'Encerrado',
    }[logicState(value)] ||
    value ||
    '—'
  )
}
export function logicIndex(value) {
  const n = logicNumber(value)
  return n === null
    ? 'Indisponível'
    : n.toLocaleString('pt-BR', {
        minimumFractionDigits: 4,
        maximumFractionDigits: 4,
        useGrouping: false,
      })
}
export function logicPercent(value, decimals = 2) {
  const n = logicNumber(value)
  return n === null
    ? 'Indisponível'
    : (n > 0 ? '+' : '') +
        n.toLocaleString('pt-BR', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }) +
        '%'
}
export function logicDate(value) {
  return typeof value === 'string' &&
    /^\d{4}-\d{2}-\d{2}(T|$)/.test(value) &&
    Number.isFinite(Date.parse(value))
    ? new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? value + 'T00:00:00' : value).toLocaleString(
        'pt-BR',
        {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        },
      )
    : 'Indisponível'
}
const fields = {
  performance: 'performancePercent',
  sinceStart: 'sinceStartPercent',
  links: 'links',
  target: 'target',
  interval: 'interval',
  updated: 'updatedAt',
}
function sortValue(row, metrics, order) {
  const m = metrics?.[row.id] || {}
  if (['recent', 'oldest'].includes(order)) {
    const d = row.createdAtUtc
    return typeof d === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(d) && Number.isFinite(Date.parse(d))
      ? Date.parse(d)
      : null
  }
  if (order === 'updated') {
    return typeof m.updatedAt === 'string' &&
      /^\d{4}-\d{2}-\d{2}T/.test(m.updatedAt) &&
      Number.isFinite(Date.parse(m.updatedAt))
      ? Date.parse(m.updatedAt)
      : null
  }
  const n = Object.hasOwn(fields, order) ? logicNumber(m[fields[order]]) : null
  return (order === 'links' && (n === null || !Number.isInteger(n) || n < 0)) ||
    (order === 'interval' && (n === null || n <= 0))
    ? null
    : n
}
export function canSortLogic(rows, metrics, order) {
  return (
    Array.isArray(rows) &&
    rows.length > 0 &&
    rows.every((r) => sortValue(r, metrics, order) !== null)
  )
}
export function filterLogicDirectory(
  rows,
  metrics,
  { search = '', status = 'all', links = 'all', sort = null } = {},
) {
  const q = foldSearch(search)
  const result = rows.filter(
    (r) =>
      (!q || foldSearch([r.name, r.code].join(' ')).includes(q)) &&
      (status === 'all' || logicState(r.status) === status) &&
      (links === 'all' ||
        (logicNumber(metrics?.[r.id]?.links) !== null &&
          (links === 'linked'
            ? Number(metrics[r.id].links) > 0
            : Number(metrics[r.id].links) === 0))),
  )
  if (canSortLogic(rows, metrics, sort)) {
    const direction = ['oldest', 'interval'].includes(sort) ? 1 : -1
    result.sort((a, b) => direction * (sortValue(a, metrics, sort) - sortValue(b, metrics, sort)))
  }
  return result
}

export function logicCount(value) {
  const n = logicNumber(value)
  return n !== null && Number.isInteger(n) && n >= 0 ? n : 'Indisponível'
}
