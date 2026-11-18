import test from 'node:test'
import assert from 'node:assert/strict'
import {
  logicNumber,
  logicCount,
  logicState,
  logicIndex,
  logicPercent,
  logicDate,
  canSortLogic,
  filterLogicDirectory,
} from '../src/services/logicDirectoryModel.js'
test('catalog selectability is never treated as operational activity or known zero', () => {
  assert.equal(logicState({ isSelectable: true }.status), null)
  for (const n of [null, undefined, '', false, 'invalid']) {
    assert.equal(logicNumber(n), null)
    assert.equal(logicIndex(n), 'Indisponível')
    assert.equal(logicPercent(n), 'Indisponível')
  }
  assert.equal(logicIndex(0), '0,0000')
  assert.equal(logicPercent(-1.25), '-1,25%')
  assert.equal(logicPercent('3.25'), '+3,25%')
  assert.equal(logicDate('0'), 'Indisponível')
})
test('operational ordering requires complete real metrics and never uses catalog edits', () => {
  const rows = [
    { id: 'a', createdAtUtc: '2026-01-01T00:00:00Z', updatedAtUtc: '2099-01-01T00:00:00Z' },
    { id: 'b', createdAtUtc: '2026-11-01T00:00:00Z' },
  ]
  assert.equal(canSortLogic(rows, {}, 'updated'), false)
  assert.equal(canSortLogic(rows, { a: { links: 1 }, b: { links: null } }, 'links'), false)
  for (const n of [-1, 1.2, false])
    assert.equal(canSortLogic(rows, { a: { links: n }, b: { links: 0 } }, 'links'), false)
  assert.equal(canSortLogic(rows, { a: { interval: 0 }, b: { interval: 1 } }, 'interval'), false)
  assert.equal(canSortLogic(rows, {}, 'recent'), true)
  assert.deepEqual(
    filterLogicDirectory(rows, {}, { sort: 'recent' }).map((r) => r.id),
    ['b', 'a'],
  )
  assert.deepEqual(
    rows.map((r) => r.id),
    ['a', 'b'],
  )
  assert.deepEqual(
    filterLogicDirectory(rows, {}, { sort: 'performance' }).map((r) => r.id),
    ['a', 'b'],
  )
})
test('filters combine accented search, operational status and confirmed link counts', () => {
  const rows = [
    { id: 'a', name: 'Éric', status: 'Active' },
    { id: 'b', name: 'Éric', status: 'Paused' },
    { id: 'c', name: 'Éric', isSelectable: true },
  ]
  const metrics = {
    a: { links: 0, performancePercent: -2 },
    b: { links: 2, performancePercent: 1 },
  }
  assert.deepEqual(
    filterLogicDirectory(rows, metrics, {
      search: 'eric',
      status: 'active',
      links: 'unlinked',
    }).map((r) => r.id),
    ['a'],
  )
  assert.deepEqual(
    filterLogicDirectory(rows, metrics, { links: 'linked' }).map((r) => r.id),
    ['b'],
  )
  assert.equal(canSortLogic(rows, metrics, 'performance'), false)
  assert.deepEqual(
    filterLogicDirectory(rows.slice(0, 2), metrics, { sort: 'performance' }).map((r) => r.id),
    ['b', 'a'],
  )
})

test('confirmed count never turns invalid metadata into a numeric zero', () => {
  assert.equal(logicCount(0), 0)
  assert.equal(logicCount('2'), 2)
  for (const n of [null, false, '', -1, 1.5]) assert.equal(logicCount(n), 'Indisponível')
})
