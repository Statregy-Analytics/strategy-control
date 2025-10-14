const request = require('supertest')
const path = require('path')
const fs = require('fs')

describe('CPF/CNPJ validation (fakes)', () => {
  let app
  beforeAll(() => {
    process.env.USE_FAKES = 'true'
    app = require('../src/app')
  })

  test('valid CPF accepted', async () => {
    const payload = { cliente: { name: 'CPF User', email: 'cpf@ex.com', cpf_cnpj: '529.982.247-25' } }
  const res = await request(app).post('/api/clients').send(payload)
    expect(res.statusCode).toBe(201)
  })

  test('invalid CPF rejected', async () => {
    const payload = { cliente: { name: 'Bad CPF', email: 'bad@ex.com', cpf_cnpj: '111.111.111-11' } }
  const res = await request(app).post('/api/clients').send(payload)
    expect(res.statusCode).toBe(400)
  })

  test('valid CNPJ accepted', async () => {
    const payload = { cliente: { name: 'CNPJ User', email: 'cnpj@ex.com', cpf_cnpj: '04.252.011/0001-10' } }
  const res = await request(app).post('/api/clients').send(payload)
    expect(res.statusCode).toBe(201)
  })

  test('invalid CNPJ rejected', async () => {
    const payload = { cliente: { name: 'Bad CNPJ', email: 'badcnpj@ex.com', cpf_cnpj: '00.000.000/0000-00' } }
  const res = await request(app).post('/api/clients').send(payload)
    expect(res.statusCode).toBe(400)
  })
})

describe('CPF/CNPJ validation (sqlite)', () => {
  let app
  const tmpFile = path.join(__dirname, `test-sqlite-val-${Date.now()}.db`)
  beforeAll(() => {
    process.env.USE_FAKES = 'false'
    process.env.SQLITE_FILE = tmpFile
    app = require('../src/app')
  })
  afterAll(() => {
    try { fs.unlinkSync(tmpFile) } catch (e) {}
  })

  test('valid CPF accepted (sqlite)', async () => {
    const payload = { cliente: { name: 'CPF User', email: 'cpf@ex.com', cpf_cnpj: '529.982.247-25' } }
  const res = await request(app).post('/api/clients').send(payload)
    expect(res.statusCode).toBe(201)
  })

  test('invalid CPF rejected (sqlite)', async () => {
    const payload = { cliente: { name: 'Bad CPF', email: 'bad@ex.com', cpf_cnpj: '111.111.111-11' } }
  const res = await request(app).post('/api/clients').send(payload)
    expect(res.statusCode).toBe(400)
  })
})
