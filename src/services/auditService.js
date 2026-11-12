import { auditParams, isAuditDeletion, auditValue } from './auditModel.js'

function validate(result) {
  if (result?.success === false || !Array.isArray(result?.data))
    throw new Error('Consulta de auditoria indisponível.')
  const totalItems = Number(result.pagination?.totalItems ?? result.data.length)
  const totalPages = Math.max(1, Number(result.pagination?.totalPages ?? 1))
  if (!Number.isInteger(totalItems) || totalItems < 0 || !Number.isInteger(totalPages))
    throw new Error('Paginação de auditoria inválida.')
  return { ...result, pagination: { ...result.pagination, totalItems, totalPages } }
}
export function parseAuditCsv(text) {
  const rows = []
  let row = [],
    cell = '',
    quoted = false
  text = text.replace(/^\uFEFF/, '')
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (char === '"') {
      if (quoted && text[i + 1] === '"') {
        cell += '"'
        i++
      } else quoted = !quoted
    } else if (char === ',' && !quoted) {
      row.push(cell)
      cell = ''
    } else if (char === '\n' && !quoted) {
      row.push(cell.replace(/\r$/, ''))
      rows.push(row)
      row = []
      cell = ''
    } else cell += char
  }
  if (cell || row.length) {
    row.push(cell.replace(/\r$/, ''))
    rows.push(row)
  }
  return rows
}
export function filterAuditCsv(text, deletionOnly = false) {
  const [header, ...rows] = parseAuditCsv(text)
  if (!header?.includes('Ação') || !header.includes('Campo'))
    throw new Error('Arquivo de auditoria inválido.')
  const action = header.indexOf('Ação'),
    field = header.indexOf('Campo')
  const cells = rows
    .filter((row) => !deletionOnly || isAuditDeletion(row[action]))
    .map((row) =>
      row.map((value, i) => {
        if (['Antes', 'Depois'].includes(header[i])) value = auditValue(row[field], value)
        return /^[=+@]|^-\D/.test(value) ? "'" + value : value
      }),
    )
  return (
    '\uFEFF' +
    [header, ...cells]
      .map((row) => row.map((value) => '"' + String(value).replace(/"/g, '""') + '"').join(','))
      .join('\r\n')
  )
}
export function createAuditService({ read, readCsv, assertCurrent = () => {} }) {
  async function all(params) {
    const rows = new Map()
    let page = 1,
      pages = 1
    do {
      assertCurrent()
      const result = validate(
        await read('admin/audit/changes', { ...params, Page: page, PageSize: 100 }),
      )
      assertCurrent()
      pages = result.pagination.totalPages
      if (pages > 10000) throw new Error('Refine o período da consulta.')
      for (const item of result.data) if (!rows.has(item.id)) rows.set(item.id, item)
      page++
    } while (page <= pages)
    return [...rows.values()]
  }
  return {
    async list(filters, page = 1, pageSize = 10) {
      const params = auditParams(filters)
      if (filters.action === 'deletion') {
        const rows = (await all(params)).filter((row) => isAuditDeletion(row.action))
        return {
          data: rows.slice((page - 1) * pageSize, page * pageSize),
          pagination: {
            totalItems: rows.length,
            totalPages: Math.max(1, Math.ceil(rows.length / pageSize)),
          },
        }
      }
      const result = validate(
        await read('admin/audit/changes', { ...params, Page: page, PageSize: pageSize }),
      )
      assertCurrent()
      return result
    },
    async modules() {
      return [...new Set((await all({})).map((row) => row.module).filter(Boolean))]
    },
    async export(filters) {
      const text = await readCsv('admin/audit/changes/export', auditParams(filters))
      assertCurrent()
      return filterAuditCsv(text, filters.action === 'deletion')
    },
    async metadata(row) {
      const paths = {
        Announcement: 'admin/announcements',
        Contract: 'admin/contracts',
        Transaction: 'admin/transactions',
      }
      if (!paths[row.resourceType] || !/^[a-f\d-]{36}$/i.test(row.resourceId || '')) return null
      try {
        const response = await read(paths[row.resourceType] + '/' + row.resourceId)
        assertCurrent()
        const value = response.data
        if (!value) return null
        return {
          label: [value.requestNumber || value.publicCode, value.name || value.title]
            .filter(Boolean)
            .join(' · '),
          currency:
            row.resourceType === 'Transaction'
              ? value.currency?.isoCode || value.currencyIsoCode
              : null,
        }
      } catch {
        assertCurrent()
        return null
      }
    },
  }
}
