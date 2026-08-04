<template>
  <div class="q-pa-md ClientsTable">
    <q-table v-model:pagination="tablePagination" v-model:selected="selected" flat dense hide-pagination
      class="my-sticky-header-column-table" row-key="id" selection="multiple" :rows="data" :columns="columns"
      :loading="loading" @request="onRequest">
      <template #top>
        <div class="row col-12 justify-between">
          <div class="col-12 col-sm-5 col-md-4">
            <q-input v-model="search" dense outlined debounce="400" clearable placeholder="Pesquisar por palavra-chave" @update:model-value="reload">
              <template #prepend><q-icon name="search" size="1.2rem" /></template>
            </q-input>
          </div>
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
          <q-btn size="xs" padding="xs" flat icon="more_vert" aria-label="Opções do cliente">
            <q-menu transition-show="flip-right" transition-hide="flip-left">
              <q-btn flat no-caps v-close-popup class="client-action" @click="editCustomer(props.row.id)">
                <q-icon name="edit" size="0.9rem" class="text-muted" />
                <span class="q-ml-sm text-muted">Editar</span>
              </q-btn>
            </q-menu>
          </q-btn>
        </q-td>
      </template>
    </q-table>
    <div class="row justify-between items-center q-mt-md">
      <div class="row items-center">
        <span class="q-mr-sm">Itens por página:</span>
        <q-select dense outlined :model-value="pagination.pageSize" :options="[5, 10, 15, 20]"
          dropdown-icon="keyboard_arrow_down" @update:model-value="changeRowsPerPage" />
        <span class="q-ml-md text-caption text-grey-8">Mostrando {{ firstItemIndex }} a {{ lastItemIndex }} de {{ pagination.totalItems }} registros</span>
      </div>
      <q-pagination v-if="pagination.totalPages > 1" :model-value="pagination.page" color="primary"
        :max="pagination.totalPages" :max-pages="6" size="sm" direction-links @update:model-value="changePage" />
    </div>
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

const store = useClientStore()
const { data, loading, pagination } = storeToRefs(store)
const { errorNotify } = useNotification()
const search = ref('')
const selected = ref([])
const editDialog = ref(false)
const selectedCustomerId = ref(null)
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
    await store.fetchCustomers({ page: params.page ?? pagination.value.page, pageSize: params.pageSize ?? pagination.value.pageSize,
      name: search.value || undefined, sortBy: 'name', sortDirection: 'asc' })
  } catch (error) {
    errorNotify(getApiErrorMessage(error, 'Não foi possível carregar os clientes.'))
  }
}
const onRequest = ({ pagination: requested }) => load({ page: requested.page, pageSize: requested.rowsPerPage })
const reload = () => load({ page: 1 })
const changeRowsPerPage = (pageSize) => load({ page: 1, pageSize })
const changePage = (page) => load({ page })
const reloadCurrentPage = () => load()
const editCustomer = (id) => { selectedCustomerId.value = id; editDialog.value = true }
const closeEditor = () => { editDialog.value = false; selectedCustomerId.value = null }
const statusLabel = (status) => ({ Prospect: 'Prospect', Active: 'Ativo', Suspended: 'Suspenso', Archived: 'Arquivado' })[status] || status
const formatDate = (value) => value ? new Intl.DateTimeFormat('pt-BR').format(new Date(value)) : '—'
const firstItemIndex = computed(() => pagination.value.totalItems ? (pagination.value.page - 1) * pagination.value.pageSize + 1 : 0)
const lastItemIndex = computed(() => Math.min(pagination.value.page * pagination.value.pageSize, pagination.value.totalItems))
onMounted(load)
</script>

<style scoped>
.client-action { min-width: 181px; justify-content: flex-start; font-size: small; }
</style>
