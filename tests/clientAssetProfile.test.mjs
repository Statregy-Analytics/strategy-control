import test from 'node:test'
import assert from 'node:assert/strict'
import {
  assetDraft,
  assetPayload,
  assetIntegerRule,
  isAssetIntegerField,
} from '../src/services/clientAssetProfile.js'

test('financed asset preserves debt and only its own detail block', () => {
  const result = assetPayload(
    {
      brand: 'Teste',
      model: 'Modelo',
      manufactureYear: '2022',
      licensePlate: 'TESTE',
      declaredValue: '100',
      paidOff: false,
      remainingBalance: '20',
    },
    'Vehicle',
    'currency',
  )
  assert.equal(result.status, 'Financed')
  assert.equal(result.remainingBalance, 20)
  assert.equal(result.vehicle.manufactureYear, 2022)
  assert.equal(result.realEstate, undefined)
})
test('settling an asset omits forbidden remainingBalance and preserves hidden metadata', () => {
  const existing = { status: 'Financed', nickname: 'Veículo', vehicle: { color: 'Azul' } }
  const result = assetPayload(
    { paidOff: true, declaredValue: 100, remainingBalance: 20 },
    'Vehicle',
    'currency',
    existing,
  )
  assert.equal(result.status, 'PaidOff')
  assert.equal(result.vehicle.color, 'Azul')
  assert.ok(!Object.hasOwn(result, 'remainingBalance'))
  assert.ok(!Object.hasOwn(result, 'assetType'))
})
test('editing an asset under review does not silently approve it', () => {
  const existing = { status: 'UnderReview', declaredValue: 100, nickname: 'Imóvel', realEstate: {} }
  const result = assetPayload(
    assetDraft(existing, 'RealEstate'),
    'RealEstate',
    'currency',
    existing,
  )
  assert.equal(result.status, 'UnderReview')
  assert.ok(!Object.hasOwn(result, 'remainingBalance'))
})
test('investment never becomes financed and clears dormant maturity fields', () => {
  const result = assetPayload(
    {
      declaredValue: 100,
      initialAmount: '50',
      productName: 'Teste',
      hasFixedTerm: false,
      maturityDate: '2030-01-01',
      termMonths: '12',
      paidOff: false,
      remainingBalance: 40,
    },
    'Investment',
    'currency',
  )
  assert.equal(result.status, 'PaidOff')
  assert.equal(result.investment.maturityDate, null)
  assert.equal(result.investment.termMonths, null)
  assert.ok(!Object.hasOwn(result, 'remainingBalance'))
})
test('invalid financial values and contradictory installments fail before HTTP', () => {
  assert.throws(() => assetPayload({ declaredValue: -1 }, 'Investment', 'currency'))
  assert.throws(() =>
    assetPayload({ declaredValue: 10, paidOff: false, remainingBalance: 0 }, 'Vehicle', 'currency'),
  )
  assert.throws(() =>
    assetPayload(
      { declaredValue: 10, paidInstallments: 11, totalInstallments: 10 },
      'Consortium',
      'currency',
    ),
  )
})
test('consortium derives settlement from the designed debt field', () => {
  const draft = {
    declaredValue: 100,
    remainingBalance: 20,
    paidInstallments: 2,
    totalInstallments: 10,
  }
  const financed = assetPayload(draft, 'Consortium', 'currency')
  assert.equal(financed.status, 'Financed')
  assert.equal(financed.remainingBalance, 20)
  const settled = assetPayload({ ...draft, remainingBalance: 0 }, 'Consortium', 'currency')
  assert.equal(settled.status, 'PaidOff')
  assert.ok(!Object.hasOwn(settled, 'remainingBalance'))
})

test('integer-only asset fields reject fractional and out-of-range input before HTTP', () => {
  for (const [type, key] of [
    ['Vehicle', 'manufactureYear'],
    ['Vehicle', 'modelYear'],
    ['RealEstate', 'bedrooms'],
    ['RealEstate', 'bathrooms'],
    ['Consortium', 'totalInstallments'],
    ['Consortium', 'paidInstallments'],
    ['Investment', 'termMonths'],
  ]) {
    assert.equal(isAssetIntegerField(key), true)
    for (const value of ['2.5', '2.00000000000000000001', 2147483648, -1, 'NaN', 'Infinity']) {
      assert.notEqual(assetIntegerRule(value), true)
      assert.throws(
        () =>
          assetPayload(
            { declaredValue: 100, paidOff: true, hasFixedTerm: true, [key]: value },
            type,
            'currency',
          ),
        /inteiro/,
      )
    }
  }
})
test('optional whole counts preserve null and zero; supported int32 boundary is accepted', () => {
  for (const value of [null, undefined, '', ' ', 0, '0', '2', '2.0', 2147483647])
    assert.equal(assetIntegerRule(value), true)
  const payload = assetPayload(
    { declaredValue: 10, bedrooms: 0, bathrooms: '', landAreaSquareMeters: '10.5', paidOff: true },
    'RealEstate',
    'currency',
  )
  assert.equal(payload.realEstate.bedrooms, 0)
  assert.equal(payload.realEstate.bathrooms, null)
  assert.equal(payload.realEstate.landAreaSquareMeters, 10.5)
  assert.equal(isAssetIntegerField('declaredValue'), false)
  assert.equal(isAssetIntegerField('landAreaSquareMeters'), false)
})
