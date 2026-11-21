import test from 'node:test'
import assert from 'node:assert/strict'
import vm from 'node:vm'
import { readFileSync } from 'node:fs'
import { parse, compileScript, compileTemplate } from '@vue/compiler-sfc'
import * as Vue from 'vue'
import { useFinanceResource } from '../src/composables/useFinanceResource.js'
import { readGlobalWalletFx } from '../src/services/globalWalletFx.js'
import { readCurrentPages } from '../src/services/requestContext.js'
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
test('workflow states validate their own reason or exact execution phrase before confirmation', async () => {
  for (const mode of ['approve', 'reject', 'execute', 'cancel']) {
    let calls = 0
    const { h, stop } = await setup(dialogFile, { mode, submit: async () => calls++ })
    await h.confirm()
    assert.equal(calls, mode === 'approve' ? 1 : 0)
    if (mode === 'execute') {
      h.content.value = 'confirmar'
      await h.confirm()
      assert.equal(calls, 0)
      h.content.value = 'CONFIRMAR'
    } else h.content.value = 'Motivo fictício QA'
    await h.confirm()
    assert.equal(calls, mode === 'approve' ? 2 : 1)
    stop()
  }
})
test('attachment requires a nonempty PDF and preserves the selected file and description on failure', async () => {
  let calls = 0
  const { h, events, stop } = await setup(dialogFile, {
    mode: 'attachment',
    submit: async () => {
      calls++
      throw Error('Unavailable mapping')
    },
  })
  h.content.value = 'Comprovante fictício QA'
  h.file.value = { name: 'not-a-pdf.txt', size: 12, type: 'text/plain' }
  await h.confirm()
  assert.equal(calls, 0)
  const file = { name: 'ficticio.pdf', size: 20, type: 'application/pdf' }
  h.file.value = file
  await h.confirm()
  assert.equal(calls, 1)
  assert.equal(h.file.value.name, 'ficticio.pdf')
  assert.equal(h.content.value, 'Comprovante fictício QA')
  assert.ok(h.error.value)
  assert.equal(
    events.some(([e]) => e === 'completed'),
    false,
  )
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
      'src/services/globalWalletFx': { readGlobalWalletFx },
      'src/services/walletDirectoryApi': {
        readWalletClients: async () => [],
        walletTotalsModel: () => ({}),
      },
      'src/services/globalWallets': {
        readGlobalPortfolios: async () => null,
        globalWalletRows: () => null,
        globalWalletSummary: () => null,
      },
      'src/services/requestContext': {
        readCurrentPages,
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
test('workflow confirmation opens password intent without writing, preserving action reason and version', async () => {
  for (const [mode, action, content] of [
    ['approve', 'Approve', 'Nota QA'],
    ['reject', 'Reject', 'Motivo QA'],
    ['execute', 'Execute', 'CONFIRMAR'],
    ['cancel', 'Cancel', 'Cancelamento QA'],
  ]) {
    const { h, record, writes, stop } = await setupPage()
    record.availableActions = [action]
    h.startWorkflow(action)
    h.busy.value = true
    const result = await h.submitState(content)
    assert.equal(writes.length, 0)
    h.stateCompleted(result)
    assert.equal(h.busy.value, false)
    assert.equal(h.actionToConfirm.value, action)
    assert.equal(h.actionSnapshot.value.reason, mode === 'execute' ? null : content)
    assert.equal(h.actionSnapshot.value.version, 2)
    stop()
  }
})
test('stale workflow version or lost permission never opens a password intent', async () => {
  for (const change of ['version', 'permission']) {
    const { h, record, writes, stop } = await setupPage()
    record.availableActions = ['Approve']
    h.startWorkflow('Approve')
    if (change === 'version') record.version++
    else record.availableActions = []
    await assert.rejects(() => h.submitState('Nota QA'))
    assert.equal(h.actionToConfirm.value, null)
    assert.equal(writes.length, 0)
    stop()
  }
})
const detailFile = 'src/components/Finance/TransactionDetail.vue'
const detailDependencies = {
  'src/services/financeService': {
    financeGet: async () => ({ data: [] }),
    financeLabel: String,
    money: String,
  },
  'src/composables/useFinanceResource': { useFinanceResource },
  'src/services/requestContext': { readCurrentPages },
  'src/services/auditModel': { auditAction: String, auditField: String, auditValue: String },
  'src/services/contractTransactionView': {
    contractEndpoint: () => ({ title: 'Carteira', detail: '' }),
  },
}
test('transaction detail keeps unavailable actions disabled and uses current action permissions', async () => {
  const record = Vue.reactive({
    id: 'qa',
    version: 1,
    type: 'Deposit',
    status: 'Validated',
    availableActions: ['Approve', 'Cancel'],
    documents: [],
  })
  const { h, events, stop } = await setup(
    detailFile,
    { record, busy: false, read: async () => ({ data: [] }) },
    detailDependencies,
  )
  h.selectAction(h.actions.value.find((a) => a.key === 'Execute'))
  assert.equal(events.length, 0)
  h.selectAction(h.actions.value.find((a) => a.key === 'Approve'))
  assert.deepEqual(events[0], ['action', 'Approve'])
  record.availableActions = []
  h.selectAction({ key: 'Approve', disabled: false })
  assert.equal(events.length, 1)
  stop()
})
test('original transaction is checked by identity and fails independently of detail and history', async () => {
  const record = {
    id: 'qa',
    version: 1,
    status: 'Completed',
    correctsTransactionId: 'original',
    availableActions: [],
  }
  const read = async (path) => ({
    data: path.includes('/transactions/') ? { id: 'different', amount: 999 } : [],
  })
  const { h, events, stop } = await setup(
    detailFile,
    { record, busy: false, read },
    detailDependencies,
  )
  await h.loadOriginal()
  await h.loadHistory()
  assert.ok(h.original.state.error)
  assert.equal(h.original.state.data, null)
  assert.equal(h.history.state.error, '')
  h.selectAction(h.actions.value.find((a) => a.key === 'Original'))
  assert.deepEqual(events[0], ['open', 'original'])
  stop()
})
test('closing transaction detail discards late history and original responses', async () => {
  const resolve = []
  const read = () => new Promise((r) => resolve.push(r))
  const { h, stop } = await setup(
    detailFile,
    { record: { id: 'qa', correctsTransactionId: 'original' }, busy: false, read },
    detailDependencies,
  )
  stop()
  resolve.forEach((r) => r({ data: { id: 'original' } }))
  await Vue.nextTick()
  assert.equal(h.history.state.data, null)
  assert.equal(h.original.state.data, null)
})

test('validate modal allows an optional observation and retains it on failure', async () => {
  let calls = 0
  const { h, events, stop } = await setup(dialogFile, {
    mode: 'validate',
    submit: async () => {
      calls++
      throw Error('offline')
    },
  })
  assert.equal(h.valid.value, true)
  assert.equal(h.workflow.value.notice, 'Você está validando esta solicitação')
  h.content.value = ' Conferência fictícia '
  await h.confirm()
  assert.equal(calls, 1)
  assert.equal(h.content.value, ' Conferência fictícia ')
  assert.ok(h.error.value)
  assert.equal(
    events.some(([event]) => event === 'completed'),
    false,
  )
  stop()
})
test('validate opens the existing observation step and then requires the existing password confirmation', async () => {
  const { h, record, writes, stop } = await setupPage()
  record.availableActions = ['Validate']
  h.startWorkflow('Validate')
  assert.equal(h.stateDialog.value.mode, 'validate')
  assert.equal(h.actionToConfirm.value, null)
  const result = await h.submitState('')
  assert.equal(result.action, 'Validate')
  assert.equal(writes.length, 0)
  h.stateCompleted(result)
  assert.equal(h.actionToConfirm.value, 'Validate')
  assert.equal(writes.length, 0)
  await h.executeConfirmed('test-password')
  assert.equal(writes.length, 1)
  assert.equal(writes[0][2].action, 'Validate')
  stop()
})
