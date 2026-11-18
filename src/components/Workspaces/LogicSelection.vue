<template>
  <section class="logic-selection">
    <header>
      <div class="logic-selection-heading">
        <img :src="img('cards-imgFileText1')" alt="" />
        <div>
          <h1>Painel de Motores / Lógicas Contratuais</h1>
          <p>
            Controle operacional dos motores de variação indexada vinculados a papéis e contratos.
          </p>
        </div>
      </div>
      <q-btn outline no-caps @click="$emit('create')"
        ><img :src="img('cards-imgPlus')" alt="" />Novo Motor</q-btn
      >
    </header>
    <div class="logic-selection-metrics">
      <article v-for="(metric, i) in summaryRows" :key="metric.label">
        <small>{{ metric.label }}</small>
        <div>
          <img :src="img(metricIcons[i])" alt="" /><strong :class="metric.tone">{{
            metric.value
          }}</strong>
        </div>
      </article>
    </div>
    <div class="logic-selection-toolbar">
      <div class="logic-selection-view" role="group" aria-label="Visualização dos motores">
        <q-btn
          flat
          dense
          aria-label="Cards"
          :aria-pressed="view === 'cards'"
          @click="view = 'cards'"
          ><img
            :src="img(view === 'cards' ? 'cards-imgLayoutGrid' : 'list-imgLayoutGrid')"
            alt="" /></q-btn
        ><q-btn flat dense aria-label="Lista" :aria-pressed="view === 'list'" @click="view = 'list'"
          ><img :src="img(view === 'list' ? 'list-imgList' : 'cards-imgList')" alt=""
        /></q-btn>
      </div>
      <q-input
        v-model="search"
        outlined
        dense
        dark
        clearable
        hide-bottom-space
        placeholder="Buscar por nome, ID..."
        aria-label="Buscar por nome, ID..."
        ><template #prepend><img :src="img('cards-imgSearch')" alt="" /></template
      ></q-input>
      <compact-glass-select
        v-model="status"
        :options="statusOptions"
        placeholder="Status: Todos"
        aria-label="Status"
        :menu-width="268"
        :dropdown-icon="'img:' + img('cards-imgChevronDown')"
      />
      <compact-glass-select
        v-model="links"
        :options="linksOptions"
        placeholder="Vínculos: Todos"
        aria-label="Vínculos"
        :menu-width="258"
        :dropdown-icon="'img:' + img('cards-imgChevronDown1')"
      />
      <compact-glass-select
        v-model="sort"
        :options="sortOptions"
        placeholder="Ordenar por"
        aria-label="Ordenar por"
        class="logic-selection-sort"
        :menu-width="300"
        :dropdown-icon="'img:' + img('cards-imgChevronDown1')"
        ><template #prepend><img :src="img('cards-imgArrowUpDown')" alt="" /></template
      ></compact-glass-select>
    </div>
    <resource-state :state="state" @retry="$emit('retry')"
      ><div v-if="!filtered.length" class="logic-selection-empty">Nenhum motor encontrado.</div>
      <div v-else :class="view === 'cards' ? 'logic-selection-cards' : 'logic-selection-list'">
        <template v-for="row in filtered" :key="row.id"
          ><logic-card
            v-if="view === 'cards'"
            :record="row"
            :metrics="metricsById[row.id] || {}"
            @select="$emit('select', row, $event)" /><logic-directory-row
            v-else
            :record="row"
            :metrics="metricsById[row.id] || {}"
            @select="$emit('select', row, $event)"
        /></template></div
    ></resource-state>
  </section>
