import test from 'node:test'
import assert from 'node:assert/strict'
import vm from 'node:vm'
import { readFileSync } from 'node:fs'
import { parse, compileScript, compileTemplate } from '@vue/compiler-sfc'
import * as Vue from 'vue'
import { renderToString } from '@vue/server-renderer'

const context = vm.createContext({})
async function component(path) {
  const { descriptor } = parse(readFileSync(new URL('../' + path, import.meta.url), 'utf8'))
  const compiled = compileScript(descriptor, { id: path, inlineTemplate: true })
  const mod = new vm.SourceTextModule(compiled.content, { context })
  await mod.link(async (name) => {
    const exports = name === 'vue' ? Vue : { default: await component(name) }
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
const frequency = await component('src/components/Workspaces/LogicFrequency.vue')
const select = await component('src/components/Entity/GlassSelect.vue')
async function render(form, disabled = false, root = frequency) {
  const inputs = [],
    selects = [],
    events = []
  const app = Vue.createSSRApp(root, {
    modelValue: form,
    disabled,
    'onUpdate:modelValue': (value) => events.push(value),
  })
  for (const name of ['QIcon', 'QItem', 'QItemSection']) {
    app.component(name, {
      render() {
        return Vue.h('span', this.$slots.default?.())
      },
    })
  }
  app.component('QInput', {
    inheritAttrs: false,
    props: ['modelValue', 'disable', 'type'],
    setup(props, { attrs, slots }) {
      inputs.push({
        label: attrs['aria-label'],
        value: props.modelValue,
        disabled: props.disable,
        type: props.type,
        update: attrs['onUpdate:modelValue'],
      })
      return () => Vue.h('div', [slots.prepend?.(), Vue.h('input', { value: props.modelValue })])
    },
  })
  app.component('QSelect', {
    inheritAttrs: false,
    props: ['modelValue', 'dropdownIcon', 'options'],
    setup(props, { attrs }) {
      selects.push({
        value: props.modelValue,
        icon: props.dropdownIcon,
        options: props.options,
        disabled: attrs.disable,
      })
      return () => Vue.h('select')
    },
  })
  const html = await renderToString(app)
  return { inputs, selects, html, events }
}

test('EC03 keeps missing operational data empty, without sample counts or interval options', async () => {
  const r = await render({})
  assert.equal(r.inputs.length, 5)
  assert.deepEqual(
    r.inputs.map((input) => input.value),
    [undefined, undefined, '—', '—', undefined],
  )
  assert.equal(r.selects.length, 1)
  assert.equal(r.selects[0].options.length, 0)
  assert.notEqual(r.selects[0].disabled, undefined)
  assert.equal(r.selects[0].icon, 'img:/icons/logics/frequency/chevron.svg')
  assert.match(r.html, /frequency\/clock\.svg/)
  assert.match(r.html, /frequency\/calendar\.svg/)
  assert.doesNotMatch(r.html, /4368|2026-05-01/)
})

test('EC03 preserves actual zero counts and existing dates instead of deriving a schedule', async () => {
  const form = Object.freeze({
    interval: null,
    updatesPerDay: 0,
    estimatedUpdates: 0,
    firstRun: '2026-05-01T09:30',
    lastRun: '2026-05-01 09:00',
    nextRun: '2026-05-01 10:00',
  })
  const r = await render(form)
  assert.deepEqual(
    r.inputs.map((input) => input.value),
    [0, form.firstRun, form.lastRun, form.nextRun, 0],
  )
  assert.equal(r.inputs[1].type, 'datetime-local')
  assert.equal(r.inputs[1].disabled, false)
  assert.ok(
    r.inputs.filter((_, index) => index !== 1).every((input) => input.disabled !== undefined),
  )
})

test('EC03 date editing and clearing emit only a new firstRun value and retain unrelated draft fields', async () => {
  const form = Object.freeze({ firstRun: null, target: 12, dailyCeiling: 0.8 })
  const r = await render(form)
  r.inputs.find((input) => input.label === 'Primeira Execução').update('2026-05-01T09:30')
  assert.equal(r.events[0].firstRun, '2026-05-01T09:30')
  assert.equal(r.events[0].target, 12)
  assert.equal(r.events[0].dailyCeiling, 0.8)
  assert.equal(form.firstRun, null)
  r.inputs.find((input) => input.label === 'Primeira Execução').update('')
  assert.equal(r.events[1].firstRun, null)
  const readonly = await render(form, true)
  assert.equal(readonly.inputs.find((input) => input.label === 'Primeira Execução').disabled, true)
})

test('shared GlassSelect retains the original arrow unless an explicit override is supplied', async () => {
  const r = await render(null, false, select)
  assert.equal(r.selects[0].icon, 'img:/icons/client-profile/form-chevron.svg')
})
