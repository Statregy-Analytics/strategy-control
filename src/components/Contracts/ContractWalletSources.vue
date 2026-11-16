<template>
  <div class="wallet-capital__sources">
    <div>
      <h3>Moedas do aporte</h3>
      <p class="wallet-capital__hint">
        Uma ou mais moedas, da Carteira Strategy (saldo parado) ou da Carteira de Depósito do
        cliente; a mesma moeda pode vir das duas carteiras, uma linha para cada. Moeda diferente da
        firmada ({{ currency }}) é convertida pela última PTAX de venda.
      </p>
    </div>
    <resource-state :state="wallets.state" @retry="loadWallets">
      <div class="wallet-capital__lines">
        <div
          v-for="line in state.rows"
          :key="walletLineKey(line)"
          class="wallet-capital__line"
          :class="{ insufficient: line.exceeds }"
        >
          <div class="wallet-capital__line-heading">
            <strong>{{ line.currencyIsoCode }} · {{ walletCapitalType(line.type).label }}</strong
            ><span
              >{{ walletCapitalType(line.type).balance }}:
              {{ walletMoney(line.availableCents, line.currencyIsoCode) }}</span
            >
          </div>
          <q-input
            :model-value="amountTexts[walletLineKey(line)] ?? amountLabel(line.amount)"
            outlined
            dense
            inputmode="decimal"
            placeholder="0,00"
            :aria-label="`Valor a utilizar em ${line.currencyIsoCode} na ${walletCapitalType(line.type).label}`"
            :aria-invalid="line.exceeds"
            @update:model-value="updateAmount(line, $event)"
            @blur="delete amountTexts[walletLineKey(line)]"
            ><template #prepend
              ><span class="wallet-capital__unit">{{
                symbol(line.currencyIsoCode)
              }}</span></template
            ></q-input
          >
          <p v-if="line.exceeds" class="wallet-capital__error" role="alert">
            <img :src="asset('2326-335', 'CircleAlert')" alt="" />{{
              line.type === 'Applied' ? 'Saldo parado insuficiente' : 'Saldo insuficiente'
            }}
            em {{ line.currencyIsoCode }} na {{ walletCapitalType(line.type).label }}: disponível
            {{ walletMoney(line.availableCents, line.currencyIsoCode) }}.
          </p>
          <template v-else-if="!state.exceeds">
            <p v-if="line.currencyIsoCode === currency" class="wallet-capital__hint">
              Mesma moeda do contrato: sem conversão.
            </p>
            <resource-state
              v-else-if="quotes[line.currencyIsoCode]"
              :state="quotes[line.currencyIsoCode]"
              @retry="loadQuote(line.currencyIsoCode)"
              ><p class="wallet-capital__hint">
                × {{ walletRateLabel(line.quote?.rate) }} (PTAX de venda de
                {{ walletQuoteDate(line.quote?.referenceDate) }}) =
                {{ walletMoney(line.converted, currency) }}
              </p></resource-state
            >
          </template>
          <div class="wallet-capital__line-footer">
            <span v-if="!line.exceeds"
              >{{ walletCapitalType(line.type).after }}:
              {{ walletMoney(line.after, line.currencyIsoCode) }}</span
            ><span v-else /><button
              type="button"
              :aria-label="`Remover ${line.currencyIsoCode} da ${walletCapitalType(line.type).label}`"
              @click="removeLine(line)"
            >
              Remover
            </button>
          </div>
        </div>
      </div>
      <q-btn
        outline
        no-caps
        class="wallet-capital__add"
        :class="{ open: picking }"
        :aria-expanded="picking"
        @click="picking = !picking"
        ><img :src="asset(picking ? '2326-281' : configNode, 'Plus')" alt="" />Adicionar
        moeda</q-btn
      >
      <div v-if="picking" class="wallet-capital__picker">
        <div role="tablist" aria-label="Carteira de origem">
          <button
            v-for="type in walletCapitalTypes"
            :key="type.key"
            type="button"
            role="tab"
            :aria-selected="tab === type.key"
            @click="tab = type.key"
          >
            {{ type.label }}
          </button>
        </div>
        <div role="listbox" :aria-label="`Moedas da ${walletCapitalType(tab).label}`">
          <button
            v-for="option in options"
            :key="option.code"
            type="button"
            role="option"
            :aria-selected="
              lines.some((line) => walletLineKey(line) === `${option.type}:${option.code}`)
            "
            :disabled="!canAdd(option)"
            @click="add(option)"
          >
            <span>{{ option.code }} · {{ option.name }}</span
            ><strong>{{ walletMoney(option.available, option.code) }}</strong>
          </button>
        </div>
        <p class="wallet-capital__hint">
          As abas do topo trocam a carteira: Carteira Strategy mostra o saldo parado (rendendo) de
          cada moeda; Carteira de Depósito, o saldo. As sete moedas aparecem sempre, e a que não tem
          saldo aparece zerada. Só dá para escolher moeda com saldo e que ainda não está no aporte
          por aquela carteira; a mesma moeda pode entrar pelas duas.
        </p>
      </div>
    </resource-state>
    <p v-if="state.exceeds" class="wallet-capital__hint">
      Enquanto o valor de alguma linha passar do saldo da carteira de onde sai,
      {{
        entry
          ? 'Impacto no contrato e Auditoria não aparecem e Confirmar inclusão fica desabilitado.'
          : 'a conversão não aparece e Confirmar Vínculo fica desabilitado.'
      }}
    </p>
    <slot v-else-if="lines.length" name="conversion-heading" />
    <div v-if="!state.exceeds && lines.length" class="wallet-capital__conversion">
      <template v-if="state.rows.some((line) => line.currencyIsoCode !== currency)">
        <h4 v-if="!entry">
          <img :src="asset(configNode, 'ArrowRightLeft')" alt="" />Conversão para a moeda firmada
          ({{ currency }})
        </h4>
        <table>
          <thead>
            <tr>
              <th>Origem</th>
              <th>Valor de origem</th>
              <th>PTAX (venda)</th>
              <th>Em {{ currency }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="line in state.rows" :key="walletLineKey(line)">
              <td>{{ line.currencyIsoCode }} · {{ walletCapitalType(line.type).short }}</td>
              <td>{{ walletMoney(line.amountCents, line.currencyIsoCode) }}</td>
              <td>
                {{
                  line.currencyIsoCode === currency
                    ? '—'
                    : line.quote
                      ? walletRateLabel(line.quote.rate)
                      : 'Indisponível'
                }}
              </td>
              <td>{{ walletMoney(line.converted, currency) }}</td>
            </tr>
          </tbody>
        </table>
      </template>
      <div v-if="entry && !hasConversion" class="wallet-capital__entry-total">
        <div>
          <small>Total do aporte</small><strong>{{ walletMoney(state.total, currency) }}</strong>
        </div>
        <div>
          <small>Moeda firmada do contrato</small><strong>{{ currency }}</strong>
        </div>
      </div>
      <div v-else class="wallet-capital__total">
        <strong>Total do aporte</strong><strong>{{ walletMoney(state.total, currency) }}</strong>
      </div>
      <p v-for="date in quoteDates" :key="date" class="wallet-capital__hint">
        PTAX de venda do fechamento de {{ walletQuoteDate(date) }}, a última publicada; a mesma taxa
        vale nos dois sentidos.
      </p>
    </div>
  </div>
</template>
<script setup>
import { computed, ref, watch } from 'vue'
import ResourceState from 'src/components/Finance/ResourceState.vue'
import {
  walletCapitalCurrencies,
  walletCapitalTypes,
  walletCapitalType,
  walletLineKey,
  walletMoney,
  walletRateLabel,
  walletQuoteDate,
} from 'src/services/contractWalletCapital'
const props = defineProps({
  flow: { type: Object, required: true },
  currency: { type: String, required: true },
  entry: Boolean,
})
const {
  client,
  lines,
  picking,
  tab,
  quotes,
  state,
  options,
  wallets,
  loadWallets,
  canAdd,
  add,
  loadQuote,
  setAmount,
  remove,
} = props.flow
const hasConversion = computed(() =>
  state.value.rows.some((line) => line.currencyIsoCode !== props.currency),
)
const configNode = computed(() => (lines.value.length > 1 ? '2325-594' : '2325-394'))
const quoteDates = computed(() => [
  ...new Set(state.value.rows.map((line) => line.quote?.referenceDate).filter(Boolean)),
])
const amountTexts = ref({})
watch(
  () => client.value?.customerId,
  () => {
    amountTexts.value = {}
  },
)
function removeLine(line) {
  delete amountTexts.value[walletLineKey(line)]
  remove(walletLineKey(line))
}
const asset = (node, name) =>
  props.entry
    ? `/icons/contracts/entry/${name === 'CircleAlert' ? '2329-617' : '2329-281'}-img${name}.svg`
    : `/icons/contracts/wallet-capital/${node}-img${name}.svg`
const symbol = (code) =>
  walletCapitalCurrencies.find((currency) => currency.code === code)?.symbol || code
const amountLabel = (value) =>
  value == null
    ? ''
    : new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
        Number(value),
      )
