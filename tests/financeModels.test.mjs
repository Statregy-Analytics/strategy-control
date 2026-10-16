import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { buildDraftPayload, buildTransactionPayload, buildContractTerm } from '../src/services/financeModels.js'
const schemas = JSON.parse(
  readFileSync(new URL('../docs/Api/milestone-3-swagger.json', import.meta.url)),
).components.schemas
const form = {
  clientId: '11111111-1111-4111-8111-111111111111',
  currencyId: '22222222-2222-4222-8222-222222222222',
  bankId: '33333333-3333-4333-8333-333333333333',
  contractId: '44444444-4444-4444-8444-444444444444',
  amount: '150.25',
  observation: '  teste  ',
}
function matchesRequest(payload, schemaName) {
  const schema = schemas[schemaName]
  for (const required of schema.required)
    assert.ok(Object.hasOwn(payload, required), `${schemaName}.${required} ausente`)
  for (const key of Object.keys(payload))
    assert.ok(Object.hasOwn(schema.properties, key), `${schemaName}.${key} não permitido`)
}
test('alternar depósito para saque não transporta a conta de origem nem comprovante', () => {
  const deposit = buildTransactionPayload('deposits', form),
    withdrawal = buildTransactionPayload('withdrawals', form)
  matchesRequest(deposit, 'CreateDepositRequest')
  matchesRequest(withdrawal, 'CreateWithdrawalRequest')
  assert.equal(deposit.sourceBankAccountId, form.bankId)
  assert.equal(withdrawal.destinationBankAccountId, form.bankId)
  assert.equal(withdrawal.sourceBankAccountId, undefined)
  assert.equal(withdrawal.receiptDocumentId, undefined)
  assert.equal(withdrawal.amount, 150.25)
})
test('operação de contrato não envia moeda ou dados bancários do formulário anterior', () => {
  const payload = buildTransactionPayload('contract-operations', form)
  matchesRequest(payload, 'CreateContractOperationRequest')
  assert.equal(payload.currencyId, undefined)
  assert.equal(payload.bankId, undefined)
})
test('nenhum valor inválido gera uma solicitação financeira', () => {
  for (const amount of [null, undefined, '', 0, -1, 'abc', Infinity, NaN])
    assert.throws(() => buildTransactionPayload('deposits', { ...form, amount }))
  for (const missing of ['clientId', 'currencyId', 'bankId'])
    assert.throws(() => buildTransactionPayload('withdrawals', { ...form, [missing]: null }))
})
test('transferência sem fluxo integrado na interface é bloqueada antes da escrita', () =>
  assert.throws(
    () => buildTransactionPayload('wallet-transfers', form),
    /ainda não estão disponíveis/,
  ))
test('rascunho incompleto mantém campos nulos exigidos pelo contrato HTTP', () => {
  const payload = buildDraftPayload({ clientAllocations: [] }, null)
  matchesRequest(payload, 'SaveContractDraftRequest')
  assert.equal(payload.initialContractualCapital, null)
  assert.equal(payload.term, null)
})

test('prazo respeita unidades e limites confirmados pelo backend', () => {
  for (const [unit, max] of [['Day', 36500], ['Month', 1200], ['Year', 100]]) {
    assert.deepEqual(buildContractTerm({ value: max, unit }), { value: max, unit })
    for (const value of [null, '', 0, -1, 1.5, max + 1, Infinity])
      assert.throws(() => buildContractTerm({ value, unit }))
  }
  assert.throws(() => buildContractTerm({ value: 12, unit: 'Months' }))
  assert.throws(() => buildContractTerm({ value: 12, unit: null }))
  assert.equal(buildContractTerm(null), null)
})
test('participantes duplicados ou vazios não sobrescrevem alocações', () => {
  assert.throws(
    () =>
      buildDraftPayload(
        { clientAllocations: [{ clientId: form.clientId }, { clientId: form.clientId }] },
        null,
      ),
    /duas vezes/,
  )
  assert.throws(
    () => buildDraftPayload({ clientAllocations: [{ clientId: null }] }, null),
    /Selecione/,
  )
})

import { createIdempotentWriter } from '../src/services/financeIdempotency.js'
import { useFinanceResource } from '../src/composables/useFinanceResource.js'
test('retry após perda de resposta usa a mesma chave; nova ação usa outra', async () => {
  const keys = []
  let count = 0
  let fail = true
  const write = createIdempotentWriter(
    async (method, path, payload, key) => {
      keys.push(key)
      if (fail) throw new Error('timeout')
      return { id: 'ok' }
    },
    () => `key-${++count}`,
  )
  await assert.rejects(write('post', 'transactions', { amount: 100 }))
  fail = false
  await write('post', 'transactions', { amount: 100 })
  await write('post', 'transactions', { amount: 100 })
  assert.deepEqual(keys, ['key-1', 'key-1', 'key-2'])
})
test('trocar cliente durante uma consulta não mostra o saldo anterior', async () => {
  const resource = useFinanceResource()
  let resolveOld
  const old = resource.load(
    () =>
      new Promise((resolve) => {
        resolveOld = resolve
      }),
  )
  await resource.load(async () => ({ balance: 25000 }))
  resolveOld({ balance: 50000 })
  await old
  assert.equal(resource.state.data.balance, 25000)
})
test('fechar um detalhe invalida a resposta pendente e preserva outros blocos', async () => {
  const detail = useFinanceResource(),
    wallets = useFinanceResource()
  let finish
  const pending = detail.load(
    () =>
      new Promise((resolve) => {
        finish = resolve
      }),
  )
  await wallets.load(async () => [{ available: 50000 }])
  detail.reset()
  finish({ name: 'antigo' })
  await pending
  assert.equal(detail.state.data, null)
  assert.equal(wallets.state.data[0].available, 50000)
})
