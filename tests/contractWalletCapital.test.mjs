import test from 'node:test'
import assert from 'node:assert/strict'
import vm from 'node:vm'
import { readFileSync } from 'node:fs'
import { parse, compileScript, compileTemplate } from '@vue/compiler-sfc'
import * as Vue from 'vue'
import { renderToString } from '@vue/server-renderer'
import * as model from '../src/services/contractWalletCapital.js'
import * as distribution from '../src/services/contractDistribution.js'
import { useFinanceResource } from '../src/composables/useFinanceResource.js'
import { buildDraftPayload } from '../src/services/financeModels.js'
const tick = () => new Promise((resolve) => setTimeout(resolve, 0))
const clean = (value) => JSON.parse(JSON.stringify(value))
const quote = (from = 'EUR', to = 'BRL', rate = '5.5000') => ({
  fromIsoCode: from,
  toIsoCode: to,
  rate,
  referenceDate: '2026-11-13',
  source: 'BcbPtax',
  quotes: [{ id: 'quote-id', currencyIsoCode: from, brlPerUnit: rate }],
})
const wallet = (type = 'Free', currencyIsoCode = 'BRL', available = '160000.00') => ({
  id: `${type}-${currencyIsoCode}`,
  type,
  currencyId: `currency-${currencyIsoCode}`,
  currencyIsoCode,
  available,
  balance: '200000',
  reserved: '40000',
})
const source = (
  type = 'Free',
  currencyIsoCode = 'BRL',
  amount = '145000.00',
  available = '160000.00',
  rate = null,
) => ({
  walletId: `${type}-${currencyIsoCode}`,
  type,
  currencyId: `currency-${currencyIsoCode}`,
  currencyIsoCode,
  amount,
  available,
  quote: rate,
})
const customer = (id) => ({
  customerId: id,
  displayName: `Cliente ${id}`,
  maskedDocument: '******1234',
})

test('137: seven currency options use available funds, keep wallets separate and never include contracted capital', () => {
  const rows = [wallet(), wallet('Applied', 'EUR', '15000')]
  const deposit = model.sourceWalletOptions(rows, 'Free'),
    strategy = model.sourceWalletOptions(rows, 'Applied')
  assert.equal(deposit.length, 7)
  assert.equal(strategy.length, 7)
  assert.equal(deposit[0].available, 16000000n)
  assert.equal(strategy.find((row) => row.code === 'EUR').available, 1500000n)
  assert.equal(deposit.find((row) => row.code === 'EUR').available, 0n)
  assert.equal(strategy[0].available, 0n)
  assert.throws(() => model.sourceWalletOptions(null, 'Free'))
  assert.throws(() => model.sourceWalletOptions([wallet(), wallet()], 'Free'))
  assert.equal(
    model.sourceWalletOptions([{ ...wallet(), available: null }], 'Free')[0].available,
    null,
  )
})

test('137: different currencies convert line by line with full PTAX precision and correct final rounding', () => {
  const state = model.walletContributionState(
    [source(), source('Applied', 'EUR', '10000', '15000', quote())],
    'BRL',
  )
  assert.equal(state.valid, true)
  assert.equal(state.total, 20000000n)
  assert.equal(state.rows[1].after, 500000n)
  assert.equal(model.convertedWalletCents('0.01', 'USD', 'BRL', quote('USD', 'BRL', '5.505')), 6n)
  assert.equal(
    model.convertedWalletCents('100', 'EUR', 'USD', quote('EUR', 'USD', '1.23456789')),
    12346n,
  )
  assert.equal(
    model.convertedWalletCents('10', 'USD', 'JPY', quote('USD', 'JPY', '150.555')),
    150600n,
  )
  assert.equal(model.convertedWalletCents('1.01', 'JPY', 'BRL', quote('JPY', 'BRL', '0.04')), null)
  assert.equal(model.convertedWalletCents('1', 'JPY', 'BRL', quote('JPY', 'BRL', '0.04')), 4n)
})

test('137: same currency can use both wallets but cannot repeat a wallet/currency pair', () => {
  assert.equal(
    model.walletContributionState(
      [source('Free', 'BRL', '10'), source('Applied', 'BRL', '20')],
      'BRL',
    ).total,
    3000n,
  )
  assert.equal(model.walletContributionState([source(), source()], 'BRL').valid, false)
  assert.equal(
    model.walletContributionState([source('Free', 'BRL', '160000.01')], 'BRL').exceeds,
    true,
  )
  assert.equal(model.walletContributionState([source('Free', 'BRL', '160000')], 'BRL').valid, true)
  for (const amount of [null, '0', '-1', 'NaN', '0.001'])
    assert.equal(model.walletContributionState([source('Free', 'BRL', amount)], 'BRL').valid, false)
})

