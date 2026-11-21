<template>
  <q-card class="transaction-detail" aria-labelledby="transaction-detail-title">
    <header>
      <div>
        <h2 id="transaction-detail-title">
          <img :src="icon('ArrowDownLeft')" alt="" />{{
            completed || corrected ? 'Transação' : 'Solicitação'
          }}: {{ record.requestNumber }}
        </h2>
        <p>
          {{
            corrected
              ? 'Transação corrigida: detalhes e transação original'
              : completed
                ? 'Operação processada: detalhes e ações disponíveis'
                : 'Detalhes completos da solicitação e ações disponíveis'
          }}
        </p>
      </div>
      <q-btn flat round dense aria-label="Fechar detalhes" :disable="busy" @click="emit('close')"
        ><span class="transaction-detail__close"
          ><img :src="icon('Vector')" alt="" /><img :src="icon('Vector1')" alt="" /></span
      ></q-btn>
    </header>
    <div class="transaction-detail__body">
      <div v-if="record.attentionRequired" class="transaction-detail__attention" role="status">
        <img :src="icon('TriangleAlert')" alt="" />
        <div>
          <strong>Atenção necessária</strong>
          <p>Esta solicitação requer ação urgente ou possui pendências.</p>
        </div>
      </div>
      <dl class="transaction-detail__facts">
        <div>
          <dt>Tipo de Operação</dt>
          <dd><img :src="icon('ArrowDownLeft')" alt="" />{{ financeLabel(record.type) }}</dd>
        </div>
        <div>
          <dt>Status Atual</dt>
          <dd>
            <span class="transaction-detail__badge" :class="tone"
              ><img v-if="record.status === 'AwaitingReceipt'" :src="icon('Upload')" alt="" />{{
                completed ? 'Processada' : financeLabel(record.status)
              }}</span
            >
          </dd>
        </div>
        <div>
          <dt>Cliente</dt>
          <dd>{{ record.client?.displayName || record.client?.name || 'Indisponível' }}</dd>
          <small>ID: {{ record.client?.publicCode || record.client?.id || '—' }}</small>
        </div>
        <div>
          <dt>Responsável</dt>
          <dd>{{ actor(record.createdBy) }}</dd>
        </div>
      </dl>
      <dl class="transaction-detail__facts transaction-detail__section">
        <div>
          <dt>Origem</dt>
          <dd>{{ endpoint(record.source) }}</dd>
        </div>
        <div>
          <dt>Destino</dt>
          <dd>
            {{
              [record.destinationClient?.name, endpoint(record.destination)]
                .filter(Boolean)
                .join(' · ')
            }}
          </dd>
        </div>
      </dl>
      <dl class="transaction-detail__facts transaction-detail__section">
        <div>
          <dt>Valor</dt>
          <dd class="transaction-detail__amount">{{ money(record.amount, currency) }}</dd>
        </div>
        <div>
          <dt>
            {{
              corrected ? 'Corrigida em' : completed ? 'Data de execução' : 'Data da solicitação'
            }}
          </dt>
          <dd>
            {{
              when(
                corrected
                  ? record.correctedAtUtc
                  : completed
                    ? record.completedAtUtc
                    : record.requestedAtUtc,
              )
            }}
          </dd>
          <template v-if="corrected"
            ><dt>Corrige</dt>
            <dd>{{ original.state.data?.requestNumber || '—' }}</dd></template
          >
          <template v-else-if="completed"
            ><dt>Valor do comprovante</dt>
            <dd>{{ money(record.receiptAmount, currency) }}</dd></template
          >
          <template v-else
            ><dt>Prazo</dt>
            <dd>{{ when(record.dueAtUtc) }}</dd></template
          >
        </div>
      </dl>
      <section class="transaction-detail__section">
        <h3>Observação</h3>
        <div class="transaction-detail__box">
          <p v-if="record.observation">{{ record.observation }}</p>
          <p v-for="note in record.observations || []" :key="note.id">{{ note.content }}</p>
          <p v-if="!record.observation && !record.observations?.length">
            Nenhuma observação registrada.
          </p>
        </div>
      </section>
      <section v-if="record.correctsTransactionId" class="transaction-detail__section">
        <h3>Transação original (com erro)</h3>
        <resource-state :state="original.state" @retry="loadOriginal"
          ><div v-if="original.state.data" class="transaction-detail__box">
            <p>
              {{ original.state.data.requestNumber }} ·
              {{ financeLabel(original.state.data.type) }} · solicitado em
              {{ when(original.state.data.requestedAtUtc) }}
            </p>
            <p>
              {{ money(original.state.data.amount, original.state.data.currency?.isoCode) }} ·
              {{ endpoint(original.state.data.source) }} →
              {{ endpoint(original.state.data.destination) }}
            </p>
            <p>Status: {{ financeLabel(original.state.data.status) }}</p>
          </div></resource-state
        >
      </section>
      <section class="transaction-detail__section">
        <h3>Ações Disponíveis</h3>
        <div class="transaction-detail__actions">
          <q-btn
            v-for="action in actions"
            :key="action.key"
            outline
            no-caps
            :disable="busy || action.disabled"
            :class="action.key === 'CorrectDeposit' ? 'transaction-detail__correct' : ''"
            @click="selectAction(action)"
            ><img :src="icon(action.icon)" alt="" />{{ action.label }}</q-btn
          >
        </div>
      </section>
      <section id="transaction-history" class="transaction-detail__section">
        <h3>Histórico de Alterações</h3>
        <resource-state :state="history.state" @retry="loadHistory"
          ><div class="transaction-detail__table">
            <table>
              <thead>
                <tr>
                  <th>Data/Hora</th>
                  <th>Autor</th>
                  <th>Alteração</th>
                  <th>Anterior → Novo</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, i) in history.state.data || []" :key="row.id || i">
                  <td>{{ when(row.occurredAtUtc) }}</td>
                  <td>{{ actor({ type: row.actorType, displayName: row.actorName }) }}</td>
                  <td>{{ row.field ? auditField(row.field) : auditAction(row.action).label }}</td>
                  <td>
                    {{
                      row.field
                        ? auditValue(row.field, row.oldValue, currency) +
                          ' → ' +
                          auditValue(row.field, row.newValue, currency)
                        : '—'
                    }}<small v-if="row.reason">{{ row.reason }}</small>
                  </td>
                </tr>
                <tr v-if="!history.state.data?.length">
                  <td colspan="4">Nenhuma alteração registrada.</td>
                </tr>
              </tbody>
            </table>
          </div></resource-state
        >
      </section>
    </div>
    <footer><q-btn outline no-caps label="Fechar" :disable="busy" @click="emit('close')" /></footer>
  </q-card>
