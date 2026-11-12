<template>
  <q-page class="audit-page">
    <title-page class="audit-heading"
      ><template #heading
        ><h1><span>Configurações › </span>Auditoria</h1>
        <p>Tudo o que foi feito no sistema: quem fez, quando e o que mudou</p></template
      ><template #actions
        ><q-btn
          outline
          dense
          no-caps
          label="Exportar"
          class="audit-export"
          :loading="exporting"
          :disable="
            Boolean(resource.state.error) || resource.state.loading || Boolean(pendingFilters)
          "
          @click="exportRows"
          ><img src="/icons/audit/export.svg" alt="" /></q-btn></template
    ></title-page>
    <div class="audit-content">
      <form-section
        :title="filters.resourceId ? 'Histórico do registro' : 'Registros'"
        caption="Criações, alterações, mudanças de status e exclusões, em todos os módulos"
      >
        <div class="audit-toolbar">
          <q-input
            :model-value="filters.search"
            outlined
            dense
            dark
            clearable
            debounce="350"
            maxlength="200"
            placeholder="Buscar por ID, cliente ou campo alterado..."
            aria-label="Buscar por ID, cliente ou campo alterado..."
            @update:model-value="changeFilters({ search: $event || '' })"
            ><template #prepend><img src="/icons/audit/search.svg" alt="" /></template
          ></q-input>
          <audit-filter-fields
            :model-value="filters"
            :modules="moduleOptions"
            :modules-loading="modulesLoading"
            :modules-error="modulesError"
            :customer="selectedCustomer"
            :customer-loading="customerLoading"
            @change="changeFilters"
            @modules="loadModules"
            @customer-resolved="onCustomerResolved"
          />
          <q-btn outline no-caps label="Mais Filtros" class="audit-more" @click="filtersOpen = true"
            ><img src="/icons/audit/filter.svg" alt=""
          /></q-btn>
        </div>
        <p v-if="customerError" role="alert" class="audit-error">{{ customerError }}</p>
        <p v-if="exportError" role="alert" class="audit-error">{{ exportError }}</p>
        <div v-if="resource.state.error" class="audit-error" role="alert">
          {{ resource.state.error }}
          <q-btn flat dense no-caps label="Tentar novamente" @click="load" />
        </div>
        <q-table
          v-else
          flat
          dense
          dark
          hide-pagination
          :rows="resource.state.data?.data || []"
          :columns="columns"
          row-key="id"
          :pagination="{ rowsPerPage: 0 }"
          :rows-per-page-options="[0]"
          :loading="resource.state.loading || Boolean(pendingFilters)"
          class="audit-table"
        >
          <template #body-cell-occurredAtUtc="p"
            ><q-td :props="p"
              ><span title="Horário UTC">{{ auditDate(p.row.occurredAtUtc) }}</span></q-td
            ></template
          >
          <template #body-cell-actorType="p"
            ><q-td :props="p"
              ><span :title="p.row.actorName || p.row.actorCustomerId || ''">{{
                auditActors.find((x) => x.value === p.row.actorType)?.label ||
                p.row.actorType ||
                '—'
              }}</span></q-td
            ></template
          >
          <template #body-cell-module="p"
            ><q-td :props="p">{{ auditModule(p.row.module) }}</q-td></template
          >
          <template #body-cell-resource="p"
            ><q-td :props="p"
              ><span :title="p.row.resourceId">{{
                auditRecord(p.row, metadata.get(recordKey(p.row)))
              }}</span></q-td
            ></template
          >
          <template #body-cell-action="p"
            ><q-td :props="p"
              ><span
                class="audit-badge"
                :class="'audit-badge--' + auditAction(p.row.action).tone"
                >{{ auditAction(p.row.action).label }}</span
              ></q-td
            ></template
          >
          <template #body-cell-changes="p"
            ><q-td :props="p"
              ><div v-if="p.row.field" class="audit-change">
                {{ auditField(p.row.field) }}:
                {{
                  auditValue(p.row.field, p.row.oldValue, metadata.get(recordKey(p.row))?.currency)
                }}
                →
                {{
                  auditValue(p.row.field, p.row.newValue, metadata.get(recordKey(p.row))?.currency)
                }}
              </div>
              <div v-else>{{ auditAction(p.row.action).label }} do registro</div>
              <small v-if="p.row.reason">Motivo: {{ p.row.reason }}</small></q-td
            ></template
          >
          <template #body-cell-open="p"
            ><q-td :props="p"
              ><q-btn
                v-if="auditTarget(p.row, filters)"
                flat
                round
                dense
                size="sm"
                class="audit-open"
                :aria-label="
                  'Abrir histórico de ' + auditRecord(p.row, metadata.get(recordKey(p.row)))
                "
                :disable="Boolean(pendingFilters) || !p.row.resourceId || !p.row.resourceType"
                :to="auditTarget(p.row, filters)"
                ><img src="/icons/audit/open.svg" alt="" /></q-btn></q-td
          ></template>
          <template #no-data
            ><div
              v-if="!resource.state.loading && !pendingFilters"
              class="full-width text-center q-pa-xl"
            >
              Nenhum registro encontrado.
            </div></template
          >
        </q-table>
        <entity-table-footer
          v-if="resource.state.data && !resource.state.error && page <= pages"
          variant="audit"
          :page="page"
          :page-size="10"
          :total-items="total"
          :total-pages="pages"
          :first-item="total ? (page - 1) * 10 + 1 : 0"
          :last-item="Math.min(page * 10, total)"
          :loading="resource.state.loading || Boolean(pendingFilters)"
          @page="changePage"
        />
      </form-section>
    </div>
    <q-dialog v-model="filtersOpen" position="right"
      ><q-card class="audit-filter-panel"
        ><title-card title="Filtros" /><q-card-section
          ><audit-filter-fields
            stacked
            :model-value="filters"
            :modules="moduleOptions"
            :modules-loading="modulesLoading"
            :modules-error="modulesError"
            :customer="selectedCustomer"
            :customer-loading="customerLoading"
            @change="changeFilters"
            @modules="loadModules"
            @customer-resolved="onCustomerResolved" /></q-card-section></q-card
    ></q-dialog>
  </q-page>
