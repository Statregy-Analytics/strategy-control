import test from 'node:test'
import assert from 'node:assert/strict'
import { contractMovements, movementTotal } from '../src/services/contractMovements.js'
const row = {
  id: 'a',
  clientId: 'c',
  status: 'Completed',
  amount: 100,
  currencyIsoCode: 'BRL',
  source: { kind: 'Wallet', id: 'w' },
  destination: { kind: 'Contract', id: 'contract' },
}
test('only completed inflows of the selected contract/client enter contributions', () => {
  const rows = [
    row,
    { ...row, id: 'withdrawal', source: row.destination, destination: row.source },
    { ...row, id: 'pending', status: 'Pending' },
    { ...row, id: 'other', clientId: 'other' },
  ]
  assert.deepEqual(
    contractMovements(rows, 'contract', 'c').deposits.map((r) => r.id),
    ['a'],
  )
  assert.deepEqual(
    contractMovements(rows, 'contract', 'c').withdrawals.map((r) => r.id),
    ['withdrawal'],
  )
  assert.equal(contractMovements(rows, 'unrelated', 'c').deposits.length, 0)
})
test('movement totals preserve zero and never sum different currencies or missing values', () => {
  assert.equal(movementTotal([], 'BRL'), 0)
  assert.equal(movementTotal([row, { ...row, amount: 50 }], 'BRL'), 150)
  assert.equal(movementTotal([row, { ...row, currencyIsoCode: 'USD' }], 'BRL'), null)
  assert.equal(movementTotal([{ ...row, amount: null }], 'BRL'), null)
})
