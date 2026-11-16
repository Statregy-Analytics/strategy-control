<template>
  <q-card
    flat
    class="contract-flow transaction-contract"
    aria-labelledby="contract-transaction-title"
  >
    <header>
      <div>
        <h2 id="contract-transaction-title">
          <img :src="icon('ArrowDownLeft')" alt="" />Transação: {{ record.requestNumber }}
        </h2>
        <p class="contract-flow__muted">{{ label }}: detalhes do lançamento</p>
      </div>
      <q-btn flat round dense aria-label="Fechar" :disable="busy" @click="$emit('close')"
        ><span class="transaction-contract__close"
          ><img :src="icon('Vector')" alt="" /><img :src="icon('Vector1')" alt="" /></span
      ></q-btn>
    </header>
    <div class="contract-flow__body">
      <dl class="contract-flow__facts">
        <div>
          <dt>Tipo de Operação</dt>
          <dd>{{ label }}</dd>
        </div>
        <div>
          <dt>Status Atual</dt>
          <dd>
            <span class="contract-flow__badge" :class="contractTransactionTone(record)">{{
              record.status === 'Completed' ? 'Processada' : financeLabel(record.status)
            }}</span>
          </dd>
        </div>
        <div>
          <dt>Cliente</dt>
          <dd>{{ record.client?.displayName || record.client?.name || 'Indisponível' }}</dd>
          <small>ID: {{ record.client?.publicCode || record.client?.id || 'Indisponível' }}</small>
        </div>
        <div>
          <dt>Responsável</dt>
          <dd>{{ actor(record.createdBy) }}</dd>
        </div>
      </dl>
      <dl class="contract-flow__facts contract-flow__section">
        <div>
          <dt>Origem</dt>
          <dd>
            {{ origin.title }}<template v-if="origin.detail"> · {{ origin.detail }}</template>
          </dd>
        </div>
        <div>
          <dt>Destino</dt>
          <dd>
            {{ destination.title
            }}<template v-if="destination.detail"> · {{ destination.detail }}</template>
          </dd>
        </div>
        <div>
          <dt>Valor</dt>
          <dd class="transaction-contract__amount">{{ money(record.amount, currency) }}</dd>
        </div>
        <div>
          <dt>Data/Hora</dt>
          <dd>{{ when(record.requestedAtUtc) }}</dd>
          <dt class="q-mt-sm">Participação de entrada</dt>
          <dd>Indisponível</dd>
        </div>
      </dl>
      <section v-if="record.conversion" ref="quotePanel" class="contract-flow__section">
        <h3>Câmbio</h3>
        <contract-transaction-quote :record="record" />
      </section>
      <section v-if="record.destination?.kind === 'Contract'" class="contract-flow__section">
        <h3>Aporte completo</h3>
        <p class="contract-flow__box contract-flow__muted">
          As partes deste aporte não estão disponíveis nesta consulta.
        </p>
      </section>
      <section class="contract-flow__section">
        <h3>Ações Disponíveis</h3>
        <div class="contract-flow__actions">
          <q-btn
            outline
            no-caps
            :disable="!contractId || busy"
            @click="$router.push({ name: 'contracts', query: { contractId } })"
            ><img :src="icon('CircleCheck')" alt="" />Ver contrato</q-btn
          ><q-btn
            outline
            no-caps
            :disable="!record.conversion || busy"
            @click="quotePanel?.scrollIntoView({ block: 'nearest' })"
            ><img :src="icon('Eye')" alt="" />Ver cotação usada</q-btn
          ><q-btn
            outline
            no-caps
            :disable="!record.availableActions?.includes('AddObservation') || busy"
            @click="noteOpen = !noteOpen"
            ><img :src="icon('MessageSquare')" alt="" />Adicionar Observação</q-btn
          >
        </div>
        <form v-if="noteOpen" class="q-mt-md" @submit.prevent="addNote">
          <label-form text-label="Observação"
            ><q-input
              v-model="note"
              outlined
              dense
              type="textarea"
              :disable="busy"
              aria-label="Observação da transação" /></label-form
          ><q-btn
            flat
            no-caps
            label="Salvar observação"
            type="submit"
            :disable="!note.trim() || busy"
            :loading="busy"
          />
        </form>
        <p v-if="error" class="contract-flow__error" role="alert">{{ error }}</p>
      </section>
      <section id="transaction-history" class="contract-flow__section">
        <h3>Histórico de Alterações</h3>
        <resource-state :state="history.state" @retry="loadHistory"
          ><table>
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
                <td>{{ auditAction(row.action).label }}</td>
                <td>
                  {{
                    row.field
                      ? auditField(row.field) +
                        ': ' +
                        auditValue(row.field, row.oldValue, currency) +
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
          </table></resource-state
        >
      </section>
    </div>
    <footer>
      <q-btn outline no-caps label="Fechar" :disable="busy" @click="$emit('close')" />
    </footer>
  </q-card>
</template>
<script setup>
import { computed, ref, watch, onScopeDispose } from 'vue'
import { financeGet, financeWrite, financeLabel, money } from 'src/services/financeService'
import { useFinanceResource } from 'src/composables/useFinanceResource'
import { readCurrentPages } from 'src/services/requestContext'
import { auditAction, auditField, auditValue } from 'src/services/auditModel'
import {
  contractTransactionLabel,
  contractEndpoint,
  transactionContractId,
  contractSourceCurrency,
  contractTransactionTone,
} from 'src/services/contractTransactionView'
import ResourceState from 'src/components/Finance/ResourceState.vue'
import LabelForm from 'src/components/Form/LabelForm.vue'
import ContractTransactionQuote from './ContractTransactionQuote.vue'
const props = defineProps({
  record: { type: Object, required: true },
  read: { type: Function, default: financeGet },
  write: { type: Function, default: financeWrite },
})
const emit = defineEmits(['close', 'changed', 'busy'])
const quotePanel = ref(null),
  noteOpen = ref(false),
  note = ref(''),
  busy = ref(false),
  error = ref(''),
  history = useFinanceResource()
let active = true
onScopeDispose(() => {
  active = false
  history.reset()
})
const currency = computed(() => props.record.currency?.isoCode),
  label = computed(() => contractTransactionLabel(props.record) || financeLabel(props.record.type))
const origin = computed(() =>
    contractEndpoint(props.record.source, contractSourceCurrency(props.record)),
  ),
  destination = computed(() => contractEndpoint(props.record.destination, currency.value)),
  contractId = computed(() => transactionContractId(props.record))
const icon = (name) => '/icons/contracts/flows/2350-281-img' + name + '.svg'
const when = (value) =>
  value
    ? new Date(value).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Indisponível'
const actor = (value) =>
  value?.displayName ||
  { Admin: 'Admin', Customer: 'Cliente', Client: 'Cliente', System: 'Sistema Automático' }[
    value?.type
  ] ||
  'Indisponível'
const loadHistory = () =>
  history.load(() =>
    readCurrentPages(
      (page) =>
        props.read('admin/audit/changes', {
          ResourceType: 'Transaction',
          ResourceId: props.record.id,
          page,
          pageSize: 100,
        }),
      () => active,
    ),
  )
watch(
  () => props.record.id,
  () => {
    note.value = ''
    error.value = ''
    noteOpen.value = false
    loadHistory()
  },
  { immediate: true },
)
async function addNote() {
  if (
    busy.value ||
    !note.value.trim() ||
    !props.record.availableActions?.includes('AddObservation')
  )
    return
  busy.value = true
  emit('busy', true)
  error.value = ''
  try {
    await props.write('post', `admin/transactions/${props.record.id}/observations`, {
      content: note.value.trim(),
    })
    if (!active) return
    note.value = ''
    noteOpen.value = false
    emit('changed')
    await loadHistory()
  } catch {
    if (active) error.value = 'Não foi possível registrar a observação. Tente novamente.'
  } finally {
    if (active) {
      busy.value = false
      emit('busy', false)
    }
  }
}
</script>
<style src="./contractFlow.scss" lang="scss"></style>
<style scoped>
.transaction-contract header {
  align-items: flex-start;
}
.transaction-contract h2 {
  font-size: 18px;
  text-transform: none;
  letter-spacing: 0;
}
.transaction-contract header p {
  margin-top: 8px;
}
.transaction-contract__amount {
  font-weight: 700;
  font-size: 18px;
}
.transaction-contract__close {
  display: block;
  position: relative;
  width: 16px;
  height: 16px;
}
.transaction-contract__close img {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.transaction-contract header > div {
  min-width: 0;
}
.transaction-contract h2 {
  overflow-wrap: anywhere;
  white-space: normal;
}
</style>
