const fs = require('fs')
const path = require('path')
const request = require('supertest')

const tmpFile = path.join(__dirname, `tmp-test-audit-${Date.now()}.db`)
process.env.SQLITE_FILE = tmpFile
process.env.USE_FAKES = 'false'

const app = require('./src/app')

;(async function(){
  try{
    console.log('tmpFile', tmpFile)
    const createdIds = []
    for(let i=0;i<25;i++){
      const res = await request(app).post('/api/clients').send({ cliente: { name: `P${i}`, email: `p${i}@ex.com` } })
      console.log('created', i, res.statusCode, res.body && res.body.id)
      createdIds.push(res.body.id)
    }
    for(let i=0;i<createdIds.length;i++){
      const uid = i%2===0 ? 'user-a':'user-b'
      const res = await request(app).delete(`/api/clients/${createdIds[i]}`).set('X-User-Id', uid)
      console.log('deleted', i, createdIds[i], res.statusCode)
    }
    const sampleId = createdIds[0]
    const adminToken = Buffer.from(JSON.stringify({ id: 'admin-1', email: 'admin@example.com', role: 'admin' })).toString('base64')
    const r1 = await request(app).get(`/api/clients/${sampleId}/audit?page=1&pageSize=10`).set('Authorization', `Bearer ${adminToken}`)
    console.log('r1', r1.statusCode, r1.body && r1.body.total)
    const r2 = await request(app).get(`/api/clients/${sampleId}/audit?userId=user-a`).set('Authorization', `Bearer ${adminToken}`)
    console.log('r2', r2.statusCode, r2.body && r2.body.rows && r2.body.rows.length)
    const from = new Date(Date.now()+1000*60*60).toISOString()
    const r3 = await request(app).get(`/api/clients/${sampleId}/audit?from=${encodeURIComponent(from)}`).set('Authorization', `Bearer ${adminToken}`)
    console.log('r3', r3.statusCode, r3.body && r3.body.rows && r3.body.rows.length)
    console.log('done')
  }catch(e){
    console.error('err', e)
  } finally{
    try{ fs.unlinkSync(tmpFile) }catch(e){}
  }
})();
