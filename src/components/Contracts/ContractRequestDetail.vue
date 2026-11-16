<template>
  <q-dialog :model-value="true" :persistent="busy" @update:model-value="!busy && $emit('close')"
    ><q-card class="contract-flow"
      ><header>
        <h2>Solicitação {{ record?.code || 'de contrato' }}</h2>
        <q-btn flat round dense aria-label="Fechar" :disable="busy" @click="$emit('close')"
          ><img :src="icon('Icon')" alt=""
        /></q-btn>
      </header>
      <div class="contract-flow__body">
        <resource-state :state="resource.state" @retry="load"
          ><template v-if="record"
            ><dl class="contract-flow__facts">
              <div>
                <dt>Cliente</dt>
                <dd>{{ record.client?.displayName || 'Indisponível' }}</dd>
                <small>{{ masked(record.client?.maskedDocument) }}</small>
              </div>
              <div>
                <dt>Status</dt>
                <dd>
                  <span class="contract-flow__badge" :class="record.status">{{
                    requestStatusLabel(record.status)
                  }}</span>
                </dd>
              </div>
              <div>
                <dt>Enviada em</dt>
                <dd>{{ when(record.submittedAtUtc) }}</dd>
              </div>
              <div>
                <dt>Contato</dt>
                <dd>{{ record.client?.email || 'Indisponível' }}</dd>
                <small>{{ record.client?.phone || 'Indisponível' }}</small>
              </div>
            </dl>
            <div class="contract-flow__box">
              <h3>O que o cliente preencheu</h3>
              <div v-for="answer in answers" :key="answer.label" class="request-answer">
                <small>{{ answer.label }}</small>
                <p>{{ answer.value || 'Indisponível' }}</p>
              </div>
            </div>
            <div class="contract-flow__box">
              <h3>Saldos do cliente (só para consulta)</h3>
              <resource-state :state="wallets.state" @retry="loadWallets"
                ><div v-for="type in ['Applied', 'Free']" :key="type" class="request-answer">
                  <small>{{
                    type === 'Applied' ? 'Carteira Strategy · saldo parado' : 'Carteira de Depósito'
                  }}</small
                  ><strong>{{ walletText(type) }}</strong>
                </div></resource-state
              >
              <p class="contract-flow__muted">
                A solicitação não mexe em saldo: o dinheiro só sai quando o contrato é criado ou a
                inclusão é confirmada.
              </p>
            </div>
            <label-form text-label="Observação do atendimento"
              ><q-input
                v-model="note"
                outlined
                dense
                type="textarea"
                rows="2"
                aria-label="Observação do atendimento"
                :disable="busy || !requestCanAttend(record)"
                placeholder="Anote o que foi combinado com o cliente: moeda firmada, moedas, carteiras e contrato."
            /></label-form>
            <section class="contract-flow__section">
              <h3>Ações Disponíveis</h3>
              <div class="contract-flow__actions">
                <q-btn
                  outline
                  no-caps
                  :disable="busy || record.status !== 'New'"
                  @click="change('InContact')"
                  ><img :src="icon('IconeUser')" alt="" />Marcar como em contato</q-btn
                ><q-btn
                  outline
                  no-caps
                  :disable="busy || !requestCanAttend(record)"
                  @click="navigate('create')"
                  ><img :src="icon('IconePlus')" alt="" />Criar contrato</q-btn
                ><q-btn
                  outline
                  no-caps
                  :disable="busy || !requestCanAttend(record)"
                  @click="navigate('include')"
                  ><img :src="icon('IconeUsers')" alt="" />Incluir em contrato aberto</q-btn
                ><q-btn outline no-caps :disable="busy || !requestCanAttend(record)" @click="cancel"
                  ><img :src="icon('IconeAlert')" alt="" />Cancelar solicitação</q-btn
                >
              </div>
              <p v-if="error" class="contract-flow__error q-mt-sm" role="alert">{{ error }}</p>
            </section>
            <section class="contract-flow__section">
              <h3>Histórico de Alterações</h3>
              <table v-if="Array.isArray(record.history)">
                <thead>
                  <tr>
                    <th>Data/Hora</th>
                    <th>Autor</th>
                    <th>Alteração</th>
                    <th>Anterior → Novo</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, i) in record.history" :key="row.id || i">
                    <td>{{ when(row.occurredAtUtc) }}</td>
                    <td>{{ row.actor }}</td>
                    <td>{{ row.action }}</td>
                    <td>{{ row.change }}</td>
                  </tr>
                  <tr v-if="!record.history.length">
                    <td colspan="4">Nenhuma alteração registrada.</td>
                  </tr>
                </tbody>
              </table>
              <p v-else class="contract-flow__muted">Histórico indisponível.</p>
            </section></template
          ></resource-state
        >
      </div>
      <footer>
        <q-btn
          outline
          no-caps
          label="Fechar"
          :disable="busy"
          @click="$emit('close')"
        /></footer></q-card
  ></q-dialog>
