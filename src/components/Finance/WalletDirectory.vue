<template>
  <section class="wallet-directory">
    <q-btn
      flat
      no-caps
      class="directory-back"
      label="Voltar para Extrato Global"
      @click="emit('back')"
      ><img src="/icons/wallet-directory/arrow-left.svg" alt=""
    /></q-btn>
    <div class="directory-toolbar">
      <h2>{{ titles[type] }}</h2>
      <p>
        {{
          type === 'total'
            ? 'Todas as carteiras do sistema em uma visão unificada'
            : type === 'deposit'
              ? 'Recursos disponíveis para movimentação imediata'
              : type === 'assets'
                ? 'Bens declarados pelos clientes: imóveis, veículos, consórcios e investimentos'
                : 'Saldo que rende na Strategy, contratos vinculados e saldos por moeda'
        }}
      </p>
      <div class="directory-filters">
        <q-input
          v-model="search"
          outlined
          dense
          clearable
          :placeholder="searchLabel"
          :aria-label="searchLabel"
        >
          <template #prepend><img src="/icons/wallet-directory/search.svg" alt="" /></template>
        </q-input>
        <glass-select
          v-if="type === 'total' || type === 'assets'"
          v-model="kind"
          :disable="type === 'assets'"
          :options="type === 'assets' ? [] : typeOptions"
          placeholder="Tipo"
          aria-label="Tipo de carteira"
          clearable
          dropdown-icon="img:/icons/wallet-directory/chevron.svg"
        />
        <glass-select
          v-model="status"
          :options="statusOptions"
          placeholder="Status"
          aria-label="Status da carteira"
          clearable
          dropdown-icon="img:/icons/wallet-directory/chevron.svg"
        />
        <glass-select
          v-if="type === 'deposit' || type === 'strategy' || moreFilters"
          v-model="currency"
          :options="currencyOptions"
          placeholder="Moeda"
          aria-label="Filtrar moeda"
          clearable
          dropdown-icon="img:/icons/wallet-directory/chevron.svg"
        />
        <glass-select
          v-model="sort"
          :options="[{ label: sortLabel, value: 'desc', disable: !comparisonCurrency }]"
          :placeholder="sortLabel"
          aria-label="Ordenar carteiras"
          clearable
          dropdown-icon="img:/icons/wallet-directory/chevron.svg"
        />
        <q-btn
          outline
          no-caps
          label="Mais Filtros"
          :aria-expanded="moreFilters"
          :disable="type !== 'total'"
          @click="toggleFilters"
          ><img src="/icons/wallet-directory/filter.svg" alt=""
        /></q-btn>
        <div class="directory-view" role="group" aria-label="Visualização das carteiras">
          <button
            v-for="item in [
              { key: 'cards', label: 'Cards', icon: 'grid' },
              { key: 'list', label: 'Lista', icon: 'list' },
            ]"
            :key="item.key"
            :aria-label="item.label"
            :aria-pressed="view === item.key"
            @click="view = item.key"
          >
            <img :src="'/icons/wallet-directory/' + item.icon + '.svg'" alt="" />
          </button>
        </div>
      </div>
      <p class="directory-count">
        {{
          rows === null
            ? 'Quantidade de carteiras indisponível'
            : filtered.length + ' carteiras encontradas'
        }}
      </p>
    </div>
    <q-banner v-if="rows === null" class="q-my-md bg-transparent wallet-unavailable"
      >A consulta das carteiras ainda não está disponível.</q-banner
    >
    <div v-if="view === 'cards'" class="directory-cards">
      <wallet-directory-card
        v-for="row in pageRows"
        :key="row.key"
        :row="row"
        :mode="type"
        :fx="fx"
        :expanded="type === 'strategy' && expanded === row.key"
        @movements="emit('open', row.customerId, 'statement', row.type)"
        @open="
          type === 'strategy'
            ? toggle(row.key)
            : emit('open', row.customerId, 'portfolio', row.type)
        "
      >
        <wallet-details :row="row" compact @changed="emit('changed')" />
      </wallet-directory-card>
    </div>
    <q-table
      v-else
      class="directory-table"
      dark
      flat
      dense
      hide-pagination
      :rows="pageRows"
      :columns="columns"
      row-key="key"
      :pagination="{ rowsPerPage: 0 }"
      :no-data-label="rows === null ? 'Consulta indisponível' : 'Nenhuma carteira para exibir'"
    >
      <template #body="scope">
        <q-tr :props="scope">
          <q-td v-for="column in scope.cols" :key="column.name" :props="scope">
            <div v-if="column.name === 'wallet'" class="directory-identity">
              <img :src="walletIcon(scope.row.type)" alt="" />
              <div>
                <span>{{ label(scope.row.type) }}</span
                ><small :title="scope.row.code || ''">{{ scope.row.code || '—' }}</small>
              </div>
            </div>
            <div v-else-if="column.name === 'client'" class="directory-client-cell">
              <span>{{ scope.row.clientName || '—' }}</span>
              <small>{{
                type === 'deposit' ? scope.row.maskedDocument || '—' : scope.row.clientCode || '—'
              }}</small>
            </div>
            <span
              v-else-if="column.name === 'type'"
              class="directory-badge"
              :class="{ 'directory-badge--deposit': scope.row.type === 'deposit' }"
              >{{ typeBadge(scope.row.type) }}</span
            >
            <span
              v-else-if="column.name === 'status'"
              class="directory-badge"
              :class="statusClass(scope.row.status)"
              >{{ statusLabel(scope.row.status) }}</span
            >
            <div v-else-if="column.name === 'currencies'" class="directory-currency-chips">
              <span
                v-for="code in currenciesFor(scope.row)"
                :key="code"
                class="directory-currency"
                >{{ code }}</span
              ><span v-if="!currenciesFor(scope.row).length">—</span>
            </div>
            <div v-else-if="column.name === 'lastMovement'" class="directory-movement">
              <small v-if="type === 'deposit' && scope.row.lastMovementType">{{
                financeLabel(scope.row.lastMovementType)
              }}</small
              >{{ date(scope.row.lastMovement) }}
            </div>
            <span
              v-else-if="column.name === 'contractCount' || column.name === 'movementCount'"
              class="directory-count-cell"
              ><img
                v-if="scope.row[column.name] != null"
                :src="
                  '/icons/wallet-directory/' +
                  (column.name === 'contractCount' ? 'contract' : 'activity') +
                  '.svg'
                "
                alt=""
              />{{ scope.row[column.name] ?? '—' }}</span
            >
            <span v-else-if="column.name === 'holdings'" class="directory-count-cell"
              ><img
                v-if="scope.row.type === 'strategy' && scope.row.contractCount != null"
                src="/icons/wallet-directory/contract.svg"
                alt=""
              />{{ holdings(scope.row) }}</span
            >
            <div v-else-if="column.name === 'assets'" class="directory-client-cell">
              <span>{{ assetCountLabel(scope.row.assetCount) }}</span
              ><small v-if="scope.row.assetDescription">{{ scope.row.assetDescription }}</small>
            </div>
            <div
              v-else-if="column.name === 'yield' || column.name === 'appreciation'"
              :class="{
                'directory-positive':
                  Number(scope.row[column.name === 'yield' ? 'yieldPercentage' : 'appreciation']) >
                  0,
              }"
            >
              <span class="directory-count-cell"
                ><img
                  v-if="column.name === 'yield' && Number(scope.row.yieldPercentage) > 0"
                  src="/icons/wallet-directory/yield.svg"
                  alt=""
                />{{
                  percentage(
                    scope.row[column.name === 'yield' ? 'yieldPercentage' : 'appreciation'],
                  )
                }}</span
              >
              <small v-if="column.name === 'yield'" class="directory-yield-amount">{{
                walletMoney(scope.row.yieldAmount, scope.row.principalCurrency)
              }}</small>
            </div>
            <div v-else-if="column.name === 'actions'" class="directory-row-actions">
              <q-btn
                flat
                dense
                :aria-label="primaryActionLabel(scope.row)"
                :disable="
                  type !== 'total' &&
                  (scope.row.type === 'deposit' || scope.row.type === 'strategy')
                    ? scope.row.ledgerWalletIds?.length === 0
                    : false
                "
                :aria-expanded="
                  scope.row.type === 'assets' && type !== 'total'
                    ? expanded === scope.row.key
                    : undefined
                "
                @click="primaryAction(scope.row)"
                ><img src="/icons/wallet-directory/eye.svg" alt=""
              /></q-btn>
              <q-btn
                v-if="type === 'strategy'"
                flat
                dense
                :aria-label="'Ver contratos de ' + scope.row.clientName"
                :aria-expanded="expanded === scope.row.key"
                @click="toggle(scope.row.key)"
                ><img src="/icons/wallet-directory/contracts-action.svg" alt=""
              /></q-btn>
            </div>
            <span
              v-else-if="column.name === 'code' || column.name === 'clientCode'"
              class="directory-code"
              :title="column.value || ''"
              >{{ column.value || '—' }}</span
            >
            <strong
              v-else-if="column.name === 'balance' || column.name === 'declared'"
              class="directory-amounts"
              ><span v-for="amount in amountsFor(scope.row)" :key="amount.currency">{{
                walletMoney(
                  amount[column.name === 'declared' ? 'declared' : 'balance'],
                  amount.currency,
                )
              }}</span
              ><span v-if="!amountsFor(scope.row).length">—</span></strong
            >
            <strong v-else-if="column.money">{{ column.value }}</strong>
            <template v-else>{{ column.value ?? '—' }}</template>
          </q-td>
        </q-tr>
        <q-tr v-if="expanded === scope.row.key"
          ><q-td :colspan="columns.length"
            ><wallet-details :row="scope.row" @changed="emit('changed')" /></q-td
        ></q-tr>
      </template>
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
import GlassSelect from 'src/components/Entity/GlassSelect.vue'
import EntityTableFooter from 'src/components/Entity/EntityTableFooter.vue'
import { financeLabel } from 'src/services/financeService'
import WalletDirectoryCard from './WalletDirectoryCard.vue'
import WalletDetails from './WalletDetails.vue'
import { WALLET_TYPES, walletMoney } from 'src/services/walletModel'
import { foldSearch } from 'src/services/adminWorkspaceModel'
const props = defineProps({
  type: { type: String, default: 'total' },
  rows: { type: Array, default: null },
  fx: { type: Object, default: null },
})
const emit = defineEmits(['open', 'back', 'changed'])
const titles = {
  total: 'Carteira Total Consolidada',
  deposit: 'Carteiras de Depósito',
  strategy: 'Carteiras Strategy',
  assets: 'Carteiras de Patrimônio',
}
const label = (type) =>
  type === 'assets'
    ? 'Carteira de Patrimônio'
    : WALLET_TYPES.find((i) => i.key === type)?.label || 'Carteira'
