import test from 'node:test'
import assert from 'node:assert/strict'
import {
  transactionMoney,
  transactionCorrection,
  correctionFundingText,
  filterTransactionRows,
  transactionEndpoint,
  transactionTone,
  transactionAmountTone,
  transactionStatusLabel,
  transactionEndpointParts,
} from '../src/services/transactionDirectoryModel.js'

test('ledger preserves known zero and rejects absent or invalid money and unknown currency', () => {
  assert.match(transactionMoney(0, 'BRL'), /0,00/)
  for (const v of [null, undefined, '', false, true, [], {}, Infinity, 'invalid'])
    assert.equal(transactionMoney(v, 'BRL'), 'Indisponível')
  assert.equal(transactionMoney(10, null), 'Indisponível')
})
test('correction association uses identifiers across the full index, never dates or equal amounts', () => {
  const rows = [
    {
      id: 'a',
      requestNumber: 'TRX-A',
      requestedAtUtc: '2026-11-10T12:00:00Z',
      amount: 50000,
      correctedByTransactionId: 'b',
    },
    { id: 'b', requestNumber: 'TRX-B', correctsTransactionId: 'a', amount: 5000 },
    { id: 'c', requestNumber: 'TRX-C', amount: 5000 },
  ]
  assert.equal(transactionCorrection(rows[1], rows).original, 'TRX-A')
  assert.ok(transactionCorrection(rows[1], rows).originalDate)
  assert.equal(transactionCorrection(rows[0], rows).correctedBy, 'TRX-B')
  assert.equal(transactionCorrection(rows[2], rows).original, '')
  assert.equal(transactionCorrection(rows[1], []).original, 'Indisponível')
})
test('funding narrative only displays complete explicitly supplied sources in a single currency', () => {
  assert.equal(correctionFundingText(null), '')
  assert.equal(correctionFundingText({ difference: 45000, currency: 'BRL', sources: [] }), '')
  const d = {
    difference: 45000,
    currency: 'BRL',
    sources: [
      { label: 'Carteira de Depósito', amount: 5000 },
      { label: 'Carteira Strategy', amount: 15000 },
      { label: 'Saque TRX-X', amount: 15000 },
      { label: 'Transferência TRX-Y', amount: 10000 },
    ],
  }
  assert.match(correctionFundingText(d), /Diferença de.*45.000,00/)
  assert.match(correctionFundingText(d), /Transferência TRX-Y/)
  assert.equal(correctionFundingText({ ...d, sources: [{ label: 'Carteira', amount: null }] }), '')
})
test('filters combine all five choices and search before pagination, including contract names and accented names', () => {
  const rows = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    clientId: 'client-a',
    clientName: 'Éric',
    type: 'Deposit',
    status: i % 2 ? 'Completed' : 'Error',
    requestNumber: 'TRX-' + i,
    createdBy: { displayName: 'Admin QA' },
    requestedAtUtc: '2026-11-18T09:00:00Z',
    destination: { contractName: 'Contrato Alpha' },
  }))
  const f = {
    search: 'eric',
    days: 7,
    type: 'Deposit',
    status: 'Completed',
    clientId: 'client-a',
    actor: 'Admin QA',
  }
  assert.equal(filterTransactionRows(rows, f, new Date('2026-11-18T20:00:00Z')).length, 10)
  assert.equal(filterTransactionRows(rows, { search: 'alpha' }).length, 20)
  assert.equal(filterTransactionRows(rows, { ...f, actor: 'Outro' }).length, 0)
  assert.equal(filterTransactionRows(rows, { ...f, clientId: 'other' }).length, 0)
})
test('period filtering excludes future, invalid and old timestamps without removing valid dates at the boundary', () => {
  const rows = [
    { requestedAtUtc: '2026-11-18T09:00:00Z' },
    { requestedAtUtc: '2026-11-30T09:00:00Z' },
    { requestedAtUtc: 'invalid' },
    { requestedAtUtc: '2025-01-01T09:00:00Z' },
  ]
  assert.equal(filterTransactionRows(rows, { days: 7 }, new Date('2026-11-18T20:00:00Z')).length, 1)
})
test('bank endpoints remain masked and transaction statuses never infer processed from unavailable data', () => {
  assert.equal(
    transactionEndpoint({
      kind: 'External',
      bankName: 'Banco QA',
      accountNumberMasked: '12345678',
    }),
    'Banco QA · ****5678',
  )
  assert.equal(transactionTone({ status: 'Completed' }), 'completed')
  assert.equal(transactionTone({ status: 'Error' }), 'negative')
  assert.notEqual(transactionTone({}), 'completed')
})

test('amount colors distinguish withdrawals, contributions and neutral movements, preserving corrected deposit group', () => {
  assert.equal(transactionAmountTone({ type: 'Withdrawal' }), 'negative')
  assert.equal(transactionAmountTone({ type: 'Yield' }), 'neutral')
  assert.equal(transactionAmountTone({ type: 'Deposit' }), 'positive')
  assert.equal(
    transactionAmountTone({ type: 'Withdrawal', correctsTransactionId: 'a' }),
    'positive',
  )
  assert.equal(transactionAmountTone({ type: 'WalletTransfer' }, true), 'positive')
})

test('transaction display labels follow the Figma states without interpreting unknown statuses', () => {
  assert.equal(transactionStatusLabel('Approved', 'Approved'), 'Aguardando execução')
  assert.equal(transactionStatusLabel('Rejected', 'Rejected'), 'Reprovada')
  assert.equal(transactionStatusLabel('Initiated', 'Initiated'), 'Iniciada')
  assert.equal(transactionStatusLabel('unknown', 'Valor real'), 'Valor real')
})

test('bank currency is displayed when known, while contract source currency is never inferred from the destination', () => {
  const row = {
    type: 'Deposit',
    currencyIsoCode: 'BRL',
    source: { kind: 'BankAccount', bankName: 'Banco QA', accountNumberMasked: '****1234' },
  }
  assert.equal(transactionEndpointParts(row, 'source').detail, '****1234 · BRL')
  const contribution = {
    type: 'ContractContribution',
    currencyIsoCode: 'USD',
    source: { kind: 'Wallet', walletType: 'Free' },
    destination: { kind: 'Contract', contractName: 'Contrato QA' },
  }
  assert.equal(transactionEndpointParts(contribution, 'source').detail, '')
  assert.equal(
    transactionEndpointParts(
      { ...contribution, conversion: { sourceCurrencyIsoCode: 'BRL' } },
      'source',
    ).detail,
    'BRL',
  )
})
