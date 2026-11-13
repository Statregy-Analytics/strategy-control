export function chartGeometry(points, mode = 'line') {
  const data = points
    .flatMap((p) => {
      const timestamp = typeof p.timestamp === 'number' ? p.timestamp : Date.parse(p.timestamp)
      const value = p.value
      if (!Number.isFinite(timestamp) || typeof value !== 'number' || !Number.isFinite(value))
        return []
      if (
        mode === 'candles' &&
        !['open', 'high', 'low', 'close'].every(
          (k) => typeof p[k] === 'number' && Number.isFinite(p[k]),
        )
      )
        return []
      if (
        mode === 'candles' &&
        (p.low > Math.min(p.open, p.close) || p.high < Math.max(p.open, p.close) || p.low > p.high)
      )
        return []
      return [{ ...p, timestamp, value }]
    })
    .sort((a, b) => a.timestamp - b.timestamp)
  if (!data.length) return null
  const values = data.flatMap((p) => (mode === 'candles' ? [p.low, p.high] : [p.value]))
  const min = Math.min(...values),
    max = Math.max(...values),
    padding = (max - min) * 0.08 || Math.max(Math.abs(max) * 0.05, 1)
  const lower = min - padding,
    upper = max + padding
  const begin = data[0].timestamp,
    end = data.at(-1).timestamp
  const x = (time) => (begin === end ? 520 : 60 + ((time - begin) / (end - begin)) * 900)
  const y = (value) => 280 - ((value - lower) / (upper - lower)) * 250
  return {
    points: data.map((p) => ({
      ...p,
      x: x(p.timestamp),
      y: y(p.value),
      ...(mode === 'candles'
        ? { openY: y(p.open), closeY: y(p.close), highY: y(p.high), lowY: y(p.low) }
        : {}),
    })),
    ticks: Array.from({ length: 5 }, (_, i) => ({
      value: lower + ((upper - lower) * i) / 4,
      y: y(lower + ((upper - lower) * i) / 4),
    })),
    candleWidth: Math.max(2, Math.min(14, 600 / data.length)),
  }
}
