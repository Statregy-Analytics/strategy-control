<template>
  <contract-panel title="Performance Histórica" icon="performance" class="contract-performance">
    <template #actions>
      <q-btn-toggle v-model="view" no-caps :options="viewOptions" />
      <q-btn outline no-caps label="Ver Histórico Completo" @click="fullOpen = true"
        ><img src="/icons/contracts/ct21-maximize2.svg" alt=""
      /></q-btn>
    </template>
    <performance-table v-if="view === 'table'" />
    <div v-else class="performance-chart">
      <div class="performance-metrics">
        <div v-for="label in metricLabels" :key="label">
          <small>{{ label }}</small
          ><strong>Indisponível</strong>
        </div>
      </div>
      <div class="performance-toolbar">
        <div class="performance-actions">
          <span>Tipo de Visualização</span
          ><q-btn-toggle v-model="chartType" no-caps :options="chartOptions" />
        </div>
        <q-btn-toggle v-model="chartPeriod" no-caps :options="chartPeriods" />
      </div>
      <temporal-chart :points="[]" :mode="chartType" label="Performance histórica do contrato" />
      <div class="performance-legend">
        <span v-for="event in events" :key="event.label"
          ><i :style="{ background: event.color }" />{{ event.label }}</span
        >
      </div>
    </div>
  </contract-panel>
  <q-dialog v-model="fullOpen" maximized>
    <q-card class="performance-full">
      <header>
        <div class="performance-full__title">
          <img src="/icons/contracts/ct23-history.svg" alt="" />
          <div>
            <h2>Performance Histórica Completa do Contrato</h2>
            <p>Visualização expandida e detalhada de todos os registros temporais</p>
          </div>
        </div>
        <div class="performance-actions">
          <date-range-picker
            v-model="period"
            label="Filtrar por Datas"
            @update:model-value="fullPeriod = null"
          /><q-btn-toggle
            v-model="fullPeriod"
            no-caps
            :options="contractPerformancePeriods"
            @update:model-value="period = null"
          /><q-btn outline no-caps label="Exportar CSV" disable
            ><img src="/icons/contracts/ct23-download.svg" alt="" /></q-btn
          ><q-btn outline no-caps label="Fechar" @click="fullOpen = false" />
        </div>
        <q-btn
          flat
          round
          dense
          icon="close"
          aria-label="Fechar histórico completo"
          @click="fullOpen = false"
        />
      </header>
      <performance-table full />
    </q-card>
  </q-dialog>
</template>
<script setup>
import { defineComponent, h, ref } from 'vue'
import ContractPanel from './ContractPanel.vue'
import TemporalChart from 'src/components/Entity/TemporalChart.vue'
import DateRangePicker from 'src/components/Form/DateRangePicker.vue'
import {
  contractPerformanceIndicators,
  contractPerformancePeriods,
} from 'src/services/contractPerformanceModel'
const view = ref('table'),
  chartType = ref('line'),
  chartPeriod = ref('all'),
  fullPeriod = ref('all'),
  period = ref(null),
  fullOpen = ref(false)
