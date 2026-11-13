<template>
  <profile-section title="Performance Histórica do Índice do Motor" class="logic-performance">
    <template #actions>
      <div class="logic-controls">
        <q-btn-toggle v-model="days" no-caps :options="dayOptions" />
        <div class="logic-controls" role="group" aria-label="Tipo de visualização">
          <q-btn
            v-for="option in viewOptions"
            :key="option.value"
            outline
            no-caps
            :label="option.label"
            :aria-pressed="view === option.value"
            @click="view = option.value"
            ><img :src="option.image" alt=""
          /></q-btn>
        </div>
        <q-btn outline no-caps label="Ver histórico completo" @click="$emit('history')"
          ><img src="/icons/logics/chevron-right.svg" alt=""
        /></q-btn>
      </div>
    </template>
    <div class="logic-summary">
      <div v-for="label in metrics" :key="label">
        <small>{{ label }}</small
        ><strong>Indisponível</strong>
      </div>
    </div>
    <div class="logic-performance__body">
      <div class="logic-controls logic-filters">
        <div>
          <small>Período</small><q-btn-toggle v-model="period" no-caps :options="periodOptions" />
        </div>
        <div>
          <small>Granularidade</small
          ><q-btn-toggle v-model="granularity" no-caps :options="granularityOptions" />
        </div>
        <div v-if="view === 'chart'">
          <small>Visualização</small
          ><q-btn-toggle v-model="chart" no-caps :options="chartOptions" />
        </div>
      </div>
      <q-btn-toggle v-model="subject" no-caps :options="subjectOptions" />
      <div v-if="view === 'chart'" class="logic-chart-grid">
        <aside>
          <small>Camadas</small>
          <div class="logic-layers">
            <q-checkbox
              v-for="layer in layers"
              :key="layer"
              :model-value="false"
              :label="layer"
              disable
              dense
            />
          </div>
        </aside>
        <temporal-chart
          :points="[]"
          :mode="chart"
          :label="subject === 'Motor' ? 'Índice do motor' : subject"
          :empty-text="
            subject === 'Motor'
              ? 'Performance histórica indisponível.'
              : subject === 'Comparar'
                ? 'Comparação indisponível.'
                : 'Performance dos papéis indisponível.'
          "
        />
      </div>
      <temporal-indicator-table
        v-else
        :indicators="logicTemporalIndicators"
        :label="'Indicadores — ' + subject"
      />
    </div>
  </profile-section>
  <profile-section
    v-if="editing"
    title="Simulação de Impacto (Edição em Curso)"
    class="logic-performance"
  >
    <template #actions
      ><div class="logic-controls">
        <q-btn-toggle v-model="days" no-caps :options="dayOptions" />
        <div class="logic-controls" role="group" aria-label="Disposição da simulação">
          <q-btn
            v-for="option in arrangementOptions"
            :key="option.value"
            outline
            no-caps
            :label="option.label"
            :aria-pressed="arrangement === option.value"
            @click="arrangement = option.value"
            ><img :src="option.image" alt=""
          /></q-btn>
        </div></div
    ></template>
    <div class="logic-simulation" :class="{ 'logic-simulation--side': arrangement === 'side' }">
      <section>
        <h3><i />Tabela Atual (Valores Oficiais)</h3>
        <temporal-indicator-table
          :indicators="logicTemporalIndicators"
          label="Tabela atual — valores oficiais"
        />
      </section>
      <section>
        <h3 class="simulated"><i />Tabela Simulada (Parâmetros em Edição)</h3>
        <temporal-indicator-table
          :indicators="logicTemporalIndicators"
          label="Tabela simulada — parâmetros em edição"
        />
      </section>
    </div>
  </profile-section>
</template>
<script setup>
import { ref } from 'vue'
import ProfileSection from 'src/components/Entity/ProfileSection.vue'
import TemporalChart from 'src/components/Entity/TemporalChart.vue'
import TemporalIndicatorTable from 'src/components/Entity/TemporalIndicatorTable.vue'
import { logicTemporalIndicators } from 'src/services/logicPerformanceModel'
defineProps({ editing: Boolean })
defineEmits(['history'])
const days = ref('days'),
  view = ref('chart'),
  period = ref('Ciclo'),
  granularity = ref('Atualização'),
  chart = ref('line'),
  subject = ref('Motor'),
  arrangement = ref('below')