const statusLabel = (value) =>
  ({ Active: 'Ativa', Inactive: 'Inativa', Pending: 'Pendente' })[value] || '—'
const view = ref('cards'),
  search = ref(''),
  currency = ref(null),
  kind = ref(null),
  status = ref(null),
  sort = ref(null),
  moreFilters = ref(false),
  expanded = ref(null),
  page = ref(1),
  pageSize = ref(10)
const searchLabel = computed(
  () =>
    ({
      total: 'Buscar por cliente, ID, carteira, tipo...',
      deposit: 'Buscar por cliente, ID, carteira, moeda...',
      assets: 'Buscar por cliente, ID, tipo de bem...',
      strategy: 'Buscar por cliente, carteira, contrato...',
    })[props.type],
)
const currencyOptions = computed(() =>
  [
    ...new Set(
      (props.rows || [])
        .filter((r) =>
          props.type === 'total' ? !kind.value || r.type === kind.value : r.type === props.type,
        )
        .flatMap((r) => r.currencies?.map((c) => c.currency) || []),
    ),
  ]
    .sort()
    .map((code) => ({ label: code, value: code })),
)
const sortLabel = computed(() => (props.type === 'strategy' ? 'Maior saldo' : 'Maior valor'))
const typeOptions = WALLET_TYPES.filter((t) => t.key !== 'total').map((t) => ({
  label: t.label,
  value: t.key,
}))
const statusOptions = computed(() =>
  [...new Set((props.rows || []).map((r) => r.status).filter(Boolean))].map((value) => ({
    label: statusLabel(value),
    value,
  })),
)
const comparisonCurrency = computed(
  () =>
    currency.value || (currencyOptions.value.length === 1 ? currencyOptions.value[0].value : null),
)
const filtered = computed(() => {
  const rows = (props.rows || []).filter(
    (r) =>
      (props.type === 'total' || r.type === props.type) &&
      (!kind.value || props.type !== 'total' || r.type === kind.value) &&
      (!status.value || r.status === status.value) &&
      (!currency.value || r.currencies?.some((c) => c.currency === currency.value)) &&
      (!search.value ||
        [
          r.clientName,
          r.clientCode,
          r.code,
          label(r.type),
          r.maskedDocument,
          ...(r.currencies || []).map((c) => c.currency),
        ].some((v) => foldSearch(v).includes(foldSearch(search.value)))),
  )
  if (sort.value && comparisonCurrency.value)
    rows.sort((a, b) => {
      const x = a.currencies?.find((c) => c.currency === comparisonCurrency.value)?.balance,
        y = b.currencies?.find((c) => c.currency === comparisonCurrency.value)?.balance
      return x == null ? (y == null ? 0 : 1) : y == null ? -1 : Number(y) - Number(x)
    })
  return rows
})
const pageRows = computed(() =>
  filtered.value.slice((page.value - 1) * pageSize.value, page.value * pageSize.value),
)
watch([() => props.type, search, currency, kind, status, sort, () => props.rows], () => {
  page.value = 1
  expanded.value = null
})
watch(
  () => props.type,
  () => {
    kind.value = null
    status.value = null
    currency.value = null
    sort.value = null
  },
)
watch(comparisonCurrency, (value) => {
  if (!value) sort.value = null
})
function toggleFilters() {
  moreFilters.value = !moreFilters.value
  if (!moreFilters.value) {
    currency.value = null
    if (!comparisonCurrency.value) sort.value = null
    page.value = 1
    expanded.value = null
  }
}
function setPageSize(value) {
  pageSize.value = value
  page.value = 1
}
function toggle(key) {
  expanded.value = expanded.value === key ? null : key
}
const date = (value) =>
  value && !Number.isNaN(Date.parse(value)) ? new Date(value).toLocaleString('pt-BR') : '—'
