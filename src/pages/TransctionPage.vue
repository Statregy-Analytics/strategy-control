<template>
  <q-page class="q-pa-md transactions-page">
    <title-page
      ><template #heading
        ><h1 class="transaction-heading">Transações</h1>
        <p class="transaction-subtitle">Centro operacional de movimentações</p></template
      ><template #actions
        ><div class="transaction-header-actions">
          <q-btn
            outline
            no-caps
            label="Exportar"
            disable
            title="Exportação global indisponível no momento."
            ><img src="/icons/wallet-directory/download.svg" alt="" /></q-btn
          ><q-btn outline no-caps label="Nova Transação" @click="createOpen = true"
            ><img src="/icons/wallet-directory/plus.svg" alt=""
          /></q-btn></div></template
    ></title-page>
    <resource-state :state="globalPortfolio.state" @retry="loadGlobalPortfolio">
      <wallet-overview
        :model="globalSummary"
        :details="false"
        :initial-type="tab === 'wallets' ? walletType : 'total'"
        @select="selectWallet"
      />
    </resource-state>
    <q-tabs v-if="tab !== 'wallets'" v-model="tab" align="left" dense active-color="primary"
      ><q-tab name="transactions" label="Transações" no-caps /><q-tab
        name="wallets"
        label="Carteiras"
        no-caps
    /></q-tabs>
    <q-separator v-if="tab !== 'wallets'" />
    <div v-if="tab === 'transactions'" class="q-pt-md">
      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-12 col-sm">
          <q-input
            v-model="search"
            outlined
            dense
            debounce="350"
            placeholder="Buscar solicitações"
            aria-label="Buscar solicitações"
          />
        </div>
      </div>
      <form-section title="Solicitações pendentes">
        <finance-table
          ref="pendingTable"
          path="admin/transactions"
          :params="pendingParams"
          :columns="transactionColumns"
        >
          <template #body-cell-type="p"
            ><q-td :props="p"
              ><div class="contract-transaction-type">
                <img
                  v-if="isContractTransaction(p.row)"
                  :src="
                    '/icons/contracts/flows/2349-281-img' +
                    (p.row.source?.kind === 'Contract' ? 'Icon3' : 'Icon') +
                    '.svg'
                  "
                  alt=""
                />{{ contractTransactionLabel(p.row) || financeLabel(p.row.type) }}
              </div></q-td
            ></template
          >
          <template #body-cell-source="p"
            ><q-td :props="p"
              ><div>{{ contractEndpoint(p.row.source, contractSourceCurrency(p.row)).title }}</div>
              <small>{{
                contractEndpoint(p.row.source, contractSourceCurrency(p.row)).detail
              }}</small></q-td
            ></template
          >
          <template #body-cell-destination="p"
            ><q-td :props="p"
              ><div>
                {{
                  p.row.destinationClient?.name ||
                  contractEndpoint(p.row.destination, p.row.currencyIsoCode).title
                }}
              </div>
              <small>{{
                p.row.destinationClient
                  ? contractEndpoint(p.row.destination, p.row.currencyIsoCode).title +
                    ' · ' +
                    (p.row.currencyIsoCode || '')
                  : contractEndpoint(p.row.destination, p.row.currencyIsoCode).detail
              }}</small></q-td
            ></template
          >
          <template #body-cell-amount="p"
            ><q-td :props="p"
              ><strong>{{ money(p.row.amount, p.row.currencyIsoCode) }}</strong
              ><small v-if="p.row.conversion"
                >{{ money(p.row.conversion.sourceAmount, p.row.conversion.sourceCurrencyIsoCode) }}
                ×
                {{
                  Number(p.row.conversion.exchangeRate).toLocaleString('pt-BR', {
                    minimumFractionDigits: 4,
                    maximumFractionDigits: 4,
                  })
                }}</small
              ></q-td
            ></template
          >
          <template #body-cell-status="p"
            ><q-td :props="p"
              ><span
                class="contract-flow__badge"
                :class="[
                  contractTransactionTone(p.row),
                  { 'transaction-error': p.row.status === 'Error' },
                ]"
                ><img
                  v-if="p.row.status === 'Completed'"
                  src="/icons/contracts/flows/2349-281-imgIcon1.svg"
                  alt=""
                />{{
                  p.row.status === 'Completed' ? 'Processada' : financeLabel(p.row.status)
                }}</span
              ></q-td
            ></template
          >
          <template #body-cell-actions="p"
            ><q-td :props="p"
              ><q-btn flat dense aria-label="Abrir transação" @click="open(p.row.id)"
                ><img src="/icons/contracts/flows/2349-281-imgIcon2.svg" alt="" /></q-btn></q-td
          ></template>
        </finance-table>
      </form-section>
      <form-section title="Histórico de transações">
        <finance-table
          ref="table"
          path="admin/transactions"
          :params="historyParams"
          :columns="transactionColumns"
          ><template #body-cell-type="p"
            ><q-td :props="p"
              ><div class="contract-transaction-type">
                <img
                  v-if="isContractTransaction(p.row)"
                  :src="
                    '/icons/contracts/flows/2349-281-img' +
                    (p.row.source?.kind === 'Contract' ? 'Icon3' : 'Icon') +
                    '.svg'
                  "
                  alt=""
                />{{ contractTransactionLabel(p.row) || financeLabel(p.row.type) }}
              </div></q-td
            ></template
          >
          <template #body-cell-source="p"
            ><q-td :props="p"
              ><div>{{ contractEndpoint(p.row.source, contractSourceCurrency(p.row)).title }}</div>
              <small>{{
                contractEndpoint(p.row.source, contractSourceCurrency(p.row)).detail
              }}</small></q-td
            ></template
          >
          <template #body-cell-destination="p"
            ><q-td :props="p"
              ><div>
                {{
                  p.row.destinationClient?.name ||
                  contractEndpoint(p.row.destination, p.row.currencyIsoCode).title
                }}
              </div>
              <small>{{
                p.row.destinationClient
                  ? contractEndpoint(p.row.destination, p.row.currencyIsoCode).title +
                    ' · ' +
                    (p.row.currencyIsoCode || '')
                  : contractEndpoint(p.row.destination, p.row.currencyIsoCode).detail
              }}</small></q-td
            ></template
          >
          <template #body-cell-amount="p"
            ><q-td :props="p"
              ><strong>{{ money(p.row.amount, p.row.currencyIsoCode) }}</strong
              ><small v-if="p.row.conversion"
                >{{ money(p.row.conversion.sourceAmount, p.row.conversion.sourceCurrencyIsoCode) }}
                ×
                {{
                  Number(p.row.conversion.exchangeRate).toLocaleString('pt-BR', {
                    minimumFractionDigits: 4,
                    maximumFractionDigits: 4,
                  })
                }}</small
              ></q-td
            ></template
          >
          <template #body-cell-status="p"
            ><q-td :props="p"
              ><span
                class="contract-flow__badge"
                :class="[
                  contractTransactionTone(p.row),
                  { 'transaction-error': p.row.status === 'Error' },
                ]"
                ><img
                  v-if="p.row.status === 'Completed'"
                  src="/icons/contracts/flows/2349-281-imgIcon1.svg"
                  alt=""
                />{{
                  p.row.status === 'Completed' ? 'Processada' : financeLabel(p.row.status)
                }}</span
              ></q-td
            ></template
          >
          <template #body-cell-actions="p"
            ><q-td :props="p"
              ><q-btn flat dense aria-label="Abrir transação" @click="open(p.row.id)"
                ><img
                  src="/icons/contracts/flows/2349-281-imgIcon2.svg"
                  alt="" /></q-btn></q-td></template
        ></finance-table>
      </form-section>
    </div>
    <div v-else-if="tab === 'wallets'">
      <resource-state
        v-if="globalFailures"
        :state="{
          loading: false,
          error:
            'Não foi possível consultar a carteira de ' +
            globalFailures +
            ' cliente(s). Os demais resultados estão disponíveis.',
        }"
        @retry="loadGlobalPortfolio"
      />
      <resource-state :state="globalPortfolio.state" @retry="loadGlobalPortfolio"
        ><wallet-directory
          :type="walletType"
          :rows="globalRows"
          @open="openPortfolio"
          @back="tab = 'transactions'"
          @changed="loadGlobalPortfolio"
      /></resource-state>
    </div>
    <q-dialog
      v-model="portfolioOpen"
      position="right"
      full-height
      full-width
      maximized
      class="control-width"
      ><q-card
        ><title-card
          :title="
            portfolioSection === 'statement' ? 'Extrato' : 'Carteiras do cliente'
          " /><q-card-section
          ><customer-portfolio
            :key="portfolioCustomer + ':' + portfolioSection + ':' + portfolioWalletType"
            :customer-id="portfolioCustomer"
            :embedded="portfolioSection === 'statement'"
            :focus-statement="portfolioSection === 'statement'"
            :wallet-type="portfolioWalletType"
            @changed="loadGlobalPortfolio" /></q-card-section></q-card
    ></q-dialog>
    <q-dialog v-model="createOpen" :persistent="createBusy"
      ><transaction-create
        :submit-operation="submitAdminTransaction"
        @busy="createBusy = $event"
        @created="onCreated"
    /></q-dialog>
    <q-dialog v-model="dialog" :persistent="busy" @show="showAuditHistory">
      <q-card class="transaction-detail-host">
        <resource-state :state="detail.state" @retry="loadDetail">
          <contract-transaction-detail
            v-if="contractDetail && detail.state.data"
            :record="detail.state.data"
            @close="dialog = false"
            @changed="onTransactionEdited"
            @busy="busy = $event"
          />
          <transaction-detail
            v-else-if="detail.state.data"
            :key="detail.state.data.id"
            :record="detail.state.data"
            :busy="busy"
            @close="dialog = false"
            @action="startWorkflow"
            @edit="editingTransaction = true"
            @correct="correctingTransaction = true"
            @state="openState"
            @open="open"
          />
        </resource-state>
      </q-card>
    </q-dialog>
    <transaction-edit
      v-if="correctingTransaction && detail.state.data"
      correction
      :record="detail.state.data"
      @busy="busy = $event"
      @close="correctingTransaction = false"
      @saved="onTransactionEdited"
    />
    <transaction-edit
      v-if="editingTransaction && detail.state.data"
      :record="detail.state.data"
      @busy="busy = $event"
      @close="editingTransaction = false"
      @saved="onTransactionEdited"
    />
    <transaction-password
      v-if="actionToConfirm"
      :summary="confirmationSummary"
      :submit="executeConfirmed"
      @busy="busy = $event"
      @close="actionToConfirm = null"
      @completed="actionToConfirm = null"
    />
    <transaction-state-dialog
      v-if="stateDialog"
      :key="stateDialog.key"
      :mode="stateDialog.mode"
      :submit="submitState"
      @busy="busy = $event"
      @close="stateDialog = null"
      @completed="stateCompleted"
    />
  </q-page>
