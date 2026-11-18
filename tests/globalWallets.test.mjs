import test from 'node:test'
import assert from 'node:assert/strict'
import {
  readGlobalPortfolios,
  globalWalletRows,
  globalWalletSummary,
} from '../src/services/globalWallets.js'
import { filterWorkspace } from '../src/services/adminWorkspaceModel.js'
const portfolio = (id, currencies) => ({ customerId: id, currencies, lastUpdatedAtUtc: null })
const currency = (code, balance, invested = 0, equity = 0) => ({
  currencyId: code,
  currencyIsoCode: code,
  invested,
  baseEquity: equity,
  baseEquityBreakdown: {
    grossDeclaredValue: equity,
    financedBalance: 0,
    assetCount: equity ? 1 : 0,
  },
  investedBreakdown: { contractCount: invested ? 1 : 0 },
  wallets: [
    {
      id: 'wallet-' + code,
      type: 'Free',
      currencyId: code,
      currencyIsoCode: code,
      balance,
      reserved: 0,
      available: balance,
    },
  ],
})
test('global query reads all customer/wallet pages and includes customers with assets but no ledger wallet', async () => {
  const paths = []
  const data = await readGlobalPortfolios(async (path, params) => {
    paths.push([path, params])
    if (path === 'admin/customers/cards')
      return {
        data: [{ customerId: params.page === 1 ? 'one' : 'two', displayName: 'QA' }],
        pagination: { totalPages: 2 },
      }
    if (path === 'admin/wallets')
      return {
        data:
          params.page === 1
            ? [
                {
                  id: 'wallet',
                  type: 'Free',
                  client: { id: 'one' },
                  currencyIsoCode: 'BRL',
                  status: 'Active',
                },
              ]
            : [],
        pagination: { totalPages: 2 },
      }
    return {
      data: portfolio(path.split('/')[2], [
        currency('BRL', path.includes('/one/') ? 50 : 0, 10, path.includes('/two/') ? 200 : 0),
      ]),
    }
  })
  assert.equal(paths.filter(([p]) => p === 'admin/customers/cards').length, 2)
  assert.equal(paths.filter(([p]) => p === 'admin/wallets').length, 2)
  const rows = globalWalletRows(data)
  assert.equal(rows.find((r) => r.customerId === 'two' && r.type === 'assets').total, 200)
  assert.equal(rows.find((r) => r.customerId === 'one' && r.type === 'strategy').total, 10)
  assert.equal(rows.find((r) => r.customerId === 'one' && r.type === 'deposit').total, 50)
  assert.equal(globalWalletSummary(data).total.currencies[0].balance, 270)
})
test('native currencies stay separate; contract capital is included without invented return or FX', async () => {
  const data = await readGlobalPortfolios(async (path) => ({
    data:
      path === 'admin/customers/cards'
        ? [{ customerId: 'one', displayName: 'QA', strategyId: 'SA-QA' }]
        : path === 'admin/wallets'
          ? []
          : portfolio('one', [currency('BRL', 50, 10, 100), currency('USD', 20, 30, 0)]),
  }))
  const row = globalWalletRows(data).find((r) => r.type === 'strategy')
  assert.equal(row.total, null)
  assert.equal(row.principalCurrency, null)
  assert.equal(row.base, null)
  assert.equal(row.yieldPercentage, null)
  assert.equal(row.code, null)
  assert.deepEqual(row.ledgerWalletIds, [])
  assert.equal(row.clientCode, 'SA-QA')
  assert.deepEqual(
    globalWalletSummary(data).total.currencies.map((c) => [c.currency, c.balance]),
    [
      ['BRL', 160],
      ['USD', 50],
    ],
  )
})
test('a failed client does not hide successful rows or produce a partial global total', async () => {
  const data = await readGlobalPortfolios(async (path) => {
    if (path === 'admin/customers/cards')
      return { data: [{ customerId: 'good' }, { customerId: 'bad' }] }
    if (path === 'admin/wallets') return { data: [] }
    if (path.includes('/bad/')) throw Error('offline')
    return { data: portfolio('good', [currency('BRL', 50)]) }
  })
  assert.equal(data.records.filter((r) => r.error).length, 1)
  assert.equal(globalWalletRows(data).length, 1)
  assert.equal(globalWalletSummary(data).total.currencies[0].balance, null)
  await assert.rejects(() =>
    readGlobalPortfolios(async (path) => {
      if (path === 'admin/customers/cards') return { data: [{ customerId: 'bad' }] }
      if (path === 'admin/wallets') return { data: [] }
      throw Error('offline')
    }),
  )
})
test('wrong customer identity is rejected rather than displaying another portfolio', async () => {
  const data = await readGlobalPortfolios(async (path) => {
    if (path === 'admin/customers/cards')
      return { data: [{ customerId: 'one' }, { customerId: 'two' }] }
    if (path === 'admin/wallets') return { data: [] }
    return { data: portfolio('one', [currency('BRL', 20)]) }
  })
  assert.equal(data.records.find((r) => r.client.customerId === 'two').error, true)
  assert.equal(
    globalWalletRows(data).some((r) => r.customerId === 'two'),
    false,
  )
})
test('stale results are discarded and portfolio requests are bounded to four concurrent reads', async () => {
  let running = 0,
    max = 0,
    current = true
  const result = await readGlobalPortfolios(
    async (path) => {
      if (path === 'admin/customers/cards')
        return { data: Array.from({ length: 9 }, (_, i) => ({ customerId: String(i) })) }
      if (path === 'admin/wallets') return { data: [] }
      running++
      max = Math.max(max, running)
      await new Promise((r) => setTimeout(r, 2))
      running--
      if (path.includes('/0/')) current = false
      return { data: portfolio(path.split('/')[2], []) }
    },
    () => current,
  )
  assert.equal(result, null)
  assert.ok(max <= 4)
})
test('unknown monetary fields are retained as unknown, not converted into zero', async () => {
  const c = currency('BRL', null, null, 0)
  const data = await readGlobalPortfolios(async (path) => ({
    data:
      path === 'admin/customers/cards'
        ? [{ customerId: 'one' }]
        : path === 'admin/wallets'
          ? []
          : portfolio('one', [c]),
  }))
  assert.equal(globalWalletRows(data).find((r) => r.type === 'deposit').total, null)
  assert.equal(globalWalletSummary(data).total.currencies[0].balance, null)
})
test('credit search accepts API client name and the visible Portuguese type without guessing CRM taxonomy', () => {
  const rows = [{ id: 'one', client: { name: 'Cláudio' }, kind: 'Loan', publicCode: 'QA-ONE' }]
  assert.equal(filterWorkspace(rows, { search: 'claudio' }).length, 1)
  assert.equal(filterWorkspace(rows, { search: 'emprestimo' }).length, 1)
  assert.equal(filterWorkspace(rows, { search: 'Crédito imobiliário' }).length, 0)
})

