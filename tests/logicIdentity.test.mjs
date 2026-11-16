import test from 'node:test'
import assert from 'node:assert/strict'
import vm from 'node:vm'
import { readFileSync } from 'node:fs'
import { parse, compileScript, compileTemplate } from '@vue/compiler-sfc'
import * as Vue from 'vue'
import { renderToString } from '@vue/server-renderer'
import * as model from '../src/services/adminWorkspaceModel.js'
const context = vm.createContext({})
async function component(path, inlineTemplate = true) {
  const { descriptor } = parse(readFileSync(new URL('../' + path, import.meta.url), 'utf8'))
  const compiled = compileScript(descriptor, { id: path, inlineTemplate })
  const mod = new vm.SourceTextModule(compiled.content, { context })
  await mod.link(async (name) => {
    const exports =
      name === 'vue'
        ? Vue
        : name === 'src/services/adminWorkspaceModel'
          ? model
          : { default: await component(name) }
    return new vm.SyntheticModule(
      Object.keys(exports),
      function () {
        for (const [key, value] of Object.entries(exports)) this.setExport(key, value)
      },
      { context },
    )
  })
  await mod.evaluate()
  if (!descriptor.scriptSetup) {
    const template = compileTemplate({
      source: descriptor.template.content,
      filename: path,
      id: path,
      compilerOptions: { mode: 'function' },
    })
    assert.deepEqual(template.errors, [])
    mod.namespace.default.render = new Function('Vue', template.code)(Vue)
  }
  return mod.namespace.default
}
const path = 'src/components/Workspaces/LogicIdentity.vue'
const identity = await component(path)
const script = await component(path, false)
async function render(form, code = '') {
  const inputs = [],
    selects = [],
    events = []
  const currencies = [{ value: 'BRL', label: 'Real Brasileiro' }]
  const app = Vue.createSSRApp(identity, {
    modelValue: form,
    code,
    currencies,
    'onUpdate:modelValue': (value) => events.push(value),
  })
  for (const name of ['QIcon', 'QItem', 'QItemSection'])
    app.component(name, {
      render() {
        return Vue.h('span', this.$slots.default?.())
      },
    })
  app.component('QInput', {
    inheritAttrs: false,
    props: ['modelValue', 'disable'],
    setup(props, { attrs }) {
      inputs.push({
        label: attrs['aria-label'],
        value: props.modelValue,
        disabled: props.disable,
        update: attrs['onUpdate:modelValue'],
      })
      return () => Vue.h('input', { value: props.modelValue })
    },
  })
  app.component('QSelect', {
    inheritAttrs: false,
    props: ['modelValue', 'options', 'dropdownIcon'],
    setup(props, { attrs }) {
      selects.push({
        label: attrs['aria-label'],
        value: props.modelValue,
        options: props.options,
        disabled: attrs.disable,
        icon: props.dropdownIcon,
        update: attrs['onUpdate:modelValue'],
      })
      return () => Vue.h('select')
    },
  })
  return { html: await renderToString(app), inputs, selects, events }
}

test('EC01 renders existing fields, selected icon/color and real catalog without sample data', async () => {
  const r = await render(model.initialLogic())
  assert.deepEqual(
    r.inputs.map((i) => i.label),
    ['Nome do Motor *', 'ID (Automático)', 'Descrição Interna'],
  )
  assert.notEqual(r.inputs[1].disabled, undefined)
  assert.equal(r.inputs[1].value, '')
  assert.deepEqual(r.selects[0].options, model.logicStatuses)
  assert.equal(r.selects[1].options[0].value, 'BRL')
  assert.equal(r.selects[2].options.length, 0)
  assert.notEqual(r.selects[2].disabled, undefined)
  assert.ok(r.selects.every((s) => s.icon === 'img:/icons/logics/identity/chevron.svg'))
  assert.equal((r.html.match(/<button/g) || []).length, 15)
  assert.equal((r.html.match(/aria-pressed="true"/g) || []).length, 2)
  assert.match(r.html, /identity\/heading-box\.svg/)
  assert.match(r.html, /identity\/check\.svg/)
  assert.doesNotMatch(r.html, /MOTOR-2026-317|Alpha-2 Institucional|Estratégia trimestral/)
})

test('editing/clearing identity fields and selecting currency preserve unrelated cycle values', async () => {
  const form = Object.freeze({ ...model.initialLogic(), target: 12, firstRun: '2026-05-01T09:30' })
  const r = await render(form)
  r.inputs[0].update('Motor QA')
  r.inputs[2].update('')
  r.selects[1].update('BRL')
  assert.equal(r.events[0].name, 'Motor QA')
  assert.equal(r.events[1].description, '')
  assert.equal(r.events[2].currency, 'BRL')
  assert.ok(r.events.every((e) => e.target === 12 && e.firstRun === form.firstRun))
  assert.equal(form.name, '')
  assert.equal(form.currency, null)
})

test('all existing icon and color actions emit independent copies without persisting or changing parameters', () => {
  const form = Object.freeze({ ...model.initialLogic(), target: 12 })
  const events = []
  const bindings = script.setup(
    { modelValue: form, currencies: [], code: '' },
    { expose() {}, emit: (name, value) => events.push([name, value]) },
  )
  assert.equal(bindings.icons.length, 8)
  assert.equal(bindings.colors.length, 7)
  for (const icon of bindings.icons) bindings.setField('icon', icon.value)
  for (const color of bindings.colors) bindings.setField('color', color.value)
  assert.equal(events.length, 15)
  assert.ok(
    events.every(
      ([name, value]) => name === 'update:modelValue' && value !== form && value.target === 12,
    ),
  )
  assert.equal(events[1][1].icon, 'activity1')
  assert.equal(form.icon, 'chart-pie')
  assert.equal(form.color, '#153d49')
})

test('provided identifiers and user text are escaped; palette/icon state follows current props', async () => {
  const r = await render(
    { ...model.initialLogic(), name: '<QA>', icon: 'shield', color: '#008236' },
    'ENGINE-QA',
  )
  assert.equal(r.inputs[0].value, '<QA>')
  assert.equal(r.inputs[1].value, 'ENGINE-QA')
  assert.match(r.html, /identity\/shield\.svg/)
  assert.match(r.html, /aria-label="Cor #008236" aria-pressed="true"/)
  assert.equal((r.html.match(/aria-pressed="true"/g) || []).length, 2)
})
