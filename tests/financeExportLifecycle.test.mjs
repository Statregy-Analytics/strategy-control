import test from 'node:test'
import assert from 'node:assert/strict'
import vm from 'node:vm'
import { readFileSync } from 'node:fs'
import { deferred } from './helpers/componentModel.mjs'
async function harness() {
  const response = deferred(),
    effects = []
  const context = vm.createContext({
    URL: {
      createObjectURL: () => {
        effects.push('url')
        return 'blob:test'
      },
      revokeObjectURL: () => effects.push('revoke'),
    },
    document: { createElement: () => ({ click: () => effects.push('download') }) },
    setTimeout: (fn) => fn(),
  })
  const mod = new vm.SourceTextModule(
    readFileSync(new URL('../src/services/financeService.js', import.meta.url), 'utf8'),
    { context },
  )
  await mod.link((name) => {
    const values = name.includes('financeIdempotency')
      ? { createIdempotentWriter: () => {} }
      : { api: { get: () => response.promise } }
    return new vm.SyntheticModule(
      Object.keys(values),
      function () {
        for (const [k, v] of Object.entries(values)) this.setExport(k, v)
      },
      { context },
    )
  })
  await mod.evaluate()
  return { response, effects, export: mod.namespace.financeExport }
}
test('statement response arriving after customer switch cannot download the old statement', async () => {
  const h = await harness()
  let current = true
  const pending = h.export('statement', {}, 'statement.csv', () => current)
  current = false
  h.response.resolve({ data: {} })
  assert.equal(await pending, false)
  assert.deepEqual(h.effects, [])
})
test('current statement export downloads and releases the object URL', async () => {
  const h = await harness()
  const pending = h.export('statement', {}, 'statement.csv')
  h.response.resolve({ data: {} })
  assert.equal(await pending, true)
  assert.deepEqual(h.effects, ['url', 'download', 'revoke'])
})
