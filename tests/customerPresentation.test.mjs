import test from 'node:test'
import assert from 'node:assert/strict'
import {
  customerStatusLabel,
  customerMaskedDocument,
  readCustomerSelection,
} from '../src/services/customerPresentation.js'
test('presentation binds Figma status names without changing API values', () => {
  assert.equal(customerStatusLabel('Active'), 'Ativo')
  assert.equal(customerStatusLabel('Suspended'), 'Bloqueado')
  assert.equal(customerStatusLabel('Archived'), 'Inativo')
  assert.equal(customerStatusLabel('Prospect'), 'Inativo')
})
test('document masking preserves server redaction and hides both ends', () => {
  assert.equal(customerMaskedDocument('123.456.789-01'), '***.456.78*-**')
  assert.equal(customerMaskedDocument('***.***.***-01'), '***.***.***-**')
  assert.equal(customerMaskedDocument(null), 'Documento não informado')
  assert.equal(customerMaskedDocument('12.345.678/0001-90'), '**.*45.678/000*-**')
})
test('filters search every server page, combine criteria, and paginate matching rows', async () => {
  const calls = []
  const pages = [
    [
      {
        customerId: 'a',
        status: 'Active',
        documentClassification: 'G',
        documentLevel: 1,
        complianceStatus: 'Ok',
      },
    ],
    [
      {
        customerId: 'b',
        status: 'Archived',
        documentClassification: 'I',
        documentLevel: 0,
        complianceStatus: 'Pending',
      },
    ],
    [
      {
        customerId: 'c',
        status: 'Prospect',
        documentClassification: 'I',
        documentLevel: 0,
        complianceStatus: 'Pending',
      },
    ],
  ]
  const read = async (q) => {
    calls.push(q)
    return { data: pages[q.page - 1], pagination: { pageSize: 1, totalPages: 3 } }
  }
  const result = await readCustomerSelection(
    read,
    { page: 2, pageSize: 1, search: 'query' },
    { inactive: true, classification: 'I', level: 0, compliance: 'Pending' },
  )
  assert.deepEqual(
    calls.map((q) => q.page),
    [1, 2, 3],
  )
  assert.ok(calls.every((q) => q.search === 'query'))
  assert.deepEqual(
    result.data.map((row) => row.customerId),
    ['c'],
  )
  assert.equal(result.pagination.totalItems, 2)
  assert.equal(result.pagination.totalPages, 2)
  assert.deepEqual(result.classifications, ['G', 'I'])
})
test('a failed subsequent page never publishes a partial filtered result', async () => {
  await assert.rejects(
    readCustomerSelection(
      async (q) => {
        if (q.page === 2) throw new Error('network')
        return { data: [{ customerId: 'partial' }], pagination: { totalPages: 2 } }
      },
      { page: 1, pageSize: 10 },
      {},
    ),
    /network/,
  )
})
test('superseded queries stop requesting subsequent pages', async () => {
  const calls = []
  const result = await readCustomerSelection(
    async (q) => {
      calls.push(q)
      return { data: [], pagination: { totalPages: 3 } }
    },
    { page: 1, pageSize: 10 },
    {},
    () => false,
  )
  assert.equal(result, undefined)
  assert.equal(calls.length, 1)
})
