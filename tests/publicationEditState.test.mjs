import test from 'node:test'
import assert from 'node:assert/strict'
import { publicationEditLocked } from '../src/services/adminWorkspaceModel.js'
test('existing publication stays locked until the requested record is loaded', () => {
  assert.equal(publicationEditLocked({ recordId: 'B', source: null, loading: true }), true)
  assert.equal(publicationEditLocked({ recordId: 'B', source: null, loading: false }), true)
  assert.equal(publicationEditLocked({ recordId: 'B', source: { id: 'A', status: 'Draft' } }), true)
  assert.equal(
    publicationEditLocked({ recordId: 'B', source: { id: 'B', status: 'Draft' }, loading: true }),
    true,
  )
  assert.equal(
    publicationEditLocked({ recordId: 'B', source: { id: 'B', status: 'Draft' }, loading: false }),
    false,
  )
})
test('archive and in-flight writes prevent edits while a new local draft remains editable', () => {
  assert.equal(
    publicationEditLocked({ recordId: 'A', source: { id: 'A', status: 'Archived' } }),
    true,
  )
  assert.equal(
    publicationEditLocked({ recordId: 'A', source: { id: 'A', status: 'Published' }, busy: true }),
    true,
  )
  assert.equal(
    publicationEditLocked({ source: null, recordId: null, loading: false, busy: false }),
    false,
  )
})
