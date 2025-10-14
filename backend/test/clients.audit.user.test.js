const fs = require('fs')
const path = require('path')
const request = require('supertest')
const os = require('os')

const tmpFile = path.join(__dirname, `test-sqlite-audit-user-${Date.now()}.db`)
process.env.SQLITE_FILE = tmpFile
process.env.USE_FAKES = 'false'

const app = require('../src/app')

afterAll(() => {
  try { fs.unlinkSync(tmpFile) } catch (e) {}
})

describe('Clients audit user propagation', () => {
  test('DELETE with X-User-Id header populates audit.user', async () => {
    // create
    const payload = { cliente: { name: 'Audit User', email: 'au@example.com' } }
    const createdRes = await request(app).post('/api/clients').send(payload)
    expect(createdRes.statusCode).toBe(201)
    const id = createdRes.body.id
    expect(id).toBeGreaterThan(0)

    // delete with headers (id + email)
    const userHeader = 'tester-42'
    const userEmail = 'tester-42@example.com'
    const delRes = await request(app)
      .delete(`/api/clients/${id}`)
      .set('X-User-Id', userHeader)
      .set('X-User-Email', userEmail)
    expect(delRes.statusCode).toBe(204)

    // inspect DB directly
    const Database = require('better-sqlite3')
    const db = new Database(tmpFile)
    const row = db.prepare('SELECT * FROM clients_audit WHERE client_id = ? ORDER BY audit_id DESC LIMIT 1').get(id)
    db.close()
    expect(row).toBeDefined()
    // adapter now may store user as JSON; try to parse
    let userVal = row.user
    try {
      userVal = JSON.parse(userVal)
    } catch (e) {}
    expect(userVal).toBeDefined()
    expect(userVal.id || userVal).toBe(userHeader)
    expect(userVal.email).toBe(userEmail)
  })
})
