export function profileDocumentSections(overview) {
  const sections = overview?.sections || []
  return [
    { code: 'PERSONAL', name: 'Documentação pessoal', codes: ['PERSONAL', 'PERSONAL_DOCUMENTS'] },
    {
      code: 'FISCAL',
      name: 'Contábil / fiscal',
      codes: ['ACCOUNTING_FISCAL', 'FISCAL', 'ACCOUNTING'],
    },
    { code: 'PLATFORM', name: 'Plataforma', codes: ['PLATFORM'] },
    { code: 'CONTRACTS', name: 'Contratos', codes: ['CONTRACTS'] },
  ].map((section, index) => ({
    ...section,
    order: index + 1,
    label: `${index + 1}. ${section.name}`,
    items: sections
      .filter((item) => section.codes.includes(item.code))
      .flatMap((item) => item.items || []),
  }))
}

// Count the four displayed Figma groups; asset photos belong to the asset registry.
// Files without individual requirements still count when present in those groups.
export function profileDocumentMetrics(overview) {
  let summary = overview?.summary || {}
  if (Array.isArray(overview?.sections)) {
    summary = { approved: 0, pending: 0, inReview: 0, missing: 0, rejected: 0 }
    for (const item of profileDocumentSections(overview).flatMap((section) => section.items)) {
      const key = {
        Approved: 'approved',
        Rejected: 'rejected',
        Pending: 'pending',
        UnderReview: 'inReview',
        InReview: 'inReview',
        Missing: 'missing',
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
      label: 'Aguardando',
      value:
        summary.pending == null
          ? '—'
          : Number(summary.pending) + Number(summary.inReview || 0) + Number(summary.missing || 0),
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
