<template>
  <div class="contract-selection workspace">
    <header class="workspace-header">
      <div>
        <h1>Contratos</h1>
        <p>Selecione um contrato existente ou crie um novo contrato.</p>
      </div>
      <div class="contract-selection-header-actions">
        <q-btn outline no-caps @click="$emit('requests')"
          ><img :src="image('header-imgIconeSolicitacoes')" alt="" />Solicitações<q-badge
            v-if="newRequests !== null"
            >{{ newRequests }}</q-badge
          ></q-btn
        >
        <q-btn v-if="!selectionOnly" outline no-caps @click="$emit('open')"
          ><img :src="image('header-imgPlus')" alt="" />Criar Novo Contrato</q-btn
        >
      </div>
      <div class="workspace-toolbar">
        <q-input
          v-model="search"
          outlined
          dense
          dark
          clearable
          hide-bottom-space
          class="workspace-search"
          placeholder="Buscar contrato por nome, cliente, motor ou ID"
          aria-label="Buscar contrato por nome, cliente, motor ou ID"
          ><template #prepend><img :src="image('header-imgSearch')" alt="" /></template
        ></q-input>
        <glass-select
          v-model="client"
          :options="clients"
          placeholder="Cliente"
          aria-label="Cliente"
          :dropdown-icon="'img:' + image('header-imgChevronDown')"
          clearable
          ><template #prepend><img :src="image('header-imgUsers')" alt="" /></template
        ></glass-select>
        <glass-select
          v-model="engine"
          :options="engines"
          placeholder="Motor Principal"
          aria-label="Motor Principal"
          :dropdown-icon="'img:' + image('header-imgChevronDown')"
          clearable
          ><template #prepend><img :src="image('header-imgChartPie')" alt="" /></template
        ></glass-select>
        <date-range-picker v-model="period" label="Vigência"
          ><template #icon><img :src="image('header-imgCalendar')" alt="" /></template
        ></date-range-picker>
        <glass-select
          v-model="sort"
          class="contract-selection-sort"
          :options="[
            { label: 'A–Z', value: 'az' },
            { label: 'Mais recentes', value: 'recent' },
          ]"
          placeholder="Ordenar por"
          aria-label="Ordenar por"
          :dropdown-icon="'img:' + image('header-imgChevronDown')"
          ><template #prepend><img :src="image('header-imgArrowUpDown')" alt="" /></template
        ></glass-select>
        <div class="contract-selection-view" role="group" aria-label="Visualização dos contratos">
          <q-btn
            flat
            dense
            aria-label="Lista"
            :aria-pressed="view === 'list'"
            @click="view = 'list'"
            ><img
              :src="image(view === 'list' ? 'list-imgLayoutList' : 'header-imgLayoutList')"
              alt="" /></q-btn
          ><q-btn
            flat
            dense
            aria-label="Cards"
            :aria-pressed="view === 'cards'"
            @click="view = 'cards'"
            ><img
              :src="image(view === 'cards' ? 'header-imgLayoutGrid' : 'list-imgLayoutGrid')"
              alt=""
          /></q-btn>
        </div>
      </div>
    </header>
    <main class="workspace-main">
      <resource-state :state="resource.state" @retry="load">
        <div v-if="view === 'cards'" class="contract-selection-cards">
          <article v-for="row in pageRows" :key="row.id" class="contract-selection-card">
            <div class="contract-selection-card__main">
              <div class="contract-selection-card__title">
                <span class="contract-selection-file"
                  ><img :src="image('card-imgFileText')" alt=""
                /></span>
                <div>
                  <div class="contract-selection-card__badges">
                    <small class="contract-selection-id"
                      >ID: {{ row.publicCode || row.id.slice(0, 8) }}</small
                    ><contract-status-badge :status="contractSelectionStatus(row)" />
                  </div>
                  <h2>
                    <button @click="$emit('open', row.id)">
                      {{ row.name || 'Contrato sem nome' }}
                    </button>
                  </h2>
                  <small class="contract-selection-created"
                    ><img :src="image('card-imgClock')" alt="" />Criado em
                    {{ day(row.createdAtUtc) }}</small
                  >
                </div>
              </div>
              <div class="contract-selection-card__clients">
                <small><img :src="image('card-imgUsers')" alt="" />Cliente(s)</small>
                <div class="contract-selection-clients">
                  <span v-for="c in row.clients || []" :key="c.clientId">{{
                    c.displayName || '—'
                  }}</span
                  ><span v-if="!row.clients?.length">Nenhum cliente vinculado.</span>
                </div>
              </div>
            </div>
            <div class="contract-selection-card__data">
              <div>
                <small><img :src="image('card-imgCoins')" alt="" />Capital Atual</small
                ><strong>{{ money(row.currentCapital, row.currencyCode) }}</strong
                ><small class="contract-selection-initial"
                  >Inicial: {{ money(row.initialContractualCapital, row.currencyCode) }}</small
                >
              </div>
              <div>
                <small><img :src="image('card-imgCalendar')" alt="" />Vigência</small>
                <p>{{ day(row.startDate) }} - {{ day(row.endDate) }}</p>
              </div>
              <div>
                <small>Motor Principal</small>
                <p>
                  <img :src="image('card-imgChartPie')" alt="" />{{
                    row.primaryEngine?.name || '—'
                  }}
                </p>
              </div>
              <div>
                <small>Universo de Ativos</small>
                <p>
                  <img :src="image('card-imgBuilding2')" alt="" />{{ universe(row).assets }} ·
                  {{ universe(row).markets }} · {{ universe(row).currencies }}
                </p>
              </div>
              <div>
                <small>Operações Intradiárias</small>
                <p><img :src="image('card-imgCoins1')" alt="" />Indisponível</p>
              </div>
            </div>
            <q-btn
              class="contract-selection-card__open"
              flat
              dense
              :aria-label="'Abrir ' + row.name"
              @click="$emit('open', row.id)"
              ><img :src="image('card-imgChevronRight')" alt=""
            /></q-btn>
          </article>
          <div v-if="!pageRows.length" class="workspace-empty">Nenhum contrato encontrado.</div>
        </div>
        <q-table
          v-else
          class="contract-selection-table"
          dark
          flat
          dense
          :rows="pageRows"
          :columns="tableColumns"
          row-key="id"
          hide-pagination
          :pagination="{ rowsPerPage: 0 }"
          no-data-label="Nenhum contrato encontrado."
        >
          <template #body-cell-name="p"
            ><q-td :props="p"
              ><div class="contract-selection-table__identity">
                <img :src="image('list-imgFileText1')" alt="" />
                <div>
                  <button @click="$emit('open', p.row.id)">
                    {{ p.row.name || 'Contrato sem nome' }}
                  </button>
                  <div>
                    <small>ID: {{ p.row.publicCode || p.row.id.slice(0, 8) }}</small
                    ><contract-status-badge :status="contractSelectionStatus(p.row)" />
                  </div>
                </div></div></q-td
          ></template>
          <template #body-cell-clients="p"
            ><q-td :props="p"
              ><p
                v-for="c in p.row.clients || []"
                :key="c.clientId"
                class="contract-selection-table__line"
              >
                <img :src="image('list-imgUser')" alt="" />{{ c.displayName || '—' }}
              </p>
              <span v-if="!p.row.clients?.length">—</span></q-td
            ></template
          >
          <template #body-cell-currentCapital="p"
            ><q-td :props="p"
              ><strong>{{ money(p.row.currentCapital, p.row.currencyCode) }}</strong
              ><small
                >Ini: {{ money(p.row.initialContractualCapital, p.row.currencyCode) }}</small
              ></q-td
            ></template
          >
          <template #body-cell-term="p"
            ><q-td :props="p"
              ><div class="contract-selection-table__line">
                {{ day(p.row.startDate) }}<img :src="image('list-imgArrowRight')" alt="" />{{
                  day(p.row.endDate)
                }}
              </div>
              <small>Vigência</small></q-td
            ></template
          >
          <template #body-cell-engine="p"
            ><q-td :props="p"
              ><div class="contract-selection-table__line">
                <img :src="image('list-imgChartPie2')" alt="" />{{
                  p.row.primaryEngine?.name || '—'
                }}
              </div></q-td
            ></template
          >
          <template #body-cell-assets="p"
            ><q-td :props="p"
              ><div class="contract-selection-table__line">
                <img :src="image('list-imgBuilding2')" alt="" />
                <div>
                  {{ universe(p.row).assets
                  }}<small>{{ universe(p.row).markets }} · {{ universe(p.row).currencies }}</small>
                </div>
              </div></q-td
            ></template
          >
          <template #body-cell-intraday="p"
            ><q-td :props="p"
              ><div class="contract-selection-table__line">
                <img :src="image('list-imgCoins')" alt="" />Indisponível
              </div></q-td
            ></template
          >
          <template #body-cell-open="p"
            ><q-td :props="p"
              ><q-btn
                flat
                dense
                :aria-label="'Abrir ' + p.row.name"
                @click="$emit('open', p.row.id)"
                ><img :src="image('list-imgChevronRight')" alt="" /></q-btn></q-td
          ></template>
        </q-table>
      </resource-state>
    </main>
  </div>
