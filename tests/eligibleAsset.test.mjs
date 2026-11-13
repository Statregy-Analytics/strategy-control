import test from 'node:test'
import assert from 'node:assert/strict'
import { eligibleAssetPayload, existingEligibleAsset } from '../src/services/eligibleAssetModel.js'
const markets = [{ id: 'market', isActive: true }],
  currencies = [{ id: 'currency', value: 'BRL' }]
const form = {
  assetType: 'ExchangeTraded',
  marketId: 'market',
  name: 'Petrobras PN',
  ticker: 'petr4',
  currency: 'brl',
}
test('CT06 maps displayed ISO to actual currency ID and preserves the stock market', () => {
  assert.deepEqual(eligibleAssetPayload(form, markets, currencies), {
    assetType: 'ExchangeTraded',
    marketId: 'market',
    networkId: null,
    name: 'Petrobras PN',
    ticker: 'PETR4',
    currencyId: 'currency',
    tokenCode: null,
  })
  assert.throws(() => eligibleAssetPayload({ ...form, currency: 'UNKNOWN' }, markets, currencies))
  assert.throws(() => eligibleAssetPayload({ ...form, assetType: 'Crypto' }, markets, currencies))
})
test('CT06 reuses an identical asset without mutating the shared catalog', () => {
  const payload = eligibleAssetPayload(form, markets, currencies),
    asset = {
      id: 'asset',
      assetType: 'ExchangeTraded',
      market: { id: 'market' },
      name: 'Petrobras PN',
      ticker: 'PETR4',
      currency: { id: 'currency' },
    }
  assert.equal(existingEligibleAsset([asset], payload), asset)
  assert.throws(() => existingEligibleAsset([asset], { ...payload, name: 'Different company' }))
  assert.throws(() => existingEligibleAsset([asset], { ...payload, currencyId: 'other' }))
  assert.equal(existingEligibleAsset([asset], { ...payload, ticker: 'OTHER' }), null)
})
