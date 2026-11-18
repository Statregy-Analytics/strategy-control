import test from 'node:test'
import assert from 'node:assert/strict'
import vm from 'node:vm'
import { readFileSync } from 'node:fs'
import { parse, compileScript, compileTemplate } from '@vue/compiler-sfc'
import * as Vue from 'vue'
import * as requests from '../src/services/requestContext.js'
import { useFinanceResource } from '../src/composables/useFinanceResource.js'
import { projectClientContract } from '../src/services/clientProfileProjection.js'
const tick = () => new Promise((r) => setTimeout(r, 0))
const row = (id, code = 'BRL', client = 'a') => ({
  id,
  name: 'QA ' + id,
  publicCode: 'CTR-QA' + id,
  currencyCode: code,
  clients: [{ clientId: client }],
})
const detail = (id, client = 'a') => ({
  id,
  name: 'QA ' + id,
  publicCode: 'CTR-QA' + id,
  currency: { id: 'BRL', isoCode: id === 'usd' ? 'USD' : 'BRL' },
  primaryEngine: { name: 'Motor fictício QA' },
  businessStatus: { code: 'ACTIVE', name: 'Ativo' },
  participants: [
    {
      clientId: client,
      allocatedAmount: 100,
      baseAmount: 100,
      allocationPercentage: 50,
      linkedAtUtc: '2026-11-18T12:00:00Z',
    },
  ],
  currentBalance: 999999,
})
async function instance(read, options = {}) {
  const file = 'src/components/Clients/ClientPortfolioContracts.vue'
  const { descriptor } = parse(readFileSync(file, 'utf8'))
  const script = compileScript(descriptor, { id: file })
  const template = compileTemplate({
    source: descriptor.template.content,
    filename: file,
    id: file,
    compilerOptions: { bindingMetadata: script.bindings },
  })
  assert.deepEqual(template.errors, [])
  const context = vm.createContext({ console, Date, Intl })
  const mod = new vm.SourceTextModule(script.content, { context })
  const services = {
    vue: Vue,
    'src/services/requestContext': requests,
    'src/composables/useFinanceResource': { useFinanceResource },
    'src/services/financeService': {
      financeGet: read,
      money: (v, c) => (v == null ? 'Indisponível' : v + ' ' + c),
      dateLabel: (v) => v || '—',
    },
    'src/services/clientProfileProjection': { projectClientContract },
  }
  await mod.link(async (name) => {
    const v = services[name] || { default: {} }
    return new vm.SyntheticModule(
      Object.keys(v),
      function () {
        for (const [k, x] of Object.entries(v)) this.setExport(k, x)
      },
      { context },
    )
  })
  await mod.evaluate()
  const scope = Vue.effectScope(),
    props = Vue.reactive({
      customerId: 'a',
      currencyId: 'BRL',
      currencyCode: 'BRL',
      compact: false,
      allCurrencies: false,
      read,
      ...options,
    })
  const state = scope.run(() => mod.namespace.default.setup(props, { expose() {} }))
  await tick()
  return { state, props, stop: () => scope.stop() }
}
test('default portfolio keeps currency/client filtering; compact mode can read all currencies once', async () => {
  for (const allCurrencies of [false, true]) {
    const calls = []
    const i = await instance(
      async (path, p) => {
        calls.push([path, p])
        return {
          data:
            path === 'admin/contracts'
              ? [row('brl'), row('usd', 'USD'), row('other', 'BRL', 'other')]
              : detail(path.split('/').pop()),
        }
      },
      { allCurrencies, compact: allCurrencies },
    )
    assert.equal(calls.filter(([p]) => p === 'admin/contracts').length, 1)
    assert.equal(calls[0][1].clientId, 'a')
    assert.deepEqual(
      Array.from(i.state.matching.value, (r) => r.id),
      allCurrencies ? ['brl', 'usd'] : ['brl'],
    )
    assert.equal(i.state.contract('brl').initialValue, 100)
    assert.equal(i.state.contract('brl').currentValue, null)
    assert.equal(i.state.contract('brl').linkedAtUtc, '2026-11-18T12:00:00Z')
    assert.equal(i.state.contract('brl').engineName, 'Motor fictício QA')
    i.stop()
  }
})
test('all-currency details are bounded to four requests and one failed contract does not erase others', async () => {
  let active = 0,
    max = 0
  const i = await instance(
    async (path) => {
      if (path === 'admin/contracts')
        return { data: Array.from({ length: 9 }, (_, n) => row(String(n))) }
      active++
      max = Math.max(max, active)
      await tick()
      active--
      const id = path.split('/').pop()
      if (id === '4') throw Error('503')
      return { data: detail(id) }
    },
    { compact: true, allCurrencies: true },
  )
  for (let n = 0; n < 6; n++) await tick()
  assert.equal(max, 4)
  assert.equal(i.state.matching.value.length, 9)
  assert.equal(i.state.contract('1').id, '1')
  assert.ok(i.state.details['4'].state.error)
  i.stop()
})
test('a late customer response cannot populate the next expanded wallet', async () => {
  let resolveOld
  const old = new Promise((r) => {
    resolveOld = r
  })
  const i = await instance(
    async (path, p) =>
      path === 'admin/contracts'
        ? p.clientId === 'a'
          ? old
          : { data: [row('new', 'BRL', 'b')] }
        : { data: detail('new', 'b') },
    { compact: true, allCurrencies: true },
  )
  i.props.customerId = 'b'
  await tick()
  resolveOld({ data: [row('old')] })
  await tick()
  assert.deepEqual(
    Array.from(i.state.matching.value, (r) => r.id),
    ['new'],
  )
  assert.equal(i.state.details.old, undefined)
  assert.equal(i.state.contract('new').initialValue, 100)
  i.stop()
})
test('missing scope makes no request; retry after a listing failure retains independent contract validation', async () => {
  let calls = 0
  const invalid = await instance(
    async () => {
      calls++
      return { data: [] }
    },
    { customerId: '' },
  )
  assert.equal(calls, 0)
  assert.ok(invalid.state.listing.state.error)
  invalid.stop()
  let failed = true
  const i = await instance(
    async (path) => {
      if (path === 'admin/contracts') {
        if (failed) throw Error('offline')
        return { data: [row('wrong')] }
      }
      return { data: detail('wrong', 'another-customer') }
    },
    { compact: true, allCurrencies: true },
  )
  assert.ok(i.state.listing.state.error)
  failed = false
  await i.state.load()
  assert.equal(i.state.listing.state.error, '')
  assert.ok(i.state.details.wrong.state.error)
  assert.equal(i.state.contract('wrong'), null)
  i.stop()
})
