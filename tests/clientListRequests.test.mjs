import test from 'node:test'
import assert from 'node:assert/strict'
import vm from 'node:vm'
import { readFileSync } from 'node:fs'
import { ref, computed, reactive, toRef } from 'vue'
import { useFinanceResource } from '../src/composables/useFinanceResource.js'

const source = readFileSync(new URL('../src/components/Table/Clients/ClientsTable.vue', import.meta.url), 'utf8')
  .match(/<script setup>([\s\S]*?)<\/script>/)[1]
const context = vm.createContext({ Date })
async function harness() {
  const calls = [], disposed = [], exported = []
  const store = reactive({ data: [], pagination: { page: 1, pageSize: 10, totalItems: 0, totalPages: 0 } })
  const read = (mode) => (query) => new Promise((resolve, reject) => calls.push({ mode, query, resolve, reject }))
  const values = {
    vue: { ref, computed, onMounted() {}, onScopeDispose: (fn) => disposed.push(fn) },
    'vue-router': { useRouter: () => ({ push() {} }) },
    quasar: { exportFile: (...args) => { exported.push(args); return true } },
    pinia: { storeToRefs: (store) => ({ data: toRef(store, 'data'), pagination: toRef(store, 'pagination') }) },
    'src/stores/client': { useClientStore: () => store },
    'src/composables/global/useNotification': { default: () => ({ errorNotify() {} }) },
    'src/services/customerService': { listCustomerCards: read('cards'), listCustomers: read('table') },
    'src/composables/useFinanceResource': { useFinanceResource },
  }
  const mod = new vm.SourceTextModule(source + '\nexport { load, reload, changeViewMode, search, status, listResource, loading, resultsUnavailable, selected, compareDialog, compareSelected, exportTable };', { context })
  await mod.link((name) => {
    const exports = name.endsWith('.vue') ? { default: {} } : values[name]
    assert.ok(exports, 'Unexpected import: ' + name)
    return new vm.SyntheticModule(Object.keys(exports), function () {
      for (const [key, value] of Object.entries(exports)) this.setExport(key, value)
    }, { context })
  })
  await mod.evaluate()
  return { model: mod.namespace, calls, store, exported, dispose: () => disposed.forEach((fn) => fn()) }
}
const response = (name, page = 1, totalItems = 1) => ({ data: [{ id: name, primaryName: name }], pagination: { page, pageSize: 10, totalItems, totalPages: Math.ceil(totalItems / 10) } })
test('rapid searches publish only the newest rows and pagination', async () => {
  const h = await harness()
  h.model.search.value = 'old'
  const old = h.model.reload()
  h.model.search.value = 'new'
  const latest = h.model.reload()
  h.calls[1].resolve(response('new'))
  await latest
  h.calls[0].resolve(response('old', 2, 50))
  await old
  assert.equal(h.store.data[0].id, 'new')
  assert.equal(h.store.pagination.page, 1)
  assert.equal(h.store.pagination.totalItems, 1)
  assert.equal(h.model.loading.value, false)
})
test('switching from cards to table cannot be overwritten by a pending cards response', async () => {
  const h = await harness()
  const cards = h.model.load()
  const table = h.model.changeViewMode('table')
  assert.deepEqual(h.calls.map((call) => call.mode), ['cards', 'table'])
  h.calls[1].resolve(response('table'))
  await table
  h.calls[0].resolve(response('cards'))
  await cards
  assert.equal(h.store.data[0].id, 'table')
})
test('an old failure cannot remove a newer success or its available controls', async () => {
  const h = await harness()
  const old = h.model.load()
  const latest = h.model.reload()
  h.calls[1].resolve(response('latest'))
  await latest
  h.calls[0].reject(new Error('old failure'))
  await old
  assert.equal(h.model.listResource.state.error, '')
  assert.equal(h.model.resultsUnavailable.value, false)
  assert.equal(h.store.data[0].id, 'latest')
})
test('a failed query clears old rows, blocks export/comparison, and recovers through the existing retry', async () => {
  const h = await harness()
  const initial = h.model.load()
  h.calls[0].resolve(response('initial'))
  await initial
  h.model.selected.value = [{ id: 'a' }, { id: 'b' }]
  const failed = h.model.reload()
  assert.equal(h.store.data.length, 0)
  assert.equal(h.model.loading.value, true)
  h.calls[1].reject(new Error('network'))
  await failed
  assert.ok(h.model.listResource.state.error)
  h.model.exportTable()
  h.model.compareSelected()
  assert.equal(h.exported.length, 0)
  assert.equal(h.model.compareDialog.value, false)
  const retry = h.model.reload()
  h.calls[2].resolve(response('recovered'))
  await retry
  assert.equal(h.store.data[0].id, 'recovered')
  assert.equal(h.model.listResource.state.error, '')
})
test('leaving the list invalidates late responses without overwriting another view', async () => {
  const h = await harness()
  const pending = h.model.load()
  h.dispose()
  h.store.data = [{ id: 'another-view' }]
  h.calls[0].resolve(response('late'))
  await pending
  assert.equal(h.store.data[0].id, 'another-view')
  assert.equal(h.model.listResource.state.data, null)
  await h.model.reload()
  assert.equal(h.calls.length, 1)
  assert.equal(h.store.data[0].id, 'another-view')
})
test('zero results are a successful empty response rather than a network failure', async () => {
  const h = await harness()
  const pending = h.model.load()
  h.calls[0].resolve({ data: [], pagination: { page: 1, pageSize: 10, totalItems: 0, totalPages: 0 } })
  await pending
  assert.equal(h.model.listResource.state.error, '')
  assert.equal(h.model.loading.value, false)
  assert.equal(h.store.data.length, 0)
  assert.equal(h.store.pagination.totalItems, 0)
})


test('a newer query started between resource resolution and publication invalidates the earlier result', async () => {
  const h = await harness()
  const old = h.model.load()
  h.calls[0].resolve(response('old'))
  await Promise.resolve()
  const latest = h.model.reload()
  await old
  assert.equal(h.store.data.length, 0)
  assert.equal(h.model.loading.value, true)
  h.calls[1].resolve(response('latest'))
  await latest
  assert.equal(h.store.data[0].id, 'latest')
})
