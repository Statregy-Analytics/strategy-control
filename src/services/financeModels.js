export function positiveAmount(value) {
  if (
    value === null ||
    value === undefined ||
    value === '' ||
    !Number.isFinite(Number(value)) ||
    Number(value) <= 0
  )
    throw new Error('Informe um valor positivo.')
  return Number(value)
}
export function buildTransactionPayload(kind, form) {
  if (!form.clientId) throw new Error('Selecione um cliente.')
  const payload = {
    clientId: form.clientId,
    amount: positiveAmount(form.amount),
    observation: form.observation?.trim() || null,
  }
  if (kind !== 'contract-operations') {
    if (!form.currencyId) throw new Error('Selecione uma moeda disponível para o cliente.')
    payload.currencyId = form.currencyId
  }
  if (kind === 'deposits') {
    if (!form.bankId) throw new Error('Selecione a conta de origem.')
    return {
      ...payload,
      sourceBankAccountId: form.bankId,
      receiptDocumentId: form.receiptDocumentId || null,
    }
  }
  if (kind === 'withdrawals') {
    if (!form.bankId) throw new Error('Selecione a conta de destino.')
    return { ...payload, destinationBankAccountId: form.bankId }
  }
  if (kind === 'contract-operations') {
    if (!form.contractId) throw new Error('Selecione o contrato de destino.')
    return { ...payload, destinationContractId: form.contractId }
  }
  // Destination values are not enumerated by the published OpenAPI contract.
  // Keep the operation unavailable until the backend publishes that vocabulary.
  throw new Error('Transferências entre carteiras ainda não estão disponíveis.')
}
export function buildDraftPayload(form, term) {
  const allocations = form.clientAllocations || []
  if (allocations.some((p) => !p.clientId))
    throw new Error('Selecione o cliente de cada participação ou remova a linha vazia.')
  if (new Set(allocations.map((p) => p.clientId)).size !== allocations.length)
    throw new Error('Um cliente não pode aparecer duas vezes no contrato.')
  const nullableAmount = (value) => {
    if (value == null || value === '') return null
    if (!Number.isFinite(Number(value)) || Number(value) < 0)
      throw new Error('Informe um valor maior ou igual a zero.')
    return Number(value)
  }
  if (term && (!term.unit || !Number.isInteger(Number(term.value))))
    throw new Error('Informe um prazo inteiro e sua unidade.')
  return {
    name: form.name?.trim() || null,
    term: term ? { value: positiveAmount(term.value), unit: term.unit } : null,
    startDate: form.startDate || null,
    currencyId: form.currencyId || null,
    initialContractualCapital: nullableAmount(form.initialContractualCapital),
    initialCapitalOriginId: form.initialCapitalOriginId || null,
    financialNotes: form.financialNotes?.trim() || null,
    primaryEngineId: form.primaryEngineId || null,
    initialContractStatusId: form.initialContractStatusId || null,
    clientAllocations: allocations.map((p) => ({
      clientId: p.clientId,
      allocatedAmount: nullableAmount(p.allocatedAmount),
    })),
  }
}