</template>
<script setup>
import { computed, watch, onScopeDispose } from 'vue'
import { financeGet, financeLabel, money } from 'src/services/financeService'
import { useFinanceResource } from 'src/composables/useFinanceResource'
import { readCurrentPages } from 'src/services/requestContext'
import { auditAction, auditField, auditValue } from 'src/services/auditModel'
import { contractEndpoint } from 'src/services/contractTransactionView'
import ResourceState from './ResourceState.vue'
const props = defineProps({
  record: { type: Object, required: true },
  busy: Boolean,
  read: { type: Function, default: financeGet },
})
const emit = defineEmits(['close', 'action', 'edit', 'correct', 'state', 'open'])
const history = useFinanceResource(),
  original = useFinanceResource()
let active = true,
  revision = 0
onScopeDispose(() => {
  active = false
  revision++
  history.reset()
  original.reset()
})
const currency = computed(() => props.record.currency?.isoCode)
const completed = computed(() => props.record.status === 'Completed')
const corrected = computed(() => Boolean(props.record.correctsTransactionId))
const tone = computed(() =>
  completed.value
    ? 'completed'
    : ['Canceled', 'Rejected', 'Error'].includes(props.record.status)
      ? 'negative'
      : 'pending',
)
const icon = (name) => '/icons/transactions/detail/img' + name + '.svg'
const when = (v) =>
  v && Number.isFinite(Date.parse(v))
    ? new Date(v).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—'
const actor = (v) =>
  v?.displayName ||
  { Admin: 'Admin', Client: 'Cliente', Customer: 'Cliente', System: 'Sistema' }[v?.type] ||
  '—'
