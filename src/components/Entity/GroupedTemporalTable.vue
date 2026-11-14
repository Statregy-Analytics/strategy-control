<template>
  <div class="grouped-temporal-table" role="region" :aria-label="label" tabindex="0">
    <table>
      <thead>
        <tr>
          <th scope="col">Indicador / Parâmetro</th>
          <th v-for="period in displayPeriods" :key="period.id" scope="col">
            <span>{{ period.label }}</span>
            <q-btn
              v-if="period.id !== null"
              outline
              no-caps
              label="Ver atualizações detalhadas"
              :aria-label="'Ver atualizações detalhadas de ' + period.label"
              :disable="!detailsAvailable"
              @click="$emit('details', period.id)"
            />
          </th>
        </tr>
      </thead>
      <tbody v-for="group in groups" :key="group.id">
        <tr class="grouped-temporal-table__group">
          <th :colspan="displayPeriods.length + 1" scope="rowgroup">{{ group.label }}</th>
        </tr>
        <tr v-for="row in group.rows" :key="row.id">
          <th scope="row" :class="{ 'grouped-temporal-table__accent': row.labelTone === 'accent' }">
            {{ row.label }}
          </th>
          <td v-for="period in displayPeriods" :key="period.id">
            <span
              :class="[
                cellClass(period.cells?.[row.id]),
                {
                  'temporal-cell--emphasis':
                    row.emphasis && cellText(period.cells?.[row.id]) !== 'Indisponível',
                },
              ]"
              >{{ cellText(period.cells?.[row.id]) }}</span
            >
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script setup>
import { computed } from 'vue'
import {
  temporalCellText as cellText,
  temporalCellClass as cellClass,
} from 'src/services/logicHistoryModel'
const props = defineProps({
  groups: { type: Array, required: true },
  periods: { type: Array, default: () => [] },
  detailsAvailable: Boolean,
  label: { type: String, default: 'Histórico completo do motor' },
})
defineEmits(['details'])
const displayPeriods = computed(() =>
  props.periods.length ? props.periods : [{ id: null, label: '—', cells: {} }],
)
</script>
<style scoped>
.grouped-temporal-table {
  overflow: auto;
  min-width: 0;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 0 16px 8px;
  color: var(--sa-text, #fff);
  scrollbar-color: rgba(255, 255, 255, 0.35) rgba(255, 255, 255, 0.05);
}
.grouped-temporal-table:focus-visible {
  outline: 2px solid #00a3ff;
  outline-offset: 3px;
}
table {
  border-collapse: separate;
  border-spacing: 0;
  table-layout: fixed;
  width: max-content;
  min-width: 100%;
  font-size: 12px;
  line-height: 16px;
  font-variant-numeric: tabular-nums;
}
th,
td {
  border-right: 1px solid rgba(255, 255, 255, 0.25);
  border-bottom: 1px solid rgba(255, 255, 255, 0.25);
  padding: 8px;
  width: 160px;
  min-width: 160px;
  font-weight: 500;
  color: var(--sa-muted, rgba(255, 255, 255, 0.65));
  text-align: left;
  overflow-wrap: anywhere;
}
tr > :first-child {
  border-left: 1px solid rgba(255, 255, 255, 0.25);
}
thead th {
  position: sticky;
  top: 0;
  z-index: 2;
  border-top: 1px solid rgba(255, 255, 255, 0.25);
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  text-align: center;
  height: 49px;
  padding: 4px;
  font-weight: 700;
}
tr > th:first-child {
  width: 300px;
  min-width: 300px;
  text-transform: uppercase;
  font-weight: 600;
}
thead > tr > th:first-child {
  text-align: left;
  padding: 8px;
}
tbody tr:not(.grouped-temporal-table__group) > th {
  position: sticky;
  left: 0;
  z-index: 1;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
}
thead > tr > th:first-child {
  left: 0;
  z-index: 3;
}
.grouped-temporal-table__group th {
  background: rgba(0, 0, 0, 0.08);
  padding: 8px 16px;
  font-weight: 700;
  letter-spacing: 0.6px;
}
thead th > span {
  display: block;
}
.grouped-temporal-table thead :deep(.q-btn) {
  font-size: 10px;
  font-weight: 500;
  line-height: 14px;
  min-height: 20px;
  padding: 0 8px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: inherit;
  white-space: nowrap;
}
.grouped-temporal-table :deep(.q-btn:before) {
  border-color: rgba(255, 255, 255, 0.2);
}
.temporal-cell--positive {
  color: #66e59e;
}
.temporal-cell--emphasis {
  font-weight: 700;
}
.grouped-temporal-table .grouped-temporal-table__accent {
  color: #008236;
}
.temporal-cell--negative {
  color: #ff8a8a;
}
.temporal-cell--badge {
  display: inline-block;
  padding: 2px 8px;
  border: 1px solid currentColor;
  border-radius: 8px;
  text-align: center;
}
.temporal-cell--badge.temporal-cell--positive {
  background: rgba(0, 122, 85, 0.2);
}
.temporal-cell--badge.temporal-cell--negative {
  background: rgba(127, 29, 29, 0.2);
}
@media (max-width: 600px) {
  .grouped-temporal-table {
    padding: 0 0 8px;
  }
  tr > th:first-child {
    width: 200px;
    min-width: 200px;
  }
}
</style>
