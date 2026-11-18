<template>
  <article
    class="wallet-card"
    :class="['wallet-card--' + mode, { 'wallet-card--expanded': expanded }]"
  >
    <header class="wallet-card__heading">
      <span class="wallet-card__icon"><img :src="icon" alt="" /></span>
      <div>
        <h3>{{ title }}</h3>
        <small :title="row.code || ''">{{ row.code || '—' }}</small>
      </div>
      <span class="wallet-card__badge" :class="badgeClass">{{ badge }}</span>
    </header>
    <div class="wallet-card__identity">
      <p><img src="/icons/wallet-cards/user.svg" alt="" />{{ row.clientName || '—' }}</p>
      <small
        >{{ mode === 'total' ? 'ID:' : 'ID Cliente:' }} {{ row.clientCode || '—'
        }}<template v-if="row.maskedDocument"> · {{ row.maskedDocument }}</template></small
      ><small v-if="mode !== 'total'" class="wallet-card__code" :title="row.code || ''"
        >ID Carteira: {{ row.code || '—' }}</small
      >
    </div>
    <p v-if="mode === 'strategy'" class="wallet-card__links">
      <img src="/icons/wallet-cards/contracts.svg" alt="" />{{ counts('contract') }} ·
      {{ currencyCount }}
    </p>
    <div class="wallet-card__composition">
      <table :class="{ 'wallet-card__table--wide': mode === 'strategy' || mode === 'assets' }">
        <thead>
          <tr>
            <th>Moeda</th>
            <template v-if="mode === 'strategy'"
              ><th>Em contratos</th>
              <th>{{ row.model?.yieldAvailable === false ? 'Parado' : 'Parado, rendendo' }}</th>
              <th>Total</th></template
            ><template v-else-if="mode === 'assets'"
              ><th>Bens</th>
              <th>Declarado</th>
              <th>Atual</th>
              <th>Valorização</th></template
            >
            <th v-else>Saldo</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in currencies" :key="c.currency">
            <td>
              {{
                mode === 'deposit' || (mode === 'total' && row.type === 'deposit')
                  ? c.currency + ' · ' + c.name
                  : c.currency
              }}
            </td>
            <template v-if="mode === 'strategy'"
              ><td :class="tone(c.contracted)">
                {{ walletMoney(c.contracted, c.currency)
                }}<small v-if="c.contractCount > 0">{{
                  walletCardCount(c.contractCount, 'contrato', 'contratos')
                }}</small>
              </td>
              <td :class="tone(c.idle)">{{ walletMoney(c.idle, c.currency) }}</td>
              <td :class="tone(c.balance)">{{ walletMoney(c.balance, c.currency) }}</td></template
            ><template v-else-if="mode === 'assets'"
              ><td>{{ walletCardCount(c.count, 'bem', 'bens') }}</td>
              <td :class="tone(c.declared)">{{ walletMoney(c.declared, c.currency) }}</td>
              <td :class="tone(current(c))">{{ walletMoney(current(c), c.currency) }}</td>
              <td :class="percentTone(c.appreciation)">
                {{ walletCardPercent(c.appreciation) }}
              </td></template
            >
            <td v-else :class="tone(c.balance)">{{ walletMoney(c.balance, c.currency) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="wallet-card__consolidated">
      <span>Consolidado</span
      ><span
        >{{ consolidated.approximate ? '≈ ' : ''
        }}{{ walletMoney(consolidated.value, consolidated.currency) }}</span
      >
    </div>
    <template v-if="mode === 'strategy'"
      ><div class="wallet-card__metric">
        <span>Capital base</span><strong>{{ walletMoney(row.base, row.principalCurrency) }}</strong>
      </div>
      <div class="wallet-card__metric">
        <span>Rendimento</span
        ><strong :class="percentTone(row.yieldPercentage)"
          >{{ walletCardPercent(row.yieldPercentage)
          }}<small>{{ walletMoney(row.yieldAmount, row.principalCurrency) }}</small></strong
        >
      </div></template
    >
    <div v-else-if="mode === 'assets'" class="wallet-card__variation">
      <div>
        <span>Valorização</span
        ><strong :class="percentTone(row.appreciation)">{{
          walletCardPercent(row.appreciation)
        }}</strong>
      </div>
      <div>
        <span>Variação</span
        ><strong :class="percentTone(row.variation)">{{
          walletMoney(row.variation, row.principalCurrency)
        }}</strong>
      </div>
      <p>Bens: {{ row.assetDescription || '—' }}</p>
    </div>
    <p v-else-if="mode === 'total'" class="wallet-card__summary">
      <template v-if="row.type === 'strategy'"
        ><img src="/icons/wallet-cards/contracts.svg" alt="" />{{ counts('contract') }} ·
        {{ currencyCount }}</template
      ><template v-else-if="row.type === 'assets'"
        >{{ counts('asset') }} · Valorização<strong :class="percentTone(row.appreciation)">{{
          walletCardPercent(row.appreciation)
        }}</strong></template
      ><template v-else>Disponível para saque · {{ currencyCount }}</template>
    </p>
    <div v-if="mode === 'total'" class="wallet-card__state">
      <span class="wallet-card__badge" :class="statusClass">{{ status }}</span
      ><small>{{ date(row.lastMovement) }}</small>
    </div>
    <div v-else class="wallet-card__updated">
      <template v-if="mode === 'deposit'"
        ><span>Última movimentação</span>
        <div>
          <span>{{ row.lastMovementType ? financeLabel(row.lastMovementType) : '—' }}</span
          ><span>{{ date(row.lastMovement) }}</span>
        </div></template
      ><span v-else
        >{{ mode === 'assets' ? 'Última movimentação' : 'Última atualização' }}:
        {{ date(row.lastMovement || row.updatedAt) }}</span
      ><small v-if="mode !== 'strategy'">{{
        walletCardCount(row.movementCount, 'movimentação', 'movimentações')
      }}</small>
    </div>
    <div v-if="mode === 'strategy' && !expanded" class="wallet-card__chips">
      <template v-if="row.contracts?.length"
        ><router-link
          v-for="contract in row.contracts"
          :key="contract.id"
          :to="{ name: 'contracts', query: { contractId: contract.id } }"
          >{{ contract.publicCode || '—'
          }}<img
            v-if="contract.shared === true"
            src="/icons/wallet-cards/share.svg"
            alt="Compartilhado" /></router-link></template
      ><span v-else>—</span>
    </div>
    <footer>
      <q-btn
        outline
        dense
        no-caps
        label="Ver Movimentações"
        :aria-label="'Ver movimentações de ' + row.clientName"
        :disable="!row.ledgerWalletIds?.length"
        @click="emit('movements')"
        ><img src="/icons/wallet-cards/eye.svg" alt="" /></q-btn
      ><q-btn
        v-if="row.type !== 'deposit'"
        outline
        dense
        no-caps
        :label="expanded ? 'Fechar' : 'Abrir Carteira'"
        :aria-label="(expanded ? 'Fechar carteira de ' : 'Abrir carteira de ') + row.clientName"
        :aria-expanded="mode === 'strategy' ? expanded : undefined"
        @click="emit('open')"
        ><img v-if="expanded" src="/icons/wallet-cards/collapse.svg" alt=""
      /></q-btn>
    </footer>
    <div v-if="expanded" class="wallet-card__expanded"><slot /></div>
  </article>
</template>
<script setup>
import { computed } from 'vue'
import { walletMoney, finiteMoney } from 'src/services/walletModel'
import {
  walletCardCurrencies,
  walletCardConsolidated,
  walletCardPercent,
  walletCardCount,
} from 'src/services/walletCardModel'
import { financeLabel } from 'src/services/financeService'
const props = defineProps({
  row: { type: Object, required: true },
  mode: { type: String, default: 'total' },
  fx: { type: Object, default: null },
  expanded: Boolean,
})
const emit = defineEmits(['movements', 'open'])
const title = computed(
  () =>
    ({
      deposit: 'Carteira de Depósito',
      strategy: 'Carteira Strategy',
      assets: 'Carteira de Patrimônio',
    })[props.row.type] || 'Carteira',
)
const icon = computed(
  () => '/icons/wallet-cards/' + props.row.type + (props.mode === 'total' ? '-total' : '') + '.svg',
)
const status = computed(
  () => ({ Active: 'Ativa', Inactive: 'Inativa', Pending: 'Pendente' })[props.row.status] || '—',
)
const statusClass = computed(() => ({
  'wallet-card__badge--active': props.row.status === 'Active',
  'wallet-card__badge--pending': props.row.status === 'Pending',
}))
const badge = computed(() =>
  props.mode === 'total'
    ? { deposit: 'Depósito', assets: 'Patrimônio', strategy: 'Strategy' }[props.row.type]
    : status.value,
)
const badgeClass = computed(() =>
  props.mode === 'total'
    ? { 'wallet-card__badge--active': props.row.type === 'deposit' }
    : statusClass.value,
)
const currencies = computed(() => walletCardCurrencies(props.row))
const consolidated = computed(() =>
  walletCardConsolidated(props.row, props.fx, props.mode === 'assets' ? 'current' : 'balance'),
)
const currencyCount = computed(() =>
  walletCardCount(
    props.row.currencyCount ?? (props.row.currencies?.length || null),
    'moeda',
    'moedas',
  ),
)
const counts = (kind) =>
  walletCardCount(
    props.row[kind + 'Count'],
    kind === 'asset' ? 'bem' : 'contrato',
    kind === 'asset' ? 'bens' : 'contratos',
  )
const tone = (value) => ({
  'wallet-card__amount': finiteMoney(value) !== null && Number(value) !== 0,
})
const percentTone = (value) => ({
  'wallet-card__positive': finiteMoney(value) !== null && Number(value) > 0,
  'wallet-card__negative': finiteMoney(value) !== null && Number(value) < 0,
})
const current = (c) => (props.row.currencies?.length === 1 ? props.row.currentTotal : c.current)
const date = (value) =>
  value && Number.isFinite(Date.parse(value))
    ? new Date(value).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—'
</script>
<style scoped src="./walletDirectoryCard.scss"></style>
