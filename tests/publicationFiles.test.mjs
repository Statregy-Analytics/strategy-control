import test from 'node:test'
import assert from 'node:assert/strict'
import { validatePublicationFiles } from '../src/services/publicationFiles.js'
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