function displayAmounts(row, key = 'balance') {
  return (
    row.currencies
      ?.filter((c) => !currency.value || c.currency === currency.value)
      .map((c) => walletMoney(c[key], c.currency))
      .join(' · ') || '—'
  )
}
const typeBadge = (type) =>
  ({ deposit: 'Depósito', strategy: 'Strategy', assets: 'Patrimônio' })[type] || '—'
const walletIcon = (type) => '/icons/wallet-directory/wallet-' + type + '.svg'
const statusClass = (value) => ({
  positive: value === 'Active',
  'directory-badge--pending': value === 'Pending',
})
const amountsFor = (row) =>
  (row.currencies || []).filter((c) => !currency.value || c.currency === currency.value)
const currenciesFor = (row) => [
  ...new Set((row.currencies || []).map((c) => c.currency).filter(Boolean)),
]
const percentage = (value) =>
  value == null || !Number.isFinite(Number(value))
    ? '—'
    : (Number(value) > 0 ? '+' : '') +
      Number(value).toLocaleString('pt-BR', { maximumFractionDigits: 2 }) +
      '%'
const assetCountLabel = (count) =>
  count == null ? '—' : count + (Number(count) === 1 ? ' bem' : ' bens')
const holdings = (row) =>
  row.type === 'strategy'
    ? (row.contractCount ?? '—')
    : row.type === 'assets' && row.assetCount != null
      ? assetCountLabel(row.assetCount)
      : '—'
