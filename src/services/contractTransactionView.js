const contractTypes = new Set([
  'ContractOperation',
  'ContractContribution',
  'ContractRedemption',
  'ContractDividend',
  'AssignedContribution',
])
export function isContractTransaction(row) {
  return (
    !!row &&
    (contractTypes.has(row.type) ||
      row.source?.kind === 'Contract' ||
      row.destination?.kind === 'Contract')
  )
}
export function contractTransactionLabel(row) {
  if (row?.type === 'AssignedContribution') return 'Aporte Atribuído'
  if (
    row?.type === 'ContractDividend' ||
    (row?.type === 'Yield' && row.source?.kind === 'Contract')
  )
    return 'Dividendo de Contrato'
  if (row?.type === 'ContractRedemption') return 'Resgate de Contrato'
  if (
    row?.type === 'ContractContribution' ||
    (row?.type === 'ContractOperation' &&
      row.destination?.kind === 'Contract' &&
      row.source?.kind === 'Wallet')
  )
    return 'Aporte em Contrato'
  return null
}
export function contractEndpoint(endpoint, currency) {
  if (!endpoint) return { title: '—', detail: '' }
  currency = endpoint.currencyIsoCode || currency
  if (endpoint.kind === 'Asset')
    return {
      title: endpoint.assetName || 'Patrimônio',
      detail:
        {
          RealEstate: 'Imóvel',
          Vehicle: 'Veículo',
          Consortium: 'Consórcio',
          Investment: 'Investimento',
        }[endpoint.assetType] || '',
    }
  if (endpoint.kind === 'Contract')
    return {
      title: endpoint.contractName || endpoint.contractPublicCode || 'Contrato',
      detail: currency ? 'contrato · ' + currency : '',
    }
  if (endpoint.kind === 'Wallet')
    return {
      title:
        endpoint.walletType === 'Applied'
          ? 'Carteira Strategy'
          : endpoint.walletType === 'Free'
            ? 'Carteira de Depósito'
            : 'Carteira',
      detail: endpoint.customerName || currency || '',
    }
  return {
    title: endpoint.bankName || 'Conta externa',
    detail: [
      endpoint.branch ? 'Ag. ' + endpoint.branch : '',
      endpoint.accountNumberMasked ? '****' + String(endpoint.accountNumberMasked).slice(-4) : '',
      currency,
    ]
      .filter(Boolean)
      .join(' · '),
  }
}
export function transactionContractId(row) {
  return (
    [row?.source, row?.destination].find((endpoint) => endpoint?.kind === 'Contract')?.id || null
  )
}
// No aggregate is reconstructed from unrelated transactions or ledger entries.
export function contractSourceCurrency(row) {
  return (
    row?.conversion?.sourceCurrencyIsoCode ||
    (Object.hasOwn(row || {}, 'conversion') ||
    !isContractTransaction(row) ||
    row?.source?.kind === 'Contract'
      ? row?.currencyIsoCode || row?.currency?.isoCode || null
      : null)
  )
}
export function contractTransactionTone(row) {
  return row?.status === 'Completed'
    ? 'completed'
    : row?.status === 'Canceled' || row?.status === 'Rejected' || row?.status === 'Error'
      ? 'negative'
      : 'pending'
}
