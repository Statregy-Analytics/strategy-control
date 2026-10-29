import test from 'node:test'
import assert from 'node:assert/strict'
import vm from 'node:vm'
import { readFileSync } from 'node:fs'
import { computed, ref, reactive, watch } from 'vue'
import * as review from '../src/services/documentReview.js'
const source = readFileSync(
  new URL('../src/components/Clients/ProfileDocumentItem.vue', import.meta.url),
  'utf8',
).match(/<script setup>([\s\S]*?)<\/script>/)[1]
const deferred = () => {
  let resolve, reject
  const promise = new Promise((yes, no) => {
    resolve = yes
    reject = no
  })
  return { promise, resolve, reject }
}
const fakeFile = () => new File(['QA fictional file'], 'qa.png', { type: 'image/png' })
async function harness(service = {}) {
  const props = reactive({
    customerId: 'one',
    item: {
      documentId: 'old',
      documentTypeId: 'photo-type',
      requirementId: 'req',
      status: 'Missing',
      allowedActions: ['Upload', 'Download'],
    },
  })
  const notifications = [],
    updates = [],
    opened = [],
    downloads = [],
    stops = []
  let unmount
  const methods = {
    getDocumentTemporaryUrl: async () => ({ url: 'https://example.test/qa.png' }),
    downloadDocument: async () => ({ data: new Blob(['QA']) }),
    uploadCustomerDocument: async () => ({ id: 'new' }),
    reviewDocument: async () => {
      throw Error('Unexpected review')
    },
    ...service,
  }
  const modules = {
    vue: {
      computed,
      ref,
      reactive,
      watch: (...args) => {
        const stop = watch(...args)
        stops.push(stop)
        return stop
      },
      onScopeDispose: (fn) => {
        unmount = fn
      },
    },
    'src/services/documentReview': review,
    'src/services/documentAdminService': methods,
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
    defineEmits: () => () => updates.push(true),
    FormData,
    window: { open: (...args) => opened.push(args) },
    URL: { createObjectURL: () => 'blob:qa', revokeObjectURL() {} },
    document: { createElement: () => ({ click: () => downloads.push(true) }) },
    setTimeout: (fn) => fn(),
  })
  const mod = new vm.SourceTextModule(
    source + '\nexport {busy,downloading,file,uploadOpen,upload,view,download};',
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
    notifications,
    updates,
    opened,
    downloads,
    dispose: () => {
      unmount()
      stops.forEach((stop) => stop())
    },
  }
}
test('changing document resets loading; an old URL cannot open a tab or clear a newer request', async () => {
  const first = deferred(),
    second = deferred(),
    calls = []
  const h = await harness({
    getDocumentTemporaryUrl: async (id) => {
      calls.push(id)
      return id === 'old' ? first.promise : second.promise
    },
  })
  const old = h.m.view()
  assert.equal(h.m.busy.value, true)
  h.props.item.documentId = 'new'
  assert.equal(h.m.busy.value, false)
  const current = h.m.view()
  first.resolve({ url: 'https://example.test/old.png' })
  await old
  assert.equal(h.m.busy.value, true)
  assert.equal(h.opened.length, 0)
  second.resolve({ url: 'https://example.test/new.png' })
  await current
  assert.equal(h.m.busy.value, false)
  assert.equal(h.opened.length, 1)
  assert.deepEqual(calls, ['old', 'new'])
  h.dispose()
})
test('changing customer resets download state and suppresses the old file download', async () => {
  const first = deferred(),
    second = deferred()
  let count = 0
  const h = await harness({
    downloadDocument: async () => (++count === 1 ? first.promise : second.promise),
  })
  const old = h.m.download()
  h.props.customerId = 'two'
  assert.equal(h.m.downloading.value, false)
  const current = h.m.download()
  first.resolve({ data: new Blob(['old']) })
  await old
  assert.equal(h.downloads.length, 0)
  assert.equal(h.m.downloading.value, true)
  second.resolve({ data: new Blob(['new']) })
  await current
  assert.equal(h.downloads.length, 1)
  assert.equal(h.m.downloading.value, false)
  h.dispose()
})
test('late upload success cannot clear a new file, close its dialog or notify another customer', async () => {
  const first = deferred(),
    second = deferred(),
    calls = []
  const h = await harness({
    uploadCustomerDocument: async (customer, data) => {
      calls.push({ customer, file: data.get('file').name })
      return customer === 'one' ? first.promise : second.promise
    },
  })
  h.m.file.value = fakeFile()
  h.m.uploadOpen.value = true
  const old = h.m.upload()
  h.props.customerId = 'two'
  assert.equal(h.m.busy.value, false)
  assert.equal(h.m.file.value, null)
  assert.equal(h.m.uploadOpen.value, false)
  const next = fakeFile()
  h.m.file.value = next
  h.m.uploadOpen.value = true
  const current = h.m.upload()
  first.resolve({ id: 'old-upload' })
  await old
  assert.equal(h.m.busy.value, true)
  assert.equal(h.m.file.value, next)
  assert.equal(h.m.uploadOpen.value, true)
  assert.equal(h.notifications.length, 0)
  assert.equal(h.updates.length, 0)
  second.resolve({ id: 'new-upload' })
  await current
  assert.equal(h.m.busy.value, false)
  assert.equal(h.m.file.value, null)
  assert.equal(h.m.uploadOpen.value, false)
  assert.equal(h.notifications.length, 1)
  assert.equal(h.updates.length, 1)
  assert.deepEqual(
    calls.map((call) => call.customer),
    ['one', 'two'],
  )
  h.dispose()
})
test('upload failure after leaving the screen produces no notification or refresh', async () => {
  const pending = deferred(),
    h = await harness({ uploadCustomerDocument: () => pending.promise })
  h.m.file.value = fakeFile()
  const saving = h.m.upload()
  h.dispose()
  pending.reject(Error('Old customer upload failed'))
  await saving
  assert.equal(h.m.busy.value, false)
  assert.equal(h.notifications.length, 0)
  assert.equal(h.updates.length, 0)
})
test('upload respects API permission and double submit does not send another file', async () => {
  const pending = deferred()
  let calls = 0
  const h = await harness({
    uploadCustomerDocument: () => {
      calls++
      return pending.promise
    },
  })
  h.m.file.value = fakeFile()
  h.props.item.allowedActions = []
  await h.m.upload()
  assert.equal(calls, 0)
  h.props.item.allowedActions = ['Upload']
  const first = h.m.upload()
  await h.m.upload()
  assert.equal(calls, 1)
  pending.resolve({ id: 'file' })
  await first
  h.dispose()
})

test('CPF and NIF upload preserve the API type, requirement and country without inventing identity metadata', async () => {
  for (const code of ['CPF', 'NIF']) {
    let payload
    const h = await harness({
      uploadCustomerDocument: async (_id, data) => {
        payload = data
        return { id: 'new' }
      },
    })
    Object.assign(h.props.item, {
      documentTypeId: code + '-type',
      countryId: code === 'CPF' ? 'br' : 'pt',
      allowedActions: ['Upload', 'Download'],
    })
    h.m.file.value = fakeFile()
    await h.m.upload()
    assert.equal(payload.get('documentTypeId'), code + '-type')
    assert.equal(payload.get('countryId'), code === 'CPF' ? 'br' : 'pt')
    assert.equal(payload.get('requirementId'), 'req')
    assert.equal(payload.has('metadata'), false)
    assert.equal(h.updates.length, 1)
    h.dispose()
  }
})