</template>
<script setup>
function selectWallet(type) {
  walletType.value = type
  tab.value = 'wallets'
}
function openPortfolio(id, section = 'portfolio', wallet = null) {
  portfolioWalletType.value = wallet
  portfolioSection.value = section
  portfolioCustomer.value = id
  portfolioOpen.value = true
}

const portfolioWalletType = ref(null)
const portfolioSection = ref('portfolio')
const walletType = ref('total'),
  portfolioCustomer = ref(null),
  portfolioOpen = ref(false)

import ContractTransactionDetail from 'src/components/Contracts/ContractTransactionDetail.vue'
import {
  isContractTransaction,
  contractTransactionLabel,
  contractEndpoint,
  contractSourceCurrency,
  contractTransactionTone,
} from 'src/services/contractTransactionView'
import { readGlobalWalletFx } from 'src/services/globalWalletFx'
import WalletDirectory from 'src/components/Finance/WalletDirectory.vue'
import WalletOverview from 'src/components/Finance/WalletOverview.vue'

import { computed, ref, watch, nextTick, onMounted, onScopeDispose } from 'vue'
import {
  readGlobalPortfolios,
  globalWalletRows,
  globalWalletSummary,
} from 'src/services/globalWallets'
import { createRequestContext } from 'src/services/requestContext'
import { useQuasar } from 'quasar'
import { useRoute } from 'vue-router'
import TitlePage from 'src/components/TitlePage.vue'
import TitleCard from 'src/components/Card/TitleCard.vue'
import FormSection from 'src/components/Entity/FormSection.vue'
import FinanceTable from 'src/components/Finance/FinanceTable.vue'
import ResourceState from 'src/components/Finance/ResourceState.vue'
import TransactionCreate from 'src/components/Finance/TransactionCreate.vue'
import TransactionEdit from 'src/components/Finance/TransactionEdit.vue'
import TransactionDetail from 'src/components/Finance/TransactionDetail.vue'
import TransactionStateDialog from 'src/components/Finance/TransactionStateDialog.vue'
import { downloadDocument } from 'src/services/documentAdminService'
import TransactionPassword from 'src/components/Finance/TransactionPassword.vue'
import { submitAdminTransaction } from 'src/services/transactionOperations'
import CustomerPortfolio from 'src/components/Finance/CustomerPortfolio.vue'
import { useFinanceResource } from 'src/composables/useFinanceResource'
import { financeGet, financeWrite, columns, financeLabel, money } from 'src/services/financeService'
const $q = useQuasar(),
  detail = useFinanceResource(),
  tab = ref('transactions'),
  search = ref(''),
  table = ref(),
  pendingTable = ref(),
  dialog = ref(false),
  createOpen = ref(false),
  createBusy = ref(false),
  id = ref(null),
  busy = ref(false),
  error = ref(''),
  reason = ref('')
