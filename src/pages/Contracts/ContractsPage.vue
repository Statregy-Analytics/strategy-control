<template>
  <q-page :class="workspaceOpen ? 'contract-page' : 'q-pa-md'">
    <contract-workspace
      v-if="workspaceOpen"
      :key="activeContract || 'new'"
      :contract-id="activeContract"
      :history-requested="route.query.history === '1'"
      @close="close"
      @saved="saved" />
    <template v-else>
      <title-page title="Contratos" />
      <div class="row q-col-gutter-md q-my-md items-center">
        <div class="col-12 col-sm">
          <q-input
            v-model="search"
            outlined
            dense
            debounce="350"
            placeholder="Buscar contratos"
            aria-label="Buscar contratos"
            ><template #prepend><q-icon name="search" /></template
          ></q-input>
        </div>
        <div class="col-12 col-sm-auto">
          <q-select
            v-model="registrationStatus"
            :options="registrationOptions"
            emit-value
            map-options
            outlined
            dense
            aria-label="Situação do cadastro"
          />
        </div>
        <div class="col-auto">
          <q-btn color="primary" no-caps icon="add" label="Novo contrato" @click="open()" />
        </div>
      </div>
      <finance-table
        ref="table"
        path="admin/contracts"
        :params="{ search: search || undefined, registrationStatus }"
        :columns="contractColumns"
      >
        <template #body-cell-actions="p"
          ><q-td :props="p"
            ><row-actions
              :actions="[{ name: 'open', label: 'Abrir contrato', icon: 'edit' }]"
              @select="open(p.row.id)" /></q-td
        ></template>
      </finance-table> </template
  ></q-page>
</template>
<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import TitlePage from 'src/components/TitlePage.vue'
import RowActions from 'src/components/Entity/RowActions.vue'
import FinanceTable from 'src/components/Finance/FinanceTable.vue'
import ContractWorkspace from 'src/components/Contracts/ContractWorkspace.vue'
import { columns, money, financeLabel } from 'src/services/financeService'
const route = useRoute(),
  router = useRouter(),
  table = ref(),
  search = ref(''),
  registrationStatus = ref(null)
const registrationOptions = [
  { label: 'Contratos cadastrados', value: null },
  { label: 'Rascunhos', value: 'Draft' },
]
const activeContract = computed(() =>
  typeof route.query.contractId === 'string' &&
  /^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(route.query.contractId)
    ? route.query.contractId
    : null,
)
const workspaceOpen = computed(() => Boolean(activeContract.value) || route.query.new === '1')
const contractColumns = columns([
  ['publicCode', 'Contrato'],
  ['name', 'Nome'],
  ['status', 'Status', (r) => r.businessStatus?.name || financeLabel(r.registrationStatus)],
  ['clients', 'Participantes', (r) => r.clientCount],
  ['capital', 'Capital inicial', (r) => money(r.initialContractualCapital, r.currencyCode)],
  ['actions', 'Ações'],
])
const open = (id = null) =>
  router.push({ name: 'contracts', query: id ? { contractId: id } : { new: '1' } })
const close = () => router.push({ name: 'contracts' })
const saved = (id) => router.replace({ name: 'contracts', query: { contractId: id } })
</script>
