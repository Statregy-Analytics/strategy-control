import test from 'node:test'
import assert from 'node:assert/strict'
import vm from 'node:vm'
import { readFileSync } from 'node:fs'
import * as vue from 'vue'
import { readCurrentPages } from '../src/services/requestContext.js'
import { useFinanceResource } from '../src/composables/useFinanceResource.js'
import {
  buildDraftPayload,
  buildContractTerm,
  contractEndDate,
} from '../src/services/financeModels.js'
const tick = () => new Promise((r) => setTimeout(r, 0))
const seed = () => ({
  id: 'contract',
  name: 'Contrato existente',
  registrationStatus: 'Draft',
  startDate: '2026-01-01',
  term: { unit: 'Year', value: 1 },
  expectedEndDate: '2027-01-01',
  currency: { id: 'currency', isoCode: 'BRL' },
  initialContractualCapital: 100,
  initialCapitalOrigin: { id: 'origin' },
  primaryEngine: { engineId: 'engine' },
  businessStatus: { id: 'status' },
  financialNotes: 'Original',
  participants: [{ clientId: 'client', displayName: 'Cliente', allocatedAmount: 100 }],
})
async function setup({
  existing = false,
  finalized = false,
  assetDelay,
  engineFailure = false,
  finalizeFailure = false,
  writeDelay,
} = {}) {
  let record = seed(),
    failFinalize = finalizeFailure
  if (finalized) record.registrationStatus = 'Finalized'
  const writes = [],
    reads = [],
    events = [],
    notices = []
  const get = async (path, params) => {
    reads.push({ path, params })
    if (path === 'admin/audit/changes' || path === 'admin/transactions') return { data: [] }
    if (path.includes('/catalog/')) return { data: [] }
    if (path.endsWith('/assets')) return assetDelay ? assetDelay : { data: { items: [] } }
    if (path.endsWith('/engines') && engineFailure) throw Error('controlled unavailable')
    if (
      ['/documents', '/engines', '/history'].some((s) => path.endsWith(s)) ||
      path === 'admin/debts'
    )
      return { data: [] }
    return { data: JSON.parse(JSON.stringify(record)) }
  }
  const write = async (method, path, payload) => {
    writes.push({ method, path, payload: payload && JSON.parse(JSON.stringify(payload)) })
    if (writeDelay) await writeDelay
    if (path.endsWith('/finalize')) {
      if (failFinalize) {
        failFinalize = false
        throw Error('finalize temporarily unavailable')
      }
      record.registrationStatus = 'Finalized'
    } else if (path.endsWith('/status')) record.businessStatus = { id: payload.statusId }
    else if (path.endsWith('/drafts') || path.endsWith('/draft') || method === 'patch') {
      record.name = payload.name
      record.financialNotes = payload.financialNotes
      if (payload.term) record.term = payload.term
    }
    return { id: record.id }
  }
  const modules = {
    vue,
    'src/services/requestContext': { readCurrentPages },
    './useFinanceResource': { useFinanceResource },
    'src/services/financeService': { financeGet: get, financeWrite: write },
    'src/services/financeModels': { buildDraftPayload, buildContractTerm, contractEndDate },
    'src/services/apiError': { getApiErrorMessage: (e) => e.message },
  }
  const context = vm.createContext({}),
    source = readFileSync(
      new URL('../src/composables/useContractWorkspace.js', import.meta.url),
      'utf8',
    )
  const mod = new vm.SourceTextModule(source, { context })
  await mod.link(
    (name) =>
      new vm.SyntheticModule(
        Object.keys(modules[name]),
        function () {
          for (const [k, v] of Object.entries(modules[name])) this.setExport(k, v)
        },
        { context },
      ),
  )
  await mod.evaluate()
  const scope = vue.effectScope(),
    props = vue.reactive({ contractId: existing ? 'contract' : null })
  const h = scope.run(() =>
    mod.namespace.useContractWorkspace(
      props,
      (...args) => events.push(args),
      (v) => notices.push(v),
    ),
  )
  await tick()
  return { ...h, props, writes, reads, events, notices, dispose: () => scope.stop() }
}
function fill(h) {
  Object.assign(h.form.value, {
    name: 'QA draft',
    startDate: '2026-01-01',
    currencyId: 'currency',
    initialContractualCapital: 100,
    initialCapitalOriginId: 'origin',
    primaryEngineId: 'engine',
    initialContractStatusId: 'status',
    clientAllocations: [{ clientId: 'client', allocatedAmount: 100 }],
  })
  h.termValue.value = 1
  h.termUnit.value = 'Year'
}
test('new CT04 draft keeps nullable fields and existing draft endpoint; creation uses explicit finalization', async () => {
  const h = await setup()
  fill(h)
  assert.equal(await h.save(false), true)
  assert.equal(h.writes[0].path, 'admin/contracts/drafts')
  assert.equal(h.writes[0].method, 'post')
  assert.equal(h.writes[0].payload.clientAllocations[0].allocatedAmount, 100)
  assert.equal(
    h.writes.some((w) => w.path.endsWith('/finalize')),
    false,
  )
  assert.equal(h.events[0][0], 'saved')
  h.dispose()
})
test('CT04 incomplete or invalid finalization never writes; valid creation saves before finalization', async () => {
  const h = await setup()
  assert.equal(await h.save(true), false)
  assert.equal(h.writes.length, 0)
  fill(h)
  h.termValue.value = -1
  assert.equal(await h.save(true), false)
  assert.equal(h.writes.length, 0)
  h.termValue.value = 1
  assert.equal(await h.save(true), true)
  assert.deepEqual(
    h.writes.map((w) => w.path),
    ['admin/contracts/drafts', 'admin/contracts/contract/finalize'],
  )
  h.dispose()
})
test('failed finalization retries the saved draft instead of creating a duplicate or patching a finalized record', async () => {
  const h = await setup({ finalizeFailure: true })
  fill(h)
  assert.equal(await h.save(true), false)
  assert.equal(h.id.value, 'contract')
  assert.equal(h.draft.value, true)
  assert.equal(await h.save(true), true)
  assert.deepEqual(
    h.writes.map((w) => w.path),
    [
      'admin/contracts/drafts',
      'admin/contracts/contract/finalize',
      'admin/contracts/contract/draft',
      'admin/contracts/contract/finalize',
    ],
  )
  h.dispose()
})
test('CT07 edits preserve immutable capital/currency and use the separate status endpoint', async () => {
  const h = await setup({ existing: true, finalized: true })
  h.form.value.name = 'Nome corrigido'
  h.form.value.initialContractStatusId = 'suspended'
  assert.equal(await h.save(false), true)
  assert.equal(h.writes[0].method, 'patch')
  assert.equal(h.writes[0].path, 'admin/contracts/contract')
  assert.equal(Object.hasOwn(h.writes[0].payload, 'term'), false)
  assert.equal(Object.hasOwn(h.writes[0].payload, 'endDate'), false)
  assert.equal(Object.hasOwn(h.writes[0].payload, 'currencyId'), false)
  assert.equal(Object.hasOwn(h.writes[0].payload, 'initialContractualCapital'), false)
  assert.equal(h.writes[1].path, 'admin/contracts/contract/status')
  assert.equal(h.writes[1].payload.statusId, 'suspended')
  h.dispose()
})
test('late asset loading does not overwrite unsaved contract edits; section errors remain isolated', async () => {
  let resolve
  const pending = new Promise((r) => {
    resolve = r
  })
  const h = await setup({ existing: true, assetDelay: pending, engineFailure: true })
  h.form.value.name = 'Alteração não salva'
  resolve({ data: { items: [{ assetId: 'asset' }] } })
  await tick()
  assert.equal(h.form.value.name, 'Alteração não salva')
  assert.equal(h.stagedAssets.value[0].assetId, 'asset')
  assert.ok(h.engines.state.error)
  assert.equal(h.detail.state.error, '')
  assert.equal(h.documents.state.error, '')
  h.dispose()
})
test('duplicate save is ignored and disposal prevents late navigation or success', async () => {
  let resolve
  const pending = new Promise((r) => {
    resolve = r
  })
  const h = await setup({ writeDelay: pending })
  fill(h)
  const saving = h.save(false)
  assert.equal(await h.save(false), false)
  assert.equal(h.writes.length, 1)
  h.dispose()
  resolve()
  assert.equal(await saving, false)
  assert.equal(h.events.length, 0)
  assert.equal(h.notices.length, 0)
})

test('final contract term changes never send both term and endDate', async () => {
  const h = await setup({ existing: true, finalized: true })
  h.termValue.value = 2
  assert.equal(await h.save(false), true)
  assert.equal(h.writes[0].payload.term.value, 2)
  assert.equal(Object.hasOwn(h.writes[0].payload, 'endDate'), false)
  h.dispose()
})

test('CT07 uses contract-scoped audit and completed contract operations, not an unsupported transaction enum', async () => {
  const h = await setup({ existing: true, finalized: true })
  const audit = h.reads.find((r) => r.path === 'admin/audit/changes')
  assert.equal(audit.params.ResourceId, 'contract')
  assert.equal(audit.params.ResourceType, 'Contract')
  const contributions = h.reads.find((r) => r.path === 'admin/transactions')
  assert.equal(contributions.params.contractId, 'contract')
  assert.equal(contributions.params.type, 'ContractOperation')
  assert.equal(contributions.params.status, 'Completed')
  h.dispose()
})
