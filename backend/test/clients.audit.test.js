const fs = require('fs')
const path = require('path')
const os = require('os')
describe('clients audit on delete', () => {
  const tmpDb = path.join(os.tmpdir(), `test-clients-audit-${Date.now()}.sqlite`)
  let svc

  beforeAll(() => {
    // instruct module to use our tmp DB before requiring it
    process.env.SQLITE_FILE = tmpDb
    process.env.USE_FAKES = 'false'
    // require the actual sqlite-backed service
    svc = require('../src/services/sqlite/clients')
  })

  afterAll(() => {
    try { fs.unlinkSync(tmpDb) } catch (e) {}
  })

  test('deleting a client writes an audit row', () => {
    const client = { name: 'Audit Me', cpf_cnpj: '12345678901', email: 'audit@example.com' }
    const created = svc.create(client)
    expect(created).toBeDefined()
    const id = created.id || (created.cliente && created.cliente.id) || created.rowid
    expect(id).toBeGreaterThan(0)

  // delete
  const ok = svc.delete(id)
    expect(ok).toBe(true)

    // check audit table directly against the sqlite file
    const Database = require('better-sqlite3')
    const direct = new Database(tmpDb)
    const audit = direct.prepare('SELECT * FROM clients_audit WHERE client_id = ?').get(id)
    expect(audit).toBeDefined()
    expect(audit.action).toBe('delete')
    direct.close()
  })
})
