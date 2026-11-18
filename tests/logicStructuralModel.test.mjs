import test from 'node:test'
import assert from 'node:assert/strict'
import {
  catalogLogicForm,
  structuralProjection,
  structuralNumber,
  structuralDate,
  structuralTime,
  validateStructuralDraft,
} from '../src/services/logicStructuralModel.js'
test('catalog identity never supplies operational defaults or selectability as activity', () => {
  const form = catalogLogicForm({ name: 'Motor', isSelectable: true, currentIndex: 123 })
  assert.equal(form.initialIndex, null)
  assert.equal(form.positive, null)
  assert.equal(form.buffer, null)
  assert.equal(form.status, null)
  assert.ok(Object.values(structuralProjection(form)).every((v) => v === null))
})
test('derived bands require actual opening indices and preserve explicit zero', () => {
  const f = {
    initialIndex: 100,
    target: 4.8,
    intensityMode: 'Percentual da Banda Diária',
    intensity: 5,
    dailyCeiling: 0.8,
    dailyFloor: -0.8,
    monthlyCeiling: 2.5,
    monthlyFloor: -2.5,
    dayOpeningIndex: 100,
    monthOpeningIndex: 100,
  }
  const v = structuralProjection(f)
  assert.ok(Math.abs(v.finalIndex - 104.8) < 1e-10)
  assert.equal(v.positive, 0.04)
  assert.equal(v.negative, -0.04)
  assert.equal(v.effectiveTop, 100.8)
  assert.equal(v.effectiveBottom, 99.2)
  assert.equal(structuralProjection({ ...f, monthOpeningIndex: null }).effectiveTop, null)
  assert.equal(structuralProjection({ ...f, intensity: 0 }).positive, 0)
  assert.equal(structuralProjection({ ...f, target: false }).finalIndex, null)
  assert.equal(structuralProjection({ ...f, intensity: 101 }).positive, null)
})
test('missing values and invalid dates are not displayed as zero or a shifted date', () => {
  for (const value of [null, undefined, '', false, {}, Infinity])
    assert.equal(structuralNumber(value), 'Indisponível')
  assert.equal(structuralNumber(0), '0,00')
  assert.equal(structuralNumber(0.5, 0), '0,5')
  assert.equal(structuralDate('2026-02-30'), 'Indisponível')
  assert.equal(structuralDate('2026-05-01'), '01/05/2026')
  assert.equal(structuralTime('25:00'), 'Indisponível')
  assert.equal(structuralTime('10:42:59'), '10:42')
})
test('draft validation checks changed inputs without treating unknown server parameters as valid data', () => {
  const b = catalogLogicForm({ name: 'Motor' })
  assert.equal(validateStructuralDraft({ ...b, target: 5 }, b), '')
  assert.ok(validateStructuralDraft({ ...b, positive: 101 }, b))
  assert.ok(validateStructuralDraft({ ...b, intensity: -1 }, b))
  assert.ok(validateStructuralDraft({ ...b, dailyFloor: 1 }, b))
  assert.ok(validateStructuralDraft({ ...b, dailyCeiling: 3, monthlyCeiling: 2 }, b))
  assert.equal(validateStructuralDraft({ ...b, intensity: 0 }, b), '')
})
