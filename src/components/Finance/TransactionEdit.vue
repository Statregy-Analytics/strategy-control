<template>
  <q-dialog :model-value="true" :persistent="busy" @update:model-value="!busy && $emit('close')">
    <q-card class="transaction-edit">
      <q-form @submit="save" :inert="busy || undefined">
        <header>
          <div>
            <h2>
              {{ correction ? 'Corrigir depósito' : 'Editar solicitação' }}
              {{ record.requestNumber }}
            </h2>
            <p>
              {{ correction ? 'Depósito processado' : 'Depósito pendente' }} ·
              {{ record.client?.name }}
            </p>
          </div>
          <q-btn
            flat
            round
            dense
            icon="close"
            aria-label="Fechar edição"
            :disable="busy"
            @click="$emit('close')"
          />
        </header>
        <p v-if="!correction" class="transaction-edit__info">
          Solicitação pendente: corrija o valor se estiver errado, informe o banco de envio e anexe
          o comprovante antes de aprovar. Fica registrado quem alterou, quando e o que mudou.
        </p>
        <p v-else class="transaction-edit__info">
          Correção: a transação original fica com o status Erro e ligada a esta correção. Nada é
          apagado. Valor aplicado em contrato não pode ser retirado.
        </p>
        <label-form text-label="Cliente"
          ><q-input :model-value="record.client?.name" outlined dense readonly
        /></label-form>
        <label-form text-label="Moeda"
          ><q-input :model-value="record.currency?.isoCode" outlined dense readonly
        /></label-form>
        <resource-state :state="banks.state" @retry="loadBanks"
          ><label-form text-label="Banco/Conta de Origem (compatível com moeda)"
            ><q-select
              v-model="bankId"
              :options="bankOptions"
              emit-value
              map-options
              outlined
              dense
              aria-label="Banco de origem"
              :display-value="selectedBankLabel" /></label-form
        ></resource-state>
        <p
          v-if="!banks.state.loading && !banks.state.error && !bankOptions.length"
          class="text-grey"
        >
          A moeda das contas bancárias está indisponível.
        </p>
        <label-form text-label="Valor"
          ><money-input
            v-model="amount"
            :currency="record.currency?.isoCode"
            outlined
            dense
            aria-label="Valor corrigido"
        /></label-form>
        <template v-if="correction">
          <p>Valor com erro: {{ money(record.amount, record.currency?.isoCode) }}</p>
          <section v-if="difference > 0">
            <h3>De onde sai a diferença ({{ money(difference, record.currency?.isoCode) }})</h3>
            <resource-state :state="sources.state" @retry="loadSources"
              ><label-form v-for="source in sourceRows" :key="source.key" :text-label="source.label"
                ><money-input
                  v-model="amounts[source.key]"
                  :currency="record.currency?.isoCode"
                  outlined
                  dense
                  :aria-label="source.label"
                /><small
                  >Disponível: {{ money(source.available, record.currency?.isoCode) }}</small
                ></label-form
              ></resource-state
            >
            <p>
              Total: {{ money(sourceTotal, record.currency?.isoCode) }} de
              {{ money(difference, record.currency?.isoCode) }}
            </p>
          </section>
          <p v-if="difference > 0" role="status" class="text-grey">
            A confirmação desta correção ainda não está disponível.
          </p>
          <p>
            Se o valor certo for maior que o lançado, a diferença entra só na Carteira de Depósito.
            A transação em processamento que perder valor fica como Erro e ligada a esta correção.
          </p>
        </template>
        <label-form text-label="Upload de Comprovante (PDF)"
          ><q-file
            v-model="file"
            outlined
            dense
            accept=".pdf"
            clearable
            aria-label="Comprovante atualizado"
        /></label-form>
        <small v-for="document in record.documents || []" :key="document.documentId">{{
          document.fileName
        }}</small>
        <label-form
          :text-label="correction ? 'Motivo do erro (obrigatório)' : 'Observação (opcional)'"
          ><q-input v-model="note" outlined dense type="textarea" aria-label="Observação da edição"
        /></label-form>
        <p v-if="error" role="alert" class="text-negative">{{ error }}</p>
        <footer>
          <q-btn outline no-caps label="Voltar" :disable="busy" @click="$emit('close')" /><q-btn
            outline
            no-caps
            :label="correction ? 'Salvar correção' : 'Salvar alterações'"
            type="submit"
            :loading="busy"
            :disable="!canSave"
          />
        </footer>
      </q-form>
      <transaction-password
        v-if="confirming"
        :summary="`Corrigir depósito ${record.requestNumber} · ${money(amount, record.currency?.isoCode)}`"
        :submit="confirmCorrection"
        @busy="setConfirmBusy"
        @close="confirming = false"
      />
    </q-card>
  </q-dialog>
