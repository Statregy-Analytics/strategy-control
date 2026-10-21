import { test } from 'node:test'
import assert from 'node:assert/strict'
import { customerSearchParams } from '../src/services/customerSearch.js'

test('email uses contact without a simultaneous name constraint', () => {
  assert.deepEqual(customerSearchParams(' qa@example.com '), { name: undefined, contact: 'qa@example.com' })
  assert.deepEqual(customerSearchParams('qa', 'contact'), { name: undefined, contact: 'qa' })
  assert.deepEqual(customerSearchParams('@example', 'name'), { name: undefined, contact: '@example' })
})
test('names retain the independent contact filter; clearing search removes its constraint', () => {
  assert.deepEqual(customerSearchParams(' Ana ', 'name', ' example.com '), { name: 'Ana', contact: 'example.com' })
  assert.deepEqual(customerSearchParams(null, 'contact'), { name: undefined, contact: undefined })
})
