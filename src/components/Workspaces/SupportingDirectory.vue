<template>
  <section :class="{ 'partner-directory-section': kind === 'partners' }">
    <q-banner v-if="!available" class="workspace-error" role="status"
      >Consulta indisponível.</q-banner
    ><template v-if="kind === 'authors'"
      ><div v-if="available && rows.length" class="author-grid">
        <author-card
          v-for="row in rows"
          :key="row.id"
          :author="row"
          @edit="$emit('edit', $event)"
        />
      </div>
      <p v-if="available && !rows.length" class="workspace-empty">
        Nenhum redator encontrado.
      </p></template
    ><template v-else
      ><div class="workspace-metrics partner-metrics">
        <div v-for="metric in partnerMetrics" :key="metric.key" class="workspace-metric">
          <small>{{ metric.label }}</small
          ><strong :class="metric.tone" :data-unavailable="metric.value === 'Indisponível'">{{
            metric.value
          }}</strong>
        </div>
      </div>
      <div class="workspace-toolbar partner-toolbar">
        <q-input
          v-model="search"
          outlined
          dense
          dark
          clearable
          placeholder="Buscar parceiro, produto ou regra..."
          aria-label="Buscar parceiro, produto ou regra..."
          ><template #prepend
            ><img src="/icons/workspace-review/partner-search.svg" alt="" /></template></q-input
        ><q-btn
          class="partner-create"
          outline
          no-caps
          label="Criar Parceiro"
          @click="$emit('create')"
          ><img src="/icons/workspace-review/partner-plus.svg" alt=""
        /></q-btn>
      </div>
      <q-table
        dark
        flat
        dense
        :rows="filteredPartners"
        :columns="partnerColumns"
        row-key="id"
        hide-pagination
        :pagination="{ rowsPerPage: 0 }"
        :no-data-label="available ? 'Nenhum parceiro encontrado.' : 'Consulta indisponível.'"
        class="partner-directory"
        ><template #body-cell-name="p"
          ><q-td :props="p"
            ><button class="partner-row-identity" @click="selected = p.row">
              <span class="partner-row-avatar"
                ><img
                  v-if="p.row.logoUrl"
                  :src="p.row.logoUrl"
                  alt=""
                  class="partner-row-logo" /><img
                  v-else
                  src="/icons/partners/directory-bank.svg"
                  alt="" /></span
              ><span
                ><strong>{{ p.row.name || '—' }}</strong
                ><small>{{ p.row.publicCode || '—' }}</small></span
              >
            </button></q-td
          ></template
        ><template #body-cell-actions="p"
          ><q-td :props="p"
            ><q-btn
              flat
              dense
              :aria-label="'Abrir parceiro ' + p.row.name"
              @click="selected = p.row"
              ><img src="/icons/partners/directory-open.svg" alt="" /></q-btn></q-td
        ></template>
        <template #body-cell-products="p"
          ><q-td :props="p"
            ><div class="partner-service-counts">
              <span :class="{ enabled: partnerServices(p.row).enabled !== null }"
                >{{ partnerServices(p.row).enabled ?? '—' }}
                {{ partnerServices(p.row).enabled === 1 ? 'habilitado' : 'habilitados' }}</span
              ><span
                >{{ partnerServices(p.row).offered ?? '—' }}
                {{ partnerServices(p.row).offered === 1 ? 'oferecido' : 'oferecidos' }}</span
              >
            </div>
            <small class="partner-service-names">{{ p.value }}</small></q-td
          ></template
        >
        <template #body-cell-type="p"
          ><q-td :props="p"
            ><span class="partner-type-badge">{{ p.value || '—' }}</span></q-td
          ></template
        >
        <template #body-cell-status="p"
          ><q-td :props="p"
            ><span class="partner-status" :class="{ active: p.row.status === 'Active' }">{{
              { Active: 'Ativo', Inactive: 'Inativo' }[p.row.status] || p.row.status || '—'
            }}</span></q-td
          ></template
        >
        <template #body-cell-commission="p"
          ><q-td :props="p"
            ><strong class="partner-commission">{{ p.value }}</strong></q-td
          ></template
        ></q-table
      ></template
    ><partner-details :partner="selected" @close="selected = null" @edit="editSelected" />
  </section>
