import test from 'node:test'
import assert from 'node:assert/strict'
import { clearRouteChunkRetry, recoverRouteChunk } from '../src/services/routeChunkRecovery.js'

function setup() {
  const values = new Map(),
    targets = [],
    notices = []
  const env = {
    resolve: () => '/transaction?transactionId=fictitious&history=1',
    storage: {
      getItem: (key) => values.get(key),
      setItem: (key, value) => values.set(key, value),
      removeItem: (key) => values.delete(key),
    },
    location: { origin: 'https://admin.example.test', assign: (target) => targets.push(target) },
    notify: () => notices.push('failed'),
  }
  return { env, targets, notices }
}
const error = new TypeError('Failed to fetch dynamically imported module: /assets/old-release.js')
const route = { matched: [{ meta: { requiresAuth: true } }] }
test('a stale route module opens the same-origin destination with its history query', () => {
  const { env, targets } = setup()
  assert.equal(recoverRouteChunk(error, route, env), true)
  assert.deepEqual(targets, [
    'https://admin.example.test/transaction?transactionId=fictitious&history=1',
  ])
})
test('a persistent module failure cannot reload forever; a successful fresh page clears the retry marker', () => {
  const { env, targets, notices } = setup()
  assert.equal(recoverRouteChunk(error, route, env), true)
  assert.equal(recoverRouteChunk(error, route, env), false)
  assert.equal(targets.length, 1)
  assert.equal(notices.length, 1)
  clearRouteChunkRetry(env.storage)
  assert.equal(recoverRouteChunk(error, route, env), true)
  assert.equal(targets.length, 2)
})
test('ordinary errors, public routes, external URLs and inaccessible storage never trigger a reload', () => {
  const { env, targets, notices } = setup()
  assert.equal(recoverRouteChunk(new Error('HTTP 503'), route, env), false)
  assert.equal(recoverRouteChunk(error, { matched: [] }, env), false)
  assert.equal(
    recoverRouteChunk(error, route, { ...env, resolve: () => 'https://other.example.test/' }),
    false,
  )
  assert.equal(
    recoverRouteChunk(error, route, {
      ...env,
      storage: {
        getItem() {
          throw new Error('blocked')
        },
      },
    }),
    false,
  )
  assert.equal(targets.length, 0)
  assert.equal(notices.length, 1)
})
