<template>
  <q-dialog
    :model-value="true"
    :persistent="pending"
    @update:model-value="!pending && $emit('close')"
  >
    <q-card
      class="participant-dialog"
      :class="{ 'participant-dialog--empty': !client }"
      aria-labelledby="participant-dialog-title"
    >
      <header>
        <h2 id="participant-dialog-title">
          <img :src="image('Plus1')" alt="" />Adicionar Participante ao Contrato
        </h2>
        <q-btn flat round dense aria-label="Fechar" :disable="pending" @click="$emit('close')"
          ><span class="participant-dialog__close"
            ><img :src="image('Vector')" alt="" /><img :src="image('Vector1')" alt="" /></span
        ></q-btn>
      </header>
      <form @submit.prevent="confirm">
        <div class="participant-dialog__body">
          <h3><img :src="image('User')" alt="" />1. Participante</h3>
          <label-form text-label="Cliente"
            ><customer-select
              v-model="selected"
              :clearable="false"
              :current="initialClient"
              :disable="pending"
              :lookup="lookup"
              :selected-label="
                client
                  ? client.displayName +
                    (['LegalEntity', 'Organization', 'PJ'].includes(client.personType)
                      ? ' (PJ)'
                      : ['NaturalPerson', 'Individual', 'PF'].includes(client.personType)
                        ? ' (PF)'
                        : '')
                  : null
              "
              dark
              hide-selected
              fill-input
              behavior="menu"
              popup-content-class="profile-glass-menu"
              placeholder="Selecione o cliente"
              :dropdown-icon="'img:' + image('ChevronDown')"
              @resolved="resolveClient"
          /></label-form>
          <span
            v-if="client"
            class="participant-dialog__status"
            :class="customerStatusTone(client.status)"
            >{{ customerStatusLabel(client.status) }}</span
          >
          <p v-if="duplicate" class="participant-dialog__error" role="alert">
            Este cliente já está vinculado.
          </p>
          <template v-if="client && !duplicate">
            <h3><img :src="image('Wallet')" alt="" />2. Origem do aporte</h3>
            <contract-wallet-sources :flow="flow" :currency="currency" entry
              ><template #conversion-heading
                ><h3 v-if="hasConversion" class="participant-dialog__conversion-heading">
                  <img :src="image('ArrowRightLeft')" alt="" />3. Conversão para a moeda firmada
                </h3></template
              ></contract-wallet-sources
            >
            <template v-if="showImpact">
              <h3>
                <img :src="image('TrendingUp')" alt="" />{{ hasConversion ? 4 : 3 }}. Impacto no
                contrato
              </h3>
              <div class="participant-dialog__impact">
                <dl class="participant-dialog__metrics">
                  <div>
                    <dt>Capital atual</dt>
                    <dd>{{ walletMoney(impact.capital, currency) }}</dd>
                  </div>
                  <div>
                    <dt>Novo aporte</dt>
                    <dd class="participant-dialog__positive">
                      +{{ walletMoney(impact.contribution, currency) }}
                    </dd>
                  </div>
                  <div>
                    <dt>Novo capital</dt>
                    <dd>{{ walletMoney(impact.total, currency) }}</dd>
                  </div>
                </dl>
                <dl class="participant-dialog__metrics participant-dialog__shares">
                  <div>
                    <dt>Participação do novo cliente</dt>
                    <dd>{{ pct(impact.newShare) }}</dd>
                  </div>
                  <div>
                    <dt>Participação dos anteriores</dt>
                    <dd>{{ pct(impact.previousShare) }}</dd>
                  </div>
                </dl>
                <strong>Participação de cada cliente</strong>
                <table v-if="impact.valid">
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>Antes</th>
                      <th>Depois</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="row in impact.rows" :key="row.clientId">
                      <td>
                        {{ row.name }}
                        <span v-if="row.isNew" class="participant-dialog__status ok">Novo</span>
                      </td>
                      <td>{{ row.isNew ? '—' : pct(row.before) }}</td>
                      <td>{{ pct(row.after) }}</td>
                    </tr>
                    <tr>
                      <th>Total</th>
                      <td>100,00%</td>
                      <td>100,00%</td>
                    </tr>
                  </tbody>
                </table>
                <p v-if="impact.valid" class="participant-dialog__hint">
                  Participação = aporte ÷ capital. Os clientes atuais não perdem valor: a fatia de
                  cada um cai na proporção {{ walletMoney(impact.capital, currency) }} ÷
                  {{ walletMoney(impact.total, currency) }}.
                </p>
                <p v-else class="participant-dialog__hint" role="status">
                  Capital atual ou participações indisponíveis para calcular o impacto.
                </p>
              </div>
              <div class="participant-dialog__entry">
                <label-form text-label="Data de entrada"
                  ><q-input
                    v-model="entryDate"
                    type="date"
                    readonly
                    outlined
                    dense
                    aria-label="Data de entrada"
                    ><template #prepend
                      ><img :src="image('Calendar')" alt="" /></template></q-input></label-form
                ><label-form text-label="Índice do motor na entrada"
                  ><resource-state :state="engines" @retry="retryEngines"
                    ><q-input
                      :model-value="engineIndex"
                      outlined
                      dense
                      readonly
                      aria-label="Índice do motor na entrada" /></resource-state
                ></label-form>
              </div>
              <p class="participant-dialog__hint">
                A data de entrada será registrada no momento da confirmação.
              </p>
              <h3><img :src="image('FileText')" alt="" />{{ hasConversion ? 5 : 4 }}. Auditoria</h3>
              <div class="participant-dialog__audit">
                <img :src="image('TriangleAlert')" alt="" />
                <div>
                  <strong>O que será registrado no sistema</strong>
                  <ul>
                    <li v-for="row in state.rows" :key="row.walletId + row.currencyIsoCode">
                      Débito de {{ walletMoney(row.amountCents, row.currencyIsoCode) }} do
                      {{ row.type === 'Applied' ? 'saldo parado' : 'saldo' }} da
                      {{ walletCapitalType(row.type).label }} ({{ row.currencyIsoCode }}) de
                      {{ client.displayName }}
                    </li>
                    <li
                      v-for="row in state.rows.filter((row) => row.quote)"
                      :key="'fx' + row.walletId"
                    >
                      Conversão para {{ currency }}: {{ walletOriginLabel(row) }} =
                      {{ walletMoney(row.converted, currency) }}
                    </li>
                    <li>
                      Aporte em contrato de {{ walletMoney(state.total, currency) }}, em
                      {{ currency }}
                    </li>
                    <li>
                      Participação de entrada: {{ pct(impact.newShare) }} do capital consolidado;
                      participações dos demais recalculadas (tabela acima)
                    </li>
                    <li>Índice do motor na entrada: {{ engineIndex }}</li>
                    <li>Performance não herdada (vale a partir da data de entrada)</li>
                  </ul>
                </div>
              </div>
              <label-form text-label="Observação (opcional)"
                ><q-input
                  v-model="note"
                  outlined
                  dense
                  placeholder="Informações adicionais sobre a operação"
                  aria-label="Observação da inclusão"
              /></label-form>
              <label-form text-label="Senha do admin">
                <q-input
                  v-model="password"
                  type="password"
                  autocomplete="current-password"
                  outlined
                  dense
                  aria-label="Senha do admin"
                />
              </label-form> </template
          ></template>
          <p v-if="error" class="participant-dialog__error" role="alert">{{ error }}</p>
        </div>
        <footer>
          <q-btn
            outline
            no-caps
            label="Cancelar"
            :disable="pending"
            @click="$emit('close')"
          /><q-btn outline no-caps type="submit" :disable="!canConfirm" :loading="pending"
            ><img :src="image('Plus2')" alt="" />Confirmar inclusão</q-btn
          >
        </footer>
      </form></q-card
    ></q-dialog
  >
