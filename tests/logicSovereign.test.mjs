import test from 'node:test'
import assert from 'node:assert/strict'
import vm from 'node:vm'
import { readFileSync } from 'node:fs'
import { parse, compileScript } from '@vue/compiler-sfc'
import * as Vue from 'vue'
import { renderToString } from '@vue/server-renderer'
import * as model from '../src/services/adminWorkspaceModel.js'
import * as numbers from '../src/services/numberInputValue.js'

const filename = new URL('../src/components/Workspaces/LogicSovereign.vue', import.meta.url)
const { descriptor } = parse(readFileSync(filename, 'utf8'))
const compiled = compileScript(descriptor, { id: 'sovereign-test', inlineTemplate: true })
const inputs = []
const context = vm.createContext({})
const mod = new vm.SourceTextModule(compiled.content, { context })
const wrapper = {
  inheritAttrs: false,
  setup(_, { slots }) {
    return () => Vue.h('section', slots.default?.())
  },
}
await mod.link((name) => {
  const exports =
    name === 'vue'
      ? Vue
      : name === 'src/services/adminWorkspaceModel'
        ? model
        : name === 'src/services/numberInputValue'
          ? numbers
          : { default: wrapper }
  return new vm.SyntheticModule(
    Object.keys(exports),
    function () {
      for (const [key, value] of Object.entries(exports)) this.setExport(key, value)
    },
    { context },
  )
})
await mod.evaluate()
async function render(form) {
  inputs.length = 0
  const app = Vue.createSSRApp(mod.namespace.default, { modelValue: form })
  app.component('QInput', {
    inheritAttrs: false,
    props: ['modelValue', 'disable'],
    setup(props, { attrs }) {
      inputs.push({ label: attrs['aria-label'], value: props.modelValue, disabled: props.disable })
      return () =>
        Vue.h('input', { value: props.modelValue, disabled: props.disable !== undefined })
    },
  })
  const html = await renderToString(app)
  return { html, values: inputs.map((input) => input.value), fields: [...inputs] }
}

test('EC07 leaves unavailable data empty and all three fields blocked without mutating the form', async () => {
  const form = Object.freeze({ initialIndex: null, target: null })
  const result = await render(form)
  assert.deepEqual(result.values, ['', '', ''])
  assert.deepEqual(
    result.fields.map((input) => input.label),
    ['Índice Inicial do Ciclo', 'Alvo do Ciclo', 'Índice Final Obrigatório'],
  )
  assert.ok(
    result.fields.every((input) => input.disabled !== undefined && input.disabled !== false),
  )
  assert.match(result.html, /Princípio do Fechamento Soberano/)
  assert.match(result.html, /target-principle\.svg/)
  assert.doesNotMatch(result.html, /100,0000/)
})

test('EC07 uses the existing projection, preserves a real zero target and only formats presentation', async () => {
  const form = Object.freeze({ initialIndex: 100, target: 0 })
  assert.deepEqual((await render(form)).values, ['100,0000', '0,00', '100,0000'])
  const precise = Object.freeze({ initialIndex: 100.123456, target: 12.3456 })
  const expected = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
    useGrouping: false,
  }).format(model.projectedFinalIndex(precise))
  assert.deepEqual((await render(precise)).values, ['100,1235', '12,35', expected])
  assert.equal(precise.initialIndex, 100.123456)
  assert.equal(precise.target, 12.3456)
})

test('EC07 follows changes and clearing of the original cycle fields without storing a second final index', async () => {
  const form = Vue.reactive({ initialIndex: 100, target: 12, finalIndex: 999 })
  assert.deepEqual((await render(form)).values, ['100,0000', '12,00', '112,0000'])
  form.target = '5'
  assert.deepEqual((await render(form)).values, ['100,0000', '5,00', '105,0000'])
  form.target = ''
  assert.deepEqual((await render(form)).values, ['100,0000', '', ''])
  assert.equal(form.finalIndex, 999)
})
