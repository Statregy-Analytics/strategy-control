import test from 'node:test'
import assert from 'node:assert/strict'
import { customerTimelineTitle } from '../src/services/customerTimelinePresentation.js'

test('trusted-contact audit titles are translated without rewriting customer-entered text', () => {
  assert.equal(customerTimelineTitle({ title: 'Trusted contact created' }), 'Contato de confiança cadastrado')
  assert.equal(customerTimelineTitle({ title: 'Trusted contact updated' }), 'Contato de confiança atualizado')
  assert.equal(customerTimelineTitle({ title: 'Trusted contact deleted' }), 'Contato de confiança excluído')
  assert.equal(customerTimelineTitle({ title: 'Observação original do cliente' }), 'Observação original do cliente')
})
