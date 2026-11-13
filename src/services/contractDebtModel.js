export function validateDebtForm(f) {
  if (!f.name?.trim() || !f.creditor?.trim()) return 'Informe o nome da dívida e o credor.'
  if (!f.kind || !f.clientId) return 'Selecione o tipo da dívida e o cliente responsável.'
  for (const key of ['startDate', 'paymentStartDate', 'dueDate']) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(f[key] || '')) return 'Informe as datas da dívida.'
    const d = new Date(f[key] + 'T00:00:00Z')
    if (!Number.isFinite(d.getTime()) || d.toISOString().slice(0, 10) !== f[key])
      return 'Informe datas válidas para a dívida.'
  }
  for (const key of [
    'principalAmount',
    'outstandingAmount',
    'installmentAmount',
    'monthlyInterest',
  ])
    if (f[key] == null || f[key] === '' || !Number.isFinite(Number(f[key])) || Number(f[key]) < 0)
      return 'Revise os valores e a taxa de juros.'
  if (
    !Number.isInteger(Number(f.installment)) ||
    !Number.isInteger(Number(f.totalInstallments)) ||
    Number(f.installment) < 1 ||
    Number(f.totalInstallments) < Number(f.installment)
  )
    return 'Revise a parcela atual e o total de parcelas.'
  if (!Number.isInteger(Number(f.dueDay)) || Number(f.dueDay) < 1 || Number(f.dueDay) > 31)
    return 'Informe um dia de vencimento entre 1 e 31.'
  if (!f.amortization || !f.status)
    return 'Selecione o sistema de amortização e o status da dívida.'
  return ''
}