</template>
<script setup>
import { computed, onScopeDispose, ref, watch } from 'vue'
import CustomerSelect from 'src/components/Finance/CustomerSelect.vue'
import LabelForm from 'src/components/Form/LabelForm.vue'
import ResourceState from 'src/components/Finance/ResourceState.vue'
import ContractWalletSources from './ContractWalletSources.vue'
import { distributionCustomers } from 'src/services/contractDistributionCustomers'
import { customerStatusLabel, customerStatusTone } from 'src/services/customerPresentation'
import { useContractWalletCapital } from 'src/composables/useContractWalletCapital'
import { centsDecimal } from 'src/services/contractDistribution'
import {
  walletMoney,
  walletCapitalType,
  walletOriginLabel,
} from 'src/services/contractWalletCapital'
import {
  participantEntryImpact,
  participantEntryIndex,
  participantEntryRawIndex,
  validEntryDate,
} from 'src/services/contractParticipantEntry'
const props = defineProps({
  initialClient: { type: Object, default: null },
  submit: { type: Function, required: true },
  existingIds: { type: Array, default: () => [] },
  busy: Boolean,
  lookup: { type: Function, default: distributionCustomers },
  read: { type: Function, default: undefined },
  currency: { type: String, required: true },
  contract: { type: Object, required: true },
  engines: { type: Object, required: true },
  retryEngines: { type: Function, required: true },
})
const emit = defineEmits(['close'])
const flow = useContractWalletCapital(props, () => {})
const { client, lines, state, loadingQuotes, wallets, note } = flow
const selected = ref(null),
  password = ref(''),
  saving = ref(false),
  error = ref('')
