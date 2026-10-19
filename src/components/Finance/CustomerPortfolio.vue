<template>
  <div :class="embedded ? 'profile-portfolio' : 'q-pt-md'">
    <label-form v-if="!embedded" text-label="Cliente"
      ><customer-select v-model="customerId"
    /></label-form>
    <p v-if="!customerId" class="text-muted q-mt-md">
      Selecione um cliente para consultar sua carteira.
    </p>
    <template v-else>
      <form-section title="Carteira consolidada"
        ><resource-state :state="portfolio.state" @retry="loadPortfolio"
          ><div v-if="embedded" class="portfolio-currencies">
            <p v-if="!displayCurrencies.length" class="text-caption">
              Nenhuma posição disponível para este cliente.
            </p>
            <div
              v-for="currency in displayCurrencies"
              :key="currency.currencyId"
              class="portfolio-currency"
            >
              <div class="portfolio-metrics">
                <component
                  :is="metric.key === 'invested' && !currency.empty ? 'button' : 'div'"
                  v-for="metric in metrics"
                  :key="metric.key"
                  class="portfolio-metric"
                  :class="{
                    'portfolio-metric--selected':
                      !currency.empty &&
                      metric.key === 'invested' &&
                      selectedCurrency === currency.currencyId,
                  }"
                  :type="metric.key === 'invested' ? 'button' : undefined"
                  :aria-label="
                    metric.key === 'invested' && !currency.empty
                      ? `Contratos do saldo investido em ${currency.currencyIsoCode}`
                      : undefined
                  "
                  :aria-expanded="
                    metric.key === 'invested' && !currency.empty
                      ? selectedCurrency === currency.currencyId
                      : undefined
                  "
                  @click="
                    metric.key === 'invested' &&
                    !currency.empty &&
                    toggleContracts(currency.currencyId)
                  "
                >
                  <div>
                    <span>{{ metric.label }}</span
                    ><small v-if="!currency.empty">{{ currency.currencyIsoCode }}</small>
                  </div>
                  <strong>{{ money(currency[metric.key], currency.currencyIsoCode) }}</strong>
                  <img
                    v-if="currency.empty && metric.key === 'total'"
                    src="/icons/client-profile/portfolio-empty.svg"
                    alt=""
                    class="portfolio-empty-ring"
                  />
                </component>
              </div>
              <client-portfolio-contracts
                v-if="!currency.empty && selectedCurrency === currency.currencyId"
                :customer-id="customerId"
                :currency-id="currency.currencyId"
                :currency-code="currency.currencyIsoCode"
              />
            </div>
          </div>
          <q-table
            v-else
            flat
            dense
            :rows="displayCurrencies"
            :columns="portfolioColumns"
            row-key="currencyId"
            no-data-label="Nenhuma posição disponível" /></resource-state
      ></form-section>
      <form-section
        class="portfolio-composition-section"
        :title="embedded ? 'Composição da carteira' : 'Composição por classe e origem'"
        ><resource-state :state="composition.state" @retry="loadComposition"
          ><q-markup-table
            v-if="!composition.state.data?.currencies?.length"
            flat
            dense
            class="portfolio-composition-empty"
          >
            <thead>
              <tr>
                <th
                  v-for="column in compositionColumns('BRL')"
                  :key="column.name"
                  class="text-left"
                >
                  {{ column.label }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td :colspan="compositionColumns('BRL').length">
                  <div class="portfolio-empty-message">Nenhuma composição ainda</div>
                </td>
              </tr>
            </tbody>
          </q-markup-table>
          <div
            v-for="currency in composition.state.data?.currencies || []"
            :key="currency.currencyId"
            class="q-mb-md"
          >
            <div class="text-weight-medium">
              {{ currency.currencyIsoCode }} · {{ money(currency.total, currency.currencyIsoCode) }}
            </div>
            <q-table
              flat
              dense
              :hide-bottom="embedded"
              :pagination="embedded ? { rowsPerPage: 0 } : undefined"
              :rows="currency.items"
              :columns="compositionColumns(currency.currencyIsoCode)"
              row-key="classCode"
              no-data-label="Nenhuma composição ainda"
            /></div></resource-state
      ></form-section>
      <form-section v-if="!embedded" title="Saldos por carteira"
        ><resource-state :state="wallets.state" @retry="loadWallets"
          ><q-table
            flat
            dense
            :rows="wallets.state.data || []"
            :columns="walletColumns"
            row-key="id"
            no-data-label="Nenhuma carteira disponível" /></resource-state
      ></form-section>
      <form-section :title="embedded ? '' : 'Extrato'">
        <div v-if="embedded" class="statement-heading">
          <img src="/icons/client-profile/statement.svg" alt="" /><span>Extrato da conta</span
          ><q-btn
            flat
            dense
            no-caps
            label="Exportar"
            :loading="exporting"
            @click="exportStatement"
          />
        </div>
        <resource-state v-if="embedded" :state="statement.state" @retry="loadStatement">
          <q-markup-table
            flat
            dense
            class="profile-statement"
            :class="{ 'profile-statement--entries': statement.state.data?.length }"
          >
            <thead>
              <tr>
                <th
                  v-for="(label, index) in [
                    'Data e hora',
                    'Tipo',
                    'Carteira',
                    'Descrição',
                    'Valor',
                    'Saldo',
                  ]"
                  :key="label"
                  :class="index >= 4 ? 'text-right' : 'text-left'"
                >
                  {{ label }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!statement.state.data?.length">
                <td colspan="6" class="text-center text-muted statement-empty">
                  Nenhum lançamento ainda
                </td>
              </tr>
              <tr v-for="entry in statement.state.data || []" :key="entry.key">
                <td>{{ new Date(entry.occurredAtUtc).toLocaleString('pt-BR') }}</td>
                <td>{{ financeLabel(entry.type) }}</td>
                <td>{{ financeLabel(entry.wallet) }}</td>
                <td>{{ entry.requestNumber || '—' }}</td>
                <td class="text-right">
                  {{ entry.direction === 'Debit' ? '−' : ''
                  }}{{ money(entry.amount, entry.currencyIsoCode) }}
                </td>
                <td class="text-right">{{ money(entry.balanceAfter, entry.currencyIsoCode) }}</td>
              </tr>
            </tbody>
          </q-markup-table>
        </resource-state>
        <div v-else class="row q-col-gutter-md">
          <label-form class="col-12 col-sm-6" text-label="De"
            ><q-input
              v-model="dateFrom"
              outlined
              dense
              type="date"
              aria-label="Extrato de" /></label-form
          ><label-form class="col-12 col-sm-6" text-label="Até"
            ><q-input v-model="dateTo" outlined dense type="date" aria-label="Extrato até"
          /></label-form>
        </div>
        <q-banner v-if="error" role="alert">{{ error }}</q-banner
        ><q-btn
          v-if="!embedded"
          flat
          dense
          no-caps
          icon="download"
          :label="embedded ? 'Exportar' : 'Exportar extrato CSV'"
          :loading="exporting"
          class="q-mt-md"
          @click="exportStatement"
      /></form-section>
      <form-section v-if="!embedded" title="Patrimônio declarado"
        ><customer-assets
          :key="customerId"
          :customer-id="customerId"
          :currencies="portfolio.state.data?.currencies || []"
          @changed="onAssetsChanged"
      /></form-section>
    </template>
  </div>
</template>
<script setup>
import { computed, onScopeDispose, ref, watch } from 'vue'
import {
  portfolioCurrencies,
  readCustomerStatement,
} from 'src/services/customerPortfolioPresentation'
import ClientPortfolioContracts from 'src/components/Clients/ClientPortfolioContracts.vue'
import CustomerSelect from './CustomerSelect.vue'
import ResourceState from './ResourceState.vue'
import CustomerAssets from './CustomerAssets.vue'
import FormSection from 'src/components/Entity/FormSection.vue'
import LabelForm from 'src/components/Form/LabelForm.vue'
import { useFinanceResource } from 'src/composables/useFinanceResource'
import {
  financeGet,
  financeExport,
  money,
  columns,
  financeLabel,
} from 'src/services/financeService'
const props = defineProps({
  customerId: { type: String, default: null },
  embedded: { type: Boolean, default: false },
})
const emit = defineEmits(['currencies', 'calculated'])
const selectedCurrency = ref(null)
const toggleContracts = (id) => {
  selectedCurrency.value = selectedCurrency.value === id ? null : id
}
const metrics = [
  { key: 'baseEquity', label: 'Saldo base (patrimônio)' },
  { key: 'invested', label: 'Saldo investido' },
  { key: 'investable', label: 'Saldo investível' },
  { key: 'total', label: 'Carteira total' },
]
const customerId = ref(props.customerId),
  dateFrom = ref(''),
  dateTo = ref(''),
  exporting = ref(false),
  error = ref('')
const portfolio = useFinanceResource(),
  composition = useFinanceResource(),
  wallets = useFinanceResource(),
  statement = useFinanceResource()
let revision = 0
const displayCurrencies = computed(() =>
  portfolioCurrencies(portfolio.state, composition.state, wallets.state),
)
const loadStatement = () => {
  const version = revision
  const id = customerId.value
  return statement.load(async () => {
    const values = await loadWallets()
    return readCustomerStatement(
      values,
      (walletId, params) =>
        financeGet(`admin/wallets/${encodeURIComponent(walletId)}/statement`, params),
      () => {
        if (version !== revision || id !== customerId.value) throw new Error('Consulta encerrada.')
      },
    )
  })
}
function onAssetsChanged() {
  loadPortfolio()
  loadComposition()
}
const readPortfolio = async (suffix) => {
  const id = customerId.value
  const data = (await financeGet(`admin/customers/${id}/${suffix}`)).data
  if (data?.customerId !== id || !Array.isArray(data?.currencies))
    throw new Error('Não foi possível confirmar a carteira deste cliente.')
  return data
}
const loadPortfolio = () => portfolio.load(() => readPortfolio('portfolio'))
const loadComposition = () => composition.load(() => readPortfolio('portfolio/composition'))
const loadWallets = () =>
  wallets.load(async () => {
    const data = (await financeGet(`admin/customers/${customerId.value}/wallets`)).data
    if (!Array.isArray(data)) throw new Error('Não foi possível confirmar as carteiras.')
    return data
  })
watch(
  () => props.customerId,
  (id) => {
    customerId.value = id
  },
)
watch(
  () => portfolio.state.data,
  (value) => {
    emit('currencies', value?.currencies || [])
    emit('calculated', value?.isAutomaticallyCalculated === true)
  },
)
watch(
  customerId,
  () => {
    revision++
    ;[portfolio, composition, wallets, statement].forEach((resource) => resource.reset())
    error.value = ''
    selectedCurrency.value = null
    if (customerId.value) {
      loadPortfolio()
      loadComposition()
      if (props.embedded) loadStatement()
      else loadWallets()
    }
  },
  { immediate: true },
)
onScopeDispose(() => {
  revision++
  ;[portfolio, composition, wallets, statement].forEach((resource) => resource.reset())
})
const portfolioColumns = columns([
  ['currencyIsoCode', 'Moeda'],
  ['baseEquity', 'Patrimônio base', (r) => money(r.baseEquity, r.currencyIsoCode)],
  ['invested', 'Investido', (r) => money(r.invested, r.currencyIsoCode)],
  ['investable', 'Investível', (r) => money(r.investable, r.currencyIsoCode)],
  ['total', 'Total', (r) => money(r.total, r.currencyIsoCode)],
])
const compositionColumns = (currency) =>
  columns(
    props.embedded
      ? [
          ['className', 'Tipo de carteira / classe'],
          ['value', 'Valor', (r) => money(r.value, currency)],
          ['origin', 'Origem', (r) => financeLabel(r.origin)],
          [
            'lastUpdatedAtUtc',
            'Última atualização',
            (r) =>
              r.lastUpdatedAtUtc
                ? new Date(r.lastUpdatedAtUtc).toLocaleString('pt-BR', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })
                : 'Não informado',
          ],
        ]
      : [
          ['className', 'Classe'],
          ['origin', 'Origem', (r) => financeLabel(r.origin)],
          ['value', 'Valor', (r) => money(r.value, currency)],
          [
            'sharePercentage',
            'Participação',
            (r) => (r.sharePercentage == null ? '—' : `${r.sharePercentage}%`),
          ],
        ],
  )