</template>
<script setup>
import 'src/css/workspaces.scss'
import { computed, ref, onActivated, onDeactivated, onScopeDispose } from 'vue'
import GlassSelect from 'src/components/Entity/GlassSelect.vue'
import DateRangePicker from 'src/components/Form/DateRangePicker.vue'
import ResourceState from 'src/components/Finance/ResourceState.vue'
import { useFinanceResource } from 'src/composables/useFinanceResource'
import { financeGet, money, dateLabel, columns } from 'src/services/financeService'
import {
  readContractSelection,
  filterContractSelection,
  contractSelectionStatus,
  contractUniverseParts,
} from 'src/services/contractSelectionModel'
import ContractStatusBadge from './ContractStatusBadge.vue'
defineEmits(['open', 'requests'])
const props = defineProps({
  newRequests: { type: Number, default: null },
  selectionOnly: Boolean,
  read: { type: Function, default: financeGet },
})
const resource = useFinanceResource(),
  search = ref(''),
  client = ref(null),
  engine = ref(null),
  period = ref(null),
  sort = ref(null),
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
  filterContractSelection(
    (resource.state.data || []).filter(
      (row) =>
        !props.selectionOnly ||
        (row.businessStatus?.code === 'ACTIVE' && row.registrationStatus !== 'Draft'),
    ),
    {
      search: search.value,
      client: client.value,
      engine: engine.value,
      period: period.value,
      sort: sort.value,
    },
  ),
)
const pageRows = filtered
const image = (name) => '/icons/contracts/selection/' + name + '.svg'
const universe = (row) => contractUniverseParts(row)
const day = (value) =>
  value && Number.isFinite(Date.parse(value)) ? dateLabel(value).split(',')[0] : '—'
const tableColumns = columns([
  ['name', 'Contrato / Status'],
  ['clients', 'Cliente(s)', (r) => (r.clients || []).map((c) => c.displayName).join(', ') || '—'],
  ['currentCapital', 'Capital Atual', (r) => money(r.currentCapital, r.currencyCode)],
  ['term', 'Vigência', (r) => dateLabel(r.startDate) + ' — ' + dateLabel(r.endDate)],
  ['engine', 'Motor Principal', (r) => r.primaryEngine?.name || '—'],
  ['assets', 'Universo de Ativos'],
  ['intraday', 'Operações Intra.', () => 'Indisponível'],
  ['open', ''],
])
async function load() {
  const r = ++revision
  await resource.load(() => readContractSelection(props.read, () => active && r === revision))
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
<style lang="scss" scoped src="./contractSelection.scss"></style>
