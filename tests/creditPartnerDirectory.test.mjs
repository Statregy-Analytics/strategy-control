import test from 'node:test'
import assert from 'node:assert/strict'
import {
  partnerProductNames,
  partnerServices,
  partnerCommission,
  partnerDirectoryMetrics,
  matchesPartnerSearch,
} from '../src/services/creditPartnerDirectory.js'

test('partner service counts distinguish unknown, empty, offered and enabled projections', () => {
  assert.deepEqual(partnerServices({}), { offered: null, enabled: null, names: null })
  assert.deepEqual(partnerServices({ products: ['Imóvel', 'Veículo'] }), {
    offered: 2,
    enabled: null,
    names: null,
  })
  assert.deepEqual(partnerServices({ products: [], enabledProducts: [] }), {
    offered: 0,
    enabled: 0,
    names: [],
  })
  assert.deepEqual(
    partnerServices({ products: ['Imóvel', 'Veículo'], enabledProducts: ['Veículo'] }),
    { offered: 2, enabled: 1, names: ['Veículo'] },
  )
})
test('partner products reject malformed projections without fabricating empty counts', () => {
  assert.equal(partnerProductNames('Imóvel'), null)
  assert.deepEqual(partnerProductNames([' Imóvel ', 'Imóvel', 'Veículo']), ['Imóvel', 'Veículo'])
  for (const invalid of [[null], [{}], [''], [false], ['Imóvel', null]])
    assert.equal(partnerProductNames(invalid), null)
  assert.equal(partnerServices({ products: [null] }).offered, null)
})

test('commission preserves explicit zero and rejects absent, boolean, negative and nonfinite input', () => {
  assert.equal(partnerCommission(0), '0,0%')
  assert.equal(partnerCommission('4.25'), '4,25%')
  for (const value of [null, undefined, '', ' ', false, true, [], {}, -1, NaN, Infinity, 'oops'])
    assert.equal(partnerCommission(value), '—')
  assert.equal(partnerCommission(null, 'Indisponível'), 'Indisponível')
})
test('partner search covers identity, codes, offered and enabled services and named rules, accent insensitive', () => {
  const row = {
    name: 'Crédito QA',
    publicCode: 'P-QA12',
    type: 'Financeira',
    products: ['Imóvel'],
    enabledProducts: ['Veículo'],
    rules: [{ name: 'Tabela São Paulo', product: 'Consórcio' }, 'Regra fixa'],
  }
  for (const query of [
    'credito',
    'qa12',
    'financeira',
    'imovel',
    'veiculo',
    'sao paulo',
    'consorcio',
    'fixa',
    '',
    null,
  ])
    assert.equal(matchesPartnerSearch(row, query), true, query)
  assert.equal(matchesPartnerSearch(row, 'ausente'), false)
})
test('malformed optional partner catalog fields never crash search', () => {
  assert.equal(
    matchesPartnerSearch({ products: 'invalid', rules: {}, enabledProducts: true }, 'a'),
    false,
  )
})

test('directory summaries preserve zero, format rates and never present invalid counts as known metrics', () => {
  assert.ok(partnerDirectoryMetrics(null).every((m) => m.value === 'Indisponível'))
  const values = partnerDirectoryMetrics({
    activePartners: 0,
    products: 12,
    validTables: -1,
    expiringTables: false,
    maxCommission: 0,
    bestConversion: 42,
  })
  assert.deepEqual(
    values.map((m) => m.value),
    ['0', '12', 'Indisponível', 'Indisponível', '0,0%', '42%'],
  )
  assert.equal(partnerDirectoryMetrics({ activePartners: 1.5 })[0].value, 'Indisponível')
})