test('137: unknown, wrong-direction or undocumented FX cannot become a valid contribution', () => {
  for (const rate of [
    null,
    { ...quote(), source: 'Manual' },
    { ...quote(), rate: 0 },
    { ...quote(), referenceDate: null },
    { ...quote(), quotes: [] },
    quote('USD', 'BRL'),
  ])
    assert.equal(
      model.walletContributionState([source('Applied', 'EUR', '10', '20', rate)], 'BRL').valid,
      false,
    )
  assert.equal(
    model.walletCapitalTotal([{ allocatedAmount: '0.10' }, { allocatedAmount: '0.20' }]),
    30n,
  )
  assert.equal(model.walletMoney(0n, 'JPY'), '¥ 0')
  assert.equal(model.walletMoney(null, 'BRL'), 'Indisponível')
  assert.equal(
    model.walletOriginLabel(source('Applied', 'EUR', '10000', '15000', quote())),
    '€ 10.000,00 × 5,5000 (PTAX de 13/11/2026)',
  )
})

const context = vm.createContext({})
const dependencies = {
  vue: Vue,
  './useFinanceResource': { useFinanceResource },
  'src/services/financeService': {
    financeGet: async () => {
      throw Error('Unexpected request')
    },
  },
  'src/services/contractDistributionCustomers': {
    distributionCustomers: async () => ({ customers: [] }),
  },
  'src/services/contractDistribution': distribution,
  'src/services/contractWalletCapital': model,
}
async function link(name) {
  const exports = dependencies[name]
  if (!exports) throw Error('Missing dependency ' + name)
  return new vm.SyntheticModule(
    Object.keys(exports),
    function () {
      for (const [key, value] of Object.entries(exports)) this.setExport(key, value)
    },
    { context },
  )
}
const module = new vm.SourceTextModule(
  readFileSync(new URL('../src/composables/useContractWalletCapital.js', import.meta.url), 'utf8'),
  { context },
)
await module.link(link)
await module.evaluate()
const useCapital = module.namespace.useContractWalletCapital
function setup(overrides = {}) {
  const reads = [],
    events = [],
    props = Vue.reactive({
      currency: 'BRL',
      existingIds: [],
      read: async (path, params) => {
        reads.push({ path, params })
        return {
          data: path.includes('wallets')
            ? [wallet(), wallet('Applied', 'EUR', '15000')]
            : quote(params.from, params.to),
        }
      },
      lookup: async () => ({ customers: [customer('a'), customer('b')] }),
      ...overrides,
    })
  const scope = Vue.effectScope(),
    h = scope.run(() => useCapital(props, (...args) => events.push(args)))
  return { ...h, props, reads, events, dispose: () => scope.stop() }
}

test('137: local confirmation copies source wallets/quotes without any write; Back restores unsent edits', async () => {
  const h = setup()
  await tick()
  await h.choose(customer('a'))
  h.tab.value = 'Free'
  h.add(h.options.value.find((row) => row.code === 'BRL'))
  h.setAmount(h.lines.value[0], '145.000,00')
  h.tab.value = 'Applied'
  h.add(h.options.value.find((row) => row.code === 'EUR'))
  await tick()
  h.setAmount(h.lines.value[1], '10.000,00')
  assert.equal(h.state.value.total, 20000000n)
  h.note.value = 'QA fictício'
  h.back()
  await h.choose(customer('a'))
  assert.equal(h.lines.value[0].amount, '145000.00')
  assert.equal(h.note.value, 'QA fictício')
  await tick()
  h.confirm()
  assert.equal(h.events[0][0], 'confirm')
  assert.equal(h.events[1][0], 'close')
  const result = h.events[0][1]
  assert.equal(result.allocatedAmount, '200000.00')
  assert.equal(result.walletSources.length, 2)
  assert.equal(result.walletSources[1].quote.quotes[0].id, 'quote-id')
  h.lines.value[0].amount = '1.00'
  assert.equal(result.walletSources[0].amount, '145000.00')
  assert.ok(
    h.reads.every(
      (read) => read.path.endsWith('/wallets') || read.path === 'admin/exchange-rates/latest',
    ),
  )
  assert.throws(
    () => buildDraftPayload({ clientAllocations: [result] }, null),
    /vínculos por carteira/,
  )
  h.dispose()
})

