import test from 'node:test'
import assert from 'node:assert/strict'
import {
  persistPhotos,
  photoSlot,
  photoUrl,
  validatePhoto,
  photoTypeCode,
} from '../src/services/assetPhotos.js'
const image = () => new File(['fictional QA image'], 'qa.png', { type: 'image/png' })
test('photo catalog and vehicle positions use stable metadata, not filenames or list order', () => {
  assert.equal(photoTypeCode('RealEstate'), 'FOTOS_IMOVEL')
  assert.equal(photoTypeCode('Vehicle'), 'FOTOS_VISTORIA_VEICULO')
  assert.equal(photoSlot('{"assetPhotoSlot":"driverSide"}'), 'driverSide')
  assert.equal(photoSlot('{"assetPhotoSlot":"invented"}'), null)
  assert.equal(photoSlot('not json'), null)
})
test('rejects empty, non-image and oversized files before upload', () => {
  assert.throws(() => validatePhoto({ type: 'application/pdf', size: 10 }), /imagem/)
  assert.throws(() => validatePhoto({ type: 'image/png', size: 0 }), /vazio/)
  assert.throws(() => validatePhoto({ type: 'image/png', size: 10485761 }), /10 MB/)
  assert.doesNotThrow(() => validatePhoto(image()))
  assert.throws(() => photoUrl('javascript:alert(1)'), /indisponível/)
  assert.equal(
    photoUrl({ temporaryUrl: 'https://example.com/qa.png' }),
    'https://example.com/qa.png',
  )
})
test('partial link failure retains uploaded ID; retry links once without reuploading successful items', async () => {
  const items = [{ file: image(), slot: 'chassis' }, { file: image() }]
  let uploads = 0,
    links = 0,
    fail = true
  const config = {
    items,
    customerId: 'customer',
    assetId: 'asset',
    typeId: 'type',
    upload: async (customer, data) => {
      assert.equal(customer, 'customer')
      assert.equal(data.get('documentTypeId'), 'type')
      if (!uploads)
        assert.deepEqual(JSON.parse(data.get('metadata')), { assetPhotoSlot: 'chassis' })
      return { id: `doc-${++uploads}` }
    },
    link: async (customer, asset, id) => {
      assert.equal(asset, 'asset')
      links++
      if (id === 'doc-2' && fail) throw new Error('link unavailable')
    },
  }
  await assert.rejects(persistPhotos(config), /link unavailable/)
  assert.equal(uploads, 2)
  assert.equal(items[0].linked, true)
  assert.equal(items[1].documentId, 'doc-2')
  fail = false
  await persistPhotos(config)
  assert.equal(uploads, 2)
  assert.equal(links, 3)
  assert.ok(items.every((item) => item.linked))
})
test('closing/changing customer during upload prevents a late link write', async () => {
  let active = true,
    links = 0
  const item = { file: image() }
  await assert.rejects(
    persistPhotos({
      items: [item],
      customerId: 'old',
      assetId: 'asset',
      typeId: 'type',
      active: () => active,
      upload: async () => {
        active = false
        return { id: 'uploaded' }
      },
      link: async () => {
        links++
      },
    }),
    /fechado/,
  )
  assert.equal(links, 0)
  assert.equal(item.documentId, 'uploaded')
  assert.equal(item.linked, undefined)
})
