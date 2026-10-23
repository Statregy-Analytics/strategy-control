import test from 'node:test'
import assert from 'node:assert/strict'
import vm from 'node:vm'
import { readFileSync } from 'node:fs'
import { computed, ref, reactive, watch } from 'vue'
import { useFinanceResource } from '../src/composables/useFinanceResource.js'
import * as assetModel from '../src/services/clientAssetProfile.js'
const source = readFileSync(
  new URL('../src/components/Clients/ClientAssetRegistry.vue', import.meta.url),
  'utf8',
).match(/<script setup>([\s\S]*?)<\/script>/)[1]
const group = { type: 'RealEstate', singular: 'imóvel' }
const asset = (id) => ({
  id,
  currencyId: 'brl',
  nickname: id,
  status: 'PaidOff',
  declaredValue: 10,
  realEstate: { propertyType: 'Casa' },
})
const deferred = () => {
  let resolve, reject
  const promise = new Promise((yes, no) => {
    resolve = yes
    reject = no
  })
  return { promise, resolve, reject }
}
async function harness({
  detail = async (path) => ({ data: asset(path.split('/').at(-1)) }),
  write = async () => ({ id: 'old' }),
} = {}) {
  const props = reactive({
    customerId: 'one',
    currencies: [{ currencyId: 'brl', currencyIsoCode: 'BRL' }],
  })
  const reads = [],
    writes = [],
    notifications = [],
    events = [],
    stops = []
  let unmount
  const modules = {
    vue: {
      computed,
      ref,
      watch: (...args) => {
        const stop = watch(...args)
        stops.push(stop)
        return stop
      },
      onScopeDispose: (fn) => {
        unmount = fn
      },
    },
    'src/composables/useFinanceResource': { useFinanceResource },
    'src/services/clientAssetProfile': assetModel,
    'src/services/customerService': { getPreferenceCatalog: async () => ({ currencies: [] }) },
    'src/services/financeService': {
      financeLabel: (x) => x,
      money: (x) => x,
      financeGet: async (path) => {
        reads.push(path)
        return path.endsWith('/assets') || path.endsWith('/documents') ? { data: [] } : detail(path)
      },
      financeWrite: async (method, path, payload) => {
        writes.push({ method, path, payload })
        return write(method, path, payload)
      },
    },
    'src/services/apiError': { getApiErrorMessage: (e) => e.message },
    'src/composables/global/useNotification': {
      default: () => ({
        successNotify: (message) => notifications.push(message),
        errorNotify: (message) => notifications.push(message),
      }),
    },
  }
  const context = vm.createContext({
    defineProps: () => props,
    defineEmits: () => (event) => events.push(event),
  })
  const mod = new vm.SourceTextModule(
    source + '\nexport {edit,save,dialog,draft,selected,photos,error,saving,editor};',
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
  return {
    m: mod.namespace,
    props,
    reads,
    writes,
    notifications,
    events,
    dispose: () => {
      unmount()
      stops.forEach((stop) => stop())
    },
  }
}
test('closing the editor invalidates an outstanding detail response', async () => {
  const pending = deferred(),
    h = await harness({ detail: () => pending.promise })
  const opening = h.m.edit(asset('old'), group)
  h.m.dialog.value = false
  pending.resolve({ data: asset('old') })
  await opening
  assert.equal(h.m.draft.value, null)
  assert.equal(h.m.editor.state.data, null)
  assert.equal(h.m.editor.state.loading, false)
  h.dispose()
})
test('an older detail response cannot replace a newer asset draft', async () => {
  const pending = deferred(),
    h = await harness({
      detail: (path) =>
        path.endsWith('/old') ? pending.promise : Promise.resolve({ data: asset('new') }),
    })
  const opening = h.m.edit(asset('old'), group)
  await h.m.edit(asset('new'), group)
  pending.resolve({ data: asset('old') })
  await opening
  assert.equal(h.m.draft.value.nickname, 'new')
  assert.equal(h.m.selected.value.id, 'new')
  h.dispose()
})
for (const fails of [false, true])
  test(`late ${fails ? 'failure' : 'success'} after customer switch cannot affect the new editor or start photo upload`, async () => {
    const pending = deferred(),
      h = await harness({ write: () => pending.promise })
    await h.m.edit(asset('old'), group)
    let oldPhotos = 0,
      newPhotos = 0
    h.m.photos.value = {
      save: async () => {
        oldPhotos++
      },
    }
    const saving = h.m.save()
    h.props.customerId = 'two'
    await h.m.edit(asset('new'), group)
    h.m.photos.value = {
      save: async () => {
        newPhotos++
      },
    }
    h.m.error.value = 'Current editor error'
    if (fails) pending.reject(Error('Old customer error'))
    else pending.resolve({ id: 'old' })
    await saving
    assert.equal(h.m.draft.value.nickname, 'new')
    assert.equal(h.m.dialog.value, true)
    assert.equal(h.m.error.value, 'Current editor error')
    assert.equal(h.m.saving.value, false)
    assert.equal(oldPhotos, 0)
    assert.equal(newPhotos, 0)
    assert.deepEqual(h.notifications, [])
    assert.deepEqual(h.events, [])
    assert.equal(h.writes[0].path, 'admin/customers/one/assets/old')
    assert.ok(!h.reads.some((path) => path.includes('/two/assets/old')))
    h.dispose()
  })
test('customer switch during photo persistence prevents subsequent document reload and completion effects', async () => {
  const pending = deferred(),
    started = deferred(),
    h = await harness()
  await h.m.edit(asset('old'), group)
  h.m.photos.value = {
    save: async () => {
      started.resolve()
      return pending.promise
    },
  }
  const saving = h.m.save()
  await started.promise
  h.props.customerId = 'two'
  await h.m.edit(asset('new'), group)
  pending.resolve()
  await saving
  assert.ok(!h.reads.some((path) => path.endsWith('/documents')))
  assert.equal(h.m.draft.value.nickname, 'new')
  assert.deepEqual(h.notifications, [])
  h.dispose()
})
test('leaving the screen during save prevents late upload, notification and refresh', async () => {
  const pending = deferred(),
    h = await harness({ write: () => pending.promise })
  await h.m.edit(asset('old'), group)
  let photos = 0
  h.m.photos.value = {
    save: async () => {
      photos++
    },
  }
  const saving = h.m.save()
  h.dispose()
  pending.resolve({ id: 'old' })
  await saving
  assert.equal(photos, 0)
  assert.deepEqual(h.notifications, [])
  assert.deepEqual(h.events, [])
})
