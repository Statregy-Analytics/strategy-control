<template>
  <q-page class="transactions-page">
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
            ><img src="/icons/audit/export.svg" alt="" /></q-btn
          ><q-btn outline no-caps label="Nova Transação" @click="createOpen = true"
            ><img src="/icons/contracts/flows/2349-281-imgIcon.svg" alt=""
          /></q-btn></div></template
    ></title-page>
    <resource-state :state="globalTotals.state" @retry="loadGlobalTotals" />
    <wallet-overview
      :model="globalSummary"
      :details="false"
      presentation="transactions"
      :initial-type="tab === 'wallets' ? walletType : null"
      @select="selectWallet"
    />
    <keep-alive
      ><transaction-directory
        v-if="tab === 'transactions'"
        :pending="pendingList.state"
        :history="historyList.state"
        @retry-pending="loadPendingList"
        @retry-history="loadHistoryList"
        @open="open"
    /></keep-alive>
    <div v-if="tab === 'wallets'">
      <resource-state :state="globalPortfolio.state" @retry="loadGlobalPortfolio"
        ><wallet-directory
          :type="walletType"
          :rows="globalRows"
          :fx="globalSummary?.fx"
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
import { isContractTransaction } from 'src/services/contractTransactionView'
import { readWalletClients, walletTotalsModel } from 'src/services/walletDirectoryApi'
import WalletDirectory from 'src/components/Finance/WalletDirectory.vue'
import WalletOverview from 'src/components/Finance/WalletOverview.vue'

import { computed, ref, watch, nextTick, onMounted, onScopeDispose } from 'vue'
import { createRequestContext, readCurrentPages } from 'src/services/requestContext'
import { useQuasar } from 'quasar'
import { useRoute } from 'vue-router'
import TitlePage from 'src/components/TitlePage.vue'
import TitleCard from 'src/components/Card/TitleCard.vue'
import TransactionDirectory from 'src/components/Finance/TransactionDirectory.vue'
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
import { financeGet, financeWrite, financeLabel, money } from 'src/services/financeService'
const $q = useQuasar(),
  detail = useFinanceResource(),
  tab = ref('transactions'),
  dialog = ref(false),
  createOpen = ref(false),
  createBusy = ref(false),
  id = ref(null),
  busy = ref(false),
  error = ref(''),
  reason = ref('')
const stateDialog = ref(null)
const pendingList = useFinanceResource(),
  historyList = useFinanceResource()
const pendingRequest = createRequestContext(),
  historyRequest = createRequestContext()
const readTransactions = (resource, context, params = {}) => {
  context.invalidate()
  const active = context.capture()
  return resource.load(
    async () =>
      (await readCurrentPages(
        (page) => financeGet('admin/transactions', { ...params, page, pageSize: 100 }),
        active,
      )) || [],
  )
}
const loadPendingList = () =>
  readTransactions(pendingList, pendingRequest, { attentionRequired: true })
const loadHistoryList = () => readTransactions(historyList, historyRequest)
onMounted(() => {
  loadPendingList()
  loadHistoryList()
})
onScopeDispose(() => {
  pendingRequest.dispose()
  historyRequest.dispose()
  pendingList.reset()
  historyList.reset()
})
const globalPortfolio = useFinanceResource()
const globalRequest = createRequestContext()
const globalRows = computed(() => globalPortfolio.state.data)
const globalTotals = useFinanceResource()
const globalSummary = computed(() => globalTotals.state.data)
const loadGlobalTotals = () =>
  globalTotals.load(async () => walletTotalsModel((await financeGet('admin/wallets/totals')).data))
