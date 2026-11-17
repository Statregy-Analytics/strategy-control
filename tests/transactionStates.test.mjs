import test from 'node:test'
import assert from 'node:assert/strict'
import vm from 'node:vm'
import { readFileSync } from 'node:fs'
import { parse, compileScript, compileTemplate } from '@vue/compiler-sfc'
import * as Vue from 'vue'
import { useFinanceResource } from '../src/composables/useFinanceResource.js'
async function setup(file, props = {}, dependencies = {}) {
  const events = [],
    context = vm.createContext({ console, setTimeout })
  const { descriptor } = parse(readFileSync(file, 'utf8'))
  const script = compileScript(descriptor, { id: file })
  const template = compileTemplate({
    source: descriptor.template.content,
    filename: file,
    id: file,
    compilerOptions: { bindingMetadata: script.bindings },
  })
  assert.deepEqual(template.errors, [])
  const module = new vm.SourceTextModule(script.content, { context })
  await module.link(async (name) => {
    const values = name === 'vue' ? Vue : dependencies[name] || { default: {} }
    return new vm.SyntheticModule(
      Object.keys(values),
      function () {
        for (const [key, value] of Object.entries(values)) this.setExport(key, value)
      },
      { context },
    )
  })
  await module.evaluate()
  const scope = Vue.effectScope()
  const h = scope.run(() =>
    module.namespace.default.setup(props, { expose() {}, emit: (...args) => events.push(args) }),
  )
  return { h, events, stop: () => scope.stop() }
}
const dialogFile = 'src/components/Finance/TransactionStateDialog.vue'
test('correction and observation require text; failed submission retains it for retry', async () => {
  for (const mode of ['correction', 'observation']) {
    let calls = 0
    const { h, events, stop } = await setup(dialogFile, {
      mode,
      submit: async () => {
        if (++calls === 1) throw Error('offline')
        return 'saved'
      },
    })
    h.content.value = '   '
    await h.confirm()
    assert.equal(calls, 0)
    h.content.value = ' teste '
    await h.confirm()
    assert.equal(h.content.value, ' teste ')
    assert.ok(h.error.value)
    assert.equal(
      events.some(([event]) => event === 'completed'),
      false,
    )
    await h.confirm()
    assert.equal(calls, 2)
    assert.equal(h.error.value, '')
    assert.equal(events.filter(([event]) => event === 'completed').length, 1)
    stop()
  }
})
test('pending submissions cannot be duplicated or complete after the panel is disposed', async () => {
  let resolve,
    calls = 0
  const { h, events, stop } = await setup(dialogFile, {
    mode: 'correction',
    submit: () => {
      calls++
      return new Promise((r) => {
        resolve = r
      })
    },
  })
  h.content.value = 'Ajustar valor'
  const first = h.confirm()
  await h.confirm()
  assert.equal(calls, 1)
  stop()
  resolve()
  await first
  assert.equal(
    events.some(([event]) => event === 'completed'),
    false,
  )
})
test('receipt download keeps the panel open; confirmation closes without another download', async () => {
  let calls = 0
  const { h, events, stop } = await setup(dialogFile, {
    mode: 'receipt',
    submit: async () => {
      calls++
    },
  })
  await h.download()
  assert.equal(calls, 1)
  assert.equal(
    events.some(([event]) => event === 'completed'),
    false,
  )
  await h.confirm()
  assert.equal(calls, 1)
  assert.equal(events.filter(([event]) => event === 'close').length, 1)
  stop()
})
async function setupPage() {
  const writes = []
  const record = {
    id: 'request',
    version: 2,
    type: 'Withdrawal',
    availableActions: ['RequestCorrection', 'AddObservation'],
    currency: { isoCode: 'BRL' },
  }
  const page = await setup(
    'src/pages/TransctionPage.vue',
    {},
    {
      quasar: { useQuasar: () => ({ notify() {} }) },
      'vue-router': { useRoute: () => ({ query: {} }) },
      'src/composables/useFinanceResource': { useFinanceResource },
      'src/services/globalWallets': {
        readGlobalPortfolios: async () => null,
        globalWalletRows: () => null,
        globalWalletSummary: () => null,
      },
      'src/services/requestContext': {
        createRequestContext: () => ({ capture: () => () => true, invalidate() {}, dispose() {} }),
      },
      'src/services/transactionOperations': { submitAdminTransaction() {} },
      'src/services/documentAdminService': {
        downloadDocument() {
          throw Error('unexpected download')
        },
      },
      'src/services/contractTransactionView': Object.fromEntries(
        [
          'isContractTransaction',
          'contractTransactionLabel',
          'contractEndpoint',
          'contractSourceCurrency',
          'contractTransactionTone',
        ].map((k) => [k, () => false]),
      ),
      'src/services/financeService': {
        financeGet: async () => ({ data: record }),
        financeWrite: async (...args) => {
          writes.push(args)
        },
        columns: (v) => v,
        financeLabel: String,
        money: String,
        dateLabel: String,
        endpointLabel: String,
      },
    },
  )
  page.h.id.value = record.id
  page.h.dialog.value = true
  await page.h.loadDetail()
  return { ...page, record, writes }
}
test('correction sends its own reason and version to the action endpoint, not a financial edit', async () => {
  const { h, writes, stop } = await setupPage()
  h.openState('correction')
  await h.submitState('  Corrigir comprovante  ')
  assert.equal(writes.length, 1)
  assert.equal(writes[0][0], 'post')
  assert.equal(writes[0][1], 'admin/transactions/request/actions')
  assert.equal(
    JSON.stringify(writes[0][2]),
    JSON.stringify({
      action: 'RequestCorrection',
      reason: 'Corrigir comprovante',
      expectedVersion: 2,
    }),
  )
  stop()
})
test('changed version or removed permission prevents stale actions from being sent', async () => {
  for (const change of ['version', 'permission']) {
    const { h, record, writes, stop } = await setupPage()
    h.openState('correction')
    if (change === 'version') record.version++
    else record.availableActions = []
    await assert.rejects(() => h.submitState('Ajustar'))
    assert.equal(writes.length, 0)
    stop()
  }
})
test('observation uses the observation endpoint; read-only records cannot open write dialogs', async () => {
  const { h, record, writes, stop } = await setupPage()
  h.openState('observation')
  await h.submitState('  Nota QA  ')
  assert.equal(writes[0][1], 'admin/transactions/request/observations')
  assert.equal(writes[0][2].content, 'Nota QA')
  h.stateDialog.value = null
  record.availableActions = []
  h.openState('observation')
  assert.equal(h.stateDialog.value, null)
  stop()
})
