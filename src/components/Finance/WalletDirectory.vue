<template>
  <section class="wallet-directory">
    <div class="directory-toolbar">
      <div>
        <h2>{{ titles[type] }}</h2>
        <p>Uma carteira de cada tipo por cliente. Valores preservados por moeda.</p>
      </div>
      <q-btn-toggle
        v-model="view"
        no-caps
        unelevated
        toggle-color="primary"
        :options="[
          { label: 'Cards', value: 'cards', icon: 'grid_view' },
          { label: 'Lista', value: 'list', icon: 'view_list' },
        ]"
      />
    </div>
    <div class="directory-filters">
      <q-input
        v-model="search"
        outlined
        dense
        clearable
        placeholder="Buscar cliente ou carteira"
        aria-label="Buscar cliente ou carteira"
      /><q-select
        v-model="currency"
        outlined
        dense
        emit-value
        map-options
        :options="currencyOptions"
        aria-label="Filtrar moeda"
      />
    </div>
    <q-banner v-if="rows === null" class="q-my-md bg-transparent wallet-unavailable"
      >A consulta das novas carteiras ainda não está disponível.</q-banner
    >
    <div v-if="view === 'cards'" class="directory-cards">
      <article v-for="row in pageRows" :key="row.key" class="directory-card">
        <header>
          <img src="/icons/wallets/wallet.svg" alt="" width="40" height="40" />
          <div>
            <h3>{{ label(row.type) }}</h3>
            <small>{{ row.code || '—' }}</small>
          </div>
        </header>
        <p class="q-mt-md">{{ row.clientName }}</p>
        <p class="text-caption">ID Cliente: {{ row.clientCode || '—' }}</p>
        <dl>
          <template v-for="field in fields(row)" :key="field.label"
            ><dt>{{ field.label }}</dt>
            <dd>{{ field.value }}</dd></template
          >
        </dl>
        <div class="card-actions">
          <q-btn
            outline
            dense
            no-caps
            label="Ver movimentações"
            @click="emit('open', row.customerId)"
          /><q-btn
            outline
            dense
            no-caps
            :label="
              row.type === 'strategy'
                ? 'Ver contratos'
                : row.type === 'assets'
                  ? 'Ver bens'
                  : 'Ver carteira'
            "
            @click="toggle(row.key)"
          />
        </div>
        <div v-if="expanded === row.key" class="q-mt-md"><wallet-details :row="row" /></div>
      </article>
    </div>
    <q-table
      v-else
      flat
      dense
      hide-bottom
      :rows="pageRows"
      :columns="columns"
      row-key="key"
      :pagination="{ rowsPerPage: 0 }"
      :no-data-label="rows === null ? 'Consulta indisponível' : 'Nenhuma carteira para exibir'"
    >
      <template #body="scope"
        ><q-tr :props="scope"
          ><q-td v-for="column in scope.cols" :key="column.name" :props="scope"
            ><template v-if="column.name === 'actions'"
              ><row-actions
                :actions="[
                  { name: 'expand', label: 'Ver detalhes', icon: 'expand_more' },
                  { name: 'open', label: 'Ver movimentações', icon: 'visibility' },
                ]"
                @select="
                  $event === 'open' ? emit('open', scope.row.customerId) : toggle(scope.row.key)
                " /></template
            ><template v-else>{{ column.value }}</template></q-td
          ></q-tr
        ><q-tr v-if="expanded === scope.row.key"
          ><q-td :colspan="columns.length"><wallet-details :row="scope.row" /></q-td></q-tr
      ></template>
    </q-table>
    <p v-if="rows !== null && !filtered.length && view === 'cards'" class="q-pa-lg text-center">
      Nenhuma carteira encontrada.
    </p>
    <entity-table-footer
      v-if="rows !== null"
      :page="page"
      :page-size="pageSize"
      :total-items="filtered.length"
      :total-pages="Math.max(1, Math.ceil(filtered.length / pageSize))"
      :first-item="filtered.length ? (page - 1) * pageSize + 1 : 0"
      :last-item="Math.min(page * pageSize, filtered.length)"
      @page="page = $event"
      @page-size="setPageSize"
    />
  </section>
</template>
<script setup>
import { computed, ref, watch } from 'vue'
import EntityTableFooter from 'src/components/Entity/EntityTableFooter.vue'
import RowActions from 'src/components/Entity/RowActions.vue'
import WalletDetails from './WalletDetails.vue'
import { WALLET_CURRENCIES, WALLET_TYPES, walletMoney } from 'src/services/walletModel'
const props = defineProps({
  type: { type: String, default: 'total' },
  rows: { type: Array, default: null },
})
const emit = defineEmits(['open'])
const titles = {
  total: 'Carteira Total Consolidada',
  deposit: 'Carteiras de Depósito',
  strategy: 'Carteiras Strategy',
  assets: 'Carteiras de Patrimônio',
}
const label = (type) =>
  type === 'assets'
    ? 'Carteira de Patrimônio'
    : WALLET_TYPES.find((item) => item.key === type)?.label || 'Carteira'
