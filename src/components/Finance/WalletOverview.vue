<template>
  <section class="wallet-overview" aria-label="Visão consolidada das carteiras">
    <div :class="['wallet-cards', { 'wallet-cards--global': !details }]">
      <button
        v-for="item in orderedTypes"
        :key="item.key"
        type="button"
        :class="{ selected: selected === item.key }"
        :aria-pressed="selected === item.key"
        @click="selectWallet(item.key)"
      >
        <img
          v-if="!details"
          src="/icons/wallets/wallet.svg"
          class="wallet-watermark"
          alt=""
        /><span>{{
          !details && item.key === 'assets' ? 'Carteira de Patrimônio' : item.label
        }}</span
        ><strong>{{
          walletMoney(
            item.key === 'total' ? consolidatedWalletTotal(model) : model?.[item.key]?.total,
            model?.principalCurrency,
          )
        }}</strong>
        <q-tooltip>{{ item.description }}</q-tooltip>
      </button>
    </div>
    <p class="wallet-help">
      Total = Depósito + Strategy + Patrimônio. Conversão diária somente para exibição na moeda
      principal.
    </p>
    <template v-if="details">
      <template v-if="selected === 'total'">
        <h3>Composição da Carteira Total</h3>
        <p>Uma Carteira de Depósito, uma Carteira Strategy e um Patrimônio por cliente.</p>
        <p v-if="!model?.total" class="wallet-help">
          O total consolidado com patrimônio e cotação diária ainda não está disponível.
        </p>
        <dl v-for="item in WALLET_TYPES.slice(0, 3)" :key="item.key" class="total-composition">
          <dt>{{ item.label }}</dt>
          <dd>
            {{
              walletMoney(
                item.key === 'total' ? consolidatedWalletTotal(model) : model?.[item.key]?.total,
                model?.principalCurrency,
              )
            }}
          </dd>
        </dl>
      </template>
      <template v-else-if="selected === 'assets'">
        <h3>Patrimônio · bens vinculados</h3>
        <div class="asset-metrics">
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
                  <th>Parado, rendendo</th>
                  <th>Rendimento / origem</th></template
                >
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in walletRows(model, selected)" :key="row.currency">
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
        <template v-if="selected === 'strategy'"
          ><h3>Contratos atrelados à carteira</h3>
          <slot name="contracts"
            ><p class="wallet-help">Selecione um cliente para consultar os contratos.</p></slot
          ></template
        >
      </template>
    </template>
  </section>
</template>
<script setup>
import { computed, ref } from 'vue'
import {
  consolidatedWalletTotal,
  WALLET_TYPES,
  YIELD_DESCRIPTION,
  walletRows,
  walletMoney,
} from 'src/services/walletModel'
const props = defineProps({
  initialType: { type: String, default: 'strategy' },
  model: { type: Object, default: null },
  details: { type: Boolean, default: true },
})
const orderedTypes = computed(() =>
  props.details ? WALLET_TYPES : [WALLET_TYPES[3], ...WALLET_TYPES.slice(0, 3)],
)
const emit = defineEmits(['select'])
const selected = ref(props.initialType)
function selectWallet(type) {
  selected.value = type
  emit('select', type)
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
</style>
