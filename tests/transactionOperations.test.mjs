import test from 'node:test'
import assert from 'node:assert/strict'
import vm from 'node:vm'
import { readFileSync } from 'node:fs'
import { parse, compileScript, compileTemplate } from '@vue/compiler-sfc'
import * as Vue from 'vue'
import { useFinanceResource } from '../src/composables/useFinanceResource.js'
import { readWalletBankAccounts } from '../src/services/walletModel.js'
import { readCurrentPages } from '../src/services/requestContext.js'
import { positiveAmount } from '../src/services/financeModels.js'
const context = vm.createContext({ console, Function })
const pending = () => new Promise(() => {})
async function moduleFor(file, deps) {
  const mod = new vm.SourceTextModule(readFileSync(file, 'utf8'), { context })
  await mod.link(async (name) => {
    const values = deps[name]
    if (!values) throw Error(name)
    return new vm.SyntheticModule(
      Object.keys(values),
      function () {
        for (const k in values) this.setExport(k, values[k])
      },
      { context },
    )
  })
  await mod.evaluate()
  return mod.namespace
}
const operations = await moduleFor('src/services/transactionOperations.js', {
  './financeService': { financeGet: pending, financeWrite: pending },
  './financeModels': { positiveAmount },
})
const catalog = [{ id: 'brl', value: 'BRL' }],
  wallets = [
    { type: 'Free', currencyId: 'brl', available: 20 },
    { type: 'Applied', currencyId: 'brl', available: 5 },
  ]
const base = {
  kind: 'deposit',
  clientId: 'customer',
  currency: 'BRL',
  amount: 10,
  bankId: 'bank',
  from: 'deposit',
  to: 'strategy',
}
test('deposit uses the catalog ID and documented fields, never a currency guess', () => {
  const actual = operations.transactionOperationPayload(base, catalog, wallets)
  assert.equal(actual.path, 'deposits')
  assert.equal(actual.payload.currencyId, 'brl')
  assert.equal(actual.payload.sourceBankAccountId, 'bank')
  assert.throws(
    () => operations.transactionOperationPayload({ ...base, currency: 'USD' }, catalog, wallets),
    /catálogo/,
  )
  assert.throws(
    () => operations.transactionOperationPayload({ ...base, receiptFile: {} }, catalog, wallets),
    /comprovante/,
  )
})
test('withdrawals and transfers reject unknown/insufficient balances before any write', () => {
  for (const available of [null, 'invalid', 5])
    assert.throws(
      () =>
        operations.transactionOperationPayload({ ...base, kind: 'withdrawal' }, catalog, [
          { ...wallets[0], available },
        ]),
      /saldo/,
    )
  const actual = operations.transactionOperationPayload(
    { ...base, kind: 'transfer' },
    catalog,
    wallets,
  )
  assert.equal(actual.path, 'wallet-transfers')
  assert.equal(actual.payload.destinationType, 'Wallet')
  assert.equal(actual.payload.sourceWallet, 'Free')
  assert.equal(actual.payload.destinationContractId, null)
})
test('inter-customer transfer requires another recipient and admin confirmation', () => {
  const form = { ...base, kind: 'transfer', otherClient: true, destinationClientId: 'other' }
  assert.throws(() => operations.transactionOperationPayload(form, catalog, wallets), /senha/)
  assert.throws(
    () =>
      operations.transactionOperationPayload(
        { ...form, password: 'test', destinationClientId: 'customer' },
        catalog,
        wallets,
      ),
    /outro cliente/,
  )
  const result = operations.transactionOperationPayload(
    { ...form, password: 'test' },
    catalog,
    wallets,
  )
  assert.equal(result.payload.destinationWallet, 'Applied')
  assert.equal(result.payload.destinationClientId, 'other')
  assert.equal(result.payload.password, 'test')
})
test('submission reads fresh catalogs/balances and propagates failures without fake success', async () => {
  const writes = []
  const read = async (path) => ({
    data: path === 'preferences/catalog' ? { currencies: catalog } : wallets,
  })
  const write = async (...args) => {
    writes.push(args)
    return { id: 'created' }
  }
  assert.equal((await operations.submitAdminTransaction(base, read, write)).id, 'created')
  assert.equal(writes.length, 1)
  await assert.rejects(() =>
    operations.submitAdminTransaction({ ...base, kind: 'withdrawal', amount: 100 }, read, write),
  )
  assert.equal(writes.length, 1)
  await assert.rejects(
    () =>
      operations.submitAdminTransaction(base, read, async () => {
        throw Error('offline')
      }),
    /offline/,
  )
})
async function setupPassword(submit) {
  const file = 'src/components/Finance/TransactionPassword.vue'
  const { descriptor } = parse(readFileSync(file, 'utf8'))
  const script = compileScript(descriptor, { id: file })
  const events = []
  const module = new vm.SourceTextModule(script.content, { context })
  await module.link(async (name) => {
    const values = name === 'vue' ? Vue : { default: {} }
    return new vm.SyntheticModule(
      Object.keys(values),
      function () {
        for (const k in values) this.setExport(k, values[k])
      },
      { context },
    )
  })
  await module.evaluate()
  const scope = Vue.effectScope()
  const h = scope.run(() =>
    module.namespace.default.setup(
      { submit, summary: 'QA' },
      { expose() {}, emit: (...args) => events.push(args) },
    ),
  )
  return { h, events, stop: () => scope.stop() }
}
test('password failure clears secret, ends busy, and permits a deliberate retry', async () => {
  const { h, events, stop } = await setupPassword(async () => {
    throw Error('failure')
  })
  h.password.value = 'test'
  await h.confirm()
  assert.equal(h.password.value, '')
  assert.equal(h.busy.value, false)
  assert.ok(h.error.value)
  assert.equal(
    events.some(([e]) => e === 'completed'),
    false,
  )
  stop()
})
test('confirmation ends busy before completion so the parent cannot remain locked', async () => {
  const { h, events, stop } = await setupPassword(async () => ({ id: 'done' }))
  h.password.value = 'test'
  await h.confirm()
  const completed = events.findIndex(([e]) => e === 'completed')
  assert.ok(completed > 0)
  assert.deepEqual(events[completed - 1], ['busy', false])
  assert.equal(h.password.value, '')
  stop()
})
test('transaction templates compile, including parent event handlers', () => {
  for (const file of [
    'src/pages/TransctionPage.vue',
    'src/components/Finance/TransactionCreate.vue',
    'src/components/Finance/TransactionEdit.vue',
    'src/components/Finance/TransactionPassword.vue',
    'src/components/Workspaces/LogicActiveRow.vue',
    'src/pages/Workspaces/AdminWorkspacePage.vue',
  ]) {
    const { descriptor } = parse(readFileSync(file, 'utf8'))
    const script = compileScript(descriptor, { id: file })
    const compiled = compileTemplate({
      source: descriptor.template.content,
      filename: file,
      id: file,
      compilerOptions: { bindingMetadata: script.bindings },
    })
    assert.deepEqual(compiled.errors, [], file)
  }
})

