const fs = require('fs')
const path = require('path')
const request = require('supertest')
const Database = require('better-sqlite3')

describe('parsed.data.id fallback behavior', () => {
  let tmpFile
  let app
  beforeAll(() => {
    tmpFile = path.join(__dirname, `test-sqlite-parse-${Date.now()}.db`)
    const db = new Database(tmpFile)
    db.prepare("CREATE TABLE IF NOT EXISTS clients (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, cpf_cnpj TEXT, email TEXT, data TEXT)").run()
    // insert a row where data contains { id: null, ... }
    const data = JSON.stringify({ id: null, cliente: { name: 'WithNull', email: 'withnull@example.com' } })
    db.prepare('INSERT INTO clients (name, cpf_cnpj, email, data) VALUES (?, ?, ?, ?)').run('WithNull', null, 'withnull@example.com', data)
    db.close()

    process.env.USE_FAKES = 'false'
    process.env.SQLITE_FILE = tmpFile
    app = require('../src/app')
  })

  afterAll(() => {
    try { fs.unlinkSync(tmpFile) } catch (e) {}
  })

  test('GET returns table id not overwritten by parsed null id', async () => {
    const res = await request(app).get('/api/clients')
    expect(res.statusCode).toBe(200)
    expect(res.body.length).toBe(1)
    const item = res.body[0]
    expect(item.id).not.toBeNull()
    expect(typeof item.id).toBe('number')
  })
})
