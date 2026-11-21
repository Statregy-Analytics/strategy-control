<template>
  <div class="transaction-directory">
    <form-section
      class="transaction-pending-section"
      title="Solicitações Pendentes"
      caption="Transações que precisam de validação, aprovação ou execução manual"
    >
      <template #icon><img :src="header.imgIcon" alt="" /></template>
      <span class="transaction-pending-count"
        >{{ pending.loading || pending.error ? '—' : (pending.data?.length ?? '—') }}
        {{ pending.data?.length === 1 ? 'pendente' : 'pendentes' }}</span
      >
      <resource-state :state="pending" @retry="$emit('retry-pending')"
        ><pending-transaction-cards :rows="pending.data || []" @open="$emit('open', $event)"
      /></resource-state>
    </form-section>
    <form-section
      class="transaction-history-section"
      title="Histórico de Transações"
      caption="Consulta, auditoria e rastreio de todas as operações"
    >
      <div class="transaction-directory__filters">
        <q-input
          v-model="filters.search"
          outlined
          dense
          dark
          clearable
          placeholder="Buscar por ID, cliente, contrato..."
          aria-label="Buscar por ID, cliente, contrato..."
          ><template #prepend><img :src="filterAssets.imgIcon" alt="" /></template
        ></q-input>
        <div
          class="transaction-directory__selects"
          v-show="expanded"
          id="transaction-directory-filters"
        >
          <glass-select
            v-model="filters.days"
            :options="periods"
            placeholder="Período"
            aria-label="Período"
            clearable
            :dropdown-icon="'img:' + filterAssets.imgIcon1"
          />
          <glass-select
            v-model="filters.type"
            :options="typeOptions"
            placeholder="Tipo"
            aria-label="Tipo"
            clearable
            :dropdown-icon="'img:' + filterAssets.imgIcon1"
          />
          <glass-select
            v-model="filters.status"
            :options="statusOptions"
            placeholder="Status"
            aria-label="Status"
            clearable
            :dropdown-icon="'img:' + filterAssets.imgIcon1"
          />
          <glass-select
            v-model="filters.clientId"
            :options="clientOptions"
            placeholder="Cliente"
            aria-label="Cliente"
            clearable
            :dropdown-icon="'img:' + filterAssets.imgIcon1"
          />
          <glass-select
            v-model="filters.actor"
            :options="actorOptions"
            placeholder="Responsável"
            aria-label="Responsável"
            clearable
            :dropdown-icon="'img:' + filterAssets.imgIcon1"
          />
        </div>
        <q-btn
          outline
          no-caps
          :aria-expanded="expanded"
          aria-controls="transaction-directory-filters"
          label="Mais Filtros"
          @click="expanded = !expanded"
          ><img :src="filterAssets.imgIcon2" alt=""
        /></q-btn>
      </div>
      <resource-state :state="history" @retry="$emit('retry-history')">
        <transaction-ledger
          :rows="pageRows"
          :all-rows="history.data || []"
          :corrections="corrections"
          @open="$emit('open', $event)"
        />
        <footer class="transaction-directory__footer">
          <span
            >Exibindo {{ filtered.length }}
            {{ filtered.length === 1 ? 'transação' : 'transações' }}</span
          >
          <div>
            <q-btn outline no-caps label="Anterior" :disable="page <= 1" @click="page--" /><span
              >Página {{ page }} de {{ pages }}</span
            ><q-btn outline no-caps label="Próximo" :disable="page >= pages" @click="page++" />
          </div>
        </footer>
      </resource-state>
    </form-section>
  </div>
</template>
<script setup>
import { transferKindLabels } from 'src/services/transactionDirectoryModel'
import { computed, reactive, ref, watch } from 'vue'
import FormSection from 'src/components/Entity/FormSection.vue'
import GlassSelect from 'src/components/Entity/GlassSelect.vue'
import ResourceState from './ResourceState.vue'
import PendingTransactionCards from './PendingTransactionCards.vue'
import TransactionLedger from './TransactionLedger.vue'
import { transactionDirectoryAssets } from 'src/services/transactionDirectoryAssets'
import {
  filterTransactionRows,
  transactionActor,
  transactionStatusLabel,
} from 'src/services/transactionDirectoryModel'
import { financeLabel } from 'src/services/financeService'
const props = defineProps({
  pending: { type: Object, required: true },
  history: { type: Object, required: true },
  corrections: { type: Object, default: () => ({}) },
})
defineEmits(['open', 'retry-pending', 'retry-history'])
const filters = reactive({
    search: '',
    days: null,
    type: null,
    status: null,
    clientId: null,
    actor: null,
  }),
  expanded = ref(true),
  page = ref(1)
const header = transactionDirectoryAssets['1484:85569'],
  filterAssets = transactionDirectoryAssets['1484:85954']