const view = ref('cards'),
  search = ref(''),
  currency = ref('all'),
  expanded = ref(null),
  page = ref(1),
  pageSize = ref(10)
const currencyOptions = [
  { label: 'Todas as moedas', value: 'all' },
  ...WALLET_CURRENCIES.map((item) => ({ label: item.code, value: item.code })),
]
const filtered = computed(() =>
  (props.rows || []).filter(
    (row) =>
      (props.type === 'total' || row.type === props.type) &&
      (currency.value === 'all' ||
        row.currencies?.some((item) => item.currency === currency.value)) &&
      (!search.value ||
        [row.clientName, row.clientCode, row.code].some((value) =>
          String(value || '')
            .toLocaleLowerCase()
            .includes(search.value.toLocaleLowerCase()),
        )),
  ),
)
const pageRows = computed(() =>
  filtered.value.slice((page.value - 1) * pageSize.value, page.value * pageSize.value),
)
watch([() => props.type, search, currency, () => props.rows], () => {
  page.value = 1
  expanded.value = null
})
function setPageSize(value) {
  pageSize.value = value
  page.value = 1
}
function toggle(key) {
  expanded.value = expanded.value === key ? null : key
}
const date = (value) =>
  value && !Number.isNaN(Date.parse(value)) ? new Date(value).toLocaleString('pt-BR') : '—'
function fields(row) {
  const totals = [
    { label: 'Moedas', value: row.currencies?.map((item) => item.currency).join(' · ') || '—' },
  ]
  if (row.type === 'strategy')
    totals.push(
      { label: 'Capital base', value: walletMoney(row.base, row.principalCurrency) },
      { label: 'Saldo atualizado', value: walletMoney(row.total, row.principalCurrency) },
      { label: 'Rendimento', value: row.yieldPercentage == null ? '—' : row.yieldPercentage + '%' },
    )
  else if (row.type === 'assets')
    totals.push(
      { label: 'Valor declarado', value: walletMoney(row.declared, row.principalCurrency) },
      { label: 'Valor atual', value: walletMoney(row.total, row.principalCurrency) },
      { label: 'Valorização', value: row.appreciation == null ? '—' : row.appreciation + '%' },
    )
  else
    totals.push(
      { label: 'Saldo atual', value: walletMoney(row.total, row.principalCurrency) },
      { label: 'Última movimentação', value: date(row.lastMovement) },
    )
  return totals
}
const columns = computed(() => [
  { name: 'wallet', label: 'Carteira', field: (row) => label(row.type), align: 'left' },
  { name: 'client', label: 'Cliente', field: 'clientName', align: 'left' },
  { name: 'clientCode', label: 'ID Cliente', field: 'clientCode', align: 'left' },
  {
    name: 'currencies',
    label: 'Moedas',
    field: (row) => row.currencies?.map((item) => item.currency).join(' · ') || '—',
    align: 'left',
  },
  ...fields({ type: props.type })
    .filter((field) => field.label !== 'Moedas')
    .map((field) => ({
      name: field.label,
      label: field.label,
      field: (row) =>
        props.type === 'total' && field.label === 'Saldo atual'
          ? walletMoney(row.total, row.principalCurrency)
          : props.type === 'total' && field.label === 'Última movimentação'
            ? date(row.lastMovement)
            : fields(row).find((item) => item.label === field.label)?.value || '—',
      align: 'right',
    })),
  { name: 'actions', label: 'Ações', field: 'key', align: 'right' },
])
</script>
<style scoped>
.directory-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  margin: 24px 0;
}
h2 {
  font-size: 20px;
  line-height: 1.4;
  margin: 0 0 6px;
}
.directory-toolbar p {
  color: #ffffff99;
  margin: 0;
  font-size: 13px;
}
.directory-filters {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 180px;
  gap: 16px;
  margin-bottom: 24px;
}
.directory-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 340px), 1fr));
  gap: 16px;
}
.directory-card {
  padding: 24px;
  border: 1px solid #ffffff33;
  border-radius: 14px;
  background: #ffffff0f;
  backdrop-filter: blur(20px);
  box-shadow: 4px 4px 12px #00000020;
  min-width: 0;
}
.directory-card header {
  display: flex;
  gap: 12px;
  align-items: center;
}
h3 {
  font-size: 16px;
  line-height: 1.5;
  margin: 0;
}
small,
dt {
  color: #ffffff99;
}
dl {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  border-block: 1px solid #ffffff20;
  padding-block: 16px;
  font-size: 14px;
}
dd {
  margin: 0;
  text-align: right;
  overflow-wrap: anywhere;
}
.card-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.card-actions :deep(.q-btn) {
  flex: 1;
}
@media (max-width: 500px) {
  .directory-filters {
    grid-template-columns: 1fr;
  }
}
.wallet-unavailable {
  border: 1px solid #ffffff33;
  border-radius: 8px;
  color: #dbdbdb;
}
.wallet-directory :deep(.q-table__container) {
  background: #ffffff06;
  border: 1px solid #ffffff20;
  border-radius: 12px;
}
.wallet-directory :deep(th) {
  background: #ffffff08;
}
</style>