const today = new Date()
const entryDate = ref(
  `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`,
)
const pending = computed(() => props.busy || saving.value)
let active = true
onScopeDispose(() => {
  active = false
  password.value = ''
})
watch(
  selected,
  () => {
    flow.back()
    password.value = ''
    error.value = ''
  },
  { flush: 'sync' },
)
watch(
  [lines, note, entryDate],
  () => {
    error.value = ''
  },
  { deep: true },
)
function resolveClient(customer) {
  if (customer.customerId !== selected.value) return
  if (client.value?.customerId === customer.customerId) client.value = customer
  else flow.choose(customer)
}
const duplicate = computed(() => props.existingIds.includes(selected.value))
watch(
  () => props.initialClient,
  (value) => {
    if (value) {
      selected.value = value.customerId
      resolveClient(value)
    }
  },
  { immediate: true },
)
const hasConversion = computed(() =>
  state.value.rows.some((row) => row.currencyIsoCode !== props.currency),
)
const impact = computed(() =>
  participantEntryImpact(
    props.contract,
    state.value.total === null ? null : centsDecimal(state.value.total),
    client.value,
  ),
)
const showImpact = computed(
  () =>
    !duplicate.value &&
    state.value.valid &&
    !wallets.state.loading &&
    !wallets.state.error &&
    !loadingQuotes.value,
)
const engineIndex = computed(() =>
  participantEntryIndex(props.engines.data, props.contract.primaryEngine?.engineId),
)
const canConfirm = computed(
  () =>
    showImpact.value &&
    impact.value.valid &&
    validEntryDate(entryDate.value) &&
    engineIndex.value !== 'Indisponível' &&
    !!password.value &&
    !props.engines.loading &&
    !props.engines.error &&
    !pending.value,
)
const pct = (value) => (value == null ? 'Indisponível' : value.replace('.', ',') + '%')
const image = (name) => `/icons/contracts/entry/2329-281-img${name}.svg`
async function confirm() {
  if (!canConfirm.value || pending.value || duplicate.value) return
  // API compatibility is checked by the caller before any write; incomplete projections cannot be committed.
  saving.value = true
  error.value = ''
  try {
    const result = await props.submit({
      clientId: selected.value,
      allocatedAmount: centsDecimal(state.value.total),
      walletSources: state.value.rows.map((row) => ({
        ...row,
        amountCents: undefined,
        availableCents: undefined,
        converted: undefined,
        after: undefined,
      })),
      note: note.value.trim() || null,
      engineIndexAtEntry: participantEntryRawIndex(
        props.engines.data,
        props.contract.primaryEngine?.engineId,
      ),
      password: password.value,
    })
    if (!active) return
    if (result?.success === true) emit('close')
    else
      error.value = result?.message || 'Não foi possível incluir o participante. Tente novamente.'
  } catch {
    if (active) error.value = 'Não foi possível incluir o participante. Tente novamente.'
  } finally {
    password.value = ''
    if (active) saving.value = false
  }
}
</script>
<style scoped>
.participant-dialog {
  width: 536px;
  max-width: calc(100vw - 32px);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  backdrop-filter: blur(20px);
  background:
    linear-gradient(192deg, rgba(0, 0, 0, 0.19), rgba(0, 0, 0, 0.03)), rgba(23, 29, 43, 0.94);
  box-shadow: 4px 4px 12px rgba(0, 0, 0, 0.13);
}
.participant-dialog header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  min-height: 68px;
  gap: 8px;
}
.participant-dialog h2 {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  line-height: 20px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.7px;
}
.participant-dialog header .q-btn {
  min-width: 24px;
  min-height: 24px;
}
.participant-dialog__close {
  display: block;
  position: relative;
  width: 16px;
  height: 16px;
}
.participant-dialog__close img {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.participant-dialog__body {
  padding: 24px;
}
.participant-dialog h3 {
  margin: 0 0 12px;
  padding-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  line-height: 16px;
  font-weight: 700;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}
.participant-dialog :deep(.q-field) {
  margin-top: 8px;
}
.participant-dialog :deep(.LabelForm > span) {
  line-height: 14px;
}
.participant-dialog :deep(.q-field__control) {
  height: 36px;
  min-height: 36px;
  border-radius: 8px;
  color: #fff;
  background: linear-gradient(182deg, rgba(0, 0, 0, 0.19), rgba(0, 0, 0, 0.03));
}
.participant-dialog :deep(.q-field__control:before) {
  border-color: rgba(255, 255, 255, 0.12);
}
.participant-dialog :deep(.q-field__native),
.participant-dialog :deep(.q-field__input) {
  min-height: 36px;
  padding-top: 0;
  padding-bottom: 0;
  color: #fff;
  font-size: 14px;
}
.participant-dialog :deep(input::placeholder) {
  color: #94a8c2;
  opacity: 1;
}
.participant-dialog :deep(.q-field__append) {
  height: 36px;
}
.participant-dialog :deep(.q-select__dropdown-icon) {
  width: 16px;
  height: 16px;
  font-size: 16px;
}
.participant-dialog footer {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
}
.participant-dialog footer .q-btn {
  min-height: 36px;
  padding: 0 15px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.06);
}
.participant-dialog footer .q-btn:before {
  border-color: rgba(255, 255, 255, 0.2);
}
.participant-dialog footer img {
  margin-right: 24px;
}
.participant-dialog__error {
  margin: 12px 0 0;
  color: #ff8a8a;
  font-size: 12px;
  overflow-wrap: anywhere;
}
@media (max-width: 600px) {
  .participant-dialog h2 {
    letter-spacing: 0.3px;
  }
  .participant-dialog__body {
    padding: 20px;
  }
}

