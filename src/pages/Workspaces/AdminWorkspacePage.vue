<template>
  <q-page class="workspace" :class="'workspace--' + module">
    <logic-workspace
      v-if="editor && module === 'logic'"
      :key="editor + '-' + (recordId || 'new') + '-' + (contentKind || '')"
      :record-id="recordId"
      :start-editing="editor === 'edit'"
      :focus-links="route.query.section === 'links'"
      @readonly="editor === 'edit' && router.replace({ query: { ...route.query, editor: 'open' } })"
      @close="closeEditor"
    />
    <publication-workspace
      v-else-if="editor && module === 'communication'"
      :key="editor + '-' + (recordId || 'new') + '-' + (contentKind || '')"
      :record-id="recordId"
      :kind="contentKind"
      @close="closeEditor"
      @saved="onSaved"
    />
    <template v-else>
      <header class="workspace-header">
        <div>
          <h1>{{ definition.title }}</h1>
          <p v-if="definition.subtitle">{{ definition.subtitle }}</p>
        </div>
        <q-btn
          v-if="module !== 'credit'"
          outline
          no-caps
          :label="tab === 'authors' ? 'Novo Redator' : definition.create"
          :class="{ 'publication-create': module === 'communication' }"
          @click="create"
          ><img
            v-if="module === 'communication'"
            src="/icons/publication/content-plus.svg"
            alt="" /><workspace-icon v-else name="plus"
        /></q-btn>
      </header>
      <main
        class="workspace-main"
        :class="{ 'workspace-main--authors': module === 'communication' && tab === 'authors' }"
      >
        <q-tabs
          v-if="module === 'communication'"
          v-model="tab"
          class="publication-tabs"
          align="left"
          no-caps
        >
          <q-tab name="main" label="Conteúdos" /><q-tab name="authors" label="Redatores" />
        </q-tabs>
        <div v-if="tab === 'main' || module === 'credit'" class="workspace-metrics">
          <div v-for="(metric, i) in metrics" :key="metric.label" class="workspace-metric">
            <small>{{ metric.label }}</small
            ><img
              v-if="module !== 'logic'"
              :src="
                '/icons/workspace-review/' +
                (module === 'credit' ? creditMetricIcons[i] : publicationMetricIcons[i]) +
                '.svg'
              "
              alt=""
            /><workspace-icon v-else :name="metricIcons[i % metricIcons.length]" />
            <strong>{{ metric.value }}</strong>
          </div>
        </div>
        <div v-if="module === 'credit'" class="workspace-tabs">
          <q-btn-toggle
            v-model="tab"
            no-caps
            :options="[
              { label: 'Operações', value: 'main' },
              { label: 'Parceiros', value: 'partners' },
            ]"
          />
        </div>
        <div
          v-if="
            !(
              (module === 'communication' && tab === 'authors') ||
              (module === 'credit' && tab === 'partners')
            )
          "
          class="workspace-toolbar"
        >
          <q-btn-toggle
            v-if="module === 'logic'"
            v-model="view"
            no-caps
            :options="viewOptions"
          /><q-input
            v-model="search"
            outlined
            dense
            dark
            clearable
            class="workspace-search"
            :placeholder="searchPlaceholder"
            :aria-label="searchPlaceholder"
            ><template #prepend><workspace-icon name="search" /></template></q-input
          ><glass-select
            v-if="module === 'credit'"
            v-model="kindFilter"
            :options="creditKindOptions"
            placeholder="Tipo de operação"
            aria-label="Tipo de operação"
            clearable
          />
          <glass-select
            v-if="module === 'communication'"
            v-model="kindFilter"
            :options="contentTypes"
            placeholder="Tipo"
            aria-label="Tipo"
            disable
          />
          <glass-select
            v-if="module !== 'logic'"
            v-model="status"
            :options="statusOptions"
            placeholder="Status"
            aria-label="Status"
            :disable="tab !== 'main'"
            clearable
          /><compact-glass-select
            v-else
            v-model="logicStatus"
            :options="logicStatusOptions"
            placeholder="Status: Todos"
            aria-label="Status"
            :menu-width="268"
          /><glass-select
            v-if="module === 'communication'"
            v-model="authorFilter"
            :options="[]"
            placeholder="Redator"
            aria-label="Redator"
            disable
          /><compact-glass-select
            v-if="module === 'logic'"
            v-model="linksFilter"
            :options="logicLinksOptions"
            placeholder="Vínculos: Todos"
            aria-label="Vínculos"
            :menu-width="258"
          /><compact-glass-select
            v-if="module === 'logic'"
            v-model="logicSort"
            :options="logicSortOptions"
            placeholder="Ordenar por"
            aria-label="Ordenar por"
          /><template v-if="module === 'credit'"
            ><div
              v-if="tab === 'main'"
              class="workspace-view-toggle"
              role="group"
              aria-label="Visualização das operações"
            >
              <button
                v-for="option in viewOptions"
                :key="option.value"
                :aria-label="option.label"
                :aria-pressed="view === option.value"
                @click="view = option.value"
              >
                <img
                  :src="
                    '/icons/workspace-review/credit-' +
                    { list: 'list', cards: 'grid', kanban: 'kanban' }[option.value] +
                    '.svg'
                  "
                  alt=""
                />
              </button>
            </div>
            <q-btn
              outline
              no-caps
              :label="tab === 'partners' ? 'Criar Parceiro' : 'Nova Operação'"
              @click="create"
              ><workspace-icon name="plus" /></q-btn
          ></template>
        </div>
        <q-banner v-if="error" class="workspace-error" role="alert">{{ error }}</q-banner>
        <supporting-directory
          v-if="tab !== 'main'"
          :kind="tab"
          @edit="editDirectory"
          @create="create"
        />
        <resource-state v-else :state="resource.state" @retry="load">
          <div
            v-if="module === 'credit'"
            class="credit-operation-groups"
            role="group"
            aria-label="Situação das operações"
          >
            <button
              v-for="group in creditGroups"
              :key="group.value"
              :aria-pressed="creditGroup === group.value"
              @click="creditGroup = group.value"
            >
              <img :src="'/icons/workspace-review/credit-group-' + group.value + '.svg'" alt="" />{{
                group.label
              }}<span>{{ creditGroupCount(group.value) }}</span>
            </button>
          </div>
          <div v-if="view === 'kanban'" class="workspace-kanban">
            <section v-for="stage in creditStages" :key="stage" class="workspace-record">
              <h2>{{ stage }}</h2>
              <p class="workspace-muted">Indisponível</p>
            </section>
          </div>
          <div
            v-else-if="view === 'cards'"
            class="workspace-cards"
            :class="{
              'workspace-cards--logic': module === 'logic',
              'workspace-cards--credit': module === 'credit',
            }"
          >
            <template v-for="row in pageRows" :key="row.id">
              <logic-card v-if="module === 'logic'" :record="row" @select="openRow(row, $event)" />
              <credit-operation-card
                v-else-if="module === 'credit'"
                :record="row"
                @open="openRow(row, 'open')"
              />
              <article v-else class="workspace-record">
                <div class="workspace-record-head">
                  <div>
                    <h2>
                      <workspace-icon name="file-text" />
                      {{ row.name || row.title || row.client?.displayName || row.publicCode }}
                    </h2>
                    <small>{{ row.code || row.publicCode }}</small>
                    <q-badge outline>{{ workspaceStatus(row.status) }}</q-badge>
                  </div>
                  <row-actions dark :actions="recordActions" @select="openRow(row, $event)" />
                </div>
                <dl>
                  <div>
                    <dt>Tipo</dt>
                    <dd>{{ workspaceStatus(row.kind) }}</dd>
                  </div>
                  <div>
                    <dt>Valor</dt>
                    <dd>{{ money(row.principalAmount, row.currencyIsoCode) }}</dd>
                  </div>
                  <div>
                    <dt>Garantia</dt>
                    <dd>{{ row.collateral || '—' }}</dd>
                  </div>
                  <div>
                    <dt>Atualização</dt>
                    <dd>{{ dateLabel(row.updatedAtUtc) }}</dd>
                  </div>
                </dl>
              </article>
            </template>
            <div v-if="!pageRows.length" class="workspace-empty">Nenhum registro encontrado.</div>
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
            no-data-label="Nenhum registro encontrado."
            ><template v-if="module === 'logic'" #body="p"
              ><q-tr v-if="['Active', 'Ativo'].includes(p.row.status)" :props="p"
                ><q-td :colspan="p.cols.length"
                  ><logic-active-row
                    :record="p.row"
                    @select="openRow(p.row, $event)" /></q-td></q-tr
              ><q-tr v-else :props="p"
                ><q-td v-for="column in p.cols" :key="column.name" :props="{ ...p, col: column }"
                  ><row-actions
                    v-if="column.name === 'actions'"
                    dark
                    :actions="recordActions"
                    @select="openRow(p.row, $event)"
                  /><template v-else>{{ column.value }}</template></q-td
                ></q-tr
              ></template
            ><template #body-cell-status="p"
              ><q-td :props="p"
                ><publication-status
                  v-if="module === 'communication'"
                  :status="p.row.status"
                /><template v-else>{{ p.value }}</template></q-td
              ></template
            ><template #body-cell-actions="p"
              ><q-td :props="p"
                ><q-btn
                  v-if="module === 'credit'"
                  flat
                  dense
                  :aria-label="'Abrir operação ' + p.row.publicCode"
                  @click="openRow(p.row, 'open')"
                  ><img src="/icons/workspace-review/credit-open.svg" alt="" /></q-btn
                ><row-actions
                  v-else
                  dark
                  :actions="recordActions"
                  @select="openRow(p.row, $event)" /></q-td></template
          ></q-table>
        </resource-state>
      </main>
    </template>
    <q-dialog v-model="typeOpen"
      ><q-card class="workspace-modal" :class="{ 'credit-type-modal': module === 'credit' }"
        ><div class="workspace-modal-heading">
          <h2>{{ module === 'credit' ? 'Nova Operação de Crédito' : 'Criar Novo Conteúdo' }}</h2>
          <q-btn
            v-if="module === 'credit'"
            flat
            dense
            aria-label="Fechar nova operação"
            @click="typeOpen = false"
            ><img src="/icons/workspace-review/credit-close.svg" alt=""
          /></q-btn>
        </div>
        <p>
          {{
            module === 'credit'
              ? 'Selecione o tipo de operação de crédito que deseja criar'
              : 'Selecione o tipo de conteúdo que deseja criar'
          }}
        </p>
        <credit-wizard-steps v-if="module === 'credit'" :step="1" />
        <button
          v-for="(type, index) in module === 'credit' ? creditTypes : contentTypes"
          :key="type"
          class="workspace-choice"
          :aria-pressed="selectedType === type"
          @click="selectedType = type"
        >
          <img
            v-if="module === 'credit'"
            :src="'/icons/workspace-review/credit-' + creditTypeIcons[index] + '.svg'"
            alt=""
          />{{ type }}
        </button>
        <div class="workspace-actions">
          <q-btn flat no-caps label="Cancelar" v-close-popup /><q-btn
            outline
            no-caps
            label="Continuar"
            :disable="!selectedType"
            @click="continueType"
          /></div></q-card
    ></q-dialog>
    <credit-workspace
      v-if="creditOpen"
      :key="creditRecord || tab + '-' + selectedType"
      :record-id="creditRecord"
      :operation-type="selectedType"
      :partner="tab === 'partners'"
      @close="creditOpen = false"
      @back="backToCreditType"
    />
    <author-dialog v-if="authorOpen" @close="authorOpen = false" />
  </q-page>
