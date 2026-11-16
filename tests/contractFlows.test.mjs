import test from 'node:test'
import assert from 'node:assert/strict'
import vm from 'node:vm'
import path from 'node:path'
import { readFileSync } from 'node:fs'
import { parse, compileScript, compileTemplate } from '@vue/compiler-sfc'
import * as Vue from 'vue'
import { renderToString } from '@vue/server-renderer'
import * as requests from '../src/services/contractRequests.js'
import * as view from '../src/services/contractTransactionView.js'
import * as audit from '../src/services/auditModel.js'
import * as customer from '../src/services/customerPresentation.js'
import { useFinanceResource } from '../src/composables/useFinanceResource.js'
import { readCurrentPages } from '../src/services/requestContext.js'
const tick = () => new Promise((resolve) => setTimeout(resolve, 0))
const money = (value, iso = 'BRL') =>
  value == null
    ? 'Indisponível'
    : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: iso }).format(value)
const pending = () => new Promise(() => {})
const context = vm.createContext({ console, Function })
const services = {
  vue: Vue,
  quasar: { useQuasar: () => ({ dialog: () => ({ onOk() {} }) }) },
  'src/composables/useFinanceResource': { useFinanceResource },
  'src/services/requestContext': { readCurrentPages },
  'src/services/financeService': {
    money,
    financeLabel: (value) => value,
    financeGet: pending,
    financeWrite: pending,
  },
  'src/services/contractRequests': requests,
  'src/services/contractTransactionView': view,
  'src/services/auditModel': audit,
  'src/services/customerPresentation': customer,
}
const cache = new Map()
async function component(file) {
  if (cache.has(file)) return cache.get(file)
  const { descriptor } = parse(readFileSync(file, 'utf8'))
  const script = compileScript(descriptor, { id: file })
  const linker = async (name) => {
    const data = services[name] || {
      default: await component(name.startsWith('.') ? path.join(path.dirname(file), name) : name),
    }
    return new vm.SyntheticModule(
      Object.keys(data),
      function () {
        for (const [key, value] of Object.entries(data)) this.setExport(key, value)
      },
      { context },
    )
  }
  const module = new vm.SourceTextModule(script.content, { context })
  await module.link(linker)
  await module.evaluate()
  const compiled = compileTemplate({
    source: descriptor.template.content,
    filename: file,
    id: file,
    compilerOptions: { bindingMetadata: script.bindings },
  })
  assert.deepEqual(compiled.errors, [])
  const render = new vm.SourceTextModule(compiled.code, { context })
  await render.link(linker)
  await render.evaluate()
  module.namespace.default.render = render.namespace.render
  cache.set(file, module.namespace.default)
  return module.namespace.default
}
async function instance(file, props) {
  const comp = await component(file),
    scope = Vue.effectScope(),
    events = []
  const h = scope.run(() =>
    comp.setup(Vue.reactive(props), { expose() {}, emit: (...args) => events.push(args) }),
  )
  await tick()
  return { h, events, dispose: () => scope.stop() }
}
async function html(file, props, prepare = () => {}) {
  const comp = await component(file)
  const app = Vue.createSSRApp(
    {
      ...comp,
      setup(props, ctx) {
        const h = comp.setup(props, ctx)
        prepare(h)
        return h
      },
    },
    props,
  )
  for (const name of ['QDialog', 'QCard', 'QBanner', 'QLinearProgress'])
    app.component(name, {
      setup: (_, ctx) => () => Vue.h('div', [ctx.slots.default?.(), ctx.slots.action?.()]),
    })
  app.component('QBtn', {
    props: ['disable', 'label'],
    setup: (p, ctx) => () =>
      Vue.h('button', { disabled: p.disable }, p.label || ctx.slots.default?.()),
  })
  app.component('QInput', {
    props: ['modelValue'],
    setup: (p) => () => Vue.h('input', { value: p.modelValue }),
  })
  return renderToString(app)
}
const row = {
  id: 'request-id',
  code: 'SOL-QA',
  status: 'New',
  submittedAtUtc: '2026-11-16T12:00:00Z',
  client: {
    customerId: 'client-id',
    displayName: 'Cliente fictício',
    maskedDocument: '******1234',
    email: 'qa@example.com',
  },
  answers: {
    objective: 'Renda Passiva',
    period: 'Médio Prazo',
    modality: 'Hybrid',
    initialAmount: 100,
    monthlyAmount: 10,
    currencyCode: 'BRL',
    assetTypes: ['Ações'],
    regions: ['EUA'],
  },
  history: [],
}

