import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  readWorkspaceCollection,
  filterWorkspace,
  announcementTextPayload,
  validateLogic,
  initialLogic,
  projectedFinalIndex,
} from '../src/services/adminWorkspaceModel.js'
import {
  readContractSelection,
  filterContractSelection,
} from '../src/services/contractSelectionModel.js'

test('workspace collection loads every page and deduplicates records', async () => {
  const calls = []
  const rows = await readWorkspaceCollection(async (path, params) => {
    calls.push([path, params.page])
    return { data: [{ id: String(params.page) }, { id: 'shared' }], pagination: { totalPages: 2 } }
  }, 'credit')
  assert.deepEqual(calls, [
    ['admin/loans', 1],
    ['admin/loans', 2],
  ])
  assert.equal(rows.length, 3)
})
test('catalog selectability is not converted into operational status', async () => {
  const rows = await readWorkspaceCollection(async (_, params) => {
    assert.equal(params.includeNonSelectable, true)
    return { data: [{ id: 'engine', isSelectable: true }] }
  }, 'logic')
  assert.equal(rows[0].status, undefined)
})
test('partial or stale queries never return a successful partial list', async () => {
  await assert.rejects(
    readWorkspaceCollection(async (_, p) => {
      if (p.page === 2) throw Error('network')
      return { data: [{ id: 'a' }], pagination: { totalPages: 2 } }
    }, 'communication'),
  )
  let current = true
  assert.equal(
    await readWorkspaceCollection(
      async () => {
        current = false
        return { data: [{ id: 'old' }] }
      },
      'credit',
      () => current,
    ),
    null,
  )
})
test('malformed and unsuccessful collection envelopes are rejected', async () => {
  for (const result of [
    { data: null },
    { data: [], success: false },
    { data: [], pagination: { totalPages: 1.5 } },
  ]) {
    await assert.rejects(readWorkspaceCollection(async () => result, 'credit'))
  }
})
test('workspace filters search accents and preserve original collection order', () => {
  const rows = [
    { id: 1, title: 'Zebra', status: 'Draft' },
    { id: 2, title: 'Éric', status: 'Published' },
  ]
  assert.deepEqual(
    filterWorkspace(rows, { search: 'ERIC', status: 'Published' }).map((r) => r.id),
    [2],
  )
  assert.deepEqual(
    rows.map((r) => r.id),
    [1, 2],
  )
})
test('editing text preserves category and targeted audience, never maps editorial groups', () => {
  const source = {
    id: 'a',
    category: 'Regulatory',
    audience: { type: 'Clients', clients: [{ clientId: 'c' }] },
  }
  assert.deepEqual(
    announcementTextPayload(source, {
      title: ' Novo ',
      body: 'Texto',
      kind: 'Insight',
      summary: '',
    }),
    {
      title: 'Novo',
      body: 'Texto',
      summary: null,
      category: 'Regulatory',
      audience: 'Clients',
      clientIds: ['c'],
      contractIds: [],
    },
  )
  assert.throws(() => announcementTextPayload({ id: 'a' }, { title: 'Title', body: 'body' }))
})
test('contract selection includes drafts, deduplicates and rejects partial failures', async () => {
  const calls = []
  const rows = await readContractSelection(async (_, p) => {
    calls.push(p.registrationStatus || 'Created')
    return { data: [{ id: 'shared' }, { id: p.registrationStatus || 'created' }] }
  })
  assert.equal(rows.length, 3)
  assert.deepEqual(calls, ['Created', 'Draft'])
  await assert.rejects(
    readContractSelection(async (_, p) => {
      if (p.registrationStatus) throw Error('drafts failed')
      return { data: [{ id: 'created' }] }
    }),
  )
})
test('contract filters combine client, engine and localized date overlap', () => {
  const rows = [
    {
      id: 'a',
      name: 'Éric',
      clients: [{ clientId: 'c' }],
      primaryEngine: { engineId: 'e' },
      startDate: '2026-01-01',
      endDate: '2026-03-31',
    },
  ]
  assert.equal(
    filterContractSelection(rows, {
      search: 'eric',
      client: 'c',
      engine: 'e',
      period: { from: '01/03/2026', to: '30/04/2026' },
    }).length,
    1,
  )
  assert.equal(filterContractSelection(rows, { period: { from: '01/04/2026' } }).length, 0)
  assert.equal(filterContractSelection(rows, { client: 'other' }).length, 0)
})
test('logic rejects incomplete, invalid probability and empty target', () => {
  const form = {
    ...initialLogic(),
    name: 'Motor',
    currency: 'BRL',
    engineType: 'Test',
    startDate: '2026-01-01',
    endDate: '2026-02-01',
    interval: 'day',
    target: 3,
    dailyFloor: -1,
    dailyCeiling: 1,
    monthlyFloor: -5,
    monthlyCeiling: 5,
    intensity: 0.5,
  }
  assert.equal(validateLogic(form), '')
  assert.match(validateLogic({ ...form, positive: 60 }), /somar 100/)
  assert.notEqual(validateLogic({ ...form, target: '' }), '')
  assert.notEqual(validateLogic({ ...form, initialIndex: Infinity }), '')
  assert.equal(projectedFinalIndex({ initialIndex: Infinity, target: 1 }), null)
  assert.notEqual(validateLogic({ ...form, startDate: '2026-02-31' }), '')
  assert.equal(projectedFinalIndex({ initialIndex: 100, target: null }), null)
})
