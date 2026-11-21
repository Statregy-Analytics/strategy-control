import test from 'node:test'
import assert from 'node:assert/strict'
import vm from 'node:vm'
import { readFileSync } from 'node:fs'
import { parse, compileScript, compileTemplate } from '@vue/compiler-sfc'
import * as Vue from 'vue'
import { renderToString } from '@vue/server-renderer'
import * as model from '../src/services/contractDistribution.js'
import * as walletCapital from '../src/services/contractWalletCapital.js'
import { buildDraftPayload } from '../src/services/financeModels.js'
import { useFinanceResource } from '../src/composables/useFinanceResource.js'
import { readCurrentPages } from '../src/services/requestContext.js'
import * as presentation from '../src/services/customerPresentation.js'
const tick = () => new Promise((resolve) => setTimeout(resolve, 0))
const clean = (value) => JSON.parse(JSON.stringify(value))
const allocation = (...amounts) =>
  amounts.map((allocatedAmount, index) => ({
    clientId: `client-${index}`,
    displayName: `Cliente ${index}`,
    allocatedAmount,
  }))

test('136: blank, zero, under, over and exact cents are distinct; 0.10 + 0.20 closes 0.30', () => {
  assert.equal(model.distributionState(allocation(null, null), 500000).valid, false)
  assert.equal(model.distributionState(allocation(300000, null), 500000).remaining, 20000000n)
  assert.equal(model.distributionState(allocation(300000, 250000), 500000).remaining, -5000000n)
  assert.equal(model.distributionState(allocation(300000, 200000), 500000).valid, true)
  assert.equal(model.distributionState(allocation('0.10', '0.20'), '0.30').valid, true)
  assert.equal(model.distributionState(allocation('0.29'), '0.30').valid, false)
  assert.equal(model.distributionState(allocation('0.31'), '0.30').valid, false)
  assert.equal(model.distributionState(allocation(100, 0), 100).valid, false)
  assert.equal(model.distributionState(allocation(0), 0).valid, false)
  assert.equal(
    model.distributionState(
      [
        { clientId: 'a', allocatedAmount: 50 },
        { clientId: 'a', allocatedAmount: 50 },
      ],
      100,
    ).valid,
    false,
  )
})

test('136: localized input, limits and percentage conversion retain cent precision without hidden distribution', () => {
  assert.equal(model.localizedDecimal('300.000,00'), '300000.00')
  for (const invalid of ['', '-1', '1.5', '1,234', '1e5', 'NaN'])
    assert.equal(model.localizedDecimal(invalid), null)
  assert.equal(model.amountFromPercent('60,00', 500000), '300000.00')
  assert.equal(model.amountFromPercent('0,01', '0.01'), '0.00')
  assert.equal(model.amountFromPercent('75', 100000), '75000.00')
  assert.equal(model.amountFromPercent('110', 500000), '550000.00')
  assert.equal(model.capitalCents('9999999999999.99'), 999999999999999n)
  assert.equal(model.capitalCents('10000000000000.00'), null)
  assert.equal(model.capitalCents('0.001'), null)
})

test('136: largest remainder closes 100.00%, breaks ties by row order and preserves partial/over totals', () => {
  assert.equal(model.contractPercentageLabel(33.3333), '33,33%')
  assert.equal(model.contractPercentageLabel(66.6667), '66,67%')
  assert.equal(model.contractPercentageLabel(50), '50,00%')
  assert.equal(model.contractPercentageLabel(null), 'Indisponível')
  assert.equal(model.contractPercentageLabel(undefined), 'Indisponível')
  assert.equal(model.contractPercentageLabel('not-a-number'), 'Indisponível')
  assert.deepEqual(model.distributionState(allocation(1, 1, 1), 3).percentages, [
    '33.34',
    '33.33',
    '33.33',
  ])
  assert.deepEqual(model.distributionState(allocation(10000, 75000, 15000), 100000).percentages, [
    '10.00',
    '75.00',
    '15.00',
  ])
  assert.equal(model.distributionState(allocation(300000), 500000).totalPercentage, '60.00')
  assert.equal(
    model.distributionState(allocation(300000, 250000), 500000).totalPercentage,
    '110.00',
  )
  for (let capital = 3; capital <= 200; capital++) {
    const a = Math.floor(capital / 3),
      rows = allocation(
        model.centsDecimal(BigInt(a)),
        model.centsDecimal(BigInt(a)),
        model.centsDecimal(BigInt(capital - 2 * a)),
      )
    const state = model.distributionState(rows, model.centsDecimal(BigInt(capital)))
    assert.equal(state.valid, true)
    assert.equal(
      state.percentages.reduce((sum, share) => sum + model.capitalCents(share), 0n),
      10000n,
    )
  }
})

