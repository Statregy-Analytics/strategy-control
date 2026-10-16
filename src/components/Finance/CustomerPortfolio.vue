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
            <p v-if="!portfolio.state.data?.currencies?.length" class="text-caption">
              Nenhuma posição disponível para este cliente.
            </p>
            <div
              v-for="currency in portfolio.state.data?.currencies || []"
              :key="currency.currencyId"
              class="portfolio-metrics"
            >
              <div v-for="metric in metrics" :key="metric.key" class="portfolio-metric">
                <div>
                  <span>{{ metric.label }}</span
                  ><small>{{ currency.currencyIsoCode }}</small>
                </div>
                <strong>{{ money(currency[metric.key], currency.currencyIsoCode) }}</strong>
              </div>
            </div>
          </div>
          <q-table
            v-else
            flat
            dense
            :rows="portfolio.state.data?.currencies || []"
            :columns="portfolioColumns"
            row-key="currencyId"
            no-data-label="Nenhuma posição disponível" /></resource-state
      ></form-section>
      <form-section :title="embedded ? 'Composição da carteira' : 'Composição por classe e origem'"
        ><resource-state :state="composition.state" @retry="loadComposition"
          ><p v-if="!composition.state.data?.currencies?.length">
            Nenhuma composição disponível para este cliente.
          </p>
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
              :rows="currency.items"
              :columns="compositionColumns(currency.currencyIsoCode)"
              row-key="classCode"
              no-data-label="Nenhuma composição disponível"
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
      <form-section :title="embedded ? 'Extrato da conta' : 'Extrato'">
        <q-markup-table v-if="embedded" flat dense class="profile-statement">
          <thead>
            <tr>
              <th
                v-for="label in ['Data e hora', 'Tipo', 'Carteira', 'Descrição', 'Valor', 'Saldo']"
                :key="label"
                class="text-left"
              >
                {{ label }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colspan="6" class="text-center text-muted">
                A consulta dos lançamentos ainda não está disponível. Use a exportação do extrato.
              </td>
            </tr>
          </tbody>
        </q-markup-table>
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
import { ref, watch } from 'vue'
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
const emit = defineEmits(['currencies'])
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
  wallets = useFinanceResource()
function onAssetsChanged() {
  loadPortfolio()
  loadComposition()
}
const loadPortfolio = () =>
  portfolio.load(
    async () => (await financeGet(`admin/customers/${customerId.value}/portfolio`)).data,
  )
const loadComposition = () =>
  composition.load(
    async () =>
      (await financeGet(`admin/customers/${customerId.value}/portfolio/composition`)).data,
  )
const loadWallets = () =>
  wallets.load(async () => (await financeGet(`admin/customers/${customerId.value}/wallets`)).data)
watch(
  () => props.customerId,
  (id) => {
    customerId.value = id
  },
)
watch(
  () => portfolio.state.data,
  (value) => emit('currencies', value?.currencies || []),
)
watch(
  customerId,
  () => {
    error.value = ''
    if (customerId.value) {
      loadPortfolio()
      loadComposition()
      if (!props.embedded) loadWallets()
    }
  },
  { immediate: true },
)
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
  grid-template-columns: repeat(4, minmax(0, 1fr));
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
