import test from 'node:test'
import assert from 'node:assert/strict'
import { customerDisplayName } from '../src/services/customerPresentation.js'
import { bankLogo } from '../src/services/bankBrand.js'
import { statementTypePresentation } from '../src/services/customerPortfolioPresentation.js'
test('client display normalizes mixed case and accents without rewriting the source', () => {
  const row = { displayName: "  ÉRIC VICENTE D'ÁVILA-SILVA  " }
  assert.equal(customerDisplayName(row.displayName), "Éric Vicente D'Ávila-Silva")
  assert.equal(row.displayName, "  ÉRIC VICENTE D'ÁVILA-SILVA  ")
  assert.equal(customerDisplayName(null), 'Sem nome')
})
test('bank branding uses the catalogue code and leaves unknown banks to initials', () => {
  assert.equal(bankLogo('341'), '/icons/banks/itau.png')
  assert.equal(bankLogo(33), '/icons/banks/santander.png')
  assert.equal(bankLogo('349'), null)
  assert.equal(bankLogo(null), null)
  assert.equal(bankLogo('Itaú'), null)
})
test('statement types use distinct presentations without treating every contract operation as a lock', () => {
  assert.equal(statementTypePresentation('Deposit').tone, 'contribution')
  assert.equal(statementTypePresentation('Withdrawal').tone, 'withdrawal')
  assert.equal(statementTypePresentation('WalletTransfer').tone, 'transfer')
  assert.equal(statementTypePresentation('Yield').tone, 'yield')
  assert.equal(statementTypePresentation('Lock').tone, 'lock')
  assert.deepEqual(statementTypePresentation('ContractOperation'), {
    label: 'Operação de contrato',
    icon: null,
    tone: 'neutral',
  })
  assert.equal(statementTypePresentation('FutureType').label, 'FutureType')
})
