<template>
  <q-page class="q-pa-md transactions-page">
    <title-page title="Transações e carteiras" />
    <wallet-overview :details="false" initial-type="total" @select="selectWallet" />
    <q-tabs v-model="tab" align="left" dense active-color="primary"
      ><q-tab name="transactions" label="Transações" no-caps /><q-tab
        name="wallets"
        label="Carteiras"
        no-caps
    /></q-tabs>
    <q-separator />
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
        <div class="col-auto">
          <q-btn
            color="primary"
            icon="add"
            label="Nova transação"
            no-caps
            @click="createOpen = true"
          />
        </div>
      </div>
      <form-section title="Solicitações pendentes">
        <finance-table
          ref="pendingTable"
          path="admin/transactions"
          :params="{ attentionRequired: true, search: search || undefined }"
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
              ><span class="contract-flow__badge" :class="contractTransactionTone(p.row)"
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
          :params="{ search: search || undefined }"
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
              ><span class="contract-flow__badge" :class="contractTransactionTone(p.row)"
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
      <wallet-directory :type="walletType" @open="openPortfolio" /><q-btn
        class="q-mt-md"
        outline
        no-caps
        label="Consultar carteiras de um cliente"
        @click="openPortfolio(null)"
      />
    </div>
    <q-dialog
      v-model="portfolioOpen"
      position="right"
      full-height
      full-width
      maximized
      class="control-width"
      ><q-card
        ><title-card title="Carteiras do cliente" /><q-card-section
          ><customer-portfolio :customer-id="portfolioCustomer" /></q-card-section></q-card
    ></q-dialog>
    <q-dialog v-model="createOpen" :persistent="createBusy"
      ><transaction-create
        :submit-operation="submitAdminTransaction"
        @busy="createBusy = $event"
        @created="onCreated"
    /></q-dialog>
    <q-dialog
      v-model="dialog"
      :position="contractDetail ? 'standard' : 'right'"
      :full-height="!contractDetail"
      :full-width="!contractDetail"
      :maximized="!contractDetail"
      :class="{ 'control-width': !contractDetail }"
      :persistent="busy"
      @show="showAuditHistory"
      ><q-card
        ><title-card
          v-if="!contractDetail"
          title="Solicitação de transação"
          :disable-close="busy"
        /><q-separator />
        <resource-state :state="detail.state" @retry="loadDetail">
          <contract-transaction-detail
            v-if="contractDetail && detail.state.data"
            :record="detail.state.data"
            @close="dialog = false"
            @changed="loadDetail"
            @busy="busy = $event"
          />
          <template v-else-if="detail.state.data">
            <entity-header
              :id="detail.state.data.requestNumber"
              :name="
                detail.state.data.client.displayName || detail.state.data.client.name || 'Cliente'
              "
              ><template #status
                ><q-badge class="q-ml-md">{{
                  financeLabel(detail.state.data.status)
                }}</q-badge></template
              ></entity-header
            >
            <q-card-section>
              <q-banner v-if="error" role="alert">{{ error }}</q-banner>
              <form-section title="Movimentação">
                <p v-if="detail.state.data.correctsTransactionId" class="text-muted">
                  Esta transação corrige
                  <q-btn
                    flat
                    dense
                    no-caps
                    label="Ver transação original"
                    @click="open(detail.state.data.correctsTransactionId)"
                  />
                </p>
                <p v-if="detail.state.data.correctedByTransactionId" class="text-muted">
                  Esta transação foi corrigida.
                  <q-btn
                    flat
                    dense
                    no-caps
                    label="Ver correção"
                    @click="open(detail.state.data.correctedByTransactionId)"
                  />
                </p>
                <dl class="finance-facts">
                  <dt>Tipo</dt>
                  <dd>{{ financeLabel(detail.state.data.type) }}</dd>
                  <dt>Valor</dt>
                  <dd>{{ money(detail.state.data.amount, detail.state.data.currency.isoCode) }}</dd>
                  <dt>Origem</dt>
                  <dd>{{ endpointLabel(detail.state.data.source) }}</dd>
                  <dt>Destino</dt>
                  <dd>
                    {{
                      [
                        detail.state.data.destinationClient?.name,
                        endpointLabel(detail.state.data.destination),
                      ]
                        .filter(Boolean)
                        .join(' · ')
                    }}
                  </dd>
                  <dt>Solicitada em</dt>
                  <dd>{{ dateLabel(detail.state.data.requestedAtUtc) }}</dd>
                </dl>
              </form-section>
              <form-section title="Aprovação e execução">
                <q-btn
                  v-if="detail.state.data.availableActions?.includes('CorrectDeposit')"
                  flat
                  no-caps
                  label="Corrigir"
                  :disable="busy"
                  @click="correctingTransaction = true"
                />
                <q-btn
                  v-if="canEditTransaction"
                  flat
                  no-caps
                  label="Editar dados"
                  :disable="busy"
                  @click="editingTransaction = true"
                />
                <q-btn
                  v-if="detail.state.data.availableActions?.includes('RequestCorrection')"
                  flat
                  no-caps
                  label="Solicitar correção"
                  :disable="busy"
                  @click="openState('correction')"
                />
                <p
                  v-if="
                    !workflowActions.length &&
                    !detail.state.data.availableActions?.includes('RequestCorrection')
                  "
                  class="text-muted"
                >
                  Nenhuma ação disponível para o estado atual.
                </p>
                <template v-if="workflowActions.length"
                  ><label-form text-label="Motivo / observação"
                    ><q-input
                      v-model="reason"
                      type="textarea"
                      outlined
                      dense
                      aria-label="Motivo da ação" /></label-form
                  ><q-btn
                    v-for="action in workflowActions"
                    :key="action"
                    flat
                    dense
                    no-caps
                    color="primary"
                    class="q-mt-sm q-mr-sm"
                    :label="financeLabel(action)"
                    :disable="busy"
                    @click="confirmAction(action)"
                /></template>
              </form-section>
              <form-section title="Observações">
                <p v-if="detail.state.data.observation">{{ detail.state.data.observation }}</p>
                <p
                  v-if="!detail.state.data.observation && !detail.state.data.observations?.length"
                  class="text-muted"
                >
                  Nenhuma observação registrada.
                </p>
                <div
                  v-for="note in detail.state.data.observations || []"
                  :key="note.id"
                  class="q-mb-md"
                >
                  <div>{{ note.content }}</div>
                  <small>{{ dateLabel(note.createdAtUtc) }}</small>
                </div>
                <q-btn
                  v-if="detail.state.data.availableActions.includes('AddObservation')"
                  outline
                  no-caps
                  label="Adicionar observação"
                  :disable="busy"
                  @click="openState('observation')"
                />
              </form-section>
              <form-section title="Documentos">
                <p v-if="!detail.state.data.documents?.length" class="text-muted">
                  Nenhum documento vinculado.
                </p>
                <div
                  v-for="document in detail.state.data.documents || []"
                  :key="document.documentId"
                >
                  <q-btn
                    flat
                    no-caps
                    :label="document.fileName || 'Ver comprovante'"
                    :disable="busy"
                    @click="openState('receipt', document)"
                  />
                </div>
                <p
                  v-if="detail.state.data.availableActions.includes('AttachDocument')"
                  class="text-muted"
                >
                  A vinculação de documentos estará disponível após a definição dos tipos de vínculo
                  aceitos.
                </p>
              </form-section>
              <form-section title="Livro-razão"
                ><q-table
                  flat
                  dense
                  :rows="detail.state.data.ledgerEntries"
                  :columns="ledgerColumns"
                  row-key="id"
                  no-data-label="Nenhum lançamento executado"
              /></form-section>
              <form-section id="transaction-history" title="Histórico"
                ><q-table
                  flat
                  dense
                  :rows="detail.state.data.statusHistory"
                  :columns="historyColumns"
                  row-key="id"
                  no-data-label="Nenhum evento registrado"
              /></form-section>
            </q-card-section>
          </template>
        </resource-state> </q-card
    ></q-dialog>
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
function openPortfolio(id) {
  portfolioCustomer.value = id
  portfolioOpen.value = true
}

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
import WalletDirectory from 'src/components/Finance/WalletDirectory.vue'
import WalletOverview from 'src/components/Finance/WalletOverview.vue'