</template>
<script setup>
import { ref, computed, onScopeDispose } from 'vue'
import LabelForm from 'src/components/Form/LabelForm.vue'
import MoneyInput from 'src/components/Form/MoneyInput.vue'
import TransactionPassword from './TransactionPassword.vue'
import ResourceState from './ResourceState.vue'
import { useFinanceResource } from 'src/composables/useFinanceResource'
import { financeGet, financeWrite, money } from 'src/services/financeService'
import { readCurrentPages } from 'src/services/requestContext'
import { readWalletBankAccounts } from 'src/services/walletModel'
const props = defineProps({
  record: { type: Object, required: true },
  correction: Boolean,
  read: { type: Function, default: financeGet },
  write: { type: Function, default: financeWrite },
})
const emit = defineEmits(['close', 'saved', 'busy'])
const amount = ref(props.record.amount),
  bankId = ref(props.record.source?.id || null),
  note = ref(''),
  file = ref(null),
  busy = ref(false),
  error = ref(''),
  banks = useFinanceResource()
const sources = useFinanceResource(),
  amounts = ref({}),
  confirming = ref(false)
const difference = computed(
  () => Math.round((Number(props.record.amount) - Number(amount.value)) * 100) / 100,
)
const sourceRows = computed(() => [
  ...(sources.state.data?.wallets || [])
    .filter(
      (row) =>
        ['Free', 'Applied'].includes(row.type) &&
        row.currencyIsoCode === props.record.currency?.isoCode,
    )
    .map((row) => ({
      key: row.id,
      label: row.type === 'Free' ? 'Carteira de Depósito' : 'Carteira Strategy',
      available: row.available,
    })),
  ...(sources.state.data?.pending || [])
    .filter(
      (row) =>
        row.id !== props.record.id &&
        ['Withdrawal', 'WalletTransfer'].includes(row.type) &&
        ['PendingValidation', 'Validated', 'Approved'].includes(row.status) &&
        row.currencyIsoCode === props.record.currency?.isoCode,
    )
    .map((row) => ({
      key: row.id,
      label: row.requestNumber + ' · em processamento',
      available: row.amount,
    })),
])
const sourceTotal = computed(() =>
  Object.values(amounts.value).reduce((sum, value) => sum + (Number(value) || 0), 0),
)
const loadSources = () =>
  sources.load(async () => {
    const [wallets, pending] = await Promise.all([
      props.read(`admin/customers/${props.record.client.id}/wallets`),
      readCurrentPages(
        (page) =>
          props.read('admin/transactions', {
            clientId: props.record.client.id,
            page,
            pageSize: 100,
          }),
        () => active,
      ),
    ])
    return { wallets: wallets.data, pending }
  })
let active = true,
  version = props.record.version,
  savedAmount = props.record.amount,
  savedBank = bankId.value
const changed = computed(
  () =>
    Number(amount.value) !== Number(savedAmount) ||
    bankId.value !== savedBank ||
    !!file.value ||
    !!note.value.trim(),
)
const bankOptions = computed(() =>
  (banks.state.data || [])
    .filter((b) => b.status === 'Active' && b.currencyIsoCode === props.record.currency?.isoCode)
    .map((b) => ({
      value: b.id,
      label: (b.bankName || 'Banco') + ' · ' + (b.accountNumberMasked || 'Conta protegida'),
    })),
)
const canSave = computed(
  () =>
    changed.value &&
    !busy.value &&
    !banks.state.loading &&
    Number.isFinite(Number(amount.value)) &&
    Number(amount.value) > 0 &&
    bankOptions.value.some((b) => b.value === bankId.value) &&
    (!props.correction ||
      (!!note.value.trim() &&
        difference.value <= 0 &&
        !file.value &&
        bankId.value === props.record.source?.id)),
)
const selectedBankLabel = computed(
  () =>
    bankOptions.value.find((b) => b.value === bankId.value)?.label ||
    (bankId.value === props.record.source?.id
      ? [props.record.source?.bankName, props.record.source?.accountNumberMasked]
          .filter(Boolean)
          .join(' · ') || 'Conta protegida'
      : undefined),
)
const loadBanks = () =>
  banks.load(() =>
    readWalletBankAccounts(
      (page) =>
        props.read(`admin/customers/${props.record.client.id}/bank-accounts`, {
          page,
          pageSize: 100,
        }),
      () => active,
    ),
  )
