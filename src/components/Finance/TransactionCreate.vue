<template>
  <q-card class="transaction-create">
    <q-form @submit="save" :inert="busy || undefined">
      <header>
        <div>
          <h2>Nova Transação</h2>
          <p>Selecione o tipo de operação que deseja realizar</p>
        </div>
        <q-btn v-close-popup flat round dense :disable="busy" aria-label="Fechar nova transação"
          ><span class="transaction-create__close"
            ><img :src="asset('Vector')" alt="" /><img :src="asset('Vector1')" alt="" /></span
        ></q-btn>
      </header>
      <div v-if="!kind" class="operation-choices" aria-label="Tipo de transação">
        <button
          v-for="item in types"
          :key="item.value"
          type="button"
          :class="{ transfer: item.value === 'transfer' }"
          @click="kind = item.value"
        >
          <img :src="asset(item.icon)" alt="" /><strong>{{ item.label }}</strong
          ><small>{{ item.description }}</small>
        </button>
      </div>
      <div v-else class="transaction-create__fields">
        <p
          class="transaction-create__info"
          :class="{ 'transaction-create__info--withdrawal': kind === 'withdrawal' }"
        >
          <template v-if="kind === 'deposit'"
            ><b>Depósito: </b>{{ ' ' }}Todo depósito entra na Carteira de Depósito do cliente, na
            moeda escolhida, e deve vir de uma conta do mesmo titular.</template
          ><template v-else-if="kind === 'withdrawal'"
            ><b>Saque: </b>{{ ' ' }}O saque sai da Carteira de Depósito, na moeda escolhida, para
            uma conta bancária do mesmo titular nessa moeda.</template
          ><template v-else
            ><b
              >{{
                otherClient ? 'Transferência para outro cliente:' : 'Transferência entre Carteiras:'
              }} </b
            >{{
              otherClient
                ? 'sai da Carteira Strategy ou da Carteira de Depósito do cliente de origem e entra na Carteira Strategy ou na Carteira de Depósito do cliente de destino.'
                : 'entre a Carteira de Depósito e a Carteira Strategy do mesmo cliente. Para enviar a outro cliente, escolha “Outro cliente” em Transferir para.'
            }}</template
          >
        </p>
        <template v-if="kind === 'transfer'"
          ><label-form text-label="Transferir para"
            ><div class="transaction-create__toggle" role="group" aria-label="Transferir para">
              <q-btn
                flat
                no-caps
                label="Mesmo cliente"
                :class="{ selected: !otherClient }"
                :aria-pressed="!otherClient"
                @click="otherClient = false"
              /><q-btn
                flat
                no-caps
                label="Outro cliente"
                :class="{ selected: otherClient }"
                :aria-pressed="otherClient"
                @click="otherClient = true"
              /></div></label-form
        ></template>
        <label-form
          :text-label="otherClient && kind === 'transfer' ? 'Cliente de origem' : 'Cliente'"
          ><customer-select v-model="clientId" :dropdown-icon="'img:' + chevron"
        /></label-form>
        <label-form v-if="kind === 'withdrawal'" text-label="Carteira de Origem"
          ><q-input model-value="Carteira de Depósito" outlined dense readonly /><small
            class="transaction-create__help"
            >Origem fixa: apenas Carteira de Depósito</small
          ></label-form
        >
        <template v-if="kind === 'transfer'">
          <label-form text-label="Carteira de Origem"
            ><q-select
              v-model="from"
              :options="walletOptions"
              :dropdown-icon="'img:' + chevron"
              emit-value
              map-options
              outlined
              dense
              aria-label="Carteira de origem"
          /></label-form>
          <label-form v-if="otherClient" text-label="Cliente de destino"
            ><customer-select
              v-model="destinationClientId"
              :dropdown-icon="'img:' + chevron"
              placeholder="Busque o cliente de destino (nome, ID Strategy ou documento)"
          /></label-form>
          <label-form text-label="Carteira de Destino"
            ><q-select
              v-model="to"
              :options="
                walletOptions.map((item) => ({
                  ...item,
                  disable: !otherClient && item.value === from,
                }))
              "
              :dropdown-icon="'img:' + chevron"
              emit-value
              map-options
              outlined
              dense
              aria-label="Carteira de destino"
          /></label-form>
          <p class="transaction-create__help">
            {{
              otherClient
                ? 'Para a Carteira Strategy do outro cliente: imediato | Da Carteira Strategy para a de Depósito do outro cliente: até 30 dias | De Depósito para Depósito: imediato'
                : 'Depósito → Strategy: imediato | Strategy → Depósito: automático em até 30 dias'
            }}
          </p>
        </template>
        <label-form text-label="Moeda"
          ><q-select
            v-model="currency"
            :options="currencyOptions"
            :dropdown-icon="'img:' + chevron"
            emit-value
            map-options
            outlined
            dense
            aria-label="Moeda da transação"
            popup-content-class="wallet-currency-menu"
        /></label-form>
        <resource-state v-if="kind === 'deposit'" :state="banks.state" @retry="loadBanks"
          ><label-form text-label="Banco/Conta de Origem (compatível com moeda)"
            ><q-select
              v-model="bankId"
              :options="bankOptions"
              :dropdown-icon="'img:' + chevron"
              emit-value
              map-options
              outlined
              dense
              aria-label="Conta bancária" /></label-form
        ></resource-state>
        <label-form text-label="Valor"
          ><money-input
            v-model="amount"
            :currency="currency"
            outlined
            dense
            aria-label="Valor"
            :rules="[(v) => Number(v) > 0 || 'Informe um valor positivo']"
        /></label-form>
        <template v-if="kind === 'withdrawal'"
          ><dl class="transaction-create__balances">
            <div>
              <dt>Saldo disponível:</dt>
              <dd>{{ walletMoney(available, currency) }}</dd>
            </div>
            <div>
              <dt>Valor solicitado:</dt>
              <dd>{{ walletMoney(amount, currency) }}</dd>
            </div>
            <div>
              <dt>Saldo após saque:</dt>
              <dd>{{ walletMoney(balanceAfter(available, amount), currency) }}</dd>
            </div>
          </dl>
          <resource-state :state="banks.state" @retry="loadBanks"
            ><label-form text-label="Conta Bancária de Destino (compatível com moeda)"
              ><q-select
                v-model="bankId"
                :options="bankOptions"
                :dropdown-icon="'img:' + chevron"
                emit-value
                map-options
                outlined
                dense
                aria-label="Conta bancária" /></label-form
          ></resource-state>
          <p class="transaction-create__notice">
            <img src="/icons/transactions/create/1484-86383-imgCircleAlert.svg" alt="" /><span
              >O saque será processado em até 1 dia útil.</span
            >
          </p></template
        >
        <p
          v-if="kind !== 'transfer' && clientId && !banks.state.loading && !bankOptions.length"
          class="transaction-create__help"
        >
          Nenhuma conta ativa compatível com {{ currency }}.
        </p>
        <label-form v-if="kind === 'deposit'" text-label="Upload de Comprovante (PDF)"
          ><q-file
            v-model="receiptFile"
            outlined
            dense
            clearable
            accept="application/pdf,.pdf"
            aria-label="Comprovante de depósito"
          /><small class="transaction-create__help"
            >Anexe o comprovante bancário em formato PDF</small
          ></label-form
        >
        <p v-if="kind === 'transfer'" class="transaction-create__help">Prazo: {{ deadline }}</p>
        <label-form text-label="Observação (opcional)"
          ><q-input v-model="observation" outlined dense type="textarea" aria-label="Observação"
        /></label-form>
        <p v-if="error" role="alert" class="text-negative">{{ error }}</p>
        <footer class="transaction-actions">
          <q-btn outline no-caps label="Voltar" :disable="busy" @click="kind = null" /><q-btn
            outline
            no-caps
            type="submit"
            label="Executar Operação"
            :loading="busy"
            :disable="
              !submitOperation ||
              !clientId ||
              !Number.isFinite(Number(amount)) ||
              Number(amount) <= 0 ||
              (kind !== 'deposit' && (available === null || Number(amount) > available)) ||
              (kind !== 'transfer' && !bankId) ||
              (kind === 'transfer' &&
                otherClient &&
                (!destinationClientId || destinationClientId === clientId))
            "
          />
        </footer>
      </div>
    </q-form>
    <transaction-password
      v-if="passwordForm"
      :summary="`Transferência para outro cliente · ${walletMoney(amount, currency)}`"
      :submit="save"
      @close="passwordForm = null"
    />
  </q-card>
