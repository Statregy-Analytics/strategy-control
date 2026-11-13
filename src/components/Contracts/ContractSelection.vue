<template>
  <div class="contract-selection workspace">
    <header class="workspace-header">
      <div>
        <h1>Contratos</h1>
        <p>Selecione um contrato existente ou crie um novo contrato.</p>
      </div>
      <q-btn outline no-caps label="Criar Novo Contrato" @click="$emit('open')"
        ><workspace-icon name="plus"
      /></q-btn>
      <div class="workspace-toolbar">
        <q-input
          v-model="search"
          outlined
          dense
          dark
          clearable
          class="workspace-search"
          placeholder="Buscar contrato por nome, cliente, motor ou ID"
          aria-label="Buscar contrato por nome, cliente, motor ou ID"
          ><template #prepend><workspace-icon name="search" /></template></q-input
        ><glass-select
          v-model="client"
          :options="clients"
          placeholder="Cliente"
          aria-label="Cliente"
          clearable
        /><glass-select
          v-model="engine"
          :options="engines"
          placeholder="Motor Principal"
          aria-label="Motor Principal"
          clearable
        /><date-range-picker v-model="period" label="Vigência" /><glass-select
          v-model="sort"
          :options="[
            { label: 'A–Z', value: 'az' },
            { label: 'Mais recentes', value: 'recent' },
          ]"
          placeholder="Ordenar por"
          aria-label="Ordenar por"
        />
        <div class="workspace-actions">
          <q-btn
            outline
            dense
            aria-label="Cards"
            :aria-pressed="view === 'cards'"
            @click="view = 'cards'"
            ><workspace-icon name="layout-grid" /></q-btn
          ><q-btn
            outline
            dense
            aria-label="Lista"
            :aria-pressed="view === 'list'"
            @click="view = 'list'"
            ><workspace-icon name="list"
          /></q-btn>
        </div>
      </div>
    </header>
    <main class="workspace-main">
      <resource-state :state="resource.state" @retry="load"
        ><div v-if="view === 'cards'" class="contract-selection-cards">
          <article v-for="row in pageRows" :key="row.id" class="contract-selection-card">
            <div class="contract-selection-card__title">
              <workspace-icon name="contract-file-text" />
              <div>
                <small>{{ row.publicCode || row.id.slice(0, 8) }}</small>
                <q-badge outline>{{
                  row.businessStatus?.name || financeLabel(row.registrationStatus)
                }}</q-badge>
                <h2>
                  <button @click="$emit('open', row.id)">
                    {{ row.name || 'Contrato sem nome' }}
                  </button>
                </h2>
                <small
                  ><workspace-icon name="contract-clock" /> Criado em
                  {{ dateLabel(row.createdAtUtc) }}</small
                >
              </div>
            </div>
            <div class="contract-selection-card__clients">
              <small><workspace-icon name="contract-users" /> Cliente(s)</small>
              <div class="contract-selection-clients">
                <span v-for="c in row.clients || []" :key="c.clientId">{{ c.displayName }}</span
                ><span v-if="!row.clients?.length">Nenhum cliente vinculado.</span>
              </div>
            </div>
            <div class="contract-selection-card__data">
              <div>
                <small><workspace-icon name="contract-coins" /> Capital Atual</small
                ><strong>{{ money(row.currentCapital, row.currencyCode) }}</strong
                ><small
                  >Inicial: {{ money(row.initialContractualCapital, row.currencyCode) }}</small
                >
              </div>
              <div>
                <small><workspace-icon name="contract-calendar" /> Vigência</small>
                <p>{{ dateLabel(row.startDate) }} — {{ dateLabel(row.endDate) }}</p>
              </div>
              <div>
                <small><workspace-icon name="contract-chart-pie" /> Motor Principal</small>
                <p>{{ row.primaryEngine?.name || '—' }}</p>
              </div>
              <div>
                <small><workspace-icon name="contract-building2" /> Universo de Ativos</small>
                <p>{{ universe(row) }}</p>
              </div>
              <div>
                <small><workspace-icon name="contract-coins1" /> Operações Intradiárias</small>
                <p>Indisponível</p>
              </div>
            </div>
            <q-btn
              class="contract-selection-card__open"
              flat
              dense
              :aria-label="'Abrir ' + row.name"
              @click="$emit('open', row.id)"
              ><workspace-icon name="contract-chevron-right"
            /></q-btn>
          </article>
          <div v-if="!pageRows.length" class="workspace-empty">Nenhum contrato encontrado.</div>
        </div>
        <q-table
          v-else
          dark
          flat
          dense
          :rows="pageRows"
          :columns="tableColumns"
          row-key="id"
          hide-pagination
          :pagination="{ rowsPerPage: 0 }"
          no-data-label="Nenhum contrato encontrado."
          ><template #body-cell-name="p"
            ><q-td :props="p"
              ><q-btn
                flat
                no-caps
                :label="p.row.name || 'Contrato sem nome'"
                @click="$emit('open', p.row.id)"
              /><small class="block"
                >{{ p.row.publicCode }} ·
                {{ p.row.businessStatus?.name || financeLabel(p.row.registrationStatus) }}</small
              ></q-td
            ></template
          ><template #body-cell-open="p"
            ><q-td :props="p"
              ><q-btn
                flat
                dense
                :aria-label="'Abrir ' + p.row.name"
                @click="$emit('open', p.row.id)"
                ><workspace-icon name="chevron-right" /></q-btn></q-td></template></q-table
      ></resource-state>
    </main>
  </div>