.participant-dialog {
  max-height: calc(100dvh - 32px);
  display: flex;
  flex-direction: column;
}
.participant-dialog form {
  min-height: 0;
  display: flex;
  flex-direction: column;
  flex: 1;
}
.participant-dialog header,
.participant-dialog footer {
  flex-shrink: 0;
}
.participant-dialog__body {
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
  scrollbar-color: #ffffff60 transparent;
}
.participant-dialog h3 {
  margin: 0;
}
.participant-dialog__status {
  align-self: flex-start;
  border: 1px solid #ffffff33;
  border-radius: 8px;
  padding: 3px 8px;
  font-size: 10px;
  line-height: 14px;
  color: #ffffffb8;
  white-space: nowrap;
}
.participant-dialog__status.ok {
  color: #74ffa0;
  border-color: #74ffa0;
  background: #007a5533;
}
.participant-dialog__status.blocked {
  color: #ffc9c9;
  border-color: #ffc9c9;
  background: #ad003333;
}
.participant-dialog__status.inactive {
  color: #ffffffb8;
  background: #ffffff0f;
}
.participant-dialog__impact {
  background: #ffffff0f;
  border: 1px solid #ffffff33;
  border-radius: 10px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  font-size: 12px;
}
.participant-dialog__metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin: 0;
}
.participant-dialog__metrics div {
  min-width: 0;
}
.participant-dialog__metrics dt {
  color: #ffffffb8;
  font-size: 12px;
  margin-bottom: 4px;
}
.participant-dialog__metrics dd {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  overflow-wrap: anywhere;
}
.participant-dialog__shares {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  border-block: 1px solid #ffffff1a;
  padding: 12px 0;
}
.participant-dialog__shares dd {
  font-size: 16px;
}
.participant-dialog__positive {
  color: #66e59e;
}
.participant-dialog__hint {
  color: #ffffff99;
  font-size: 12px;
  line-height: 18px;
  margin: 0;
}
.participant-dialog table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  font-size: 12px;
  color: #fff;
}
.participant-dialog th,
.participant-dialog td {
  padding: 7px 0;
  border-bottom: 1px solid #ffffff1a;
  text-align: right;
  overflow-wrap: anywhere;
}
.participant-dialog th:first-child,
.participant-dialog td:first-child {
  text-align: left;
  width: 60%;
}
.participant-dialog thead th {
  font-weight: 500;
  color: #ffffff99;
}
.participant-dialog table .participant-dialog__status {
  font-size: 10px;
  padding: 1px 6px;
}
.participant-dialog__entry {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
.participant-dialog__entry > * {
  min-width: 0;
}
.participant-dialog__audit {
  display: flex;
  gap: 10px;
  background: #bb4d0033;
  border: 1px solid #fee685;
  border-radius: 10px;
  padding: 12px 16px;
  font-size: 12px;
  line-height: 20px;
  color: #ffffffb8;
}
.participant-dialog__audit > img {
  align-self: flex-start;
}
.participant-dialog__audit > div {
  min-width: 0;
}
.participant-dialog__audit strong {
  color: #fee685;
  line-height: 16px;
}
.participant-dialog__audit ul {
  margin: 6px 0 0;
  padding-left: 14px;
}
.participant-dialog__audit li {
  overflow-wrap: anywhere;
}
@media (max-width: 400px) {
  .participant-dialog header {
    padding: 16px;
  }
  .participant-dialog__body {
    padding: 16px;
  }
  .participant-dialog__entry {
    grid-template-columns: 1fr;
  }
  .participant-dialog__metrics {
    gap: 8px;
  }
  .participant-dialog h2 {
    font-size: 12px;
  }
}
@media (max-width: 400px) {
  .participant-dialog footer {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
  .participant-dialog footer .q-btn {
    min-width: 0;
    padding: 0 8px;
  }
  .participant-dialog footer img {
    margin-right: 8px;
    flex-shrink: 0;
  }
}

/* CT09 is the compact empty selection; item 138 expands only after selection. */
.participant-dialog--empty {
  width: 512px;
}
.participant-dialog--empty header {
  min-height: 53px;
}
.participant-dialog--empty .participant-dialog__body {
  gap: 12px;
}

.participant-dialog--empty header .q-btn {
  min-width: 16px;
  min-height: 16px;
  width: 16px;
  height: 16px;
}
.participant-dialog--empty :deep(.q-field) {
  margin-top: 4px;
}
</style>