</template>
<script setup>
import { computed, ref } from 'vue'
import {
  matchesPartnerSearch,
  partnerServices,
  partnerCommission,
  partnerDirectoryMetrics,
} from 'src/services/creditPartnerDirectory'
import PartnerDetails from './PartnerDetails.vue'
import AuthorCard from './AuthorCard.vue'
import { columns, dateLabel } from 'src/services/financeService'
const props = defineProps({
  kind: { type: String, required: true },
  rows: { type: Array, default: () => [] },
  available: Boolean,
  summary: { type: Object, default: null },
})
const emit = defineEmits(['edit', 'create'])
const search = ref('')
const filteredPartners = computed(() =>
  (props.available ? props.rows : []).filter((row) => matchesPartnerSearch(row, search.value)),
)
function editSelected() {
  const row = selected.value
  selected.value = null
  emit('edit', row)
}
const selected = ref(null)
const partnerMetrics = computed(() =>
  partnerDirectoryMetrics(props.available ? props.summary : null),
)
const partnerColumns = columns([
  ['name', 'Parceiro'],
  ['type', 'Tipo'],
  ['products', 'Serviços', (r) => partnerServices(r).names?.join(', ') || '—'],
  ['commission', 'Comissão Vigente', (r) => partnerCommission(r.commission)],
  ['status', 'Status'],
  ['updatedAtUtc', 'Última Atualização', (r) => dateLabel(r.updatedAtUtc)],
  ['actions', ''],
])
</script>
<style scoped>
.author-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px;
}
@media (max-width: 1400px) {
  .author-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 900px) {
  .author-grid {
    grid-template-columns: 1fr;
  }
}
</style>

<style scoped>
.workspace-toolbar {
  justify-content: space-between;
}
.workspace-toolbar .q-input {
  flex: 1;
  max-width: 448px;
  min-width: 0;
}
.partner-create :deep(.q-btn__content) {
  flex-direction: row-reverse;
  gap: 8px;
}
</style>

