// Scope asynchronous UI effects to the owner and lifetime that started them.
export function createRequestContext(owner = () => '') {
  let revision = 0,
    disposed = false
  return {
    capture() {
      const version = revision,
        key = owner()
      return () => !disposed && version === revision && key === owner()
    },
    invalidate() {
      revision++
    },
    dispose() {
      disposed = true
      revision++
    },
  }
}
export async function readCurrentPages(readPage, active, collection = (value) => value.data || []) {
  const rows = []
  let page = 1,
    totalPages = 1
  do {
    if (!active()) return null
    const result = await readPage(page)
    if (!active()) return null
    if (result?.success === false) throw Error('Consulta indisponível.')
    const items = collection(result)
    if (!Array.isArray(items)) throw Error('Consulta indisponível.')
    rows.push(...items)
    totalPages = Math.max(1, Number(result.pagination?.totalPages ?? 1))
    if (!Number.isInteger(totalPages) || totalPages > 10000) throw Error('Refine a consulta.')
    page++
  } while (page <= totalPages)
  return rows
}