</template>
<script setup>
import CreditWizardSteps from 'src/components/Workspaces/CreditWizardSteps.vue'
import CreditOperationCard from 'src/components/Workspaces/CreditOperationCard.vue'
import LogicActiveRow from 'src/components/Workspaces/LogicActiveRow.vue'
import LogicCard from 'src/components/Workspaces/LogicCard.vue'
import PublicationStatus from 'src/components/Workspaces/PublicationStatus.vue'
import { computed, ref, watch, onScopeDispose } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ResourceState from 'src/components/Finance/ResourceState.vue'
import RowActions from 'src/components/Entity/RowActions.vue'
import GlassSelect from 'src/components/Entity/GlassSelect.vue'
import CompactGlassSelect from 'src/components/Entity/CompactGlassSelect.vue'
import { canOrderLogicCatalog, orderLogicCatalog } from 'src/services/logicCatalogOrder'
import WorkspaceIcon from 'src/components/Workspaces/WorkspaceIcon.vue'
import SupportingDirectory from 'src/components/Workspaces/SupportingDirectory.vue'
import LogicWorkspace from 'src/components/Workspaces/LogicWorkspace.vue'
import PublicationWorkspace from 'src/components/Workspaces/PublicationWorkspace.vue'
import CreditWorkspace from 'src/components/Workspaces/CreditWorkspace.vue'
import AuthorDialog from 'src/components/Workspaces/AuthorDialog.vue'
import {
  workspaceTypes,
  publicationStatuses,
  contentTypes,
  creditTypes,
  workspaceStatus,
  readWorkspaceCollection,
  filterWorkspace,
} from 'src/services/adminWorkspaceModel'
import { financeGet, money, dateLabel, columns } from 'src/services/financeService'
import { useFinanceResource } from 'src/composables/useFinanceResource'
const props = defineProps({ module: { type: String, required: true } })
const route = useRoute(),
  router = useRouter(),
  resource = useFinanceResource()
