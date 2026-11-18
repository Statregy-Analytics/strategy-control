<template>
  <div class="pending-transaction-list">
    <article
      v-for="row in rows"
      :key="row.id"
      class="pending-transaction"
      :class="{ attention: row.attentionRequired === true }"
    >
      <div class="pending-transaction__main">
        <div>
          <small>Tipo</small
          ><span
            ><img :src="typeIcon(row)" alt="" />{{
              contractTransactionLabel(row) || financeLabel(row.type)
            }}</span
          >
        </div>
        <div>
          <small>Cliente</small><span>{{ row.clientName || 'Indisponível' }}</span
          ><code>ID: {{ row.clientPublicCode || row.clientId || '—' }}</code>
        </div>
        <div class="pending-transaction__flow">
          <small>Fluxo</small
          ><span
            >{{ endpoint(row.source) }} <img :src="assets.imgIcon1" alt="" />
            {{ endpoint(row.destination) }}</span
          >
        </div>
        <div>
          <small>Valor</small><strong>{{ money(row.amount, row.currencyIsoCode) }}</strong>
        </div>
        <div>
          <small>Status</small
          ><span
            :class="[
              'pending-transaction__status',
              { rejected: row.status === 'Rejected', receipt: row.status === 'AwaitingReceipt' },
            ]"
            ><img v-if="row.status === 'AwaitingReceipt'" :src="assets.imgIcon2" alt="" /><img
              v-else-if="row.status === 'Rejected'"
              :src="rejectedAssets.imgIcon2"
              alt=""
            /><img
              v-else-if="row.status === 'Approved'"
              :src="transactionDirectoryAssets['1484:85659'].imgIcon2"
              alt=""
            /><img
              v-else-if="row.status === 'PendingValidation'"
              :src="transactionDirectoryAssets['1484:85809'].imgIcon2"
              alt=""
            />{{ transactionStatusLabel(row.status, financeLabel(row.status)) }}</span
          ><span class="pending-transaction__due"
            ><img :src="assets.imgIcon3" alt="" />{{ when(row.dueAtUtc, true) }}</span
          >
        </div>
        <div class="pending-transaction__actions">
          <img
            v-if="row.attentionRequired === true"
            :src="row.status === 'Rejected' ? rejectedAssets.imgIcon3 : assets.imgIcon4"
            alt="Atenção necessária"
          /><button
            type="button"
            :aria-label="'Abrir solicitação ' + (row.requestNumber || '')"
            :disabled="!row.id"
            @click="$emit('open', row.id)"
          >
            <img :src="assets.imgIcon5" alt="" />
          </button>
        </div>
      </div>
      <footer>
        <span><img :src="assets.imgIcon6" alt="" />{{ actor(row.createdBy) }}</span
        ><span><img :src="assets.imgIcon7" alt="" />{{ when(row.requestedAtUtc) }}</span
        ><code>{{ row.requestNumber || '—' }}</code>
      </footer>
    </article>
    <p v-if="!rows.length" class="pending-transaction-empty">Nenhuma solicitação pendente.</p>
  </div>
</template>
<script setup>
import { transactionDirectoryAssets } from 'src/services/transactionDirectoryAssets'
import {
  transactionStatusLabel,
  transactionWhen as when,
  transactionMoney as money,
  transactionActor as actor,
  transactionEndpoint as endpoint,
} from 'src/services/transactionDirectoryModel'
import { financeLabel } from 'src/services/financeService'
import { contractTransactionLabel } from 'src/services/contractTransactionView'
defineProps({ rows: { type: Array, default: () => [] } })
defineEmits(['open'])
const assets = transactionDirectoryAssets['1484:85582']
const rejectedAssets = transactionDirectoryAssets['1484:85876']
const typeIcon = (row) =>
  row.type === 'Withdrawal'
    ? transactionDirectoryAssets['1484:85659'].imgIcon
    : row.type === 'WalletTransfer'
      ? transactionDirectoryAssets['1484:85809'].imgIcon
      : assets.imgIcon
</script>
<style scoped>
.pending-transaction-list {
  display: grid;
  gap: 12px;
}
.pending-transaction {
  padding: 16px;
  border: 0.8px solid #ffffff33;
  border-radius: 10px;
  background: linear-gradient(90deg, #ffffff14, #ffffff08, #ffffff12);
  color: #ffffffb8;
}
.pending-transaction.attention {
  border-color: #fee685;
}
.pending-transaction__main {
  display: grid;
  grid-template-columns:
    minmax(130px, 1fr) minmax(130px, 1fr) minmax(220px, 2fr) minmax(110px, 1fr)
    minmax(180px, 1.2fr) 60px;
  gap: 16px;
  align-items: start;
}
.pending-transaction__main small {
  display: block;
  font:
    500 10px/15px Inter,
    sans-serif;
  text-transform: uppercase;
  color: white;
  margin-bottom: 4px;
}
.pending-transaction__main span {
  font:
    400 12px/16px Inter,
    sans-serif;
  overflow-wrap: anywhere;
}
.pending-transaction__main div > span:first-of-type {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}
.pending-transaction__main strong {
  display: block;
  color: white;
  font:
    700 14px/20px Inter,
    sans-serif;
}
.pending-transaction__main code {
  display: block;
  margin-top: 4px;
  font:
    400 10px/15px Consolas,
    monospace;
}
.pending-transaction__main .pending-transaction__status {
  display: inline-flex !important;
  border: 0.8px solid #fee685;
  border-radius: 6px;
  padding: 3px 6px;
  font:
    500 10px/15px Inter,
    sans-serif;
  text-transform: uppercase;
  color: #fee685;
  background: #bb4d0033;
}
.pending-transaction__due {
  display: flex;
  gap: 4px;
  align-items: center;
  margin-top: 8px;
  font-size: 10px !important;
}
.pending-transaction__actions {
  display: flex;
  gap: 8px;
  align-items: center;
}
button {
  display: grid;
  place-items: center;
  flex: none;
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
}
button:focus-visible {
  outline: 2px solid #00a3ff;
  outline-offset: 2px;
}
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
footer {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 0.8px solid #ffffff33;
  font:
    400 10px/15px Inter,
    sans-serif;
}
footer span {
  display: flex;
  align-items: center;
  gap: 6px;
}
footer code {
  font:
    400 10px/15px Consolas,
    monospace;
}
.pending-transaction-empty {
  padding: 24px;
  text-align: center;
  color: #ffffff99;
}
@media (max-width: 1300px) {
  .pending-transaction__main {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  .pending-transaction__actions {
    justify-content: flex-end;
  }
}
@media (max-width: 650px) {
  .pending-transaction__main {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }
  .pending-transaction__flow {
    grid-column: 1/-1;
  }
  .pending-transaction {
    padding: 12px;
  }
}
</style>

<style scoped>
.pending-transaction__main .pending-transaction__status {
  color: #ffffffb8;
  border-color: #ffffffb8;
  background: #ffffff0d;
}
.pending-transaction__main .pending-transaction__status.receipt {
  color: #fee685;
  border-color: #fee685;
  background: #bb4d0033;
}
.pending-transaction__main .pending-transaction__status.rejected {
  color: #ffa1ad;
  border-color: #ffa1ad;
  background: #fb2c3633;
}
</style>

<style scoped>
img {
  flex: none;
}
</style>

<style scoped>
.pending-transaction__main code {
  overflow-wrap: anywhere;
}
</style>
