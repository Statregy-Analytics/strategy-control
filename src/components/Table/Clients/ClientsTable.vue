<template>
  <div class="ClientsTable">
    <div class="clients-toolbar">
      <q-input
        v-model="search"
        outlined
        dark
        clearable
        debounce="400"
        class="clients-search"
        placeholder="Buscar cliente por nome, documento, e-mail, ID ou assessor"
        aria-label="Buscar cliente por nome, documento, e-mail, ID ou assessor"
        @update:model-value="reload"
      >
        <template #prepend
          ><img src="/icons/client-selection/search.svg" alt="" width="16" height="16"
        /></template>
      </q-input>
      <div class="clients-toolbar__bottom">
        <div class="clients-filters">
          <span class="clients-filters__label"
            ><img
              src="/icons/client-selection/filter.svg"
              alt=""
              width="16"
              height="16"
            />Filtros:</span
          >
          <customer-filter-select
            v-model="status"
            :options="customerStatusOptions"
            placeholder="Status"
            aria-label="Filtrar por status"
            @update:model-value="reload"
          />
          <customer-filter-select
            v-model="classification"
            :options="classificationOptions"
            placeholder="Classificação"
            clearable
            aria-label="Filtrar por classificação"
            @update:model-value="reload"
          />
          <customer-filter-select
            v-model="compliance"
            :options="complianceOptions"
            placeholder="Compliance"
            clearable
            aria-label="Filtrar por compliance"
            @update:model-value="reload"
          />
          <customer-filter-select
            v-model="level"
            :options="levelOptions"
            placeholder="Nível Doc."
            clearable
            aria-label="Filtrar por nível documental"
            @update:model-value="reload"
          />
        </div>
        <div class="clients-view-controls">
          <div class="clients-view-toggle">
            <q-btn
              flat
              dense
              :class="{ selected: viewMode === 'table' }"
              aria-label="Visualizar clientes em lista"
              :aria-pressed="viewMode === 'table'"
              @click="changeViewMode('table')"
              ><img src="/icons/client-selection/layout-list.svg" alt="" width="16" height="16"
            /></q-btn>
            <q-btn
              flat
              dense
              :class="{ selected: viewMode === 'cards' }"
              aria-label="Visualizar clientes em grade"
              :aria-pressed="viewMode === 'cards'"
              @click="changeViewMode('cards')"
              ><img src="/icons/client-selection/layout-grid.svg" alt="" width="16" height="16"
            /></q-btn>
          </div>
          <customer-filter-select
            v-model="sortDirection"
            :options="sortOptions"
            prefix="Ordenar por:"
            aria-label="Ordenar clientes"
            @update:model-value="reload"
          />
        </div>
      </div>
    </div>
    <resource-state
      :state="{ loading: false, error: listResource.state.error }"
      @retry="reloadCurrentPage"
    >
      <div v-if="loading" class="row justify-center q-pa-xl" aria-label="Carregando clientes">
        <q-spinner color="primary" size="36px" />
      </div>
      <template v-else>
        <div class="clients-result-count" aria-live="polite">
          Exibindo {{ pagination.totalItems }}
          {{ pagination.totalItems === 1 ? 'cliente' : 'clientes' }}
        </div>
        <p v-if="!data.length" class="text-center text-grey-5 q-pa-xl">
          Nenhum cliente encontrado.
        </p>
        <q-table
          v-else-if="viewMode === 'table'"
          v-model:pagination="tablePagination"
          flat
          hide-pagination
          class="customer-list"
          row-key="customerId"
          :rows="data"
          :columns="columns"
          @request="onRequest"
        >
          <template #body-cell-customer="props"
            ><q-td :props="props"
              ><button class="customer-list__identity" @click="openCustomer(customerId(props.row))">
                <span class="customer-avatar"
                  ><img :src="avatarIcon(props.row, 'list')" alt="" width="20" height="20" /></span
                ><span
                  ><strong>{{ customerName(props.row) }}</strong
                  ><small class="customer-id"
                    >ID: {{ customerId(props.row)?.slice(0, 8) }}</small
                  ></span
                >
              </button></q-td
            ></template
          >
          <template #body-cell-advisor="props">
            <q-td :props="props" :class="{ 'customer-advisor--empty': !props.row.advisorName }">
              {{ props.row.advisorName || 'Sem assessor' }}
            </q-td>
          </template>
          <template #body-cell-classification="props"
            ><q-td :props="props"
              ><customer-indicators
                type="classification"
                :value="props.row.documentClassification" /></q-td
          ></template>
          <template #body-cell-status="props"
            ><q-td :props="props"
              ><div class="customer-list__status">
                <customer-indicators type="status" :value="props.row.status" /><customer-indicators
                  type="compliance"
                  plain
                  prefix="Compliance "
                  :value="props.row.complianceStatus"
                /></div></q-td
          ></template>
          <template #body-cell-level="props"
            ><q-td :props="props"
              ><customer-indicators type="level" :value="props.row.documentLevel" /></q-td
          ></template>
          <template #body-cell-dates="props"
            ><q-td :props="props"
              ><div class="customer-list__dates">
                <span>ÚLTIMO ACESSO</span>
                <strong>{{ formatDateTime(props.row.lastAccessAtUtc) }}</strong>
                <span>CLIENTE DESDE</span>
                <strong>{{ formatDate(props.row.customerSince || props.row.createdAtUtc) }}</strong>
              </div></q-td
            ></template
          >
          <template #body-cell-open="props"
            ><q-td :props="props"
              ><q-btn
                flat
                round
                dense
                :aria-label="`Abrir perfil de ${customerName(props.row)}`"
                @click="openCustomer(customerId(props.row))"
                ><img
                  src="/icons/client-selection/arrow-list.svg"
                  alt=""
                  width="16"
                  height="16" /></q-btn></q-td
          ></template>
        </q-table>
        <div v-else class="customer-grid">
          <button
            v-for="customer in data"
            :key="customerId(customer)"
            class="customer-card"
            @click="openCustomer(customerId(customer))"
          >
            <div class="customer-card__identity">
              <span class="customer-avatar"
                ><img :src="avatarIcon(customer, 'card')" alt="" width="28" height="28"
              /></span>
              <div class="customer-card__heading">
                <div class="customer-card__badges">
                  <span
                    class="customer-kind"
                    :class="{ 'customer-kind--organization': isOrganization(customer) }"
                    >{{ isOrganization(customer) ? 'Pessoa Jurídica' : 'Pessoa Física' }}</span
                  ><customer-indicators type="status" :value="customer.status" />
                </div>
                <strong class="customer-card__name">{{ customerName(customer) }}</strong
                ><span class="customer-card__document">{{
                  customerMaskedDocument(customer.maskedDocument)
                }}</span>
              </div>
              <img
                class="customer-card__arrow"
                src="/icons/client-selection/arrow-card.svg"
                alt=""
                width="20"
                height="20"
              />
            </div>
            <div class="customer-card__facts">
              <div>
                <span>ASSESSOR</span
                ><strong :class="{ 'customer-advisor--empty': !customer.advisorName }">{{
                  customer.advisorName || 'Sem assessor'
                }}</strong>
              </div>
              <div>
                <span>ÚLTIMO ACESSO</span
                ><strong>{{ formatDateTime(customer.lastAccessAtUtc) }}</strong>
              </div>
            </div>
            <div class="customer-card__metrics">
              <div>
                <span>CLASSIFICAÇÃO</span
                ><customer-indicators
                  type="classification"
                  :value="customer.documentClassification"
                />
              </div>
              <div>
                <span>COMPLIANCE</span
                ><customer-indicators type="compliance" :value="customer.complianceStatus" />
              </div>
              <div>
                <span>NÍVEL DOC.</span
                ><customer-indicators type="level" :value="customer.documentLevel" />
              </div>
            </div>
            <div class="customer-card__footer">
              <img src="/icons/client-selection/clock.svg" alt="" width="14" height="14" />Cliente
              desde {{ formatDate(customer.customerSince || customer.createdAtUtc) }}
            </div>
          </button>
        </div>
        <entity-table-footer
          variant="customer-selection"
          :page="pagination.page"
          :page-size="pagination.pageSize"
          :total-items="pagination.totalItems"
          :total-pages="pagination.totalPages"
          :first-item="firstItemIndex"
          :last-item="lastItemIndex"
          @page="changePage"
        />
      </template>
    </resource-state>
  </div>
