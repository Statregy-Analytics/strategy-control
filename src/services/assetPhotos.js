export const vehiclePhotoSlots = [
  ['frontDiagonal', 'Diagonal Dianteira'],
  ['rearDiagonal', 'Diagonal Traseira'],
  ['driverSide', 'Lateral Motorista'],
  ['passengerSide', 'Lateral Passageiro'],
  ['chassis', 'Foto do Chassi'],
]
export const photoTypeCode = (type) =>
  ({ RealEstate: 'FOTOS_IMOVEL', Vehicle: 'FOTOS_VISTORIA_VEICULO' })[type]
export function photoSlot(metadata) {
  try {
    const slot = JSON.parse(metadata || '{}').assetPhotoSlot
    return vehiclePhotoSlots.some(([key]) => key === slot) ? slot : null
  } catch {
    return null
  }
}
export function validatePhoto(file) {
  if (!file || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type))
    throw new Error('Selecione uma imagem JPG, PNG ou WebP.')
  if (!file.size) throw new Error('O arquivo está vazio.')
  if (file.size > 10 * 1024 * 1024) throw new Error('A imagem deve ter até 10 MB.')
}
export function photoUrl(value) {
  const url = value?.url || value?.temporaryUrl || value
  if (typeof url !== 'string' || !/^https?:\/\//i.test(url)) throw new Error('Prévia indisponível.')
  return url
}
// Keep an uploaded ID on a failed link so a retry does not upload another document.
export async function persistPhotos({
  items,
  customerId,
  assetId,
  typeId,
  upload,
  link,
  active = () => true,
}) {
  for (const item of items) {
    if (!active()) throw new Error('O editor foi fechado. Reabra o patrimônio para continuar.')
    if (!item.file || item.linked) continue
    validatePhoto(item.file)
    if (!item.documentId) {
      const data = new FormData()
      data.append('file', item.file)
      data.append('documentTypeId', typeId)
      if (item.slot) data.append('metadata', JSON.stringify({ assetPhotoSlot: item.slot }))
      const result = await upload(customerId, data)
      item.documentId = result?.id || result?.documentId
      if (!item.documentId) throw new Error('O upload não retornou o identificador da imagem.')
    }
    if (!active()) throw new Error('O editor foi fechado. Reabra o patrimônio para continuar.')
    await link(customerId, assetId, item.documentId)
    item.linked = true
  }
}
