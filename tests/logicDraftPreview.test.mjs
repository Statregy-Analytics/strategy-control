import test from 'node:test'
import assert from 'node:assert/strict'
import vm from 'node:vm'
import { readFileSync } from 'node:fs'
import { parse, compileScript } from '@vue/compiler-sfc'
import * as Vue from 'vue'
import { renderToString } from '@vue/server-renderer'
import * as model from '../src/services/adminWorkspaceModel.js'
import * as numbers from '../src/services/numberInputValue.js'
const context = vm.createContext({})
async function component(path) {
  const { descriptor } = parse(readFileSync(new URL('../' + path, import.meta.url), 'utf8'))
  const compiled = compileScript(descriptor, { id: path, inlineTemplate: true })
  const mod = new vm.SourceTextModule(compiled.content, { context })
  await mod.link(async (name) => {
    const exports =
      name === 'vue'
        ? Vue
        : name === 'src/services/adminWorkspaceModel'
          ? model
          : name === 'src/services/numberInputValue'
            ? numbers
            : { default: await component('src/components/Workspaces/WorkspaceIcon.vue') }
    return new vm.SyntheticModule(
      Object.keys(exports),
      function () {
        for (const [key, value] of Object.entries(exports)) this.setExport(key, value)
      },
      { context },
    )
  })
  await mod.evaluate()
  return mod.namespace.default
}
const preview = await component('src/components/Workspaces/LogicDraftPreview.vue')
async function render(form) {
  return renderToString(
    Vue.createSSRApp(preview, {
      modelValue: form,
      currencies: [{ value: 'BRL', label: 'BRL — Real Brasileiro' }],
      configurationValid: !model.validateLogic(form),
    }),
  )
}
const valid = () => ({
  ...model.initialLogic(),
  name: 'Alpha-2 Institucional',
  currency: 'BRL',
  engineType: 'test',
  startDate: '2026-05-01',
  endDate: '2026-07-31',
  interval: '30 minutos',
  target: 4.8,
  dailyCeiling: 0.8,
  dailyFloor: -0.8,
  monthlyCeiling: 12,
  monthlyFloor: -12,
  intensity: 0.1,
})

test('the three EC02 variants use the draft name/color while sharing the real validation and projection', async () => {
  for (const [name, color] of [
    ['Alpha-2 Institucional', '#2b7fff'],
    ['Delta-Green', '#008236'],
    ['Atlas-Orange', '#fee685'],
  ]) {
    const form = Object.freeze({ ...valid(), name, color })
    assert.equal(model.validateLogic(form), '')
    const html = await render(form)
    assert.ok(html.includes(name))
    assert.ok(html.includes(color))
    assert.match(html, /104,8000/)
    assert.match(html, /4,80%/)
    assert.match(html, /01\/05–31\/07\/2026/)
    assert.match(html, /BRL — Real Brasileiro/)
    assert.equal((html.match(/>Válida</g) || []).length, 2)
    assert.match(html, /preview\/chart-pie\.svg/)
    assert.match(html, /preview\/clock\.svg/)
    assert.doesNotMatch(html, /MOTOR-2026-317|01\/05\/2026 09:30/)
  }
})

test('an incomplete draft never claims valid configuration or converts its initial index into a current index', async () => {
  const form = Object.freeze(model.initialLogic())
  const html = await render(form)
  assert.doesNotMatch(html, />Válida</)
  assert.match(html, /Índice Atual<\/dt><dd[^>]*>Indisponível/)
  assert.match(html, /Próxima Atualização<\/dt><dd>Indisponível/)
  assert.match(html, /Papéis\/Contratos Vinculados<\/dt><dd[^>]*>0/)
  assert.equal(form.initialIndex, 100)
  assert.equal(form.target, null)
})

test('draft changes, explicit zero, clearing and dynamic icons are reflected without mutating values', async () => {
  const form = Vue.reactive(valid())
  form.name = '<QA>'
  form.icon = 'shield'
  form.target = 0
  const html = await render(form)
  assert.match(html, /&lt;QA&gt;/)
  assert.match(html, /workspaces\/shield\.svg/)
  assert.match(html, /0,00%/)
  assert.match(html, /100,0000/)
  form.target = null
  const cleared = await render(form)
  assert.match(cleared, /Alvo do Ciclo<\/dt><dd[^>]*>Indisponível/)
  assert.doesNotMatch(cleared, />Válida</)
  assert.equal(form.target, null)
})

test('cycle preview preserves years across year boundaries and rejects missing or invalid dates', async () => {
  const form = { ...valid(), startDate: '2026-12-01', endDate: '2027-02-28' }
  assert.match(await render(form), /01\/12\/2026–28\/02\/2027/)
  for (const endDate of ['', '2027-02-30', 'invalid']) {
    assert.match(await render({ ...form, endDate }), /Ciclo Trimestral<\/dt><dd>Indisponível/)
  }
})