const periods = [
  { label: 'Hoje', value: 1 },
  { label: 'Últimos 7 dias', value: 7 },
  { label: 'Últimos 30 dias', value: 30 },
]
const optionRows = ref([])
watch(
  () => props.history.data,
  (rows) => {
    if (Array.isArray(rows) && rows.length) optionRows.value = rows
  },
  { immediate: true },
)
const options = (key, label) => [
  ...new Map(
    optionRows.value
      .filter((r) => r[key] != null)
      .map((r) => [r[key], { value: r[key], label: label(r) }]),
  ).values(),
]
const typeOptions = [
  'Deposit',
  'Withdrawal',
  'WalletTransfer',
  'InterCustomerTransfer',
  'WalletImmediate',
  'WalletUpTo30Days',
  'OtherClient',
  'ContractOperation',
  'ContractRedemption',
  'AssetIncluded',
  'AssetRemoved',
].map((value) => ({
  value,
  label: transferKindLabels[value]
    ? 'Transferência · ' + transferKindLabels[value]
    : financeLabel(value),
}))
const statusOptions = computed(() =>
  options('status', (r) => transactionStatusLabel(r.status, financeLabel(r.status))),
)
const clientOptions = computed(() => options('clientId', (r) => r.clientName || 'Indisponível'))
const actorOptions = computed(() =>
  [...new Set(optionRows.value.map((r) => transactionActor(r.createdBy)))].map((value) => ({
    value,
    label: value,
  })),
)
const filtered = computed(() => filterTransactionRows(props.history.data || [], filters))
const pages = computed(() => Math.max(1, Math.ceil(filtered.value.length / 15)))
const pageRows = computed(() => filtered.value.slice((page.value - 1) * 15, page.value * 15))
watch(filters, () => (page.value = 1), { deep: true })
watch(
  () => props.history.data,
  () => (page.value = 1),
)
</script>
<style scoped>
.transaction-directory {
  padding: 24px;
  min-width: 0;
  color: white;
}
.transaction-pending-section {
  position: relative;
  padding: 24px !important;
  border: 0.8px solid #ffffff33;
  border-radius: 14px;
  background: #ffffff0f;
  backdrop-filter: blur(20px);
  box-shadow: 4px 4px 12px #00000021;
}
.transaction-pending-section :deep(.form-section__title) {
  display: flex;
  gap: 8px;
  align-items: center;
  font:
    700 20px/28px Inter,
    sans-serif;
  padding-right: 100px;
}
.transaction-pending-section :deep(.form-section__caption) {
  font:
    400 12px/18px Inter,
    sans-serif;
  color: #ffffffb8;
}
.transaction-pending-section :deep(.q-mt-md) {
  margin-top: 24px;
}
.transaction-pending-count {
  position: absolute;
  right: 24px;
  top: 24px;
  border: 0.8px solid #fee685;
  border-radius: 6px;
  padding: 4px 8px;
  color: #fee685;
  background: #ffffff0d;
  font:
    600 12px/18px Inter,
    sans-serif;
}
.transaction-history-section {
  padding: 24px 0 0 !important;
}
.transaction-history-section :deep(.form-section__title) {
  font:
    700 20px/28px Inter,
    sans-serif;
}
.transaction-history-section :deep(.form-section__caption) {
  font:
    400 12px/18px Inter,
    sans-serif;
  color: #ffffffb8;
}
.transaction-directory__filters {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  padding: 16px;
  border: 0.8px solid #ffffff33;
  border-radius: 10px;
  background: #ffffff0f;
  margin-bottom: 16px;
}
.transaction-directory__filters > .q-input {
  flex: 3;
  min-width: 230px;
}
.transaction-directory__selects {
  display: flex;
  flex: 5;
  gap: 8px;
  min-width: 0;
}
.transaction-directory__selects > .glass-select {
  flex: 1;
  min-width: 100px;
  max-width: 220px;
}
.transaction-directory__filters :deep(.q-field__control) {
  min-height: 36px;
  height: 36px;
  border-radius: 8px;
  background: linear-gradient(87deg, #ffffff1f, #ffffff0d, #ffffff1a);
}
.transaction-directory__filters :deep(.q-field__control:before) {
  border-color: #ffffff1f;
}
.transaction-directory__filters :deep(.q-field__native) {
  min-height: 36px;
  padding: 0;
  font:
    400 12px/16px Inter,
    sans-serif;
}
.transaction-directory__filters .q-btn {
  min-height: 36px;
  border-radius: 8px;
  background: #ffffff0f;
  font:
    500 14px/20px Inter,
    sans-serif;
}
.transaction-directory__filters .q-btn :deep(.q-btn__content) {
  gap: 8px;
  flex-direction: row-reverse;
}
.transaction-directory__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: 16px;
  color: #ffffffb8;
  font:
    400 12px/18px Inter,
    sans-serif;
}
.transaction-directory__footer > div {
  display: flex;
  gap: 8px;
  align-items: center;
}
.transaction-directory__footer .q-btn {
  min-height: 32px;
  padding: 4px 12px;
  border-radius: 8px;
  background: #ffffff0f;
  font:
    500 14px/20px Inter,
    sans-serif;
}
@media (max-width: 1500px) {
  .transaction-directory__selects {
    order: 2;
    flex-basis: 100%;
    flex-wrap: wrap;
  }
  .transaction-directory__selects > .glass-select {
    max-width: none;
  }
}
@media (max-width: 650px) {
  .transaction-directory {
    padding: 16px;
  }
  .transaction-pending-section {
    padding: 16px !important;
  }
  .transaction-pending-count {
    top: 16px;
    right: 16px;
  }
  .transaction-pending-section :deep(.form-section__title) {
    font-size: 16px;
  }
  .transaction-directory__selects > .glass-select {
    flex-basis: calc(50% - 8px);
  }
  .transaction-directory__filters > .q-input {
    min-width: 100%;
  }
  .transaction-directory__footer > div {
    flex-wrap: wrap;
  }
}
</style>

<style scoped>
.transaction-directory__selects :deep(.q-select__dropdown-icon) {
  font-size: 12px;
  width: 12px;
  height: 12px;
}
</style>
