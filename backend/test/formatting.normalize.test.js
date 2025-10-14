const request = require('supertest')
const path = require('path')
const fs = require('fs')
const Database = require('better-sqlite3')

describe('Normalization stored in sqlite', () => {
  const tmpFile = path.join(__dirname, `test-sqlite-norm-${Date.now()}.db`)
  let app
  beforeAll(() => {
    process.env.USE_FAKES = 'false'
    process.env.SQLITE_FILE = tmpFile
    app = require('../src/app')
  })
  afterAll(() => {
    try { fs.unlinkSync(tmpFile) } catch (e) {}
  })

  test('stores normalized CPF (digits only)', async () => {
    const payload = { cliente: { name: 'Norm CPF', email: 'norm@ex.com', cpf_cnpj: '529.982.247-25' } }
  const res = await request(app).post('/api/clients').send(payload)
    expect(res.statusCode).toBe(201)
    const id = res.body.id
    const db = new Database(tmpFile)
    const row = db.prepare('SELECT cpf_cnpj FROM clients WHERE id = ?').get(id)
    expect(row.cpf_cnpj).toBe('52998224725')
    db.close()
  })

  test('stores normalized CNPJ (digits only)', async () => {
    const payload = { cliente: { name: 'Norm CNPJ', email: 'normcnpj@ex.com', cpf_cnpj: '04.252.011/0001-10' } }
  const res = await request(app).post('/api/clients').send(payload)
    expect(res.statusCode).toBe(201)
    const id = res.body.id
    const db = new Database(tmpFile)
    const row = db.prepare('SELECT cpf_cnpj FROM clients WHERE id = ?').get(id)
    expect(row.cpf_cnpj).toBe('04252011000110')
    db.close()
  })
})
