<template>
  <div class="transaction-ledger-scroll" tabindex="0" aria-label="Extrato global de transações">
    <table class="transaction-ledger">
      <thead>
        <tr>
          <th v-for="label in labels" :key="label">{{ label }}</th>
          <th><span class="sr-only">Ações</span></th>
        </tr>
      </thead>
      <tbody>
        <template v-for="row in rows" :key="row.type + row.id">
          <tr
            :class="{
              'transaction-ledger__error': row.status === 'Error',
              'transaction-ledger__with-note': !!funding[row.id],
            }"
          >
            <td>
              <span class="transaction-ledger__original">{{
                when(row.requestedAtUtc || row.createdAtUtc)
              }}</span
              ><small v-if="correction(row).originalDate"
                >original: {{ correction(row).originalDate }}</small
              >
            </td>
            <td>
              <span class="transaction-ledger__original transaction-ledger__id">{{
                row.requestNumber || '—'
              }}</span>
            </td>
            <td>
              <div class="transaction-ledger__type">
                <img :src="typeIcon(row)" alt="" />
                <div>
                  <span class="transaction-ledger__original">{{
                    ['WalletTransfer', 'InterCustomerTransfer'].includes(row.type)
                      ? 'Transferência'
                      : contractTransactionLabel(row) || financeLabel(row.type)
                  }}</span
                  ><small v-if="transactionTypeDetail(row)">{{ transactionTypeDetail(row) }}</small
                  ><small v-if="correction(row).original"
                    >corrige {{ correction(row).original }}</small
                  >
                </div>
              </div>
            </td>
            <td>
              <span class="transaction-ledger__original">{{
                row.clientName || row.client?.displayName || 'Indisponível'
              }}</span>
            </td>
            <td>
              <span class="transaction-ledger__original">{{
                endpointParts(row, 'source').title
              }}</span
              ><small>{{ endpointParts(row, 'source').detail }}</small>
            </td>
            <td>
              <span class="transaction-ledger__original">{{
                row.destinationClient?.name || endpointParts(row, 'destination').title
              }}</span
              ><small
                >{{ endpointParts(row, 'destination').detail
                }}<template v-if="row.transferKind === 'WalletUpTo30Days' && row.dueAtUtc">
                  · até {{ when(row.dueAtUtc, true) }}</template
                ></small
              >
            </td>
            <td>
              <strong
                class="transaction-ledger__original"
                :class="amountTone(row, !!corrections[row.id])"
                >{{ money(row.amount, row.currencyIsoCode || row.currency?.isoCode) }}</strong
              ><small v-if="correction(row).correctedBy"
                >corrigida por {{ correction(row).correctedBy
                }}<template v-if="corrections[row.id]?.depositRequestNumber">
                  · depósito {{ corrections[row.id].depositRequestNumber }}</template
                ></small
              ><small
                v-if="!correction(row).correctedBy && corrections[row.id]?.depositRequestNumber"
                >{{
                  corrections[row.id].zeroed
                    ? 'zerada pela correção do depósito'
                    : 'pela correção do depósito'
                }}
                {{ corrections[row.id].depositRequestNumber }}</small
              ><small v-if="row.conversion"
                >{{ money(row.conversion.sourceAmount, row.conversion.sourceCurrencyIsoCode) }} ×
                {{ row.conversion.exchangeRate ?? '—' }}</small
              >
            </td>
            <td>
              <span
                class="transaction-ledger__badge"
                :class="[tone(row), { initiated: row.status === 'Initiated' }]"
                ><img v-if="statusIcon(row)" :src="statusIcon(row)" alt="" />{{
                  transactionStatusLabel(row.status, financeLabel(row.status))
                }}</span
              >
            </td>
            <td>
              <span class="transaction-ledger__original">{{ actor(row.createdBy) }}</span>
            </td>
            <td>
              <button
                type="button"
                :aria-label="'Abrir transação ' + (row.requestNumber || '')"
                :disabled="!row.id || isAssetLog(row)"
                @click="$emit('open', row.id)"
              >
                <img :src="assets.imgIcon2" alt="" />
              </button>
            </td>
          </tr>
          <tr v-if="funding[row.id]" class="transaction-ledger__funding">
            <td colspan="10">{{ funding[row.id] }}</td>
          </tr>
        </template>
        <tr v-if="!rows.length">
          <td colspan="10" class="transaction-ledger__empty">Nenhuma transação encontrada.</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script setup>
import { computed } from 'vue'
import { financeLabel } from 'src/services/financeService'
import { contractTransactionLabel } from 'src/services/contractTransactionView'
import { transactionDirectoryAssets } from 'src/services/transactionDirectoryAssets'
import {
  transactionStatusLabel,
  transactionTypeDetail,
  isAssetLog,
  transactionWhen as when,
  transactionEndpointParts as endpointParts,
  transactionMoney as money,
  transactionActor as actor,
  transactionTone as tone,
  transactionCorrection,
  transactionAmountTone as amountTone,
  correctionFundingText,
} from 'src/services/transactionDirectoryModel'
const props = defineProps({
  rows: { type: Array, default: () => [] },
  allRows: { type: Array, default: () => [] },
  corrections: { type: Object, default: () => ({}) },
})
defineEmits(['open'])
const labels = [
  'Data/Hora',
  'ID',
  'Tipo',
  'Cliente',
  'Origem',
  'Destino',
  'Valor',
  'Status',
  'Responsável',
]
const assets = transactionDirectoryAssets['1484:85993']
const isCorrection = (row) =>
  !!(row.correctsTransactionId || row.correctedByTransactionId || props.corrections[row.id])
