import test from 'node:test'
import assert from 'node:assert/strict'
import { validateDebtForm } from '../src/services/contractDebtModel.js'
const valid = {
  name: 'Dívida fictícia',
  creditor: 'Credor fictício',
  kind: 'Test',
  clientId: 'client',
  startDate: '2026-01-01',
  paymentStartDate: '2026-02-01',
  dueDate: '2026-03-15',
  principalAmount: 100,
  outstandingAmount: 120,
  installmentAmount: 10,
  monthlyInterest: 1,
  installment: 2,
  totalInstallments: 12,
  dueDay: 15,
  amortization: 'test',
  status: 'test',
}
test('debt validation allows accrued balance greater than initial principal', () =>
  assert.equal(validateDebtForm(valid), ''))
test('debt validates real calendar dates, amounts and installment bounds', () => {
  for (const changes of [
    { startDate: '2026-02-31' },
    { dueDate: '' },
    { monthlyInterest: Infinity },
    { installment: 13 },
    { dueDay: 32 },
    { principalAmount: '' },
  ])
    assert.notEqual(validateDebtForm({ ...valid, ...changes }), '')
})
test('debt requires approved catalogs instead of guessing kind or amortization', () => {
  assert.notEqual(validateDebtForm({ ...valid, kind: null }), '')
  assert.notEqual(validateDebtForm({ ...valid, amortization: null }), '')
})
