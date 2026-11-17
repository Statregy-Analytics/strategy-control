import test from 'node:test'
import assert from 'node:assert/strict'
import {
  validatePublicationFiles,
  validatePublicationCover,
  mergePublicationAttachments,
} from '../src/services/publicationFiles.js'
const pdf = () => new File(['%PDF-1.4\nQA FICTICIO'], 'qa.pdf', { type: 'application/pdf' })
test('report accepts a PDF signature and rejects a renamed file before preview', async () => {
  assert.equal(await validatePublicationFiles([pdf()], 'pdf'), '')
  assert.match(
    await validatePublicationFiles(
      [new File(['bad'], 'fake.pdf', { type: 'application/pdf' })],
      'pdf',
    ),
    /não é um PDF válido/,
  )
  assert.match(
    await validatePublicationFiles(
      [new File(['%PDF-'], 'image.png', { type: 'image/png' })],
      'pdf',
    ),
    /PDF até 50MB/,
  )
})
test('report enforces displayed limits and audio formats, including browser WAV variants', async () => {
  assert.match(
    await validatePublicationFiles([{ type: 'application/pdf', size: 52428801 }], 'pdf'),
    /50MB/,
  )
  for (const type of ['audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/x-m4a', 'audio/mp4'])
    assert.equal(await validatePublicationFiles([new File(['QA'], 'audio', { type })], 'audio'), '')
  assert.match(
    await validatePublicationFiles([{ type: 'audio/mpeg', size: 104857601 }], 'audio'),
    /100MB/,
  )
  assert.match(
    await validatePublicationFiles([new File(['QA'], 'bad', { type: 'text/plain' })], 'audio'),
    /MP3, WAV ou M4A/,
  )
})
test('complementary attachment selection does not invent a restriction absent from the frame', async () => {
  assert.equal(
    await validatePublicationFiles(
      [new File(['QA'], 'apoio.csv', { type: 'text/csv' })],
      'attachments',
    ),
    '',
  )
})

test('empty files and multiple main documents cannot replace a valid selection', async () => {
  assert.match(await validatePublicationFiles([], 'pdf'), /pelo menos/)
  assert.match(await validatePublicationFiles([pdf(), pdf()], 'pdf'), /único/)
  for (const kind of ['pdf', 'audio', 'attachments']) {
    assert.match(await validatePublicationFiles([new File([], 'empty')], kind), /não vazio/)
  }
})
test('cover requires a nonempty image without imposing an undesigned size cap', () => {
  assert.match(validatePublicationCover(null), /imagem/)
  assert.match(validatePublicationCover(new File([], 'empty.png', { type: 'image/png' })), /vazia/)
  assert.match(validatePublicationCover(pdf()), /imagem/)
  assert.equal(validatePublicationCover(new File(['QA'], 'cover.png', { type: 'image/png' })), '')
  assert.equal(validatePublicationCover({ type: 'image/jpeg', size: 100000001 }), '')
})
test('adding attachments preserves earlier files and avoids duplicate selections', () => {
  const a = new File(['a'], 'a.txt', { type: 'text/plain', lastModified: 1 })
  const same = new File(['a'], 'a.txt', { type: 'text/plain', lastModified: 1 })
  const b = new File(['b'], 'b.txt', { type: 'text/plain', lastModified: 2 })
  const current = [a]
  assert.deepEqual(mergePublicationAttachments(current, [same, b, b]), [a, b])
  assert.deepEqual(current, [a])
  assert.deepEqual(mergePublicationAttachments(null, [b]), [b])
})
