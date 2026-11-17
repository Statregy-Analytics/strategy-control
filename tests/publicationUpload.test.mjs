import test from 'node:test'
import assert from 'node:assert/strict'
import vm from 'node:vm'
import { readFileSync } from 'node:fs'
import { parse, compileScript } from '@vue/compiler-sfc'
import * as Vue from 'vue'
import * as files from '../src/services/publicationFiles.js'
const { descriptor } = parse(
  readFileSync('src/components/Workspaces/PublicationUpload.vue', 'utf8'),
)
const source = compileScript(descriptor, { id: 'upload-test' }).content
async function instance(kind = 'pdf') {
  const context = vm.createContext({ console })
  const mod = new vm.SourceTextModule(source, { context })
  await mod.link(async (name) => {
    const values =
      name === 'vue' ? Vue : name.endsWith('publicationFiles') ? files : { default: {} }
    return new vm.SyntheticModule(
      Object.keys(values),
      function () {
        for (const [k, v] of Object.entries(values)) this.setExport(k, v)
      },
      { context },
    )
  })
  await mod.evaluate()
  const props = Vue.reactive({ kind, modelValue: null, disabled: false, previewUrl: '' })
  const events = [],
    scope = Vue.effectScope()
  const state = scope.run(() =>
    mod.namespace.default.setup(props, {
      expose() {},
      emit(name, value) {
        events.push([name, value])
        props.modelValue = value
      },
    }),
  )
  return { props, events, state, dispose: () => scope.stop() }
}
const event = (files) => ({ target: { files, value: 'selected' } })
test('attachment picker appends across selections, deduplicates and preserves files on rejection', async () => {
  const i = await instance('attachments')
  const a = new File(['a'], 'a.txt'),
    b = new File(['b'], 'b.txt')
  await i.state.selectFiles(event([a]))
  await i.state.selectFiles(event([a, b]))
  assert.deepEqual(Array.from(i.props.modelValue), [a, b])
  await i.state.selectFiles(event([new File([], 'empty.txt')]))
  assert.match(i.state.error.value, /não vazio/)
  assert.deepEqual(Array.from(i.props.modelValue), [a, b])
  await i.state.selectFiles(event([]))
  assert.equal(i.events.length, 2)
  i.dispose()
})
test('a pending PDF check cannot update another kind, disabled picker or disposed editor', async () => {
  for (const change of ['kind', 'disabled', 'dispose']) {
    const i = await instance()
    let resolve
    const pending = new Promise((r) => {
      resolve = r
    })
    const file = {
      type: 'application/pdf',
      size: 10,
      slice: () => ({ arrayBuffer: () => pending }),
    }
    const selection = i.state.selectFiles(event([file]))
    assert.equal(i.state.checking.value, true)
    if (change === 'dispose') i.dispose()
    else if (change === 'kind') i.props.kind = 'audio'
    else i.props.disabled = true
    resolve(new TextEncoder().encode('%PDF-').buffer)
    await selection
    assert.equal(i.events.length, 0)
    assert.equal(i.state.error.value, '')
    if (change !== 'dispose') {
      assert.equal(i.state.checking.value, false)
      i.dispose()
    }
  }
})
test('unreadable PDF preserves the previous file and clears busy state', async () => {
  const i = await instance()
  const previous = new File(['%PDF-'], 'previous.pdf', { type: 'application/pdf' })
  i.props.modelValue = previous
  await i.state.selectFiles(
    event([
      {
        type: 'application/pdf',
        size: 10,
        slice() {
          throw Error('read failure')
        },
      },
    ]),
  )
  assert.equal(i.props.modelValue, previous)
  assert.match(i.state.error.value, /Não foi possível ler/)
  assert.equal(i.state.checking.value, false)
  i.dispose()
})