import { computed, ref, watch, nextTick } from 'vue'
import { useQuasar } from 'quasar'
import { useRoute } from 'vue-router'
import TitlePage from 'src/components/TitlePage.vue'
import TitleCard from 'src/components/Card/TitleCard.vue'
import EntityHeader from 'src/components/Entity/EntityHeader.vue'
import FormSection from 'src/components/Entity/FormSection.vue'
import LabelForm from 'src/components/Form/LabelForm.vue'
import FinanceTable from 'src/components/Finance/FinanceTable.vue'
import ResourceState from 'src/components/Finance/ResourceState.vue'
import TransactionCreate from 'src/components/Finance/TransactionCreate.vue'
import TransactionEdit from 'src/components/Finance/TransactionEdit.vue'
import TransactionStateDialog from 'src/components/Finance/TransactionStateDialog.vue'
import { downloadDocument } from 'src/services/documentAdminService'
import TransactionPassword from 'src/components/Finance/TransactionPassword.vue'
import { submitAdminTransaction } from 'src/services/transactionOperations'
import CustomerPortfolio from 'src/components/Finance/CustomerPortfolio.vue'
import { useFinanceResource } from 'src/composables/useFinanceResource'
import {
  financeGet,
  financeWrite,
  columns,
  financeLabel,
  money,
  dateLabel,
  endpointLabel,
} from 'src/services/financeService'
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
const ledgerColumns = columns([
  ['accountType', 'Conta', (r) => financeLabel(r.accountType)],
  ['direction', 'Direção', (r) => financeLabel(r.direction)],
  ['amount', 'Valor', (r) => money(r.amount, detail.state.data?.currency.isoCode)],
  ['effectiveAtUtc', 'Data', (r) => dateLabel(r.effectiveAtUtc)],
])
const historyColumns = columns([
  ['action', 'Ação', (r) => financeLabel(r.action)],
  ['toStatus', 'Status', (r) => financeLabel(r.toStatus)],
  ['occurredAtUtc', 'Data', (r) => dateLabel(r.occurredAtUtc)],
])
const loadDetail = () =>
  detail.load(async () => (await financeGet(`admin/transactions/${id.value}`)).data)