const primaryActionLabel = (row) =>
  (props.type === 'total'
    ? 'Abrir carteira de '
    : row.type === 'assets'
      ? 'Ver bens de '
      : 'Ver movimentações de ') + row.clientName
function primaryAction(row) {
  if (props.type === 'total') emit('open', row.customerId, 'portfolio', row.type)
  else if (row.type === 'assets') toggle(row.key)
  else emit('open', row.customerId, 'statement', row.type)
}
const col = (name, label, field = name, money = false) => ({
  name,
  label,
  field,
  align: money ? 'right' : 'left',
  money,
})
const columns = computed(() => {
  const identity = [col('wallet', 'Carteira', (r) => label(r.type))]
  const tail = [col('status', 'Status'), col('actions', '', 'key')]
  if (props.type === 'total')
    return [
      ...identity,
      col('type', 'Tipo'),
      col('client', 'Cliente', 'clientName'),
      col('code', 'ID Carteira'),
      col('balance', 'Saldo', (r) => displayAmounts(r), true),
      col('currencies', 'Moedas'),
      col('status', 'Status'),
      col('lastMovement', 'Última movimentação'),
      col('holdings', 'Contratos / Bens'),
      col('actions', '', 'key'),
    ]
  if (props.type === 'deposit')
    return [
      ...identity,
      col('client', 'Cliente', 'clientName'),
      col('clientCode', 'ID Cliente'),
      col('currencies', 'Moedas'),
      col('balance', 'Saldo', (r) => displayAmounts(r), true),
      col('lastMovement', 'Última movimentação'),
      col('movementCount', 'Movimentações'),
      ...tail,
    ]
  if (props.type === 'assets')
    return [
      ...identity,
      col('client', 'Cliente', 'clientName'),
      col('assets', 'Bens'),
      col('declared', 'Valor declarado', (r) => displayAmounts(r, 'declared'), true),
      col('current', 'Valor atual', (r) => walletMoney(r.currentTotal, r.principalCurrency), true),
      col('appreciation', 'Valorização'),
      col('variation', 'Variação', (r) => walletMoney(r.variation, r.principalCurrency), true),
      ...tail,
    ]
  return [
    ...identity,
    col('client', 'Cliente', 'clientName'),
    col('contractCount', 'N° contratos'),
    col('base', 'Capital base', (r) => walletMoney(r.base, r.principalCurrency), true),
    col('balance', 'Saldo atual', (r) => displayAmounts(r), true),
    col('yield', 'Rendimento'),
    col('currencies', 'Moedas'),
    ...tail,
  ]
})
</script>
<style scoped>
.wallet-directory {
  color: #fff;
}
.directory-back {
  margin: 16px 0;
  border: 1px solid #ffffff33;
  border-radius: 8px;
  background: #ffffff0f;
}
.directory-toolbar {
  padding: 16px;
  margin-bottom: 24px;
  border: 1px solid #ffffff33;
  border-radius: 12px;
  background: linear-gradient(90deg, #ffffff0f, #ffffff05, #ffffff0f);
}
h2 {
  font-size: 20px;
  line-height: 28px;
  margin: 0 0 4px;
  font-weight: 600;
}
.directory-toolbar p {
  color: #ffffffb8;
  font-size: 13px;
  margin: 0;
}
.directory-filters {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
  margin-top: 16px;
}
.directory-filters > .q-input {
  flex: 2 1 280px;
  min-width: 0;
}
.directory-filters > :deep(.q-field) {
  flex: 1 1 120px;
  min-width: 0;
}
.directory-filters img {
  flex: none;
}
.directory-filters .q-btn :deep(.q-btn__content),
.card-actions .q-btn :deep(.q-btn__content) {
  flex-direction: row-reverse;
  gap: 8px;
}
.directory-view {
  display: flex;
  gap: 4px;
  padding: 4px;
  border: 1px solid #ffffff33;
  border-radius: 8px;
}
.directory-view button {
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 5px;
  background: transparent;
  width: 48px;
  height: 32px;
  cursor: pointer;
}
.directory-view button[aria-pressed='true'] {
  background: #ffffff26;
}
.directory-count {
  margin-top: 16px !important;
}
.directory-cards {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}
.directory-card {
  padding: 24px;
  border: 1px solid #ffffff33;
  border-radius: 14px;
  background: linear-gradient(90deg, #ffffff14, #ffffff08, #ffffff0f);
  backdrop-filter: blur(20px);
  min-width: 0;
  box-shadow: 4px 4px 6px #00000021;
}
.directory-card header {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}
.directory-card header > div {
  flex: 1;
  min-width: 0;
}
.directory-card-icon {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border: 1px solid #ffffff33;
  border-radius: 10px;
  background: #ffffff0f;
  flex: none;
}
h3 {
  font-size: 16px;
  line-height: 24px;
  margin: 0;
  font-weight: 600;
}
small,
dt,
.directory-client-id {
  color: #ffffff99;
}
.directory-card header small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 11px;
}
.directory-client {
  display: flex;
  gap: 8px;
  align-items: center;
  margin: 16px 0 6px;
  overflow-wrap: anywhere;
}
.directory-client-id {
  font-size: 12px;
  margin: 0 0 16px;
  overflow-wrap: anywhere;
}
.directory-badge {
  display: inline-block;
  border: 1px solid #ffffff80;
  border-radius: 6px;
  padding: 2px 8px;
  font-size: 11px;
  white-space: nowrap;
}
.directory-badge.positive {
  color: #7bf1a8;
  border-color: #00c950;
  background: #00c9501a;
}
dl {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 8px;
  border-top: 1px solid #ffffff20;
  padding-top: 16px;
  font-size: 12px;
  margin: 0;
}
dd {
  margin: 0;
  color: white;
  font-size: 24px;
  line-height: 32px;
  font-weight: 700;
  overflow-wrap: anywhere;
}
.directory-links {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #ffffffb8;
  font-size: 12px;
  margin: 16px 0;
}
.directory-state {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  border-top: 1px solid #ffffff20;
  padding-top: 12px;
  margin-top: 16px;
}
.directory-state small {
  font-size: 12px;
}
.card-actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
  flex-wrap: wrap;
}
.card-actions .q-btn {
  flex: 1;
  border-radius: 8px;
  background: #ffffff0f;
  min-width: 130px;
}
button:focus-visible {
  outline: 2px solid #2b7fff;
  outline-offset: 3px;
}
.wallet-directory :deep(.q-table__container) {
  color: #fff;
  background: #ffffff06;
  border: 1px solid #ffffff20;
  border-radius: 12px;
}
.wallet-directory :deep(.q-table th) {
  background: #ffffff08;
}
.wallet-unavailable {
  border: 1px solid #ffffff33;
  border-radius: 8px;
  color: #fff;
}
@media (max-width: 1300px) {
  .directory-cards {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 800px) {
  .directory-cards {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
<style scoped>
.wallet-directory :deep(.q-select__dropdown-icon) {
  width: 16px;
  height: 16px;
  font-size: 16px;
}
</style>

<style scoped src="./walletDirectoryReview.scss"></style>
