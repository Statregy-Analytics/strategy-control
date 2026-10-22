import { test } from 'node:test'
import assert from 'node:assert/strict'
import { customerSearchParams } from '../src/services/customerSearch.js'

test('unified search sends names, emails, customer IDs and document numbers without intersecting a name filter', () => {
  for (const value of ['qa@example.com', 'Ana', 'customer-id', '00000000000', 'Assessor QA']) {
    assert.deepEqual(customerSearchParams(` ${value} `), { search: value, contact: undefined })
  }
  assert.deepEqual(customerSearchParams('qa', 'contact'), { search: 'qa', contact: undefined })
})
test('independent contact filter and empty search retain their existing semantics', () => {
  assert.deepEqual(customerSearchParams(' Ana ', 'name', ' example.com '), { search: 'Ana', contact: 'example.com' })
  assert.deepEqual(customerSearchParams(null, 'contact'), { search: undefined, contact: undefined })
})