const tab = ref('main'),
  search = ref(''),
  status = ref(null),
  sort = ref('az'),
  view = ref(props.module === 'logic' ? 'cards' : 'list'),
  kindFilter = ref(null),
  authorFilter = ref(null),
  linksFilter = ref('all'),
  logicStatus = ref('all'),
  logicSort = ref(null),
  creditGroup = ref('open'),
  typeOpen = ref(false),
  selectedType = ref(null),
  creditOpen = ref(false),
  creditRecord = ref(null),
  authorOpen = ref(false),
  error = ref('')
let active = true,
  revision = 0
const definition = computed(() => workspaceTypes[props.module])
const recordId = computed(() =>
  typeof route.query.id === 'string' &&
  /^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(route.query.id)
    ? route.query.id
    : null,
)
const editor = computed(() =>
  route.query.editor === 'new'
    ? 'new'
    : recordId.value && ['open', 'edit'].includes(route.query.editor)
      ? route.query.editor
      : null,
)
const contentKind = computed(() =>
  contentTypes.includes(route.query.kind) ? route.query.kind : null,
)
const filtered = computed(() =>
  orderLogicCatalog(
    filterWorkspace(resource.state.data || [], {
      search: search.value,
      status: status.value,
      sort: sort.value,
    }).filter((r) => {
      if (props.module !== 'credit') return true
      if (kindFilter.value && r.kind !== kindFilter.value) return false
      const closed = ['Settled', 'Closed'],
        cancelled = ['Cancelled', 'Canceled', 'Rejected']
      return creditGroup.value === 'closed'
        ? closed.includes(r.status)
        : creditGroup.value === 'cancelled'
          ? cancelled.includes(r.status)
          : ![...closed, ...cancelled].includes(r.status)
    }),
    props.module === 'logic' ? logicSort.value : null,
  ),
)
watch(
  () => resource.state.data,
  (rows) => {
    if (
      props.module === 'logic' &&
      Array.isArray(rows) &&
      logicSort.value &&
      !canOrderLogicCatalog(rows, logicSort.value)
    )
      logicSort.value = null
  },
)

