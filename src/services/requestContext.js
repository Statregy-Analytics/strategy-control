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
    rows.push(...collection(result))
    totalPages = Number(result.pagination?.totalPages || 1)
    page++
  } while (page <= totalPages)
  return rows
}
