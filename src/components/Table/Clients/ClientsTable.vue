<template>
  <div class="q-pa-md ClientsTable">
    <div class="clients-toolbar q-mb-md">
      <div class="row items-center q-col-gutter-sm">
        <div class="col-12 col-md-3">
          <q-input v-model="search" dense outlined debounce="400" clearable placeholder="Pesquisar por palavra-chave" aria-label="Pesquisar clientes" @update:model-value="reload">
            <template #prepend><q-icon name="search" size="1.2rem" /></template>
          </q-input>
        </div>
        <div class="col row justify-end items-center q-gutter-xs">
          <q-btn color="primary" no-caps label="Exportar" flat size="sm" @click="exportTable" />
          <q-btn size="xs" padding="xs" no-caps outline label="Comparar Clientes" :disable="selected.length < 2"
            :class="selected.length < 2 ? 'text-muted' : 'text-primary'" @click="compareSelected" />
          <q-btn flat dense no-caps color="primary" icon="tune" :label="filterButtonLabel" aria-label="Mostrar filtros e ordenação" @click="filtersOpen = !filtersOpen" />
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
          <q-item dense clickable class="q-pa-none" @click="editCustomer(props.row.id)">
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
      <div v-else-if="!data.length" class="text-center text-grey-7 q-pa-xl">Nenhum cliente encontrado.</div>
      <div v-else class="row q-col-gutter-md q-mb-md">
        <div v-for="customer in data" :key="customer.id" class="col-12 col-sm-6 col-lg-4">
          <q-card flat bordered class="customer-card cursor-pointer" tabindex="0" role="button"
            @click="editCustomer(customer.id)" @keydown.enter="editCustomer(customer.id)" @keydown.space.prevent="editCustomer(customer.id)">
            <q-card-section class="row items-center no-wrap">
              <q-avatar size="32px" color="blue-grey-1" text-color="blue-grey-7" icon="person" />
              <div class="q-ml-md col"><div class="text-weight-medium">{{ customer.primaryName || customer.displayName || 'Sem nome' }}</div><div class="text-caption text-grey-7">{{ customer.primaryContact || 'Sem contato principal' }}</div></div>
              <q-badge :color="customer.status === 'Active' ? 'positive' : 'grey'">{{ statusLabel(customer.status) }}</q-badge>
            </q-card-section>
          </q-card>
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
const { data, loading, pagination } = storeToRefs(store)
const { errorNotify } = useNotification()
const search = ref('')
const status = ref(null), kind = ref(null), contact = ref(''), document = ref(''), sortBy = ref('name'), sortDirection = ref('asc'), viewMode = ref('table'), filtersOpen = ref(false)
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
const editCustomer = (id) => { selectedCustomerId.value = id; editDialog.value = true }
const handleRowAction = (action, row) => { if (action === 'edit') editCustomer(row.id) }
const closeEditor = () => { editDialog.value = false; selectedCustomerId.value = null }
const changeViewMode = (mode) => { if (viewMode.value === mode) return; viewMode.value = mode; reload() }
const compareSelected = () => { compareDialog.value = true }
const clearFilters = () => { status.value = null; kind.value = null; contact.value = ''; document.value = ''; reload() }
const statusLabel = (status) => ({ Prospect: 'Prospect', Active: 'Ativo', Suspended: 'Suspenso', Archived: 'Arquivado' })[status] || status
const statusClass = (status) => ({ Prospect: 'text-info', Active: 'text-positive', Suspended: 'text-warning', Archived: 'text-grey-7' })[status] || 'text-grey-8'
const formatDate = (value) => value ? new Intl.DateTimeFormat('pt-BR').format(new Date(value)) : '—'
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
.clients-toolbar { min-width: 0; }
.clients-filters { width: 100%; }
.customer-card { height: 100%; transition: border-color .2s; }
.customer-card:hover,
.customer-card:focus-visible { border-color: var(--q-primary); outline: none; }
</style>
