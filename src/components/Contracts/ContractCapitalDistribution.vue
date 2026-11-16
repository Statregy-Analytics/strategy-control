<template>
  <q-dialog :model-value="true" @update:model-value="close">
    <q-card class="capital-distribution" aria-labelledby="capital-distribution-title">
      <header>
        <h2 id="capital-distribution-title">
          {{
            step === 'selection'
              ? 'Selecionar clientes para vincular'
              : 'Distribuir capital entre clientes'
          }}
        </h2>
        <button type="button" aria-label="Fechar" @click="close">
          <img :src="icon('close')" alt="" />
        </button>
      </header>
      <section v-if="step === 'selection'" class="capital-distribution__body">
        <p class="capital-distribution__info">
          <img :src="icon('info')" alt="" />Selecione um ou mais clientes que receberão participação
          no contrato. Na próxima etapa você distribuirá o capital inicial contratual entre eles.
        </p>
        <q-input
          v-model="search"
          outlined
          dense
          debounce="350"
          placeholder="Nome, ID, CPF/CNPJ..."
          aria-label="Buscar clientes"
          @update:model-value="load"
          ><template #prepend><img :src="icon('search')" alt="" width="16" /></template
        ></q-input>
        <div class="capital-distribution__options" aria-label="Clientes disponíveis">
          <p v-if="loading" role="status">Carregando clientes...</p>
          <div v-else-if="error" role="alert">
            {{ error }} <q-btn flat no-caps label="Tentar novamente" @click="load" />
          </div>
          <p v-else-if="!options.length">Nenhum cliente encontrado.</p>
          <button
            v-for="client in options"
            v-else
            :key="client.customerId"
            type="button"
            class="capital-distribution__option"
            :class="{ selected: selected(client.customerId) }"
            :aria-pressed="selected(client.customerId)"
            @click="toggle(client)"
          >
            <span class="capital-distribution__check"
              ><img v-if="selected(client.customerId)" :src="icon('check')" alt=""
            /></span>
            <span class="capital-distribution__avatar"
              ><img
                :src="
                  icon(
                    ['LegalEntity', 'Organization'].includes(client.personType)
                      ? 'business'
                      : 'user',
                  )
                "
                alt=""
            /></span>
            <span class="capital-distribution__identity"
              ><strong>{{ client.displayName }}</strong
              ><small>{{ client.maskedDocument || 'Documento não informado' }}</small></span
            >
          </button>
        </div>
        <div v-if="rows.length" class="capital-distribution__selected">
          <strong>Selecionados ({{ rows.length }})</strong>
          <div>
            <span v-for="row in rows" :key="row.clientId">{{ row.displayName }}</span>
          </div>
        </div>
        <p v-if="!positiveCapital" class="capital-distribution__missing" role="status">
          Capital Inicial não definido
        </p>
      </section>
      <section v-else class="capital-distribution__body">
        <div class="capital-distribution__capital">
          <div>
            <small>Capital do Contrato</small><strong>{{ money(state.base) }}</strong>
          </div>
          <div>
            <small>Moeda Firmada</small><strong>{{ currency }}</strong>
          </div>
        </div>
        <p class="capital-distribution__info">
          <img :src="icon('info')" alt="" />Informe o valor ou a participação (%) de cada cliente:
          um calcula o outro (participação = valor ÷ capital inicial).
        </p>
        <div v-for="(row, index) in rows" :key="row.clientId" class="capital-distribution__client">
          <div class="capital-distribution__client-heading">
            <span>{{ index + 1 }}</span>
            <div class="capital-distribution__identity">
              <strong>{{ row.displayName }}</strong
              ><small>{{ row.maskedDocument || 'Documento não informado' }}</small>
            </div>
          </div>
          <div class="capital-distribution__fields">
            <label-form text-label="Valor Atribuído" label-size="12px"
              ><q-input
                :model-value="amountTexts[row.clientId]"
                outlined
                dense
                inputmode="decimal"
                placeholder="0,00"
                :aria-label="`Valor atribuído a ${row.displayName}`"
                @update:model-value="setAmount(row, $event)"
                @blur="formatAmount(row)"
                ><template #prepend
                  ><span class="capital-distribution__unit">{{ symbol }}</span></template
                ></q-input
              ></label-form
            >
            <label-form text-label="Participação (%)" label-size="12px"
              ><q-input
                :model-value="
                  percentTexts[row.clientId] ??
                  (row.allocatedAmount == null ? '' : decimalLabel(state.percentages[index]))
                "
                outlined
                dense
                inputmode="decimal"
                placeholder="0,00"
                :aria-label="`Participação de ${row.displayName}`"
                @update:model-value="setPercent(row, $event)"
                @blur="delete percentTexts[row.clientId]"
                ><template #append
                  ><span class="capital-distribution__unit">%</span></template
                ></q-input
              ></label-form
            >
          </div>
        </div>
        <div
          class="capital-distribution__totals"
          :class="{ closed: state.closed }"
          aria-live="polite"
        >
          <div class="capital-distribution__totals-grid">
            <div>
              <small>Total Distribuído</small><strong>{{ money(state.total) }}</strong>
            </div>
            <div>
              <small>Total %</small><strong>{{ decimalLabel(state.totalPercentage) }}%</strong>
            </div>
            <div>
              <small>Saldo Restante</small
              ><strong :class="{ negative: state.remaining < 0n }">{{
                money(state.remaining)
              }}</strong>
            </div>
          </div>
          <p v-if="!state.closed">
            <img :src="icon('warning')" alt="" /><span
              >{{ state.remaining < 0n ? 'Passou' : 'Faltam' }}
              {{ money(state.remaining < 0n ? -state.remaining : state.remaining) }}
              {{ state.remaining < 0n ? 'do' : 'para chegar ao' }} capital inicial contratual. A
              soma dos valores tem de ser igual ao capital inicial contratual e a soma das
              participações, 100,00%.</span
            >
          </p>
        </div>
      </section>
      <footer>
        <q-btn
          outline
          no-caps
          :label="step === 'selection' ? 'Cancelar' : 'Voltar'"
          @click="step === 'selection' ? close() : (step = 'selection')"
        /><q-btn
          outline
          no-caps
          :label="step === 'selection' ? 'Continuar para Distribuição' : 'Confirmar Distribuição'"
          :disable="step === 'selection' ? !rows.length || !positiveCapital : !state.valid"
          @click="advance"
        />
      </footer>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { computed, onScopeDispose, ref } from 'vue'
