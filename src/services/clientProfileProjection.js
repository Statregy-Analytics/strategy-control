export function profileDocumentSections(overview, catalog = {}) {
  const sections = overview?.sections || []
  return [
    { code: 'PERSONAL', name: 'Documentação pessoal', codes: ['PERSONAL', 'PERSONAL_DOCUMENTS'] },
    {
      code: 'FISCAL',
      name: 'Contábil / fiscal',
      codes: ['ACCOUNTING_FISCAL', 'FISCAL', 'ACCOUNTING'],
    },
    { code: 'ASSETS', name: 'Patrimônios', codes: ['PATRIMONIO', 'ASSETS'], assets: true },
    { code: 'PLATFORM', name: 'Plataforma', codes: ['PLATFORM'] },
    { code: 'CONTRACTS', name: 'Contratos', codes: ['CONTRACTS'] },
  ].map((section, index) => ({
    ...section,
    order: index + 1,
    label: `${index + 1}. ${section.name}`,
    items: completeDocumentItems(
      sections
        .filter((item) => section.codes.includes(item.code))
        .flatMap((item) => item.items || []),
      (catalog.types || []).filter((type) => {
        const category = (catalog.categories || []).find((entry) => entry.id === type.categoryId)
        return (
          section.codes.includes(category?.code) ||
          sections.some(
            (entry) => entry.categoryId === type.categoryId && section.codes.includes(entry.code),
          )
        )
      }),
    ),
  }))
}

const qaFiscalTypes = [
  ['HOLERITE', 'Holerite / Contracheque (3 meses)'],
  ['DECLARACAO_AUTONOMO', 'Declaração de autônomo'],
  ['RPA', 'Recibo autônomo (RPA)'],
  ['CONTRATO_PRESTACAO_SERVICOS', 'Contrato + comprovantes'],
  ['DECORE', 'Decore'],
]
function completeDocumentItems(items, types) {
  const excluded = ['CPF', 'NIF', 'COMPROVANTE_RENDA', 'COMPROVANTE_PATRIMONIAL']
  const result = items.filter((item) => !excluded.includes(item.documentTypeCode))
  for (const type of types) {
    if (excluded.includes(type.code)) continue
    if (!type.id || result.some((item) => item.documentTypeId === type.id)) continue
    result.push({
      documentTypeId: type.id,
      documentTypeCode: type.code,
      documentTypeName: type.name,
      documentId: null,
      requirementId: null,
      status: 'Missing',
      // Upload capability comes from the API catalog; existing per-client actions take precedence.
      allowedActions: type.allowsFileUpload === true ? ['Upload'] : [],
    })
  }
  const fiscal =
    items.some((item) =>
      ['DECLARACAO_IRPF', 'RECIBO_IRPF', 'EXTRATOS_BANCARIOS', 'INFORME_RENDIMENTOS'].includes(
        item.documentTypeCode,
      ),
    ) || types.some((type) => ['DECLARACAO_IRPF', 'RECIBO_IRPF'].includes(type.code))
  if (fiscal)
    for (const [code, name] of qaFiscalTypes) {
      if (!result.some((item) => item.documentTypeCode === code))
        result.push({
          documentTypeCode: code,
          documentTypeName: name,
          status: 'Missing',
          allowedActions: [],
        })
    }
  return result
}

// Count real files in the five displayed Figma groups; never count missing catalog placeholders.
// Files without individual requirements still count when present in those groups.
export function profileDocumentMetrics(overview) {
  let summary = overview?.summary || {}
  if (Array.isArray(overview?.sections)) {
    summary = { approved: 0, pending: 0, inReview: 0, missing: 0, rejected: 0 }
    for (const item of profileDocumentSections(overview).flatMap((section) => section.items)) {
      if (!item.documentId && !item.document?.id) continue
      const key = {
        Approved: 'approved',
        Rejected: 'rejected',
        Pending: 'pending',
        UnderReview: 'inReview',
        InReview: 'inReview',
        Uploaded: 'pending',
      }[item.status]
      if (key) summary[key]++
    }
  }
  return [
    {
      label: Number(summary.approved) === 1 ? 'Aprovado' : 'Aprovados',
      value: summary.approved ?? '—',
      color: 'positive',
    },
    {
      label:
        Number(summary.pending || 0) + Number(summary.inReview || 0) === 1
          ? 'Pendente'
          : 'Pendentes',
      value:
        summary.pending == null ? '—' : Number(summary.pending) + Number(summary.inReview || 0),
      color: 'warning',
    },
    {
      label: Number(summary.rejected) === 1 ? 'Rejeitado' : 'Rejeitados',
      value: summary.rejected ?? '—',
      color: 'negative',
    },
  ]
}

export function projectClientContract(contract, customerId) {
  const participant = contract.participants?.find((item) => item.clientId === customerId)
  if (!participant) return null
  return {
    id: contract.id,
    name: contract.name,
    publicCode: contract.publicCode,
    status: contract.businessStatus?.name || 'Não informado',
    statusCode: contract.businessStatus?.code,
    currencyId: contract.currency?.id,
    currencyCode: contract.currency?.isoCode,
    startDate: contract.startDate,
    endDate: contract.expectedEndDate,
    initialValue: participant.allocatedAmount,
    percentage: participant.allocationPercentage,
    // Whole-contract capital/currentBalance is not a participant's balance.
    baseValue: participant.baseAmount ?? null,
    currentValue: null,
    blockedValue: null,
  }
}
