export default function useVariablesGlobal() {
  // Opções para filtros
  const tiposOptions = ['Depósito', 'Transferência', 'Saque', 'Saldo']
  const statusOptions = ['Pendente', 'Concluído', 'Atrasado']
  const tiposOptionsDeposito = [
    { label: 'Depósito', value: 'deposit' },
    { label: 'Transferência', value: 'transfer' },
    { label: 'Saque', value: 'withdraw' },
    { label: 'Saldo', value: 'balance' },
  ]

  return {
    tiposOptions,
    statusOptions,
    tiposOptionsDeposito,
  }
}
