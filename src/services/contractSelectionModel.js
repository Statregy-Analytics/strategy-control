import { foldSearch } from './adminWorkspaceModel.js'
export async function readContractSelection(read, current = () => true) {
  async function collect(registrationStatus) {
    const rows = []
    let page = 1,
      pages = 1
    do {
      if (!current()) return []
      const r = await read('admin/contracts', {
        page,
        pageSize: 100,
        ...(registrationStatus ? { registrationStatus } : {}),
      })
      if (!Array.isArray(r.data) || r.success === false) throw Error('Consulta indisponível.')
      rows.push(...r.data)
      pages = Math.max(1, Number(r.pagination?.totalPages || 1))
      if (!Number.isInteger(pages) || pages > 10000) throw Error('Refine a consulta.')
      page++
    } while (page <= pages)
    return rows
  }
  const sets = await Promise.all([collect(null), collect('Draft')])
  if (!current()) return null
  return [...new Map(sets.flat().map((r) => [r.id, r])).values()]
}
export function filterContractSelection(
  rows,
  { search = '', client = null, engine = null, period = null, sort = 'recent' } = {},
) {
  const q = foldSearch(search),
    from = rangeDate(period?.from),
    to = rangeDate(period?.to)
  return rows
    .filter(
      (r) =>
        (!q ||
          foldSearch(
            [
              r.name,
              r.publicCode,
              r.id,
              r.primaryEngine?.name,
              ...(r.clients || []).map((c) => c.displayName),
            ].join(' '),
          ).includes(q)) &&
        (!client || (r.clients || []).some((c) => c.clientId === client)) &&
        (!engine || r.primaryEngine?.engineId === engine) &&
        (!from || String(r.endDate || '9999-12-31') >= from) &&
        (!to || String(r.startDate || '') <= to),
    )
    .sort((a, b) =>
      sort === 'az'
        ? String(a.name || '').localeCompare(String(b.name || ''), 'pt-BR')
        : String(b.createdAtUtc || '').localeCompare(String(a.createdAtUtc || '')),
    )
}

function rangeDate(value) {
  if (typeof value !== 'string') return null
  const parts = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value)
  return parts
    ? `${parts[3]}-${parts[2]}-${parts[1]}`
    : /^\d{4}-\d{2}-\d{2}$/.test(value)
      ? value
      : null
}
