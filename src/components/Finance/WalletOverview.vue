<template>
  <section class="wallet-overview" aria-label="Visão consolidada das carteiras">
    <div
      :class="[
        'wallet-cards',
        {
          'wallet-cards--global': !details,
          'wallet-cards--transactions': presentation === 'transactions',
        },
      ]"
    >
      <button
        v-for="item in orderedTypes"
        :key="item.key"
        type="button"
        :class="{ selected: selected === item.key }"
        :aria-pressed="selected === item.key"
        @click="selectWallet(item.key)"
      >
        <template v-if="!details">
          <img
            v-if="item.key === 'total'"
            src="/icons/wallet-directory/summary-watermark.svg"
            class="wallet-watermark"
            alt=""
          />
          <div class="wallet-global-heading">
            <span
              ><img
                :src="
                  '/icons/wallet-directory/' +
                  ((
                    presentation === 'transactions'
                      ? item.key === 'assets'
                      : item.key === 'strategy'
                  )
                    ? 'summary-strategy'
                    : 'summary-wallet') +
                  '.svg'
                "
                alt=""
              />{{ item.key === 'assets' ? 'Carteira de Patrimônio' : item.label }}</span
            ><small
              class="wallet-global-badge"
              :class="{ 'wallet-global-badge--available': item.key === 'deposit' }"
              >{{
                {
                  total: 'Consolidado',
                  deposit: 'Disponível',
                  strategy: model?.yieldAvailable === true ? 'Rendendo' : '—',
                  assets: 'Bens declarados',
                }[item.key]
              }}</small
            >
          </div>
          <div class="wallet-global-amounts">
            <strong>{{ walletMoney(globalWalletConverted(model, item.key).usd, 'USD') }}</strong>
            <div class="wallet-global-secondary">
              <span>{{ walletMoney(globalWalletConverted(model, item.key).brl, 'BRL') }}</span
              ><small>{{
                model?.fx?.['USD-BRL']
                  ? (presentation === 'transactions'
                      ? 'Cotação USD → BRL = '
                      : item.key === 'total'
                        ? 'USD = '
                        : 'Cotação USD → BRL · ') +
                    Number(model.fx['USD-BRL'].rate).toLocaleString('pt-BR', {
                      maximumFractionDigits: 4,
                    }) +
                    (presentation !== 'transactions' && item.key === 'total' ? ' BRL' : '')
                  : 'Cotação indisponível'
              }}</small>
            </div>
          </div>
          <div v-if="item.key === 'total'" class="wallet-global-circulation">
            <span>Capital base</span
            ><strong>{{
              walletMoney(model?.baseCapitalAmount, model?.baseCapitalCurrency)
            }}</strong>
            <div class="wallet-global-track">
              <span v-if="baseProgress !== null" :style="{ width: baseProgress + '%' }" />
            </div>
            <small>{{
              baseProgress === null
                ? '—'
                : baseProgress.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }) + '% da Carteira Total'
            }}</small>
          </div>
          <span v-else class="wallet-global-arrow"
            ><img src="/icons/wallet-directory/summary-arrow.svg" alt=""
          /></span>
        </template>
        <template v-else>
          <span>{{ item.label }}</span
          ><strong v-for="amount in walletDisplayAmounts(model, item.key)" :key="amount.currency">{{
            walletMoney(amount.balance, amount.currency)
          }}</strong
          ><strong v-if="!walletDisplayAmounts(model, item.key).length">—</strong>
        </template>
        <q-tooltip>{{ item.description }}</q-tooltip>
      </button>
    </div>
    <p v-if="details" class="wallet-help">
      Total = Depósito + Strategy + Patrimônio, por moeda. Valores de moedas diferentes não são
      somados.
    </p>
    <template v-if="details">
      <p class="wallet-help">
        {{
          selected
            ? 'Clique de novo no card para desmarcar'
            : 'Clique em uma carteira para ver só a composição dela'
        }}
      </p>
      <template v-if="!selected || selected === 'total'">
        <h3>Composição da Carteira Total · Depósito + Strategy + Patrimônio</h3>
        <div class="wallet-table-scroll">
          <table>
            <thead>
              <tr>
                <th>Carteira / situação</th>
                <th>Valor</th>
                <th>Rendimento / origem</th>
                <th>Última atualização</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in walletCompositionRows(model)" :key="row.key">
                <td>{{ row.wallet }} · {{ row.situation }}</td>
                <td>{{ walletMoney(row.value, row.currency) }}</td>
                <td>{{ row.origin }}</td>
                <td>{{ displayDate(row.updatedAt) }}</td>
              </tr>
              <tr v-if="!walletCompositionRows(model).length">
                <td colspan="4" class="wallet-empty" role="status">
                  {{
                    walletIsEmpty(model)
                      ? 'Nenhuma composição ainda'
                      : 'A composição das carteiras ainda não está disponível.'
                  }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
      <template v-else-if="selected === 'assets'">
        <h3>Patrimônio · bens vinculados</h3>
        <template v-if="model?.source === 'marco3'">
          <div v-for="row in model.assets.currencies" :key="row.currency" class="asset-metrics">
            <span
              >Valor declarado · {{ row.currency
              }}<strong>{{ walletMoney(row.declared, row.currency) }}</strong></span
            >
            <span
              >Saldo devedor<strong>{{ walletMoney(row.financed, row.currency) }}</strong></span
            >
            <span
              >Patrimônio<strong>{{ walletMoney(row.balance, row.currency) }}</strong></span
            >
          </div>
        </template>
        <div v-else class="asset-metrics">
          <span
            >Valor declarado<strong>{{
              walletMoney(model?.assets?.declared, model?.principalCurrency)
            }}</strong></span
          ><span
            >Valor atualizado<strong>{{
              walletMoney(model?.assets?.total, model?.principalCurrency)
            }}</strong></span
          ><span
            >Valorização<strong>{{
              model?.assets?.appreciation == null ? '—' : model.assets.appreciation + '%'
            }}</strong></span
          >
        </div>
        <slot name="assets"
          ><p class="wallet-help">Selecione um cliente para consultar os bens vinculados.</p></slot
        >
      </template>
      <template v-else>
        <h3>
          {{
            selected === 'deposit'
              ? 'Carteira de Depósito · saldos por moeda'
              : 'Composição da Carteira Strategy · saldos por moeda'
          }}
        </h3>
        <div class="wallet-table-scroll">
          <table>
            <thead>
              <tr>
                <th>Moeda</th>
                <th>Saldo</th>
                <template v-if="selected === 'deposit'"
                  ><th>Último depósito</th>
                  <th>Último saque</th></template
                ><template v-else
                  ><th>Em contratos</th>
                  <th>{{ model?.yieldAvailable === false ? 'Parado' : 'Parado, rendendo' }}</th>
                  <th>Rendimento / origem</th></template
                >
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in walletIsEmpty(model) ? [] : walletRows(model, selected)"
                :key="row.currency"
              >
                <td>{{ row.currency }}</td>
                <td>{{ walletMoney(row.balance, row.currency) }}</td>
                <template v-if="selected === 'deposit'"
                  ><td>{{ displayDate(row.lastDeposit) }}</td>
                  <td>{{ displayDate(row.lastWithdrawal) }}</td></template
                ><template v-else
                  ><td>{{ walletMoney(row.contracted, row.currency) }}</td>
                  <td>{{ walletMoney(row.idle, row.currency) }}</td>
                  <td>
                    {{ row.yieldOrigin || row.reference + ' · índice a confirmar' }}
                  </td></template
                >
              </tr>
              <tr v-if="walletIsEmpty(model)">
                <td :colspan="selected === 'deposit' ? 4 : 5" class="wallet-empty">
                  Nenhuma composição ainda
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="wallet-help">
          {{
            selected === 'deposit'
              ? 'Sem rendimento. Saques em até 1 dia útil. Transferência para Strategy imediata.'
              : YIELD_DESCRIPTION
          }}
        </p>
        <p v-if="!model?.[selected]" class="wallet-help" role="status">
          Os saldos e movimentos deste modelo de carteira ainda não estão disponíveis.
        </p>
        <template v-if="selected === 'strategy'">
          <slot name="contracts"
            ><p class="wallet-help">Selecione um cliente para consultar os contratos.</p></slot
          ></template
        >
      </template>
    </template>
  </section>
</template>
<script setup>
import { numberInputValue } from 'src/services/numberInputValue'
import { globalWalletConverted } from 'src/services/globalWalletFx'
import { walletDisplayAmounts } from 'src/services/portfolioProjection'
import { computed, ref, watch } from 'vue'
import {
  WALLET_TYPES,
  YIELD_DESCRIPTION,
  walletRows,
  walletCompositionRows,
  walletIsEmpty,
  walletMoney,
} from 'src/services/walletModel'
const props = defineProps({
  initialType: { type: String, default: null },
  model: { type: Object, default: null },
  details: { type: Boolean, default: true },
  presentation: { type: String, default: 'directory' },
})
const baseProgress = computed(() => {
  const value = numberInputValue(props.model?.baseCapitalPercentage)
  return value !== null && value >= 0 && value <= 100 ? value : null
})
const orderedTypes = computed(() =>
  props.details ? WALLET_TYPES : [WALLET_TYPES[3], ...WALLET_TYPES.slice(0, 3)],
)
const emit = defineEmits(['select'])
const selected = ref(props.initialType)
watch(
  () => props.initialType,
  (value) => {
    selected.value = value
  },
)
function selectWallet(type) {
  selected.value = props.details && selected.value === type ? null : type
  emit('select', selected.value)
}
const displayDate = (value) =>
  value && !Number.isNaN(Date.parse(value)) ? new Date(value).toLocaleString('pt-BR') : '—'
</script>
<style scoped>
.wallet-cards {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin: 16px 0;
}
.wallet-cards button {
  position: relative;
  text-align: left;
  min-height: 102px;
  padding: 16px;
  color: white;
  border: 1px solid #ffffff33;
  background: linear-gradient(100deg, #ffffff14, #ffffff08, #ffffff12);
  box-shadow: 4px 4px 12px #00000020;
  border-radius: 10px;
  cursor: pointer;
}
.wallet-cards button span {
  display: block;
  font-size: 12px;
  text-transform: uppercase;
  color: #ffffff99;
  margin-bottom: 19px;
}
.wallet-cards strong {
  display: block;
  font-size: 20px;
  overflow-wrap: anywhere;
}
.wallet-cards button.selected::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  border-radius: 0 0 10px 10px;
  background: linear-gradient(90deg, #60a5fa, #2563eb);
}
.wallet-cards button:hover {
  background-color: #ffffff0a;
}
.wallet-cards button:focus-visible {
  outline: 2px solid #00a3ff;
  outline-offset: 3px;
}
.wallet-help {
  color: #ffffff99;
  font-size: 12px;
  margin: 12px 0 20px;
}
h3 {
  font-size: 13px;
  text-transform: uppercase;
  line-height: 1.5;
  margin: 24px 0 12px;
  color: #ffffffb3;
}
.wallet-table-scroll {
  overflow-x: auto;
  border: 1px solid #ffffff20;
  border-radius: 10px;
}
table {
  color: var(--sa-text, #fff);
  width: 100%;
  border-collapse: collapse;
  white-space: nowrap;
  font-size: 12px;
}
th,
td {
  padding: 12px 16px;
  border-bottom: 1px solid #ffffff12;
  text-align: left;
}
th {
  background: #ffffff08;
  font-weight: 500;
  color: #ffffff99;
}
tbody tr:last-child td {
  border-bottom: 0;
}
.total-composition {
  display: flex;
  justify-content: space-between;
  padding: 12px;
  background: #ffffff08;
  border-radius: 8px;
}
dd {
  margin: 0;
}
.asset-metrics {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  color: #ffffff99;
}
.asset-metrics strong {
  display: block;
  color: white;
  font-size: 20px;
  margin-top: 8px;
}
@media (max-width: 900px) {
  .wallet-cards {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 400px) {
  .wallet-cards {
    grid-template-columns: 1fr;
  }
}
.wallet-cards--global button {
  min-height: 177px;
  overflow: hidden;
}
.wallet-cards--global button span {
  color: white;
  font-weight: 600;
  position: relative;
}
.wallet-cards--global strong {
  font-size: 26px;
  position: relative;
}
.wallet-watermark {
  position: absolute;
  right: 16px;
  bottom: 24px;
  width: 100px;
  height: 100px;
  opacity: 0.1;
}
.wallet-empty {
  padding: 40px 16px;
  text-align: center;
  color: #ffffff99;
  white-space: normal;
}
</style>

<style scoped>
.wallet-cards--global {
  margin: 16px 0 28px;
  gap: 12px;
}
.wallet-cards--global button {
  min-height: 177px;
  border-radius: 12px;
  padding: 20px;
  background: linear-gradient(114deg, #ffffff0f, #ffffff14);
}
.wallet-cards--global button.selected {
  border-color: #ffffffb8;
  background: linear-gradient(114deg, #ffffff1f, #ffffff14);
}
.wallet-cards--global button.selected::after {
  display: none;
}
.wallet-cards--global .wallet-watermark {
  width: 128px;
  height: 128px;
  right: 16px;
  bottom: 28px;
  opacity: 1;
}
.wallet-global-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  position: relative;
}
.wallet-cards--global .wallet-global-heading span {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 12px;
  letter-spacing: 0.3px;
  text-transform: none;
  font-weight: 600;
}
.wallet-global-heading img {
  flex: none;
}
.wallet-global-badge {
  border: 1px solid #ffffff80;
  border-radius: 6px;
  font-size: 10px;
  padding: 2px 8px;
  line-height: 12px;
  white-space: nowrap;
  font-weight: 400;
}
.wallet-global-badge--available {
  color: #7bf1a8;
  border-color: #00c950;
  background: #00c9501a;
  text-transform: uppercase;
}
.wallet-global-caption {
  display: block;
  font-size: 10px;
  margin: 4px 0 0;
  position: relative;
}
.wallet-global-amounts {
  position: relative;
  margin-top: 24px;
  padding-bottom: 20px;
}
.wallet-global-caption + .wallet-global-amounts {
  margin-top: 0;
  padding-bottom: 8px;
}
.wallet-cards--global .wallet-global-amounts strong {
  font-size: 20px;
  line-height: 28px;
}
.wallet-cards--global .wallet-global-amounts strong + strong {
  font-size: 14px;
  line-height: 20px;
  font-weight: 400;
  margin-top: 4px;
}
.wallet-global-arrow {
  display: grid !important;
  position: absolute !important;
  place-items: center;
  width: 22px;
  height: 22px;
  bottom: 16px;
  right: 16px;
  border-radius: 6px;
  border: 1px solid #ffffff33;
  background: #ffffff0d;
  margin: 0 !important;
}
.wallet-global-circulation {
  position: relative;
  color: #00d492;
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: end;
  gap: 4px;
}
.wallet-cards--global .wallet-global-circulation span {
  font-size: 10px;
  color: inherit;
  margin: 0;
  text-transform: none;
}
.wallet-cards--global .wallet-global-circulation strong {
  font-size: 16px;
  line-height: 20px;
}
.wallet-global-track {
  height: 6px;
  background: #ffffff1a;
  border-radius: 4px;
  grid-column: 1/-1;
}
.wallet-global-circulation small {
  font-size: 10px;
  grid-column: 1/-1;
}
@media (max-width: 600px) {
  .wallet-cards--global {
    grid-template-columns: 1fr;
  }
}
</style>

<style scoped>
@media (min-width: 601px) and (max-width: 1400px) {
  .wallet-cards--global {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>

<style scoped>
.wallet-global-secondary {
  margin: 12px 0 0;
  border-left: 2px solid #ffffffb8;
  padding-left: 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.wallet-cards--global .wallet-global-secondary span {
  font-size: 14px;
  line-height: 20px;
  font-weight: 600;
  margin: 0;
  text-transform: none;
}
.wallet-global-secondary small {
  font-size: 10px;
  color: #ffffff99;
}
.wallet-global-caption + .wallet-global-amounts .wallet-global-secondary {
  border: 0;
  padding: 0;
  margin-top: 4px;
}
.wallet-global-caption + .wallet-global-amounts .wallet-global-secondary span {
  font-weight: 400;
}
</style>

<style scoped>
.wallet-cards--global .wallet-global-heading span {
  line-height: 18px;
}
.wallet-global-caption {
  line-height: 12px;
}
.wallet-global-amounts {
  padding-bottom: 0;
}
.wallet-global-caption + .wallet-global-amounts .wallet-global-secondary {
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 4px;
}
.wallet-global-caption + .wallet-global-amounts .wallet-global-secondary small {
  border: 1px solid #ffffff80;
  border-radius: 6px;
  padding: 1px 6px;
  white-space: nowrap;
}
</style>

<style scoped>
.wallet-cards--transactions .wallet-global-amounts {
  margin-top: 14px;
  padding-bottom: 4px;
}
.wallet-cards--transactions button {
  padding: 16px;
  min-height: 177px;
  border-radius: 14px;
}
.wallet-cards--transactions button.selected {
  border-color: #ffffff33;
  background: linear-gradient(114deg, #ffffff0f, #ffffff14);
}
.wallet-cards--transactions .wallet-global-amounts strong {
  font:
    700 20px/28px Inter,
    sans-serif;
}
.wallet-cards--transactions .wallet-global-circulation {
  margin-top: 8px;
  color: #00d68f;
}
.wallet-cards--transactions .wallet-global-circulation small {
  color: #00d68f;
}
.wallet-cards--transactions .wallet-global-track {
  background: #ffffff1a;
}
</style>

<style scoped>
.wallet-cards--transactions button {
  display: flex;
  flex-direction: column;
  align-items: stretch;
}
.wallet-cards--transactions .wallet-global-heading {
  width: 100%;
}
.wallet-cards--transactions .wallet-global-secondary {
  margin-top: 0;
}
.wallet-cards--transactions .wallet-global-circulation {
  margin-top: auto;
}
</style>

<style scoped>
.wallet-cards--transactions .wallet-global-track > span {
  display: block;
  height: 6px;
  background: #00d68f;
  border-radius: 4px;
  margin: 0;
}
</style>