async function loadGlobalPortfolio() {
  globalRequest.invalidate()
  const current = globalRequest.capture()
  const type = walletType.value
  await globalPortfolio.load(() => readWalletClients(financeGet, current, type))
}
watch(walletType, loadGlobalPortfolio)
onMounted(() => {
  loadGlobalPortfolio()
  loadGlobalTotals()
})
onScopeDispose(() => {
  globalRequest.dispose()
  globalTotals.reset()
  globalPortfolio.reset()
})
const contractDetail = computed(() => isContractTransaction(detail.state.data))
const workflowActions = computed(() =>
  (detail.state.data?.availableActions || []).filter(
    (action) =>
      ['Validate', 'Approve', 'Reject', 'Execute', 'Cancel'].includes(action) &&
      (![
        'WalletTransfer',
        'InterCustomerTransfer',
        'ContractContribution',
        'ContractRedemption',
        'Yield',
        'AssetIncluded',
        'AssetRemoved',
      ].includes(detail.state.data?.type) ||
        action === 'Cancel'),
  ),
)
const loadDetail = () =>
  detail.load(async () => {
    const currentId = id.value
    const record = (await financeGet(`admin/transactions/${currentId}`)).data
    if (record?.id !== currentId) throw Error('Não foi possível confirmar a solicitação.')
    return record
  })
function onCreated(value) {
  loadGlobalPortfolio()
  loadGlobalTotals()
  createOpen.value = false
  loadHistoryList()
  loadPendingList()
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
    validate: 'Validate',
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
  if (['validate', 'approve', 'reject', 'execute', 'cancel'].includes(intent.mode)) {
    const action = {
      validate: 'Validate',
      approve: 'Approve',
      reject: 'Reject',
      execute: 'Execute',
      cancel: 'Cancel',
    }[intent.mode]
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
  if (['validate', 'approve', 'reject', 'execute', 'cancel'].includes(mode)) {
    if (result?.id !== detail.state.data?.id || result?.version !== detail.state.data?.version)
      return
    reason.value = result.reason
    confirmAction(result.action)
    return
  }
  if (mode === 'receipt') return
  loadDetail()
  loadHistoryList()
  loadPendingList()
  $q.notify({
    type: 'positive',
    message: mode === 'correction' ? 'Correção solicitada.' : 'Observação registrada.',
  })
}
function onTransactionEdited() {
  loadGlobalPortfolio()
  loadGlobalTotals()
  correctingTransaction.value = false
  editingTransaction.value = false
  busy.value = false
  loadDetail()
  loadHistoryList()
  loadPendingList()
}
const correctingTransaction = ref(false)
const editingTransaction = ref(false)
const actionSnapshot = ref(null)
const actionToConfirm = ref(null)
const confirmationSummary = computed(() => actionSnapshot.value?.summary || '')
function startWorkflow(action) {
  if (!workflowActions.value.includes(action)) return
  const mode = {
    Validate: 'validate',
    Approve: 'approve',
    Reject: 'reject',
    Execute: 'execute',
    Cancel: 'cancel',
  }[action]
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
    loadGlobalTotals()
    await loadDetail()
    loadHistoryList()
    loadPendingList()
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

<style scoped>
.transactions-page :deep(.wallet-overview) {
  padding: 0 24px 16px;
  border-bottom: 0.8px solid #ffffff1f;
}
.transactions-page > .q-tabs {
  margin: 16px 24px 0;
}
.transactions-page :deep(.TitlePage > .q-pa-md) {
  padding: 16px 24px;
}
@media (max-width: 650px) {
  .transactions-page :deep(.wallet-overview) {
    padding: 0 16px 16px;
  }
  .transactions-page :deep(.TitlePage > .q-pa-md) {
    padding: 16px;
  }
}
</style>

<style scoped>
/* Keep the existing palette for embedded portfolio tables; the ledger owns its own styles. */
.transactions-page :deep(.q-table__container) {
  background: transparent;
  color: white;
  border: 1px solid #ffffff1f;
  border-radius: 10px;
}
.transactions-page :deep(.q-table thead) {
  background: #ffffff0a;
}
.transactions-page :deep(.q-table th),
.transactions-page :deep(.q-table td),
.transactions-page :deep(.q-table__bottom) {
  color: white;
  border-color: #ffffff1f;
}
</style>
