import test from 'node:test'
import assert from 'node:assert/strict'
import vm from 'node:vm'
import { readFileSync } from 'node:fs'
import { isAuthenticationFailure } from '../src/services/authFailure.js'
const read = (p) => readFileSync(new URL('../' + p, import.meta.url), 'utf8')
const error = (status) =>
  Object.assign(new Error('controlled'), status ? { response: { status } } : {})
async function evaluate(source, modules, globals = {}) {
  const context = vm.createContext(globals),
    mod = new vm.SourceTextModule(source, {
      context,
      initializeImportMeta: (meta) => {
        meta.env = {}
      },
    })
  await mod.link(
    (name) =>
      new vm.SyntheticModule(
        Object.keys(modules[name]),
        function () {
          for (const [k, v] of Object.entries(modules[name])) this.setExport(k, v)
        },
        { context },
      ),
  )
  await mod.evaluate()
  return mod.namespace
}
for (const status of [undefined, 429, 500, 503, 401, 403]) {
  test(
    'Admin startup handles ' +
      (status || 'network failure') +
      ' without confusing availability and authentication',
    async () => {
      let mounted,
        cleared = 0
      const routes = [],
        notifications = []
      await evaluate(
        read('src/App.vue').match(/<script setup>([\s\S]*?)<\/script>/)[1],
        {
          vue: { onMounted: (fn) => (mounted = fn), onBeforeUnmount() {} },
          'vue-router': { useRouter: () => ({ replace: (route) => routes.push(route) }) },
          quasar: { useQuasar: () => ({ notify: (value) => notifications.push(value) }) },
          'src/stores/auth': {
            useAuthStore: () => ({
              hydrateAuth: () => true,
              fetchCurrentUser: async () => {
                throw error(status)
              },
              clearAuth: () => cleared++,
            }),
          },
          'src/services/authFailure': { isAuthenticationFailure },
        },
        { window: { addEventListener() {}, removeEventListener() {} } },
      )
      await mounted()
      const invalid = [401, 403].includes(status)
      assert.equal(cleared, invalid ? 1 : 0)
      assert.equal(routes.length, invalid ? 1 : 0)
      assert.equal(notifications.length, 1)
      assert.match(notifications[0].message, invalid ? /expirou/ : /verificar sua sessão/)
    },
  )
  test(
    'Admin access guard handles ' +
      (status || 'network failure') +
      ' without granting access or expiring a transient session',
    async () => {
      let guard
      const next = [],
        notifications = []
      const router = { onError() {}, beforeEach: (fn) => (guard = fn) }
      await evaluate(
        read('src/router/index.js'),
        {
          '#q-app': { defineRouter: (fn) => fn() },
          'vue-router': {
            createRouter: () => router,
            createMemoryHistory() {},
            createWebHistory() {},
            createWebHashHistory() {},
          },
          quasar: {
            LocalStorage: { getItem: () => 'current-token' },
            Notify: { create: (value) => notifications.push(value) },
          },
          './routes': { default: [] },
          'src/boot/axios': { TOKEN_KEY: 'token' },
          'src/services/authService': {
            getCurrentUser: async () => {
              throw error(status)
            },
          },
          'src/services/authFailure': { isAuthenticationFailure },
          'src/services/routeChunkRecovery': { clearRouteChunkRetry() {}, recoverRouteChunk() {} },
        },
        { document: {} },
      )
      await guard(
        {
          path: '/settings/audit',
          name: 'Auditoria',
          matched: [{ meta: { requiresAuth: true, requiresAdmin: true } }],
        },
        { path: '/contracts', matched: [] },
        (value) => next.push(value),
      )
      assert.equal(next.length, 1)
      if ([401, 403].includes(status)) assert.equal(next[0].name, 'Auth')
      else {
        assert.equal(next[0], false)
        assert.equal(notifications.length, 1)
      }
    },
  )
  test(
    'Admin refresh ' +
      (status || 'network failure') +
      ' only clears genuinely rejected credentials',
    async () => {
      const storage = new Map([
        ['sa_access_token', 'old-access'],
        ['sa_refresh_token', 'refresh'],
        ['sa_selected_workspace_id', 'workspace'],
      ])
      let responseError
      const events = []
      const api = {
          interceptors: {
            request: { use() {} },
            response: {
              use(ok, fail) {
                responseError = fail
              },
            },
          },
        },
        refresh = {
          post: async () => {
            throw error(status)
          },
        }
      let count = 0
      await evaluate(
        read('src/boot/axios.js'),
        {
          '#q-app': { defineBoot: (fn) => fn },
          axios: { default: { create: () => (count++ === 0 ? api : refresh) } },
          quasar: {
            LocalStorage: {
              getItem: (key) => storage.get(key),
              set: (k, v) => storage.set(k, v),
              remove: (key) => storage.delete(key),
            },
          },
          'src/services/authFailure': { isAuthenticationFailure },
        },
        {
          window: { dispatchEvent: (event) => events.push(event) },
          CustomEvent: class {
            constructor(name) {
              this.type = name
            }
          },
        },
      )
      await assert.rejects(responseError({ response: { status: 401 }, config: { headers: {} } }))
      const invalid = [401, 403].includes(status)
      assert.equal(storage.has('sa_access_token'), !invalid)
      assert.equal(storage.has('sa_refresh_token'), !invalid)
      assert.equal(storage.has('sa_selected_workspace_id'), !invalid)
      assert.equal(events.length, invalid ? 1 : 0)
    },
  )
}
