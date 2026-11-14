import test from 'node:test'
import assert from 'node:assert/strict'
import {
  logicHistoryGroups,
  temporalCellText,
  temporalCellClass,
} from '../src/services/logicHistoryModel.js'

test('LG09 preserves all eight groups and distinct repeated indicator rows', () => {
  assert.equal(logicHistoryGroups.length, 8)
  const rows = logicHistoryGroups.flatMap((g) => g.rows)
  assert.equal(rows.length, 58)
  assert.equal(new Set(rows.map((r) => r.id)).size, 58)
  assert.equal(rows.filter((r) => r.label === 'Índice de abertura do dia').length, 2)
  assert.equal(rows.at(-1).label, 'Status do motor')
})

test('missing metrics never become a zero, false value, or object dump', () => {
  for (const cell of [null, undefined, false, {}, { text: null }, { text: '' }, NaN, Infinity]) {
    assert.equal(temporalCellText(cell), 'Indisponível')
    assert.deepEqual(temporalCellClass(cell), [])
  }
  assert.equal(temporalCellText(0), '0')
  assert.equal(temporalCellText({ text: 0 }), '0')
  assert.equal(temporalCellText({ text: 'Não' }), 'Não')
})

test('cell presentation accepts only explicit tones and badges without inferring financial results', () => {
  assert.deepEqual(temporalCellClass({ text: '+1,09', tone: 'positive', badge: true }), [
    'temporal-cell--positive',
    'temporal-cell--badge',
  ])
  assert.deepEqual(temporalCellClass({ text: '-0,80%', tone: 'negative' }), [
    'temporal-cell--negative',
  ])
  assert.deepEqual(
    temporalCellClass({ text: '+1,09', tone: 'unexpected-class', badge: 'true' }),
    [],
  )
  assert.deepEqual(temporalCellClass({ text: null, tone: 'positive', badge: true }), [])
  assert.equal(temporalCellText({ text: 'R$ 1.335,29' }), 'R$ 1.335,29')
})