</template>
<script setup>
import { computed, onMounted, onScopeDispose, ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useClientStore } from 'src/stores/client'
import EntityTableFooter from 'src/components/Entity/EntityTableFooter.vue'
import CustomerFilterSelect from 'src/components/Entity/CustomerFilterSelect.vue'
import CustomerIndicators from 'src/components/Clients/CustomerIndicators.vue'
import { listCustomerCards } from 'src/services/customerService'
import {
  customerStatusOptions,
  customerComplianceOptions,
  customerMaskedDocument,
  customerDisplayName,
  readCustomerSelection,
} from 'src/services/customerPresentation'
import { useFinanceResource } from 'src/composables/useFinanceResource'
import ResourceState from 'src/components/Finance/ResourceState.vue'
const store = useClientStore(),
  router = useRouter()
const { data, pagination } = storeToRefs(store)
const listResource = useFinanceResource()
const loading = computed(() => listResource.state.loading)
let active = true,
  loadRevision = 0
onScopeDispose(() => {
  active = false
  loadRevision++
  listResource.reset()
})
const search = ref(''),
  status = ref(null),
  classification = ref(null),
  compliance = ref(null),
  level = ref(null),
  sortDirection = ref('asc'),
  viewMode = ref('cards')
// The classification is supplied by the API; never substitute risk or invent a level.
const classificationOptions = ref([])
const complianceOptions = customerComplianceOptions
const levelOptions = [0, 1, 2, 3].map((value) => ({ label: `Nível ${value}`, value }))
const sortOptions = [
  { label: 'A-Z', value: 'asc' },
  { label: 'Z-A', value: 'desc' },
]
const tablePagination = computed({
  get: () => ({
    page: pagination.value.page,
    rowsPerPage: pagination.value.pageSize,
    rowsNumber: pagination.value.totalItems,
  }),
  set: () => {},
})
const columns = [
  { name: 'customer', label: 'Cliente / ID', field: 'displayName', align: 'left' },
  {
    name: 'classification',
    label: 'Classificação',
    field: 'documentClassification',
    align: 'left',
  },
  {
    name: 'advisor',
    label: 'Assessor',
    field: (row) => row.advisorName || 'Sem assessor',
    align: 'left',
  },
  { name: 'status', label: 'Status / Compliance', field: 'status', align: 'left' },
  { name: 'level', label: 'Nível Doc.', field: 'documentLevel', align: 'left' },
  { name: 'dates', label: 'Datas', field: 'customerSince', align: 'left' },
  { name: 'open', label: '', field: 'customerId', align: 'right' },
]
const load = async (params = {}) => {
  if (!active) return
  const revision = ++loadRevision
  const filters = {
    inactive: status.value === 'Inactive',
    classification: classification.value,
    compliance: compliance.value,
    level: level.value,
  }
  const query = {
    page: params.page ?? pagination.value.page,
    pageSize: params.pageSize ?? pagination.value.pageSize,
    search: search.value.trim() || undefined,
    status: filters.inactive ? undefined : status.value || undefined,
    sortBy: 'name',
    sortDirection: sortDirection.value,
  }
  store.data = []
  const response = await listResource.load(() =>
    readCustomerSelection(
      listCustomerCards,
      query,
      filters,
      () => active && revision === loadRevision,
    ),
  )
  if (!active || revision !== loadRevision || response === undefined) return
  store.data = response.data || []
  store.pagination = { ...store.pagination, ...(response.pagination || {}) }
  classificationOptions.value = [
    ...new Set([...classificationOptions.value, ...(response.classifications || [])]),
  ].sort()
}
const onRequest = ({ pagination: requested }) =>
  load({ page: requested.page, pageSize: requested.rowsPerPage })
