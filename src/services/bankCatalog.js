// Read the paged HTTP catalog completely before exposing it to either profile view.
export async function readBankCatalog(readPage, assertCurrent = () => {}) {
  const banks = [],
    ids = new Set()
  let expectedPages, expectedItems
  const invalid = () =>
    new Error('Não foi possível carregar o catálogo completo de bancos. Tente novamente.')
  for (let page = 1; ; page++) {
    assertCurrent()
    const result = await readPage({ page, pageSize: 200 })
    assertCurrent()
    const meta = result?.pagination
    const pages = Number(meta?.totalPages),
      items = Number(meta?.totalItems)
    const validCount = (value) =>
      (typeof value === 'number' || (typeof value === 'string' && /^\d+$/.test(value))) &&
      Number.isSafeInteger(Number(value))
    if (
      result?.success === false ||
      !Array.isArray(result?.data) ||
      !meta ||
      Number(meta.page) !== page ||
      !validCount(meta.totalPages) ||
      pages < 0 ||
      !validCount(meta.totalItems) ||
      items < 0 ||
      (items > 0 && pages === 0)
    )
      throw invalid()
    if (page === 1) {
      expectedPages = pages
      expectedItems = items
    }
    if (pages !== expectedPages || items !== expectedItems) throw invalid()
    for (const bank of result.data) {
      if (!bank?.id || ids.has(bank.id)) throw invalid()
      ids.add(bank.id)
      banks.push(bank)
    }
    if (banks.length > items) throw invalid()
    if (page >= pages) {
      if (banks.length !== items) throw invalid()
      return banks
    }
    if (!result.data.length) throw invalid()
  }
}