function updateAmount(line, value) {
  amountTexts.value[walletLineKey(line)] = value
  const source = lines.value.find((item) => walletLineKey(item) === walletLineKey(line))
  if (source) setAmount(source, value)
}
</script>
<style scoped>
.wallet-capital__sources p {
  margin: 0;
}

.wallet-capital__sources h3 {
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  margin: 0 0 4px;
}
.wallet-capital__hint {
  font-size: 12px;
  line-height: 18px;
  color: #ffffffb8;
  overflow-wrap: anywhere;
}
.wallet-capital__lines {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.wallet-capital__line {
  padding: 12px 14px;
  border: 1px solid #fff3;
  border-radius: 10px;
  background: #ffffff0f;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.wallet-capital__line-heading {
  display: flex;
  gap: 8px;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  flex-wrap: wrap;
}
.wallet-capital__line-heading strong {
  font-size: 13px;
  font-weight: 600;
}
.wallet-capital__line-heading span {
  color: #ffffffb8;
}
.wallet-capital__unit {
  font-size: 12px;
  font-weight: 700;
  color: #ffffffb8;
}
.wallet-capital__line-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 12px;
  color: #ffffffb8;
}
.wallet-capital__line-footer button {
  font: inherit;
  font-weight: 500;
  color: inherit;
  background: none;
  border: 0;
  cursor: pointer;
  padding: 0;
}
.wallet-capital__error {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 12px;
  line-height: 16px;
  font-weight: 500;
  color: #ffc9c9;
}
.wallet-capital__error img {
  flex: none;
}
.wallet-capital__add {
  width: 100%;
  margin-top: 16px;
  min-height: 36px;
  border-radius: 8px;
  color: #ffffffb8;
}
.wallet-capital__add:deep(:before) {
  border: 1px dashed #fff3;
}
.wallet-capital__add.open:deep(:before) {
  border: 1.2px solid #2b7fff;
}
.wallet-capital__add img {
  margin-right: 8px;
}
.wallet-capital__picker {
  border: 1px solid #ffffff1f;
  padding: 4px;
  margin-top: 8px;
  border-radius: 8px;
  background: linear-gradient(195deg, #0003, #0000000a);
  box-shadow: 0 8px 12px #0006;
}
.wallet-capital__picker [role='tablist'] {
  display: flex;
  gap: 4px;
  padding: 3px;
  border-radius: 6px;
  background: #ffffff0f;
}
.wallet-capital__picker [role='tab'] {
  flex: 1;
  min-width: 0;
  padding: 6px 10px;
  border: 1px solid transparent;
  border-radius: 5px;
  background: none;
  color: #ffffffb8;
  font-size: 13px;
  cursor: pointer;
}
.wallet-capital__picker [role='tab'][aria-selected='true'] {
  border-color: #2b7fff;
  background: #ffffff1a;
  color: #fff;
  font-weight: 600;
}
.wallet-capital__picker [role='option'] {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 10px;
  width: 100%;
  border: 0;
  border-radius: 6px;
  color: #fff;
  background: none;
  text-align: left;
  font-size: 14px;
  cursor: pointer;
}
.wallet-capital__picker [role='option'] span {
  min-width: 0;
  overflow-wrap: anywhere;
}
.wallet-capital__picker [role='option'] strong {
  font-size: 12px;
  font-weight: 600;
  color: #ffffffb8;
}
.wallet-capital__picker [role='option']:hover {
  background: #ffffff1a;
}
.wallet-capital__picker [role='option']:disabled {
  opacity: 0.4;
  cursor: default;
}
.wallet-capital__picker > p {
  margin: 16px 0 0;
  padding: 0 6px 6px;
}
.wallet-capital__conversion {
  padding: 14px 16px;
  border: 1px solid #fff3;
  border-radius: 10px;
  background: #ffffff0f;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.wallet-capital__sources h4 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 600;
  margin: 0;
}
.wallet-capital__conversion table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  table-layout: fixed;
}
.wallet-capital__conversion th,
.wallet-capital__conversion td {
  padding: 7px 3px;
  border-bottom: 1px solid #ffffff1a;
  overflow-wrap: anywhere;
  text-align: left;
  font-weight: 400;
}
.wallet-capital__conversion th {
  color: #ffffffb8;
  font-weight: 500;
}
.wallet-capital__conversion th:nth-last-child(-n + 2),
.wallet-capital__conversion td:nth-last-child(-n + 2) {
  text-align: right;
}
.wallet-capital__conversion td:last-child {
  font-weight: 600;
}
.wallet-capital__total {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 8px;
}
.wallet-capital__total strong {
  font-size: 12px;
}
.wallet-capital__total strong:last-child {
  font-size: 16px;
  overflow-wrap: anywhere;
}

