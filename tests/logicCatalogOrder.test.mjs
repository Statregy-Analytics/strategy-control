import test from 'node:test'
import assert from 'node:assert/strict'
import { canOrderLogicCatalog, orderLogicCatalog } from '../src/services/logicCatalogOrder.js'

test('logic dates require a nonempty complete set of valid timestamps', () => {
  for (const rows of [
    [],
    null,
    [{ createdAtUtc: null }],
    [{ createdAtUtc: '' }],
    [{ createdAtUtc: 0 }],
    [{ createdAtUtc: '0' }],
    [{ createdAtUtc: 'invalid' }],
    [{ createdAtUtc: '2026-11-01T00:00:00Z' }, {}],
  ]) {
    assert.equal(canOrderLogicCatalog(rows, 'recent'), false)
  }
  assert.equal(canOrderLogicCatalog([{ createdAtUtc: '1970-01-01T00:00:00Z' }], 'oldest'), true)
  assert.equal(
    canOrderLogicCatalog([{ createdAtUtc: '2026-11-01T00:00:00Z' }], 'performance'),
    false,
  )
})

test('creation ordering ignores catalog edits and preserves source and ties', () => {
  const rows = [
    { id: 'old', createdAtUtc: '2026-01-01T00:00:00Z', updatedAtUtc: '2026-12-01T00:00:00Z' },
    { id: 'new', createdAtUtc: '2026-11-01T00:00:00Z', updatedAtUtc: '2026-11-01T00:00:00Z' },
    { id: 'tie', createdAtUtc: '2026-11-01T00:00:00Z', updatedAtUtc: '2026-11-01T00:00:00Z' },
  ]
  assert.deepEqual(
    orderLogicCatalog(rows, 'recent').map((r) => r.id),
    ['new', 'tie', 'old'],
  )
  assert.deepEqual(
    orderLogicCatalog(rows, 'oldest').map((r) => r.id),
    ['old', 'new', 'tie'],
  )
  assert.deepEqual(
    orderLogicCatalog(rows, 'updated').map((r) => r.id),
    ['old', 'new', 'tie'],
  )
  assert.deepEqual(
    rows.map((r) => r.id),
    ['old', 'new', 'tie'],
  )
})

test('unknown dates preserve order and never fall back to a different date field', () => {
  const rows = [
    { id: 'unknown', createdAtUtc: null, updatedAtUtc: '2026-11-01T00:00:00Z' },
    { id: 'known', createdAtUtc: '2026-11-01T00:00:00Z', updatedAtUtc: null },
  ]
  assert.deepEqual(orderLogicCatalog(rows, 'recent'), rows)
  assert.deepEqual(orderLogicCatalog(rows, 'updated'), rows)
  assert.notEqual(orderLogicCatalog(rows, 'recent'), rows)
})
