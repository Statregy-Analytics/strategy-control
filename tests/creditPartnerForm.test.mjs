import test from 'node:test'
import assert from 'node:assert/strict'
import {
  initialPartnerForm,
  validPartnerBasics,
  partnerRuleError,
  validPartnerLogo,
} from '../src/services/creditPartnerForm.js'
import { partnerProducts, partnerTypes } from '../src/services/adminWorkspaceModel.js'
test('partner continuation requires a real name, supported type and selected product; source is not mutated', () => {
  const source = { name: 'QA', type: partnerTypes[0], products: [partnerProducts[0]] }
  const form = initialPartnerForm(source)
  assert.equal(validPartnerBasics(form), true)
  for (const override of [
    { name: '  ' },
    { type: null },
    { type: 'unknown' },
    { products: [] },
    { products: ['unknown'] },
  ])
    assert.equal(validPartnerBasics({ ...form, ...override }), false)
  form.products.push(partnerProducts[1])
  assert.equal(source.products.length, 1)
})
test('partner rules reject nonfinite, negative, reversed and impossible percentages but allow zero', () => {
  assert.equal(
    partnerRuleError({ a: { minAmount: 0, maxAmount: 0, incomeCommitment: 0, collaterals: [] } }),
    '',
  )
  for (const field of [
    { minAmount: -1 },
    { monthlyRate: 'NaN' },
    { minTerm: 24, maxTerm: 12 },
    { minGrace: 5, maxGrace: 4 },
    { incomeCommitment: 101 },
  ])
    assert.ok(partnerRuleError({ a: field }))
})
test('refused collateral does not require fictitious LTV; approved ones accept numeric or design Variable', () => {
  const c = { name: 'Imóvel', accepted: 'Não', ltv: null }
  assert.equal(partnerRuleError({ a: { collaterals: [c] } }), '')
  for (const ltv of [0, 100, 'Variável'])
    assert.equal(partnerRuleError({ a: { collaterals: [{ ...c, accepted: 'Sim', ltv }] } }), '')
  for (const ltv of [null, '', 101, -1, 'foo'])
    assert.ok(partnerRuleError({ a: { collaterals: [{ ...c, accepted: 'Sim', ltv }] } }))
  assert.ok(partnerRuleError({ a: { collaterals: [{ ...c, min: 200, max: 100 }] } }))
})
test('optional logo accepts only actual supported nonempty files within two megabytes', () => {
  assert.equal(validPartnerLogo(null), true)
  assert.equal(validPartnerLogo({ type: 'image/png', size: 1 }), true)
  for (const file of [
    { type: 'text/plain', size: 1 },
    { type: 'image/png', size: 0 },
    { type: 'image/svg+xml', size: 2097153 },
  ])
    assert.equal(validPartnerLogo(file), false)
})
