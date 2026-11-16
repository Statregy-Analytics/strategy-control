import { financeGet, financeWrite } from './financeService'
import { positiveAmount } from './financeModels'

const wallet = (value) => ({ deposit: 'Free', strategy: 'Applied' })[value]
export function transactionOperationPayload(form, currencies, wallets) {
  if (!form.clientId) throw Error('Selecione o cliente de origem.')
  const currency = currencies.find((row) => (row.value || row.isoCode) === form.currency)
  if (!currency?.id) throw Error('A moeda selecionada não está disponível no catálogo.')
  const amount = positiveAmount(form.amount)
  const sourceWallet = wallet(form.from)
  if (form.kind !== 'deposit') {
    const rows = wallets.filter(
      (row) => row.type === sourceWallet && row.currencyId === currency.id,
    )
    if (
      !rows.length ||
      rows.some((row) => row.available == null || !Number.isFinite(Number(row.available)))
    )
      throw Error('Confira o saldo disponível antes de continuar.')
    if (amount > rows.reduce((sum, row) => sum + Number(row.available), 0))
      throw Error('O valor excede o saldo disponível.')
  }
  const common = {
    clientId: form.clientId,
    currencyId: currency.id,
    amount,
    observation: form.observation || null,
  }
  if (form.receiptFile)
    throw Error(
      'O tipo de comprovante bancário ainda não está disponível para upload. O arquivo foi mantido.',
    )
  if (form.kind === 'deposit') {
    if (!form.bankId) throw Error('Selecione a conta de origem.')
    return {
      path: 'deposits',
      payload: { ...common, sourceBankAccountId: form.bankId, receiptDocumentId: null },
    }
  }
  if (form.kind === 'withdrawal') {
    if (!form.bankId) throw Error('Selecione a conta de destino.')
    return { path: 'withdrawals', payload: { ...common, destinationBankAccountId: form.bankId } }
  }
  if (form.kind !== 'transfer' || !sourceWallet || !wallet(form.to))
    throw Error('Selecione as carteiras da transferência.')
  if (form.otherClient) {
    if (!form.destinationClientId || form.destinationClientId === form.clientId)
      throw Error('Selecione outro cliente de destino.')
    if (!form.password) throw Error('Confirme a senha do admin.')
    return {
      path: 'inter-customer-transfers',
      payload: {
        sourceClientId: form.clientId,
        destinationClientId: form.destinationClientId,
        currencyId: currency.id,
        sourceWallet,
        destinationWallet: wallet(form.to),
        amount,
        observation: common.observation,
        password: form.password,
      },
    }
  }
  if (sourceWallet === wallet(form.to)) throw Error('Selecione carteiras diferentes.')
  return {
    path: 'wallet-transfers',
    payload: {
      ...common,
      sourceWallet,
      destinationType: 'Wallet',
      destinationContractId: null,
    },
  }
}
export async function submitAdminTransaction(form, read = financeGet, write = financeWrite) {
  const [catalog, wallets] = await Promise.all([
    read('preferences/catalog'),
    read(`admin/customers/${form.clientId}/wallets`),
  ])
  const operation = transactionOperationPayload(
    form,
    catalog.data?.currencies || [],
    wallets.data || [],
  )
  const result = await write('post', `admin/transactions/${operation.path}`, operation.payload)
  if (!result?.id)
    throw Error('A operação não retornou um identificador. Confira o histórico antes de reenviar.')
  return result
}
