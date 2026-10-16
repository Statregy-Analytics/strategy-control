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
  // The backend vocabulary is documented; this form still has no transfer flow.
  // Keep it unavailable until the interface is defined in the approved design.
  throw new Error('Transferências entre carteiras ainda não estão disponíveis.')
}
export const contractTermOptions = [
  { label: 'Dias', value: 'Day', max: 36500 },
  { label: 'Meses', value: 'Month', max: 1200 },
  { label: 'Anos', value: 'Year', max: 100 },
]
export function buildContractTerm(term) {
  if (!term) return null
  const option = contractTermOptions.find((option) => option.value === term.unit)
  if (!option) throw new Error('Selecione dias, meses ou anos para o prazo.')
  const value = Number(term.value)
  if (!Number.isInteger(value) || value < 1 || value > option.max)
    throw new Error(`Informe um prazo inteiro entre 1 e ${option.max} ${option.label.toLowerCase()}.`)
  return { value, unit: option.value }
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
  return {
    name: form.name?.trim() || null,
    term: buildContractTerm(term),
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
