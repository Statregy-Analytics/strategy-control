<template>
  <q-page class="workspace">
    <logic-workspace
      v-if="editor && module === 'logic'"
      :key="editor"
      :record-id="recordId"
      @close="closeEditor"
    />
    <publication-workspace
      v-else-if="editor && module === 'communication'"
      :key="editor"
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
          @click="create"
          ><workspace-icon name="plus"
        /></q-btn>
      </header>
      <main class="workspace-main">
        <div v-if="module === 'communication'" class="workspace-tabs">
          <q-btn-toggle
            v-model="tab"
            no-caps
            :options="
              module === 'credit'
                ? [
                    { label: 'Operações', value: 'main' },
                    { label: 'Parceiros', value: 'partners' },
                  ]
                : [
                    { label: 'Conteúdos', value: 'main' },
                    { label: 'Redatores', value: 'authors' },
                  ]
            "
          />
        </div>
        <div v-if="tab === 'main' || module === 'credit'" class="workspace-metrics">
          <div v-for="(metric, i) in metrics" :key="metric.label" class="workspace-metric">
            <small>{{ metric.label }}</small
            ><workspace-icon :name="metricIcons[i % metricIcons.length]" />
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
        <div class="workspace-toolbar">
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
            v-model="status"
            :options="statusOptions"
            placeholder="Status"
            aria-label="Status"
            :disable="module === 'logic' || tab !== 'main'"
            clearable
          /><glass-select
            v-if="module === 'communication'"
            v-model="kindFilter"
            :options="contentTypes"
            placeholder="Tipo"
            disable
            aria-label="Tipo"
          /><glass-select
            v-if="module === 'communication'"
            v-model="authorFilter"
            :options="[]"
            placeholder="Redator"
            aria-label="Redator"
            disable
          /><glass-select
            v-if="module === 'logic'"
            v-model="linksFilter"
            :options="[]"
            placeholder="Vínculos: Todos"
            aria-label="Vínculos"
            disable
          /><glass-select
            v-if="module === 'logic'"
            v-model="sort"
            :options="[
              { label: 'A–Z', value: 'az' },
              { label: 'Mais recente', value: 'recent' },
            ]"
            aria-label="Ordenar por"
          /><template v-if="module === 'credit'"
            ><q-btn-toggle
              v-if="tab === 'main'"
              v-model="view"
              no-caps
              :options="viewOptions" /><q-btn
              outline
              no-caps
              :label="tab === 'partners' ? 'Criar Parceiro' : 'Nova Operação'"
              @click="create"
              ><workspace-icon name="plus" /></q-btn
          ></template>
        </div>
        <q-banner v-if="error" class="workspace-error" role="alert">{{ error }}</q-banner>
        <supporting-directory v-if="tab !== 'main'" :kind="tab" @edit="editDirectory" />
        <resource-state v-else :state="resource.state" @retry="load">
          <div v-if="module === 'credit'" class="workspace-tabs">
            <q-btn-toggle
              v-model="creditGroup"
              no-caps
              :options="[
                { label: 'Operações em Aberto', value: 'open' },
                { label: 'Operações Finalizadas', value: 'closed' },
                { label: 'Operações Canceladas/Recusadas', value: 'cancelled' },
              ]"
            />
          </div>
          <div v-if="view === 'kanban'" class="workspace-kanban">
            <section v-for="stage in creditStages" :key="stage" class="workspace-record">
              <h2>{{ stage }}</h2>
              <p class="workspace-muted">Indisponível</p>
            </section>
          </div>
          <div v-else-if="view === 'cards'" class="workspace-cards">
            <article v-for="row in pageRows" :key="row.id" class="workspace-record">
              <div class="workspace-record-head">
                <div>
                  <h2>
                    <workspace-icon :name="module === 'logic' ? 'chart-pie' : 'file-text'" />
                    {{ row.name || row.title || row.client?.displayName || row.publicCode }}
                  </h2>
                  <small>{{ row.code || row.publicCode }}</small>
                  <q-badge outline>{{ workspaceStatus(row.status) }}</q-badge>
                </div>
                <row-actions dark :actions="recordActions" @select="openRow(row, $event)" />
              </div>
              <dl v-if="module === 'logic'">
                <div v-for="label in logicCardLabels" :key="label">
                  <dt>{{ label }}</dt>
                  <dd>Indisponível</dd>
                </div>
              </dl>
              <dl v-else>
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
            ><template #body-cell-actions="p"
              ><q-td :props="p"
                ><row-actions
                  dark
                  :actions="recordActions"
                  @select="openRow(p.row, $event)" /></q-td></template
          ></q-table>
        </resource-state>
      </main>
    </template>
    <q-dialog v-model="typeOpen"
      ><q-card class="workspace-modal"
        ><h2>{{ module === 'credit' ? 'Nova Operação de Crédito' : 'Criar Novo Conteúdo' }}</h2>
        <p>
          {{
            module === 'credit'
              ? 'Selecione o tipo de operação de crédito que deseja criar'
              : 'Selecione o tipo de conteúdo que deseja criar'
          }}
        </p>
        <button
          v-for="type in module === 'credit' ? creditTypes : contentTypes"
          :key="type"
          class="workspace-choice"
          :aria-pressed="selectedType === type"
          @click="selectedType = type"
        >
          {{ type }}
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
import { computed, ref, watch, onScopeDispose } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ResourceState from 'src/components/Finance/ResourceState.vue'
import RowActions from 'src/components/Entity/RowActions.vue'
import GlassSelect from 'src/components/Entity/GlassSelect.vue'
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
  logicStatuses,
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
  linksFilter = ref(null),
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
  filterWorkspace(resource.state.data || [], {
    search: search.value,
    status: status.value,
    sort: sort.value,
  }).filter((r) => {
    if (props.module !== 'credit') return true
    const closed = ['Settled', 'Closed'],
      cancelled = ['Cancelled', 'Canceled', 'Rejected']
    return creditGroup.value === 'closed'
      ? closed.includes(r.status)
      : creditGroup.value === 'cancelled'
        ? cancelled.includes(r.status)
        : ![...closed, ...cancelled].includes(r.status)
  }),
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
    : props.module === 'logic'
      ? logicStatuses.map((label) => ({ label, value: label }))
      : [...new Set((resource.state.data || []).map((r) => r.status).filter(Boolean))].map(
          (value) => ({ label: workspaceStatus(value), value }),
        ),
)
const viewOptions = computed(() => [
  { label: 'Lista', value: 'list' },
  { label: 'Cards', value: 'cards' },
  ...(props.module === 'credit' ? [{ label: 'Kanban', value: 'kanban' }] : []),
])
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
const logicCardLabels = [
  'Índice Atual',
  'Alvo do Ciclo',
  'Final Obrigatório',
  'Papéis/Contratos',
  'Ciclo Atual',
  'Performance do Ciclo Atual',
  'Próxima Atualização',
]
const creditStages = ['Iniciada', 'Pendente', 'Pré-proposta', 'Documentação', 'Proposta Final']
const recordActions = [
  { name: 'open', label: 'Abrir', icon: 'visibility' },
  { name: 'edit', label: 'Editar', icon: 'edit' },
]
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
          ['client', 'Cliente', (r) => r.client?.displayName || '—'],
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
  if (tab.value === 'authors') authorOpen.value = true
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
  } else router.push({ query: { editor: action === 'edit' ? 'edit' : 'open', id: row.id } })
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
watch(
  () => props.module,
  () => {
    tab.value = 'main'
    search.value = ''
    status.value = null
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
.workspace-kanban {
  display: grid;
  grid-template-columns: repeat(5, minmax(230px, 1fr));
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
