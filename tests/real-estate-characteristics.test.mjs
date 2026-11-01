import test from 'node:test'
import assert from 'node:assert/strict'
import { assetDraft, assetPayload } from '../src/services/clientAssetProfile.js'
import {
  characteristicsPayload,
  characteristicErrors,
} from '../src/services/realEstateCharacteristics.js'
const features = [
  { name: 'Piscina', value: 'Sim', isCustom: false },
  { name: 'Vista', value: 'Mar', isCustom: true },
]
const asset = {
  nickname: 'Imóvel QA',
  declaredValue: 100,
  status: 'PaidOff',
  realEstate: {
    propertyType: 'Casa',
    postalCode: '00000000',
    addressLine: 'Rua teste',
    number: '1',
    neighborhood: 'Centro',
    city: 'Cidade',
    state: 'SP',
    characteristics: features,
  },
}
test('editing uses an isolated copy and sends the entire ordered property list', () => {
  const draft = assetDraft(asset, 'RealEstate')
  draft.characteristics[1].value = 'Parque'
  assert.equal(asset.realEstate.characteristics[1].value, 'Mar')
  const payload = assetPayload(draft, 'RealEstate', 'BRL', asset)
  assert.deepEqual(payload.realEstate.characteristics, [
    features[0],
    { ...features[1], value: 'Parque' },
  ])
  assert.equal(payload.vehicle, undefined)
})
test('removing all sends [] and an omitted draft field preserves the existing list', () => {
  const draft = assetDraft(asset, 'RealEstate')
  draft.characteristics = []
  assert.deepEqual(assetPayload(draft, 'RealEstate', 'BRL', asset).realEstate.characteristics, [])
  delete draft.characteristics
  assert.deepEqual(
    assetPayload(draft, 'RealEstate', 'BRL', asset).realEstate.characteristics,
    features,
  )
  assert.deepEqual(assetDraft({}, 'RealEstate').characteristics, [])
})
test('enforces limit and required bounded names/values before sending', () => {
  assert.equal(characteristicsPayload(Array.from({ length: 5 }, () => features[0])).length, 5)
  assert.throws(
    () => characteristicsPayload(Array.from({ length: 6 }, () => features[0])),
    /máximo 5/,
  )
  for (const item of [
    { name: ' ', value: '2' },
    { name: 'Vagas', value: ' ' },
    { name: 'a'.repeat(81), value: '2' },
    { name: 'Vagas', value: '2'.repeat(121) },
  ])
    assert.throws(() => characteristicsPayload([item]))
  assert.deepEqual(characteristicsPayload([{ name: ' a ', value: ' b ', isCustom: true }]), [
    { name: 'a', value: 'b', isCustom: true },
  ])
  assert.equal(Object.keys(characteristicErrors).length, 5)
})
