import test from 'node:test'
import assert from 'node:assert/strict'
import vm from 'node:vm'
import { readFileSync } from 'node:fs'
import { computed, nextTick, reactive, ref } from 'vue'
import * as requestContext from '../src/services/requestContext.js'
import { readBankCatalog } from '../src/services/bankCatalog.js'
const source = readFileSync(
  new URL('../src/components/Clients/ClientBankAccountsPanel.vue', import.meta.url),
  'utf8',
)
  .match(/<script setup>([\s\S]*?)<\/script>/)[1]
  .replace(/\nload\(\)\n/, '\nconst ready = load()\n')
async function harness(failSecondPage = false) {
  const calls = []
  let fail = failSecondPage
  const service = Object.fromEntries(
    [
      'archiveCustomerBankAccount',
      'createCustomerBankAccount',
      'getCustomerBankAccount',
      'setPrimaryCustomerBankAccount',
      'updateCustomerBankAccount',
    ].map((name) => [
      name,
      () => {
        throw Error('Unexpected write')
      },
    ]),
  )
  service.listBanks = async (params) => {
    calls.push(params)
    if (fail && params.page === 2) throw Error('Catalog failed')
    return {
      data: [{ id: `bank-${params.page}`, code: params.page, name: `Bank ${params.page}` }],
      pagination: { page: params.page, totalPages: 2, totalItems: 2 },
    }
  }
  service.listCustomerBankAccounts = async () => ({
    data: [{ id: 'account', bankId: 'bank-2', accountNumberMasked: '****' }],
  })
  const values = {
    vue: { computed, nextTick, reactive, ref, watch() {}, onScopeDispose() {} },
    quasar: { QDialog: {}, QExpansionItem: {} },
    'src/services/customerService': service,
    'src/services/requestContext': requestContext,
    'src/services/bankCatalog': { readBankCatalog },
    'src/services/apiError': { getApiErrorMessage: (_, fallback) => fallback },
    'src/composables/global/useNotification': {
      default: () => ({ successNotify() {}, errorNotify() {} }),
    },
  }
  const context = vm.createContext({
    defineExpose() {},
    defineProps: () => ({ customerId: 'test-customer' }),
    defineEmits: () => () => {},
  })
  const mod = new vm.SourceTextModule(
    source +
      '\nexport { ready, load, loading, loadError, bankOptions, filteredBankOptions, bankName, bankOptionLabel, filterBanks, accounts };',
    { context },
  )
  await mod.link((name) => {
    const exports = name.endsWith('.vue') ? { default: {} } : values[name]
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
  await mod.namespace.ready
  return {
    model: mod.namespace,
    calls,
    recover: () => {
      fail = false
    },
  }
}
test('bank section resolves row and selected bank labels from subsequent catalog pages', async () => {
  const { model, calls } = await harness()
  assert.equal(model.bankName(model.accounts.value[0].bankId), '2 — Bank 2')
  assert.equal(model.filteredBankOptions.value.length, 0)
  assert.equal(model.loading.value, false)
  assert.equal(model.loadError.value, '')
  assert.ok(calls.every((params) => params.isActive === true))
})
test('catalog failure shows existing section error and retry restores the complete catalog', async () => {
  const { model, recover } = await harness(true)
  assert.match(model.loadError.value, /catálogo de bancos/)
  assert.equal(model.bankOptions.value.length, 0)
  assert.equal(model.filteredBankOptions.value.length, 0)
  assert.equal(model.loading.value, false)
  recover()
  await model.load()
  assert.equal(model.loadError.value, '')
  assert.equal(model.bankOptions.value.length, 2)
})

test('bank suggestions require text, search code/name and retain selected labels', async () => {
  const { model } = await harness();
  model.filterBanks('   ', callback => callback());
  assert.equal(model.filteredBankOptions.value.length, 0);
  model.filterBanks('Bank 2', callback => callback());
  assert.equal(model.filteredBankOptions.value[0].value, 'bank-2');
  model.filterBanks('1', callback => callback());
  assert.equal(model.filteredBankOptions.value[0].value, 'bank-1');
  model.filterBanks('', callback => callback());
  assert.equal(model.bankOptionLabel('bank-2'), '2 — Bank 2');
});
