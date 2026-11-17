import test from 'node:test'
import assert from 'node:assert/strict'
import {
  creditStageGroups,
  creditStages,
  creditCount,
  creditCounts,
  creditOperationGroup,
  creditUpdatedLabel,
} from '../src/services/creditDirectoryModel.js'
test('kanban places every record in its explicit commercial stage without mutating the source', () => {
  const rows = [
    { id: 'a', stage: 'Documentação' },
    { id: 'b', stage: 'Pré-proposta' },
    { id: 'c', stage: 'Documentação' },
  ]
  const groups = creditStageGroups(rows)
  assert.equal(groups.length, 7)
  assert.deepEqual(
    groups.find((g) => g.stage === 'Documentação').rows.map((r) => r.id),
    ['a', 'c'],
  )
  assert.deepEqual(
    groups
      .flatMap((g) => g.rows)
      .map((r) => r.id)
      .sort(),
    ['a', 'b', 'c'],
  )
  assert.deepEqual(
    rows.map((r) => r.id),
    ['a', 'b', 'c'],
  )
})
test('missing or unknown stages never turn existing loans into an empty successful board', () => {
  for (const rows of [
    [{ status: 'Pending' }],
    [{ stage: 'Unknown' }],
    [{ stage: 'Documentação' }, { id: 'missing' }],
  ])
    assert.equal(creditStageGroups(rows), null)
  assert.equal(creditStageGroups([]).length, creditStages.length)
})
test('counts preserve zero and reject invalid, fractional, negative and boolean data', () => {
  for (const value of [null, undefined, '', ' ', false, [], {}, -1, 1.5, Infinity, 'NaN'])
    assert.equal(creditCount(value), null)
  assert.equal(creditCount(0), 0)
  assert.equal(creditCount('3'), 3)
  assert.deepEqual(creditCounts({}), { partners: null, proposals: null, pending: null })
})
test('paid off loans are finalized, refused/cancelled are separate, and status is not a commercial stage', () => {
  for (const s of ['PaidOff', 'Closed', 'Settled']) assert.equal(creditOperationGroup(s), 'closed')
  for (const s of ['Cancelled', 'Canceled', 'Rejected'])
    assert.equal(creditOperationGroup(s), 'cancelled')
  assert.equal(creditOperationGroup('Active'), 'open')
  assert.equal(creditStageGroups([{ status: 'Active' }]), null)
})

test('recent updates keep hours while old and missing updates do not invent relative timestamps', () => {
  const now = new Date(2026, 10, 17, 16, 0)
  assert.equal(creditUpdatedLabel(new Date(2026, 10, 17, 14, 30).toISOString(), now), 'Hoje 14:30')
  assert.equal(creditUpdatedLabel(new Date(2026, 10, 16, 10, 20).toISOString(), now), 'Ontem 10:20')
  assert.equal(creditUpdatedLabel(new Date(2026, 9, 1, 12).toISOString(), now), '01/10/2026')
  assert.equal(creditUpdatedLabel(null, now), '—')
  assert.equal(creditUpdatedLabel('invalid', now), '—')
})
