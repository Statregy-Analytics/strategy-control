<template>
  <article
    class="credit-operation-card"
    role="button"
    tabindex="0"
    :aria-label="'Abrir operação ' + record.publicCode"
    @click="$emit('open')"
    @keydown.enter="$emit('open')"
    @keydown.space.prevent="$emit('open')"
  >
    <header>
      <span class="credit-operation-card__icon"
        ><img src="/icons/workspace-review/credit-file.svg" alt=""
      /></span>
      <div>
        <h2>{{ record.client?.displayName || record.client?.name || '—' }}</h2>
        <small>{{ record.publicCode }}</small>
      </div>
      <span class="credit-operation-card__badge">{{ record.stage || 'Etapa indisponível' }}</span>
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
      <div class="credit-operation-card__collateral">
        <dt>Garantia</dt>
        <dd>{{ record.collateral || '—' }}</dd>
      </div>
    </dl>
    <div class="credit-operation-card__counts">
      <span>Parceiros: —</span><span>Propostas: —</span><span>Pendências: —</span>
    </div>
    <footer>
      <span><img src="/icons/workspace-review/credit-owner.svg" alt="" />—</span
      ><span
        ><img src="/icons/workspace-review/credit-time.svg" alt="" />{{
          dateLabel(record.updatedAtUtc)
        }}</span
      >
    </footer>
  </article>
</template>
<script setup>
import { money, dateLabel } from 'src/services/financeService'
import { workspaceStatus } from 'src/services/adminWorkspaceModel'
defineProps({ record: { type: Object, required: true } })
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
