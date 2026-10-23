import test from 'node:test'
import assert from 'node:assert/strict'
import { createRequestContext, readCurrentPages } from '../src/services/requestContext.js'
import { deferred } from './helpers/componentModel.mjs'
test('owner changes, invalidation and disposal invalidate captured operations', () => {
  let owner = 'one'
  const scope = createRequestContext(() => owner),
    old = scope.capture()
  owner = 'two'
  assert.equal(old(), false)
  const current = scope.capture()
  scope.invalidate()
  assert.equal(current(), false)
  const last = scope.capture()
  scope.dispose()
  assert.equal(last(), false)
  assert.equal(scope.capture()(), false)
})
test('a late page stops the chain without publishing partial rows', async () => {
  const held = deferred(),
    scope = createRequestContext()
  let calls = 0
  const pending = readCurrentPages(() => {
    calls++
    return held.promise
  }, scope.capture())
  scope.dispose()
  held.resolve({ data: [{ id: 'old' }], pagination: { totalPages: 8 } })
  assert.equal(await pending, null)
  assert.equal(calls, 1)
})
test('pagination returns all rows and preserves failure rather than partial success', async () => {
  assert.deepEqual(
    await readCurrentPages(
      async (page) => ({ data: [page], pagination: { totalPages: 2 } }),
      () => true,
    ),
    [1, 2],
  )
  await assert.rejects(
    readCurrentPages(
      async (page) => {
        if (page === 2) throw Error('network')
        return { data: [1], pagination: { totalPages: 2 } }
      },
      () => true,
    ),
    /network/,
  )
})
