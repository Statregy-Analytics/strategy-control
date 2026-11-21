import test from 'node:test'
import assert from 'node:assert/strict'
import { compositionPayload } from '../src/services/contractComposition.js'
test('composition permits unconfigured values and validates bounds, completeness and exact totals', () => {
  assert.equal(compositionPayload({}), null)
  assert.deepEqual(
    compositionPayload({
      intradayPercentage: '33,33',
      corePercentage: '33,33',
      tacticalPercentage: '33,34',
    }),
    { intradayPercentage: 33.33, corePercentage: 33.33, tacticalPercentage: 33.34 },
  )
  for (const value of [
    { intradayPercentage: 100 },
    { intradayPercentage: -1, corePercentage: 101, tacticalPercentage: 0 },
    { intradayPercentage: 20, corePercentage: 30, tacticalPercentage: 49 },
  ])
    assert.throws(() => compositionPayload(value), /100%/)
})
import { buildDraftPayload } from '../src/services/financeModels.js'
test('wallet draft preserves source currency and source wallet and links the originating request', () => {
  const result = buildDraftPayload(
    {
      currencyCode: 'BRL',
      clientAllocations: [
        {
          clientId: 'client',
          allocatedAmount: '1.00',
          contractRequestId: 'req',
          walletSources: [
            {
              walletId: 'wallet',
              type: 'Free',
              currencyId: 'brl',
              currencyIsoCode: 'BRL',
              amount: '1.00',
              available: '10.00',
            },
          ],
        },
      ],
    },
    null,
  )
  assert.deepEqual(result.clientAllocations[0], {
    clientId: 'client',
    allocatedAmount: 1,
    contributions: [{ wallet: 'Free', currencyId: 'brl', amount: 1 }],
    contractRequestId: 'req',
  })
  const reread = buildDraftPayload(
    {
      clientAllocations: [
        {
          clientId: 'client',
          allocatedAmount: 1,
          contributions: [{ wallet: 'Free', currencyId: 'brl', currencyIsoCode: 'BRL', amount: 1 }],
        },
      ],
    },
    null,
  )
  assert.deepEqual(
    reread.clientAllocations[0].contributions,
    result.clientAllocations[0].contributions,
  )
})