const pageRows = filtered
const searchPlaceholder = computed(() =>
  props.module === 'logic'
    ? 'Buscar por nome, ID...'
    : props.module === 'credit'
      ? 'Buscar por cliente, ID, parceiro ou tipo de crédito...'
      : 'Buscar por título, código, redator ou categoria...',
)
const statusOptions = computed(() =>
  props.module === 'communication'
    ? publicationStatuses
    : [...new Set((resource.state.data || []).map((r) => r.status).filter(Boolean))].map(
        (value) => ({ label: workspaceStatus(value), value }),
      ),
)
const viewOptions = computed(() => [
  { label: 'Lista', value: 'list' },
  { label: 'Cards', value: 'cards' },
  ...(props.module === 'credit' ? [{ label: 'Kanban', value: 'kanban' }] : []),
])
const creditKindOptions = computed(() =>
  [...new Set((resource.state.data || []).map((r) => r.kind).filter(Boolean))].map((value) => ({
    label: workspaceStatus(value),
    value,
  })),
)
const creditMetricIcons = [
  'credit-active',
  'credit-pending',
  'credit-documents',
  'credit-final',
  'credit-sign',
  'credit-contracted',
]
const publicationMetricIcons = [
  'publication-published',
  'publication-draft',
  'publication-review',
  'publication-archived',
  'publication-total',
  'publication-authors',
]
const metricIcons = [
  'activity1',
  'circle-check',
  'circle-alert',
  'trending-up',
  'users1',
  'file-text',
]
const metrics = computed(() => {
  const rows = resource.state.data
  const names =
    props.module === 'logic'
      ? [
          'Total de Motores',
          'Motores Ativos',
          'Em Análise',
          'Performance Média — Motores Ativos',
          'Papéis/Contratos Vinculados',
        ]
      : props.module === 'credit'
        ? [
            'Operações Ativas',
            'Pendentes',
            'Em Documentação',
            'Propostas Finais',
            'Em Assinatura',
            'Contratadas',
          ]
        : ['Publicados', 'Rascunhos', 'Em Revisão', 'Arquivados', 'Total', 'Redatores']
  return names.map((label, i) => ({
    label,
    value: !rows
      ? 'Indisponível'
      : props.module === 'logic' && i === 0
        ? rows.length
        : props.module === 'communication' && i < 4
          ? rows.filter((r) => r.status === ['Published', 'Draft', 'UnderReview', 'Archived'][i])
              .length
          : props.module === 'communication' && i === 4
            ? rows.length
            : 'Indisponível',
  }))
})
// The catalog provides creation dates, but not the operational projection.
// Enable only options backed by complete, validated data from that response.
const logicStatusOptions = [
  { label: 'Status: Todos', value: 'all' },
  ...['Ativa', 'Pausada', 'Em Análise', 'Inativa'].map((label) => ({
    label,
    value: label,
    disable: true,
  })),
]
const logicLinksOptions = [
  { label: 'Vínculos: Todos', value: 'all' },
  ...['Com vínculos', 'Sem vínculos'].map((label) => ({ label, value: label, disable: true })),
]
const logicSortOptions = computed(() =>
  [
    { label: 'Maior Performance do Ciclo', groupLabel: 'PERFORMANCE' },
    { label: 'Melhor Perf. Desde Início' },
    { label: 'Maior Nº Papéis', groupLabel: 'OPERACIONAL' },
    { label: 'Maior Alvo do Ciclo' },
    { label: 'Menor Intervalo' },
    // Catalog edits are not assumed to be operational motor updates.
    { label: 'Última Atualização' },
    {
      label: 'Mais Recentes',
      value: 'recent',
      groupLabel: 'GERAL',
      disable: !canOrderLogicCatalog(resource.state.data, 'recent'),
    },
    {
      label: 'Mais Antigas',
      value: 'oldest',
      disable: !canOrderLogicCatalog(resource.state.data, 'oldest'),
    },
  ].map((option) => ({
    ...option,
    value: option.value || option.label,
    disable: option.disable ?? true,
  })),
)
const logicCardLabels = [
  'Índice Atual',
  'Alvo do Ciclo',
  'Final Obrigatório',
  'Papéis/Contratos',
  'Ciclo Atual',
  'Performance do Ciclo Atual',
  'Próxima Atualização',
]
const creditTypeIcons = ['house', 'car', 'building', 'car', 'briefcase', 'briefcase', 'info']
const creditGroups = [
  { value: 'open', label: 'Operações em Aberto' },
  { value: 'closed', label: 'Operações Finalizadas' },
  { value: 'cancelled', label: 'Operações Canceladas/Recusadas' },
]
function creditGroupCount(group) {
  if (!resource.state.data) return '—'
  return resource.state.data.filter((r) =>
    group === 'closed'
      ? ['Settled', 'Closed'].includes(r.status)
      : group === 'cancelled'
        ? ['Cancelled', 'Canceled', 'Rejected'].includes(r.status)
        : !['Settled', 'Closed', 'Cancelled', 'Canceled', 'Rejected'].includes(r.status),
  ).length
}
const creditStages = [
  'Iniciada',
  'Pendente',
  'Pré-proposta',
  'Documentação',
  'Proposta Final',
  'Assinatura',
  'Contratada',
]
const recordActions = computed(() => [
  { name: 'open', label: 'Abrir', icon: 'visibility' },
  { name: 'edit', label: 'Editar', icon: 'edit' },
  ...(props.module === 'logic' ? [{ name: 'links', label: 'Vínculos', icon: 'link' }] : []),
])
const tableColumns = computed(() =>
  props.module === 'communication'
    ? columns([
        ['title', 'Título'],
        ['type', 'Tipo', () => '—'],
        ['publicCode', 'Código'],
        ['version', 'Versão', () => '—'],
        ['author', 'Redator', () => '—'],
        ['status', 'Status', (r) => workspaceStatus(r.status)],
        ['createdAtUtc', 'Criado', (r) => dateLabel(r.createdAtUtc)],
        ['publishedAtUtc', 'Publicado', (r) => dateLabel(r.publishedAtUtc)],
        ['updatedAtUtc', 'Última Edição', (r) => dateLabel(r.updatedAtUtc)],
        ['attachments', 'Anexos', () => '—'],
        ['actions', ''],
      ])
    : props.module === 'logic'
      ? columns([
          ['name', 'Motor'],
          ['code', 'ID'],
          ...logicCardLabels.slice(0, 4).map((l) => [l, l, () => 'Indisponível']),
          ['status', 'Status', (r) => workspaceStatus(r.status)],
          ['actions', ''],
        ])
      : columns([
          ['publicCode', 'ID'],
          ['client', 'Cliente', (r) => r.client?.displayName || r.client?.name || '—'],
          ['kind', 'Tipo', (r) => workspaceStatus(r.kind)],
          [
            'principalAmount',
            'Valor Solicitado',
            (r) => money(r.principalAmount, r.currencyIsoCode),
          ],
          ['collateral', 'Garantia/Produto'],
          ['stage', 'Etapa', () => '—'],
          ['partners', 'Parceiros', () => '—'],
          ['proposals', 'Propostas', () => '—'],
          ['pending', 'Pendências', () => '—'],
          ['source', 'Origem', () => '—'],
          ['owner', 'Responsável', () => '—'],
          ['updatedAtUtc', 'Atualização', (r) => dateLabel(r.updatedAtUtc)],
          ['actions', ''],
        ]),
)
async function load() {
  const r = ++revision
  await resource.load(() =>
    readWorkspaceCollection(financeGet, props.module, () => active && r === revision),
  )
}
function create() {
  error.value = ''
  selectedType.value = null
  if (tab.value === 'authors') authorOpen.value = true
  else if (tab.value === 'partners') {
    creditRecord.value = null
    creditOpen.value = true
  } else if (props.module === 'logic') router.push({ query: { editor: 'new' } })
  else typeOpen.value = true
}
function editDirectory() {
  if (tab.value === 'authors')
    error.value = 'Não foi possível editar o redator. Serviço indisponível no momento.'
  else creditOpen.value = true
}
function backToCreditType() {
  creditOpen.value = false
  typeOpen.value = true
}
function continueType() {
  typeOpen.value = false
  if (props.module === 'credit') {
    creditRecord.value = null
    creditOpen.value = true
  } else router.push({ query: { editor: 'new', kind: selectedType.value } })
}
function openRow(row, action) {
  if (props.module === 'credit') {
    creditRecord.value = row.id
    creditOpen.value = true
  } else
    router.push({
      query: {
        editor: action === 'edit' ? 'edit' : 'open',
        id: row.id,
        ...(props.module === 'logic' && action === 'links' ? { section: 'links' } : {}),
      },
    })
}
function closeEditor() {
  router.push({ query: {} })
}
function onSaved() {
  closeEditor()
  load()
}
watch(
  () => recordId.value,
  (id) => {
    if (id && props.module === 'credit') {
      creditRecord.value = id
      creditOpen.value = true
    }
  },
  { immediate: true },
)
watch(tab, () => {
  error.value = ''
})
watch(
  () => props.module,
  () => {
    tab.value = 'main'
    search.value = ''
    status.value = null
    kindFilter.value = null
    creditGroup.value = 'open'
    authorFilter.value = null
    view.value = props.module === 'logic' ? 'cards' : 'list'
    load()
  },
  { immediate: true },
)
onScopeDispose(() => {
  active = false
  revision++
  resource.reset()
})
</script>
<style src="src/css/workspaces.scss" lang="scss"></style>
<style scoped>
.workspace-main--authors {
  padding: 24px;
  max-width: 1800px;
}
.publication-tabs {
  margin-bottom: 24px;
  color: white;
}
.publication-tabs :deep(.q-tab) {
  min-height: 40px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
}
.publication-tabs :deep(.q-tab__label) {
  font-weight: 600;
}
.publication-tabs :deep(.q-tab--active) {
  color: #2b7fff;
}
.publication-tabs :deep(.q-tab__indicator) {
  background: #2b7fff;
  height: 2px;
}
.publication-create {
  height: 36px;
  background: rgba(255, 255, 255, 0.06);
  color: white;
  font-size: 14px !important;
}
.publication-create :deep(.q-btn__content) {
  gap: 16px;
  flex-direction: row-reverse;
}

