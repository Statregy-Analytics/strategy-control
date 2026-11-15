import test from 'node:test'
import assert from 'node:assert/strict'
import {
  probabilityState,
  probabilityLabel,
  probabilityNumber,
} from '../src/services/logicProbabilityModel.js'
import { validateLogic, logicRuleResults } from '../src/services/adminWorkspaceModel.js'

test('unknown probability never turns into zero, a red total or a drawn distribution', () => {
  for (const missing of [null, undefined, '', ' ', false, {}, NaN, Infinity, 'invalid']) {
    const state = probabilityState(missing, 50)
    assert.equal(state.valid, null)
    assert.equal(state.total, null)
    assert.equal(state.drawable, false)
    assert.equal(state.positiveWidth, null)
    assert.equal(probabilityLabel(state.total), 'Indisponível')
  }
  assert.equal(probabilityNumber(''), null)
  assert.equal(probabilityNumber('50'), 50)
  assert.equal(probabilityState('0', '100').positive, 0)
  assert.equal(probabilityState(' 50 ', '50').valid, true)
})

test('valid and invalid totals keep original probabilities and normalize only graphic widths', () => {
  const valid = probabilityState(50, 50)
  assert.equal(valid.valid, true)
  assert.equal(valid.positiveWidth, 50)
  const invalid = probabilityState(60, 50)
  assert.equal(invalid.valid, false)
  assert.equal(invalid.total, 110)
  assert.equal(invalid.positive, 60)
  assert.equal(invalid.negative, 50)
  assert.ok(Math.abs(invalid.positiveWidth - 6000 / 110) < 1e-10)
  assert.equal(invalid.positiveWidth + invalid.negativeWidth, 100)
  assert.equal(probabilityState(0, 100).positiveWidth, 0)
  assert.equal(probabilityState(100, 0).negativeWidth, 0)
  assert.equal(probabilityState(0, 0).valid, false)
  assert.equal(probabilityState(0, 0).drawable, false)
  assert.equal(probabilityState(101, -1).rangeInvalid, true)
  assert.equal(probabilityState(101, -1).drawable, false)
})

test('display, save validation and validation modal share the probability decision', () => {
  const base = {
    name: 'QA',
    currency: 'BRL',
    engineType: 'test',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    initialIndex: 100,
    target: 5,
    interval: '1h',
    dailyFloor: -0.8,
    dailyCeiling: 0.8,
    monthlyFloor: -8,
    monthlyCeiling: 8,
    intensity: 0.1,
  }
  for (const [positive, negative] of [
    [50, 50],
    [60, 50],
    [33.3, 66.7],
    [0, 100],
    [100, 0],
    [101, -1],
    [' ', 100],
    [false, 100],
    [null, 50],
  ]) {
    const form = { ...base, positive, negative }
    const valid = probabilityState(positive, negative).valid === true
    assert.equal(validateLogic(form) === '', valid)
    assert.equal(logicRuleResults(form)[4].valid, valid)
  }
})
