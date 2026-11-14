import { test } from 'node:test'
import assert from 'node:assert/strict'
import { logicRuleResults } from '../src/services/adminWorkspaceModel.js'
test('missing and invalid boundaries never receive a passed check', () => {
  const rules = logicRuleResults({ positive: 50, negative: 50 })
  assert.deepEqual(
    rules.map((x) => x.valid),
    [false, false, false, false, true],
  )
  assert.equal(
    logicRuleResults({ intensity: 1, dailyCeiling: 1, monthlyCeiling: 5 })[0].valid,
    false,
  )
  assert.equal(logicRuleResults({ intensity: 1, dailyFloor: 2 })[1].valid, false)
})
test('valid hierarchy respects negative floors and probability total', () => {
  const f = {
    intensity: 1,
    dailyCeiling: 2,
    monthlyCeiling: 5,
    dailyFloor: -2,
    monthlyFloor: -5,
    positive: 60,
    negative: 40,
  }
  assert.ok(logicRuleResults(f).every((x) => x.valid))
  assert.equal(logicRuleResults({ ...f, positive: 61 })[4].valid, false)
  assert.equal(logicRuleResults({ ...f, dailyFloor: -5 })[3].valid, false)
})
