import test from 'node:test'
import assert from 'node:assert/strict'
import { componentModel, deferred, tick } from './helpers/componentModel.mjs'
import * as scope from '../src/services/requestContext.js'
async function preferences(overrides = {}) {
  return componentModel('src/components/Clients/ClientPreferencesPanel.vue', {
    props: { customerId: 'one', hideStatus: true },
    exports: 'form,load,loading,savePreferences,savingPreferences',
    modules: {
      'src/services/requestContext': scope,
      'src/services/customerService': {
        getCustomerStatus: async () => null,
        changeCustomerStatus: async () => {},
        getCustomerPreferences: async (id) => ({
          primaryCurrencyCode: id === 'one' ? 'BRL' : 'USD',
        }),
        getPreferenceCatalog: async () => ({ currencies: [] }),
        updateCustomerPreferences: async () => {},
        ...overrides,
      },
    },
  })
}
test('preferences of a previous customer cannot overwrite current fields or ready state', async () => {
  const held = deferred(),
    h = await preferences({
      getCustomerPreferences: async (id) =>
        id === 'one' ? held.promise : { primaryCurrencyCode: 'USD' },
    })
  h.props.customerId = 'two'
  await tick()
  held.resolve({ primaryCurrencyCode: 'BRL' })
  await h.ready
  assert.equal(h.m.form.primaryCurrencyCode, 'USD')
  assert.equal(h.events.filter(([name, value]) => name === 'ready' && value).length, 1)
  h.dispose()
})
test('old preference save cannot notify another customer and repeated submits are blocked', async () => {
  const held = deferred()
  let count = 0
  const h = await preferences({
    updateCustomerPreferences: () => {
      count++
      return held.promise
    },
  })
  await h.ready
  const pending = h.m.savePreferences()
  await h.m.savePreferences()
  assert.equal(count, 1)
  h.props.customerId = 'two'
  await tick()
  held.resolve()
  await pending
  assert.equal(h.m.form.primaryCurrencyCode, 'USD')
  assert.equal(h.notices.length, 0)
  h.dispose()
})
