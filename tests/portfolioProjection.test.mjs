import test from 'node:test'
import assert from 'node:assert/strict'
import {
  projectPortfolio,
  projectClientWallets,
  walletDisplayAmounts,
} from '../src/services/portfolioProjection.js'
import { walletCompositionRows, walletIsEmpty, walletBalance } from '../src/services/walletModel.js'
const currency = (code = 'BRL') => ({
  currencyIsoCode: code,
  baseEquity: 300,
  invested: 200,
  total: 999999,
  baseEquityBreakdown: { assetCount: 2, grossDeclaredValue: 400, financedBalance: 100 },
  wallets: [
    {
      id: 'free-' + code,
      type: 'Free',
      currencyIsoCode: code,
      balance: 100,
      reserved: 20,
      available: 80,
    },
    {
      id: 'applied-' + code,
      type: 'Applied',
      currencyIsoCode: code,
      balance: 50,
      reserved: 10,
      available: 40,
    },
  ],
})
test('portfolio separates Free, invested and Applied; includes assets once without trusting ambiguous legacy total', () => {
  const model = projectPortfolio({ currencies: [currency()] })
  assert.equal(model.deposit.total, 100)
  assert.equal(model.strategy.total, 250)
  assert.equal(model.assets.total, 300)
  assert.equal(model.total.total, 650)
  assert.equal(walletBalance(model, 'deposit', 'BRL'), 80)
  assert.equal(walletBalance(model, 'strategy', 'BRL'), 40)
  const rows = walletCompositionRows(model)
  assert.deepEqual(
    rows.map((r) => r.value),
    [80, 20, 200, 50, 300],
  )
  assert.equal(rows.find((r) => r.key.endsWith('idle')).situation, 'Parado')
})
test('multiple currencies remain separate with no invented FX totals', () => {
  const model = projectPortfolio({ currencies: [currency(), currency('USD')] })
  assert.equal(model.principalCurrency, null)
  assert.equal(model.total.total, null)
  assert.deepEqual(
    walletDisplayAmounts(model, 'total').map((r) => [r.currency, r.balance]),
    [
      ['BRL', 650],
      ['USD', 650],
    ],
  )
  assert.equal(
    walletCompositionRows(model).filter((r) => r.wallet.startsWith('Patrimônio')).length,
    2,
  )
})
test('confirmed empty portfolio shows zero but errors and missing fields never become zero', () => {
  assert.equal(projectPortfolio(null), null)
  assert.equal(projectPortfolio({}), null)
  const empty = projectPortfolio({ currencies: [] })
  assert.equal(walletIsEmpty(empty), true)
  assert.equal(empty.total.total, 0)
  assert.deepEqual(walletCompositionRows(empty), [])
  const row = currency()
  row.invested = null
  const incomplete = projectPortfolio({ currencies: [row] })
  assert.equal(incomplete.total.total, null)
  assert.equal(walletIsEmpty(incomplete), false)
  row.wallets = undefined
  assert.equal(projectPortfolio({ currencies: [row] }), null)
})
test('mismatched currency and duplicate currency blocks are rejected', () => {
  const row = currency()
  row.wallets[0].currencyIsoCode = 'USD'
  assert.equal(projectPortfolio({ currencies: [row] }), null)
  assert.equal(projectPortfolio({ currencies: [currency(), currency()] }), null)
})
test('client exposes available Free and Applied independently of home and never invents assets', () => {
  const wallets = currency().wallets
  const partial = projectClientWallets(null, wallets)
  assert.equal(partial.deposit.total, 100)
  assert.equal(partial.strategy.total, null)
  assert.equal(partial.assets.total, null)
  assert.equal(partial.total.total, null)
  const home = {
    access: { financialStatus: 'Available' },
    summaries: [{ currencyIsoCode: 'BRL', contractedCapital: { status: 'Available', value: 200 } }],
  }
  const model = projectClientWallets(home, wallets)
  assert.equal(model.strategy.total, 250)
  assert.equal(model.total.total, null)
  assert.equal(projectClientWallets(home, null).deposit.total, null)
  home.access.financialStatus = 'Blocked'
  assert.equal(projectClientWallets(home, wallets).strategy.total, null)
})
