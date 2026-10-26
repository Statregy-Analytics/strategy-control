<template>
  <q-card>
    <title-card title="Nova transação" :disable-close="busy" />
    <q-separator />
    <q-card-section>
      <q-form @submit="save" :inert="busy || undefined">
        <div class="operation-choices" aria-label="Tipo de transação">
          <button
            v-for="item in types"
            :key="item.value"
            type="button"
            :class="{ selected: kind === item.value, transfer: item.value === 'transfer' }"
            :aria-pressed="kind === item.value"
            @click="kind = item.value"
          >
            <q-icon :name="item.icon" size="20px" /><span>{{ item.label }}</span
            ><small>{{ item.description }}</small>
          </button>
        </div>
        <form-section title="Cliente e movimentação">
          <label-form text-label="Cliente"><customer-select v-model="clientId" /></label-form>
          <label-form
            v-if="kind !== 'transfer'"
            class="q-mt-md"
            :text-label="kind === 'deposit' ? 'Carteira de destino' : 'Carteira de origem'"
            ><q-input model-value="Carteira de Depósito" outlined dense readonly
          /></label-form>
          <template v-else>
            <label-form class="q-mt-md" text-label="Carteira de origem"
              ><q-select
                v-model="from"
                :options="walletOptions"
                emit-value
                map-options
                outlined
                dense
                aria-label="Carteira de origem"
            /></label-form>
            <label-form class="q-mt-md" text-label="Carteira de destino"
              ><q-select
                :model-value="to"
                :options="walletOptions"
                emit-value
                map-options
                outlined
                dense
                aria-label="Carteira de destino"
                @update:model-value="from = $event === 'deposit' ? 'strategy' : 'deposit'"
            /></label-form>
          </template>
          <label-form class="q-mt-md" text-label="Moeda"
            ><q-select
              v-model="currency"
              :options="currencyOptions"
              emit-value
              map-options
              outlined
              dense
              aria-label="Moeda da transação"
              popup-content-class="wallet-currency-menu"
          /></label-form>
          <label-form class="q-mt-md" text-label="Valor"
            ><money-input
              v-model="amount"
              :currency="currency"
              outlined
              dense
              aria-label="Valor"
              :rules="[(v) => Number(v) > 0 || 'Informe um valor positivo']"
          /></label-form>
          <p v-if="kind !== 'deposit'" class="text-caption">
            Saldo disponível: {{ walletMoney(available, currency) }}
          </p>
          <template v-if="kind !== 'transfer'">
            <resource-state :state="banks.state" @retry="loadBanks">
              <label-form
                class="q-mt-md"
                :text-label="
                  kind === 'deposit'
                    ? 'Conta de origem · mesmo titular e moeda'
                    : 'Conta de destino · mesmo titular e moeda'
                "
              >
                <q-select
                  v-model="bankId"
                  :options="bankOptions"
                  emit-value
                  map-options
                  outlined
                  dense
                  aria-label="Conta bancária"
                  :rules="[(v) => !!v || 'Selecione uma conta']"
                />
              </label-form>
            </resource-state>
            <p v-if="clientId && !banks.state.loading && !bankOptions.length" class="text-caption">
              Nenhuma conta com moeda {{ currency }} confirmada. Confira o cadastro bancário do
              cliente.
            </p>
          </template>
          <label-form
            v-if="kind === 'deposit'"
            text-label="Comprovante de depósito · anexado pelo admin"
            class="q-mt-md"
            ><q-file
              v-model="receiptFile"
              outlined
              dense
              clearable
              label="Selecionar comprovante"
              accept=".pdf,image/png,image/jpeg"
              aria-label="Comprovante de depósito"
          /></label-form>
          <label-form text-label="Observação" class="q-mt-md"
            ><q-input v-model="observation" outlined dense type="textarea" aria-label="Observação"
          /></label-form>
        </form-section>
        <form-section title="Resumo da operação">
          <dl class="operation-summary">
            <dt>Tipo</dt>
            <dd>{{ types.find((item) => item.value === kind).label }}</dd>
            <dt>Moeda</dt>
            <dd>{{ currency }}</dd>
            <dt>Valor</dt>
            <dd>{{ walletMoney(amount, currency) }}</dd>
            <dt>Prazo</dt>
            <dd>{{ deadline }}</dd>
            <template v-if="kind !== 'deposit'"
              ><dt>Saldo após a operação</dt>
              <dd>{{ walletMoney(balanceAfter(available, amount), currency) }}</dd></template
            >
          </dl>
          <p class="text-caption q-mt-md">
            {{
              kind === 'deposit'
                ? 'Aguarda confirmação administrativa. O cliente não envia comprovante pelo portal.'
                : kind === 'withdrawal'
                  ? 'Saque exclusivamente da Carteira de Depósito para conta do mesmo titular e moeda.'
                  : 'Transferência automática entre carteiras do mesmo cliente e na mesma moeda, sem aprovação manual ou Senha de Saque.'
            }}
          </p>
        </form-section>
        <p v-if="!submitOperation" class="text-caption" role="status">
          A confirmação das novas movimentações aguarda a liberação do serviço. Nenhuma solicitação
          será enviada antes disso.
        </p>
        <q-banner v-if="error" role="alert" class="bg-transparent text-negative">{{
          error
        }}</q-banner>
        <div class="transaction-actions">
          <q-btn v-close-popup outline no-caps label="Cancelar" /><q-btn
            color="primary"
            no-caps
            label="Confirmar"
            type="submit"
            :loading="busy"
            :disable="
              !submitOperation ||
              !clientId ||
              Number(amount) <= 0 ||
              (kind !== 'transfer' && !bankId)
            "
          />
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>
<script setup>
import { computed, onScopeDispose, ref, watch } from 'vue'
import TitleCard from 'src/components/Card/TitleCard.vue'
import FormSection from 'src/components/Entity/FormSection.vue'
import LabelForm from 'src/components/Form/LabelForm.vue'
import MoneyInput from 'src/components/Form/MoneyInput.vue'
import CustomerSelect from './CustomerSelect.vue'
import ResourceState from './ResourceState.vue'
import { useFinanceResource } from 'src/composables/useFinanceResource'
import { readBankCatalog } from 'src/services/bankCatalog'
import { listBanks } from 'src/services/customerService'
import { financeGet } from 'src/services/financeService'
import {
  WALLET_CURRENCIES,
  readWalletBankAccounts,
  compatibleBanks,
  balanceAfter,
  walletBalance,
  walletMoney,
  transferDeadline,
} from 'src/services/walletModel'
const props = defineProps({
  model: { type: Object, default: null },
  submitOperation: { type: Function, default: null },
})
const emit = defineEmits(['created', 'busy'])
const kind = ref('deposit'),
  clientId = ref(null),
  currency = ref('BRL'),
  from = ref('deposit'),
  amount = ref(0),
  bankId = ref(null),
  receiptFile = ref(null),
  observation = ref(''),
  busy = ref(false),
  error = ref('')