const options = (labels) => labels.map((label) => ({ label, value: label }))
const dayOptions = [
  { label: 'Dias', value: 'days' },
  { label: 'Dias + Períodos', value: 'periods' },
]
const viewOptions = [
  { label: 'Gráfico', value: 'chart', image: '/icons/logics/chart-line.svg' },
  { label: 'Tabela', value: 'table', image: '/icons/logics/table.svg' },
]
const periodOptions = options(['Hoje', '7D', '30D', 'Mês', 'Ciclo', 'Tudo'])
const granularityOptions = options(['Atualização', 'Horário', 'Diário', 'Semanal', 'Mensal'])
const chartOptions = [
  { label: 'Linha', value: 'line' },
  { label: 'Candles', value: 'candles' },
  { label: 'Área', value: 'area' },
]
const subjectOptions = options(['Motor', 'Papéis Vinculados', 'Comparar'])
const arrangementOptions = [
  { label: 'Abaixo', value: 'below', image: '/icons/logics/rows.svg' },
  { label: 'Ao Lado', value: 'side', image: '/icons/logics/columns.svg' },
]
const metrics = [
  'Índice Atual',
  'Variação no Ciclo',
  'Alvo do Ciclo',
  'Índice Final Obrigatório',
  'Distância até Alvo',
  'Papéis Vinculados',
  'Próxima Atualização',
  'Status',
]
const layers = [
  'Índice do Motor',
  'Teto Diário',
  'Piso Diário',
  'Teto Mensal',
  'Piso Mensal',
  'Alvo do Ciclo',
  'Eventos',
]
</script>
<style scoped>
.logic-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}
.logic-performance :deep(.profile-section__heading) {
  flex-wrap: wrap;
}
.logic-performance :deep(.profile-section__body) {
  padding: 16px;
}
.logic-performance :deep(.q-btn-toggle) {
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  box-shadow: none;
  flex-wrap: wrap;
}
.logic-performance :deep(.q-btn) {
  font-size: 10px;
  color: inherit;
  min-height: 28px;
}
.logic-performance :deep(.q-btn img) {
  order: -1;
  margin-right: 6px;
}
.logic-performance :deep(.q-btn[aria-pressed='true']) {
  background: rgba(255, 255, 255, 0.1);
}
.logic-performance :deep(.q-btn-toggle .bg-primary) {
  background: rgba(255, 255, 255, 0.1) !important;
}
.logic-summary {
  display: grid;
  grid-template-columns: repeat(8, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}
.logic-summary > div {
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 12px;
  min-width: 0;
  background: rgba(0, 0, 0, 0.08);
}
small {
  display: block;
  font-size: 9px;
  text-transform: uppercase;
  color: var(--sa-muted, rgba(255, 255, 255, 0.65));
  margin-bottom: 6px;
}
.logic-summary strong {
  font-size: 13px;
  overflow-wrap: anywhere;
}
.logic-performance__body {
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.08);
}
.logic-filters {
  justify-content: space-between;
  margin-bottom: 16px;
}
.logic-chart-grid {
  display: grid;
  grid-template-columns: 166px minmax(0, 1fr);
  gap: 24px;
  margin-top: 16px;
}
.logic-layers {
  padding: 8px;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  font-size: 10px;
  gap: 4px;
}
.logic-simulation {
  display: grid;
  gap: 16px;
}
.logic-simulation--side {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.logic-simulation section {
  min-width: 0;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
}
.logic-simulation h3 {
  margin: 0;
  font-size: 10px;
  line-height: 16px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.04);
  color: var(--sa-muted, rgba(255, 255, 255, 0.6));
  display: flex;
  align-items: center;
  gap: 8px;
}
.logic-simulation h3 i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
}
.logic-simulation h3.simulated {
  background: rgba(0, 163, 255, 0.08);
}
.logic-simulation h3.simulated i {
  background: #00a3ff;
}
@media (max-width: 1100px) {
  .logic-summary {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
@media (max-width: 650px) {
  .logic-summary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .logic-chart-grid,
  .logic-simulation--side {
    grid-template-columns: 1fr;
  }
  .logic-performance__body {
    padding: 12px;
  }
}
</style>
