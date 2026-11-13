import test from 'node:test'
import assert from 'node:assert/strict'
import { contractEndDate } from '../src/services/financeModels.js'
test('contract terms clamp month ends and leap years without subtracting a day', () => {
  assert.equal(contractEndDate('2026-01-01', { value: 1, unit: 'Year' }), '2027-01-01')
  assert.equal(contractEndDate('2024-02-29', { value: 1, unit: 'Year' }), '2025-02-28')
  assert.equal(contractEndDate('2026-01-31', { value: 1, unit: 'Month' }), '2026-02-28')
  assert.equal(contractEndDate('2026-12-31', { value: 2, unit: 'Day' }), '2027-01-02')
  assert.equal(contractEndDate('2026-02-30', { value: 1, unit: 'Year' }), null)
  assert.equal(contractEndDate('2026-01-01', { value: 0, unit: 'Year' }), null)
})
