import test from 'node:test'
import assert from 'node:assert/strict'
import { readGlobalWalletFx, globalWalletConverted } from '../src/services/globalWalletFx.js'
const model = {
  total: {
    currencies: [
      { currency: 'BRL', balance: 100 },
      { currency: 'USD', balance: 10 },
      { currency: 'EUR', balance: 5 },
    ],
  },
}
const rates = { 'USD-BRL': 5, 'BRL-USD': 0.2, 'EUR-USD': 1.1 }
const read = async (path, { from, to }) => {
  assert.equal(path, 'admin/exchange-rates/latest')
  return { success: true, data: { fromIsoCode: from, toIsoCode: to, rate: rates[from + '-' + to] } }
}
test('global wallet uses real directional quotes once and converts before aggregating', async () => {
  const calls = []
  const fx = await readGlobalWalletFx(async (...args) => {
    calls.push(args)
    return read(...args)
  }, model)
  assert.equal(calls.length, 3)
  assert.deepEqual(globalWalletConverted({ ...model, fx }, 'total'), { usd: 35.5, brl: 177.5 })
  assert.deepEqual(globalWalletConverted(model, 'total'), { usd: null, brl: null })
})
test('one missing quote does not erase independent quotes, and stale quotes are not installed', async () => {
  const fx = await readGlobalWalletFx(async (path, p) => {
    if (p.from === 'EUR') throw Error('503')
    return read(path, p)
  }, model)
  assert.equal(fx['EUR-USD'], undefined)
  assert.deepEqual(
    globalWalletConverted(
      { deposit: { currencies: [{ currency: 'USD', balance: 10 }] }, fx },
      'deposit',
    ),
    { usd: 10, brl: 50 },
  )
  assert.deepEqual(globalWalletConverted({ ...model, fx }, 'total'), { usd: null, brl: null })
  assert.equal(await readGlobalWalletFx(read, model, () => false), null)
})
test('invalid quotes, failed envelopes and malformed money never become financial zeros', async () => {
  for (const response of [
    { data: { fromIsoCode: 'EUR', toIsoCode: 'USD', rate: 2 } },
    { success: false, data: { fromIsoCode: 'USD', toIsoCode: 'BRL', rate: 5 } },
    { data: { fromIsoCode: 'USD', toIsoCode: 'BRL', rate: 0 } },
  ]) {
    await assert.rejects(readGlobalWalletFx(async () => response, { total: { currencies: [] } }))
  }
  for (const balance of [null, undefined, '', NaN])
    assert.deepEqual(
      globalWalletConverted({ total: { currencies: [{ currency: 'USD', balance }] } }, 'total'),
      { usd: null, brl: null },
    )
  assert.deepEqual(
    globalWalletConverted({ total: { currencies: [{ currency: 'BRL', balance: 0 }] } }, 'total'),
    { usd: 0, brl: null },
  )
})