const stateDialog = ref(null)
const pendingParams = computed(() => ({
  attentionRequired: true,
  search: search.value || undefined,
}))
const historyParams = computed(() => ({ search: search.value || undefined }))
const globalPortfolio = useFinanceResource()
const globalRequest = createRequestContext()
const globalRows = computed(() => globalWalletRows(globalPortfolio.state.data))
const globalFx = useFinanceResource()
const globalFxRequest = createRequestContext()
const globalSummary = computed(() => {
  const model = globalWalletSummary(globalPortfolio.state.data)
  return model ? { ...model, fx: globalFx.state.data } : null
})
const globalFailures = computed(
  () => globalPortfolio.state.data?.records.filter((r) => r.error).length || 0,
)
async function loadGlobalPortfolio() {
  globalRequest.invalidate()
  const current = globalRequest.capture()
  globalFxRequest.invalidate()
  globalFx.reset()
  await globalPortfolio.load(() => readGlobalPortfolios(financeGet, current))
  if (current() && globalPortfolio.state.data) {
    const fxCurrent = globalFxRequest.capture()
    await globalFx.load(() =>
      readGlobalWalletFx(financeGet, globalWalletSummary(globalPortfolio.state.data), fxCurrent),
    )
  }
}
onMounted(loadGlobalPortfolio)
onScopeDispose(() => {
  globalRequest.dispose()
  globalFxRequest.dispose()
  globalFx.reset()
  globalPortfolio.reset()
})
const contractDetail = computed(() => isContractTransaction(detail.state.data))
const workflowActions = computed(() =>
  (detail.state.data?.availableActions || []).filter(
    (action) =>
      ['Validate', 'Approve', 'Reject', 'Execute', 'Cancel'].includes(action) &&
      (![
        'WalletTransfer',
        'ContractContribution',
        'ContractRedemption',
        'Yield',
        'AssetAdded',
        'AssetRemoved',
      ].includes(detail.state.data?.type) ||
        action === 'Cancel'),
  ),
)
const transactionColumns = columns([
  [
    'requestedAtUtc',
    'Data/Hora',
    (r) => (r.requestedAtUtc ? new Date(r.requestedAtUtc).toLocaleString('pt-BR') : '—'),
  ],
  ['requestNumber', 'ID'],
  ['type', 'Tipo'],
  ['clientName', 'Cliente'],
  ['source', 'Origem'],
  ['destination', 'Destino'],
  ['amount', 'Valor'],
  ['status', 'Status'],
  [
    'createdBy',
    'Responsável',
    (r) =>
      r.createdBy?.displayName ||
      { Admin: 'Admin', System: 'Sistema Automático', Client: 'Cliente', Customer: 'Cliente' }[
        r.createdBy?.type
      ] ||
      'Indisponível',
  ],
  ['actions', ''],
])
const loadDetail = () =>
  detail.load(async () => {
    const currentId = id.value
    const record = (await financeGet(`admin/transactions/${currentId}`)).data
    if (record?.id !== currentId) throw Error('Não foi possível confirmar a solicitação.')
    return record
  })
