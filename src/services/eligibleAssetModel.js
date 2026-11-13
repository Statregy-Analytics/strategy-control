const normalized = (value) =>
  String(value || '')
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleUpperCase('pt-BR')
export function eligibleAssetPayload(form, markets, currencies) {
  const market = markets.find((m) => m.id === form.marketId && m.isActive !== false)
  const currency = currencies.find(
    (c) => normalized(c.value || c.isoCode || c.code) === normalized(form.currency),
  )
  if (form.assetType !== 'ExchangeTraded')
    throw Error('A definição do formulário de criptoativo ainda não está disponível.')
  if (!market || !form.name?.trim() || !form.ticker?.trim())
    throw Error('Informe a bolsa, o nome e o ticker do ativo.')
  if (!currency?.id) throw Error('Informe uma moeda disponível no catálogo.')
  return {
    assetType: 'ExchangeTraded',
    marketId: market.id,
    networkId: null,
    name: form.name.trim(),
    ticker: normalized(form.ticker),
    currencyId: currency.id,
    tokenCode: null,
  }
}
export function existingEligibleAsset(rows, payload) {
  const asset = rows.find(
    (a) =>
      a.assetType === payload.assetType &&
      a.market?.id === payload.marketId &&
      normalized(a.ticker) === normalized(payload.ticker),
  )
  if (!asset) return null
  if (
    asset.currency?.id !== payload.currencyId ||
    normalized(asset.name) !== normalized(payload.name)
  )
    throw Error(
      'Este ticker já está cadastrado com outro nome ou moeda. Confira os dados do catálogo.',
    )
  return asset
}
