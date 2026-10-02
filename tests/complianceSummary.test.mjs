import { test } from 'node:test'
import assert from 'node:assert/strict'
import { summarizeCompliance } from '../src/services/complianceSummary.js'

test('uses complete counters, not the five recent alerts', () => {
  const summary = { activeCount: 12, primaryAlert: { title: 'Revisão pendente' }, recentAlerts: Array(5).fill({}) }
  const view = summarizeCompliance({ summary }, summary)
  assert.equal(view.activeCount, 12)
  assert.equal(view.recentAlerts.length, 5)
  assert.equal(view.status, 'Revisão pendente')
})
test('uses card summary when alerts are unavailable', () => {
  assert.equal(summarizeCompliance({ summary: { activeCount: 2 } }, null).status, 'Flags pendentes')
})
test('distinguishes zero from unavailable and accepts numeric strings', () => {
  assert.equal(summarizeCompliance(null, { activeCount: '0' }).status, 'Sem flags pendentes')
  assert.equal(summarizeCompliance(null, null).status, 'Indisponível')
  assert.equal(summarizeCompliance(null, null).activeCount, null)
  assert.equal(summarizeCompliance(null, null).available, false)
  assert.equal(summarizeCompliance(null, { activeCount: 'invalid' }).activeCount, null)
})
