const path = require('path')
process.env.SQLITE_FILE = path.join(__dirname, 'tmp-debug.db')
process.env.USE_FAKES = 'false'
const fs = require('fs')
try{ fs.unlinkSync(process.env.SQLITE_FILE) }catch(e){}
const adapter = require('./src/services/sqlite/clients')
const Database = require('better-sqlite3')
// create some data
const request = require('supertest')
const app = require('./src/app')
;(async function(){
  try{
    const createdIds = []
    for(let i=0;i<5;i++){
      const res = await request(app).post('/api/clients').send({ cliente: { name: `X${i}`, email: `x${i}@ex.com` } })
      createdIds.push(res.body.id)
    }
    for(let i=0;i<createdIds.length;i++){
      await request(app).delete(`/api/clients/${createdIds[i]}`).set('X-User-Id', i%2===0 ? 'user-a' : 'user-b')
    }
    const sample = createdIds[0]
    console.log('adapter.listAudit sample without filter', adapter.listAudit(sample, { page:1, pageSize:10 }))
    console.log('adapter.listAudit with userId user-a', adapter.listAudit(sample, { userId: 'user-a' }))
  }catch(e){
    console.error('ERR', e)
  }
})();
