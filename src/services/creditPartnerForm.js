import { partnerTypes, partnerProducts } from './adminWorkspaceModel.js'
export const partnerTypeIcons = [
  'type-bank',
  'type-briefcase',
  'type-bank',
  'type-users',
  'type-money',
  'type-house',
  'type-other',
]
export function initialPartnerForm(partner) {
  return {
    name: partner?.name || '',
    type: partnerTypes.includes(partner?.type) ? partner.type : null,
    products: Array.isArray(partner?.products)
      ? partner.products.filter((p) => partnerProducts.includes(p))
      : [],
  }
}
export function validPartnerBasics(form) {
  return !!(
    form.name.trim() &&
    partnerTypes.includes(form.type) &&
    form.products.length &&
    form.products.every((p) => partnerProducts.includes(p))
  )
}
export function partnerRuleError(rules) {
  const numeric = [
    'minAmount',
    'maxAmount',
    'incomeCommitment',
    'minTerm',
    'maxTerm',
    'monthlyRate',
    'annualRate',
    'gracePeriod',
    'minGrace',
    'maxGrace',
  ]
  for (const r of Object.values(rules)) {
    for (const k of numeric) {
      if (r[k] == null || r[k] === '') continue
      if (!Number.isFinite(Number(r[k])) || Number(r[k]) < 0)
        return 'Informe valores numéricos válidos, maiores ou iguais a zero.'
    }
    if (r.incomeCommitment != null && r.incomeCommitment !== '' && Number(r.incomeCommitment) > 100)
      return 'Comprometimento da renda deve ficar entre 0 e 100%.'
    for (const key of ['minTerm', 'maxTerm', 'gracePeriod', 'minGrace', 'maxGrace'])
      if (r[key] != null && r[key] !== '' && !Number.isInteger(Number(r[key])))
        return 'Informe prazos em números inteiros.'
    for (const [min, max] of [
      ['minAmount', 'maxAmount'],
      ['minTerm', 'maxTerm'],
      ['minGrace', 'maxGrace'],
    ]) {
      if (
        r[min] != null &&
        r[min] !== '' &&
        r[max] != null &&
        r[max] !== '' &&
        Number(r[min]) > Number(r[max])
      )
        return 'O valor máximo deve ser maior ou igual ao mínimo.'
    }
    for (const c of r.collaterals || []) {
      if (!c.name.trim() || !['Sim', 'Sob análise', 'Não'].includes(c.accepted))
        return 'Revise o tipo de garantia e o aceite.'
      if (
        c.accepted !== 'Não' &&
        !(
          String(c.ltv).trim().toLocaleLowerCase('pt-BR') === 'variável' ||
          (c.ltv != null &&
            c.ltv !== '' &&
            Number.isFinite(Number(c.ltv)) &&
            Number(c.ltv) >= 0 &&
            Number(c.ltv) <= 100)
        )
      )
        return 'Revise o LTV: informe de 0 a 100% ou Variável.'
      for (const k of ['min', 'max'])
        if (c[k] != null && c[k] !== '' && (!Number.isFinite(Number(c[k])) || Number(c[k]) < 0))
          return 'Revise os valores da garantia.'
      if (
        c.min != null &&
        c.min !== '' &&
        c.max != null &&
        c.max !== '' &&
        Number(c.min) > Number(c.max)
      )
        return 'O valor máximo da garantia deve ser maior ou igual ao mínimo.'
    }
  }
  return ''
}
export function validPartnerLogo(file) {
  return (
    !file ||
    (['image/png', 'image/jpeg', 'image/svg+xml'].includes(file.type) &&
      file.size > 0 &&
      file.size <= 2097152)
  )
}