</template>
<script setup>
import { computed, onScopeDispose, ref, watch } from 'vue'
import TransactionPassword from './TransactionPassword.vue'
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
} from 'src/services/walletModel'
const props = defineProps({
  model: { type: Object, default: null },
  submitOperation: { type: Function, default: null },
})
const emit = defineEmits(['created', 'busy'])
const asset = (name) => '/icons/transactions/create/1484-86271-img' + name + '.svg'
const chevron = computed(
  () =>
    '/icons/transactions/create/' +
    (kind.value === 'deposit'
      ? '1484-86319'
      : kind.value === 'withdrawal'
        ? '1484-86383'
        : otherClient.value
          ? '2152-329'
          : '1484-86476') +
    '-imgChevronDown.svg',
)
const kind = ref(null),
  clientId = ref(null),
  otherClient = ref(false),
  destinationClientId = ref(null),
  passwordForm = ref(null),
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
    icon: 'ArrowDownLeft',
    description: 'Entrada de recursos na Carteira de Depósito',
  },
  {
    label: 'Saque',
    value: 'withdrawal',
    icon: 'ArrowUpRight',
    description: 'Retirada de recursos da Carteira de Depósito',
  },
  {
    label: 'Transferência entre Carteiras',
    value: 'transfer',
    icon: 'ArrowRightLeft',
    description: 'Entre a Carteira de Depósito e a Carteira Strategy',
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
const to = ref('strategy')
watch(from, () => {
  if (!otherClient.value) to.value = from.value === 'deposit' ? 'strategy' : 'deposit'
})
watch(otherClient, () => {
  destinationClientId.value = null
  to.value = from.value === 'deposit' ? 'strategy' : 'deposit'
})
const wallets = useFinanceResource()
const available = computed(() => {
  if (props.model)
    return walletBalance(
      props.model,
      kind.value === 'withdrawal' ? 'deposit' : from.value,
      currency.value,
    )
  const rows = wallets.state.data?.filter(
    (row) =>
      row.type === (kind.value === 'withdrawal' || from.value === 'deposit' ? 'Free' : 'Applied') &&
      row.currencyIsoCode === currency.value,
  )
  if (
    !rows?.length ||
    rows.some((row) => row.available == null || !Number.isFinite(Number(row.available)))
  )
    return null
  return rows.reduce((sum, row) => sum + Number(row.available), 0)
})
const deadline = computed(() =>
  kind.value === 'deposit'
    ? 'Após confirmação administrativa'
    : kind.value === 'withdrawal'
      ? 'Até 1 dia útil'
      : from.value === 'strategy' && to.value === 'deposit'
        ? 'Até 30 dias'
        : 'Imediato',
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
  wallets.load(async () =>
    clientId.value ? (await financeGet(`admin/customers/${clientId.value}/wallets`)).data : [],
  )
})
watch([currency, kind], () => {
  bankId.value = null
  error.value = ''
})
watch(busy, (value) => emit('busy', value))
onScopeDispose(() => {
  bankRevision++
  wallets.reset()
  banks.reset()
  bankCatalog.reset()
})
async function save(password) {
  if (busy.value || !props.submitOperation || !clientId.value || Number(amount.value) <= 0) return
  if (kind.value !== 'transfer' && !bankOptions.value.some((bank) => bank.value === bankId.value))
    return
  if (kind.value !== 'deposit' && (available.value === null || amount.value > available.value)) {
    error.value = 'Confira o saldo disponível antes de continuar.'
    return
  }
  if (kind.value === 'transfer' && otherClient.value && typeof password !== 'string') {
    passwordForm.value = true
    return
  }
  busy.value = true
  error.value = ''
  try {
    const result = await props.submitOperation({
      kind: kind.value,
      otherClient: otherClient.value,
      destinationClientId: destinationClientId.value,
      password: typeof password === 'string' ? password : undefined,
      clientId: clientId.value,
      currency: currency.value,
      amount: amount.value,
      from: kind.value === 'withdrawal' ? 'deposit' : from.value,
      to: to.value,
      bankId: kind.value === 'transfer' ? undefined : bankId.value,
      receiptFile: kind.value === 'deposit' ? receiptFile.value : undefined,
      observation: observation.value.trim() || null,
    })
    passwordForm.value = null
    busy.value = false
    emit('busy', false)
    emit('created', result.id)
    return result
  } catch (e) {
    error.value =
      !e.response && !e.config
        ? e.message
        : 'Não foi possível criar a solicitação. Confira os dados e tente novamente.'
    if (typeof password === 'string') throw e
  } finally {
    busy.value = false
  }
}
</script>
<style scoped>
.transaction-create {
  width: 512px;
  max-width: calc(100vw - 32px);
  max-height: calc(100dvh - 32px);
  overflow: auto;
  padding: 24px;
  border: 1px solid #269ed661;
  border-radius: 14px;
  background: linear-gradient(90deg, #ffffff14, #ffffff08, #ffffff12), #18212e;
  color: #fff;
  backdrop-filter: blur(20px);
  box-shadow: 4px 4px 12px #0002;
}
header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}
h2 {
  font-size: 18px;
  font-weight: 600;
  line-height: 28px;
  margin: 0;
}
header p {
  font-size: 14px;
  line-height: 20px;
  color: #ffffffb8;
  margin: 0;
}
.transaction-create__close {
  position: relative;
  display: block;
  width: 16px;
  height: 16px;
}
.transaction-create__close img {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
.operation-choices {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-top: 40px;
  margin-bottom: 24px;
}
.operation-choices button {
  min-height: 156px;
  padding: 24px 30px;
  border: 1px solid #ffffff33;
  border-radius: 4px;
  background: #ffffff1a;
  color: #fff;
  cursor: pointer;
  text-align: center;
  font-family: inherit;
}
.operation-choices button img {
  display: block;
  margin-bottom: 16px;
}
.operation-choices strong {
  display: block;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
}
.operation-choices small {
  display: block;
  font-size: 12px;
  line-height: 16px;
  color: #ffffffb8;
  max-width: 172px;
  margin: auto;
}
.operation-choices strong {
  max-width: 172px;
  margin: auto;
}
.operation-choices .transfer {
  grid-column: 1/-1;
  min-height: 180px;
}
.operation-choices button:focus-visible {
  outline: 2px solid #00a3ff;
  outline-offset: 3px;
}
.transaction-create__fields {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 40px;
}
.transaction-create__info {
  font-size: 12px;
  line-height: 16px;
  padding: 12px;
  border: 1px solid #2b7fff;
  border-radius: 8px;
  color: #bedbff;
  background: #ffffff1a;
  margin: 0;
}
.transaction-create__help {
  font-size: 12px;
  line-height: 16px;
  color: #ffffffb8;
  margin: 0;
}
.transaction-create__toggle {
  display: flex;
  gap: 4px;
  background: #ffffff0a;
  border: 1px solid #ffffff33;
  border-radius: 10px;
  padding: 4px;
}
.transaction-create__toggle .q-btn {
  flex: 1;
}
.transaction-create__toggle .selected {
  background: #ffffff14;
  border: 1px solid #ffffff33;
}
.transaction-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}
.transaction-create .q-btn {
  color: #ffffffb8;
  border-radius: 8px;
  font-size: 14px;
}
.transaction-create :deep(.q-field__native),
.transaction-create :deep(.q-field__input) {
  color: #fff;
}
.transaction-create :deep(.q-select__dropdown-icon) {
  font-size: 16px;
}
.transaction-create :deep(.q-field--outlined .q-field__control) {
  border-radius: 8px;
  background: #ffffff0f;
}
.transaction-create :deep(.q-field--outlined .q-field__control:before) {
  border-color: #269ed64d;
}
@media (max-width: 400px) {
  .transaction-create {
    padding: 16px;
  }
  .operation-choices button {
    padding: 16px;
  }
  .operation-choices small {
    font-size: 12px;
  }
}
.transaction-create__info--withdrawal {
  border-color: var(--sa-color-border-danger, #e7000b);
  color: var(--sa-color-text-danger, #e7000b);
}
.transaction-create__balances {
  margin: 0;
  padding: 16px;
  border: 1px solid #269ed633;
  border-radius: 10px;
  background: linear-gradient(90deg, #ffffff1f, #ffffff0d, #ffffff1a);
  font-size: 14px;
  line-height: 20px;
}
.transaction-create__balances div {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}
.transaction-create__balances div:last-child {
  border-top: 1px solid #ffffff33;
  padding-top: 8px;
  margin-bottom: 0;
}
.transaction-create__balances dt {
  color: #ffffff99;
}
.transaction-create__balances dd {
  margin: 0;
  font-weight: 700;
}
.transaction-create__notice {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid #fee685;
  border-radius: 10px;
  background: linear-gradient(90deg, #ffffff14, #ffffff08, #ffffff12);
  padding: 12px;
  font-size: 12px;
  line-height: 16px;
  color: #fee685;
  margin: 0;
}
</style>