loadBanks()
if (props.correction) loadSources()
onScopeDispose(() => {
  active = false
  sources.reset()
  banks.reset()
})
async function save() {
  if (
    busy.value ||
    !changed.value ||
    !Number.isFinite(Number(amount.value)) ||
    Number(amount.value) <= 0 ||
    !bankOptions.value.some((b) => b.value === bankId.value)
  )
    return
  if (props.correction) {
    if (!note.value.trim()) {
      error.value = 'Informe o motivo do erro.'
      return
    }
    if (difference.value > 0) {
      error.value = 'Não foi possível confirmar as origens da diferença. Os dados foram mantidos.'
      return
    }
    if (file.value || bankId.value !== props.record.source?.id) {
      error.value =
        'Não foi possível atualizar o banco ou comprovante desta correção. Os dados foram mantidos.'
      return
    }
    confirming.value = true
    return
  }
  if (file.value) {
    error.value = 'Não foi possível enviar esse comprovante. O arquivo foi mantido.'
    return
  }
  busy.value = true
  emit('busy', true)
  error.value = ''
  try {
    if (Number(amount.value) !== Number(savedAmount) || bankId.value !== savedBank) {
      const result = await props.write('put', `admin/transactions/${props.record.id}`, {
        amount: Number(amount.value),
        bankAccountId: bankId.value,
        expectedVersion: version,
      })
      version = result.version
      savedAmount = amount.value
      savedBank = bankId.value
    }
    if (note.value.trim()) {
      await props.write('post', `admin/transactions/${props.record.id}/observations`, {
        content: note.value.trim(),
      })
      note.value = ''
    }
    if (active) {
      busy.value = false
      emit('busy', false)
      emit('saved')
    }
  } catch (e) {
    if (active)
      error.value =
        e.response?.status === 409
          ? 'A solicitação mudou. Volte e confira os dados antes de editar novamente.'
          : 'Não foi possível salvar todas as alterações. Confira os dados e tente novamente.'
  } finally {
    if (active) {
      busy.value = false
      emit('busy', false)
    }
  }
}
function setConfirmBusy(value) {
  busy.value = value
  emit('busy', value)
}
async function confirmCorrection(password) {
  if (difference.value > 0 || !note.value.trim()) throw Error('Confira a correção.')
  const result = await props.write(
    'post',
    `admin/transactions/${props.record.id}/deposit-correction`,
    {
      correctAmount: Number(amount.value),
      reason: note.value.trim(),
      differenceSource: null,
      pendingTransactionId: null,
      password,
      expectedVersion: props.record.version,
    },
  )
  if (active) {
    busy.value = false
    emit('busy', false)
    confirming.value = false
    emit('saved', result)
  }
  return result
}
</script>
<style scoped>
.transaction-edit {
  width: 512px;
  max-width: calc(100vw - 32px);
  max-height: calc(100dvh - 32px);
  overflow: auto;
  padding: 24px;
  background: linear-gradient(90deg, #ffffff14, #ffffff08, #ffffff12), #18212e;
  border: 1px solid #269ed661;
  border-radius: 14px;
  color: #fff;
  backdrop-filter: blur(20px);
}
header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}
h2 {
  margin: 0;
  font-size: 18px;
  line-height: 28px;
  font-weight: 600;
}
p,
small {
  color: #ffffffb8;
  font-size: 14px;
  line-height: 20px;
}
.transaction-edit__info {
  padding: 12px;
  border: 1px solid #2b7fff;
  border-radius: 8px;
  color: #bedbff;
  background: #ffffff1a;
  margin: 40px 0 16px;
}
form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
}
.q-btn {
  color: #ffffffb8;
  border-radius: 8px;
}
.transaction-edit :deep(input),
.transaction-edit :deep(textarea) {
  color: #fff;
}
.transaction-edit h3 {
  font-size: 14px;
  line-height: 20px;
  font-weight: 500;
  margin: 16px 0 8px;
}
</style>