const types = [
  {
    label: 'Depósito',
    value: 'deposit',
    icon: 'south',
    description: 'Entrada na Carteira de Depósito',
  },
  {
    label: 'Saque',
    value: 'withdrawal',
    icon: 'north',
    description: 'Saída para conta do cliente',
  },
  {
    label: 'Transferência',
    value: 'transfer',
    icon: 'swap_horiz',
    description: 'Entre Depósito e Strategy',
  },
]
const walletOptions = [
  { label: 'Carteira de Depósito', value: 'deposit' },
  { label: 'Carteira Strategy', value: 'strategy' },
]
const currencyOptions = WALLET_CURRENCIES.map((item) => ({
  label: item.code + ' · ' + item.name,
  value: item.code,
}))
const to = computed(() => (from.value === 'deposit' ? 'strategy' : 'deposit'))
const available = computed(() =>
  walletBalance(props.model, kind.value === 'withdrawal' ? 'deposit' : from.value, currency.value),
)
const deadline = computed(() =>
  kind.value === 'deposit'
    ? 'Após confirmação administrativa'
    : kind.value === 'withdrawal'
      ? 'Até 1 dia útil'
      : transferDeadline(from.value),
)
const banks = useFinanceResource()
const bankCatalog = useFinanceResource()
bankCatalog.load(() => readBankCatalog(listBanks))
const bankOptions = computed(() =>
  compatibleBanks(banks.state.data, currency.value).map((bank) => ({
    value: bank.id,
    label:
      (bank.bankName ||
        bankCatalog.state.data?.find((item) => item.id === bank.bankId)?.name ||
        'Banco não informado') +
      ' · ' +
      (bank.accountNumberMasked || 'Conta protegida'),
  })),
)
let bankRevision = 0
function loadBanks() {
  const id = clientId.value,
    revision = ++bankRevision
  return banks.load(() =>
    id
      ? readWalletBankAccounts(
          (page) => financeGet('admin/customers/' + id + '/bank-accounts', { page, pageSize: 100 }),
          () => revision === bankRevision && id === clientId.value,
        )
      : [],
  )
}
watch(clientId, () => {
  bankId.value = null
  receiptFile.value = null
  loadBanks()
})
watch([currency, kind], () => {
  bankId.value = null
  error.value = ''
})
watch(busy, (value) => emit('busy', value))
onScopeDispose(() => {
  bankRevision++
  banks.reset()
  bankCatalog.reset()
})
async function save() {
  if (busy.value || !props.submitOperation || !clientId.value || Number(amount.value) <= 0) return
  if (kind.value !== 'transfer' && !bankOptions.value.some((bank) => bank.value === bankId.value))
    return
  if (kind.value !== 'deposit' && (available.value === null || amount.value > available.value)) {
    error.value = 'Confira o saldo disponível antes de continuar.'
    return
  }
  busy.value = true
  error.value = ''
  try {
    const result = await props.submitOperation({
      kind: kind.value,
      clientId: clientId.value,
      currency: currency.value,
      amount: amount.value,
      from: kind.value === 'withdrawal' ? 'deposit' : from.value,
      to: to.value,
      bankId: kind.value === 'transfer' ? undefined : bankId.value,
      receiptFile: kind.value === 'deposit' ? receiptFile.value : undefined,
      observation: observation.value.trim() || null,
    })
    emit('created', result.id)
  } catch {
    error.value = 'Não foi possível criar a solicitação. Confira os dados e tente novamente.'
  } finally {
    busy.value = false
  }
}
</script>
<style scoped>
.operation-choices {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 24px;
}
.operation-choices button {
  color: white;
  padding: 16px;
  border: 1px solid #ffffff33;
  background: linear-gradient(90deg, #ffffff14, #ffffff08, #ffffff12);
  border-radius: 10px;
  cursor: pointer;
  text-align: left;
}
.operation-choices .transfer {
  grid-column: 1/-1;
}
.operation-choices .selected {
  border-color: #00a3ff;
  background-color: #00a3ff14;
}
.operation-choices span {
  margin-left: 8px;
  font-weight: 600;
}
.operation-choices small {
  display: block;
  margin-top: 10px;
  color: #ffffff99;
}
.operation-summary {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  font-size: 13px;
}
dt {
  color: #ffffff99;
}
dd {
  margin: 0;
  text-align: right;
}
.transaction-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}
.transaction-actions :deep(.q-btn) {
  width: 120px;
  height: 32px;
  min-height: 32px;
  border-radius: 8px;
  font-size: 12px;
}
</style>

<style>
.wallet-currency-menu {
  background: linear-gradient(100deg, rgba(25, 35, 49, 0.97), rgba(31, 47, 61, 0.97));
  backdrop-filter: blur(20px);
  color: #fafafa;
  border: 1px solid #ffffff33;
  border-radius: 8px;
  box-shadow: 4px 4px 12px #00000040;
}
.wallet-currency-menu .q-item--active {
  background: #ffffff16;
  color: white;
}
</style>
