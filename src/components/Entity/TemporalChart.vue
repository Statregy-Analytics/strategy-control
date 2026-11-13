<template>
  <div v-if="!geometry" class="temporal-chart-empty" role="status">{{ emptyText }}</div>
  <figure v-else class="temporal-chart">
    <svg viewBox="0 0 1000 330" role="img" :aria-label="label">
      <g v-for="tick in geometry.ticks" :key="tick.y" class="temporal-chart-grid">
        <line x1="60" x2="960" :y1="tick.y" :y2="tick.y" />
        <text x="52" :y="tick.y + 3" text-anchor="end">{{ valueLabel(tick.value) }}</text>
      </g>
      <polygon
        v-if="mode === 'area'"
        :points="`${geometry.points[0].x},280 ${geometry.points.map((p) => `${p.x},${p.y}`).join(' ')} ${geometry.points.at(-1).x},280`"
        fill="rgba(79,70,255,.12)"
      />
      <polyline
        v-if="mode !== 'candles'"
        :points="geometry.points.map((p) => `${p.x},${p.y}`).join(' ')"
        fill="none"
        class="temporal-chart-line"
      />
      <g
        v-for="(p, index) in geometry.points"
        :key="p.timestamp + '-' + index"
        :class="p.close >= p.open ? 'temporal-chart-up' : 'temporal-chart-down'"
      >
        <template v-if="mode === 'candles'">
          <line :x1="p.x" :x2="p.x" :y1="p.highY" :y2="p.lowY" />
          <rect
            :x="p.x - geometry.candleWidth / 2"
            :y="Math.min(p.openY, p.closeY)"
            :width="geometry.candleWidth"
            :height="Math.max(1, Math.abs(p.closeY - p.openY))"
          >
            <title>{{ dateLabel(p.timestamp) }} — {{ valueLabel(p.value) }}</title>
          </rect>
        </template>
        <circle
          v-else
          :cx="p.x"
          :cy="p.y"
          r="4"
          class="temporal-chart-point"
          tabindex="0"
          :aria-label="dateLabel(p.timestamp) + ' — ' + valueLabel(p.value)"
        >
          <title>{{ dateLabel(p.timestamp) }} — {{ valueLabel(p.value) }}</title>
        </circle>
        <text
          v-if="
            index === 0 ||
            index === geometry.points.length - 1 ||
            index % Math.max(1, Math.ceil(geometry.points.length / 8)) === 0
          "
          :x="p.x"
          y="310"
          text-anchor="middle"
          class="temporal-chart-date"
        >
          {{ dateLabel(p.timestamp) }}
        </text>
      </g>
    </svg>
  </figure>
</template>
<script setup>
import { computed } from 'vue'
import { chartGeometry } from 'src/services/temporalChartModel'
const props = defineProps({
  points: { type: Array, default: () => [] },
  mode: { type: String, default: 'line' },
  currency: { type: String, default: null },
  label: { type: String, default: 'Evolução histórica' },
  emptyText: { type: String, default: 'Performance histórica indisponível.' },
})
const geometry = computed(() => chartGeometry(props.points, props.mode))
const dateLabel = (timestamp) =>
  new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' }).format(
    timestamp,
  )
const valueLabel = (value) =>
  new Intl.NumberFormat('pt-BR', {
    ...(props.currency ? { style: 'currency', currency: props.currency } : {}),
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(value)
</script>
<style scoped>
.temporal-chart {
  margin: 0;
  width: 100%;
  color: var(--sa-muted, rgba(255, 255, 255, 0.65));
}
.temporal-chart svg {
  display: block;
  width: 100%;
  height: auto;
  min-height: 220px;
}
.temporal-chart-grid line {
  stroke: rgba(255, 255, 255, 0.12);
  stroke-dasharray: 3 3;
}
.temporal-chart-grid text,
.temporal-chart-date {
  fill: currentColor;
  font-size: 10px;
}
.temporal-chart-line {
  stroke: #4f46ff;
  stroke-width: 1.5;
}
.temporal-chart-point {
  fill: transparent;
  stroke: transparent;
}
.temporal-chart-point:hover,
.temporal-chart-point:focus {
  fill: #4f46ff;
  stroke: white;
  outline: none;
}
.temporal-chart-up {
  fill: #4dd495;
  stroke: #4dd495;
}
.temporal-chart-down {
  fill: #ff747c;
  stroke: #ff747c;
}
.temporal-chart-date {
  stroke: none;
}
.temporal-chart-empty {
  min-height: 300px;
  display: grid;
  place-items: center;
  color: var(--sa-muted, rgba(255, 255, 255, 0.72));
}
</style>
