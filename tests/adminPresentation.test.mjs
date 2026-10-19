import test from 'node:test'
import assert from 'node:assert/strict'
import { customerTimelineTitle } from '../src/services/customerTimelinePresentation.js'
import {
  bankCountryName,
  bankCountryOptions,
  readCountryCatalog,
} from '../src/services/countryCatalog.js'

test('timeline distinguishes archive from review even when both use DocumentReviewed', () => {
  assert.equal(
    customerTimelineTitle({ title: 'Document archived', eventType: 'DocumentReviewed' }),
    'Documento arquivado',
  )
  assert.equal(
    customerTimelineTitle({ title: 'Document reviewed', eventType: 'DocumentReviewed' }),
    'Documento revisado',
  )
  assert.equal(
    customerTimelineTitle({ title: 'Customer created', eventType: 'Created' }),
    'Cliente cadastrado',
  )
  assert.equal(
    customerTimelineTitle({ title: 'Customer preferences updated', eventType: 'Updated' }),
    'Preferências do cliente atualizadas',
  )
})
test('timeline preserves custom text and original audit data', () => {
  const event = {
    title: 'Cliente pediu retorno amanhã',
    description: 'Customer created',
    actorName: 'Teste',
    occurredAtUtc: '2026-10-19T12:00:00Z',
  }
  const original = structuredClone(event)
  assert.equal(customerTimelineTitle(event), event.title)
  assert.deepEqual(event, original)
  assert.equal(customerTimelineTitle({ title: '__proto__' }), '__proto__')
})
test('missing titles use Portuguese labels without exposing unknown event codes', () => {
  assert.equal(
    customerTimelineTitle({ eventType: 'FinancialProfileChanged' }),
    'Perfil financeiro atualizado',
  )
  assert.equal(customerTimelineTitle({ eventType: 'InternalNewEvent' }), 'Evento registrado')
  assert.equal(customerTimelineTitle({ eventType: 'constructor' }), 'Evento registrado')
})
const countries = [
  { id: 'country-br', isoCode: 'BR', name: 'Brazil', isActive: true },
  { id: 'country-pt', isoCode: 'PT', name: 'Portugal', isActive: true },
  { id: 'country-inactive', name: 'Inativo', isActive: false },
]
test('bank country labels use the real catalog and do not fall back to UUIDs', () => {
  assert.equal(bankCountryName({ countryId: 'country-br' }, countries), 'Brasil')
  assert.equal(bankCountryName({ countryId: 'country-inactive' }, countries), 'Inativo')
  assert.equal(bankCountryName({ countryId: 'missing-id' }, countries), 'País indisponível')
  assert.equal(bankCountryName({}, countries), 'Não informado')
})
test('country selector excludes inactive countries and preserves IDs as values', () => {
  const original = structuredClone(countries)
  assert.deepEqual(bankCountryOptions(countries), [
    { label: 'Brasil', value: 'country-br' },
    { label: 'Portugal', value: 'country-pt' },
  ])
  assert.deepEqual(countries, original)
})
test('country catalog follows pagination and deduplicates IDs', async () => {
  const calls = []
  const result = await readCountryCatalog(async (params) => {
    calls.push(params)
    return {
      success: true,
      data: params.page === 1 ? countries.slice(0, 1) : countries,
      pagination: { totalPages: 2, hasNextPage: params.page === 1 },
    }
  })
  assert.deepEqual(result, countries)
  assert.deepEqual(
    calls.map((call) => call.page),
    [1, 2],
  )
})
test('country catalog never reports a failed partial collection as complete', async () => {
  await assert.rejects(
    readCountryCatalog(async ({ page }) => {
      if (page === 2) throw Error('Falha')
      return {
        success: true,
        data: countries.slice(0, 1),
        pagination: { totalPages: 2, hasNextPage: true },
      }
    }),
    /Falha/,
  )
  await assert.rejects(
    readCountryCatalog(async () => ({ success: false, data: [] })),
    /Não foi possível/,
  )
})
test('empty country catalog and inconsistent pagination are distinct', async () => {
  await assert.rejects(
    readCountryCatalog(async () => ({
      data: countries,
      pagination: { totalPages: 2, hasNextPage: false },
    })),
    /inconsistente/,
  )
  assert.deepEqual(
    await readCountryCatalog(async () => ({ data: [], pagination: { hasNextPage: false } })),
    [],
  )
  await assert.rejects(
    readCountryCatalog(async () => ({ data: [], pagination: { hasNextPage: true } })),
    /inconsistente/,
  )
})
