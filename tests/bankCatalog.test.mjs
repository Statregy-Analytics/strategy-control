import test from 'node:test'
import assert from 'node:assert/strict'
import { readBankCatalog } from '../src/services/bankCatalog.js'
const envelope = (page, data, totalItems = 513, totalPages = 3) => ({
  success: true,
  data,
  pagination: { page, totalItems, totalPages },
})
const rows = Array.from({ length: 513 }, (_, i) => ({ id: `bank-${i}`, name: `Bank ${i}` }))
test('reads all 513 banks and resolves banks beyond the first page', async () => {
  const calls = []
  const banks = await readBankCatalog(async (params) => {
    calls.push(params)
    return envelope(params.page, rows.slice((params.page - 1) * 200, params.page * 200))
  })
  assert.deepEqual(
    calls.map((x) => x.page),
    [1, 2, 3],
  )
  assert.ok(calls.every((x) => x.pageSize === 200))
  assert.equal(banks.length, 513)
  assert.equal(banks[512].id, 'bank-512')
})
test('empty catalog is accepted only when totals are consistent', async () => {
  assert.deepEqual(await readBankCatalog(async () => envelope(1, [], 0, 0)), [])
  await assert.rejects(readBankCatalog(async () => envelope(1, [], 1, 1)))
})
test('a later network failure never publishes a partial catalog and retry starts over', async () => {
  await assert.rejects(
    readBankCatalog(async ({ page }) => {
      if (page === 2) throw Error('network')
      return envelope(page, rows.slice(0, 200))
    }),
    /network/,
  )
  const banks = await readBankCatalog(async ({ page }) =>
    envelope(page, rows.slice((page - 1) * 200, page * 200)),
  )
  assert.equal(banks.length, 513)
})
test('rejects duplicates, missing pages, changing totals and unsuccessful envelopes', async () => {
  for (const invalid of [
    envelope(2, rows.slice(0, 200)),
    envelope(2, [], 513, 3),
    envelope(2, rows.slice(200, 400), 514, 3),
    envelope(2, rows.slice(200, 400), 513, 4),
    { ...envelope(2, rows.slice(200, 400)), success: false },
    envelope(3, rows.slice(200, 400)),
    envelope(2, [{ name: 'missing id' }]),
    { data: rows },
  ])
    await assert.rejects(
      readBankCatalog(async ({ page }) => (page === 1 ? envelope(1, rows.slice(0, 200)) : invalid)),
    )
})
