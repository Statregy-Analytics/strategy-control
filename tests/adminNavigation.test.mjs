import test from 'node:test'
import assert from 'node:assert/strict'
import routes from '../src/router/routes.js'
import {
  adminNavigation,
  adminSettings,
  navigationIsActive,
  systemDefinitions,
  availableSystemRoute,
} from '../src/services/adminNavigation.js'

function routedPaths(records, parent = '') {
  return records.flatMap((record) => {
    const path = record.path.startsWith('/')
      ? record.path
      : parent.replace(/\/$/, '') + '/' + record.path
    return [path.replace(/\/$/, '') || '/', ...routedPaths(record.children || [], path)]
  })
}
test('enabled menu items resolve to existing routes; unintegrated modules have no destination', () => {
  const paths = routedPaths(routes)
  for (const item of [...adminNavigation, ...adminSettings].filter((item) => item.to))
    assert.ok(paths.includes(item.to), item.to)
  assert.deepEqual(
    adminNavigation.filter((item) => !item.to).map((item) => item.label),
    ['Lógicas', 'Crédito', 'Comunicados'],
  )
  assert.ok(!adminNavigation.some((item) => /dashboard|assessor|lead|logic/.test(item.to || '')))
})
test('customer detail belongs to Clientes; auxiliary pages do not', () => {
  const clients = adminNavigation[0]
  assert.equal(navigationIsActive(clients, '/dataManagement/clients/test'), true)
  assert.equal(navigationIsActive(clients, '/dataManagement/'), true)
  for (const item of adminSettings) assert.equal(navigationIsActive(clients, item.to), false)
})
test('active menu matches full path segments, not unrelated prefixes', () => {
  const contracts = adminNavigation.find((item) => item.label === 'Contratos')
  assert.equal(navigationIsActive(contracts, '/contracts'), true)
  assert.equal(navigationIsActive(contracts, '/contracts-other'), false)
  assert.equal(
    navigationIsActive(
      adminNavigation.find((item) => item.label === 'Lógicas'),
      '/contracts/logic',
    ),
    false,
  )
})
test('server availability does not enable prototype LP or arbitrary destinations', () => {
  const data = systemDefinitions[0],
    lp = systemDefinitions[1]
  const response = {
    systems: [
      { id: data.id, status: 'available', route: 'https://example.com' },
      { id: lp.id, status: 'available', route: '/edit-lp' },
    ],
  }
  assert.equal(availableSystemRoute(data, response), '/dataManagement')
  assert.equal(availableSystemRoute(lp, response), null)
  assert.equal(availableSystemRoute(data, { systems: [] }), null)
  assert.equal(
    availableSystemRoute(data, { systems: [{ id: data.id, status: 'unavailable' }] }),
    null,
  )
})
test('root selection requires authentication and does not redirect straight into a module', () => {
  const root = routes.find((record) => record.path === '/')
  assert.equal(root.name, 'Selected')
  assert.equal(root.meta.requiresAuth, true)
  assert.equal(root.redirect, undefined)
  assert.equal(typeof root.component, 'function')
})
