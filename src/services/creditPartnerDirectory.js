import { foldSearch } from './adminWorkspaceModel.js'
import { numberInputValue } from './numberInputValue.js'

export function partnerProductNames(value) {
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string' || !item.trim()))
    return null
  return [...new Set(value.map((item) => item.trim()))]
}

export function partnerServices(partner) {
  const offered = partnerProductNames(partner?.products)
  // Enabled services are a separate projection, never inferred from the offer catalog.
  const enabled = partnerProductNames(partner?.enabledProducts)
  return { offered: offered?.length ?? null, enabled: enabled?.length ?? null, names: enabled }
}

export function partnerCommission(value, unavailable = '—') {
  const number = numberInputValue(value)
  return number === null || number < 0
    ? unavailable
    : new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 }).format(
        number,
      ) + '%'
}

export function matchesPartnerSearch(partner, query) {
  const search = foldSearch(query).trim()
  if (!search) return true
  const rules = Array.isArray(partner.rules)
    ? partner.rules.flatMap((rule) =>
        typeof rule === 'string' ? [rule] : [rule?.name, rule?.product],
      )
    : []
  return [
    partner.name,
    partner.publicCode,
    partner.type,
    ...(partnerProductNames(partner.products) || []),
    ...(partnerProductNames(partner.enabledProducts) || []),
    ...rules,
  ].some((value) => typeof value === 'string' && foldSearch(value).includes(search))
}

export function partnerDirectoryMetrics(summary) {
  return [
    ['activePartners', 'Parceiros Ativos'],
    ['products', 'Produtos Cadastrados'],
    ['validTables', 'Tabelas Vigentes'],
    ['expiringTables', 'Tabelas Vencendo', 'warning'],
    ['maxCommission', 'Maior Comissão', 'positive', 'percent'],
    ['bestConversion', 'Melhor Conversão', '', 'conversion'],
  ].map(([key, label, tone = '', format]) => {
    const number = numberInputValue(summary?.[key])
    const known = number !== null && number >= 0 && (format || Number.isInteger(number))
    return {
      key,
      label,
      tone: known ? tone : '',
      value: known
        ? format === 'percent'
          ? partnerCommission(number)
          : new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(number) +
            (format === 'conversion' ? '%' : '')
        : 'Indisponível',
    }
  })
}