const context = vm.createContext({})
async function compile(path, inlineTemplate = false) {
  const { descriptor } = parse(readFileSync(new URL('../' + path, import.meta.url), 'utf8'))
  const script = compileScript(descriptor, { id: path, inlineTemplate })
  const exportsFor = async (name) =>
    name === 'vue'
      ? Vue
      : name === 'src/composables/useFinanceResource'
        ? { useFinanceResource }
        : name === 'src/services/contractWalletCapital'
          ? walletCapital
          : name === 'src/services/contractDistribution'
            ? model
            : name === 'src/services/contractDistributionCustomers'
              ? { distributionCustomers: async () => ({ customers: [] }) }
              : name === 'src/services/financeService'
                ? {
                    money: (value, currency) =>
                      new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(value),
                  }
                : { default: await compile(name, true) }
  const linker = async (name) => {
    const exports = await exportsFor(name)
    return new vm.SyntheticModule(
      Object.keys(exports),
      function () {
        for (const [key, value] of Object.entries(exports)) this.setExport(key, value)
      },
      { context },
    )
  }
  const module = new vm.SourceTextModule(script.content, { context })
  await module.link(linker)
  await module.evaluate()
  const component = module.namespace.default
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
    component.render = render.namespace.render
  } else if (!descriptor.scriptSetup) {
    const template = compileTemplate({
      source: descriptor.template.content,
      filename: path,
      id: path,
      compilerOptions: { mode: 'function' },
    })
    assert.deepEqual(template.errors, [])
    component.render = new Function('Vue', template.code)(Vue)
  }
  return component
}
const component = await compile('src/components/Contracts/ContractCapitalDistribution.vue')
const card = await compile('src/components/Contracts/ContractAssignedClients.vue', true)
function setup(overrides = {}) {
  const props = Vue.reactive({
      allocations: [],
      capital: 500000,
      currency: 'BRL',
      lookup: async () => ({ customers: [] }),
      ...overrides,
    }),
    events = []
  const scope = Vue.effectScope()
  const bindings = scope.run(() =>
    component.setup(props, { expose() {}, emit: (...args) => events.push(args) }),
  )
  return { ...bindings, props, events, dispose: () => scope.stop() }
}
const client = (id = 'a') => ({
  customerId: id,
  displayName: `QA ${id}`,
  maskedDocument: '******6789',
})

test('136: multiple selection, back, cancel, confirm and reopening isolate parent state', async () => {
  const original = allocation('300000.00', '200000.00')
  const h = setup({ allocations: original })
  await tick()
  h.advance()
  assert.equal(h.step.value, 'distribution')
  h.setAmount(h.rows.value[0], '250.000,00')
  assert.equal(original[0].allocatedAmount, '300000.00')
  assert.equal(h.state.value.valid, false)
  h.advance()
  assert.equal(h.events.length, 0)
  h.step.value = 'selection'
  h.advance()
  assert.equal(h.rows.value[0].allocatedAmount, '250000.00')
  h.setPercent(h.rows.value[1], '50')
  assert.equal(h.rows.value[1].allocatedAmount, '250000.00')
  h.advance()
  assert.equal(h.events[0][0], 'confirm')
  assert.equal(h.events[1][0], 'close')
  assert.equal(h.events[0][1][0].allocatedAmount, '250000.00')
  const reopened = setup({ allocations: clean(h.events[0][1]) })
  reopened.toggle(client('new'))
  reopened.advance()
  assert.equal(reopened.rows.value[0].allocatedAmount, '250000.00')
  assert.equal(reopened.rows.value[2].allocatedAmount, null)
  assert.equal(reopened.amountTexts.value.new, '')
  assert.equal(reopened.state.value.valid, false)
  reopened.close()
  assert.deepEqual(clean(reopened.events), [['close']])
  assert.equal(original.length, 2)
  h.dispose()
  reopened.dispose()
})

test('136: continue requires positive capital and selection; a cleared allocation stays null', () => {
  const h = setup({ capital: null })
  h.advance()
  assert.equal(h.step.value, 'selection')
  h.toggle(client())
  h.advance()
  assert.equal(h.step.value, 'selection')
  h.props.capital = 100
  h.advance()
  assert.equal(h.step.value, 'distribution')
  h.setAmount(h.rows.value[0], '100')
  assert.equal(h.state.value.valid, true)
  h.setAmount(h.rows.value[0], '')
  assert.equal(h.rows.value[0].allocatedAmount, null)
  h.setPercent(h.rows.value[0], '')
  assert.equal(h.rows.value[0].allocatedAmount, null)
  h.dispose()
})