test('wallet amounts retain the Portuguese separators used by the approved design for every currency', async () => {
  const { walletMoney } = await import('../src/services/walletModel.js')
  assert.equal(walletMoney(1234.56, 'USD'), 'US$ 1.234,56')
  assert.equal(walletMoney(1234.56, 'EUR'), '€ 1.234,56')
  assert.equal(walletMoney(null, 'USD'), '—')
})

test('last movement type is taken only from evidence matching its timestamp, not an older recent item', async () => {
  const p = portfolio('a', [currency('BRL', 10)])
  const data = await readGlobalPortfolios(async (path) =>
    path === 'admin/customers/cards'
      ? { data: [{ customerId: 'a', displayName: 'QA' }] }
      : path === 'admin/wallets'
        ? {
            data: [
              {
                id: 'w',
                client: { id: 'a' },
                type: 'Free',
                status: 'Active',
                lastMovementAtUtc: '2026-11-17T12:00:00Z',
                recentMovements: [
                  { type: 'Withdrawal', occurredAtUtc: '2026-11-16T12:00:00Z' },
                  { type: 'Deposit', occurredAtUtc: '2026-11-17T09:00:00-03:00' },
                ],
              },
            ],
          }
        : { data: p },
  )
  assert.equal(globalWalletRows(data).find((r) => r.type === 'deposit').lastMovementType, 'Deposit')
  data.wallets[0].recentMovements.pop()
  assert.equal(globalWalletRows(data).find((r) => r.type === 'deposit').lastMovementType, null)
})
