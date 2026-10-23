import test from 'node:test'
import assert from 'node:assert/strict'
import { componentModel, deferred, tick } from './helpers/componentModel.mjs'
import { useFinanceResource } from '../src/composables/useFinanceResource.js'
import * as model from '../src/services/clientAssetProfile.js'
async function asset(catalog) {
  const writes = []
  const h = await componentModel('src/components/Clients/ClientAssetRegistry.vue', {
    props: { customerId: 'one', currencies: [] },
    exports: 'dialog,selectedGroup,draft,save,error',
    modules: {
      'src/services/customerService': { getPreferenceCatalog: catalog },
      'src/services/clientAssetProfile': model,
      'src/composables/useFinanceResource': { useFinanceResource },
      'src/services/financeService': {
        financeGet: async () => ({ data: [] }),
        financeLabel: (x) => x,
        money: (x) => x,
        financeWrite: async (method, path, payload) => {
          writes.push({ method, path, payload })
          return { id: 'asset' }
        },
      },
    },
  })
  h.m.selectedGroup.value = { type: 'RealEstate', singular: 'imóvel' }
  h.m.dialog.value = true
  h.m.draft.value = { nickname: 'QA', declaredValue: 0, paidOff: true }
  return { ...h, writes }
}
test('a customer without a wallet uses the catalog BRL ID when creating an asset', async () => {
  const h = await asset(async () => ({ currencies: [{ value: 'BRL', id: 'catalog-brl' }] }))
  await h.m.save()
  assert.equal(h.writes.length, 1)
  assert.equal(h.writes[0].payload.currencyId, 'catalog-brl')
  assert.equal(h.writes[0].payload.declaredValue, 0)
  h.dispose()
})
test('missing catalog currency ID does not write with a code or invented ID', async () => {
  const h = await asset(async () => ({ currencies: [{ value: 'BRL' }] }))
  await h.m.save()
  assert.equal(h.writes.length, 0)
  assert.match(h.m.error.value, /identificar a moeda/)
  h.dispose()
})
test('changing customer during currency resolution stops asset creation', async () => {
  const held = deferred(),
    h = await asset(() => held.promise)
  const pending = h.m.save()
  await tick()
  h.props.customerId = 'two'
  held.resolve({ currencies: [{ value: 'BRL', id: 'catalog-brl' }] })
  await pending
  assert.equal(h.writes.length, 0)
  h.dispose()
})