import LabelForm from 'src/components/Form/LabelForm.vue'
import { distributionCustomers } from 'src/services/contractDistributionCustomers'
import {
  amountFromPercent,
  capitalCents,
  centsDecimal,
  distributionState,
  localizedDecimal,
} from 'src/services/contractDistribution'
const props = defineProps({
  allocations: { type: Array, default: () => [] },
  capital: { type: [String, Number], default: null },
  currency: { type: String, default: 'BRL' },
  lookup: { type: Function, default: distributionCustomers },
})
const emit = defineEmits(['close', 'confirm'])
const rows = ref(props.allocations.map((row) => ({ ...row }))),
  step = ref('selection'),
  search = ref(''),
  options = ref([]),
  loading = ref(false),
  error = ref(''),
  amountTexts = ref({}),
  percentTexts = ref({})
let revision = 0
const state = computed(() => distributionState(rows.value, props.capital))
const positiveCapital = computed(() => (capitalCents(props.capital) ?? 0n) > 0n)
const symbol = computed(
  () =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: props.currency })
      .formatToParts(0)
      .find((p) => p.type === 'currency')?.value || props.currency,
)
const icon = (name) => `/icons/contracts/distribution/${name}.svg`
const decimalLabel = (value) => String(value).replace('.', ',')
const money = (cents) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: props.currency }).format(
    Number(centsDecimal(cents)),
  )