<style scoped>
.partner-directory {
  background: linear-gradient(90deg, #0000001e, #0000000a);
  border: 1px solid #ffffff33;
  border-radius: 12px;
  box-shadow: 4px 4px 12px #00000021;
  backdrop-filter: blur(20px);
}
.partner-directory :deep(th) {
  font:
    500 12px/16px Inter,
    sans-serif;
  text-transform: uppercase;
  background: #ffffff08;
  color: #ffffffb8;
  padding: 12px 8px;
}
.partner-directory :deep(td) {
  padding: 8px;
  font:
    400 12px/16px Inter,
    sans-serif;
  color: #ffffffb8;
  border-color: #ffffff26;
}
.partner-row-identity {
  display: flex;
  gap: 12px;
  align-items: center;
  border: 0;
  padding: 0;
  background: none;
  text-align: left;
  color: white;
  cursor: pointer;
  min-width: 180px;
}
.partner-row-identity strong {
  display: block;
  font:
    700 14px/20px Inter,
    sans-serif;
}
.partner-row-identity small {
  display: block;
  color: #ffffffb8;
  font:
    400 12px/16px Consolas,
    monospace;
}
.partner-row-avatar {
  display: grid;
  place-items: center;
  flex: none;
  width: 40px;
  height: 40px;
  background: linear-gradient(90deg, #ffffff14, #ffffff08, #ffffff12);
  border: 1px solid #ffffff33;
  border-radius: 10px;
}
.partner-row-logo {
  max-width: 32px;
  max-height: 32px;
  object-fit: contain;
}
.partner-type-badge,
.partner-status {
  display: inline-flex;
  border: 1px solid white;
  border-radius: 8px;
  background: #00000033;
  padding: 3px 9px;
  color: white;
  white-space: nowrap;
}
.partner-status {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.25px;
}
.partner-status.active {
  color: #74ffa0;
  border-color: #74ffa0;
  background: #007a5533;
}
.partner-commission {
  color: #66e59e;
  font-size: 14px;
}
.partner-row-identity:focus-visible {
  outline: 2px solid #00a3ff;
  outline-offset: 4px;
}
</style>

<style scoped>
.partner-service-counts {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.partner-service-counts span {
  padding: 3px 9px;
  border: 1px solid white;
  border-radius: 8px;
  background: #00000033;
  color: white;
}
.partner-service-counts span:first-child {
  color: #ffffffb8;
  border-color: #ffffff33;
}
.partner-service-names {
  display: block;
  max-width: 600px;
  overflow-wrap: anywhere;
  margin-top: 6px;
  color: #ffffff99;
  font:
    400 12px/16px Inter,
    sans-serif;
}
</style>

<style scoped>
.partner-metrics {
  grid-template-columns: repeat(6, minmax(0, 1fr));
}
.partner-metrics .workspace-metric {
  min-height: 98px;
  padding: 16px 16px 24px;
  border: 0.8px solid #ffffff1f;
  border-radius: 14px;
  background: linear-gradient(188deg, #00000032, #00000014 51%, #00000008);
  box-shadow: 4px 4px 6px #00000021;
  backdrop-filter: blur(20px);
}
.partner-metrics small {
  font:
    600 12px/16px Inter,
    sans-serif;
  letter-spacing: 0.6px;
  color: #ffffff99;
  margin-bottom: 8px;
}
.partner-metrics strong {
  color: white;
  display: block;
  font:
    700 24px/32px Inter,
    sans-serif;
  overflow-wrap: anywhere;
}
.partner-metrics strong[data-unavailable='true'] {
  font-size: clamp(14px, 1.3vw, 24px);
}
.partner-toolbar {
  padding: 16px;
  border-bottom: 0.8px solid #ffffff1f;
  border-radius: 10px;
  background: linear-gradient(181deg, #00000032, #00000014 51%, #00000008);
  box-shadow: 4px 4px 6px #00000021;
}
.partner-toolbar :deep(.q-field__control) {
  height: 40px;
  min-height: 40px;
  border-radius: 8px;
  background: #0000000d;
}
.partner-toolbar :deep(.q-field__control::before) {
  border-color: #ffffff1f;
}
.partner-create {
  min-height: 40px;
  border-radius: 8px;
  background: #ffffff0f;
  color: #ffffffb8;
  font:
    500 14px/20px Inter,
    sans-serif;
}
.partner-create::before {
  border-color: #ffffff33;
}
.partner-service-counts span {
  border-width: 0.5px;
}
.partner-service-counts span.enabled {
  color: #74ffa0;
  border: 0.8px solid #74ffa0;
  background: #007a5533;
  text-transform: uppercase;
  font:
    500 10px/13.333px Inter,
    sans-serif;
  letter-spacing: 0.25px;
}
.partner-directory :deep(td) {
  white-space: normal;
}
.partner-directory :deep(th:first-child) {
  width: 244px;
}
.partner-directory :deep(th:nth-child(2)) {
  width: 276px;
}
.partner-directory :deep(th:nth-child(3)) {
  min-width: 300px;
}
.partner-directory :deep(th:nth-child(4)) {
  min-width: 174px;
}
.partner-directory :deep(th:nth-child(6)) {
  min-width: 180px;
}
@media (max-width: 1300px) {
  .partner-metrics {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
@media (max-width: 650px) {
  .partner-metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .partner-toolbar {
    align-items: stretch;
    flex-direction: column;
  }
  .partner-toolbar .q-input {
    max-width: none;
    width: 100%;
  }
}
</style>

<style scoped>
.partner-metrics strong.warning {
  color: #ffd56a;
}
.partner-metrics strong.positive {
  color: #66e59e;
}
</style>
