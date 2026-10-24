const slots = {
  RealEstate: [
    ['MATRICULA_IMOVEL', 'Matrícula do Imóvel'],
    ['IPTU', 'IPTU'],
    ['CND_CONDOMINIO', 'CND Condomínio'],
  ],
  Vehicle: [
    ['CRLV_VEICULO', 'CRLV Digital'],
    ['CRV_VEICULO', 'CRV (Recibo de Compra e Venda)'],
  ],
  Consortium: [
    ['CONTRATO_ADESAO_CONSORCIO', 'Contrato de Adesão'],
    ['TERMO_CONTEMPLACAO_CONSORCIO', 'Termo de Contemplação'],
    ['EXTRATO_CONSORCIO', 'Extrato / Demonstrativo'],
  ],
  Investment: [
    ['EXTRATO_POSICAO_INVESTIMENTO', 'Extrato de Posição'],
    ['NOTA_CORRETAGEM_INVESTIMENTO', 'Nota de Corretagem'],
    ['COMPROVANTE_APLICACAO_INVESTIMENTO', 'Comprovante de Aplicação'],
  ],
}
export const assetDocumentSlots = (type) =>
  (slots[type] || []).map(([code, label]) => ({ code, label }))
export function validateAssetFile(file) {
  if (!file || !['application/pdf', 'image/jpeg', 'image/png'].includes(file.type))
    throw Error('Selecione um PDF ou uma imagem JPG ou PNG.')
  if (!file.size || file.size > 25 * 1024 * 1024)
    throw Error('O arquivo deve ter conteúdo e até 25 MB.')
}
export async function persistAssetDocuments({
  items,
  removed,
  customerId,
  assetId,
  upload,
  link,
  unlink,
  active,
}) {
  const current = () => {
    if (!active()) throw Error('O editor foi fechado. Reabra o patrimônio para continuar.')
  }
  for (const item of items) {
    if (!item.file || item.linked) continue
    current()
    validateAssetFile(item.file)
    if (!item.documentId) {
      const data = new FormData()
      data.append('file', item.file)
      data.append('documentTypeId', item.documentTypeId)
      const result = await upload(customerId, data)
      item.documentId = result?.id || result?.documentId
      if (!item.documentId) throw Error('O upload não retornou o documento.')
    }
    current()
    await link(customerId, assetId, item.documentId)
    item.linked = true
  }
  for (const id of [...removed]) {
    current()
    await unlink(customerId, assetId, id)
    removed.delete(id)
  }
}