</template>
<script setup>
import { computed, onScopeDispose, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { LocalStorage } from 'quasar'
import { api, TOKEN_KEY, WORKSPACE_KEY } from 'src/boot/axios'
import TitlePage from 'src/components/TitlePage.vue'
import TitleCard from 'src/components/Card/TitleCard.vue'
import FormSection from 'src/components/Entity/FormSection.vue'
import EntityTableFooter from 'src/components/Entity/EntityTableFooter.vue'
import AuditFilterFields from 'src/components/Audit/AuditFilters.vue'
import { useFinanceResource } from 'src/composables/useFinanceResource'
import { financeGet } from 'src/services/financeService'
import { createRequestContext } from 'src/services/requestContext'
import { createAuditService } from 'src/services/auditService'
import {
  auditFilters,
  auditRouteQuery,
  auditActors,
  auditAction,
  auditModule,
  auditField,
  auditValue,
  auditDate,
  auditRecord,
  auditTarget,
} from 'src/services/auditModel'
const route = useRoute(),
  router = useRouter()
const context = createRequestContext(
  () => `${sessionOwner()}|${LocalStorage.getItem(WORKSPACE_KEY) || ''}`,
)
function sessionOwner() {
  const token = LocalStorage.getItem(TOKEN_KEY) || ''
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    return (
      String(
        payload.sub ||
          payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
          token,
      ) +
      ':' +
      String(payload.sid || payload.sessionId || '')
    )
  } catch {
    return token
  }
}
const resource = useFinanceResource(),
  filtersOpen = ref(false),
  exporting = ref(false),
  exportError = ref(''),
  metadata = reactive(new Map()),
  modules = ref([]),
  modulesLoading = ref(false),
  modulesError = ref(''),
  selectedCustomer = ref(null),
  customerLoading = ref(false),
  customerError = ref(''),
  pendingFilters = ref(null)
