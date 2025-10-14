const fs = require('fs')
const path = require('path')
const request = require('supertest')
const Database = require('better-sqlite3')

describe('Clients id non-null guarantees', () => {
  let tmpFile
  let app
  beforeAll(() => {
    tmpFile = path.join(__dirname, `test-sqlite-id-${Date.now()}.db`)
    // create a clients table without id column, insert a row, then add id column so existing row has id NULL
    const db = new Database(tmpFile)
    db.prepare("CREATE TABLE clients (name TEXT, cpf_cnpj TEXT, email TEXT, data TEXT)").run()
    const payload = JSON.stringify({ cliente: { name: 'Legacy', email: 'legacy@example.com' } })
    db.prepare('INSERT INTO clients (name, cpf_cnpj, email, data) VALUES (?, ?, ?, ?)').run('Legacy', null, 'legacy@example.com', payload)
    // add id column after insertion: existing rows will have id = NULL
    db.prepare('ALTER TABLE clients ADD COLUMN id INTEGER').run()
    db.close()

    process.env.USE_FAKES = 'false'
    process.env.SQLITE_FILE = tmpFile
    app = require('../src/app')
  })

  afterAll(() => {
    try { fs.unlinkSync(tmpFile) } catch (e) {}
  })

  test('GET /api/clients returns numeric non-null id even if id column is null', async () => {
    const res = await request(app).get('/api/clients')
    expect(res.statusCode).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBeGreaterThan(0)
    const item = res.body[0]
    expect(item).toHaveProperty('id')
    expect(item.id).not.toBeNull()
    expect(typeof item.id).toBe('number')
  })

  test('POST /api/clients returns created id numeric', async () => {
    const payload = { cliente: { name: 'New After Legacy', email: 'new@example.com' } }
    const res = await request(app).post('/api/clients').send(payload)
    expect(res.statusCode).toBe(201)
    expect(res.body).toHaveProperty('id')
    expect(res.body.id).not.toBeNull()
    expect(typeof res.body.id).toBe('number')
  })
})