test('137: zero/used options are disabled and wallet retry revalidates amounts against changed funds', async () => {
  const h = setup()
  await h.choose(customer('a'))
  h.tab.value = 'Free'
  assert.equal(h.canAdd(h.options.value.find((row) => row.code === 'USD')), false)
  h.add(h.options.value[0])
  assert.equal(h.canAdd(h.options.value[0]), false)
  h.setAmount(h.lines.value[0], '160000')
  assert.equal(h.state.value.valid, true)
  h.wallets.state.data = [wallet('Free', 'BRL', '150000')]
  assert.equal(h.state.value.exceeds, true)
  h.confirm()
  assert.equal(h.events.length, 0)
  h.wallets.state.data = [{ ...wallet(), id: 'replacement-wallet' }]
  assert.equal(h.state.value.valid, false)
  h.dispose()
})

test('137: failed FX retries independently; removing an unused pending quote does not block remaining rows', async () => {
  let rejectFx = true,
    resolvePending
  const h = setup({
    read: async (path, params) => {
      if (path.includes('wallets')) return { data: [wallet(), wallet('Applied', 'EUR', '15000')] }
      if (rejectFx) throw Error('FX unavailable')
      if (resolvePending === null)
        return new Promise((resolve) => {
          resolvePending = resolve
        })
      return { data: quote(params.from, params.to) }
    },
  })
  await h.choose(customer('a'))
  h.tab.value = 'Applied'
  h.add(h.options.value.find((row) => row.code === 'EUR'))
  await tick()
  h.setAmount(h.lines.value[0], '10')
  assert.ok(h.quotes.value.EUR.error)
  assert.equal(h.state.value.valid, false)
  rejectFx = false
  await h.loadQuote('EUR')
  assert.equal(h.state.value.valid, true)
  h.tab.value = 'Free'
  h.add(h.options.value[0])
  h.setAmount(h.lines.value[1], '1')
  resolvePending = null
  const pending = h.loadQuote('EUR')
  assert.equal(h.loadingQuotes.value, true)
  h.remove('Applied:EUR')
  assert.equal(h.loadingQuotes.value, false)
  assert.equal(h.state.value.valid, true)
  h.dispose()
  resolvePending({ data: quote() })
  await pending
})

test('137: stale wallet and FX responses cannot switch clients or overwrite a newer quote', async () => {
  const pending = []
  const h = setup({
    read: (path, params) => new Promise((resolve) => pending.push({ path, params, resolve })),
  })
  const first = h.choose(customer('a')),
    second = h.choose(customer('b'))
  pending[1].resolve({ data: [wallet('Free', 'BRL', '20')] })
  await second
  pending[0].resolve({ data: [wallet('Free', 'BRL', '99999')] })
  await first
  assert.equal(h.wallets.state.data[0].available, '20')
  const old = h.loadQuote('EUR'),
    latest = h.loadQuote('EUR')
  pending[3].resolve({ data: quote('EUR', 'BRL', '6') })
  await latest
  pending[2].resolve({ data: quote('EUR', 'BRL', '5') })
  await old
  assert.equal(h.quotes.value.EUR.data.rate, '6')
  h.back()
  const late = h.choose(customer('a'))
  h.dispose()
  pending[4].resolve({ data: [wallet()] })
  await late
  assert.equal(h.wallets.state.data, null)
})

