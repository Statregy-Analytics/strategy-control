import test from 'node:test'
import assert from 'node:assert/strict'
import vm from 'node:vm'
import { readFileSync } from 'node:fs'
import { computed, ref } from 'vue'
import * as photoService from '../src/services/assetPhotos.js'
const source = readFileSync(
  new URL('../src/components/Clients/AssetPhotoGallery.vue', import.meta.url),
  'utf8',
).match(/<script setup>([\s\S]*?)<\/script>/)[1]
async function harness({ failCatalog = false, delayedDetail = false } = {}) {
  let dispose,
    ready,
    resolveDetail,
    urlCalls = 0
  const props = { customerId: 'test-customer', assetId: 'test-asset', assetType: 'Vehicle' }
  const modules = {
    vue: {
      computed,
      ref,
      onBeforeUnmount: (fn) => {
        dispose = fn
      },
      watch: (_, fn) => {
        ready = fn()
      },
    },
    'src/services/assetPhotos': photoService,
    'src/services/apiError': { getApiErrorMessage: (e, f) => e.message || f },
    'src/services/financeService': {
      financeGet: async () => ({
        data: [
          {
            documentId: 'doc',
            documentTypeCode: 'FOTOS_VISTORIA_VEICULO',
            fileName: 'unrelated-filename.png',
            contentType: 'image/png',
          },
        ],
      }),
      financeWrite: async () => {
        throw Error('Unexpected write')
      },
    },
    'src/services/documentAdminService': {
      listDocumentTypes: async () => {
        if (failCatalog) throw Error('Catalog unavailable')
        return [{ id: 'photo-type', code: 'FOTOS_VISTORIA_VEICULO', allowsFileUpload: true }]
      },
      getAdminDocument: async () =>
        delayedDetail
          ? await new Promise((resolve) => {
              resolveDetail = resolve
            })
          : { metadata: '{"assetPhotoSlot":"chassis"}' },
      getDocumentTemporaryUrl: async () => {
        urlCalls++
        return { url: `https://example.com/photo-${urlCalls}.png` }
      },
      uploadCustomerDocument: async () => {
        throw Error('Unexpected upload')
      },
    },
  }
  const context = vm.createContext({ defineProps: () => props, defineExpose() {}, URL })
  const mod = new vm.SourceTextModule(
    source + '\nexport {items,loading,loadFailed,save,preview,previewUrl};',
    { context },
  )
  await mod.link((name) => {
    const exports = name.endsWith('.vue') ? { default: {} } : modules[name]
    assert.ok(exports, name)
    return new vm.SyntheticModule(
      Object.keys(exports),
      function () {
        for (const [key, value] of Object.entries(exports)) this.setExport(key, value)
      },
      { context },
    )
  })
  await mod.evaluate()
  return {
    model: mod.namespace,
    ready,
    dispose: () => dispose(),
    urlCalls: () => urlCalls,
    resolveDetail: (value) => resolveDetail(value),
  }
}
test('gallery resumes vehicle slot from document metadata and refreshes temporary URL when opening', async () => {
  const { model, ready, urlCalls } = await harness()
  await ready
  assert.equal(model.items.value[0].slot, 'chassis')
  assert.equal(model.items.value[0].name, 'unrelated-filename.png')
  assert.equal(urlCalls(), 1)
  await model.preview(model.items.value[0])
  assert.equal(urlCalls(), 2)
  assert.equal(model.previewUrl.value, 'https://example.com/photo-2.png')
})
test('photo catalog outage stays in its section and does not block saving unrelated asset fields', async () => {
  const { model, ready } = await harness({ failCatalog: true })
  await ready
  assert.equal(model.loadFailed.value, true)
  await assert.doesNotReject(model.save('asset'))
})
test('late document response cannot repopulate a disposed gallery', async () => {
  const h = await harness({ delayedDetail: true })
  // Let the catalog/list requests reach the intentionally held document detail.
  await new Promise((resolve) => setImmediate(resolve))
  h.dispose()
  h.resolveDetail({ metadata: '{"assetPhotoSlot":"chassis"}' })
  await h.ready
  assert.equal(h.model.items.value.length, 0)
})
