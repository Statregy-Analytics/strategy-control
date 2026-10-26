<template>
  <q-card
    ><title-card title="Nova transação" :disable-close="busy" /><q-separator /><q-card-section>
      <q-banner v-if="error" role="alert">{{ error }}</q-banner>
      <q-form @submit="save" :inert="busy || undefined">
        <form-section title="Tipo e cliente"
          ><label-form text-label="Operação"
            ><q-select
              v-model="kind"
              :options="types"
              emit-value
              map-options
              outlined
              dense
              aria-label="Operação" /></label-form
          ><label-form text-label="Cliente" class="q-mt-md"
            ><customer-select v-model="clientId" /></label-form
        ></form-section>
        <q-banner v-if="kind === 'wallet-transfers'" class="q-my-md"
          >Transferências entre carteiras ainda não estão disponíveis. Os demais tipos de
          solicitação podem ser utilizados.</q-banner
        ><form-section v-else title="Dados da movimentação">
          <label-form v-if="kind !== 'contract-operations'" text-label="Moeda"
            ><currency-select
              v-model="currencyId"
              :customer-id="clientId"
              @currency-code="currencyCode = $event"
          /></label-form>
          <label-form text-label="Valor" class="q-mt-md"
            ><money-input
              v-model="amount"
              :currency="currencyCode"
              type="number"
              step="0.01"
              min="0.01"
              outlined
              dense
              aria-label="Valor"
              :rules="[(v) => Number(v) > 0 || 'Informe um valor positivo']"
          /></label-form>
          <resource-state
            v-if="kind === 'deposits' || kind === 'withdrawals'"
            :state="banks.state"
            @retry="loadBanks"
            ><label-form :text-label="kind === 'deposits' ? 'Conta de origem' : 'Conta de destino'"
              ><q-select
                v-model="bankId"
                :options="banks.state.data || []"
                option-value="id"
                :option-label="
                  (b) => `${b.bankName || 'Conta'} · ${b.accountNumberMasked || 'Mascarada'}`
                "
                emit-value
                map-options
                outlined
                dense
                aria-label="Conta bancária"
                :rules="[required]" /></label-form
          ></resource-state>
          <resource-state
            v-if="kind === 'contract-operations'"
            :state="contracts.state"
            @retry="loadContracts"
            ><label-form text-label="Contrato de destino"
              ><q-select
                v-model="contractId"
                :options="contracts.state.data || []"
                option-value="id"
                :option-label="(c) => `${c.publicCode} · ${c.name || ''}`"
                emit-value
                map-options
                clearable
                outlined
                dense
                aria-label="Contrato de destino" /></label-form
          ></resource-state>
          <label-form
            v-if="kind === 'deposits'"
            text-label="Comprovante de depósito"
            class="q-mt-md"
            ><customer-document-select
              v-model="receiptDocumentId"
              :customer-id="clientId" /></label-form
          ><label-form text-label="Observação" class="q-mt-md"
            ><q-input v-model="observation" outlined dense type="textarea" aria-label="Observação"
          /></label-form>
        </form-section>
        <q-btn
          type="submit"
          flat
          color="primary"
          no-caps
          label="Criar solicitação"
          :loading="busy"
          :disable="!clientId || kind === 'wallet-transfers'"
        />
      </q-form> </q-card-section
  ></q-card>
</template>
<script setup>
import MoneyInput from 'src/components/Form/MoneyInput.vue'
import { ref, watch } from 'vue'
import TitleCard from 'src/components/Card/TitleCard.vue'
import FormSection from 'src/components/Entity/FormSection.vue'
import LabelForm from 'src/components/Form/LabelForm.vue'
import CurrencySelect from './CurrencySelect.vue'
import CustomerDocumentSelect from './CustomerDocumentSelect.vue'
import CustomerSelect from './CustomerSelect.vue'
import ResourceState from './ResourceState.vue'
import { useFinanceResource } from 'src/composables/useFinanceResource'
import { buildTransactionPayload } from 'src/services/financeModels'
import { financeGet, financeWrite } from 'src/services/financeService'
const emit = defineEmits(['created', 'busy'])
const receiptDocumentId = ref(null)
const currencyCode = ref('BRL')
const kind = ref('deposits'),
  clientId = ref(null),
  currencyId = ref(null),
  amount = ref(null),
  bankId = ref(null),
  contractId = ref(null),
  observation = ref(''),
  busy = ref(false),
  error = ref('')
const banks = useFinanceResource(),
  contracts = useFinanceResource()
const types = [
  { label: 'Depósito', value: 'deposits' },
  { label: 'Saque', value: 'withdrawals' },
  { label: 'Transferência', value: 'wallet-transfers' },
  { label: 'Operação de contrato', value: 'contract-operations' },
]
watch(busy, (value) => emit('busy', value))
const required = (v) => !!v || 'Campo obrigatório'

const loadBanks = () =>
  banks.load(async () =>
    clientId.value
      ? (await financeGet(`admin/customers/${clientId.value}/bank-accounts`, { pageSize: 100 }))
          .data
      : [],
  )
const loadContracts = () =>
  contracts.load(async () =>
    clientId.value
      ? (await financeGet('admin/contracts', { clientId: clientId.value, pageSize: 100 })).data
      : [],
  )
watch(clientId, () => {
  currencyId.value = null
  bankId.value = null
  contractId.value = null
  loadBanks()
  loadContracts()
})
async function save() {
  if (busy.value) return
  if (kind.value === 'contract-operations' && !contractId.value) {
    error.value = 'Selecione o contrato de destino.'
    return
  }
  busy.value = true
  error.value = ''
  try {
    const payload = buildTransactionPayload(kind.value, {
      clientId: clientId.value,
      currencyId: currencyId.value,
      amount: amount.value,
      observation: observation.value,
      bankId: bankId.value,
      receiptDocumentId: receiptDocumentId.value,
      contractId: contractId.value,
    })
    const result = await financeWrite('post', `admin/transactions/${kind.value}`, payload)
    emit('created', result.id)
  } catch (e) {
    error.value = e.response
      ? 'Não foi possível criar a solicitação. Confira os dados e as condições da conta.'
      : e.message
  } finally {
    busy.value = false
  }
}
</script>
