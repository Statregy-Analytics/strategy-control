import test from 'node:test'
import assert from 'node:assert/strict'
import vm from 'node:vm'
import { readFileSync } from 'node:fs'
import { computed, ref } from 'vue'
import * as model from '../src/services/clientAssetProfile.js'
const source = readFileSync(
  new URL('../src/components/Clients/ClientAssetRegistry.vue', import.meta.url),
  'utf8',
).match(/<script setup>([\s\S]*?)<\/script>/)[1]
test('new asset photo failure retries against created asset without a duplicate create', async () => {
  const writes = [],
    photoIds = [],
    reads = []
  let fail = true
  const modules = {
    vue: { computed, ref, watch() {}, onScopeDispose() {} },
    'src/services/clientAssetProfile': model,
    'src/services/customerService': { getPreferenceCatalog: async () => ({ currencies: [] }) },
    'src/services/financeService': {
      financeGet: async (path) => {
        reads.push(path)
        return { data: [] }
      },
      financeLabel: (x) => x,
      money: (x) => x,
      financeWrite: async (method, path, payload) => {
        writes.push({ method, path, payload })
        return { id: 'created', currencyId: 'brl' }
      },
    },
    'src/services/apiError': { getApiErrorMessage: (e, f) => e.message || f },
    'src/composables/global/useNotification': {
      default: () => ({ successNotify() {}, errorNotify() {} }),
    },
    'src/composables/useFinanceResource': {
      useFinanceResource: () => ({ state: { data: null }, load: async (fn) => fn(), reset() {} }),
    },
  }
  const context = vm.createContext({
    defineProps: () => ({
      customerId: 'customer',
      currencies: [{ currencyId: 'brl', currencyIsoCode: 'BRL' }],
    }),
    defineEmits: () => () => {},
  })
  const mod = new vm.SourceTextModule(
    source + '\nexport {photos,selectedGroup,draft,selected,save,error,dialog};',
    { context },
  )
  await mod.link((name) => {
    const exports = name.endsWith('.vue') ? { default: {} } : modules[name]
    assert.ok(exports, name)
    return new vm.SyntheticModule(
      Object.keys(exports),
      function () {
        for (const [k, v] of Object.entries(exports)) this.setExport(k, v)
      },
      { context },
    )
  })
  await mod.evaluate()
  const m = mod.namespace
  m.dialog.value = true
  m.selectedGroup.value = { type: 'RealEstate', singular: 'imóvel' }
  m.draft.value = { nickname: 'QA fictício', declaredValue: 0, paidOff: true }
  m.photos.value = {
    save: async (id) => {
      photoIds.push(id)
      if (fail) throw Error('photo link unavailable')
    },
  }
  await m.save()
  assert.equal(m.selected.value.id, 'created')
  assert.match(m.error.value, /photo link/)
  fail = false
  await m.save()
  assert.deepEqual(
    writes.map((x) => x.method),
    ['post', 'patch'],
  )
  assert.equal(writes[1].path, 'admin/customers/customer/assets/created')
  assert.deepEqual(photoIds, ['created', 'created'])
  assert.ok(reads.includes('admin/customers/customer/assets/created/documents'))
})
