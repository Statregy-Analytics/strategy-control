<template>
  <div class="q-pa-md ClientsTable">
    <q-table v-if="viewMode === 'table'" v-model:pagination="tablePagination" v-model:selected="selected" flat dense hide-pagination
      class="my-sticky-header-column-table" row-key="id" selection="multiple" :rows="data" :columns="columns"
      :loading="loading" @request="onRequest">
      <template #top>
        <div class="row col-12 q-col-gutter-sm items-center">
          <div class="col-12 col-md-3">
            <q-input v-model="search" dense outlined debounce="400" clearable placeholder="Pesquisar por palavra-chave" @update:model-value="reload">
              <template #prepend><q-icon name="search" size="1.2rem" /></template>
            </q-input>
          </div>
          <div class="col-6 col-md-2"><q-select v-model="status" dense outlined clearable emit-value map-options :options="statusOptions" label="Status" @update:model-value="reload" /></div>
          <div class="col-6 col-md-2"><q-select v-model="kind" dense outlined clearable emit-value map-options :options="kindOptions" label="Tipo" @update:model-value="reload" /></div>
          <div class="col-6 col-md-2"><q-input v-model.trim="contact" dense outlined clearable debounce="400" label="Contato" @update:model-value="reload" /></div>
          <div class="col-6 col-md-2"><q-input v-model.trim="document" dense outlined clearable debounce="400" label="Documento" @update:model-value="reload" /></div>
          <div class="col-auto"><q-btn-toggle v-model="viewMode" flat dense color="grey-7" toggle-color="primary" :options="[{icon:'table_rows',value:'table'},{icon:'grid_view',value:'cards'}]" @update:model-value="reload" /></div>
          <div class="col-12 col-md-4"><q-select v-model="quickCustomer" use-input hide-selected fill-input dense outlined clearable input-debounce="350" :options="lookupOptions" label="Troca rápida de cliente" @filter="filterLookup" @update:model-value="openLookup"><template #prepend><q-icon name="person_search" /></template></q-select></div>
          <div class="col-6 col-md-3"><q-select v-model="sortBy" dense outlined emit-value map-options :options="sortOptions" label="Ordenar por" @update:model-value="reload" /></div>
          <div class="col-6 col-md-2"><q-select v-model="sortDirection" dense outlined emit-value map-options :options="[{label:'Crescente',value:'asc'},{label:'Decrescente',value:'desc'}]" label="Direção" @update:model-value="reload" /></div>
        </div>
      </template>
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
        <q-td :props="props"><q-badge :color="props.value === 'Active' ? 'positive' : 'grey'">{{ statusLabel(props.value) }}</q-badge></q-td>
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
      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-12"><div class="row q-col-gutter-sm items-center"><div class="col-12 col-md-3"><q-input v-model="search" dense outlined debounce="400" clearable placeholder="Pesquisar por nome" @update:model-value="reload"><template #prepend><q-icon name="search" /></template></q-input></div><div class="col-6 col-md-2"><q-select v-model="status" dense outlined clearable emit-value map-options :options="statusOptions" label="Status" @update:model-value="reload" /></div><div class="col-6 col-md-2"><q-select v-model="kind" dense outlined clearable emit-value map-options :options="kindOptions" label="Tipo" @update:model-value="reload" /></div><q-btn-toggle v-model="viewMode" flat dense toggle-color="primary" :options="[{icon:'table_rows',value:'table'},{icon:'grid_view',value:'cards'}]" @update:model-value="reload" /></div></div>
        <div v-for="customer in data" :key="customer.id" class="col-12 col-sm-6 col-lg-4"><q-card flat bordered class="customer-card cursor-pointer" @click="editCustomer(customer.id)"><q-card-section class="row items-center no-wrap"><q-avatar color="blue-grey-1" text-color="blue-grey-7" icon="person" /><div class="q-ml-md col"><div class="text-weight-medium">{{ customer.primaryName || customer.displayName || 'Sem nome' }}</div><div class="text-caption text-grey-7">{{ customer.primaryContact || 'Sem contato principal' }}</div></div><q-badge :color="customer.status === 'Active' ? 'positive' : 'grey'">{{ statusLabel(customer.status) }}</q-badge></q-card-section></q-card></div>
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
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useClientStore } from 'src/stores/client'
import { getApiErrorMessage } from 'src/services/apiError'
import useNotification from 'src/composables/global/useNotification'
import EditClientLayout from 'src/layouts/Clients/EditClientLayout.vue'
import EntityTableFooter from 'src/components/Entity/EntityTableFooter.vue'
import RowActions from 'src/components/Entity/RowActions.vue'
import { listCustomerCards, lookupCustomers } from 'src/services/customerService'

const store = useClientStore()
const { data, loading, pagination } = storeToRefs(store)
const { errorNotify } = useNotification()
const search = ref('')
const status = ref(null), kind = ref(null), contact = ref(''), document = ref(''), sortBy = ref('name'), sortDirection = ref('asc'), viewMode = ref('table'), quickCustomer = ref(null), lookupOptions = ref([])
const statusOptions = [{ label: 'Prospect', value: 'Prospect' }, { label: 'Ativo', value: 'Active' }, { label: 'Suspenso', value: 'Suspended' }, { label: 'Arquivado', value: 'Archived' }]
const kindOptions = [{ label: 'Pessoa física', value: 'Person' }, { label: 'Pessoa jurídica', value: 'Organization' }]
const sortOptions = [{ label: 'Nome', value: 'name' }, { label: 'Criação', value: 'createdAt' }, { label: 'Atualização', value: 'updatedAt' }, { label: 'Status', value: 'status' }]
const selected = ref([])
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
const filterLookup = async (value, update) => { try { const response = await lookupCustomers({ search: value || undefined, limit: 10 }); const items = Array.isArray(response) ? response : response?.items || response?.data || []; update(() => { lookupOptions.value = items.map((item) => ({ label: item.primaryName || item.displayName || item.name, value: item.id, caption: item.primaryContact })) }) } catch { update(() => { lookupOptions.value = [] }) } }
const openLookup = (option) => { const id = option?.value || option; if (id) editCustomer(id); quickCustomer.value = null }
const statusLabel = (status) => ({ Prospect: 'Prospect', Active: 'Ativo', Suspended: 'Suspenso', Archived: 'Arquivado' })[status] || status
const formatDate = (value) => value ? new Intl.DateTimeFormat('pt-BR').format(new Date(value)) : '—'
const firstItemIndex = computed(() => pagination.value.totalItems ? (pagination.value.page - 1) * pagination.value.pageSize + 1 : 0)
const lastItemIndex = computed(() => Math.min(pagination.value.page * pagination.value.pageSize, pagination.value.totalItems))
onMounted(load)
</script>
<style scoped>.customer-card{height:100%;transition:border-color .2s}.customer-card:hover{border-color:var(--q-primary)}</style>