</template>
<script setup>
import { computed, ref, watch, onScopeDispose } from 'vue'
import { useQuasar } from 'quasar'
import { useFinanceResource } from 'src/composables/useFinanceResource'
import { financeGet, money } from 'src/services/financeService'
import { customerMaskedDocument } from 'src/services/customerPresentation'
import {
  readContractRequest,
  writeContractRequest,
  requestCanAttend,
  requestContext,
  requestStatusLabel,
  requestApplicationLabel,
} from 'src/services/contractRequests'
import LabelForm from 'src/components/Form/LabelForm.vue'
import ResourceState from 'src/components/Finance/ResourceState.vue'
const props = defineProps({
  requestId: { type: String, required: true },
  read: { type: Function, default: readContractRequest },
  write: { type: Function, default: writeContractRequest },
  readWallets: { type: Function, default: financeGet },
})
const emit = defineEmits(['close', 'create', 'include', 'changed'])
const q = useQuasar(),
  resource = useFinanceResource(),
  wallets = useFinanceResource(),
  note = ref(''),
  busy = ref(false),
  error = ref('')
let active = true
const record = computed(() => resource.state.data)
const icon = (name) => '/icons/contracts/flows/2362-281-img' + name + '.svg',
  masked = customerMaskedDocument
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
const answers = computed(() => {
  const a = record.value?.answers || {}
  return [
    { label: '1 · Objetivo de investimento', value: a.objective },
    { label: '2 · Período', value: a.period },
    {
      label: '3 · Modalidade e valor',
      value: requestApplicationLabel(record.value || {}, money),
    },
    { label: '4 · Tipos de ativos', value: a.assetTypes?.join(', ') },
    { label: '5 · Regiões', value: a.regions?.join(', ') },
  ]
})
const walletText = (type) => {
  const rows = (wallets.state.data || []).filter((row) => row.type === type)
  return rows.length
    ? rows.map((row) => money(row.available, row.currencyIsoCode)).join(' · ')
    : 'Nenhum saldo nesta carteira.'
}
const loadWallets = () =>
  wallets.load(async () => {
    const id = record.value?.client?.customerId
    if (!id) throw Error('Cliente indisponível.')
    const data = (await props.readWallets(`admin/customers/${id}/wallets`)).data
    if (!Array.isArray(data)) throw Error('Saldos indisponíveis.')
    return data
  })
async function load() {
  await resource.load(async () => {
    const data = await props.read(props.requestId)
    if (data?.id !== props.requestId) throw Error('Solicitação indisponível.')
    return data
  })
  if (record.value) {
    note.value = record.value.attendanceNote || ''
    loadWallets()
  }
}
async function change(status, reason = null) {
  if (busy.value || !requestCanAttend(record.value)) return
  busy.value = true
  error.value = ''
  try {
    await props.write(props.requestId, {
      status,
      attendanceNote: note.value.trim() || null,
      reason,
    })
    if (active) {
      await load()
      if (active) emit('changed')
    }
  } catch (e) {
    if (active) error.value = e.message || 'Não foi possível atualizar a solicitação.'
  } finally {
    if (active) busy.value = false
  }
}
function cancel() {
  q.dialog({
    title: 'Cancelar solicitação',
    message: 'Motivo do cancelamento',
    prompt: { model: '', type: 'textarea', isValid: (value) => !!value.trim() },
    cancel: true,
    persistent: true,
  }).onOk((reason) => change('Canceled', reason.trim()))
}
function navigate(action) {
  if (busy.value || !requestCanAttend(record.value)) return
  try {
    emit(action, { ...requestContext(record.value), attendanceNote: note.value })
  } catch (e) {
    error.value = e.message
  }
}
watch(
  () => props.requestId,
  () => {
    resource.reset()
    wallets.reset()
    note.value = ''
    error.value = ''
    load()
  },
  { immediate: true },
)
onScopeDispose(() => {
  active = false
  resource.reset()
  wallets.reset()
})
</script>
<style src="./contractFlow.scss" lang="scss"></style>
<style scoped>
.request-answer {
  margin: 8px 0 12px;
}
.request-answer:last-child {
  margin-bottom: 0;
}
</style>
