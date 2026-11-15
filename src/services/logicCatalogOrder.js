const dateFields = { recent: 'createdAtUtc', oldest: 'createdAtUtc' }

function timestamp(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T/.test(value)) return null
  const parsed = Date.parse(value)
  return Number.isFinite(parsed) ? parsed : null
}

export function canOrderLogicCatalog(rows, order) {
  const field = Object.hasOwn(dateFields, order) ? dateFields[order] : null
  return (
    !!field &&
    Array.isArray(rows) &&
    rows.length > 0 &&
    rows.every((row) => timestamp(row?.[field]) !== null)
  )
}

export function orderLogicCatalog(rows, order) {
  const result = [...rows]
  if (!canOrderLogicCatalog(rows, order)) return result
  const field = dateFields[order]
  const direction = order === 'oldest' ? 1 : -1
  return result.sort((a, b) => direction * (timestamp(a[field]) - timestamp(b[field])))
}