test('136: async search retries, ignores stale results and retains selected clients across searches', async () => {
  let resolve, reject
  const h = setup({
    lookup: () =>
      new Promise((yes, no) => {
        resolve = yes
        reject = no
      }),
  })
  const old = resolve
  const next = h.load()
  resolve({ customers: [client()] })
  await next
  old({ customers: [client('old')] })
  await tick()
  assert.equal(h.options.value[0].customerId, 'a')
  h.toggle(client())
  const failed = h.load()
  reject(Error('offline'))
  await failed
  assert.ok(h.error.value)
  assert.equal(h.options.value.length, 0)
  assert.equal(h.rows.value.length, 1)
  const retry = h.load()
  resolve({ customers: [client('b')] })
  await retry
  assert.equal(h.error.value, '')
  assert.equal(h.rows.value[0].clientId, 'a')
  const late = h.load()
  h.dispose()
  resolve({ customers: [client('late')] })
  await late
  assert.equal(h.options.value[0].customerId, 'b')
})

async function render(state, overrides = {}) {
  const app = Vue.createSSRApp(
    {
      ...component,
      setup(props, ctx) {
        const bindings = component.setup(props, ctx)
        state?.(bindings)
        return bindings
      },
    },
    {
      allocations: [],
      capital: 500000,
      currency: 'BRL',
      lookup: async () => ({ customers: [] }),
      ...overrides,
    },
  )
  for (const name of ['QDialog', 'QCard'])
    app.component(name, {
      setup:
        (_, { slots }) =>
        () =>
          Vue.h('div', slots.default?.()),
    })
  app.component('QInput', {
    props: ['modelValue'],
    setup:
      (props, { attrs, slots }) =>
      () =>
        Vue.h('label', [
          slots.prepend?.(),
          Vue.h('input', { value: props.modelValue, placeholder: attrs.placeholder }),
          slots.append?.(),
        ]),
  })
  app.component('QBtn', {
    props: ['label', 'disable'],
    setup:
      (props, { slots }) =>
      () =>
        Vue.h('button', { disabled: props.disable }, props.label || slots.default?.()),
  })
  return renderToString(app)
}

test('136: actual templates render selection, missing capital, blank, under, over and closed states', async () => {
  const selection = await render((h) => {
    h.loading.value = false
    h.options.value = [client()]
    h.toggle(client())
  })
  assert.match(selection, /Selecionados \(1\)/)
  assert.match(selection, /aria-pressed="true"/)
  assert.match(selection, /QA a/)
  assert.match(selection, /\*{6}6789/)
  const missing = await render(null, { capital: null })
  assert.match(missing, /Capital Inicial não definido/)
  const blank = await render((h) => {
    h.toggle(client())
    h.advance()
  })
  assert.match(blank, /value(?:="")? placeholder="0,00"/)
  assert.match(blank, /Confirmar Distribuição/)
  assert.match(blank, /Faltam/)
  const under = await render(
    (h) => {
      h.advance()
    },
    { allocations: allocation(300000, null) },
  )
  assert.match(under, /60,00%/)
  assert.match(under, /200\.000,00/)
  const over = await render(
    (h) => {
      h.advance()
    },
    { allocations: allocation(300000, 250000) },
  )
  assert.match(over, /Passou/)
  assert.match(over, /110,00%/)
  assert.match(over, /negative/)
  const closed = await render(
    (h) => {
      h.advance()
    },
    { allocations: allocation(300000, 200000) },
  )
  assert.match(closed, /closed/)
  assert.match(closed, /100,00%/)
  assert.doesNotMatch(closed, /Faltam|Passou/)
  assert.doesNotMatch(closed, /<button[^>]*disabled[^>]*>Confirmar Distribuição/)
})

test('136: card renders assigned values and escaped customer names, without extra removal actions', async () => {
  const rows = allocation('300000', '200000')
  rows[0].displayName = '<script>QA</script>'
  const app = Vue.createSSRApp(card, {
    allocations: rows,
    capital: 500000,
    currency: 'BRL',
    lookup: async () => ({ customers: [] }),
  })
  app.component('QBtn', {
    setup:
      (_, { slots }) =>
      () =>
        Vue.h('button', slots.default?.()),
  })
  const html = await renderToString(app)
  assert.match(html, /ATRIBUÍDO/)
  assert.match(html, /60,00%/)
  assert.match(html, /40,00%/)
  assert.match(html, /500\.000,00 · 100,00%/)
  assert.match(html, /&lt;script&gt;/)
  assert.equal((html.match(/<button/g) || []).length, 1)
  const payload = buildDraftPayload({ clientAllocations: rows }, null)
  assert.deepEqual(Object.keys(payload.clientAllocations[0]), ['clientId', 'allocatedAmount'])
})

