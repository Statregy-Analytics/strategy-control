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

// The asset's persisted currency is independent from wallet loading/preferences.
export function assetCurrencyCode(asset, currencies = []) {
  if (asset?.currencyCode != null && typeof asset.currencyCode !== 'string') return null
  const stored = asset?.currencyCode?.trim()
  if (stored) return /^[A-Za-z]{3}$/.test(stored) ? stored.toUpperCase() : null
  if (!asset?.currencyId) return null
  const legacy = currencies.find(
    (currency) => currency.currencyId === asset.currencyId,
  )?.currencyIsoCode
  return typeof legacy === 'string' && /^[A-Za-z]{3}$/.test(legacy.trim())
    ? legacy.trim().toUpperCase()
    : null
}

// Layout projection for C11-C14, independent of the HTTP payload projection above.
export function assetEditorSections(type) {
  const source = assetFormSections(type).map((s) => ({
    ...s,
    fields: s.fields.map((f) => ({ ...f })),
  }))
  const field = (key, label, type = 'text', extra = {}) => ({ key, label, type, ...extra })
  const finance = {
    title: type === 'RealEstate' ? 'Valor e situação financeira' : 'Situação financeira',
    icon: 'financial',
    fields: [
      field('declaredValue', type === 'RealEstate' ? 'Valor estimado' : 'Valor FIPE', 'number', {
        required: true,
        currency: true,
      }),
      field('paidOff', 'Está quitado?', 'toggle'),
      field('remainingBalance', 'Restante para quitação', 'number', { debt: true }),
    ],
  }
  const icons = {
    'Identificação do imóvel': 'identification',
    'Identificação do veículo': 'identification',
    Localização: 'location',
    'Registro imobiliário': 'registration',
    'Características físicas': 'features',
    'Identificação do consórcio': 'identification',
    'Valores financeiros': 'financial',
    Parcelamento: 'installments',
    'Situação da cota': 'quota',
    'Identificação da aplicação': 'identification',
    'Informações financeiras': 'financial',
  }
  source.forEach((s) => {
    s.icon = icons[s.title] || 'identification'
    s.fields.forEach((f) => {
      if (
        [
          'propertyType',
          'vehicleType',
          'quotaStatus',
          'contemplationMethod',
          'investmentType',
        ].includes(f.key)
      )
        f.select = true
      if (['declaredValue', 'initialAmount'].includes(f.key)) f.currency = true
    })
  })
  if (type === 'RealEstate') {
    source[0].fields.splice(1, 0, field('internalId', 'ID interno', 'text', { readonly: true }))
    source[2].fields = source[2].fields.filter((f) => !['city', 'state'].includes(f.key))
    source[2].fields.push(field('cityState', 'Cidade / UF', 'text', { required: true }))
    return [
      source[0],
      finance,
      source[2],
      { ...source[3], narrow: true },
      { ...source[4], narrow: true },
    ]
  }
  if (type === 'Vehicle') return [source[0], finance]
  if (type === 'Consortium') {
    source[1].fields.push(field('remainingBalance', 'Saldo devedor', 'number'))
    source[1].narrow = true
    source[2].fields.push(field('remainingInstallments', 'Restantes', 'number', { readonly: true }))
    source[2].narrow = true
    return source
  }
  if (type === 'Investment')
    return [
      source[0],
      { ...source[1], narrow: true },
      {
        title: 'Prazo e vencimento',
        icon: 'term',
        narrow: true,
        fields: [
          field('hasFixedTerm', 'Prazo determinado', 'toggle'),
          field('maturityDate', 'Data de vencimento', 'date', { term: true }),
          field('termMonths', 'Prazo em meses (opcional)', 'number', { term: true }),
        ],
      },
    ]
  return source
}
export function assetExpandedFacts(asset) {
  if (asset.assetType !== 'Consortium') return []
  const c = asset.consortium || {},
    missing = 'Não informado'
  const facts = [
    ['Valor da carta', asset.declaredValue, 'money'],
    ['Início', c.startDate || missing],
    ['Prazo', c.totalInstallments == null ? missing : `${c.totalInstallments} meses`],
    [
      'Parcelas',
      c.paidInstallments == null || c.totalInstallments == null
        ? missing
        : `${c.paidInstallments} / ${c.totalInstallments}`,
    ],
    ['Valor pago', c.amountPaid, 'money'],
    ['Saldo devedor', asset.remainingBalance, 'money'],
  ]
  const contemplated = ['Contemplated', 'Contemplado'].includes(c.quotaStatus)
  return [
    ...facts,
    ...(contemplated
      ? [
          ['Data contemplação', c.contemplationDate || missing],
          ['Carta liberada', c.releasedCredit ?? null, 'money'],
          ['Status utilização', c.utilizationStatus || missing],
          ['Tipo contemplação', c.contemplationMethod || missing],
        ]
      : [['Situação', c.quotaStatus || missing]]),
  ].map(([label, value, format]) => ({ label, value, format }))
}
