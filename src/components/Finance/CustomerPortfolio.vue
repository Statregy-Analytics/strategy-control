<template>
  <div class="q-pt-md">
    <label-form text-label="Cliente"><customer-select v-model="customerId" /></label-form>
    <p v-if="!customerId" class="text-muted q-mt-md">
      Selecione um cliente para consultar sua carteira.
    </p>
    <template v-else>
      <form-section title="Carteira consolidada"
        ><resource-state :state="portfolio.state" @retry="loadPortfolio"
          ><q-table
            flat
            dense
            :rows="portfolio.state.data?.currencies || []"
            :columns="portfolioColumns"
            row-key="currencyId"
            no-data-label="Nenhuma posição disponível" /></resource-state
      ></form-section>
      <form-section title="Composição por classe e origem"
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
      <form-section title="Saldos por carteira"
        ><resource-state :state="wallets.state" @retry="loadWallets"
          ><q-table
            flat
            dense
            :rows="wallets.state.data || []"
            :columns="walletColumns"
            row-key="id"
            no-data-label="Nenhuma carteira disponível" /></resource-state
      ></form-section>
      <form-section title="Extrato"
        ><div class="row q-col-gutter-md">
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
          label="Exportar extrato CSV"
          :loading="exporting"
          class="q-mt-md"
          @click="exportStatement"
      /></form-section>
      <form-section title="Patrimônio declarado"
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
const customerId = ref(null),
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
watch(customerId, () => {
  error.value = ''
  if (customerId.value) {
    loadPortfolio()
    loadComposition()
    loadWallets()
  }
})
const portfolioColumns = columns([
  ['currencyIsoCode', 'Moeda'],
  ['baseEquity', 'Patrimônio base', (r) => money(r.baseEquity, r.currencyIsoCode)],
  ['invested', 'Investido', (r) => money(r.invested, r.currencyIsoCode)],
  ['investable', 'Investível', (r) => money(r.investable, r.currencyIsoCode)],
  ['total', 'Total', (r) => money(r.total, r.currencyIsoCode)],
])
const compositionColumns = (currency) =>
  columns([
    ['className', 'Classe'],
    ['origin', 'Origem', (r) => financeLabel(r.origin)],
    ['value', 'Valor', (r) => money(r.value, currency)],
    [
      'sharePercentage',
      'Participação',
      (r) => (r.sharePercentage == null ? '—' : `${r.sharePercentage}%`),
    ],
  ])
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
</script>
