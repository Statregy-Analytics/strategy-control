import test from 'node:test'
import assert from 'node:assert/strict'
import {
  confirmedEmptyPortfolio,
  portfolioCurrencies,
  readCustomerStatement,
} from '../src/services/customerPortfolioPresentation.js'
const state = (data) => ({ data, loading: false, error: '' })
const empty = () => [state({ currencies: [] }), state({ currencies: [] }), state([])]
const wallet = { id: 'free-brl', type: 'Free', currencyIsoCode: 'BRL', balance: 0 }
const entry = (id, at = '2026-10-01T12:00:00Z') => ({
  transactionId: id,
  direction: 'Credit',
  amount: 100,
  balanceAfter: 100,
  type: 'Deposit',
  occurredAtUtc: at,
})
const page = (data, totalItems = data.length, hasNextPage = false) => ({
  success: true,
  data,
  pagination: { totalItems, hasNextPage },
})
test('new customer shows four zero metrics only after independent successful reads', () => {
  const values = empty()
  assert.equal(confirmedEmptyPortfolio(...values), true)
  assert.equal(portfolioCurrencies(...values)[0].total, 0)
  for (const index of [0, 1, 2])
    for (const change of [{ loading: true }, { error: 'Failed' }, { data: null }]) {
      const changed = structuredClone(values)
      Object.assign(changed[index], change)
      assert.equal(confirmedEmptyPortfolio(...changed), false)
    }
})
test('existing assets, money and inconsistent currency rows are preserved', () => {
  const values = empty()
  const real = {
    currencyId: 'BRL',
    currencyIsoCode: 'BRL',
    baseEquity: 850000,
    invested: 0,
    investable: 0,
    total: 850000,
  }
  values[0].data.currencies.push(real)
  assert.deepEqual(portfolioCurrencies(...values), [real])
  for (const change of [
    (v) => v[2].data.push(wallet),
    (v) => v[1].data.currencies.push({ total: 1, items: [] }),
    (v) => v[1].data.currencies.push({ total: 0, items: [{ value: 1 }] }),
    (v) => v[1].data.currencies.push({ total: null, items: [] }),
  ]) {
    const input = empty()
    change(input)
    assert.equal(confirmedEmptyPortfolio(...input), false)
  }
})
test('no wallets confirms no ledger entries without a fabricated request', async () => {
  assert.deepEqual(
    await readCustomerStatement([], () => {
      throw Error('Not called')
    }),
    [],
  )
  await assert.rejects(readCustomerStatement(null, () => {}))
})
test('zero wallet balance never substitutes for consulting its historical ledger', async () => {
  let calls = 0
  const rows = await readCustomerStatement([wallet], async () => {
    calls++
    return page([entry('deposit')])
  })
  assert.equal(calls, 1)
  assert.equal(rows.length, 1)
  assert.equal(rows[0].amount, 100)
})
test('reads every wallet and page, preserving currencies and per-wallet balance', async () => {
  const requests = []
  const rows = await readCustomerStatement(
    [wallet, { ...wallet, id: 'usd', currencyIsoCode: 'USD' }],
    async (id, params) => {
      requests.push([id, params.page])
      if (id === 'usd') return page([entry('usd', '2026-10-03T12:00:00Z')])
      return params.page === 1
        ? page([entry('old')], 2, true)
        : page([entry('new', '2026-10-02T12:00:00Z')], 2)
    },
  )
  assert.deepEqual(requests, [
    ['free-brl', 1],
    ['free-brl', 2],
    ['usd', 1],
  ])
  assert.deepEqual(
    rows.map((r) => r.currencyIsoCode),
    ['USD', 'BRL', 'BRL'],
  )
  assert.equal(rows[0].balanceAfter, 100)
})
test('failed, missing, partial and duplicated ledger reads never become an empty statement', async () => {
  for (const response of [
    {},
    page([], 1),
    page([], 1, true),
    page([entry('x'), entry('x')], 2),
    { ...page([]), success: false },
  ])
    await assert.rejects(readCustomerStatement([wallet], async () => response))
  await assert.rejects(
    readCustomerStatement([wallet], async () => {
      throw Error('403')
    }),
  )
})
test('leaving or changing customer stops remaining statement queries', async () => {
  let active = true,
    calls = 0
  await assert.rejects(
    readCustomerStatement(
      [wallet],
      async () => {
        calls++
        active = false
        return page([entry('x')], 2, true)
      },
      () => {
        if (!active) throw Error('Changed')
      },
    ),
  )
  assert.equal(calls, 1)
})
