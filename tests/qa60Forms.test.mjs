import test from 'node:test'
import assert from 'node:assert/strict'
import {
  assetDocumentSlots,
  persistAssetDocuments,
  validateAssetFile,
} from '../src/services/assetDocuments.js'
import { assetEditorSections, assetExpandedFacts } from '../src/services/clientAssetProfile.js'
import {
  sectionValues,
  sectionPlan,
  sectionEditable,
  sectionValidation,
} from '../src/services/clientSectionModel.js'
const file = () =>
  new File(['fictitious QA document'], 'qa-ficticio.pdf', { type: 'application/pdf' })
test('asset document validation rejects empty, unsupported and oversized files before writing', () => {
  assert.doesNotThrow(() => validateAssetFile(file()))
  for (const value of [
    null,
    { type: 'text/plain', size: 4 },
    { type: 'application/pdf', size: 0 },
    { type: 'application/pdf', size: 26214401 },
  ])
    assert.throws(() => validateAssetFile(value))
})
test('partial document link retry reuses the uploaded file and only unlinks relationships after successful uploads', async () => {
  const items = [{ file: file(), documentTypeId: 'type' }],
    removed = new Set(['old']),
    calls = []
  let fail = true
  const input = {
    items,
    removed,
    customerId: 'customer',
    assetId: 'asset',
    active: () => true,
    upload: async () => {
      calls.push('upload')
      return { id: 'new' }
    },
    link: async () => {
      calls.push('link')
      if (fail) throw Error('temporary')
    },
    unlink: async (c, a, id) => calls.push('unlink:' + id),
  }
  await assert.rejects(persistAssetDocuments(input))
  assert.equal(items[0].documentId, 'new')
  assert.equal(removed.size, 1)
  fail = false
  await persistAssetDocuments(input)
  await persistAssetDocuments(input)
  assert.deepEqual(calls, ['upload', 'link', 'link', 'unlink:old'])
  assert.equal(removed.size, 0)
})
test('leaving during upload prevents linking a file to another customer asset', async () => {
  let active = true,
    linked = false
  await assert.rejects(
    persistAssetDocuments({
      items: [{ file: file(), documentTypeId: 'type' }],
      removed: new Set(),
      customerId: 'c',
      assetId: 'a',
      active: () => active,
      upload: async () => {
        active = false
        return { id: 'uploaded' }
      },
      link: async () => {
        linked = true
      },
      unlink: async () => {},
    }),
  )
  assert.equal(linked, false)
})
test('all four approved asset editors contain the existing HTTP fields without simulating unsupported features', () => {
  for (const type of ['RealEstate', 'Vehicle', 'Consortium', 'Investment'])
    assert.ok(assetEditorSections(type).length)
  assert.ok(assetDocumentSlots('RealEstate').some((s) => s.code === 'CND_CONDOMINIO'))
  const c = assetExpandedFacts({
    assetType: 'Consortium',
    declaredValue: 0,
    remainingBalance: 0,
    consortium: {
      quotaStatus: 'Contemplado',
      amountPaid: 0,
      paidInstallments: 0,
      totalInstallments: 60,
    },
  })
  assert.equal(c.find((f) => f.label === 'Valor pago').value, 0)
  assert.equal(c.find((f) => f.label === 'Data contemplação').value, 'Não informado')
  assert.equal(c.find((f) => f.label === 'Carta liberada').value, null)
})
test('C32 separate city, state and country persist through the original address contract and retain other addresses', () => {
  const source = {
    customerId: 'c',
    birthDate: null,
    names: [],
    contacts: [],
    addresses: [
      {
        id: 'home',
        kind: 'Residential',
        line1: 'Rua QA',
        city: 'Cidade',
        stateOrProvince: 'SP',
        countryId: 'br',
        isPrimary: true,
      },
      { id: 'office', kind: 'Business', line1: 'Rua outra', city: 'Outra', countryId: 'br' },
    ],
  }
  const original = sectionValues('identification', source),
    draft = { ...original, city: 'Lisboa', stateOrProvince: 'Lisboa', countryId: 'pt' }
  const [step] = sectionPlan('identification', source, draft, original)
  assert.equal(step.path, 'admin/customers/c/addresses')
  assert.equal(step.payload.addresses[0].city, 'Lisboa')
  assert.equal(step.payload.addresses[0].countryId, 'pt')
  assert.equal(step.payload.addresses[1].line1, 'Rua outra')
  assert.ok(step.fields.includes('city'))
  assert.ok(step.fields.includes('countryId'))
  assert.equal(source.addresses[0].countryId, 'br')
})

test('C32 can add the first residential address with the existing collection contract and leaves unrelated edits unblocked', () => {
  const source = {
      customerId: 'c',
      kind: 'Person',
      birthDate: null,
      names: [],
      contacts: [],
      addresses: [],
    },
    original = sectionValues('identification', source)
  assert.ok(sectionEditable('identification', source).includes('countryId'))
  assert.deepEqual(sectionValidation('identification', original, source), {})
  const draft = {
    ...original,
    line1: 'Rua Fictícia QA',
    city: 'Cidade QA',
    stateOrProvince: 'SP',
    countryId: 'br',
  }
  assert.deepEqual(sectionValidation('identification', draft, source), {})
  const [step] = sectionPlan('identification', source, draft, original)
  assert.equal(step.payload.addresses[0].id, null)
  assert.equal(step.payload.addresses[0].kind, 'Residential')
  assert.equal(step.payload.addresses[0].city, 'Cidade QA')
  assert.equal(source.addresses.length, 0)
})