test('136: customer selection reads every real cards page and keeps only masked documents', async () => {
  const reads = []
  const exports = {
    'src/services/walletModel': await import('../src/services/walletModel.js'),
    './customerService': {
      listCustomerCards: async (params) => {
        reads.push(params)
        return {
          success: true,
          data: [
            {
              customerId: `c${params.page}`,
              primaryName: 'EMPRESA QA',
              customerKind: 'Organization',
              maskedDocument: '12345678901',
            },
          ],
          pagination: { totalPages: 2 },
        }
      },
    },
    './requestContext': { readCurrentPages },
    './customerPresentation': presentation,
  }
  const module = new vm.SourceTextModule(
    readFileSync(
      new URL('../src/services/contractDistributionCustomers.js', import.meta.url),
      'utf8',
    ),
    { context },
  )
  await module.link(
    (name) =>
      new vm.SyntheticModule(
        Object.keys(exports[name]),
        function () {
          for (const [key, value] of Object.entries(exports[name])) this.setExport(key, value)
        },
        { context },
      ),
  )
  await module.evaluate()
  const result = await module.namespace.distributionCustomers({ search: ' QA ' })
  assert.equal(result.customers.length, 2)
  assert.equal(reads[1].page, 2)
  assert.equal(reads[0].search, 'QA')
  assert.equal(reads[0].pageSize, 100)
  assert.equal(result.customers[0].personType, 'Organization')
  assert.equal(result.customers[0].maskedDocument, '******8901')
  assert.equal(result.customers[0].displayName, 'Empresa Qa')
})

test('136: assigned currency selector uses catalog IDs without requiring a client wallet and isolates failures', async () => {
  const { descriptor } = parse(
    readFileSync(new URL('../src/components/Finance/CurrencySelect.vue', import.meta.url), 'utf8'),
  )
  const compiled = compileScript(descriptor, { id: 'currency' })
  const reads = [],
    events = []
  let fail = false
  const exports = {
    'src/services/walletModel': await import('../src/services/walletModel.js'),
    vue: Vue,
    './ResourceState.vue': { default: {} },
    'src/composables/useFinanceResource': { useFinanceResource },
    'src/services/financeService': {
      financeGet: async (path) => {
        reads.push(path)
        if (fail) throw Error('controlled failure')
        return {
          data:
            path === 'preferences/catalog'
              ? { currencies: [{ id: 'usd-id', value: 'USD', label: 'Dólar' }, { value: 'BRL' }] }
              : [{ currencyId: 'brl-wallet-id', currencyIsoCode: 'BRL' }],
        }
      },
    },
  }
  const module = new vm.SourceTextModule(compiled.content, { context })
  await module.link(
    (name) =>
      new vm.SyntheticModule(
        Object.keys(exports[name]),
        function () {
          for (const [key, value] of Object.entries(exports[name])) this.setExport(key, value)
        },
        { context },
      ),
  )
  await module.evaluate()
  const props = Vue.reactive({
    useCatalog: true,
    customerId: null,
    modelValue: 'usd-id',
    current: null,
  })
  const scope = Vue.effectScope()
  const h = scope.run(() =>
    module.namespace.default.setup(props, { expose() {}, emit: (...args) => events.push(args) }),
  )
  await tick()
  assert.deepEqual(clean(h.options.value), [{ id: 'usd-id', name: 'USD' }])
  assert.deepEqual(reads, ['preferences/catalog'])
  assert.ok(events.some(([name, value]) => name === 'currency-code' && value === 'USD'))
  const readCount = reads.length
  props.customerId = 'first-wallet-client'
  await tick()
  assert.equal(reads.length, readCount)
  assert.equal(
    events.some(([name, value]) => name === 'currency-code' && value === 'BRL'),
    false,
  )
  fail = true
  await h.load()
  assert.ok(h.resource.state.error)
  fail = false
  await h.load()
  assert.equal(h.resource.state.error, '')
  props.useCatalog = false
  props.customerId = 'client'
  await tick()
  assert.equal(reads.at(-1), 'admin/customers/client/wallets')
  assert.equal(h.options.value[0].id, 'brl-wallet-id')
  scope.stop()
})
