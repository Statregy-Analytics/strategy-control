const request = require('supertest')

// For tests, force fakes adapter
process.env.USE_FAKES = 'true'

const app = require('../src/app')

describe('Clients API (fakes)', () => {
  let createdId

  test('GET /api/clients should return an array', async () => {
    const res = await request(app).get('/api/clients')
    expect(res.statusCode).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  test('POST /api/clients should create a client', async () => {
    const payload = { cliente: { name: 'Test User', email: 'test@example.com' } }
    const res = await request(app).post('/api/clients').send(payload)
    expect(res.statusCode).toBe(201)
    expect(res.body).toHaveProperty('id')
    expect(res.body.cliente.name).toBe('Test User')
    createdId = res.body.id
  })

  test('PUT /api/clients/:id should update client', async () => {
    const payload = { cliente: { name: 'Updated User', email: 'updated@example.com' } }
    const res = await request(app).put(`/api/clients/${createdId}`).send(payload)
    expect(res.statusCode).toBe(200)
    expect(res.body.cliente.name).toBe('Updated User')
  })

  test('DELETE /api/clients/:id should remove client', async () => {
    const res = await request(app).delete(`/api/clients/${createdId}`)
    expect(res.statusCode).toBe(204)
    const getRes = await request(app).get(`/api/clients/${createdId}`)
    expect(getRes.statusCode).toBe(404)
  })
})
