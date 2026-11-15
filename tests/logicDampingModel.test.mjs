import test from 'node:test'
import assert from 'node:assert/strict'
import { dampingRows, dampingPercent, dampingTone } from '../src/services/logicDampingModel.js'

test('absent damping values keep the five design ranges without numerical examples', () => {
  const rows = dampingRows(null)
  assert.equal(rows.length, 5)
  assert.deepEqual(
    rows.map((r) => r.label),
    ['Centro', 'Próximo do teto', 'Extremo superior', 'Próximo do piso', 'Extremo inferior'],
  )
  for (const row of rows)
    for (const field of ['from', 'to', 'positive', 'negative']) {
      assert.equal(dampingPercent(row[field]), 'Indisponível')
      assert.equal(dampingTone(row[field]), null)
    }
})

test('damping percentages preserve zero and signed bounds without coercing missing data', () => {
  assert.equal(dampingPercent(0, true), '0,00%')
  assert.equal(dampingPercent(0.4, true), '+0,40%')
  assert.equal(dampingPercent(-0.4, true), '-0,40%')
  assert.equal(dampingPercent(50), '50%')
  assert.equal(dampingPercent(0), '0%')
  assert.equal(dampingTone(0.4), 'positive')
  assert.equal(dampingTone(-0.4), 'negative')
  assert.equal(dampingTone(0), null)
  for (const value of [null, undefined, '', '0', false, {}, NaN, Infinity]) {
    assert.equal(dampingPercent(value), 'Indisponível')
    assert.equal(dampingTone(value), null)
  }
})

test('presentation values preserve supplied cells without replacing range identity or source', () => {
  const values = {
    center: { key: 'other', label: 'Wrong', from: 0, to: 0.4, positive: 0, negative: 100 },
    extra: { from: 9 },
  }
  const rows = dampingRows(values)
  assert.equal(rows.length, 5)
  assert.equal(rows[0].key, 'center')
  assert.equal(rows[0].label, 'Centro')
  assert.equal(rows[0].from, 0)
  assert.equal(rows[0].positive, 0)
  assert.equal(values.center.label, 'Wrong')
  rows[0].from = 42
  assert.equal(values.center.from, 0)
})
