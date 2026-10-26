import test from 'node:test'
import assert from 'node:assert/strict'
import {
  WALLET_CURRENCIES,
  walletRows,
  walletBalance,
  balanceAfter,
  compatibleBanks,
  validateWalletOperation,
  transferDeadline,
} from '../src/services/walletModel.js'

test('seven currencies retain missing values instead of fabricated zero balances', () => {
  assert.deepEqual(
    WALLET_CURRENCIES.map((item) => item.code),
    ['BRL', 'USD', 'EUR', 'CAD', 'JPY', 'CNY', 'AUD'],
  )
  assert.equal(walletRows(null, 'deposit').length, 7)
  assert.ok(walletRows(null, 'deposit').every((row) => row.balance === null))
  const model = {
    deposit: {
      currencies: [
        { currency: 'BRL', balance: 0 },
        { currency: 'USD', balance: 12 },
      ],
    },
  }
  assert.equal(walletBalance(model, 'deposit', 'BRL'), 0)
  assert.equal(walletBalance(model, 'deposit', 'USD'), 12)
  assert.equal(walletBalance(model, 'deposit', 'EUR'), null)
})

test('balance after operation never invents available funds or accepts overdrafts', () => {
  assert.equal(balanceAfter(null, 1), null)
  assert.equal(balanceAfter(10, 11), null)
  assert.equal(balanceAfter(10, -1), null)
  assert.equal(balanceAfter(10.1, 0.2), 9.9)
})

test('only active accounts in the selected confirmed currency are eligible', () => {
  const banks = [
    { id: '1', status: 'Active', currencyIsoCode: 'BRL' },
    { id: '2', status: 'Active', currencyIsoCode: 'USD' },
    { id: '3', status: 'Inactive', currencyIsoCode: 'BRL' },
    { id: '4', status: 'Active' },
  ]
  assert.deepEqual(
    compatibleBanks(banks, 'BRL').map((bank) => bank.id),
    ['1'],
  )
  assert.deepEqual(compatibleBanks(banks, 'EUR'), [])
})

test('withdrawal requires deposit balance, same-currency account and withdrawal password', () => {
  const model = {
    deposit: { currencies: [{ currency: 'BRL', balance: 100 }] },
    strategy: { currencies: [{ currency: 'BRL', balance: 1000 }] },
  }
  const form = {
    mode: 'withdrawal',
    currency: 'BRL',
    amount: 10,
    model,
    bank: { status: 'Active', currencyIsoCode: 'BRL' },
    password: 'test-only',
  }
  assert.equal(validateWalletOperation(form), '')
  assert.match(validateWalletOperation({ ...form, amount: 101 }), /saldo/)
  assert.match(validateWalletOperation({ ...form, password: '' }), /Senha de Saque/)
  assert.match(
    validateWalletOperation({ ...form, bank: { status: 'Active', currencyIsoCode: 'USD' } }),
    /mesma moeda/,
  )
})

test('transfer directions have distinct settlement rules and no password requirement', () => {
  const model = { strategy: { currencies: [{ currency: 'USD', balance: 50 }] } }
  assert.equal(transferDeadline('deposit'), 'Imediato')
  assert.equal(transferDeadline('strategy'), 'Até 30 dias corridos')
  assert.equal(
    validateWalletOperation({
      mode: 'transfer',
      from: 'strategy',
      currency: 'USD',
      amount: 10,
      model,
    }),
    '',
  )
  assert.match(
    validateWalletOperation({
      mode: 'transfer',
      from: 'deposit',
      currency: 'USD',
      amount: 10,
      model,
    }),
    /saldo disponível/,
  )
})

test('deposit respects configured currency minimum without assuming Figma example values', () => {
  const form = {
    mode: 'deposit',
    currency: 'USD',
    amount: 10,
    model: { instructions: { USD: { minimum: 20 } } },
  }
  assert.match(validateWalletOperation(form), /mínimo/)
  assert.equal(validateWalletOperation({ ...form, amount: 20 }), '')
})

test('bank picker loads all pages and drops results from a closed context', async () => {
  const { readWalletBankAccounts } = await import('../src/services/walletModel.js')
  const pages = []
  const rows = await readWalletBankAccounts(async (page) => {
    pages.push(page)
    return { data: [{ id: String(page) }], pagination: { totalPages: 3 } }
  })
  assert.deepEqual(pages, [1, 2, 3])
  assert.equal(rows.length, 3)
  let active = true
  assert.deepEqual(
    await readWalletBankAccounts(
      async () => {
        active = false
        return { data: [{ id: 'old' }] }
      },
      () => active,
    ),
    [],
  )
  await assert.rejects(
    readWalletBankAccounts(async () => ({ data: null })),
    /indisponíveis/,
  )
})

test('consolidated total includes patrimony and never sums native currency balances', async () => {
  const { consolidatedWalletTotal } = await import('../src/services/walletModel.js')
  const model = {
    principalCurrency: 'BRL',
    deposit: { total: 100 },
    strategy: { total: 200 },
    assets: { total: 300 },
  }
  assert.equal(consolidatedWalletTotal(model), 600)
  assert.equal(consolidatedWalletTotal({ ...model, assets: null }), null)
  assert.equal(
    consolidatedWalletTotal({
      deposit: {
        currencies: [
          { currency: 'BRL', balance: 100 },
          { currency: 'USD', balance: 100 },
        ],
      },
    }),
    null,
  )
  assert.equal(
    consolidatedWalletTotal({
      ...model,
      deposit: { total: 0 },
      strategy: { total: 0 },
      assets: { total: 0 },
    }),
    0,
  )
})