.wallet-capital__sources:deep(.q-field__control) {
  height: 36px;
  min-height: 36px;
  border-radius: 8px;
}
.wallet-capital__sources:deep(.q-field__control:before) {
  border-color: #ffffff1f;
}
.wallet-capital__sources:deep(.q-field--focused .q-field__control:after) {
  border-color: #2b7fff;
}
.wallet-capital__sources:deep(.insufficient .q-field__control:before),
.wallet-capital__sources:deep(.insufficient .q-field__control:after) {
  border-color: #ffc9c9;
}
.wallet-capital__sources:deep(.q-field__marginal) {
  height: 36px;
}
.wallet-capital__sources:deep(.q-field__native) {
  min-width: 0;
  color: #fff;
  font-size: 14px;
}
.wallet-capital__line:deep(.q-field__native) {
  font-weight: 700;
}
.wallet-capital__sources:deep(.q-textarea .q-field__control) {
  height: auto;
  min-height: 64px;
}
.wallet-capital__sources:deep(.q-field__native::placeholder) {
  color: #ffffffb8;
  opacity: 1;
}
.wallet-capital__sources button:focus-visible {
  outline: 2px solid #2b7fff;
  outline-offset: 2px;
}
@media (max-width: 400px) {
  .wallet-capital__picker [role='tab'] {
    font-size: 12px;
    padding: 6px 4px;
  }
}

.wallet-capital__entry-total {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.wallet-capital__entry-total div {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.wallet-capital__entry-total small {
  font-size: 12px;
  color: #ffffffb8;
}
.wallet-capital__entry-total strong {
  font-size: 16px;
}
.wallet-capital__sources {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}
</style>
