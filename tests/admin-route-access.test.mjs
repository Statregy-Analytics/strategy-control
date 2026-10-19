import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import vm from 'node:vm'

async function harness({ token = true, roles = ['Admin'], unavailable = false } = {}) {
  let guard, calls = 0
  const notifications = []
  const context = vm.createContext({ process: { env: {} }, document: {} })
  const modules = new Map()
  const synthetic = (name, values) => modules.set(name, new vm.SyntheticModule(Object.keys(values), function () {
    for (const [key, value] of Object.entries(values)) this.setExport(key, value)
  }, { context }))
  synthetic('#q-app/wrappers', { defineRouter: fn => fn })
  synthetic('vue-router', {
    createRouter: () => ({ beforeEach: fn => { guard = fn } }),
    createMemoryHistory() {}, createWebHistory() {}, createWebHashHistory() {},
  })
  synthetic('quasar', { LocalStorage: { getItem: () => token }, Notify: { create: value => notifications.push(value) } })
  synthetic('src/boot/axios', { TOKEN_KEY: 'test-token-key' })
  synthetic('src/services/authService', { getCurrentUser: async () => {
    calls++
    if (unavailable) throw new Error('Unavailable')
    return { roles }
  } })
  const routes = new vm.SourceTextModule(await readFile(new URL('../src/router/routes.js', import.meta.url), 'utf8'), { context })
  await routes.link(() => { throw new Error('Unexpected import') }); await routes.evaluate()
  modules.set('./routes', routes)
  const router = new vm.SourceTextModule(await readFile(new URL('../src/router/index.js', import.meta.url), 'utf8'), { context })
  await router.link(spec => modules.get(spec)); await router.evaluate(); router.namespace.default()
  const parent = routes.namespace.default.find(route => route.path === '/landing-page')
  return {
    parent, notifications,
    enter: async (child = false) => {
      let result = 'not-called'
      await guard({ name: 'Edição de LP', matched: child ? [parent, parent.children[0]] : [parent] }, {}, value => { result = value ?? 'allowed' })
      return result
    },
    calls: () => calls,
  }
}

test('both landing page routes require authentication and administrator access', async () => {
  const h = await harness({ token: false })
  assert.equal(h.parent.meta.requiresAuth, true)
  assert.equal(h.parent.meta.requiresAdmin, true)
  for (const child of [false, true]) assert.equal((await h.enter(child)).name, 'Auth')
  assert.equal(h.calls(), 0)
})

test('a customer token cannot open LP editing', async () => {
  const h = await harness({ roles: ['Client'] })
  assert.equal((await h.enter(true)).name, 'Auth')
  assert.equal(h.calls(), 1)
  assert.equal(h.notifications.length, 1)
})

test('administrator role comes from auth/me and allows editing', async () => {
  const h = await harness()
  assert.equal(await h.enter(true), 'allowed')
  assert.equal(h.calls(), 1)
})

test('unverifiable or missing roles do not grant access', async () => {
  for (const config of [{ roles: [] }, { unavailable: true }]) {
    const h = await harness(config)
    assert.equal((await h.enter(true)).name, 'Auth')
  }
})

test('date-only customer values keep the same calendar day in Sao Paulo', async () => {
  const previousTz = process.env.TZ
  process.env.TZ = 'America/Sao_Paulo'
  try {
    const source = await readFile(new URL('../src/components/Table/Clients/ClientsTable.vue', import.meta.url), 'utf8')
    const match = source.match(/const formatDate = \(value\) => \{[\s\S]*?\n\}/)
    assert.ok(match, 'Customer date formatter was found')
    const formatDate = vm.runInNewContext(`${match[0]}; formatDate`, { Date, Intl, Number })
    assert.equal(formatDate('2026-10-17'), '17/10/2026')
    assert.equal(formatDate('2026-10-17T01:00:00Z'), '16/10/2026')
    assert.equal(formatDate('invalid'), '—')
  } finally {
    if (previousTz === undefined) delete process.env.TZ
    else process.env.TZ = previousTz
  }
})
