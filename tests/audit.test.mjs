import test from 'node:test'
import assert from 'node:assert/strict'
import {
  auditFilters,
  auditParams,
  auditTarget,
  auditValue,
  auditAction,
  auditRouteQuery,
} from '../src/services/auditModel.js'
import { createAuditService, filterAuditCsv, parseAuditCsv } from '../src/services/auditService.js'

const id = '4f3ee648-6aae-4c78-90d7-46e1cc10e039'
test('audit queries retain approved filters and resource scope without accepting arbitrary actor or customer IDs', () => {
  const filters = auditFilters({
    actor: 'Admin',
    customer: id,
    from: '2026-11-01',
    to: '2026-11-12',
    search: ' Title ',
    action: 'deletion',
    resourceId: id,
    resourceType: 'Announcement',
  })
  assert.deepEqual(auditParams(filters), {
    Search: 'Title',
    From: '2026-11-01',
    To: '2026-11-12',
    ActorType: 'Admin',
    CustomerId: id,
    ResourceType: 'Announcement',
    ResourceId: id,
  })
  assert.equal(auditFilters({ actor: 'ThirdParty', customer: '../bad' }).customer, '')
  assert.equal(auditFilters({ actor: 'ThirdParty' }).actor, '')
  assert.throws(() => auditParams({ from: '2026-11-12', to: '2026-11-01' }))
  assert.equal(auditRouteQuery(filters, 2).page, '2')
  assert.equal(auditRouteQuery(filters).page, undefined)
})
test('record navigation opens supported histories and keeps other records in Audit', () => {
  assert.deepEqual(
    auditTarget({ module: 'Customers', resourceType: 'CustomerBankAccount', customerId: id }),
    { name: 'ClienteDetalhe', params: { id }, query: { history: '1' } },
  )
  assert.equal(auditTarget({ resourceType: 'Contract', resourceId: id }).query.contractId, id)
  assert.equal(auditTarget({ resourceType: 'Transaction', resourceId: id }).query.transactionId, id)
  for (const type of ['Announcement', 'Loan', 'Engine', 'Contract']) {
    const row = { resourceType: type, resourceId: type === 'Contract' ? 'https://bad.test' : id }
    assert.deepEqual(auditTarget(row), { name: 'Auditoria', query: row })
    assert.equal(auditTarget(row, row), null, 'an already open Audit history has no self-link')
  }
  assert.equal(
    auditTarget(
      { resourceType: 'Contract', resourceId: id },
      { resourceType: 'Contract', resourceId: id },
    ).name,
    'contracts',
  )
})
test('audit values protect passwords and nested sensitive data without inventing currency or zero values', () => {
  assert.equal(auditValue('Password', 'test-secret'), '••••')
  assert.equal(auditValue('AccountNumber', '123456789'), '****6789')
  assert.ok(
    !auditValue('Details', '{"documentNumber":"123456789","password":"secret"}').includes(
      '123456789',
    ),
  )
  assert.equal(auditValue('Amount', null, 'BRL'), '—')
  assert.equal(auditValue('Amount', '50'), '50')
  assert.match(auditValue('Amount', '50', 'BRL'), /50,00/)
  assert.equal(auditAction('Archived').tone, 'deleted')
  assert.equal(auditAction('Deleted').label, 'Exclusão')
  assert.equal(auditAction('Unexpected').label, 'Unexpected')
})
test('module discovery reads every page and deletion pagination combines archive and delete', async () => {
  const calls = []
  const service = createAuditService({
    read: async (_, params) => {
      calls.push(params)
      return {
        data:
          params.Page === 1
            ? [
                { id: 'a', module: 'Customers', action: 'Archived' },
                { id: 'b', module: 'Contracts', action: 'Updated' },
              ]
            : [{ id: 'c', module: 'Loans', action: 'Deleted' }],
        pagination: { totalItems: 3, totalPages: 2 },
      }
    },
  })
  assert.deepEqual(await service.modules(), ['Customers', 'Contracts', 'Loans'])
  const result = await service.list({ action: 'deletion', actor: 'Admin' }, 2, 1)
  assert.equal(result.data[0].id, 'c')
  assert.equal(result.pagination.totalItems, 2)
  assert.ok(calls.every((c) => c.Action === undefined && c.PageSize === 100))
})
test('expired owner rejects a late response before exposing audit data', async () => {
  let active = true
  const service = createAuditService({
    read: async () => {
      active = false
      return { data: [], pagination: { totalItems: 0, totalPages: 1 } }
    },
    assertCurrent: () => {
      if (!active) throw new Error('expired')
    },
  })
  await assert.rejects(service.list({}), /expired/)
})
test('CSV export preserves quoted multiline text, masks values and uses the same deletion scope without pagination', async () => {
  const csv =
    'Ação,Campo,Antes,Depois\r\nArchived,Title,"a,b","line1\nline2"\r\nDeleted,AccountNumber,123456789,987654321\r\nUpdated,Title,x,y'
  const service = createAuditService({
    readCsv: async (_, params) => {
      assert.deepEqual(params, { Search: 'Title' })
      return csv
    },
  })
  const result = parseAuditCsv(await service.export({ action: 'deletion', search: 'Title' }))
  assert.equal(result.length, 3)
  assert.equal(result[1][2], 'a,b')
  assert.equal(result[1][3], 'line1\nline2')
  assert.equal(result[2][2], '****6789')
  assert.equal(
    parseAuditCsv(filterAuditCsv('Ação,Campo,Antes,Depois\nCreated,Title,,=SUM(1)'))[1][3],
    "'=SUM(1)",
  )
})