const viewOptions = [
  { label: 'Tabela', value: 'table', icon: 'img:/icons/contracts/ct21-chart-column.svg' },
  { label: 'Gráfico', value: 'chart', icon: 'img:/icons/contracts/ct21-trending-up.svg' },
]
const chartOptions = [
  { label: 'Linha', value: 'line', icon: 'img:/icons/contracts/ct21-trending-up.svg' },
  { label: 'Candles', value: 'candles', icon: 'img:/icons/contracts/ct21-chart-column.svg' },
]
const chartPeriods = [
  { label: 'Hoje', value: 'today' },
  { label: '7 dias', value: '7' },
  { label: '30 dias', value: '30' },
  { label: 'Ciclo', value: 'cycle' },
  { label: 'Tudo', value: 'all' },
]
const metricLabels = [
  'Última 1h',
  'Últimas 24h',
  'Últimos 30 Dias',
  'Últimos 90 Dias',
  'Último 1 Ano',
  'YTD',
  'Desde o Início',
]
const events = [
  { label: 'Entrada de participante', color: '#00bc7d' },
  { label: 'Aporte', color: '#2b7fff' },
  { label: 'Retirada', color: '#fb2c36' },
  { label: 'Fechamento de ciclo', color: 'rgba(187,77,0,0.2)' },
  { label: 'Mudança de motor', color: '#ad46ff' },
  { label: 'Alteração de participação', color: '#f6339a' },
]
const PerformanceTable = defineComponent({
  props: { full: Boolean },
  setup(props) {
    return () =>
      h('div', { class: 'performance-table-container' }, [
        h('table', { class: 'performance-table' }, [
          h('thead', [
            h('tr', [
              h('th', { scope: 'col' }, 'Indicador / Data'),
              h('th', { scope: 'col' }, '—'),
            ]),
          ]),
          h(
            'tbody',
            contractPerformanceIndicators
              .filter(
                ([key]) =>
                  !props.full ||
                  !['dividendEngine', 'paidDividends', 'paidDividendPercentage'].includes(key),
              )
              .map(([key, label]) =>
                h('tr', { key }, [h('th', { scope: 'row' }, label), h('td', 'Indisponível')]),
              ),
          ),
        ]),
        h(
          'p',
          { class: 'performance-note' },
          'Nota técnica: a composição exibida representa os clientes e percentuais vigentes no momento da atualização.',
        ),
      ])
  },
})
</script>
<style scoped>
.contract-performance :deep(.profile-section__body) {
  padding: 16px 0 24px;
}
.contract-performance :deep(.q-btn-toggle),
.performance-full :deep(.q-btn-toggle) {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  box-shadow: none;
}
.contract-performance :deep(.q-btn),
.performance-full :deep(.q-btn) {
  font-size: 12px;
  min-height: 30px;
  text-transform: none;
  color: inherit;
}
.contract-performance :deep(.q-btn-toggle .bg-primary),
.performance-full :deep(.q-btn-toggle .bg-primary) {
  background: rgba(255, 255, 255, 0.1) !important;
}
.contract-performance :deep(.q-btn img),
.performance-full :deep(.q-btn img) {
  margin-right: 6px;
}
:deep(.performance-table-container) {
  overflow: auto;
  color: var(--sa-text, #fff);
}
:deep(.performance-table) {
  border-collapse: collapse;
  width: 100%;
  font-size: 12px;
  text-align: center;
  color: inherit;
}
:deep(.performance-table th),
:deep(.performance-table td) {
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 10px 16px;
  font-weight: 400;
}
:deep(.performance-table thead th) {
  font-weight: 700;
  background: rgba(255, 255, 255, 0.04);
}
:deep(.performance-table tbody th) {
  width: 280px;
  text-transform: uppercase;
  text-align: left;
  font-size: 11px;
  background: rgba(255, 255, 255, 0.025);
}
:deep(.performance-table thead th:first-child) {
  text-align: left;
}
:deep(.performance-note) {
  font-size: 10px;
  margin: 20px 12px 0;
  color: var(--sa-muted, rgba(255, 255, 255, 0.72));
}
.performance-chart {
  padding: 16px 24px;
}
.performance-metrics {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  padding-bottom: 20px;
}
.performance-metrics small {
  display: block;
  text-transform: uppercase;
  font-size: 10px;
}
.performance-metrics strong {
  display: block;
  margin-top: 6px;
  font-size: 13px;
  overflow-wrap: anywhere;
}
.performance-toolbar,
.performance-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.performance-toolbar {
  justify-content: space-between;
  margin: 20px 0;
  font-size: 12px;
}
.performance-unavailable {
  min-height: 300px;
  display: grid;
  place-items: center;
  color: var(--sa-muted, rgba(255, 255, 255, 0.72));
}
.performance-legend {
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
  font-size: 10px;
}
.performance-legend span {
  display: flex;
  align-items: center;
  gap: 6px;
}
.performance-legend i {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.16);
}
.performance-full {
  margin: 24px;
  max-height: calc(100vh - 48px);
  width: calc(100vw - 48px) !important;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px !important;
  background: rgba(23, 29, 43, 0.92);
  color: var(--sa-text, #fff);
  backdrop-filter: blur(20px);
}
.performance-full header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}
.performance-full__title {
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 350px;
}
.performance-full h2 {
  font-size: 14px;
  line-height: 20px;
  margin: 0;
}
.performance-full p {
  font-size: 11px;
  margin: 6px 0 0;
}
.performance-full :deep(.input-personal) {
  width: auto;
  min-width: 140px;
  color: inherit;
  font-size: 11px;
}
.performance-full :deep(.q-badge.custom-btn-primary) {
  color: var(--sa-text, #fff) !important;
  background: rgba(255, 255, 255, 0.08) !important;
}
@media (max-width: 850px) {
  .performance-metrics {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  .performance-full {
    margin: 12px;
    width: calc(100vw - 24px) !important;
    max-height: calc(100vh - 24px);
  }
}
</style>
