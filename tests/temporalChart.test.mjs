import test from 'node:test'
import assert from 'node:assert/strict'
import { chartGeometry } from '../src/services/temporalChartModel.js'
test('empty or invalid chart series never become example points', () => {
  assert.equal(chartGeometry([]), null)
  assert.equal(chartGeometry([{ timestamp: 'invalid', value: 100 }]), null)
  assert.equal(chartGeometry([{ timestamp: '2026-01-01', value: null }]), null)
})
test('chart sorts timestamps, spaces actual time and handles constant or negative values', () => {
  const g = chartGeometry([
    { timestamp: '2026-01-04', value: -2 },
    { timestamp: '2026-01-01', value: -2 },
    { timestamp: '2026-01-02', value: -2 },
  ])
  assert.deepEqual(
    g.points.map((p) => Math.round(p.x)),
    [60, 360, 960],
  )
  assert.ok(g.points.every((p) => Number.isFinite(p.y)))
  assert.ok(
    chartGeometry([{ timestamp: '2026-01-01', value: 0 }]).points.every((p) =>
      Number.isFinite(p.x),
    ),
  )
})
test('candles require actual OHLC and reject inconsistent high and low', () => {
  assert.equal(chartGeometry([{ timestamp: '2026-01-01', value: 100 }], 'candles'), null)
  assert.equal(
    chartGeometry(
      [{ timestamp: '2026-01-01', value: 100, open: 95, high: 90, low: 85, close: 100 }],
      'candles',
    ),
    null,
  )
  const g = chartGeometry(
    [{ timestamp: '2026-01-01', value: 100, open: 95, high: 110, low: 85, close: 100 }],
    'candles',
  )
  assert.ok(g.points[0].highY < g.points[0].closeY)
  assert.ok(g.points[0].lowY > g.points[0].openY)
})
