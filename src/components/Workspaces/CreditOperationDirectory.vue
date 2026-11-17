<template>
  <div v-if="view === 'kanban'">
    <p v-if="!groups" class="credit-stage-unavailable" role="status">
      Etapas das operações indisponíveis nesta consulta.
    </p>
    <div v-else class="credit-kanban" aria-label="Operações por etapa">
      <section v-for="group in groups" :key="group.stage">
        <header>
          <h2>{{ group.stage }}</h2>
          <span>{{ group.rows.length }}</span>
        </header>
        <credit-operation-card
          v-for="row in group.rows"
          :key="row.id"
          :record="row"
          compact
          @open="$emit('open', row)"
        />
      </section>
    </div>
  </div>
  <div v-else-if="view === 'cards'" class="credit-directory-cards">
    <credit-operation-card
      v-for="row in rows"
      :key="row.id"
      :record="row"
      @open="$emit('open', row)"
    />
    <p v-if="!rows.length" class="credit-empty">Nenhum registro encontrado.</p>
  </div>
  <q-table
    v-else
    class="credit-directory-table"
    :rows="rows"
    :columns="tableColumns"
    dark
    flat
    dense
    row-key="id"
    hide-pagination
    :pagination="{ rowsPerPage: 0 }"
    no-data-label="Nenhum registro encontrado."
  >
    <template #body-cell-publicCode="p"
      ><q-td :props="p"
        ><button class="credit-record-link" @click="$emit('open', p.row)">
          {{ p.row.publicCode || '—' }}
        </button></q-td
      ></template
    >
    <template #body-cell-client="p"
      ><q-td :props="p"
        ><span class="credit-client"
          ><span class="credit-client-icon"
            ><img src="/icons/credit-directory/customer.svg" alt="" /></span
          >{{ p.value }}</span
        ></q-td
      ></template
    >
    <template #body-cell-kind="p"
      ><q-td :props="p"
        ><span class="credit-field-badge">{{ p.value }}</span></q-td
      ></template
    >
    <template #body-cell-principalAmount="p"
      ><q-td :props="p"
        ><strong>{{ p.value }}</strong></q-td
      ></template
    >
    <template #body-cell-stage="p"
      ><q-td :props="p"
        ><span class="credit-field-badge">{{ p.value }}</span></q-td
      ></template
    >
    <template #body-cell-partners="p"
      ><q-td :props="p"
        ><span class="credit-field-badge"
          >{{ creditCounts(p.row).partners ?? '—' }}
          {{ creditCounts(p.row).partners === 1 ? 'banco' : 'bancos' }}</span
        ></q-td
      ></template
    >
    <template #body-cell-proposals="p"
      ><q-td :props="p"
        ><span class="credit-field-badge" :class="{ positive: creditCounts(p.row).proposals > 0 }"
          >{{ creditCounts(p.row).proposals ?? '—' }}
          {{ creditCounts(p.row).proposals === 1 ? 'proposta' : 'propostas' }}</span
        ></q-td
      ></template
    >
    <template #body-cell-pending="p"
      ><q-td :props="p"
        ><span v-if="creditCounts(p.row).pending" class="credit-field-badge pending"
          >{{ creditCounts(p.row).pending }}
          {{ creditCounts(p.row).pending === 1 ? 'pendência' : 'pendências' }}</span
        ><span v-else>—</span></q-td
      ></template
    >
    <template #body-cell-actions="p"
      ><q-td :props="p"
        ><q-btn
          flat
          dense
          :aria-label="'Abrir operação ' + (p.row.publicCode || '')"
          @click="$emit('open', p.row)"
          ><img src="/icons/credit-directory/open.svg" alt="" /></q-btn></q-td
    ></template>
  </q-table>