.workspace-kanban {
  display: grid;
  grid-template-columns: repeat(7, minmax(230px, 1fr));
  gap: 16px;
  overflow: auto;
  padding: 24px 0;
}
.workspace-kanban .workspace-record {
  min-height: 240px;
}
.workspace-tabs {
  margin-bottom: 24px;
}
</style>

<style scoped>
.workspace-view-toggle {
  display: flex;
  gap: 4px;
  padding: 4px;
  border: 1px solid #ffffff33;
  border-radius: 8px;
  margin-left: auto;
}
.workspace-view-toggle button {
  display: grid;
  place-items: center;
  width: 32px;
  height: 28px;
  border: 0;
  border-radius: 5px;
  background: transparent;
  cursor: pointer;
}
.workspace-view-toggle button[aria-pressed='true'] {
  background: #ffffff26;
}
.workspace-view-toggle button:focus-visible {
  outline: 2px solid #2b7fff;
  outline-offset: 2px;
}
.workspace-metric > img {
  position: absolute;
  top: 16px;
  right: 16px;
}
.workspace-toolbar {
  gap: 12px;
}
</style>

<style scoped>
.credit-operation-groups {
  display: flex;
  gap: 8px;
  padding: 6px;
  border: 1px solid #ffffff1f;
  background: #ffffff08;
  border-radius: 8px;
  margin: 20px 0;
}
.credit-operation-groups button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex: 1;
  padding: 8px;
  border: 1px solid transparent;
  border-radius: 5px;
  color: #ffffffb8;
  background: transparent;
  font-size: 12px;
  cursor: pointer;
}
.credit-operation-groups button[aria-pressed='true'] {
  color: #fff;
  background: #ffffff1a;
  border-color: #ffffff33;
}
.credit-operation-groups span {
  border: 1px solid #ffffff4d;
  border-radius: 4px;
  font-size: 10px;
  padding: 0 5px;
}
.credit-type-modal .workspace-choice {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 42px;
  padding: 10px;
  font-size: 14px;
}
.credit-type-modal .workspace-actions {
  margin: 40px -24px -24px;
  padding: 16px 24px;
  border-top: 1px solid #ffffff33;
  display: flex;
}
.credit-type-modal .workspace-actions .q-btn {
  flex: 1;
}
@media (max-width: 600px) {
  .credit-operation-groups {
    flex-direction: column;
  }
}
</style>

<style scoped>
.workspace-metric {
  position: relative;
}
.workspace--communication .workspace-metric {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
  align-items: center;
}
.workspace--communication .workspace-metric > img {
  position: static;
  grid-column: 1;
  grid-row: 1;
}
.workspace--communication .workspace-metric strong {
  grid-column: 2;
  grid-row: 1;
}
.workspace--communication .workspace-metric small {
  grid-column: 1/-1;
  grid-row: 2;
  margin: 0;
}
.workspace--communication .workspace-metric:nth-child(1) {
  color: #00c950;
}
.workspace--communication .workspace-metric:nth-child(2) {
  color: #fee685;
}
.workspace--communication .workspace-metric:nth-child(3) {
  color: #51a2ff;
}
.workspace--communication .workspace-toolbar .workspace-search {
  max-width: 520px;
}
</style>

<style scoped>
.workspace-cards--credit {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
@media (max-width: 1300px) {
  .workspace-cards--credit {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 800px) {
  .workspace-cards--credit {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