const reload = () => load({ page: 1 })
const changePage = (page) => load({ page })
const reloadCurrentPage = () => load()
const changeViewMode = (mode) => {
  if (viewMode.value === mode) return
  viewMode.value = mode
  return reload()
}
const customerId = (row) => row.customerId || row.id
const customerName = (row) => customerDisplayName(row.displayName || row.primaryName)
const isOrganization = (row) => (row.customerKind || row.kind) === 'Organization'
const avatarIcon = (row, mode) =>
  `/icons/client-selection/${isOrganization(row) ? 'business' : 'person'}-${mode}.svg`
const openCustomer = (id) => router.push({ name: 'ClienteDetalhe', params: { id } })
const formatDate = (value) => {
  if (!value) return '—'
  const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00` : value)
  return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat('pt-BR').format(date)
}
const formatDateTime = (value) => {
  const date = value ? new Date(value) : null
  return date && !Number.isNaN(date.getTime())
    ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(date)
    : 'Não informado'
}
const firstItemIndex = computed(() =>
  pagination.value.totalItems ? (pagination.value.page - 1) * pagination.value.pageSize + 1 : 0,
)
const lastItemIndex = computed(() =>
  Math.min(pagination.value.page * pagination.value.pageSize, pagination.value.totalItems),
)
onMounted(load)
</script>
<style scoped>
.ClientsTable {
  padding: 0 56px 32px;
  color: #fff;
}
.clients-toolbar {
  padding: 16px 0 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}
.clients-search {
  width: min(672px, 100%);
}
.clients-search :deep(.q-field__control) {
  height: 44px;
  min-height: 44px;
}
.clients-toolbar__bottom,
.clients-filters,
.clients-view-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}
.clients-toolbar__bottom {
  justify-content: space-between;
  flex-wrap: wrap;
  margin-top: 20px;
  gap: 16px;
}
.clients-filters {
  flex-wrap: wrap;
}
.clients-filters__label {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}
.clients-filters .q-select {
  width: 140px;
}
.clients-view-controls > .q-select {
  width: 170px;
}
.clients-toolbar :deep(.q-field__control) {
  border-radius: 8px;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.12),
    rgba(255, 255, 255, 0.05),
    rgba(255, 255, 255, 0.1)
  );
}
.clients-toolbar :deep(.q-field--dense .q-field__control) {
  min-height: 36px;
  height: 36px;
}
.clients-filters :deep(.q-field__control:before) {
  border-color: rgba(255, 255, 255, 0.34);
}
.clients-filters :deep(.q-field__control-container),
.clients-filters :deep(.q-field__native),
.clients-filters :deep(.q-field__marginal) {
  min-height: 36px;
  height: 36px;
  align-items: center;
}
.clients-toolbar :deep(.q-field__native),
.clients-toolbar :deep(.q-field__prefix),
.clients-toolbar :deep(.q-field__label) {
  font-size: 12px;
}
.clients-toolbar :deep(.q-select__dropdown-icon) {
  width: 16px;
  height: 16px;
  font-size: 16px;
}
.clients-search :deep(.q-field__native) {
  font-size: 14px;
}
.clients-view-toggle {
  display: flex;
  padding: 3px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
}
.clients-view-toggle .q-btn {
  width: 32px;
  min-height: 28px;
  border-radius: 5px;
  opacity: 0.5;
}
.clients-view-toggle .q-btn.selected {
  opacity: 1;
  background: rgba(255, 255, 255, 0.12);
}
.clients-result-count {
  padding: 24px 0 16px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
}
.customer-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
}
.customer-card {
  width: 100%;
  min-width: 0;
  padding: 24px;
  text-align: left;
  font: inherit;
  color: inherit;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.01)),
    linear-gradient(120deg, rgba(6, 9, 18, 0.48), rgba(9, 24, 39, 0.28));
  box-shadow: 4px 4px 12px rgba(0, 0, 0, 0.24);
  backdrop-filter: blur(20px);
  cursor: pointer;
}
.customer-card:hover {
  border-color: rgba(255, 255, 255, 0.4);
}
.customer-card:focus-visible,
.customer-list__identity:focus-visible {
  outline: 2px solid #00a3ff;
  outline-offset: 3px;
}
.customer-card__identity {
  display: flex;
  gap: 16px;
  align-items: center;
}
.customer-avatar {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  width: 64px;
  height: 64px;
  border: 0.8px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.08),
    rgba(255, 255, 255, 0.03),
    rgba(255, 255, 255, 0.07)
  );
}
.customer-card__heading {
  min-width: 0;
  flex: 1;
}
.customer-card__badges {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  align-items: center;
}
.customer-kind {
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  padding: 2px 6px;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.72);
}
.customer-card__name {
  display: block;
  margin-top: 6px;
  font-size: 18px;
  line-height: 28px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 600;
}
.customer-card__document {
  display: block;
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
}
.customer-card__arrow {
  flex: none;
}
.customer-card__facts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 20px;
}
.customer-card__facts > div {
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.08),
    rgba(255, 255, 255, 0.03),
    rgba(255, 255, 255, 0.07)
  );
}
.customer-card__facts span,
.customer-card__metrics > div > span:first-child {
  display: block;
  margin-bottom: 6px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 10px;
  letter-spacing: 0.3px;
}
.customer-card__facts strong {
  display: block;
  overflow-wrap: anywhere;
  font-size: 12px;
  font-weight: 500;
}
.customer-card__metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 16px;
}
.customer-card__footer {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
}
.customer-list {
  color: inherit;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
}
.customer-list :deep(th) {
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  font-size: 12px;
  height: 44px;
}
.customer-list :deep(td) {
  height: 100px;
  font-size: 12px;
}
.customer-list :deep(th),
.customer-list :deep(td) {
  padding: 16px;
  border-color: rgba(255, 255, 255, 0.08);
}
.customer-list__identity {
  display: flex;
  gap: 12px;
  align-items: center;
  text-align: left;
  background: none;
  border: 0;
  color: inherit;
  cursor: pointer;
  padding: 0;
}
.customer-list__identity .customer-avatar {
  width: 40px;
  height: 40px;
}
.customer-list__identity strong {
  display: block;
  max-width: 240px;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 14px;
}
.customer-id {
  display: inline-block;
  margin-top: 6px;
  padding: 2px 6px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 4px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 10px;
}
.customer-list__status {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 202px;
}
.customer-list__dates {
  display: grid;
  gap: 4px;
}
.customer-list__dates span {
  color: rgba(255, 255, 255, 0.6);
  font-size: 10px;
  letter-spacing: 0.3px;
}
.customer-list__dates strong {
  color: #fff;
  font-size: 12px;
  font-weight: 500;
}
.customer-list__dates strong + span {
  margin-top: 8px;
}
.customer-list__status :deep(.customer-badge--status) {
  width: 100%;
  height: 20px;
  padding: 0 8px;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.08),
    rgba(255, 255, 255, 0.03),
    rgba(255, 255, 255, 0.07)
  );
}
.customer-list__status :deep(.customer-badge--status.customer-badge--blocked) {
  color: #ff2e36;
  border-color: #ff2e36;
}
.customer-list__status :deep(.customer-compliance--plain) {
  color: #fff;
  justify-content: flex-start;
}
.customer-advisor--empty {
  color: rgba(255, 255, 255, 0.6);
  font-style: italic;
}
.customer-kind--organization {
  background: rgba(255, 255, 255, 0.16);
  color: #fff;
  border-color: rgba(255, 255, 255, 0.4);
}
.customer-avatar::before {
  content: '';
  position: absolute;
  width: 60px;
  height: 60px;
  border: 0.8px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  pointer-events: none;
}
.customer-list__identity .customer-avatar::before {
  width: 38px;
  height: 38px;
}
@media (max-width: 1200px) {
  .ClientsTable {
    padding: 0 24px 24px;
  }
}
@media (max-width: 800px) {
  .customer-grid {
    grid-template-columns: 1fr;
  }
  .ClientsTable {
    padding: 0 16px 24px;
  }
  .clients-filters {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    width: 100%;
  }
  .clients-filters__label {
    grid-column: 1/-1;
  }
  .clients-filters .q-select {
    width: 100%;
  }
  .customer-card {
    padding: 16px;
  }
}
</style>
