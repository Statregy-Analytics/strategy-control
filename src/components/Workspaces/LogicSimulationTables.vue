<template>
  <div
    class="logic-simulation-tables"
    :class="{ 'logic-simulation-tables--side': arrangement === 'side' }"
  >
    <section
      v-for="panel in panels"
      :key="panel.key"
      :class="{ 'logic-simulation-panel--simulated': panel.key === 'simulated' }"
    >
      <h3><i />{{ panel.title }}</h3>
      <div class="logic-simulation-scroll" role="region" :aria-label="panel.title" tabindex="0">
        <table :style="{ minWidth: 230 + headers(panel.data).length * 110 + 'px' }">
          <colgroup>
            <col class="logic-simulation-label" />
            <col v-for="(col, i) in headers(panel.data)" :key="i" />
          </colgroup>
          <thead>
            <tr>
              <th scope="col">Indicador</th>
              <th v-for="(col, i) in headers(panel.data)" :key="i" scope="col">{{ col }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="indicator in logicTemporalIndicators"
              :key="indicator"
              :class="{
                'logic-simulation-row--badge': badgeRow(indicator),
                'logic-simulation-row--summary': summaryRow(indicator),
              }"
            >
              <th scope="row">{{ indicator }}</th>
              <td v-for="(col, i) in headers(panel.data)" :key="i">
                <span :class="cellClass(indicator, value(panel.data, indicator, i))">{{
                  value(panel.data, indicator, i)
                }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>
<script setup>
import { computed } from 'vue'
import { logicTemporalIndicators } from 'src/services/logicPerformanceModel'
const props = defineProps({
  arrangement: { type: String, default: 'below' },
  official: { type: Object, default: () => ({}) },
  simulated: { type: Object, default: () => ({}) },
})
const panels = computed(() => [
  { key: 'official', title: 'Tabela Atual (Valores Oficiais)', data: props.official },
  { key: 'simulated', title: 'Tabela Simulada (Parâmetros em Edição)', data: props.simulated },
])
function headers(data) {
  return Array.isArray(data.columns) && data.columns.length ? data.columns : ['—']
}
function value(data, indicator, i) {
  if (!Array.isArray(data.columns) || !data.columns.length) return 'Indisponível'
  const v = data.values?.[indicator]?.[i]
  return (typeof v === 'number' && Number.isFinite(v)) || (typeof v === 'string' && v.trim())
    ? v
    : 'Indisponível'
}
function badgeRow(i) {
  return [
    'Direção Sorteada',
    'Zona de Amortecimento Usada',
    'Fechamento Soberano Aplicado',
  ].includes(i)
}
function summaryRow(i) {
  return [
    'Papéis Recalculados',
    'Valor Agregado dos Papéis',
    'Resultado Acumulado dos Papéis',
  ].includes(i)
}
function cellClass(indicator, v) {
  if (v === 'Indisponível') return ''
  if (indicator === 'Direção Sorteada' && ['Positiva', 'Negativa'].includes(v))
    return 'logic-simulation-badge ' + (v === 'Positiva' ? 'positive' : 'negative')
  if (badgeRow(indicator) && ['Sim', 'Não'].includes(v)) return 'logic-simulation-badge neutral'
  return typeof v === 'string' && /^\+/.test(v)
    ? 'positive'
    : typeof v === 'string' && /^-/.test(v)
      ? 'negative'
      : ''
}
</script>
<style scoped>
.logic-simulation-tables {
  display: grid;
  gap: 16px;
  min-width: 0;
}
.logic-simulation-tables--side {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.logic-simulation-tables > section {
  min-width: 0;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 14px;
  background: linear-gradient(175deg, rgba(0, 0, 0, 0.12), rgba(0, 0, 0, 0.04));
  box-shadow: 4px 4px 12px rgba(0, 0, 0, 0.13);
}
.logic-simulation-tables h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 16px;
  margin: 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 10px;
  font-weight: 700;
  line-height: 15px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.6);
}
.logic-simulation-tables h3 i {
  width: 6px;
  height: 6px;
  border: 1px solid rgba(75, 199, 255, 0.42);
  border-radius: 50%;
  background: rgba(75, 199, 255, 0.12);
}
.logic-simulation-scroll {
  overflow: auto;
  min-width: 0;
  margin-top: 24px;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
}
.logic-simulation-scroll:focus-visible {
  outline: 2px solid #4bc7ff;
  outline-offset: -2px;
}
.logic-simulation-tables table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  font-size: 12px;
  line-height: 16px;
  color: rgba(255, 255, 255, 0.6);
}
.logic-simulation-label {
  width: 230px;
}
.logic-simulation-tables th,
.logic-simulation-tables td {
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 7.9px 8px;
  text-align: center;
  font-weight: 500;
  min-width: 110px;
  overflow-wrap: anywhere;
}
.logic-simulation-tables th:first-child {
  width: 230px;
  text-align: left;
  text-transform: uppercase;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.05);
  white-space: nowrap;
}
.logic-simulation-tables thead th {
  height: 40px;
  font-weight: 700;
}
.logic-simulation-row--badge th,
.logic-simulation-row--badge td {
  padding-top: 6.1px;
  padding-bottom: 6.1px;
}
.logic-simulation-row--summary td {
  font-weight: 700;
}
.logic-simulation-badge {
  display: inline-block;
  padding: 3.8px 8.8px;
  border: 0.8px solid;
  border-radius: 8px;
  font-size: 10px;
  line-height: 16px;
  letter-spacing: 0.25px;
  text-transform: uppercase;
}
.positive {
  color: #74ffa0;
}
.negative {
  color: #ff6467;
}
.logic-simulation-badge.positive {
  background: rgba(0, 122, 85, 0.2);
  border-color: #74ffa0;
}
.logic-simulation-badge.negative {
  background: rgba(193, 0, 7, 0.2);
  border-color: #ffc9c9;
  color: #ffc9c9;
}
.logic-simulation-badge.neutral {
  background: rgba(0, 0, 0, 0.2);
  border-color: white;
  color: white;
  font-size: 12px;
  letter-spacing: 0;
  text-transform: none;
}
.logic-simulation-tables .logic-simulation-panel--simulated {
  border-color: #fee685;
}
.logic-simulation-panel--simulated h3 {
  background: rgba(187, 77, 0, 0.2);
  border-color: #fee685;
  color: #fee685;
}
.logic-simulation-panel--simulated h3 i {
  background: rgba(255, 107, 122, 0.12);
  border-color: rgba(255, 107, 122, 0.42);
}
.logic-simulation-panel--simulated th,
.logic-simulation-panel--simulated td {
  border-color: #fee685;
}
@media (max-width: 650px) {
  .logic-simulation-tables--side {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
