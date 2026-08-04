<template>
  <div class="q-pa-md">
    <q-table flat dense row-key="id" :rows="data" :columns="columns" :loading="loading"
      :pagination="{ page: pagination.page, rowsPerPage: pagination.pageSize, rowsNumber: pagination.totalItems }"
      @request="onRequest">
      <template #top>
        <q-input v-model="search" dense outlined debounce="400" clearable placeholder="Pesquisar cliente" @update:model-value="reload">
          <template #prepend><q-icon name="search" /></template>
        </q-input>
      </template>
      <template #body-cell-primaryName="props">
        <q-td :props="props">
          <q-btn flat no-caps padding="none" class="text-left" color="dark" @click="openCustomer(props.row.id)">
            <div>
              <div class="text-weight-medium">{{ props.row.primaryName || 'Sem nome' }}</div>
              <div class="text-caption text-grey-7">{{ props.row.primaryContact || 'Sem contato principal' }}</div>
            </div>
          </q-btn>
        </q-td>
      </template>
      <template #body-cell-status="props">
        <q-td :props="props"><q-badge :color="props.value === 'Active' ? 'positive' : 'grey'">{{ statusLabel(props.value) }}</q-badge></q-td>
      </template>
      <template #body-cell-updatedAtUtc="props">
        <q-td :props="props">{{ formatDate(props.value || props.row.createdAtUtc) }}</q-td>
      </template>
      <template #body-cell-actions="props">
        <q-td :props="props"><q-btn flat round dense icon="chevron_right" aria-label="Abrir cliente" @click="openCustomer(props.row.id)" /></q-td>
      </template>
    </q-table>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useClientStore } from 'src/stores/client'
import { getApiErrorMessage } from 'src/services/apiError'
import useNotification from 'src/composables/global/useNotification'

const router = useRouter()
const store = useClientStore()
const { data, loading, pagination } = storeToRefs(store)
const { errorNotify } = useNotification()
const search = ref('')
const columns = [
  { name: 'primaryName', label: 'Cliente', field: 'primaryName', align: 'left' },
  { name: 'kind', label: 'Tipo', field: 'kind', align: 'left', format: (v) => v === 'Individual' ? 'Pessoa física' : 'Pessoa jurídica' },
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
const openCustomer = (id) => router.push({ name: 'ClienteDetalhe', params: { id } })
const statusLabel = (status) => ({ Active: 'Ativo', Inactive: 'Inativo', Blocked: 'Bloqueado', Pending: 'Pendente' })[status] || status
const formatDate = (value) => value ? new Intl.DateTimeFormat('pt-BR').format(new Date(value)) : '—'
onMounted(load)
</script>