async function component(path, inlineTemplate = false) {
  const { descriptor } = parse(readFileSync(new URL('../' + path, import.meta.url), 'utf8'))
  const script = compileScript(descriptor, { id: path, inlineTemplate })
  const linker = async (name) => {
    const exports =
      name === 'src/composables/useContractWalletCapital'
        ? { useContractWalletCapital: useCapital }
        : name === 'src/composables/useFinanceResource'
          ? { useFinanceResource }
          : dependencies[name] || { default: await component(name, true) }
    return new vm.SyntheticModule(
      Object.keys(exports),
      function () {
        for (const [key, value] of Object.entries(exports)) this.setExport(key, value)
      },
      { context },
    )
  }
  const mod = new vm.SourceTextModule(script.content, { context })
  await mod.link(linker)
  await mod.evaluate()
  if (!inlineTemplate) {
    const template = compileTemplate({
      source: descriptor.template.content,
      filename: path,
      id: path,
      compilerOptions: { bindingMetadata: script.bindings },
    })
    assert.deepEqual(template.errors, [])
    const render = new vm.SourceTextModule(template.code, { context })
    await render.link(linker)
    await render.evaluate()
    mod.namespace.default.render = render.namespace.render
  } else if (!descriptor.scriptSetup) {
    const template = compileTemplate({
      source: descriptor.template.content,
      filename: path,
      id: path,
      compilerOptions: { mode: 'function' },
    })
    mod.namespace.default.render = new Function('Vue', template.code)(Vue)
  }
  return mod.namespace.default
}
const dialog = await component('src/components/Contracts/ContractWalletCapital.vue')
async function render(state) {
  const app = Vue.createSSRApp(
    {
      ...dialog,
      setup(props, ctx) {
        const h = dialog.setup(props, ctx)
        state(h)
        return h
      },
    },
    {
      currency: 'BRL',
      existingIds: [],
      read: async () => ({ data: [] }),
      lookup: async () => ({ customers: [] }),
    },
  )
  for (const name of ['QDialog', 'QCard', 'QBanner'])
    app.component(name, {
      setup: (_, ctx) => () => Vue.h('div', [ctx.slots.default?.(), ctx.slots.action?.()]),
    })
  app.component('QLinearProgress', { setup: () => () => Vue.h('span', 'Carregando') })
  app.component('QBtn', {
    props: ['label', 'disable'],
    setup: (props, ctx) => () =>
      Vue.h('button', { disabled: props.disable }, props.label || ctx.slots.default?.()),
  })
  app.component('QInput', {
    props: ['modelValue'],
    setup: (props, ctx) => () =>
      Vue.h('label', [
        ctx.slots.prepend?.(),
        Vue.h('input', {
          value: props.modelValue,
          'aria-label': ctx.attrs['aria-label'],
          placeholder: ctx.attrs.placeholder,
        }),
      ]),
  })
  return renderToString(app)
}
function populate(h, lines) {
  h.client.value = customer('a')
  h.wallets.state.data = [wallet(), wallet('Applied', 'EUR', '15000')]
  h.lines.value = lines
  h.quotes.value = { EUR: { data: quote(), loading: false, error: '' } }
}
test('137: real templates show mixed wallet conversion and preserve the approved fields/actions', async () => {
  const html = await render((h) =>
    populate(h, [source(), source('Applied', 'EUR', '10000', '15000', quote())]),
  )
  assert.match(html, /BRL · Carteira de Depósito/)
  assert.match(html, /EUR · Carteira Strategy/)
  assert.match(html, /200\.000,00/)
  assert.match(html, /Conversão para a moeda firmada/)
  assert.match(html, /PTAX de venda do fechamento de 13\/11\/2026/)
  assert.match(html, /Observação \(opcional\)/)
  assert.match(html, /Confirmar Vínculo/)
  assert.doesNotMatch(
    html,
    /Impacto no contrato|Participação de cada cliente|Antes|Índice do motor/,
  )
})
test('137: insufficient wallet hides conversion and disables confirm in the rendered modal', async () => {
  const html = await render((h) =>
    populate(h, [source('Applied', 'EUR', '20000', '15000', quote())]),
  )
  assert.match(html, /Saldo parado insuficiente em EUR na Carteira Strategy/)
  assert.match(html, /ffc9c9|insufficient/)
  assert.match(html, /<button[^>]*disabled[^>]*>Confirmar Vínculo/)
  assert.doesNotMatch(html, /Conversão para a moeda firmada|<table/)
})
test('137: picker renders two tabs and exactly seven currencies with zero/used pairs disabled', async () => {
  const html = await render((h) => {
    populate(h, [source()])
    h.picking.value = true
    h.tab.value = 'Free'
  })
  assert.equal((html.match(/role="tab"/g) || []).length, 2)
  assert.equal((html.match(/role="option"/g) || []).length, 7)
  assert.match(html, /¥ 0/)
  assert.match(html, /Carteira de Depósito/)
  assert.equal(
    (html.match(/role="option"[^>]*disabled|disabled[^>]*role="option"/g) || []).length,
    7,
  )
})
