import test from 'node:test'
import assert from 'node:assert/strict'
import {
  profileDocumentMetrics,
  profileDocumentSections,
  projectClientContract,
} from '../src/services/clientProfileProjection.js'
import { canReviewDocument } from '../src/services/documentReview.js'

test('fiscal documents returned under ACCOUNTING_FISCAL remain in the designed second group', () => {
  const overview = {
    summary: { approved: 0, pending: 1, rejected: 0 },
    sections: [{ code: 'ACCOUNTING_FISCAL', items: [{ documentId: 'file', status: 'Pending' }] }],
  }
  const sections = profileDocumentSections(overview)
  assert.equal(sections.length, 4)
  assert.equal(sections[1].items[0].documentId, 'file')
  assert.equal(profileDocumentMetrics(overview)[1].value, 1)
})
test('files without individual requirements contribute to overview counters', () => {
  const metrics = profileDocumentMetrics({
    summary: { total: 3, pending: 1, missing: 1, inReview: 1, approved: 0, rejected: 0 },
  })
  assert.equal(metrics[1].value, 2)
  assert.equal(profileDocumentMetrics(null)[1].value, '—')
})
test('contract values use the selected participant and never the whole contract capital', () => {
  const detail = {
    id: 'contract',
    currency: { id: 'usd', isoCode: 'USD' },
    initialContractualCapital: 500000,
    initialConsolidatedCapital: 500000,
    currentBalance: 580000,
    participants: [
      { clientId: 'other', allocatedAmount: 300000, allocationPercentage: 60 },
      { clientId: 'selected', allocatedAmount: 200000, allocationPercentage: 40 },
    ],
  }
  const projection = projectClientContract(detail, 'selected')
  assert.equal(projection.initialValue, 200000)
  assert.equal(projection.percentage, 40)
  assert.equal(projection.currencyCode, 'USD')
  assert.equal(projection.baseValue, null)
  assert.equal(projection.currentValue, null)
  assert.equal(projection.blockedValue, null)
  assert.equal(projectClientContract(detail, 'unknown'), null)
})
test('closed contracts and zero allocations are preserved as returned', () => {
  const projection = projectClientContract(
    {
      businessStatus: { code: 'CLOSED', name: 'Encerrado' },
      participants: [{ clientId: 'selected', allocatedAmount: 0, allocationPercentage: 0 }],
    },
    'selected',
  )
  assert.equal(projection.initialValue, 0)
  assert.equal(projection.percentage, 0)
  assert.equal(projection.status, 'Encerrado')
})

test('onboarding personal documents without requirements remain individually reviewable in the first Figma group', () => {
  const items = ['front', 'back'].map((documentId) => ({
    documentId,
    documentTypeId: 'rg',
    requirementId: null,
    status: 'Pending',
    allowedActions: ['Download', 'Review'],
    document: { id: documentId, status: 'Uploaded' },
  }))
  const overview = {
    summary: { pending: 2, approved: 0, rejected: 0 },
    sections: [{ code: 'PERSONAL_DOCUMENTS', items }],
  }
  const sections = profileDocumentSections(overview)
  assert.equal(sections.length, 4)
  assert.equal(sections[0].label, '1. Documentação pessoal')
  assert.deepEqual(
    sections[0].items.map((item) => item.documentId),
    ['front', 'back'],
  )
  assert.equal(sections[0].items.every(canReviewDocument), true)
  assert.equal(
    sections.slice(1).every((section) => section.items.length === 0),
    true,
  )
  assert.equal(profileDocumentMetrics(overview)[1].value, 2)
  assert.deepEqual(
    profileDocumentSections({ sections: [{ code: 'PERSONAL', items }] })[0].items,
    items,
  )
})

test('asset photo uploads do not inflate counters of the four displayed document groups', () => {
  const overview = {
    summary: { approved: 3, pending: 10, rejected: 3 },
    sections: [
      {
        code: 'PERSONAL_DOCUMENTS',
        items: [
          ...Array.from({ length: 3 }, (_, i) => ({
            documentId: `approved-${i}`,
            status: 'Approved',
          })),
          ...Array.from({ length: 3 }, (_, i) => ({
            documentId: `rejected-${i}`,
            status: 'Rejected',
          })),
        ],
      },
      { code: 'ACCOUNTING_FISCAL', items: [{ documentId: 'pending', status: 'Pending' }] },
      { code: 'PATRIMONIO', items: Array.from({ length: 9 }, () => ({ status: 'Pending' })) },
    ],
  }
  assert.deepEqual(
    profileDocumentMetrics(overview).map((item) => item.value),
    [3, 1, 3],
  )
  assert.deepEqual(
    profileDocumentMetrics({ sections: [] }).map((item) => item.value),
    [0, 0, 0],
  )
})

test('participant base amount uses the API value including zero without borrowing whole-contract balances', () => {
  for (const amount of [0, 261500]) {
    const projection = projectClientContract(
      {
        capital: 999999,
        currentBalance: 888888,
        participants: [{ clientId: 'client', baseAmount: amount, allocatedAmount: 123 }],
      },
      'client',
    )
    assert.equal(projection.baseValue, amount)
    assert.equal(projection.currentValue, null)
    assert.equal(projection.blockedValue, null)
  }
})

test('catalog completes missing types without duplicating uploads or overriding allowed actions', () => {
  const sent = {
    documentId: 'file',
    documentTypeId: 'rg',
    status: 'Approved',
    allowedActions: ['Download'],
  }
  const missing = { documentTypeId: 'cpf', status: 'Missing', allowedActions: [] }
  const overview = { sections: [{ code: 'PERSONAL', items: [sent, missing] }] }
  const catalog = {
    categories: [{ id: 'personal', code: 'PERSONAL_DOCUMENTS' }],
    types: [
      { id: 'rg', categoryId: 'personal', name: 'RG / CNH', allowsFileUpload: true },
      { id: 'cpf', categoryId: 'personal', name: 'CPF', allowsFileUpload: true },
      {
        id: 'address',
        categoryId: 'personal',
        name: 'Comprovante de Residência',
        allowsFileUpload: true,
      },
      { id: 'data', categoryId: 'personal', name: 'Dados', allowsFileUpload: false },
    ],
  }
  const items = profileDocumentSections(overview, catalog)[0].items
  assert.equal(items.length, 4)
  assert.deepEqual(items.slice(0, 2), [sent, missing])
  assert.deepEqual(items[2].allowedActions, ['Upload'])
  assert.deepEqual(items[3].allowedActions, [])
  assert.deepEqual(
    profileDocumentMetrics({ sections: [{ code: 'PERSONAL', items }] }).map((x) => x.value),
    [1, 0, 0],
  )
})