const walletColumns = columns([
  ['type', 'Carteira', (r) => financeLabel(r.type)],
  ['balance', 'Saldo', (r) => money(r.balance, r.currencyIsoCode)],
  ['reserved', 'Reservado', (r) => money(r.reserved, r.currencyIsoCode)],
  ['available', 'Disponível', (r) => money(r.available, r.currencyIsoCode)],
])
async function exportStatement() {
  error.value = ''
  if (dateFrom.value && dateTo.value && dateFrom.value > dateTo.value) {
    error.value = 'A data final deve ser posterior à inicial.'
    return
  }
  exporting.value = true
  try {
    await financeExport(
      `admin/customers/${customerId.value}/statement/export`,
      { format: 'csv', dateFrom: dateFrom.value || undefined, dateTo: dateTo.value || undefined },
      'extrato.csv',
    )
  } catch {
    error.value = 'Não foi possível exportar o extrato.'
  } finally {
    exporting.value = false
  }
}
defineExpose({ refresh: onAssetsChanged })
</script>
<style scoped>
.portfolio-metric {
  position: relative;
  min-height: 102px;
}
.portfolio-metric:has(.portfolio-empty-ring) {
  padding-right: 76px;
  color: var(--sa-muted);
}
.portfolio-empty-ring {
  position: absolute;
  right: 16px;
  top: 24px;
  width: 52px;
  height: 52px;
}
.profile-portfolio > :deep(.form-section.portfolio-composition-section) {
  padding: 0;
  border: 1px solid var(--sa-border);
  border-radius: 10px;
  background: var(--sa-surface-soft);
  overflow: hidden;
}
.profile-portfolio :deep(.portfolio-composition-section .form-section__title) {
  padding: 8px 16px;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: var(--sa-muted);
  border-bottom: 1px solid var(--sa-border);
}
.profile-portfolio :deep(.portfolio-composition-section .q-mt-md) {
  margin-top: 0;
}
.portfolio-empty-message {
  width: 100%;
  min-height: 118px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--sa-muted);
  font-size: 14px;
}
.portfolio-composition-empty :deep(.q-table__bottom) {
  padding: 0;
}
.profile-portfolio :deep(th) {
  height: 40px;
  color: var(--sa-muted);
  font-size: 12px;
  text-transform: uppercase;
  white-space: normal;
}
.statement-heading {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  text-transform: uppercase;
  letter-spacing: 0.7px;
  font-size: 14px;
}
.statement-heading img {
  width: 16px;
  height: 16px;
}
.statement-heading .q-btn {
  margin-left: auto;
  text-transform: none;
  border: 1px solid var(--sa-border);
  border-radius: 8px;
  padding: 4px 10px;
  font-size: 12px;
}
.profile-statement .statement-empty {
  height: 300px;
  font-size: 14px;
}
.profile-portfolio > :deep(.form-section) {
  padding: 24px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
}
.profile-portfolio > :deep(.form-section:first-child) {
  padding-top: 0;
  border: 0;
}
.profile-portfolio > :deep(.form-section:first-child .form-section__title) {
  display: none;
}
.profile-portfolio > :deep(.form-section:first-child .q-mt-md) {
  margin-top: 0;
}
.portfolio-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 230px), 1fr));
  gap: 16px;
  margin-bottom: 16px;
}
.profile-statement {
  color: inherit;
  background: transparent;
  border: 1px solid var(--sa-border);
  border-radius: 8px;
}
.profile-statement :deep(table) {
  table-layout: fixed;
  width: 100%;
}
.profile-statement :deep(th),
.profile-statement :deep(td) {
  overflow-wrap: anywhere;
  padding: 8px;
}
.profile-statement th,
.profile-statement td {
  white-space: normal;
}
.profile-statement--entries :deep(table) {
  min-width: 590px;
}
.profile-statement--entries th:nth-last-child(-n + 2) {
  width: 112px;
}
.profile-statement--entries th:first-child {
  width: 110px;
}
.profile-statement td:not([colspan]):first-child {
  overflow-wrap: normal;
}
.profile-statement td:not([colspan]):nth-last-child(-n + 2) {
  white-space: nowrap;
  overflow-wrap: normal;
  font-variant-numeric: tabular-nums;
}
.portfolio-metric--selected {
  border-bottom: 4px solid #51b8ff !important;
}
button.portfolio-metric {
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}
button.portfolio-metric:hover {
  background: rgba(255, 255, 255, 0.1);
}
.portfolio-metric {
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  background: var(--sa-surface-soft);
}
.portfolio-metric > div {
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: 8px;
  color: rgba(255, 255, 255, 0.68);
  font-size: 11px;
}
.portfolio-metric small {
  padding: 2px 5px;
  border-radius: 4px;
  background: var(--sa-surface-soft);
}
.portfolio-metric strong {
  display: block;
  margin-top: 16px;
  font-size: 18px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  overflow-wrap: anywhere;
}
@media (max-width: 1200px) {
  .portfolio-metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 600px) {
  .portfolio-metrics {
    grid-template-columns: 1fr;
  }
}
</style>