function onCreated(value) {
  loadGlobalPortfolio()
  createOpen.value = false
  table.value?.reload()
  pendingTable.value?.reload()
  open(value)
}
function open(value) {
  stateDialog.value = null
  actionToConfirm.value = null
  editingTransaction.value = false
  correctingTransaction.value = false
  id.value = value
  dialog.value = true
  error.value = ''
  reason.value = ''
  loadDetail()
}
function openState(mode, document = null) {
  if (busy.value) return
  const record = detail.state.data
  if (!record) return
  const action = {
    correction: 'RequestCorrection',
    observation: 'AddObservation',
    approve: 'Approve',
    reject: 'Reject',
    execute: 'Execute',
    cancel: 'Cancel',
    attachment: 'AttachDocument',
  }[mode]
  if (mode !== 'receipt' && !record.availableActions?.includes(action)) return
  stateDialog.value = {
    mode,
    key: `${record.id}:${mode}`,
    id: record.id,
    version: record.version,
    document,
  }
}
async function submitState(content) {
  const intent = stateDialog.value
  const record = detail.state.data
  if (!intent || !dialog.value || record?.id !== intent.id || record.version !== intent.version)
    throw Error('A solicitação mudou. Abra a ação novamente.')
  if (intent.mode === 'attachment')
    throw Error('Envio de comprovante indisponível. Os dados foram mantidos.')
  if (['approve', 'reject', 'execute', 'cancel'].includes(intent.mode)) {
    const action = { approve: 'Approve', reject: 'Reject', execute: 'Execute', cancel: 'Cancel' }[
      intent.mode
    ]
    if (!record.availableActions?.includes(action) || !workflowActions.value.includes(action))
      throw Error('Ação indisponível.')
    if (['reject', 'cancel'].includes(intent.mode) && !content.trim())
      throw Error('Informe o motivo.')
    if (intent.mode === 'execute' && content !== 'CONFIRMAR') throw Error('Digite CONFIRMAR.')
    return {
      action,
      id: intent.id,
      version: intent.version,
      reason: intent.mode === 'execute' ? '' : content.trim(),
    }
  }
  if (intent.mode === 'receipt') {
    const document = intent.document
    if (!record.documents?.some((item) => item.documentId === document?.documentId))
      throw Error('Documento indisponível.')
    const { data } = await downloadDocument(document.documentId)
    if (stateDialog.value !== intent || !dialog.value) return
    const url = URL.createObjectURL(data)
    const link = window.document.createElement('a')
    link.href = url
    link.download = (document.fileName || 'comprovante.pdf').replace(/[\\/]/g, '_')
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    return
  }
  const action = intent.mode === 'correction' ? 'RequestCorrection' : 'AddObservation'
  if (!record.availableActions?.includes(action) || !content.trim())
    throw Error('Ação indisponível.')
  try {
    if (intent.mode === 'correction')
      await financeWrite('post', `admin/transactions/${intent.id}/actions`, {
        action,
        reason: content.trim(),
        expectedVersion: intent.version,
      })
    else
      await financeWrite('post', `admin/transactions/${intent.id}/observations`, {
        content: content.trim(),
      })
  } catch (e) {
    if (e.response?.status === 409) await loadDetail()
    throw e
  }
}
function stateCompleted(result) {
  const mode = stateDialog.value?.mode
  stateDialog.value = null
  busy.value = false
  if (['approve', 'reject', 'execute', 'cancel'].includes(mode)) {
    if (result?.id !== detail.state.data?.id || result?.version !== detail.state.data?.version)
      return
    reason.value = result.reason
    confirmAction(result.action)
    return
  }
  if (mode === 'receipt') return
  loadDetail()
  table.value?.reload()
  pendingTable.value?.reload()
  $q.notify({
    type: 'positive',
    message: mode === 'correction' ? 'Correção solicitada.' : 'Observação registrada.',
  })
}
function onTransactionEdited() {
  loadGlobalPortfolio()
  correctingTransaction.value = false
  editingTransaction.value = false
  busy.value = false
  loadDetail()
  table.value?.reload()
  pendingTable.value?.reload()
}
const correctingTransaction = ref(false)
const editingTransaction = ref(false)
const actionSnapshot = ref(null)
const actionToConfirm = ref(null)
const confirmationSummary = computed(() => actionSnapshot.value?.summary || '')
function startWorkflow(action) {
  if (!workflowActions.value.includes(action)) return
  const mode = { Approve: 'approve', Reject: 'reject', Execute: 'execute', Cancel: 'cancel' }[
    action
  ]
  if (mode) openState(mode)
  else confirmAction(action)
}
function confirmAction(action) {
  if (busy.value || !workflowActions.value.includes(action)) return
  if (['Reject', 'Cancel'].includes(action) && !reason.value.trim()) {
    error.value = 'Informe o motivo antes de continuar.'
    return
  }
  const record = detail.state.data
  actionSnapshot.value = {
    id: record.id,
    version: record.version,
    action,
    reason: reason.value.trim() || null,
    summary: `${financeLabel(action)}: ${record.requestNumber} · ${money(record.amount, record.currency.isoCode)}`,
  }
  actionToConfirm.value = action
}
async function executeConfirmed(password) {
  const record = detail.state.data
  const intent = actionSnapshot.value
  const action = intent?.action
  if (!intent || intent.id !== record?.id || intent.version !== record?.version)
    throw Error('A solicitação mudou. Feche a confirmação e revise os dados.')
  if (!record?.availableActions?.includes(action) || !workflowActions.value.includes(action))
    throw Error('Ação indisponível.')
  try {
    await financeWrite('post', `admin/transactions/${record.id}/actions`, {
      action,
      reason: intent.reason,
      expectedVersion: intent.version,
      password,
    })
    reason.value = ''
    loadGlobalPortfolio()
    await loadDetail()
    table.value?.reload()
    pendingTable.value?.reload()
  } catch (e) {
    if (e.response?.status === 409) await loadDetail()
    throw e
  }
}
const route = useRoute()
watch(
  () => route.query.transactionId,
  (value) => {
    if (typeof value === 'string' && /^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(value))
      open(value)
  },
  { immediate: true },
)
watch(() => [detail.state.loading, dialog.value, route.query.history], showAuditHistory, {
  flush: 'post',
})
async function showAuditHistory() {
  if (detail.state.loading || !dialog.value || route.query.history !== '1') return
  await nextTick()
  if (dialog.value)
    document.getElementById('transaction-history')?.scrollIntoView({ block: 'start' })
}
</script>
<style scoped>
.transaction-detail-host {
  max-width: calc(100vw - 32px);
  background: transparent;
  width: 512px;
  max-height: calc(100dvh - 32px);
  overflow: auto;
  box-shadow: none;
  border-radius: 12px;
  scrollbar-color: #ffffff60 #18212e;
}
.finance-facts {
  display: grid;
  grid-template-columns: minmax(90px, 1fr) 2fr;
  gap: 12px;
}
.finance-facts dd {
  margin: 0;
  overflow-wrap: anywhere;
}
.transactions-page :deep(.contract-transaction-type) {
  display: flex;
  align-items: center;
  gap: 8px;
}
.transactions-page :deep(.contract-flow__badge) {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
</style>

<style scoped>
.transactions-page :deep(tr:has(.transaction-error) td:not(:nth-child(8)):not(:last-child)) {
  color: #ffffff80;
  text-decoration: line-through;
}
.transactions-page :deep(.q-table td small) {
  display: block;
  color: #ffffffb8;
  font-size: 11px;
}
.transactions-page :deep(.q-table td strong) {
  color: inherit;
}
.transactions-page :deep(.q-table__container) {
  background: transparent;
  color: #fff;
  border: 1px solid #ffffff1f;
  border-radius: 10px;
}
.transactions-page :deep(.q-table thead) {
  background: #ffffff0a;
}
.transactions-page :deep(.q-table th),
.transactions-page :deep(.q-table td),
.transactions-page :deep(.q-table__bottom) {
  color: #fff;
  border-color: #ffffff1f;
}
.transactions-page :deep(.contract-transaction-type) {
  display: flex;
  align-items: center;
  gap: 8px;
}
.transactions-page :deep(.contract-flow__badge) {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
</style>

<style scoped>
.transaction-heading {
  font:
    700 20px/28px Inter,
    sans-serif;
  margin: 0;
  color: #fff;
}
.transaction-subtitle {
  font:
    400 12px/16px Inter,
    sans-serif;
  color: #ffffffb8;
  margin: 2px 0 0;
}
.transaction-header-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.transaction-header-actions .q-btn {
  min-height: 32px;
  padding: 4px 10px;
  border-radius: 6px;
  background: #ffffff0d;
  color: #ffffffb8;
  font-size: 14px;
}
.transaction-header-actions :deep(.q-btn__content) {
  gap: 8px;
  flex-direction: row-reverse;
}
.transactions-page :deep(.title-page-heading-row) {
  align-items: flex-start;
  flex-wrap: wrap;
}
</style>
