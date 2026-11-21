import { readCurrentPages } from './requestContext.js'
import { numberInputValue } from './numberInputValue.js'
const sets = { deposit: 'Free', strategy: 'Applied', assets: 'Patrimony', total: 'Total' }
export function walletClientRow(item, type) {
  if (!item?.client?.id || !Array.isArray(item.currencies) || item.set !== sets[type])
    throw Error('Carteiras indisponíveis.')
  const currencies = item.currencies.map((c) => ({
    currency: c.currencyIsoCode,
    name: c.currencyName,
    currencyId: c.currencyId,
    balance: numberInputValue(c.balance),
    available: numberInputValue(c.available),
    contracted: numberInputValue(c.inContracts),
    idle: numberInputValue(c.idle),
    contractCount: c.contractCount,
    count: c.assetCount,
    declared: numberInputValue(c.declaredValue),
    current: numberInputValue(c.currentValue),
    appreciation:
      numberInputValue(c.currentValue) !== null && numberInputValue(c.declaredValue) > 0
        ? (Number(c.currentValue) / Number(c.declaredValue) - 1) * 100
        : null,
    variation:
      numberInputValue(c.currentValue) !== null && numberInputValue(c.declaredValue) !== null
        ? Number(c.currentValue) - Number(c.declaredValue)
        : null,
  }))
  return {
    key: `${item.client.id}:${type}`,
    type,
    customerId: item.client.id,
    clientName: item.client.name,
    clientCode: item.client.publicCode || item.client.id,
    currencyCount: currencies.filter((c) =>
      [c.balance, c.declared, c.current, c.contracted, c.idle].some((v) => v !== null && v !== 0),
    ).length,
    status: item.status,
    currencies,
    principalCurrency: item.primaryCurrencyIsoCode,
    consolidated: item.consolidated,
    total: numberInputValue(item.consolidated?.amount),
    base: numberInputValue(item.capitalBase),
    contractCount: item.contractCount,
    assetCount: item.assetCount,
    assetDescription: (item.assets || [])
      .map((asset) => asset.name)
      .filter(Boolean)
      .join(' · '),
    yieldPercentage: numberInputValue(item.yield),
    currentTotal: null,
    contracts: (item.contracts || []).map((c) => ({ ...c, id: c.contractId })),
    assets: item.assets || [],
    model: { source: 'marco3', yieldAvailable: false, [type]: { currencies } },
  }
}
export async function readWalletClients(read, current, type = 'total') {
  // The Figma consolidated directory keeps one card per wallet, not one per endpoint row.
  if (type === 'total') {
    const groups = await Promise.all(
      ['deposit', 'strategy', 'assets'].map((set) => readWalletClients(read, current, set)),
    )
    return current() && groups.every(Array.isArray) ? groups.flat() : null
  }
  const items = await readCurrentPages(
    (page) => read('admin/wallets/clients', { set: sets[type], page, pageSize: 100 }),
    current,
  )
  return current() && items ? items.map((item) => walletClientRow(item, type)) : null
}
export function walletTotalsModel(data) {
  if (!(numberInputValue(data?.usdToBrl?.rate) > 0)) throw Error('Cotação indisponível.')
  const totals = {}
  for (const [key, apiKey] of Object.entries({
    deposit: 'deposit',
    strategy: 'strategy',
    assets: 'patrimony',
    total: 'total',
  })) {
    const value = data[apiKey]
    if (numberInputValue(value?.usd) === null || numberInputValue(value?.brl) === null)
      throw Error('Totais das carteiras indisponíveis.')
    totals[key] = value
  }
  return {
    totals,
    fx: { 'USD-BRL': data.usdToBrl },
    yieldAvailable: false,
    baseCapitalAmount: numberInputValue(data.capitalBase?.usd),
    baseCapitalCurrency: 'USD',
    baseCapitalPercentage: numberInputValue(data.capitalBase?.percentageOfTotal),
  }
}