const statusIcon = (row) =>
  isCorrection(row)
    ? null
    : {
        Completed: assets.imgIcon1,
        Pending: assets.imgIcon7,
        Cancelled: assets.imgIcon8,
        Canceled: assets.imgIcon8,
        Initiated: assets.imgIcon9,
      }[row.status]
const correction = (row) =>
  transactionCorrection(row, props.allRows.length ? props.allRows : props.rows)
const funding = computed(() =>
  Object.fromEntries(props.rows.map((r) => [r.id, correctionFundingText(props.corrections[r.id])])),
)
const typeIcon = (row) =>
  row.correctsTransactionId || row.correctedByTransactionId
    ? assets.imgIcon
    : {
        Withdrawal: assets.imgIcon4,
        Yield: assets.imgIcon3,
        AssetIncluded: assets.imgIcon6,
        WalletTransfer: assets.imgIcon3,
        InterCustomerTransfer: assets.imgIcon3,
        AssignedContribution: assets.imgIcon5,
        ContractDividend: assets.imgIcon4,
        AssetRemoved: assets.imgIcon6,
        ContractContribution: assets.imgIcon5,
        ContractRedemption: assets.imgIcon4,
      }[row.type] || assets.imgIcon
</script>
<style scoped>
.transaction-ledger-scroll {
  position: relative;
  overflow: auto;
  max-width: 100%;
  border: 0.8px solid #ffffff33;
  border-radius: 14px;
  background: #ffffff0f;
  box-shadow: 4px 4px 12px #00000021;
  scrollbar-color: #ffffff60 #18212e;
}
.transaction-ledger {
  border-collapse: collapse;
  min-width: 1400px;
  width: 100%;
  text-align: left;
  color: #ffffffb8;
  font:
    400 12px/16px Inter,
    sans-serif;
}
th {
  font-weight: 700;
  text-transform: uppercase;
  color: white;
  background: #ffffff0f;
  height: 40px;
  padding: 8px;
}
td {
  border-top: 0.8px solid #ffffff1f;
  padding: 16px 8px;
  vertical-align: middle;
  max-width: 210px;
  overflow-wrap: anywhere;
}
td:first-child {
  min-width: 112px;
}
td:nth-child(2) {
  min-width: 134px;
}
td:nth-child(3) {
  min-width: 195px;
}
td:nth-child(4) {
  min-width: 195px;
}
td:nth-child(5),
td:nth-child(6) {
  min-width: 165px;
}
td:nth-child(7) {
  min-width: 134px;
}
td:nth-child(8) {
  min-width: 108px;
}
td:last-child {
  width: 40px;
}
strong {
  font:
    700 14px/20px Inter,
    sans-serif;
  color: white;
}
.transaction-ledger__id {
  font-family: 'DM Mono', Consolas, monospace;
  color: #ffffffc2;
}
small {
  display: block;
  font:
    400 11px/16px Inter,
    sans-serif;
  color: #ffffffb8;
  text-decoration: none;
}
.transaction-ledger__type {
  display: flex;
  gap: 8px;
  align-items: center;
}
.transaction-ledger__badge {
  display: inline-flex;
  padding: 3px 8px;
  border: 0.8px solid #fee685;
  border-radius: 8px;
  font:
    500 10px/14.286px Inter,
    sans-serif;
  letter-spacing: 0.25px;
  text-transform: uppercase;
  color: #fee685;
  background: #bb4d0033;
}
.transaction-ledger__badge.completed {
  color: #74ffa0;
  border-color: #74ffa0;
  background: #007a5533;
}
.transaction-ledger__badge.negative {
  color: #ffc9c9;
  border-color: #ffc9c9;
  background: #c1000733;
}
.transaction-ledger__error .transaction-ledger__original {
  text-decoration: line-through;
  opacity: 0.55;
}
.transaction-ledger__funding td {
  padding: 0 8px 8px;
  border: 0;
  font:
    400 11px/16px Inter,
    sans-serif;
}
.transaction-ledger__with-note td {
  padding-bottom: 4px;
}
button {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border: 0;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
}
button:focus-visible,
.transaction-ledger-scroll:focus-visible {
  outline: 2px solid #00a3ff;
  outline-offset: 2px;
}
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.transaction-ledger__empty {
  text-align: center;
  padding: 32px;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
}
</style>

<style scoped>
strong.positive {
  color: #66e59e;
}
strong.negative {
  color: #ff8a8a;
}
.transaction-ledger__badge {
  align-items: center;
  gap: 4px;
}
</style>

<style scoped>
.transaction-ledger__badge.initiated {
  color: #bedbff;
  border-color: #bedbff;
  background: #2b7fff;
}
</style>

<style scoped>
img {
  flex: none;
}
</style>

<style scoped>
.transaction-ledger :deep(.initiated) {
  color: #60a5fa;
}
</style>
