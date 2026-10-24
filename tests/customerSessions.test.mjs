import test from 'node:test'
import assert from 'node:assert/strict'
import vm from 'node:vm'
import { readFileSync } from 'node:fs'
import { componentModel, deferred, tick } from './helpers/componentModel.mjs'
import { useFinanceResource } from '../src/composables/useFinanceResource.js'
import * as context from '../src/services/requestContext.js'
import * as presentation from '../src/services/customerSessionPresentation.js'
const row = (id) => ({
  sessionId: id,
  createdAtUtc: '2026-10-24T12:00:00Z',
  expiresAtUtc: '2099-01-01T00:00:00Z',
  ipAddress: '192.0.2.100',
  userAgent: 'Mozilla/5.0 (Windows NT 10.0) Chrome/130.0 Safari/537.36',
})
async function setup(service = {}) {
  const calls = []
  const h = await componentModel('src/components/Clients/ClientSessionsPanel.vue', {
    props: { customerId: 'one' },
    modules: {
      'src/composables/useFinanceResource': { useFinanceResource },
      'src/services/requestContext': context,
      'src/services/customerSessionPresentation': presentation,
      'src/services/customerSessionService': {
        listCustomerSessions: async () => [row('session')],
        revokeCustomerSession: async (...args) => calls.push(args),
        ...service,
      },
    },
    exports: 'sessions,rows,busyId,revoke,load',
  })
  return { ...h, calls }
}
test('session rows use real dates, masked IP and equipment without inventing location or model', () => {
  const [value] = presentation.customerSessionRows([row('one')])
  assert.equal(value.ip, '192.0.***.***')
  assert.equal(value.equipment, 'PC / Windows / Chrome')
  assert.equal(value.local, 'Não informado')
  assert.match(value.date, /2026/)
  assert.equal(value.active, true)
  assert.equal(presentation.sessionEquipment('Mozilla iPhone Safari/604'), 'iPhone / iOS / Safari')
  assert.equal(presentation.sessionEquipment('unknown'), 'Não informado')
  const [missing] = presentation.customerSessionRows([
    { sessionId: 'two', createdAtUtc: 'invalid', ipAddress: '2001:db8::1234' },
  ])
  assert.equal(missing.date, 'Não informado')
  assert.equal(missing.ip, '2001:****:****')
  assert.equal(missing.active, false)
})
test('empty session collection and API failure are distinct, and retry recovers', async () => {
  let fail = true
  const h = await setup({
    listCustomerSessions: async () => {
      if (fail) throw Error('network')
      return []
    },
  })
  await h.ready
  assert.ok(h.m.sessions.state.error)
  assert.equal(h.m.sessions.state.data, null)
  fail = false
  await h.m.load()
  assert.equal(h.m.sessions.state.error, '')
  assert.equal(h.m.rows.value.length, 0)
  h.dispose()
})
test('late session list of another customer cannot repopulate the panel', async () => {
  const old = deferred()
  const h = await setup({
    listCustomerSessions: async (id) => (id === 'one' ? old.promise : [row('new')]),
  })
  h.props.customerId = 'two'
  await tick()
  old.resolve([row('old')])
  await h.ready
  assert.equal(h.m.rows.value[0].id, 'new')
  h.dispose()
})
test('revoking a session uses the customer route once and confirms the refreshed list', async () => {
  const held = deferred()
  let reads = 0,
    writes = 0
  const h = await setup({
    listCustomerSessions: async () => (++reads === 1 ? [row('session')] : []),
    revokeCustomerSession: async (customer, id) => {
      assert.equal(customer, 'one')
      assert.equal(id, 'session')
      writes++
      return held.promise
    },
  })
  await h.ready
  const pending = h.m.revoke('session')
  await h.m.revoke('session')
  assert.equal(writes, 1)
  held.resolve()
  await pending
  assert.equal(h.m.rows.value.length, 0)
  assert.equal(h.notices.length, 1)
  assert.equal(h.m.busyId.value, '')
  h.dispose()
})
test('failed logout preserves rows and permits retry without announcing success', async () => {
  let fail = true
  const h = await setup({
    revokeCustomerSession: async () => {
      if (fail) throw Error('failure')
    },
  })
  await h.ready
  await h.m.revoke('session')
  assert.equal(h.m.rows.value.length, 1)
  assert.equal(h.notices.includes('Sessão encerrada.'), false)
  assert.equal(h.m.busyId.value, '')
  fail = false
  await h.m.revoke('session')
  assert.equal(h.notices.at(-1), 'Sessão encerrada.')
  h.dispose()
})
test('closing a panel during logout suppresses late effects and additional reads', async () => {
  const held = deferred()
  let reads = 0
  const h = await setup({
    listCustomerSessions: async () => {
      reads++
      return [row('session')]
    },
    revokeCustomerSession: () => held.promise,
  })
  await h.ready
  const pending = h.m.revoke('session')
  h.dispose()
  held.resolve()
  await pending
  assert.equal(reads, 1)
  assert.equal(h.notices.length, 0)
  assert.equal(h.m.sessions.state.data, null)
})
test('old logout completion cannot clear another customer session rows or notify it', async () => {
  const held = deferred()
  const h = await setup({
    listCustomerSessions: async (id) => [row(id === 'one' ? 'session' : 'new')],
    revokeCustomerSession: () => held.promise,
  })
  await h.ready
  const pending = h.m.revoke('session')
  h.props.customerId = 'two'
  await tick()
  held.resolve()
  await pending
  assert.equal(h.m.rows.value[0].id, 'new')
  assert.equal(h.notices.length, 0)
  assert.equal(h.m.busyId.value, '')
  h.dispose()
})
test('unknown session ID never generates a logout request', async () => {
  const h = await setup()
  await h.ready
  await h.m.revoke('another-session')
  assert.equal(h.calls.length, 0)
  h.dispose()
})
test('actual service addresses the customer sessions, handles 204 and rejects malformed lists', async () => {
  const calls = []
  let envelope = { success: true, data: [row('session')] }
  const context = vm.createContext({ encodeURIComponent })
  const mod = new vm.SourceTextModule(
    readFileSync(new URL('../src/services/customerSessionService.js', import.meta.url), 'utf8'),
    { context },
  )
  await mod.link(
    () =>
      new vm.SyntheticModule(
        ['api'],
        function () {
          this.setExport('api', {
            get: async (path) => {
              calls.push(['get', path])
              return { data: envelope }
            },
            delete: async (path) => {
              calls.push(['delete', path])
              return { status: 204 }
            },
          })
        },
        { context },
      ),
  )
  await mod.evaluate()
  await mod.namespace.listCustomerSessions('customer')
  await mod.namespace.revokeCustomerSession('customer', 'session')
  assert.deepEqual(calls, [
    ['get', '/api/v1/admin/customers/customer/sessions'],
    ['delete', '/api/v1/admin/customers/customer/sessions/session'],
  ])
  envelope = { success: false, data: [] }
  await assert.rejects(mod.namespace.listCustomerSessions('customer'))
  envelope = { success: true, data: {} }
  await assert.rejects(mod.namespace.listCustomerSessions('customer'))
})
