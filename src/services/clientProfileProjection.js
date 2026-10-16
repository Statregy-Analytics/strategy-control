export function profileDocumentSections(overview) {
  const sections = overview?.sections || []
  return [
    { code: 'PERSONAL', name: 'Documentação pessoal', codes: ['PERSONAL'] },
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

// Counters and rows must describe the same overview, including files without requirements.
export function profileDocumentMetrics(overview) {
  const summary = overview?.summary || {}
  return [
    {
      label: Number(summary.approved) === 1 ? 'Aprovado' : 'Aprovados',
      value: summary.approved ?? '—',
      color: 'positive',
    },
    {
      label:
        Number(summary.pending || 0) +
          Number(summary.inReview || 0) +
          Number(summary.missing || 0) ===
        1
          ? 'Pendente'
          : 'Pendentes',
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
    baseValue: null,
    currentValue: null,
    blockedValue: null,
  }
}