</template>
<script setup>
import { ref, computed, watch } from 'vue'
import ResourceState from 'src/components/Finance/ResourceState.vue'
import CompactGlassSelect from 'src/components/Entity/CompactGlassSelect.vue'
import LogicCard from './LogicCard.vue'
import LogicDirectoryRow from './LogicDirectoryRow.vue'
import {
  logicImage as img,
  logicNumber,
  logicState,
  logicPercent,
  canSortLogic,
  filterLogicDirectory,
} from 'src/services/logicDirectoryModel'
const props = defineProps({
  state: { type: Object, required: true },
  metricsById: { type: Object, default: () => ({}) },
  summary: { type: Object, default: () => ({}) },
})
defineEmits(['create', 'retry', 'select'])
const view = ref('cards'),
  search = ref(''),
  status = ref('all'),
  links = ref('all'),
  sort = ref(null)
const rows = computed(() => props.state.data || [])
const statusAvailable = computed(
  () => rows.value.length > 0 && rows.value.every((r) => logicState(r.status)),
)
const linksAvailable = computed(
  () =>
    rows.value.length > 0 &&
    rows.value.every((r) => {
      const n = logicNumber(props.metricsById[r.id]?.links)
      return n !== null && Number.isInteger(n) && n >= 0
    }),
)
const statusOptions = computed(() => [
  { label: 'Status: Todos', value: 'all' },
  ...['Ativa', 'Pausada', 'Em Análise', 'Inativa'].map((label, i) => ({
    label,
    value: ['active', 'paused', 'analysis', 'inactive'][i],
    disable: !statusAvailable.value,
  })),
])
const linksOptions = computed(() => [
  { label: 'Vínculos: Todos', value: 'all' },
  { label: 'Com vínculos', value: 'linked', disable: !linksAvailable.value },
  { label: 'Sem vínculos', value: 'unlinked', disable: !linksAvailable.value },
])
const sortOptions = computed(() =>
  [
    { label: 'Maior Performance do Ciclo', value: 'performance', groupLabel: 'PERFORMANCE' },
    { label: 'Melhor Perf. Desde Início', value: 'sinceStart' },
    { label: 'Maior Nº Papéis', value: 'links', groupLabel: 'OPERACIONAL' },
    { label: 'Maior Alvo do Ciclo', value: 'target' },
    { label: 'Menor Intervalo', value: 'interval' },
    { label: 'Última Atualização', value: 'updated' },
    { label: 'Mais Recentes', value: 'recent', groupLabel: 'GERAL' },
    { label: 'Mais Antigas', value: 'oldest' },
  ].map((o) => ({ ...o, disable: !canSortLogic(rows.value, props.metricsById, o.value) })),
)
const filtered = computed(() =>
  filterLogicDirectory(rows.value, props.metricsById, {
    search: search.value,
    status: status.value,
    links: links.value,
    sort: sort.value,
  }),
)
watch([rows, () => props.metricsById], () => {
  if (!statusAvailable.value) status.value = 'all'
  if (!linksAvailable.value) links.value = 'all'
  if (sort.value && !canSortLogic(rows.value, props.metricsById, sort.value)) sort.value = null
})
const metricIcons = [
  'cards-imgActivity1',
  'cards-imgCircleCheck',
  'cards-imgCircleAlert',
  'cards-imgTrendingUp',
  'cards-imgUsers1',
]
const summaryRows = computed(() =>
  [
    'Total de Motores',
    'Motores Ativos',
    'Em Análise',
    'Performance Média — Motores Ativos',
    'Papéis/Contratos Vinculados',
  ].map((label, i) => ({
    label,
    tone:
      i === 3
        ? logicNumber(props.summary.performancePercent) > 0
          ? 'positive'
          : logicNumber(props.summary.performancePercent) < 0
            ? 'negative'
            : ''
        : '',
    value:
      i === 0
        ? props.state.data
          ? rows.value.length
          : 'Indisponível'
        : i === 3
          ? logicPercent(props.summary.performancePercent, 1)
          : (logicNumber(
              props.summary[['total', 'active', 'analysis', 'performancePercent', 'links'][i]],
            ) ?? 'Indisponível'),
  })),
)
</script>
<style lang="scss" scoped src="./logicSelection.scss"></style>
