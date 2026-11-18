import test from 'node:test'
import assert from 'node:assert/strict'
import vm from 'node:vm'
import { readFileSync } from 'node:fs'
import { parse, compileScript } from '@vue/compiler-sfc'
import * as Vue from 'vue'
import { renderToString } from '@vue/server-renderer'
import * as indicators from '../src/services/logicPerformanceModel.js'
const context = vm.createContext({})
const { descriptor } = parse(
  readFileSync(
    new URL('../src/components/Workspaces/LogicSimulationTables.vue', import.meta.url),
    'utf8',
  ),
)
const mod = new vm.SourceTextModule(
  compileScript(descriptor, { id: 'simulation', inlineTemplate: true }).content,
  { context },
)
await mod.link(async (name) => {
  const exports = name === 'vue' ? Vue : indicators
  return new vm.SyntheticModule(
    Object.keys(exports),
    function () {
      for (const [k, v] of Object.entries(exports)) this.setExport(k, v)
    },
    { context },
  )
})
await mod.evaluate()
const render = (props) =>
  renderToString(Vue.createSSRApp(mod.namespace.default, props)).then((html) =>
    html.replace(/<!--.*?-->/g, ''),
  )
test('official and simulated unavailable series never copy values or invent dates', async () => {
  const html = await render({
    official: { columns: ['18/11/2026'], values: { 'Papéis Recalculados': [0] } },
  })
  assert.match(html, /Papéis Recalculados<\/th><td><span[^>]*>0<\/span>/)
  assert.match(html, /Tabela Simulada/)
  assert.match(html, /Indisponível/)
  assert.equal((html.match(/18\/11\/2026/g) || []).length, 1)
})
test('simulation preserves independent series, semantic badges and escapes text', async () => {
  const html = await render({
    official: {
      columns: ['18/11/2026'],
      values: { 'Direção Sorteada': ['Positiva'], 'Faixa Aplicada': ['<QA>'] },
    },
    simulated: {
      columns: ['18/11/2026'],
      values: { 'Direção Sorteada': ['Negativa'], 'Zona de Amortecimento Usada': ['Não'] },
    },
  })
  assert.match(html, /logic-simulation-badge positive/)
  assert.match(html, /logic-simulation-badge negative/)
  assert.match(html, /logic-simulation-badge neutral/)
  assert.match(html, /&lt;QA&gt;/)
  assert.doesNotMatch(html, /<QA>/)
})
