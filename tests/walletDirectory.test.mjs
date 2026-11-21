import test from 'node:test'
import assert from 'node:assert/strict'
import vm from 'node:vm'
import { readFileSync } from 'node:fs'
import { parse, compileScript } from '@vue/compiler-sfc'
import * as Vue from 'vue'
import * as wallet from '../src/services/walletModel.js'
import { foldSearch } from '../src/services/adminWorkspaceModel.js'
const { descriptor } = parse(readFileSync('src/components/Finance/WalletDirectory.vue', 'utf8'))
const code = compileScript(descriptor, { id: 'wallet-directory-test' }).content
async function instance(type = 'total', rows = []) {
  const context = vm.createContext({ console, Date, Intl })
  const mod = new vm.SourceTextModule(code, { context })
  await mod.link(async (name) => {
    const values =
      name === 'vue'
        ? Vue
        : name.endsWith('walletModel')
          ? wallet
          : name.endsWith('adminWorkspaceModel')
            ? { foldSearch }
            : name.endsWith('financeService')
              ? { financeLabel: (v) => v }
              : { default: {} }
    return new vm.SyntheticModule(
      Object.keys(values),
      function () {
        for (const [k, v] of Object.entries(values)) this.setExport(k, v)
      },
      { context },
    )
  })
  await mod.evaluate()
  const props = Vue.reactive({ type, rows }),
    events = [],
    scope = Vue.effectScope()
  const state = scope.run(() =>
    mod.namespace.default.setup(props, { expose() {}, emit: (...a) => events.push(a) }),
  )
  return { state, props, events, dispose: () => scope.stop() }
}
const row = (key, type, currency, balance) => ({
  key,
  type,
  customerId: key,
  clientName: key === 'a' ? 'Éric Teste' : 'Cláudio QA',
  clientCode: 'SA-' + key,
  maskedDocument: '****1234',
  status: 'Active',
  currencies: [{ currency, balance }],
  ledgerWalletIds: [key],
})
test('each wallet list exposes the Figma columns and direct actions, preserving unknown fields', async () => {
  const expected = {
    total: [
      'wallet',
      'type',
      'client',
      'code',
      'balance',
      'currencies',
      'status',
      'lastMovement',
      'holdings',
      'actions',
    ],
    deposit: [
      'wallet',
      'client',
      'clientCode',
      'currencies',
      'balance',
      'lastMovement',
      'movementCount',
      'status',
      'actions',
    ],
    assets: [
      'wallet',
      'client',
      'assets',
      'declared',
      'current',
      'appreciation',
      'variation',
      'status',
      'actions',
    ],
    strategy: [
      'wallet',
      'client',
      'contractCount',
      'base',
      'balance',
      'yield',
      'currencies',
      'status',
      'actions',
    ],
  }
  for (const type of Object.keys(expected)) {
    const i = await instance(type, [row('a', type, 'BRL', 0)])
    assert.deepEqual(
      Array.from(i.state.columns.value, (c) => c.name),
      expected[type],
    )
    assert.equal(i.state.holdings(i.props.rows[0]), '—')
    assert.equal(i.state.percentage(null), '—')
    assert.equal(i.state.percentage(0), '0%')
    assert.equal(i.state.holdings({ type: 'assets', assetCount: 1 }), '1 bem')
    assert.equal(i.state.holdings({ type: 'assets', assetCount: 0 }), '0 bens')
    assert.equal(i.state.percentage(-2.5), '-2,5%')
    const col = i.state.columns.value.find((c) => c.name === 'balance')
    if (col) assert.equal(col.field(i.props.rows[0]), '—')
    i.dispose()
  }
})
test('filters combine without comparing money from different currencies or mutating input order', async () => {
  const rows = [
    row('a', 'deposit', 'BRL', 20),
    row('b', 'deposit', 'USD', 1000),
    row('c', 'strategy', 'BRL', 30),
  ]
  const i = await instance('total', rows)
  assert.equal(i.state.comparisonCurrency.value, null)
  i.state.search.value = 'eric'
  assert.equal(i.state.filtered.value.length, 1)
  i.state.search.value = ''
  i.state.currency.value = 'BRL'
  i.state.sort.value = 'desc'
  assert.deepEqual(
    Array.from(i.state.filtered.value, (r) => r.key),
    ['c', 'a'],
  )
  assert.deepEqual(
    rows.map((r) => r.key),
    ['a', 'b', 'c'],
  )
  i.state.kind.value = 'deposit'
  assert.deepEqual(
    Array.from(i.state.filtered.value, (r) => r.key),
    ['a'],
  )
  i.state.status.value = 'Inactive'
  assert.equal(i.state.filtered.value.length, 0)
  i.state.status.value = null
  i.state.page.value = 2
  i.state.expanded.value = 'a'
  i.props.type = 'strategy'
  await Vue.nextTick()
  assert.equal(i.state.page.value, 1)
  assert.equal(i.state.expanded.value, null)
  assert.equal(i.state.kind.value, null)
  assert.equal(i.state.currency.value, null)
  assert.equal(i.state.sort.value, null)
  i.dispose()
})
test('opening a wallet, ledger or assets follows the existing domain destination', async () => {
  const r = row('a', 'assets', 'BRL', 10),
    i = await instance('total', [r])
  i.state.primaryAction(r)
  assert.deepEqual(Array.from(i.events[0]), ['open', 'a', 'portfolio', 'assets'])
  i.props.type = 'assets'
  await Vue.nextTick()
  i.state.primaryAction(r)
  assert.equal(i.state.expanded.value, 'a')
  i.state.primaryAction(r)
  assert.equal(i.state.expanded.value, null)
  i.props.type = 'strategy'
  await Vue.nextTick()
  i.state.primaryAction({ ...r, type: 'strategy' })
  assert.deepEqual(Array.from(i.events[1]), ['open', 'a', 'statement', 'strategy'])
  i.dispose()
})
test('clearing extra currency filters resets sort and paging; no-results does not mutate rows', async () => {
  const i = await instance('total', [row('a', 'deposit', 'BRL', 0), row('b', 'deposit', 'USD', 1)])
  i.state.toggleFilters()
  i.state.currency.value = 'BRL'
  i.state.sort.value = 'desc'
  i.state.page.value = 2
  i.state.toggleFilters()
  await Vue.nextTick()
  assert.equal(i.state.currency.value, null)
  assert.equal(i.state.sort.value, null)
  assert.equal(i.state.page.value, 1)
  i.state.search.value = 'no-match'
  await Vue.nextTick()
  assert.equal(i.state.pageRows.value.length, 0)
  assert.equal(i.props.rows.length, 2)
  i.state.setPageSize(5)
  assert.equal(i.state.page.value, 1)
  assert.equal(i.state.pageSize.value, 5)
  i.dispose()
})
test('money display preserves catalog currencies not present in the legacy seven-item list', () => {
  assert.notEqual(wallet.walletMoney(42, 'TWD'), '—')
  assert.notEqual(wallet.walletMoney(42, 'GBP'), '—')
  assert.equal(wallet.walletMoney(null, 'TWD'), '—')
  assert.equal(
    wallet.walletMoney(0, 'TWD'),
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'TWD' }).format(0),
  )
  assert.equal(wallet.walletMoney(42, 'not-a-code'), '—')
})
