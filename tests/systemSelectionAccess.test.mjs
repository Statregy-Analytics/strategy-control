import test from 'node:test'
import assert from 'node:assert/strict'
import vm from 'node:vm'
import { readFileSync } from 'node:fs'
import { useFinanceResource } from '../src/composables/useFinanceResource.js'
import { systemDefinitions, availableSystemRoute } from '../src/services/adminNavigation.js'
const source = readFileSync(
  new URL('../src/pages/Authentication/SystemSelectionPage.vue', import.meta.url),
  'utf8',
).match(/<script setup>([\s\S]*?)<\/script>/)[1]
async function setup(getUser) {
  let mount, dispose
  const modules = {
    vue: {
      onMounted: (fn) => {
        mount = fn
      },
      onScopeDispose: (fn) => {
        dispose = fn
      },
    },
    'src/components/Finance/ResourceState.vue': { default: {} },
    'src/composables/useFinanceResource': { useFinanceResource },
    'src/services/authService': {
      getMySystems: async () => ({ systems: [{ id: 'data-intake', status: 'available' }] }),
      getCurrentUser: getUser,
    },
    'src/services/adminNavigation': { systemDefinitions, availableSystemRoute },
  }
  const context = vm.createContext({})
  const mod = new vm.SourceTextModule(source + '\nexport {resource,load,destination}', { context })
  await mod.link(
    (name) =>
      new vm.SyntheticModule(
        Object.keys(modules[name]),
        function () {
          for (const [key, value] of Object.entries(modules[name])) this.setExport(key, value)
        },
        { context },
      ),
  )
  await mod.evaluate()
  return { ...mod.namespace, mount, dispose }
}
for (const role of ['Cliente', 'Admin']) {
  test(
    'selection binds server discovery to current authenticated ' + role + ' profile',
    async () => {
      const h = await setup(async () => ({ roles: [role] }))
      await h.mount()
      assert.equal(h.resource.state.error, '')
      assert.equal(h.destination(systemDefinitions[0]), role === 'Admin' ? '/dataManagement' : null)
      assert.equal(h.destination(systemDefinitions[1]), null)
      h.dispose()
      assert.equal(h.destination(systemDefinitions[0]), null)
    },
  )
}
test('selection does not enable access while identity is pending or failed; retry rechecks identity', async () => {
  let reject,
    attempt = 0
  const pending = new Promise((resolve, fail) => {
    reject = fail
  })
  const h = await setup(() => (++attempt === 1 ? pending : Promise.resolve({ roles: ['Admin'] })))
  const loading = h.mount()
  assert.equal(h.resource.state.loading, true)
  assert.equal(h.destination(systemDefinitions[0]), null)
  reject(Object.assign(new Error('unavailable'), { response: { status: 503 } }))
  await loading
  assert.ok(h.resource.state.error)
  assert.equal(h.destination(systemDefinitions[0]), null)
  await h.load()
  assert.equal(attempt, 2)
  assert.equal(h.destination(systemDefinitions[0]), '/dataManagement')
})
