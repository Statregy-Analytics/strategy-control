import test from 'node:test'
import assert from 'node:assert/strict'
import {
  walletCardCurrencies,
  walletCardConsolidated,
  walletCardPercent,
  walletCardCount,
} from '../src/services/walletCardModel.js'
test('card composition preserves known zero and keeps missing currencies unavailable', () => {
  const source = {
    currencies: [
      { currency: 'BRL', balance: 0, count: 0 },
      { currency: 'TWD', balance: 10 },
    ],
  }
  const rows = walletCardCurrencies(source)
  assert.deepEqual(
    rows.map((r) => r.currency),
    ['BRL', 'USD', 'EUR', 'CAD', 'JPY', 'CNY', 'AUD', 'TWD'],
  )
  assert.equal(rows[0].balance, 0)
  assert.equal(rows[0].count, 0)
  assert.equal(rows[1].balance, undefined)
  assert.equal(source.currencies.length, 2)
})
test('missing API currency names retain the catalogue label', () => {
  const rows = walletCardCurrencies({
    currencies: [
      { currency: 'BRL', name: null, balance: 1 },
      { currency: 'USD', name: '', balance: 2 },
    ],
  })
  assert.equal(rows[0].name, 'Real brasileiro')
  assert.equal(rows[1].name, 'Dólar americano')
})
test('card total uses directional quotes only when consolidation needs conversion', () => {
  const row = {
    currencies: [
      { currency: 'BRL', balance: 100 },
      { currency: 'USD', balance: 10 },
    ],
  }
  const fx = { 'BRL-USD': { rate: 0.2 }, 'USD-BRL': { rate: 5 } }
  assert.deepEqual(walletCardConsolidated(row, null), {
    value: null,
    currency: 'BRL',
    approximate: false,
  })
  assert.deepEqual(walletCardConsolidated(row, fx), {
    value: 150,
    currency: 'BRL',
    approximate: true,
  })
  assert.deepEqual(
    walletCardConsolidated({ currencies: [{ currency: 'USD', balance: 0 }] }, null),
    { value: 0, currency: 'USD', approximate: false },
  )
})
test('market current value is not inferred from declared or net asset value', () => {
  const row = { currencies: [{ currency: 'BRL', balance: 80, declared: 100, financed: 20 }] }
  assert.equal(walletCardConsolidated(row, null, 'current').value, null)
  assert.equal(walletCardConsolidated({ ...row, currentTotal: 120 }, null, 'current').value, 120)
})
test('card percentages and counts distinguish zero, negative and unknown', () => {
  assert.equal(walletCardPercent(null), '—')
  assert.equal(walletCardPercent(0), '0%')
  assert.equal(walletCardPercent(-2.5), '-2,5%')
  assert.equal(walletCardPercent(4), '+4%')
  assert.equal(walletCardCount(0, 'bem', 'bens'), '0 bens')
  assert.equal(walletCardCount(1, 'bem', 'bens'), '1 bem')
  assert.equal(walletCardCount(null, 'bem', 'bens'), '—')
})
