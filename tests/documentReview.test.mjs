import test from 'node:test'
import assert from 'node:assert/strict'
import {
  canReviewDocument,
  documentReviewPayload,
  createDocumentReviewer,
} from '../src/services/documentReview.js'
const pending = {
  documentId: 'document',
  status: 'Pending',
  allowedActions: ['Download', 'Review'],
}
const setup = (write, item = () => pending) => {
  const state = {},
    updates = []
  const controller = createDocumentReviewer(state, {
    item,
    write,
    updated: (status) => updates.push(status),
    errorMessage: (error) => error.message,
  })
  return { state, updates, controller }
}
test('review requires an actual document, pending status and explicit API permission', () => {
  assert.equal(canReviewDocument(pending), true)
  for (const patch of [
    { documentId: null },
    { allowedActions: [] },
    { status: 'Approved' },
    { status: 'Rejected' },
    { status: 'Missing' },
  ])
    assert.equal(canReviewDocument({ ...pending, ...patch }), false)
})
test('approval adds no fields; rejection requires the designed reason and preserves both texts', () => {
  assert.deepEqual(documentReviewPayload('Approved'), { status: 'Approved', notes: null })
  assert.throws(() => documentReviewPayload('Rejected', ''), /Selecione o motivo/)
  assert.throws(() => documentReviewPayload('Rejected', 'Inventado'), /Selecione o motivo/)
  assert.deepEqual(documentReviewPayload('Rejected', 'Foto ilegível', '  Reenvie a imagem.  '), {
    status: 'Rejected',
    notes: 'Foto ilegível\nReenvie a imagem.',
  })
  assert.equal(documentReviewPayload('Rejected', 'Foto ilegível').notes, 'Foto ilegível')
})
test('empty reason does not write; error remains next to reason', async () => {
  let calls = 0
  const { controller, state } = setup(async () => calls++)
  assert.equal(await controller.submit('Rejected', ''), false)
  assert.equal(calls, 0)
  assert.match(state.reasonError, /Selecione/)
})
test('busy and successful review cannot be double submitted', async () => {
  let resolve,
    calls = 0
  const { controller, state, updates } = setup(() => {
    calls++
    return new Promise((done) => (resolve = done))
  })
  const first = controller.submit('Approved')
  assert.equal(state.saving, true)
  assert.equal(await controller.submit('Rejected', 'Foto ilegível'), false)
  resolve({ documentId: 'document', status: 'Approved' })
  assert.equal(await first, true)
  assert.equal(await controller.submit('Approved'), false)
  assert.equal(calls, 1)
  assert.deepEqual(updates, ['Approved'])
})
test('server failure permits retry and never reports approval', async () => {
  let fail = true
  const { controller, state, updates } = setup(async () => {
    if (fail) throw Error('Sem permissão')
    return { documentId: 'document', status: 'Rejected' }
  })
  assert.equal(await controller.submit('Rejected', 'Foto ilegível', 'Mensagem'), false)
  assert.match(state.error, /Sem permissão/)
  assert.deepEqual(updates, [])
  fail = false
  assert.equal(await controller.submit('Rejected', 'Foto ilegível', 'Mensagem'), true)
})
test('response for another document cannot announce success', async () => {
  const { controller, state, updates } = setup(async () => ({
    documentId: 'another',
    status: 'Approved',
  }))
  assert.equal(await controller.submit('Approved'), false)
  assert.match(state.error, /não confirmou/)
  assert.deepEqual(updates, [])
})
test('late response after changing customer or closing cannot update the profile', async () => {
  let resolve
  const { controller, state, updates } = setup(() => new Promise((done) => (resolve = done)))
  const first = controller.submit('Approved')
  controller.reset()
  resolve({ documentId: 'document', status: 'Approved' })
  assert.equal(await first, false)
  assert.equal(state.completed, false)
  assert.deepEqual(updates, [])
})
