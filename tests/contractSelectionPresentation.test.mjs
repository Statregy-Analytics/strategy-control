import test from 'node:test'
import assert from 'node:assert/strict'
import {
  contractSelectionStatus,
  contractUniverseParts,
} from '../src/services/contractSelectionModel.js'
test('draft is not presented as active merely because its configured business status is active', () => {
  assert.deepEqual(
    contractSelectionStatus({
      registrationStatus: 'Draft',
      businessStatus: { code: 'ACTIVE', name: 'Ativo' },
    }),
    { label: 'Rascunho', tone: 'inactive' },
  )
  assert.deepEqual(
    contractSelectionStatus({
      registrationStatus: 'Created',
      businessStatus: { code: 'ACTIVE', name: 'Ativo' },
    }),
    { label: 'Ativo', tone: 'active' },
  )
  assert.equal(
    contractSelectionStatus({ businessStatus: { code: 'BLOCKED', name: 'Bloqueado' } }).tone,
    'blocked',
  )
  assert.equal(
    contractSelectionStatus({ businessStatus: { code: 'UNDER_ANALYSIS', name: 'Em análise' } })
      .tone,
    'analysis',
  )
  assert.deepEqual(
    contractSelectionStatus({ businessStatus: { code: 'NEW_SERVER_STATE', name: 'Estado real' } }),
    { label: 'Estado real', tone: 'inactive' },
  )
  assert.deepEqual(contractSelectionStatus({}), { label: '—', tone: 'inactive' })
})
test('asset universe preserves API zero and numeric strings while absent or invalid counters stay unavailable', () => {
  assert.deepEqual(
    contractUniverseParts({
      assetUniverseSummary: { assetCount: 0, marketCount: '1', currencyCount: '2' },
    }),
    { assets: '0 ativos', markets: '1 mercado', currencies: '2 moedas' },
  )
  for (const value of [null, undefined, '', false, -1, 1.2, 'não informado'])
    assert.deepEqual(
      contractUniverseParts({
        assetUniverseSummary: { assetCount: value, marketCount: value, currencyCount: value },
      }),
      { assets: '—', markets: '—', currencies: '—' },
    )
  assert.deepEqual(contractUniverseParts({}), { assets: '—', markets: '—', currencies: '—' })
})