</template>
<script setup>
import { computed, ref, onActivated, onDeactivated, onScopeDispose } from 'vue'
import GlassSelect from 'src/components/Entity/GlassSelect.vue'
import DateRangePicker from 'src/components/Form/DateRangePicker.vue'
import ResourceState from 'src/components/Finance/ResourceState.vue'
import WorkspaceIcon from 'src/components/Workspaces/WorkspaceIcon.vue'
import { useFinanceResource } from 'src/composables/useFinanceResource'
import { financeGet, money, dateLabel, financeLabel, columns } from 'src/services/financeService'
import { readContractSelection, filterContractSelection } from 'src/services/contractSelectionModel'
defineEmits(['open'])
const resource = useFinanceResource(),
  search = ref(''),
  client = ref(null),
  engine = ref(null),
  period = ref(null),
  sort = ref('recent'),
  view = ref('cards')
let active = true,
  revision = 0
const clients = computed(() => [
  ...new Map(
    (resource.state.data || []).flatMap((r) =>
      (r.clients || []).map((c) => [c.clientId, { value: c.clientId, label: c.displayName }]),
    ),
  ).values(),
])
const engines = computed(() => [
  ...new Map(
    (resource.state.data || [])
      .filter((r) => r.primaryEngine?.engineId)
      .map((r) => [
        r.primaryEngine.engineId,
        { value: r.primaryEngine.engineId, label: r.primaryEngine.name },
      ]),
  ).values(),
])
const filtered = computed(() =>
  filterContractSelection(resource.state.data || [], {
    search: search.value,
    client: client.value,
    engine: engine.value,
    period: period.value,
    sort: sort.value,
  }),
)
const pageRows = filtered
function universe(row) {
  const s = row.assetUniverseSummary
  return s
    ? `${s.assetCount} ativos · ${s.marketCount} mercados · ${s.currencyCount} moedas`
    : 'Indisponível'
}
const tableColumns = columns([
  ['name', 'Contrato / Status'],
  ['clients', 'Cliente(s)', (r) => (r.clients || []).map((c) => c.displayName).join(', ') || '—'],
  ['currentCapital', 'Capital Atual', (r) => money(r.currentCapital, r.currencyCode)],
  ['term', 'Vigência', (r) => dateLabel(r.startDate) + ' — ' + dateLabel(r.endDate)],
  ['engine', 'Motor Principal', (r) => r.primaryEngine?.name || '—'],
  ['assets', 'Universo de Ativos', universe],
  ['intraday', 'Operações Intra.', () => 'Indisponível'],
  ['open', ''],
])
async function load() {
  const r = ++revision
  await resource.load(() => readContractSelection(financeGet, () => active && r === revision))
}
onActivated(() => {
  active = true
  load()
})
onDeactivated(() => {
  active = false
  revision++
  resource.reset()
})
onScopeDispose(() => {
  active = false
  revision++
  resource.reset()
})
</script>
<style src="src/css/workspaces.scss" lang="scss"></style>
<style scoped>
.contract-selection .workspace-header {
  flex-wrap: wrap;
  padding: 24px 48px;
}
.contract-selection .workspace-toolbar {
  width: 100%;
  padding: 0;
  margin: 16px 0 0;
  border: 0;
  background: none;
}
.contract-selection .workspace-toolbar :deep(.input-personal) {
  width: auto;
  min-width: 110px;
  font-size: 12px;
}
.contract-selection .workspace-toolbar .workspace-actions {
  order: 5;
}
.contract-selection .workspace-main {
  max-width: 1660px;
  padding-top: 32px;
}
.contract-selection-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.contract-selection-card {
  display: grid;
  grid-template-columns: minmax(220px, 1.5fr) minmax(180px, 1fr) minmax(280px, 1.25fr) 40px;
  align-items: center;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  padding: 24px;
  background: rgba(0, 0, 0, 0.06);
  min-width: 0;
  gap: 20px;
}
.contract-selection-card__title {
  display: flex;
  align-items: center;
  gap: 20px;
  min-width: 0;
}
.contract-selection-card__title > div {
  min-width: 0;
}
.contract-selection-card small {
  font-size: 10px;
}
.contract-selection-card .workspace-icon {
  vertical-align: middle;
  margin-right: 5px;
}
.contract-selection-card h2 {
  margin: 8px 0;
  font-size: 16px;
  line-height: 24px;
  overflow-wrap: anywhere;
}
.contract-selection-card h2 button {
  font: inherit;
  color: inherit;
  background: none;
  border: 0;
  padding: 0;
  cursor: pointer;
  text-align: left;
}
.contract-selection-card__clients {
  min-width: 0;
}
.contract-selection-clients {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
}
.contract-selection-clients span {
  padding: 2px 6px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 3px;
  font-size: 11px;
  overflow-wrap: anywhere;
}
.contract-selection-card__data {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  align-items: start;
  min-width: 0;
}
.contract-selection-card__data > div:nth-child(n + 3) {
  grid-column: 1/-1;
}
.contract-selection-card__data p {
  font-size: 11px;
  margin: 6px 0;
  overflow-wrap: anywhere;
}
.contract-selection-card__data small,
.contract-selection-card__data strong {
  display: block;
}
.contract-selection-card__data strong {
  font-size: 16px;
  margin: 6px 0;
  overflow-wrap: anywhere;
}
.contract-selection-card__open {
  height: 100%;
  border-left: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 0;
}
@media (max-width: 1200px) {
  .contract-selection-card {
    grid-template-columns: minmax(180px, 1fr) minmax(140px, 0.8fr) minmax(240px, 1.2fr) 28px;
    gap: 12px;
    padding: 20px;
  }
}
@media (max-width: 900px) {
  .contract-selection-card {
    grid-template-columns: 1fr 1fr 28px;
  }
  .contract-selection-card__title {
    grid-column: 1/3;
  }
  .contract-selection-card__open {
    grid-column: 3;
    grid-row: 1/3;
  }
}
@media (max-width: 550px) {
  .contract-selection .workspace-header {
    padding: 20px;
  }
  .contract-selection-card {
    padding: 16px;
    grid-template-columns: minmax(0, 1fr) 28px;
  }
  .contract-selection-card__title {
    grid-column: 1;
  }
  .contract-selection-card__clients,
  .contract-selection-card__data {
    grid-column: 1;
  }
  .contract-selection-card__open {
    grid-column: 2;
    grid-row: 1/4;
  }
}
</style>
