import test from 'node:test'
import assert from 'node:assert/strict'
import { logicIntensityConstraint } from '../src/services/adminWorkspaceModel.js'

test('incomplete or malformed engine parameters do not manufacture an intensity alert', () => {
  const ready = { intensity: 0.1, dailyCeiling: 0.8, dailyFloor: -0.8 }
  for (const key of Object.keys(ready)) {
    for (const value of [null, undefined, '', ' ', false, true, {}, NaN, Infinity, 'invalid'])
      assert.equal(logicIntensityConstraint({ ...ready, [key]: value }), null)
  }
  assert.equal(logicIntensityConstraint({}), null)
})

test('collapsed warning uses the existing strict positive and negative daily rules', () => {
  assert.equal(
    logicIntensityConstraint({ intensity: 0, dailyCeiling: 0.8, dailyFloor: -0.8 }),
    true,
  )
  assert.equal(
    logicIntensityConstraint({ intensity: '0.1', dailyCeiling: '0.8', dailyFloor: '-0.8' }),
    true,
  )
  assert.equal(
    logicIntensityConstraint({ intensity: 0.8, dailyCeiling: 0.8, dailyFloor: -1 }),
    false,
  )
  assert.equal(
    logicIntensityConstraint({ intensity: 0.8, dailyCeiling: 1, dailyFloor: -0.8 }),
    false,
  )
  assert.equal(logicIntensityConstraint({ intensity: 1.2, dailyCeiling: 1, dailyFloor: -1 }), false)
})

test('invalid signs are left to configuration validation rather than mislabeled as a limit comparison', () => {
  assert.equal(
    logicIntensityConstraint({ intensity: -0.1, dailyCeiling: 0.8, dailyFloor: -0.8 }),
    null,
  )
  assert.equal(
    logicIntensityConstraint({ intensity: 0.1, dailyCeiling: -0.8, dailyFloor: -0.8 }),
    null,
  )
  assert.equal(
    logicIntensityConstraint({ intensity: 0.1, dailyCeiling: 0.8, dailyFloor: 0.8 }),
    null,
  )
})
