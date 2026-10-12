<template>
  <q-page class="q-pa-md">
    <title-page title="Transações e carteiras" />
    <q-tabs v-model="tab" align="left" dense active-color="primary"
      ><q-tab name="transactions" label="Transações" no-caps /><q-tab
        name="portfolio"
        label="Carteira do cliente"
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
      <finance-table
        ref="table"
        path="admin/transactions"
        :params="{ search: search || undefined }"
        :columns="transactionColumns"
        ><template #body-cell-actions="p"
          ><q-td :props="p"
            ><row-actions
              :actions="[{ name: 'open', label: 'Abrir solicitação', icon: 'visibility' }]"
              @select="open(p.row.id)" /></q-td></template
      ></finance-table>
    </div>
    <customer-portfolio v-else />
    <q-dialog
      v-model="createOpen"
      :persistent="createBusy"
      position="right"
      full-height
      full-width
      maximized
      class="control-width"
      ><transaction-create @busy="createBusy = $event" @created="onCreated"
    /></q-dialog>
    <q-dialog
      v-model="dialog"
      position="right"
      full-height
      full-width
      maximized
      class="control-width"
      :persistent="busy"
      ><q-card
        ><title-card title="Solicitação de transação" :disable-close="busy" /><q-separator />
        <resource-state :state="detail.state" @retry="loadDetail">
          <template v-if="detail.state.data">
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
                <dl class="finance-facts">
                  <dt>Tipo</dt>
                  <dd>{{ financeLabel(detail.state.data.type) }}</dd>
                  <dt>Valor</dt>
                  <dd>{{ money(detail.state.data.amount, detail.state.data.currency.isoCode) }}</dd>
                  <dt>Origem</dt>
                  <dd>{{ endpointLabel(detail.state.data.source) }}</dd>
                  <dt>Destino</dt>
                  <dd>{{ endpointLabel(detail.state.data.destination) }}</dd>
                  <dt>Solicitada em</dt>
                  <dd>{{ dateLabel(detail.state.data.requestedAtUtc) }}</dd>
                </dl>
              </form-section>
              <form-section title="Aprovação e execução">
                <p v-if="!workflowActions.length" class="text-muted">
                  Nenhuma ação disponível para o estado atual.
                </p>
                <template v-else
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
                <q-form
                  v-if="detail.state.data.availableActions.includes('AddObservation')"
                  :inert="busy || undefined"
                  @submit="addObservation"
                >
                  <label-form text-label="Nova observação"
                    ><q-input
                      v-model="observation"
                      outlined
                      dense
                      type="textarea"
                      aria-label="Nova observação"
                      :rules="[(v) => !!v?.trim() || 'Informe uma observação']"
                  /></label-form>
                  <q-btn
                    type="submit"
                    flat
                    dense
                    no-caps
                    color="primary"
                    label="Adicionar observação"
                    :loading="busy"
                  />
                </q-form>
              </form-section>
              <form-section title="Documentos">
                <p v-if="!detail.state.data.documents?.length" class="text-muted">
                  Nenhum documento vinculado.
                </p>
                <div
                  v-for="document in detail.state.data.documents || []"
                  :key="document.documentId"
                >
                  {{ document.fileName }}
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
              <form-section title="Histórico"
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
  </q-page>
</template>
<script setup>
import { computed, ref } from 'vue'
import { useQuasar } from 'quasar'
import TitlePage from 'src/components/TitlePage.vue'
import TitleCard from 'src/components/Card/TitleCard.vue'
import EntityHeader from 'src/components/Entity/EntityHeader.vue'
import FormSection from 'src/components/Entity/FormSection.vue'
import RowActions from 'src/components/Entity/RowActions.vue'
import LabelForm from 'src/components/Form/LabelForm.vue'
import FinanceTable from 'src/components/Finance/FinanceTable.vue'
import ResourceState from 'src/components/Finance/ResourceState.vue'
import TransactionCreate from 'src/components/Finance/TransactionCreate.vue'
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
  dialog = ref(false),
  createOpen = ref(false),
  createBusy = ref(false),
  id = ref(null),
  busy = ref(false),
  error = ref(''),
  reason = ref('')
const observation = ref('')
const workflowActions = computed(() =>
  (detail.state.data?.availableActions || []).filter((action) =>
    ['Validate', 'Approve', 'Reject', 'Execute', 'Cancel'].includes(action),
  ),
)
const transactionColumns = columns([
  ['requestNumber', 'Solicitação'],
  ['clientName', 'Cliente'],
  ['type', 'Tipo', (r) => financeLabel(r.type)],
  ['amount', 'Valor', (r) => money(r.amount, r.currencyIsoCode)],
  ['status', 'Status', (r) => financeLabel(r.status)],
  ['requestedAtUtc', 'Data', (r) => dateLabel(r.requestedAtUtc)],
  ['actions', 'Ações'],
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
  open(value)
}
function open(value) {
  id.value = value
  dialog.value = true
  error.value = ''
  reason.value = ''
  observation.value = ''
  loadDetail()
}
async function addObservation() {
  if (busy.value || !observation.value.trim()) return
  busy.value = true
  error.value = ''
  try {
    await financeWrite('post', `admin/transactions/${id.value}/observations`, {
      content: observation.value.trim(),
    })
    observation.value = ''
    await loadDetail()
    $q.notify({ type: 'positive', message: 'Observação registrada.' })
  } catch {
    error.value = 'Não foi possível registrar a observação. Tente novamente.'
  } finally {
    busy.value = false
  }
}
function confirmAction(action) {
  if (busy.value || !workflowActions.value.includes(action)) return
  $q.dialog({
    title: financeLabel(action),
    message: `Confirma esta ação na solicitação ${detail.state.data.requestNumber}, no valor de ${money(detail.state.data.amount, detail.state.data.currency.isoCode)}?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    busy.value = true
    error.value = ''
    try {
      await financeWrite('post', `admin/transactions/${id.value}/actions`, {
        action,
        reason: reason.value || null,
        expectedVersion: detail.state.data.version,
      })
      reason.value = ''
      await loadDetail()
      table.value?.reload()
    } catch (e) {
      error.value =
        e.response?.status === 409
          ? 'A solicitação foi alterada. O estado será atualizado; revise antes de tentar novamente.'
          : 'Não foi possível executar a ação. Verifique as permissões e o motivo informado.'
      if (e.response?.status === 409) await loadDetail()
    } finally {
      busy.value = false
    }
  })
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
</style>
