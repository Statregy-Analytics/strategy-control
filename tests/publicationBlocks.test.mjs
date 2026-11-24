import test from 'node:test'
import assert from 'node:assert/strict'
import { componentModel } from './helpers/componentModel.mjs'
import * as blocks from '../src/services/publicationBlocks.js'
async function editor() {
  const revoked = []
  let count = 0
  const i = await componentModel('src/components/Workspaces/PublicationBlocks.vue', {
    props: { modelValue: 'Texto existente', blocks: [], readonly: false },
    modules: { 'src/services/publicationBlocks': blocks },
    exports: 'insert, updateText, remove, move, chooseFile, error',
    globals: {
      crypto: { randomUUID: () => String(++count) },
      URL: {
        createObjectURL: () => 'blob:' + ++count,
        revokeObjectURL: (url) => revoked.push(url),
      },
    },
  })
  return {
    ...i,
    revoked,
    sync() {
      for (const [name, value] of i.events.splice(0)) i.props[name.split(':')[1]] = value
    },
  }
}
test('block insertion preserves legacy text and headings follow edits, moves and removal', async () => {
  const i = await editor()
  i.m.insert(0, 'h2')
  i.sync()
  assert.equal(i.props.blocks[0].text, 'Texto existente')
  i.m.updateText(1, 'Cenário')
  i.sync()
  i.m.insert(1, 'h3')
  i.sync()
  i.m.updateText(2, 'Detalhes')
  i.sync()
  i.m.move(2, -1)
  i.sync()
  assert.deepEqual(
    Array.from(blocks.publicationHeadings(i.props.blocks), (b) => b.text),
    ['Detalhes', 'Cenário'],
  )
  i.m.remove(1)
  i.sync()
  assert.equal(i.props.modelValue, 'Texto existente\n\nCenário')
  i.dispose()
})
test('image replacement rejection preserves current media; removal and disposal release blob URLs', async () => {
  const i = await editor()
  i.m.insert(0, 'image')
  i.sync()
  i.m.chooseFile(1, { name: 'a.png', type: 'image/png', size: 200 })
  i.sync()
  const previous = i.props.blocks[1].previewUrl
  i.m.chooseFile(1, { name: 'a.svg', type: 'image/svg+xml', size: 200 })
  i.sync()
  assert.equal(i.props.blocks[1].previewUrl, previous)
  assert.match(i.m.error.value, /compatível/)
  i.m.remove(1)
  i.sync()
  assert.deepEqual(i.revoked, [previous])
  i.m.insert(0, 'video')
  i.sync()
  i.m.chooseFile(1, { name: 'v.mp4', type: 'video/mp4', size: 200 })
  i.sync()
  i.dispose()
  assert.equal(i.revoked.length, 2)
})
test('read-only editor cannot change text, blocks or media', async () => {
  const i = await editor()
  i.props.readonly = true
  i.m.insert(0, 'h2')
  i.m.updateText(0, 'changed')
  i.m.remove(0)
  i.m.move(0, 1)
  i.m.chooseFile(0, null)
  assert.equal(i.events.length, 0)
  i.dispose()
})
test('publication links reject executable protocols and embedded credentials', () => {
  for (const url of [
    'javascript:alert(1)',
    'data:text/html,test',
    'file:///tmp/test',
    '//example.com',
    'https://user:secret@example.com',
  ])
    assert.equal(blocks.safePublicationLink(url), null)
  assert.equal(
    blocks.safePublicationLink('https://example.com/relatorio'),
    'https://example.com/relatorio',
  )
})
