import test from 'node:test'
import assert from 'node:assert/strict'
import {
  walletClientRow,
  readWalletClients,
  walletTotalsModel,
} from '../src/services/walletDirectoryApi.js'
import { walletCardConsolidated } from '../src/services/walletCardModel.js'
import { globalWalletConverted } from '../src/services/globalWalletFx.js'
import {
  transactionEndpointParts,
  transactionActor,
  filterTransactionRows,
  transactionTypeDetail,
} from '../src/services/transactionDirectoryModel.js'
const item = {
  client: { id: 'qa', name: 'Pessoa QA' },
  set: 'Applied',
  primaryCurrencyIsoCode: 'USD',
  currencies: [
    { currencyIsoCode: 'BRL', balance: 100, inContracts: 90, idle: 10 },
    { currencyIsoCode: 'USD', balance: 0, inContracts: 0, idle: 0 },
  ],
  consolidated: { currencyIsoCode: 'USD', amount: 20, converted: true },
  contracts: [{ contractId: 'contract-qa' }],
  yield: null,
}
test('wallet projection preserves zero, unavailable yield, split, contract identity and principal-currency conversion', () => {
  const row = walletClientRow(item, 'strategy')
  assert.equal(row.currencies.length, 2)
  assert.equal(row.currencies[0].contracted, 90)
  assert.equal(row.currencies[1].balance, 0)
  assert.equal(row.yieldPercentage, null)
  assert.equal(row.contracts[0].id, 'contract-qa')
  assert.deepEqual(walletCardConsolidated(row), { value: 20, currency: 'USD', approximate: true })
  assert.equal(
    walletCardConsolidated(walletClientRow({ ...item, consolidated: null }, 'strategy')).value,
    null,
  )
})
test('wallet directory reads all server pages for the selected set and rejects partial failures', async () => {
  const calls = []
  const rows = await readWalletClients(
    async (path, params) => {
      calls.push([path, params])
      return {
        data: [{ ...item, client: { id: String(params.page) } }],
        pagination: { totalPages: 2 },
      }
    },
    () => true,
    'strategy',
  )
  assert.equal(rows.length, 2)
  assert.equal(calls[0][0], 'admin/wallets/clients')
  assert.equal(calls[1][1].set, 'Applied')
  await assert.rejects(
    readWalletClients(
      async (_, { page }) => {
        if (page === 2) throw Error('offline')
        return { data: [item], pagination: { totalPages: 2 } }
      },
      () => true,
      'strategy',
    ),
  )
})
test('top cards use server totals without conversion or fabricated capital percentage; missing rate fails', () => {
  const data = {
    usdToBrl: { rate: 5.23 },
    deposit: { usd: 80, brl: 400 },
    strategy: { usd: 20120, brl: 100600 },
    patrimony: { usd: 17000, brl: 85000 },
    total: { usd: 37200, brl: 186000 },
    capitalBase: { usd: 20200, percentageOfTotal: null },
  }
  const model = walletTotalsModel(data)
  assert.deepEqual(globalWalletConverted(model, 'deposit'), data.deposit)
  assert.equal(model.baseCapitalPercentage, null)
  assert.throws(() => walletTotalsModel({ ...data, usdToBrl: null }))
  assert.throws(() => walletTotalsModel({ ...data, total: { usd: null, brl: 0 } }))
})
test('transaction endpoint details use endpoint currency, masked account, other recipient and asset name', () => {
  const row = {
    currencyIsoCode: 'USD',
    source: {
      kind: 'BankAccount',
      bankName: 'Banco QA',
      branch: '0001',
      accountNumberMasked: '12345678',
      currencyIsoCode: 'BRL',
    },
    destination: {
      kind: 'Wallet',
      walletType: 'Applied',
      customerName: 'Pessoa QA',
      currencyIsoCode: 'USD',
    },
  }
  assert.match(transactionEndpointParts(row, 'source').detail, /Ag. 0001.*\*\*\*\*5678.*BRL/)
  assert.doesNotMatch(transactionEndpointParts(row, 'source').detail, /12345678/)
  assert.equal(transactionEndpointParts(row, 'destination').detail, 'Pessoa QA')
  assert.equal(
    transactionEndpointParts(
      { destination: { kind: 'Asset', assetName: 'Veículo QA' } },
      'destination',
    ).title,
    'Veículo QA',
  )
  assert.equal(transactionActor({ userId: null, displayName: null }), 'Sistema Automático')
})
test('transfer subtype filter and asset log use exactly the supplied transaction classifications', () => {
  const rows = [
    { type: 'WalletTransfer', transferKind: 'WalletUpTo30Days' },
    { type: 'WalletTransfer', transferKind: 'WalletImmediate' },
    { type: 'AssetIncluded' },
  ]
  assert.deepEqual(filterTransactionRows(rows, { type: 'WalletUpTo30Days' }), [rows[0]])
  assert.deepEqual(filterTransactionRows(rows, { type: 'AssetIncluded' }), [rows[2]])
  assert.equal(transactionTypeDetail(rows[0]), 'entre carteiras · até 30 dias')
})

test('total directory keeps Figma wallet cards separate, using the new set queries', async () => {
  const sets = []
  const rows = await readWalletClients(
    async (_, params) => {
      sets.push(params.set)
      return { data: [{ ...item, set: params.set }] }
    },
    () => true,
  )
  assert.deepEqual(sets.sort(), ['Applied', 'Free', 'Patrimony'])
  assert.deepEqual(
    rows.map((row) => row.type),
    ['deposit', 'strategy', 'assets'],
  )
})
