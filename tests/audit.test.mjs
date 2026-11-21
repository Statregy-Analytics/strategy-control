import test from 'node:test'
import assert from 'node:assert/strict'
import {
  auditFilters,
  auditParams,
  auditTarget,
  auditValue,
  auditAction,
  auditRouteQuery,
  auditDate,
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
test('impossible calendar days and incomplete resource scopes do not reach the API', () => {
  assert.equal(auditFilters({ from: '2026-02-31', to: '2026-13-01' }).from, '')
  assert.equal(auditFilters({ from: '2026-02-31', to: '2026-13-01' }).to, '')
  assert.equal(auditFilters({ from: '2024-02-29' }).from, '2024-02-29')
  assert.equal(auditFilters({ resourceId: id }).resourceId, '')
  assert.equal(auditFilters({ resourceType: 'Announcement' }).resourceType, '')
})
test('audit date values stay in UTC and malformed currency metadata cannot break a row', () => {
  assert.equal(auditDate('2026-11-12T12:34:00Z'), '12/11/2026 12:34')
  assert.equal(
    auditValue('ArchivedAtUtc', '2026-11-12T12:34:00.123456Z'),
    '2026-11-12T12:34:00.123456Z',
  )
  assert.equal(auditValue('ArchivedAtUtc', null), '—')
  assert.equal(auditValue('Amount', '50', 'not-a-currency'), '50')
  assert.equal(auditDate('invalid'), '—')
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

test('record history reads every page with a fixed record scope and retains more than five rows', async () => {
  const calls = []
  const service = createAuditService({
    read: async (path, params) => {
      calls.push({ path, params })
      return {
        success: true,
        data: Array.from({ length: params.Page === 1 ? 100 : 7 }, (_, i) => ({
          id: String((params.Page - 1) * 100 + i),
        })),
        pagination: { totalItems: 107, totalPages: 2 },
      }
    },
  })
  const result = await service.history('Announcement', id)
  assert.equal(result.length, 107)
  assert.deepEqual(
    calls.map((x) => x.params.Page),
    [1, 2],
  )
  assert.ok(
    calls.every(
      (x) =>
        x.path === 'admin/audit/changes' &&
        x.params.ResourceType === 'Announcement' &&
        x.params.ResourceId === id &&
        x.params.PageSize === 100,
    ),
  )
})
test('record history rejects a partial result and a retry starts at page one', async () => {
  let fail = true
  const calls = []
  const service = createAuditService({
    read: async (_, params) => {
      calls.push(params.Page)
      if (fail && params.Page === 2) throw new Error('offline')
      return { data: [{ id: String(params.Page) }], pagination: { totalItems: 2, totalPages: 2 } }
    },
  })
  await assert.rejects(service.history('Announcement', id), /offline/)
  fail = false
  assert.equal((await service.history('Announcement', id)).length, 2)
  assert.deepEqual(calls, [1, 2, 1, 2])
})
test('expired record history stops before requesting the next page', async () => {
  let active = true,
    calls = 0
  const service = createAuditService({
    assertCurrent: () => {
      if (!active) throw Error('expired')
    },
    read: async () => {
      calls++
      active = false
      return { data: [{ id: 'a' }], pagination: { totalItems: 2, totalPages: 2 } }
    },
  })
  await assert.rejects(service.history('Announcement', id), /expired/)
  assert.equal(calls, 1)
})
test('record history never falls back to a global audit query for an invalid scope', async () => {
  let called = false
  const service = createAuditService({
    read: async () => {
      called = true
    },
  })
  await assert.rejects(service.history('Announcement', ''), /inválido/)
  await assert.rejects(service.history('', id), /inválido/)
  assert.equal(called, false)
})

test('child audit changes navigate to their parent contract or financial transaction', () => {
  const id = '11111111-1111-4111-8111-111111111111'
  assert.equal(
    auditTarget({
      resourceType: 'ContractParticipant',
      resourceId: 'child',
      parentResourceType: 'Contract',
      parentResourceId: id,
    }).query.contractId,
    id,
  )
  assert.equal(
    auditTarget({
      resourceType: 'FinancialTransactionDocument',
      resourceId: 'child',
      parentResourceType: 'FinancialTransaction',
      parentResourceId: id,
    }).query.transactionId,
    id,
  )
})