async function setupEditor(correction = false) {
  const file = 'src/components/Finance/TransactionEdit.vue',
    events = [],
    writes = []
  let failNote = true
  const read = async (path) => ({
    data: path.endsWith('/bank-accounts')
      ? [{ id: 'bank', status: 'Active', currencyIsoCode: 'BRL' }]
      : path.endsWith('/wallets')
        ? [{ id: 'wallet', type: 'Free', currencyIsoCode: 'BRL', available: 200 }]
        : [],
    pagination: { totalPages: 1 },
  })
  const write = async (method, path, payload) => {
    writes.push({ method, path, payload })
    if (path.endsWith('/observations') && failNote) {
      failNote = false
      throw Error('temporary')
    }
    return { id: 'record', version: 3 }
  }
  const props = {
    record: {
      id: 'record',
      requestNumber: 'REQ-QA',
      type: 'Deposit',
      amount: 100,
      version: 2,
      client: { id: 'customer', name: 'QA' },
      source: { id: 'bank', kind: 'BankAccount' },
      currency: { isoCode: 'BRL' },
    },
    correction,
    read,
    write,
  }
  const deps = {
    vue: Vue,
    'src/services/financeService': { financeGet: pending, financeWrite: pending, money: String },
    'src/composables/useFinanceResource': { useFinanceResource },
    'src/services/walletModel': { readWalletBankAccounts },
    'src/services/requestContext': { readCurrentPages },
  }
  const { descriptor } = parse(readFileSync(file, 'utf8'))
  const script = compileScript(descriptor, { id: file })
  const m = new vm.SourceTextModule(script.content, { context })
  await m.link(async (name) => {
    const values = deps[name] || { default: {} }
    return new vm.SyntheticModule(
      Object.keys(values),
      function () {
        for (const k in values) this.setExport(k, values[k])
      },
      { context },
    )
  })
  await m.evaluate()
  const scope = Vue.effectScope()
  const h = scope.run(() =>
    m.namespace.default.setup(props, { expose() {}, emit: (...a) => events.push(a) }),
  )
  await new Promise((r) => setTimeout(r, 0))
  return { h, writes, events, stop: () => scope.stop() }
}
test('partial pending edit preserves the saved version and retries only the failed observation', async () => {
  const { h, writes, stop } = await setupEditor()
  h.amount.value = 110
  h.note.value = 'QA'
  await h.save()
  assert.equal(writes.filter((w) => w.method === 'put').length, 1)
  assert.equal(h.note.value, 'QA')
  assert.ok(h.error.value)
  await h.save()
  assert.equal(writes.filter((w) => w.method === 'put').length, 1)
  assert.equal(writes.filter((w) => w.path.endsWith('/observations')).length, 2)
  assert.equal(h.note.value, '')
  stop()
})
test('decreasing correction never guesses origins; increasing correction uses documented password/version', async () => {
  const { h, writes, stop } = await setupEditor(true)
  h.amount.value = 50
  h.note.value = 'QA correction'
  await h.save()
  assert.equal(writes.length, 0)
  assert.equal(h.confirming.value, false)
  h.amount.value = 150
  await h.save()
  assert.equal(h.confirming.value, true)
  assert.equal(writes.length, 0)
  await h.confirmCorrection('test')
  assert.equal(writes[0].payload.expectedVersion, 2)
  assert.equal(writes[0].payload.differenceSource, null)
  assert.equal(writes[0].payload.correctAmount, 150)
  stop()
})
