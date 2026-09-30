<template>
  <div class="ClientsTable">
    <div class="clients-toolbar q-mb-md">
      <div class="row items-center q-col-gutter-sm">
        <div class="col-12 col-md-6">
          <q-input v-model="search" dense outlined dark debounce="400" clearable placeholder="Buscar cliente por nome, documento, e-mail, ID ou assessor" aria-label="Pesquisar clientes" @update:model-value="reload">
            <template #prepend><q-icon name="search" size="1.2rem" /></template>
          </q-input>
        </div>
        <div class="col-12 col-lg-6 row justify-end items-center q-gutter-xs clients-toolbar__actions">
          <q-btn color="white" no-caps label="Exportar" flat size="sm" @click="exportTable" />
          <q-btn size="sm" padding="xs sm" no-caps outline label="Comparar Clientes" :disable="selected.length < 2"
            :class="selected.length < 2 ? 'text-muted' : 'text-primary'" @click="compareSelected" />
          <q-btn flat dense no-caps color="white" icon="tune" :label="filterButtonLabel" aria-label="Mostrar filtros e ordenação" @click="filtersOpen = !filtersOpen" />
          <q-btn size="md" padding="xs" outline :color="viewMode === 'cards' ? 'primary' : 'grey-7'" :icon="$filtersString.resolveUrl('img:icons/layout-cards.svg')"
            aria-label="Visualizar clientes em cartões" @click="changeViewMode('cards')" />
          <q-btn size="md" padding="xs" outline :color="viewMode === 'table' ? 'primary' : 'grey-7'" :icon="$filtersString.resolveUrl('img:icons/list.svg')"
            aria-label="Visualizar clientes em tabela" @click="changeViewMode('table')" />
        </div>
      </div>

      <q-slide-transition>
        <div v-show="filtersOpen" class="clients-filters border-pattern q-pa-md q-mt-sm">
          <div class="row q-col-gutter-sm items-end">
            <label-form class-name="col-12 col-sm-6 col-md-3" text-label="Status">
              <q-select v-model="status" dense outlined clearable emit-value map-options :options="statusOptions" @update:model-value="reload" />
            </label-form>
            <label-form class-name="col-12 col-sm-6 col-md-3" text-label="Tipo de cliente">
              <q-select v-model="kind" dense outlined clearable emit-value map-options :options="kindOptions" @update:model-value="reload" />
            </label-form>
            <label-form class-name="col-12 col-sm-6 col-md-3" text-label="Contato">
              <q-input v-model.trim="contact" dense outlined clearable debounce="400" @update:model-value="reload" />
            </label-form>
            <label-form class-name="col-12 col-sm-6 col-md-3" text-label="Documento">
              <q-input v-model.trim="document" dense outlined clearable debounce="400" @update:model-value="reload" />
            </label-form>
            <label-form class-name="col-12 col-sm-6 col-md-3" text-label="Ordenar por">
              <q-select v-model="sortBy" dense outlined emit-value map-options :options="sortOptions" @update:model-value="reload" />
            </label-form>
            <label-form class-name="col-12 col-sm-6 col-md-3" text-label="Direção">
              <q-select v-model="sortDirection" dense outlined emit-value map-options :options="sortDirectionOptions" @update:model-value="reload" />
            </label-form>
            <div class="col row justify-end">
              <q-btn v-if="activeFilterCount" flat dense no-caps color="grey-7" icon="filter_alt_off" label="Limpar filtros" @click="clearFilters" />
            </div>
          </div>
        </div>
      </q-slide-transition>
    </div>

    <q-table v-if="viewMode === 'table'" v-model:pagination="tablePagination" v-model:selected="selected" flat dense hide-pagination
      class="my-sticky-header-column-table" row-key="id" selection="multiple" :rows="data" :columns="columns"
      :loading="loading" @request="onRequest">
      <template #body-cell-primaryName="props">
        <q-td :props="props">
          <q-item dense clickable class="q-pa-none" @click="openCustomer(props.row.id)">
            <q-item-section avatar><q-avatar size="32px" color="blue-grey-1" text-color="blue-grey-7" icon="person" /></q-item-section>
            <q-item-section align="left">
              <q-item-label>{{ props.row.primaryName || 'Sem nome' }}</q-item-label>
              <q-item-label caption>{{ props.row.primaryContact || 'Sem contato principal' }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-td>
      </template>
      <template #body-cell-status="props">
        <q-td :props="props"><span class="text-weight-medium" :class="statusClass(props.value)">{{ statusLabel(props.value) }}</span></q-td>
      </template>
      <template #body-cell-updatedAtUtc="props">
        <q-td :props="props">{{ formatDate(props.value || props.row.createdAtUtc) }}</q-td>
      </template>
      <template #body-cell-actions="props">
        <q-td :props="props">
          <RowActions :actions="rowActions" aria-label="Opções do cliente" @select="handleRowAction($event, props.row)" />
        </q-td>
      </template>
    </q-table>
    <template v-else>
      <div v-if="loading" class="row justify-center q-pa-xl"><q-spinner color="primary" size="36px" /></div>
      <div v-else-if="!data.length" class="text-center text-grey-5 q-pa-xl">Nenhum cliente encontrado.</div>
      <div v-else>
        <div class="clients-result-count">Exibindo {{ data.length }} clientes</div>
        <div class="row q-col-gutter-md q-mb-md">
        <div v-for="customer in data" :key="customer.id || customer.customerId" class="col-12 col-md-6">
          <q-card flat class="customer-card cursor-pointer" tabindex="0" role="button"
            @click="openCustomer(customer.id || customer.customerId)" @keydown.enter="openCustomer(customer.id || customer.customerId)" @keydown.space.prevent="openCustomer(customer.id || customer.customerId)">
            <q-card-section>
              <div class="row items-start no-wrap">
                <q-avatar size="56px" class="customer-card__avatar" icon="person" />
                <div class="q-ml-md col min-width-0">
                  <div class="row items-center q-gutter-xs"><q-badge outline color="grey-5">{{ columns[1].format(customer.kind || customer.customerKind) }}</q-badge><q-badge :color="customer.status === 'Active' ? 'positive' : 'grey-7'">{{ statusLabel(customer.status) }}</q-badge></div>
                  <div class="customer-card__name ellipsis">{{ customer.displayName || customer.primaryName || 'Sem nome' }}</div>
                  <div class="customer-card__contact ellipsis">{{ customer.primaryContact || 'Sem contato principal' }}</div>
                </div>
                <q-icon name="chevron_right" size="20px" color="grey-4" />
              </div>
              <div class="customer-card__facts">
                <div><span>ASSESSOR</span><strong>{{ customer.advisorName || 'Sem assessor' }}</strong></div>
                <div><span>ÚLTIMO ACESSO</span><strong>{{ formatDateTime(customer.lastAccessAtUtc) }}</strong></div>
              </div>
              <div class="customer-card__metrics">
                <span>Compliance: <strong>{{ customer.complianceStatus || customer.documentComplianceStatus || 'Não informado' }}</strong></span>
                <span>Nível doc.: <strong>{{ customer.documentLevel || '—' }}</strong></span>
              </div>
              <div class="customer-card__footer"><q-icon name="schedule" size="14px" /> Cliente desde {{ formatDate(customer.customerSince || customer.createdAtUtc) }}</div>
            </q-card-section>
          </q-card>
        </div>
        </div>
      </div>
    </template>
    <entity-table-footer :page="pagination.page" :page-size="pagination.pageSize" :total-items="pagination.totalItems"
      :total-pages="pagination.totalPages" :first-item="firstItemIndex" :last-item="lastItemIndex"
      @page="changePage" @page-size="changeRowsPerPage" />
    <q-dialog
      v-model="editDialog"
      position="right"
      full-height
      full-width
      maximized
      class="control-width"
      @hide="closeEditor"
    >
      <edit-client-layout
        v-if="selectedCustomerId"
        :customer-id="selectedCustomerId"
        @close="closeEditor"
        @select="selectedCustomerId = $event"
        @updated="reloadCurrentPage"
      />
    </q-dialog>
    <q-dialog v-model="compareDialog" position="right" full-height full-width maximized class="control-width-compare">
      <client-comparison-panel :customers="selected" @close="compareDialog = false" />
    </q-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { exportFile } from 'quasar'
import { storeToRefs } from 'pinia'
import { useClientStore } from 'src/stores/client'
import { getApiErrorMessage } from 'src/services/apiError'
import useNotification from 'src/composables/global/useNotification'
import EditClientLayout from 'src/layouts/Clients/EditClientLayout.vue'
import EntityTableFooter from 'src/components/Entity/EntityTableFooter.vue'
import RowActions from 'src/components/Entity/RowActions.vue'
import LabelForm from 'src/components/Form/LabelForm.vue'
import ClientComparisonPanel from 'src/components/Clients/ClientComparisonPanel.vue'
import { listCustomerCards } from 'src/services/customerService'

const store = useClientStore()
const router = useRouter()
const { data, loading, pagination } = storeToRefs(store)
const { errorNotify } = useNotification()
const search = ref('')
const status = ref(null), kind = ref(null), contact = ref(''), document = ref(''), sortBy = ref('name'), sortDirection = ref('asc'), viewMode = ref('cards'), filtersOpen = ref(false)
const statusOptions = [{ label: 'Prospect', value: 'Prospect' }, { label: 'Ativo', value: 'Active' }, { label: 'Suspenso', value: 'Suspended' }, { label: 'Arquivado', value: 'Archived' }]
const kindOptions = [{ label: 'Pessoa física', value: 'Person' }, { label: 'Pessoa jurídica', value: 'Organization' }]
const sortOptions = [{ label: 'Nome', value: 'name' }, { label: 'Criação', value: 'createdAt' }, { label: 'Atualização', value: 'updatedAt' }, { label: 'Status', value: 'status' }]
const sortDirectionOptions = [{ label: 'Crescente', value: 'asc' }, { label: 'Decrescente', value: 'desc' }]
const activeFilterCount = computed(() => [status.value, kind.value, contact.value, document.value].filter(Boolean).length)
const filterButtonLabel = computed(() => activeFilterCount.value ? `Filtros (${activeFilterCount.value})` : 'Filtros')
const selected = ref([])
const compareDialog = ref(false)
const editDialog = ref(false)
const selectedCustomerId = ref(null)
const rowActions = [{ name: 'edit', label: 'Editar', icon: 'edit', color: 'grey-7' }]
const tablePagination = computed({
  get: () => ({
    page: pagination.value.page,
    rowsPerPage: pagination.value.pageSize,
    rowsNumber: pagination.value.totalItems,
  }),
  set: ({ page, rowsPerPage, rowsNumber }) => {
    pagination.value = {
      ...pagination.value,
      page,
      pageSize: rowsPerPage,
      totalItems: rowsNumber,
    }
  },
})
const columns = [
  { name: 'primaryName', label: 'Cliente', field: 'primaryName', align: 'left' },
  { name: 'kind', label: 'Tipo', field: 'kind', align: 'left', format: (v) => v === 'Person' ? 'Pessoa física' : v === 'Organization' ? 'Pessoa jurídica' : v },
  { name: 'status', label: 'Status', field: 'status', align: 'left' },
  { name: 'updatedAtUtc', label: 'Atualizado em', field: 'updatedAtUtc', align: 'left' },
  { name: 'actions', label: '', field: 'id', align: 'right' },
]
const load = async (params = {}) => {
  try {
    const query = { page: params.page ?? pagination.value.page, pageSize: params.pageSize ?? pagination.value.pageSize, name: search.value || undefined, status: status.value || undefined, kind: kind.value || undefined, contact: contact.value || undefined, document: document.value || undefined, sortBy: sortBy.value, sortDirection: sortDirection.value }
    if (viewMode.value === 'cards') { store.loading = true; const response = await listCustomerCards(query); store.data = response?.data ?? []; store.pagination = { ...store.pagination, ...(response?.pagination ?? {}) }; store.loading = false }
    else await store.fetchCustomers(query)
  } catch (error) {
    store.loading = false
    errorNotify(getApiErrorMessage(error, 'Não foi possível carregar os clientes.'))
  }
}
const onRequest = ({ pagination: requested }) => load({ page: requested.page, pageSize: requested.rowsPerPage })
const reload = () => load({ page: 1 })
const changeRowsPerPage = (pageSize) => load({ page: 1, pageSize })
const changePage = (page) => load({ page })
const reloadCurrentPage = () => load()
const openCustomer = (id) => router.push({ name: 'ClienteDetalhe', params: { id } })
const editCustomer = (id) => { selectedCustomerId.value = id; editDialog.value = true }
const handleRowAction = (action, row) => { if (action === 'edit') editCustomer(row.id) }
const closeEditor = () => { editDialog.value = false; selectedCustomerId.value = null }
const changeViewMode = (mode) => { if (viewMode.value === mode) return; viewMode.value = mode; reload() }
const compareSelected = () => { compareDialog.value = true }
const clearFilters = () => { status.value = null; kind.value = null; contact.value = ''; document.value = ''; reload() }
const statusLabel = (status) => ({ Prospect: 'Prospect', Active: 'Ativo', Suspended: 'Suspenso', Archived: 'Arquivado' })[status] || status
const statusClass = (status) => ({ Prospect: 'text-info', Active: 'text-positive', Suspended: 'text-warning', Archived: 'text-grey-7' })[status] || 'text-grey-8'
const formatDate = (value) => value ? new Intl.DateTimeFormat('pt-BR').format(new Date(value)) : '—'
const formatDateTime = (value) => value ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value)) : 'Não informado'
const csvValue = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`
const exportTable = () => {
  const headers = ['Cliente', 'Contato', 'Tipo', 'Status', 'Atualizado em']
  const rows = data.value.map((customer) => [
    customer.primaryName || customer.displayName || 'Sem nome',
    customer.primaryContact || '',
    columns[1].format(customer.kind),
    statusLabel(customer.status),
    formatDate(customer.updatedAtUtc || customer.createdAtUtc),
  ])
  const content = [headers, ...rows].map((row) => row.map(csvValue).join(',')).join('\r\n')
  const result = exportFile(`clientes-${new Date().toISOString().slice(0, 10)}.csv`, content, 'text/csv;charset=utf-8')
  if (result !== true) errorNotify('O navegador bloqueou o download da lista de clientes.')
}
const firstItemIndex = computed(() => pagination.value.totalItems ? (pagination.value.page - 1) * pagination.value.pageSize + 1 : 0)
const lastItemIndex = computed(() => Math.min(pagination.value.page * pagination.value.pageSize, pagination.value.totalItems))
onMounted(load)
</script>
<style scoped>
.ClientsTable { padding: 0 32px 32px; color: #fff; }
.clients-toolbar { min-width: 0; padding-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,.14); }
.clients-filters { width: 100%; }
.clients-result-count { padding: 18px 0 14px; color: rgba(255,255,255,.56); font-size: 12px; }
.customer-card { height: 100%; min-height: 245px; color: #fff; border: 1px solid rgba(255,255,255,.16); border-radius: 14px; background: linear-gradient(120deg, rgba(6,9,18,.76), rgba(9,24,39,.58)); box-shadow: 4px 4px 12px rgba(0,0,0,.24); backdrop-filter: blur(20px); transition: border-color .2s, transform .2s, background .2s; }
.customer-card:hover,
.customer-card:focus-visible { border-color: rgba(81,184,255,.72); outline: none; transform: translateY(-2px); background: linear-gradient(120deg, rgba(8,14,28,.88), rgba(8,55,82,.64)); }
.customer-card__avatar { color: #fff; border: 1px solid rgba(255,255,255,.20); background: rgba(255,255,255,.06); }
.customer-card__name { margin-top: 8px; font-size: 17px; }
.customer-card__contact { margin-top: 2px; color: rgba(255,255,255,.56); font-size: 12px; }
.customer-card__facts { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 24px; }
.customer-card__facts > div { padding: 12px; border: 1px solid rgba(255,255,255,.13); border-radius: 10px; background: rgba(255,255,255,.05); }
.customer-card__facts span { display: block; margin-bottom: 5px; color: rgba(255,255,255,.52); font-size: 9px; letter-spacing: .05em; }
.customer-card__facts strong { display: block; font-size: 12px; font-weight: 500; }
.customer-card__metrics { display: flex; justify-content: space-between; gap: 16px; margin-top: 14px; color: rgba(255,255,255,.5); font-size: 10px; text-transform: uppercase; }
.customer-card__metrics strong { color: rgba(255,255,255,.84); font-weight: 600; }
.customer-card__footer { display: flex; align-items: center; gap: 6px; margin-top: 18px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,.08); color: rgba(255,255,255,.5); font-size: 11px; }
.min-width-0 { min-width: 0; }
:deep(.q-table__container) { color: #fff; border: 1px solid rgba(255,255,255,.16); border-radius: 14px; background: rgba(5,10,20,.55); box-shadow: 4px 4px 12px rgba(0,0,0,.24); }
:deep(.q-table thead), :deep(.q-table tbody), :deep(.q-table tr), :deep(.q-table th), :deep(.q-table td) { color: inherit; background: transparent; border-color: rgba(255,255,255,.08); }
:deep(.q-table th) { color: rgba(255,255,255,.58); font-size: 10px; text-transform: uppercase; }
@media (max-width: 700px) { .ClientsTable { padding: 0 16px 24px; } .customer-card__facts { grid-template-columns: 1fr; } }
@media (max-width: 1200px) { .clients-toolbar__actions { justify-content: flex-start; padding-top: 10px; } }
</style>