function onCreated(value) {
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
  const action = mode === 'correction' ? 'RequestCorrection' : 'AddObservation'
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
function stateCompleted() {
  const mode = stateDialog.value?.mode
  stateDialog.value = null
  busy.value = false
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
  correctingTransaction.value = false
  editingTransaction.value = false
  busy.value = false
  loadDetail()
  table.value?.reload()
  pendingTable.value?.reload()
}
const correctingTransaction = ref(false)
const editingTransaction = ref(false)
const canEditTransaction = computed(
  () =>
    detail.state.data?.type === 'Deposit' &&
    ['AwaitingReceipt', 'PendingValidation', 'Validated'].includes(detail.state.data.status),
)
const actionSnapshot = ref(null)
const actionToConfirm = ref(null)
const confirmationSummary = computed(() => actionSnapshot.value?.summary || '')
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
  if (!record || !workflowActions.value.includes(action)) throw Error('Ação indisponível.')
  try {
    await financeWrite('post', `admin/transactions/${record.id}/actions`, {
      action,
      reason: intent.reason,
      expectedVersion: intent.version,
      password,
    })
    reason.value = ''
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
.transactions-page :deep(.q-table td small) {
  display: block;
  color: #ffffffb8;
  font-size: 11px;
}
.transactions-page :deep(.q-table td strong) {
  color: inherit;
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