const endpoint = (v) => {
  const e = contractEndpoint(v, null)
  return [e.title, e.detail].filter(Boolean).join(' · ')
}
const pending = computed(
  () =>
    !corrected.value &&
    [
      'AwaitingReceipt',
      'PendingValidation',
      'Validated',
      'Approved',
      'CorrectionRequested',
    ].includes(props.record.status),
)
const actions = computed(() => {
  if (['WalletTransfer', 'InterCustomerTransfer'].includes(props.record.type))
    return props.record.status === 'Initiated' && props.record.availableActions?.includes('Cancel')
      ? [{ key: 'Cancel', label: 'Cancelar', icon: 'Icon1', disabled: false }]
      : []
  const allowed = props.record.availableActions || [],
    rows = []
  const add = (key, label, name, enabled = allowed.includes(key)) =>
    rows.push({ key, label, icon: name, disabled: !enabled })
  if (pending.value) {
    add('Validate', 'Validar', 'CircleCheck')
    add('Approve', 'Aprovar', 'Check')
    add('Reject', 'Reprovar', 'Icon')
    add('Execute', 'Executar Operação', 'CircleCheck')
    add('RequestCorrection', 'Solicitar Correção', 'CircleAlert')
    add('AttachDocument', 'Anexar Documento', 'Upload1')
  }
  if (allowed.includes('CorrectDeposit'))
    add('CorrectDeposit', 'Corrigir depósito', 'CorrectionCheck')
  if (corrected.value) add('Original', 'Ver transação original', 'CircleCheck', true)
  if (props.record.correctedByTransactionId) add('Correction', 'Ver correção', 'CircleCheck', true)
  add('Receipt', 'Ver Comprovante', 'Eye', Boolean(props.record.documents?.length))
  add('AddObservation', 'Adicionar Observação', 'MessageSquare')
  if (pending.value) {
    add(
      'Edit',
      'Editar dados',
      'Pen',
      props.record.type === 'Deposit' &&
        ['AwaitingReceipt', 'PendingValidation', 'Validated'].includes(props.record.status),
    )
    add('Cancel', 'Cancelar', 'Icon1')
  }
  return rows
})
function selectAction(action) {
  if (
    props.busy ||
    action.disabled ||
    !actions.value.some((a) => a.key === action.key && !a.disabled)
  )
    return
  if (action.key === 'Original') emit('open', props.record.correctsTransactionId)
  else if (action.key === 'Correction') emit('open', props.record.correctedByTransactionId)
  else if (action.key === 'Edit') emit('edit')
  else if (action.key === 'CorrectDeposit') emit('correct')
  else if (action.key === 'AttachDocument') emit('state', 'attachment')
  else if (action.key === 'Receipt') emit('state', 'receipt', props.record.documents[0])
  else if (action.key === 'AddObservation') emit('state', 'observation')
  else if (action.key === 'RequestCorrection') emit('state', 'correction')
  else emit('action', action.key)
}
function loadHistory() {
  const id = props.record.id,
    version = revision
  return history.load(() =>
    readCurrentPages(
      (page) =>
        props.read('admin/audit/changes', {
          ResourceType: 'FinancialTransaction',
          ResourceId: id,
          page,
          pageSize: 100,
        }),
      () => active && version === revision,
    ),
  )
}
function loadOriginal() {
  const id = props.record.correctsTransactionId
  if (!id) return original.reset()
  return original.load(async () => {
    const r = (await props.read(`admin/transactions/${id}`)).data
    if (r?.id !== id) throw Error('Transação original indisponível.')
    return r
  })
}
watch(
  () => [props.record.id, props.record.version],
  () => {
    revision++
    history.reset()
    original.reset()
    loadHistory()
    loadOriginal()
  },
  { immediate: true },
)
</script>
<style scoped>
.transaction-detail {
  width: 100%;
  max-width: none;
  padding: 24px;
  border: 1px solid #ffffff1f;
  border-radius: 12px;
  color: #fff;
  background: linear-gradient(225deg, #ffffff12, #ffffff05), #18212e;
  backdrop-filter: blur(20px);
  box-shadow: 4px 4px 6px #00000021;
}
header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}
header > div {
  min-width: 0;
}
h2 {
  margin: 0;
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
  line-height: 24px;
  overflow-wrap: anywhere;
}
header p {
  margin: 8px 0 0;
  color: #ffffffb8;
  font-size: 14px;
  line-height: 20px;
}
img {
  flex-shrink: 0;
}
.transaction-detail__close {
  display: block;
  position: relative;
  width: 16px;
  height: 16px;
}
.transaction-detail__close img {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
.transaction-detail__body {
  padding-top: 40px;
}
.transaction-detail__facts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px 16px;
  margin: 0;
}
.transaction-detail__facts > div {
  min-width: 0;
}
dt,
h3 {
  margin: 0 0 4px;
  color: #ffffffb8;
  font-size: 12px;
  font-weight: 600;
  line-height: 16px;
  text-transform: uppercase;
}
dd {
  margin: 0;
  display: flex;
  gap: 8px;
  align-items: center;
  overflow-wrap: anywhere;
  line-height: 24px;
  font-size: 16px;
}
dd + dt {
  margin-top: 8px;
}
small {
  display: block;
  color: #ffffffb8;
  font-size: 12px;
  overflow-wrap: anywhere;
}
.transaction-detail__facts small {
  font-family: Consolas, monospace;
}
.transaction-detail__section {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #269ed633;
}
.transaction-detail__section dd {
  font-size: 14px;
  line-height: 20px;
}
dd.transaction-detail__amount {
  font-size: 22px;
  font-weight: 700;
  line-height: 28px;
}
.transaction-detail__attention {
  display: flex;
  gap: 12px;
  padding: 16px;
  margin-bottom: 24px;
  border: 1px solid #fee685;
  border-radius: 10px;
  background: #ffffff0a;
  color: #fee685;
}
.transaction-detail__attention strong {
  font-size: 14px;
}
.transaction-detail__attention p {
  font-size: 12px;
  line-height: 16px;
  margin: 4px 0 0;
}
.transaction-detail__badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border: 1px solid;
  border-radius: 8px;
  font-size: 10px;
  line-height: 15px;
  text-transform: uppercase;
  letter-spacing: 0.25px;
}
.pending {
  color: #fee685;
  background: #bb4d0033;
}
.completed {
  color: #7bf1a8;
  background: #01663033;
}
.negative {
  color: #ffa1ad;
  background: #8b083633;
}
.transaction-detail__box {
  padding: 10px;
  border: 1px solid #ffffff1f;
  border-radius: 12px;
  background: #00000024;
  color: #ffffffb8;
  box-shadow: 4px 4px 6px #00000021;
  overflow-wrap: anywhere;
  font-size: 14px;
  line-height: 20px;
}
.transaction-detail__box p {
  margin: 0;
}
.transaction-detail__box p + p {
  margin-top: 6px;
}
.transaction-detail__actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin-top: 12px;
}
.q-btn {
  border-radius: 8px;
  color: #ffffffb8;
  min-height: 36px;
}
.transaction-detail__actions .q-btn {
  background: #ffffff0f;
  border: 1px solid #269ed61f;
  font-size: 14px;
  line-height: 20px;
}
.transaction-detail__actions :deep(.q-btn__content) {
  width: 100%;
  justify-content: flex-start;
  flex-wrap: nowrap;
  gap: 8px;
  text-align: left;
}
.transaction-detail__actions .transaction-detail__correct {
  color: #fee685;
  border-color: #fee685;
  background: #bb4d0033;
}
.transaction-detail__table {
  overflow: auto;
  border: 1px solid #ffffff1f;
  border-radius: 10px;
  margin-top: 12px;
  max-height: 220px;
}
table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  color: #fff;
  font-size: 12px;
}
th {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: #ffffff0a;
}
th,
td {
  padding: 8px;
  vertical-align: top;
  border-bottom: 1px solid #ffffff1f;
  overflow-wrap: anywhere;
}
td:first-child {
  white-space: nowrap;
}
footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 40px;
}
@media (max-width: 420px) {
  .transaction-detail {
    padding: 16px;
  }
  .transaction-detail__actions {
    grid-template-columns: 1fr;
  }
  .transaction-detail__facts {
    gap: 16px 12px;
  }
  h2 {
    font-size: 16px;
  }
}
</style>