test('141: missing API is an error, never a successful empty list or fake attendance', async () => {
  await assert.rejects(requests.listContractRequests(), /consultar/)
  await assert.rejects(requests.readContractRequest('id'), /consultar/)
  await assert.rejects(requests.writeContractRequest('id'), /atualizar/)
  const x = await instance('src/components/Contracts/ContractRequestsDialog.vue', {})
  assert.ok(x.h.resource.state.error)
  assert.equal(x.h.resource.state.data, null)
  assert.equal(x.events.length, 0)
  x.dispose()
})
test('141: real list template filters all status groups and keeps counters separate from visible rows', async () => {
  const rows = [
    row,
    { ...row, id: 'done', status: 'Fulfilled', contract: { name: 'Contrato QA' } },
    { ...row, id: 'canceled', status: 'Canceled', cancellationReason: 'Aguardar' },
  ]
  const markup = await html(
    'src/components/Contracts/ContractRequestsDialog.vue',
    { read: pending },
    (h) => {
      h.resource.state.loading = false
      h.resource.state.data = {
        items: rows,
        counts: { All: 3, New: 1, Fulfilled: 1, Canceled: 1, InContact: 0 },
      }
      h.status.value = 'Fulfilled'
    },
  )
  assert.match(markup, /Contrato QA/)
  assert.doesNotMatch(markup, /Aguardar/)
  assert.equal((markup.match(/role="tab"/g) || []).length, 5)
  assert.match(markup, /Abrir/)
})
test('141: empty result only follows a successful read, stale result after close emits no counter', async () => {
  let resolve
  const x = await instance('src/components/Contracts/ContractRequestsDialog.vue', {
    read: () =>
      new Promise((done) => {
        resolve = done
      }),
  })
  x.dispose()
  resolve({ items: [], counts: { All: 0, New: 0 } })
  await tick()
  assert.equal(x.events.length, 0)
  const markup = await html(
    'src/components/Contracts/ContractRequestsDialog.vue',
    { read: pending },
    (h) => {
      h.resource.state.loading = false
      h.resource.state.data = { items: [], counts: { All: 0 } }
    },
  )
  assert.match(markup, /Nenhuma solicitação encontrada/)
  assert.doesNotMatch(markup, /SOL-2026-00021|Holding Investimentos/)
})
test('141: failure to mark contact preserves note and does not pretend a successful state transition', async () => {
  const x = await instance('src/components/Contracts/ContractRequestDetail.vue', {
    requestId: row.id,
    read: async () => row,
    readWallets: async () => ({ data: [] }),
    write: requests.writeContractRequest,
  })
  x.h.note.value = 'Observação fictícia'
  await x.h.change('InContact')
  assert.ok(x.h.error.value)
  assert.equal(x.h.note.value, 'Observação fictícia')
  assert.equal(x.h.record.value.status, 'New')
  assert.equal(x.events.length, 0)
  x.h.navigate('create')
  assert.equal(x.events[0][0], 'create')
  assert.equal(x.events[0][1].client.customerId, row.client.customerId)
  assert.equal(x.events[0][1].attendanceNote, 'Observação fictícia')
  x.dispose()
})
test('141: attended/canceled records cannot reopen attendance or create a contract', async () => {
  for (const status of ['Fulfilled', 'Canceled']) {
    const x = await instance('src/components/Contracts/ContractRequestDetail.vue', {
      requestId: row.id,
      read: async () => ({ ...row, status }),
      readWallets: async () => ({ data: [] }),
      write: () => {
        throw Error('must not write')
      },
    })
    await x.h.change('InContact')
    x.h.navigate('create')
    assert.equal(x.events.length, 0)
    x.dispose()
  }
})
test('141: details render approved answers and available wallets without inventing other currency balances', async () => {
  const markup = await html(
    'src/components/Contracts/ContractRequestDetail.vue',
    { requestId: row.id, read: pending, readWallets: pending },
    (h) => {
      h.resource.state.loading = false
      h.resource.state.data = row
      h.wallets.state.loading = false
      h.wallets.state.data = [{ type: 'Free', currencyIsoCode: 'BRL', available: 47500 }]
    },
  )
  for (const text of [
    '1 · Objetivo',
    '5 · Regiões',
    'Marcar como em contato',
    'Incluir em contrato aberto',
    'Cancelar solicitação',
    '47.500,00',
    '******1234',
  ])
    assert.ok(markup.includes(text), text)
  assert.doesNotMatch(markup, /320.000,00|40.000,00|Titularidade/)
})
test('139: contract semantics use actual endpoints and do not label every yield as a contract dividend', () => {
  assert.equal(view.contractTransactionLabel({ type: 'Yield', source: { kind: 'Wallet' } }), null)
  assert.equal(
    view.contractTransactionLabel({ type: 'Yield', source: { kind: 'Contract' } }),
    'Dividendo de Contrato',
  )
  assert.equal(
    view.contractTransactionLabel({
      type: 'ContractOperation',
      destination: { kind: 'Contract' },
      source: { kind: 'Wallet' },
    }),
    'Aporte em Contrato',
  )
  assert.equal(
    view.contractSourceCurrency({ type: 'ContractOperation', currencyIsoCode: 'BRL' }),
    null,
  )
  assert.equal(
    view.contractSourceCurrency({
      type: 'ContractOperation',
      currencyIsoCode: 'BRL',
      conversion: { sourceCurrencyIsoCode: 'USD' },
    }),
    'USD',
  )
  assert.equal(
    view.contractEndpoint({ kind: 'Bank', accountNumberMasked: '1234567890' }).detail,
    '****7890',
  )
})
test('139: quote template uses stored rate/date, never the current PTAX endpoint or inferred balances', async () => {
  const record = {
    amount: 25000,
    currency: { isoCode: 'BRL' },
    conversion: {
      sourceCurrencyIsoCode: 'USD',
      sourceAmount: 5000,
      exchangeRate: '5.0000',
      rateSource: 'BcbPtax',
      quotes: [{ id: 'quote', referenceDate: '2026-11-13' }],
    },
  }
  const markup = await html('src/components/Contracts/ContractTransactionQuote.vue', { record })
  assert.match(markup, /5,0000/)
  assert.match(markup, /13\/11\/2026/)
  assert.match(markup, /indisponíveis nesta consulta/)
  assert.doesNotMatch(markup, /16\/11\/2026|50.000,00|45.000,00/)
})
test('139: completed detail renders only available contract/quote actions and actual audit values', async () => {
  const record = {
    id: 'transaction',
    requestNumber: 'TRX-QA',
    type: 'ContractOperation',
    status: 'Completed',
    client: { id: 'client', name: 'Cliente fictício' },
    createdBy: { displayName: 'Admin' },
    source: { kind: 'Wallet', walletType: 'Applied' },
    destination: { kind: 'Contract', id: 'contract', contractName: 'Contrato QA' },
    currency: { isoCode: 'BRL' },
    amount: 100,
    requestedAtUtc: '2026-11-16T12:00:00Z',
    conversion: null,
    availableActions: ['AddObservation'],
  }
  const markup = await html(
    'src/components/Contracts/ContractTransactionDetail.vue',
    { record, read: pending },
    (h) => {
      h.history.state.loading = false
      h.history.state.data = [
        {
          action: 'Updated',
          field: 'Amount',
          oldValue: '50',
          newValue: '100',
          occurredAtUtc: '2026-11-16T12:00:00Z',
          actorType: 'Admin',
        },
      ]
    },
  )
  assert.match(markup, /Aporte em Contrato/)
  assert.match(markup, /Alteração/)
  assert.doesNotMatch(markup, /"tone"|parte 1 de 3|8,23%/)
  assert.match(markup, /As partes deste aporte não estão disponíveis/)
  assert.match(markup, /Ver contrato/)
  assert.match(markup, /Adicionar Observação/)
})
