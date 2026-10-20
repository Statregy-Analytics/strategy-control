// Only fields present in the profile's Figma asset editors belong in this projection.
const fields = (definitions) =>
  definitions.map(([key, label, type = 'text', required = false]) => ({
    key,
    label,
    type,
    required,
  }))
const sections = {
  RealEstate: [
    {
      title: 'Identificação do imóvel',
      fields: fields([
        ['nickname', 'Apelido do imóvel', 'text', true],
        ['propertyType', 'Tipo', 'text', true],
      ]),
    },
    {
      title: 'Valor estimado',
      fields: fields([['declaredValue', 'Valor estimado', 'number', true]]),
    },
    {
      title: 'Localização',
      fields: fields([
        ['postalCode', 'CEP', 'text', true],
        ['addressLine', 'Logradouro', 'text', true],
        ['number', 'Número', 'text', true],
        ['complement', 'Complemento'],
        ['neighborhood', 'Bairro', 'text', true],
        ['city', 'Cidade', 'text', true],
        ['state', 'UF', 'text', true],
      ]),
    },
    {
      title: 'Registro imobiliário',
      fields: fields([
        ['propertyTaxRegistration', 'Inscrição imobiliária (IPTU)'],
        ['registrationNumber', 'Número da matrícula'],
      ]),
    },
    {
      title: 'Características físicas',
      fields: fields([
        ['landAreaSquareMeters', 'Área terreno (m²)', 'number'],
        ['builtAreaSquareMeters', 'Área construída (m²)', 'number'],
        ['bedrooms', 'Quartos', 'number'],
        ['bathrooms', 'Banheiros', 'number'],
      ]),
    },
  ],
  Vehicle: [
    {
      title: 'Identificação do veículo',
      fields: fields([
        ['vehicleType', 'Tipo do veículo'],
        ['licensePlate', 'Placa', 'text', true],
        ['manufactureYear', 'Ano fabricação', 'number', true],
        ['modelYear', 'Ano modelo', 'number'],
        ['brand', 'Marca', 'text', true],
        ['model', 'Modelo', 'text', true],
        ['version', 'Versão'],
      ]),
    },
    {
      title: 'Situação financeira',
      fields: fields([['declaredValue', 'Valor FIPE', 'number', true]]),
    },
  ],
  Consortium: [
    {
      title: 'Identificação do consórcio',
      fields: fields([
        ['consortiumType', 'Tipo de consórcio', 'text', true],
        ['administrator', 'Administradora', 'text', true],
        ['broker', 'Corretora / origem'],
        ['groupNumber', 'Grupo', 'text', true],
        ['quotaNumber', 'Cota', 'text', true],
      ]),
    },
    {
      title: 'Valores financeiros',
      fields: fields([
        ['declaredValue', 'Valor da carta de crédito', 'number', true],
        ['amountPaid', 'Valor pago (total)', 'number', true],
      ]),
    },
    {
      title: 'Parcelamento',
      fields: fields([
        ['totalInstallments', 'Total de parcelas', 'number', true],
        ['paidInstallments', 'Pagas', 'number', true],
      ]),
    },
    {
      title: 'Situação da cota',
      fields: fields([
        ['quotaStatus', 'Status atual', 'text', true],
        ['contemplationMethod', 'Forma de contemplação'],
      ]),
    },
  ],
  Investment: [
    {
      title: 'Identificação da aplicação',
      fields: fields([
        ['investmentType', 'Tipo de investimento', 'text', true],
        ['institution', 'Corretora / instituição', 'text', true],
        ['productName', 'Nome do produto / aplicação', 'text', true],
      ]),
    },
    {
      title: 'Informações financeiras',
      fields: fields([
        ['initialAmount', 'Valor inicial aplicado', 'number', true],
        ['declaredValue', 'Valor bruto atual', 'number', true],
        ['startDate', 'Data de início / aporte', 'date', true],
      ]),
    },
  ],
}
const detailKey = {
  RealEstate: 'realEstate',
  Vehicle: 'vehicle',
  Consortium: 'consortium',
  Investment: 'investment',
}
const integerFields = new Set([
  'manufactureYear',
  'modelYear',
  'bedrooms',
  'bathrooms',
  'totalInstallments',
  'paidInstallments',
  'termMonths',
])
export const isAssetIntegerField = (key) => integerFields.has(key)
export const assetIntegerRule = (value) => {
  if (value == null || String(value).trim() === '') return true
  const number = Number(value)
  return (
    ((typeof value === 'number' || typeof value === 'string') &&
      /^\+?\d+(?:\.0+)?$/.test(String(value).trim()) &&
      Number.isInteger(number) &&
      number >= 0 &&
      number <= 2147483647) ||
    'Informe um número inteiro válido.'
  )
}
export const assetFormSections = (type) => sections[type] || []
export function assetDraft(asset, type) {
  return {
    ...asset[detailKey[type]],
    nickname: asset.nickname || '',
    declaredValue: asset.declaredValue ?? null,
    remainingBalance: asset.remainingBalance ?? (type === 'Consortium' ? 0 : null),
    paidOff: asset.status !== 'Financed',
    hasFixedTerm: asset.investment?.hasFixedTerm ?? false,
  }
}
export function assetPayload(draft, type, currencyId, existing) {
  if (!detailKey[type]) throw new Error('Tipo de patrimônio inválido.')
  const numeric = (key) => {
    if (draft[key] == null || String(draft[key]).trim() === '') return null
    if (isAssetIntegerField(key) && assetIntegerRule(draft[key]) !== true)
      throw new Error(assetIntegerRule(draft[key]))
    const value = Number(draft[key])
    if (!Number.isFinite(value) || value < 0) throw new Error('Informe valores numéricos válidos.')
    return value
  }
  const detail = {}
  // Preserve backend-supported metadata omitted from the designer's editor.
  if (type === 'Vehicle' && existing?.vehicle) detail.color = existing.vehicle.color
  for (const field of assetFormSections(type).flatMap((section) => section.fields)) {
    if (['nickname', 'declaredValue'].includes(field.key)) continue
    detail[field.key] =
      field.type === 'number' ? numeric(field.key) : draft[field.key]?.trim() || null
  }
  if (type === 'Investment')
    Object.assign(detail, {
      hasFixedTerm: !!draft.hasFixedTerm,
      maturityDate: draft.hasFixedTerm ? draft.maturityDate || null : null,
      termMonths: draft.hasFixedTerm ? numeric('termMonths') : null,
    })
  if (type === 'Consortium' && Number(detail.paidInstallments) > Number(detail.totalInstallments))
    throw new Error('Parcelas pagas não podem exceder o total.')
  const nickname =
    type === 'RealEstate'
      ? draft.nickname?.trim()
      : existing?.nickname ||
        (type === 'Vehicle'
          ? [draft.brand, draft.model].filter(Boolean).join(' ')
          : type === 'Investment'
            ? draft.productName
            : `${draft.administrator} · ${draft.groupNumber}/${draft.quotaNumber}`)
  const unchangedSettlement = existing && draft.paidOff === (existing.status !== 'Financed')
  const status =
    type === 'Consortium'
      ? Number(draft.remainingBalance) > 0
        ? 'Financed'
        : existing?.status === 'UnderReview'
          ? 'UnderReview'
          : 'PaidOff'
      : type === 'Investment' || unchangedSettlement
        ? existing?.status || 'PaidOff'
        : draft.paidOff
          ? 'PaidOff'
          : 'Financed'
  const payload = {
    nickname,
    declaredValue: numeric('declaredValue'),
    currencyId,
    status,
    [detailKey[type]]: detail,
  }
  if (status === 'Financed') {
    payload.remainingBalance = numeric('remainingBalance')
    if (!(payload.remainingBalance > 0)) throw new Error('Informe o saldo devedor maior que zero.')
  }
  if (!existing) payload.assetType = type
  return payload
}
