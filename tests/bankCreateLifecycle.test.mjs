import test from 'node:test'
import assert from 'node:assert/strict'
import { componentModel, deferred } from './helpers/componentModel.mjs'
import * as requestContext from '../src/services/requestContext.js'
import * as countryCatalog from '../src/services/countryCatalog.js'
import { readBankCatalog } from '../src/services/bankCatalog.js'
async function setup(createBank) {
  const h = await componentModel('src/pages/DataManagement/BanksPage.vue', {
    modules: {
      'src/services/requestContext': requestContext,
      'src/services/countryCatalog': countryCatalog,
      'src/services/bankCatalog': { readBankCatalog },
      'src/services/customerService': {
        createBank,
        listBanks: async () => ({ data: [], pagination: { totalItems: 0, totalPages: 1 } }),
        listCountries: async () => ({
          data: [{ id: 'br', name: 'Brasil', isoCode: 'BR', isActive: true }],
          pagination: { totalPages: 1 },
        }),
      },
    },
    exports: 'save,createDialog,form,draft,saving',
  })
  await h.ready
  h.m.createDialog.value = true
  return h
}
test('bank creation does not write after disposal during validation', async () => {
  let writes = 0
  const validation = deferred()
  const h = await setup(async () => {
    writes++
  })
  h.m.form.value = { validate: () => validation.promise }
  const pending = h.m.save()
  h.dispose()
  validation.resolve(true)
  await pending
  assert.equal(writes, 0)
})
test('old bank creation failure does not notify a reopened form', async () => {
  let writes = 0
  const old = deferred()
  const h = await setup(() => {
    writes++
    return old.promise
  })
  h.m.form.value = { validate: async () => true }
  const pending = h.m.save()
  await new Promise((r) => setImmediate(r))
  await h.m.save()
  h.m.createDialog.value = false
  h.m.createDialog.value = true
  old.reject(Error('old error'))
  await pending
  assert.equal(writes, 1)
  assert.equal(h.notices.length, 0)
  assert.equal(h.m.createDialog.value, true)
  assert.equal(h.m.saving.value, false)
  h.dispose()
})
