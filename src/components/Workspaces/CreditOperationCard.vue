<template>
  <article
    class="credit-operation-card"
    :class="{
      'credit-operation-card--compact': compact,
      'credit-operation-card--property': property,
    }"
    role="button"
    tabindex="0"
    :aria-label="'Abrir operação ' + record.publicCode"
    @click="$emit('open')"
    @keydown.enter="$emit('open')"
    @keydown.space.prevent="$emit('open')"
  >
    <header>
      <span v-if="!compact" class="credit-operation-card__icon"
        ><img src="/icons/credit-directory/file.svg" alt=""
      /></span>
      <div>
        <h2>{{ record.client?.displayName || record.client?.name || '—' }}</h2>
        <small>{{ record.publicCode }}</small>
      </div>
      <span v-if="!compact" class="credit-operation-card__badge">{{
        record.stage || 'Etapa indisponível'
      }}</span>
    </header>
    <dl>
      <div>
        <dt>Tipo</dt>
        <dd>{{ workspaceStatus(record.kind) }}</dd>
      </div>
      <div>
        <dt>Valor</dt>
        <dd>{{ money(record.principalAmount, record.currencyIsoCode) }}</dd>
      </div>
      <div v-if="!compact" class="credit-operation-card__collateral">
        <dt>Garantia</dt>
        <dd>{{ record.collateral || '—' }}</dd>
      </div>
    </dl>
    <div class="credit-operation-card__counts">
      <span
        >{{ counts.partners ?? '—' }} {{ counts.partners === 1 ? 'parceiro' : 'parceiros' }}</span
      ><span :class="{ positive: counts.proposals > 0 }"
        >{{ counts.proposals ?? '—' }} {{ counts.proposals === 1 ? 'proposta' : 'propostas' }}</span
      ><span v-if="counts.pending !== 0" :class="{ pending: counts.pending !== null }"
        >{{ counts.pending ?? '—' }} docs</span
      >
    </div>
    <footer v-if="!compact">
      <span
        ><img src="/icons/credit-directory/owner.svg" alt="" />{{ record.ownerName || '—' }}</span
      ><span
        ><img src="/icons/credit-directory/updated.svg" alt="" />{{
          creditUpdatedLabel(record.updatedAtUtc)
        }}</span
      >
    </footer>
  </article>
</template>
<script setup>
import { computed } from 'vue'
import { creditCounts, creditUpdatedLabel } from 'src/services/creditDirectoryModel'
import { money } from 'src/services/financeService'
import { workspaceStatus } from 'src/services/adminWorkspaceModel'
const props = defineProps({ record: { type: Object, required: true }, compact: Boolean })
const counts = computed(() => creditCounts(props.record))
const property = computed(() =>
  ['Crédito imóvel', 'Crédito com garantia de imóvel / Home Equity / CGI'].includes(
    props.record.kind,
  ),
)
defineEmits(['open'])
</script>
<style scoped>
.credit-operation-card {
  padding: 16px;
  border: 1px solid #ffffff1f;
  border-radius: 12px;
  background: linear-gradient(100deg, #ffffff0f, #ffffff05);
  color: #fff;
  cursor: pointer;
  min-width: 0;
}
.credit-operation-card:hover {
  background-color: #ffffff08;
}
.credit-operation-card:focus-visible {
  outline: 2px solid #2b7fff;
  outline-offset: 3px;
}
header {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}
header > div {
  flex: 1;
  min-width: 0;
}
.credit-operation-card__icon {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border: 1px solid #ffffff33;
  border-radius: 8px;
  background: #ffffff0f;
  flex: none;
}
h2 {
  font-size: 14px;
  line-height: 20px;
  margin: 0;
  overflow-wrap: anywhere;
  font-weight: 600;
}
small {
  font-size: 11px;
  color: #ffffff99;
}
.credit-operation-card__badge,
.credit-operation-card__counts span {
  font-size: 10px;
  line-height: 16px;
  border: 1px solid #ffffff66;
  border-radius: 5px;
  padding: 0 6px;
}
.credit-operation-card__badge {
  max-width: 40%;
  overflow-wrap: anywhere;
}
dl {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin: 20px 0 12px;
}
dt {
  font-size: 10px;
  text-transform: uppercase;
  color: #ffffff99;
}
dd {
  font-size: 12px;
  line-height: 18px;
  margin: 0;
  overflow-wrap: anywhere;
}
.credit-operation-card__collateral {
  grid-column: 1/-1;
}
.credit-operation-card__counts {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
footer {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #ffffff1a;
  color: #ffffff99;
  font-size: 11px;
}
footer span {
  display: flex;
  align-items: center;
  gap: 6px;
}
</style>

<style scoped>
.credit-operation-card__counts .positive {
  color: #74ffa0;
  border-color: #74ffa0;
  background: #007a5533;
}
.credit-operation-card__counts .pending {
  color: #ffd074;
  border-color: #ffd074;
  background: #a3680033;
}
.credit-operation-card__badge {
  border-color: white;
  background: #00000033;
  border-radius: 8px;
  font-size: 12px;
}
.credit-operation-card--compact {
  padding: 16px;
  border-radius: 10px;
}
.credit-operation-card--compact header {
  display: block;
}
.credit-operation-card--compact h2 {
  font-size: 14px;
  font-weight: 700;
}
.credit-operation-card--compact dl {
  display: flex;
  flex-direction: column;
  margin: 10px 0;
  gap: 8px;
}
.credit-operation-card--compact dt {
  display: none;
}
.credit-operation-card--compact dl > div:nth-child(2) dd {
  font-weight: 700;
}
.credit-operation-card--compact .credit-operation-card__counts {
  gap: 4px;
}
.credit-operation-card--compact .credit-operation-card__counts span {
  font-size: 10px;
  padding: 0 5px;
}
</style>

<style scoped>
.credit-operation-card:not(.credit-operation-card--compact) {
  min-height: 258px;
  display: flex;
  flex-direction: column;
}
.credit-operation-card:not(.credit-operation-card--compact) footer {
  margin-top: auto;
  padding-top: 16px;
}
.credit-operation-card--property:not(.credit-operation-card--compact)
  .credit-operation-card__collateral {
  order: -1;
}
.credit-operation-card header small {
  font:
    400 12px/16px Consolas,
    monospace;
  color: #ffffffb8;
}
.credit-operation-card__counts span {
  padding: 3px 8px;
  border-radius: 8px;
  letter-spacing: 0.25px;
}
.credit-operation-card__counts span:first-child {
  font-size: 12px;
  letter-spacing: 0;
  border-color: white;
}
.credit-operation-card__counts .positive,
.credit-operation-card__counts .pending {
  text-transform: uppercase;
}
.credit-operation-card footer {
  font-size: 12px;
  line-height: 16px;
  color: #ffffffb8;
}
</style>