let revision = 0,
  modulesReady = false,
  navigationRevision = 0
const ownerActive = context.capture()
const assertCurrent = () => {
  if (!ownerActive()) throw new Error('Consulta encerrada.')
}
const service = createAuditService({
  read: financeGet,
  readCsv: async (path, params) => {
    const result = await api.get('/api/v1/' + path, {
      params,
      responseType: 'text',
      timeout: 30000,
    })
    return result.data
  },
  assertCurrent,
})
const filters = computed(() => pendingFilters.value || auditFilters(route.query))
const page = computed(() => Math.max(1, Number.parseInt(String(route.query.page || '1'), 10) || 1))
const total = computed(() => resource.state.data?.pagination?.totalItems || 0)
const pages = computed(() => resource.state.data?.pagination?.totalPages || 1)
const recordKey = (row) => row.resourceType + ':' + row.resourceId
const moduleOptions = computed(() =>
  [
    ...new Set(
      [
        ...modules.value,
        ...(resource.state.data?.data || []).map((r) => r.module),
        filters.value.module,
      ].filter(Boolean),
    ),
  ]
    .map((value) => ({ value, label: auditModule(value) }))
    .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR')),
)
const columns = [
  {
    name: 'occurredAtUtc',
    label: 'Data/Hora',
    field: 'occurredAtUtc',
    align: 'left',
    style: 'width:111px',
    headerStyle: 'width:111px',
  },
  {
    name: 'actorType',
    label: 'Autor',
    field: 'actorType',
    align: 'left',
    style: 'width:103px',
    headerStyle: 'width:103px',
  },
  {
    name: 'module',
    label: 'Módulo',
    field: 'module',
    align: 'left',
    style: 'width:124px',
    headerStyle: 'width:124px',
  },
  {
    name: 'resource',
    label: 'Registro',
    field: 'resourceId',
    align: 'left',
    style: 'width:17%',
    headerStyle: 'width:17%',
  },
  {
    name: 'customerName',
    label: 'Cliente',
    field: (r) => r.customerName || '—',
    align: 'left',
    style: 'width:12.35%',
    headerStyle: 'width:12.35%',
  },
  {
    name: 'action',
    label: 'Ação',
    field: 'action',
    align: 'left',
    style: 'width:154px',
    headerStyle: 'width:154px',
  },
  { name: 'changes', label: 'O que mudou', field: 'field', align: 'left' },
  {
    name: 'open',
    label: '',
    field: 'id',
    align: 'right',
    style: 'width:40px',
    headerStyle: 'width:40px',
  },
]
async function changeFilters(patch) {
  const next = { ...filters.value, ...patch }
  pendingFilters.value = next
  const navigation = ++navigationRevision
  if ('customer' in patch && patch.customer === route.query.customer)
    resolveCustomer(patch.customer, revision)
  try {
    await router.replace({ query: auditRouteQuery(next) })
  } finally {
    if (ownerActive() && navigation === navigationRevision) pendingFilters.value = null
  }
}
function changePage(value) {
  router.replace({ query: auditRouteQuery(filters.value, value) })
}
async function loadModules() {
  if (modulesLoading.value || modulesReady) return
  modulesLoading.value = true
  modulesError.value = ''
  try {
    const result = await service.modules()
    if (ownerActive()) {
      modules.value = result
      modulesReady = true
    }
  } catch {
    if (ownerActive())
      modulesError.value = 'Não foi possível consultar os módulos. Abra novamente para tentar.'
  } finally {
    if (ownerActive()) modulesLoading.value = false
  }
}
async function load() {
  const current = ++revision
  exportError.value = ''
  const snapshot = auditFilters(route.query)
  if (selectedCustomer.value?.customerId !== snapshot.customer) selectedCustomer.value = null
  resolveCustomer(snapshot.customer, current)
  const result = await resource.load(() => service.list(snapshot, page.value))
  if (!ownerActive() || current !== revision || !result) return
  if (page.value > pages.value) {
    changePage(pages.value)
    return
  }
  for (const row of result.data) {
    const key = recordKey(row)
    if (metadata.has(key)) continue
    metadata.set(key, null)
    service
      .metadata(row)
      .then((value) => {
        if (ownerActive()) {
          if (value) metadata.set(key, value)
          else metadata.delete(key)
        }
      })
      .catch(() => {})
  }
}
async function resolveCustomer(customerId, current) {
  customerLoading.value = Boolean(customerId)
  customerError.value = ''
  if (customerId) {
    try {
      const response = await financeGet('admin/customers/' + customerId + '/header')
      if (ownerActive() && current === revision)
        selectedCustomer.value = {
          customerId,
          displayName:
            response.data.primaryName ||
            response.data.displayName ||
            response.data.name ||
            response.data.legalName ||
            '',
        }
    } catch {
      if (ownerActive() && current === revision && !selectedCustomer.value?.displayName)
        customerError.value =
          'Não foi possível consultar o nome do cliente. Pesquise e selecione o cliente novamente.'
    } finally {
      if (ownerActive() && current === revision) customerLoading.value = false
    }
  }
}
function onCustomerResolved(option) {
  if (!ownerActive() || option.customerId !== filters.value.customer || !option.displayName) return
  if (
    selectedCustomer.value?.customerId !== option.customerId ||
    selectedCustomer.value?.displayName !== option.displayName
  )
    selectedCustomer.value = option
  customerError.value = ''
}
async function exportRows() {
  if (exporting.value) return
  exporting.value = true
  exportError.value = ''
  try {
    const text = await service.export({ ...filters.value })
    if (!ownerActive()) return
    const url = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'auditoria-' + new Date().toISOString().slice(0, 10) + '.csv'
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  } catch {
    if (ownerActive()) exportError.value = 'Não foi possível exportar a auditoria. Tente novamente.'
  } finally {
    if (ownerActive()) exporting.value = false
  }
}
watch(() => route.fullPath, load, { immediate: true })
onScopeDispose(() => {
  context.dispose()
  revision++
  metadata.clear()
  resource.reset()
})
</script>
<style scoped>
.audit-page {
  color: #fff;
  min-width: 0;
  font-family: Inter, sans-serif;
}
.audit-heading {
  background: #ffffff0a;
  border-bottom: 1px solid #ffffff1f;
  padding: 16px 24px;
}
.audit-heading :deep(.col-12.q-pa-md) {
  padding: 0;
}
h1 {
  font:
    700 20px/28px Inter,
    sans-serif;
  margin: 0;
}
h1 span {
  color: #ffffffa3;
}
.audit-heading p {
  color: #ffffffb8;
  font-size: 12px;
  line-height: 16px;
  margin: 0;
}
.audit-export {
  border-radius: 8px;
  height: 32px;
  min-width: 114px;
  color: #ffffffb8;
  font-size: 14px;
  background: #ffffff0f;
}
.audit-export :deep(.q-btn__content) {
  flex-direction: row-reverse;
  gap: 8px;
}
.audit-export:before {
  border-color: #ffffff33;
}
.audit-export img,
.audit-toolbar img,
.audit-table img {
  width: 16px;
  height: 16px;
}
.audit-content {
  padding: 24px;
  max-width: 1600px;
  margin: auto;
}
.audit-content :deep(.form-section) {
  padding: 0;
}
.audit-content :deep(.form-section__title) {
  font:
    700 18px/28px Inter,
    sans-serif;
  letter-spacing: 0;
}
.audit-content :deep(.form-section__caption) {
  color: #ffffffb8;
  margin-top: 2px;
  line-height: 16px;
}
.audit-toolbar {
  display: grid;
  grid-template-columns: minmax(220px, 1fr) 754px 141.2px;
  gap: 12px;
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid #ffffff33;
  border-radius: 10px;
  background: #ffffff0f;
}
.audit-toolbar > :deep(.q-field__control) {
  min-height: 36px;
  height: 36px;
}
.audit-toolbar > .q-field :deep(.q-field__control) {
  height: 36px;
  min-height: 36px;
  border-radius: 8px;
  background: linear-gradient(87deg, #ffffff1f, #ffffff0d, #ffffff1a);
}
.audit-toolbar > .q-field :deep(.q-field__marginal) {
  height: 36px;
}
.audit-toolbar > .q-field :deep(.q-field__native) {
  color: #ffffffb8;
  font-size: 14px;
}
.audit-more {
  border-radius: 8px;
  font-size: 14px;
  background: #ffffff0f;
  min-height: 36px;
}
.audit-more :deep(.q-btn__content) {
  flex-direction: row-reverse;
  gap: 8px;
}
.audit-more:before {
  border-color: #ffffff1f;
}
.audit-table {
  background: #ffffff0f;
  border: 1px solid #ffffff33;
  border-radius: 14px;
  box-shadow: 4px 4px 12px #00000021;
  backdrop-filter: blur(20px);
}
.audit-table :deep(table) {
  table-layout: fixed;
  min-width: 1100px;
}
.audit-table :deep(th) {
  background: #ffffff0f;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  height: 40px;
  padding: 8px;
  border-color: #ffffff33;
}
.audit-table :deep(td) {
  color: #ffffffb8;
  font-size: 12px;
  line-height: 16px;
  height: 56px;
  padding: 12px 8px;
  white-space: normal;
  overflow-wrap: anywhere;
  border-color: #ffffff1a;
}
.audit-table :deep(td:first-child) {
  white-space: nowrap;
  padding-right: 0;
}
.audit-table :deep(td:nth-child(3)),
.audit-table :deep(td:nth-child(5)) {
  font-weight: 500;
}
.audit-open {
  width: 32px;
  height: 32px;
}
.audit-table :deep(td:last-child) {
  padding-left: 0;
  padding-right: 8px;
}
.audit-table small {
  display: block;
  margin-top: 2px;
  font-size: 11px;
}
.audit-change {
  white-space: pre-wrap;
}
.audit-badge {
  display: inline-block;
  border: 0.8px solid;
  border-radius: 8px;
  padding: 3px 9px;
  font-size: 10px;
  line-height: 14.286px;
  font-weight: 500;
  letter-spacing: 0.25px;
  text-transform: uppercase;
  white-space: nowrap;
}
.audit-badge--created {
  color: #74ffa0;
  background: rgba(0, 122, 85, 0.2);
  border-color: #74ffa0;
}
.audit-badge--updated {
  color: #a8e5ff;
  background: rgba(0, 163, 255, 0.16);
  border-color: #a8e5ff;
}
.audit-badge--status {
  color: #fee685;
  background: rgba(187, 77, 0, 0.2);
  border-color: #fee685;
}
.audit-badge--deleted {
  color: #ffc9c9;
  background: rgba(193, 0, 7, 0.2);
  border-color: #ffc9c9;
}
.audit-badge--unknown {
  color: #fff;
  border-color: #ffffff55;
}
.audit-error {
  padding: 16px;
  border: 1px solid #ffffff33;
  border-radius: 10px;
  margin: 16px 0;
}
.audit-filter-panel {
  width: 360px;
  max-width: calc(100vw - 32px);
  background: #242a3b;
  color: #fff;
}
@media (max-width: 1550px) {
  .audit-toolbar {
    grid-template-columns: minmax(0, 1fr) auto;
  }
  .audit-toolbar > .audit-filters {
    grid-row: 2;
    grid-column: 1 / -1;
  }
}
@media (max-width: 599px) {
  .audit-heading {
    padding: 16px;
  }
  .audit-heading :deep(.title-page-heading-row) {
    flex-wrap: wrap;
  }
  .audit-content {
    padding: 16px;
  }
  .audit-toolbar {
    grid-template-columns: minmax(0, 1fr);
  }
  .audit-toolbar > .audit-filters {
    grid-row: auto;
    grid-column: auto;
  }
}
</style>
