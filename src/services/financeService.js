import { createIdempotentWriter } from './financeIdempotency'
import { api } from 'src/boot/axios'
export const financeGet = async (path, params) => {
  const { data } = await api.get(`/api/v1/${path}`, { params })
  if (data?.success === false) throw new Error('Não foi possível consultar os dados.')
  return data
}
export const financeWrite = createIdempotentWriter(
  async (method, path, payload, idempotencyKey) => {
    const { data } = await api.request({
      method,
      url: `/api/v1/${path}`,
      data: payload,
      headers: { 'Idempotency-Key': idempotencyKey },
    })
    if (data?.success === false) throw new Error('Não foi possível concluir a operação.')
    return data?.data ?? data
  },
)
export async function financeExport(path, params, filename) {
  const { data } = await api.get(`/api/v1/${path}`, { params, responseType: 'blob' })
  const url = URL.createObjectURL(data)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
export function money(value, currency = 'BRL') {
  if (value === null || value === undefined || value === '' || !Number.isFinite(Number(value)))
    return 'Indisponível'
  try {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency || 'BRL',
    }).format(Number(value))
  } catch {
    return `${value} ${currency}`
  }
}
export const dateLabel = (value) =>
  value
    ? new Date(value.length === 10 ? `${value}T12:00:00` : value).toLocaleDateString('pt-BR')
    : '—'
const labels = {
  AwaitingReceipt: 'Aguardando comprovante',
  PaidOff: 'Quitado',
  AssetRecord: 'Patrimônio declarado',
  Contract: 'Contrato',
  Validated: 'Validada',
  PendingValidation: 'Aguardando validação',
  Canceled: 'Cancelada',
  Create: 'Criação',
  Created: 'Cadastrado',
  Updated: 'Atualização',
  External: 'Conta externa',
  Wallet: 'Carteira',
  Months: 'Meses',
  Month: 'Mês',
  Years: 'Anos',
  Year: 'Ano',
  Days: 'Dias',
  Day: 'Dia',
  RealEstate: 'Imóvel',
  Vehicle: 'Veículo',
  Consortium: 'Consórcio',
  Transaction: 'Movimentações',
  Contracts: 'Contratos',
  Ledger: 'Livro-razão',
  Asset: 'Patrimônio',
  Banking: 'Banking',
  Investment: 'Investimento',
  Draft: 'Rascunho',
  Finalized: 'Finalizado',
  Free: 'Livre',
  Reserved: 'Reservada',
  Deposit: 'Depósito',
  Withdrawal: 'Saque',
  WalletTransfer: 'Transferência',
  ContractOperation: 'Operação de contrato',
  Completed: 'Concluída',
  Pending: 'Pendente',
  Requested: 'Solicitada',
  Approved: 'Aprovada',
  Rejected: 'Rejeitada',
  Cancelled: 'Cancelada',
  Validate: 'Validar',
  Approve: 'Aprovar',
  Reject: 'Rejeitar',
  Execute: 'Executar',
  Cancel: 'Cancelar',
  Credit: 'Crédito',
  Debit: 'Débito',
  NotAvailable: 'Indisponível',
  Active: 'Ativo',
  Inactive: 'Inativo',
}
export const financeLabel = (value) => labels[value] || value || '—'
export const endpointLabel = (value) =>
  value
    ? [
        value.bankName,
        value.accountNumberMasked,
        value.contractPublicCode,
        value.contractName,
        value.walletType && financeLabel(value.walletType),
      ]
        .filter(Boolean)
        .join(' · ') || '—'
    : '—'
export const columns = (definitions) =>
  definitions.map(([name, label, field = name]) => ({ name, label, field, align: 'left' }))
