import test from 'node:test'
import assert from 'node:assert/strict'
import { componentModel, deferred } from './helpers/componentModel.mjs'
import * as requestContext from '../src/services/requestContext.js'
async function setup(overrides = {}) {
  const names = [
    'createDocumentCategory',
    'createDocumentType',
    'createMetadataSchema',
    'getDocumentDataDefinition',
    'getDocumentUploadDefinition',
    'listDocumentCategories',
    'listDocumentTypeCountries',
    'listDocumentTypes',
    'listMetadataSchemas',
    'publishMetadataSchema',
    'retireMetadataSchema',
    'setDocumentTypeCountry',
    'validateMetadataInstance',
    'validateMetadataSchema',
  ]
  const service = Object.fromEntries(names.map((name) => [name, async () => []]))
  Object.assign(service, overrides)
  const h = await componentModel('src/pages/DataManagement/DocumentSettingsPage.vue', {
    modules: {
      'src/services/requestContext': requestContext,
      'src/services/documentAdminService': service,
    },
    exports:
      'loadTypes, types, categoryFilter, openType, countries, editorDialog, selectedType, selectedCountryId, loadDefinition, definitionText, saveCountry, countryIdDraft, countrySaving',
  })
  await h.ready
  return h
}
test('document type filtering ignores an older response', async () => {
  let old = deferred()
  const h = await setup({
    listDocumentTypes: async (p) => (p.categoryId === 'old' ? old.promise : [{ id: 'new' }]),
  })
  h.m.categoryFilter.value = 'old'
  const pending = h.m.loadTypes()
  h.m.categoryFilter.value = 'new'
  await h.m.loadTypes()
  old.resolve([{ id: 'old' }])
  await pending
  assert.equal(h.m.types.value[0].id, 'new')
  h.dispose()
})
test('closing and reopening a document editor ignores the old countries', async () => {
  const old = deferred()
  const h = await setup({
    listDocumentTypeCountries: async (id) => (id === 'old' ? old.promise : [{ id: 'new-country' }]),
  })
  const pending = h.m.openType({ id: 'old' })
  h.m.editorDialog.value = false
  await h.m.openType({ id: 'new' })
  old.resolve([{ id: 'old-country' }])
  await pending
  assert.equal(h.m.countries.value[0].id, 'new-country')
  h.dispose()
})
test('latest requested document definition remains visible', async () => {
  const old = deferred()
  const h = await setup({
    getDocumentUploadDefinition: () => old.promise,
    getDocumentDataDefinition: async () => ({ kind: 'data' }),
  })
  await h.m.openType({ id: 'type' })
  h.m.selectedCountryId.value = 'country'
  const pending = h.m.loadDefinition('upload')
  await h.m.loadDefinition('data')
  old.resolve({ kind: 'upload' })
  await pending
  assert.equal(JSON.parse(h.m.definitionText.value).kind, 'data')
  h.dispose()
})
test('late country association does not clear another editor draft or announce success', async () => {
  const old = deferred()
  let writes = 0
  const h = await setup({
    setDocumentTypeCountry: () => {
      writes++
      return old.promise
    },
  })
  await h.m.openType({ id: 'old' })
  h.m.countryIdDraft.value = '12345678-1234-4123-8123-123456789012'
  const pending = h.m.saveCountry()
  await h.m.saveCountry()
  h.m.editorDialog.value = false
  await h.m.openType({ id: 'new' })
  h.m.countryIdDraft.value = 'new-draft'
  old.resolve({})
  await pending
  assert.equal(writes, 1)
  assert.equal(h.m.countryIdDraft.value, 'new-draft')
  assert.equal(h.notices.length, 0)
  h.dispose()
})