</template>
<script setup>
import { computed } from 'vue'
import CreditOperationCard from './CreditOperationCard.vue'
import {
  creditStageGroups,
  creditCounts,
  creditUpdatedLabel,
} from 'src/services/creditDirectoryModel'
import { columns, money } from 'src/services/financeService'
import { workspaceStatus } from 'src/services/adminWorkspaceModel'
const props = defineProps({
  rows: { type: Array, default: () => [] },
  view: { type: String, default: 'list' },
})
defineEmits(['open'])
const groups = computed(() => creditStageGroups(props.rows))
const tableColumns = columns([
  ['publicCode', 'ID'],
  ['client', 'Cliente', (r) => r.client?.displayName || r.client?.name || '—'],
  ['kind', 'Tipo', (r) => workspaceStatus(r.kind)],
  ['principalAmount', 'Valor Solicitado', (r) => money(r.principalAmount, r.currencyIsoCode)],
  ['collateral', 'Garantia/Produto', (r) => r.collateral || '—'],
  ['stage', 'Etapa', (r) => r.stage || '—'],
  ['partners', 'Parceiros'],
  ['proposals', 'Propostas'],
  ['pending', 'Pendências'],
  ['source', 'Origem', (r) => (typeof r.source === 'string' && r.source ? r.source : '—')],
  [
    'owner',
    'Responsável',
    (r) => (typeof r.ownerName === 'string' && r.ownerName ? r.ownerName : '—'),
  ],
  ['updatedAtUtc', 'Atualização', (r) => creditUpdatedLabel(r.updatedAtUtc)],
  ['actions', ''],
])
</script>
<style scoped>
.credit-directory-table {
  border: 1px solid #ffffff26;
  border-radius: 12px;
  background: linear-gradient(90deg, #0000001e, #0000000a);
  box-shadow: 4px 4px 12px #00000021;
  max-width: 100%;
  overflow: hidden;
}
.credit-directory-table :deep(.q-table__middle) {
  overflow: auto;
}
.credit-directory-table :deep(table) {
  min-width: 1300px;
}
.credit-directory-table :deep(th) {
  padding: 12px 8px;
  text-transform: uppercase;
  font:
    500 12px/16px Inter,
    sans-serif;
  color: #ffffffb8;
  background: #00000033;
}
.credit-directory-table :deep(td) {
  padding: 8px;
  font:
    400 12px/18px Inter,
    sans-serif;
  border-color: #ffffff26;
  color: #ffffffb8;
  white-space: normal;
  overflow-wrap: anywhere;
  max-width: 260px;
}
.credit-record-link {
  padding: 0;
  border: 0;
  background: transparent;
  color: #51a2ff;
  font:
    600 12px/18px Inter,
    sans-serif;
  cursor: pointer;
}
.credit-record-link:focus-visible {
  outline: 2px solid #00a3ff;
  outline-offset: 3px;
}
.credit-client {
  display: flex;
  gap: 8px;
  align-items: center;
  color: white;
}
.credit-client-icon {
  display: grid;
  place-items: center;
  border: 1px solid #ffffffb8;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  flex: none;
}
.credit-field-badge {
  display: inline-flex;
  border: 1px solid white;
  border-radius: 8px;
  background: #00000033;
  color: white;
  padding: 3px 9px;
  font:
    500 12px/16px Inter,
    sans-serif;
  white-space: nowrap;
}
.positive {
  color: #74ffa0;
  border-color: #74ffa0;
  background: #007a5533;
  font-size: 10px;
  text-transform: uppercase;
}
.pending {
  color: #ffd074;
  border-color: #ffd074;
  background: #a3680033;
  font-size: 10px;
  text-transform: uppercase;
}
.credit-directory-cards {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}
.credit-empty,
.credit-stage-unavailable {
  padding: 24px;
  color: #ffffffb8;
  border: 1px solid #ffffff26;
  border-radius: 8px;
}
.credit-empty {
  grid-column: 1/-1;
}
.credit-kanban {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  max-width: 100%;
  padding-bottom: 16px;
}
.credit-kanban > section {
  width: 320px;
  flex: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.credit-kanban header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border: 1px solid #ffffff1f;
  border-radius: 8px;
  background: #00000014;
}
.credit-kanban h2 {
  font:
    700 14px/20px Inter,
    sans-serif;
  margin: 0;
}
.credit-kanban header span {
  border: 1px solid #ffffff80;
  border-radius: 4px;
  padding: 0 8px;
  font:
    500 12px/20px Inter,
    sans-serif;
  color: #ffffffb8;
}
@media (max-width: 1300px) {
  .credit-directory-cards {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 700px) {
  .credit-directory-cards {
    grid-template-columns: 1fr;
  }
}
</style>

<style scoped>
.credit-directory-table :deep(td strong) {
  font-size: 14px;
  font-weight: 700;
}
.credit-kanban,
.credit-directory-table :deep(.q-table__middle) {
  scrollbar-width: thin;
  scrollbar-color: #ffffff80 transparent;
}
.credit-kanban::-webkit-scrollbar,
.credit-directory-table :deep(.q-table__middle::-webkit-scrollbar) {
  height: 6px;
  width: 6px;
}
.credit-kanban::-webkit-scrollbar-thumb,
.credit-directory-table :deep(.q-table__middle::-webkit-scrollbar-thumb) {
  background: #ffffff80;
  border-radius: 12px;
}
.credit-kanban::-webkit-scrollbar-track,
.credit-directory-table :deep(.q-table__middle::-webkit-scrollbar-track) {
  background: transparent;
}
</style>