const selected = (id) => rows.value.some((row) => row.clientId === id)
function toggle(client) {
  if (selected(client.customerId))
    rows.value = rows.value.filter((row) => row.clientId !== client.customerId)
  else
    rows.value.push({
      clientId: client.customerId,
      displayName: client.displayName,
      maskedDocument: client.maskedDocument,
      allocatedAmount: null,
    })
  delete amountTexts.value[client.customerId]
  delete percentTexts.value[client.customerId]
}
function formatAmount(row) {
  const cents = capitalCents(row.allocatedAmount)
  amountTexts.value[row.clientId] =
    cents === null
      ? ''
      : new Intl.NumberFormat('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(Number(centsDecimal(cents)))
}
function setAmount(row, value) {
  amountTexts.value[row.clientId] = value
  const cents = capitalCents(localizedDecimal(value))
  row.allocatedAmount = cents === null ? null : centsDecimal(cents)
  delete percentTexts.value[row.clientId]
}
function setPercent(row, value) {
  percentTexts.value[row.clientId] = value
  row.allocatedAmount = amountFromPercent(value, props.capital)
  formatAmount(row)
}
function advance() {
  if (step.value === 'selection') {
    if (!rows.value.length || !positiveCapital.value) return
    rows.value.forEach(formatAmount)
    step.value = 'distribution'
  } else if (state.value.valid) {
    emit(
      'confirm',
      rows.value.map((row) => ({ ...row })),
    )
    close()
  }
}
function close() {
  revision++
  emit('close')
}
async function load() {
  const current = ++revision
  loading.value = true
  error.value = ''
  try {
    const result = await props.lookup({ search: search.value }, () => current === revision)
    if (current === revision) {
      options.value = result.customers || []
      for (const row of rows.value) {
        const customer = options.value.find((option) => option.customerId === row.clientId)
        if (customer) {
          row.displayName = customer.displayName
          row.maskedDocument = customer.maskedDocument
        }
      }
    }
  } catch {
    if (current === revision) {
      options.value = []
      error.value = 'Não foi possível buscar os clientes.'
    }
  } finally {
    if (current === revision) loading.value = false
  }
}
onScopeDispose(() => revision++)
load()
</script>
<style scoped>
.capital-distribution {
  width: 512px;
  max-width: calc(100vw - 32px);
  max-height: calc(100dvh - 32px);
  display: flex;
  flex-direction: column;
  color: #fff;
  background:
    linear-gradient(214deg, rgba(0, 0, 0, 0.118), rgba(0, 0, 0, 0.039), rgba(0, 0, 0, 0.02)),
    linear-gradient(214deg, rgba(0, 0, 0, 0.078), rgba(0, 0, 0, 0.039), rgba(0, 0, 0, 0.01)),
    rgba(23, 29, 43, 0.94);
  border: 1px solid #ffffff1f;
  border-radius: 12px;
  backdrop-filter: blur(20px);
  box-shadow: 4px 4px 12px #0002;
}
header {
  position: relative;
  padding: 16px 48px 16px 24px;
  border-bottom: 1px solid #ffffff1f;
  flex: none;
}
h2 {
  font-size: 14px;
  font-weight: 700;
  line-height: 20px;
  letter-spacing: 0.7px;
  text-transform: uppercase;
  margin: 0;
}
header button {
  position: absolute;
  right: 16px;
  top: 16px;
  width: 20px;
  height: 20px;
  padding: 2px;
  border: 0;
  background: transparent;
  cursor: pointer;
}
header img {
  width: 16px;
  height: 16px;
}
.capital-distribution__body {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  margin-top: 16px;
  overflow-y: auto;
  scrollbar-color: #ffffff50 transparent;
}
.capital-distribution__body p {
  margin: 0;
}
.capital-distribution__info {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  font-size: 12px;
  line-height: 19.5px;
  background: #ffffff0f;
  border: 1px solid #fff3;
  border-radius: 10px;
}
.capital-distribution__info img {
  width: 20px;
  height: 20px;
  flex: none;
}
.capital-distribution__options {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 280px;
  overflow: auto;
}
.capital-distribution__option {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px;
  color: inherit;
  background: transparent;
  border: 1.6px solid transparent;
  border-radius: 10px;
  text-align: left;
  cursor: pointer;
}
.capital-distribution__option.selected {
  background: #ffffff1a;
  border-color: #2b7fff;
}
.capital-distribution__option:hover {
  background: #ffffff14;
}
.capital-distribution__check {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex: none;
  border: 1px solid #ffffff80;
  border-radius: 4px;
}
.selected .capital-distribution__check {
  background: #2b7fff;
  border-color: #2b7fff;
}
.capital-distribution__check img {
  width: 12px;
  height: 12px;
}
.capital-distribution__avatar {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  flex: none;
  border: 1px solid #fff3;
  border-radius: 50%;
}
.capital-distribution__avatar img {
  width: 14px;
  height: 14px;
}
.capital-distribution__identity {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  overflow-wrap: anywhere;
}
.capital-distribution__identity strong {
  font-size: 14px;
  line-height: 20px;
  font-weight: 600;
}
.capital-distribution__identity small {
  font-size: 10px;
  line-height: 15px;
  color: #ffffffb8;
}
.capital-distribution__selected {
  padding: 12px 16px;
  border: 1px solid #fff3;
  border-radius: 10px;
  background: #ffffff0f;
  font-size: 12px;
}
.capital-distribution__selected > div {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}
.capital-distribution__selected span {
  padding: 4px 8px;
  border: 1px solid #fff3;
  border-radius: 8px;
}
.capital-distribution__missing {
  color: #fee685;
  font-size: 12px;
}
.capital-distribution__capital {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  padding: 14px 16px;
  border: 1px solid #fff3;
  border-radius: 10px;
  background: #ffffff0f;
}
.capital-distribution__capital > div,
.capital-distribution__totals-grid > div {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}
.capital-distribution__capital small,
.capital-distribution__totals small {
  font-size: 12px;
  color: #ffffffb8;
}
.capital-distribution__capital strong,
.capital-distribution__totals strong {
  font-size: 16px;
  overflow-wrap: anywhere;
  font-variant-numeric: tabular-nums;
}
.capital-distribution__client {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border: 1px solid #fff3;
  border-radius: 10px;
  background: #ffffff0f;
}
.capital-distribution__client-heading {
  display: flex;
  align-items: center;
  gap: 12px;
}
.capital-distribution__client-heading > span {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #ffffff1a;
  font-size: 14px;
  font-weight: 700;
}
.capital-distribution__fields {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 12px;
}
.capital-distribution__unit {
  font-size: 12px;
  font-weight: 700;
  color: #ffffffb8;
}
.capital-distribution__totals {
  padding: 14px 16px;
  border: 1px solid #fee685;
  border-radius: 10px;
  background: #bb4d0033;
}
.capital-distribution__totals.closed {
  border-color: #74ffa0;
  background: #007a5533;
}
.capital-distribution__totals-grid {
  display: grid;
  grid-template-columns: 1.2fr 0.7fr 1.1fr;
  gap: 12px;
}
.capital-distribution__totals-grid > div:last-child strong {
  color: #fee685;
}
.capital-distribution__totals.closed .capital-distribution__totals-grid strong {
  color: #fff;
}
.capital-distribution__totals .negative {
  color: #ff8a8a !important;
}
.capital-distribution__totals p {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #ffffff1a;
  font-size: 12px;
  line-height: 18px;
  color: #ffffffb8;
}
.capital-distribution__totals p img {
  width: 16px;
  height: 16px;
  flex: none;
}
footer {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #ffffff1f;
  flex: none;
}
footer :deep(.q-btn) {
  background: #ffffff0f;
  min-height: 36px;
  border-radius: 8px;
  font-size: 14px;
}
footer :deep(.q-btn:first-child) {
  color: #ffffffb8;
}
footer :deep(.q-btn:before) {
  border-color: #ffffff47;
}
footer :deep(.q-btn.disabled) {
  opacity: 0.4 !important;
}
.capital-distribution__fields :deep(.q-field__native) {
  font-weight: 700;
}
:deep(.q-field__control) {
  height: 36px;
  min-height: 36px;
  border-radius: 8px;
}
:deep(.q-field__native) {
  min-width: 0;
  color: #fff;
  font-size: 14px;
}
:deep(.q-field__native::placeholder) {
  color: #ffffffb8;
  opacity: 1;
}
:deep(.q-field__control:before) {
  border-color: #ffffff1f;
}
:deep(.q-field__marginal) {
  height: 36px;
}
:deep(.q-field--focused .q-field__control:after) {
  border-color: #2b7fff;
}
button:focus-visible {
  outline: 2px solid #2b7fff;
  outline-offset: 2px;
}
@media (max-width: 400px) {
  .capital-distribution__body {
    padding: 16px;
  }
  header {
    padding-left: 16px;
  }
  .capital-distribution__totals-grid {
    gap: 8px;
  }
  .capital-distribution__totals strong {
    font-size: 14px;
  }
  footer {
    padding: 16px;
  }
  h2 {
    font-size: 12px;
  }
}
</style>
