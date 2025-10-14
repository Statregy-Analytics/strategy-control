const fs = require('fs')
const path = require('path')
const request = require('supertest')

// Use a temp sqlite file for isolation
const tmpFile = path.join(__dirname, `test-sqlite-${Date.now()}.db`)
process.env.SQLITE_FILE = tmpFile
process.env.USE_FAKES = 'false'

const app = require('../src/app')

afterAll(() => {
  try {
    fs.unlinkSync(tmpFile)
  } catch (err) {
    // ignore
  }
})

describe('Clients API (sqlite)', () => {
  let createdId

  test('GET /clients initially empty', async () => {
  const res = await request(app).get('/api/clients')
    expect(res.statusCode).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBe(0)
  })

  test('POST /clients should create a client', async () => {
    const payload = { cliente: { name: 'Sqlite User', email: 'sqlite@example.com' } }
  const res = await request(app).post('/api/clients').send(payload)
    expect(res.statusCode).toBe(201)
    expect(res.body).toHaveProperty('id')
    expect(res.body.cliente.name).toBe('Sqlite User')
    createdId = res.body.id
  })

  test('GET /clients returns created client', async () => {
  const res = await request(app).get('/api/clients')
    expect(res.statusCode).toBe(200)
    expect(res.body.length).toBe(1)
  })

  test('PUT /api/clients/:id updates client', async () => {
    const payload = { cliente: { name: 'Sqlite Updated', email: 'up@ex.com' } }
    const res = await request(app).put(`/api/clients/${createdId}`).send(payload)
    expect(res.statusCode).toBe(200)
    expect(res.body.cliente.name).toBe('Sqlite Updated')
  })

  test('DELETE /api/clients/:id removes client', async () => {
    const res = await request(app).delete(`/api/clients/${createdId}`)
    expect(res.statusCode).toBe(204)
    const getRes = await request(app).get(`/api/clients/${createdId}`)
    expect(getRes.statusCode).toBe(404)
  })
})
