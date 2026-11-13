<template>
  <section>
    <q-banner v-if="!available" class="workspace-error" role="status"
      >Consulta indisponível.</q-banner
    ><template v-if="kind === 'authors'"
      ><div class="workspace-cards">
        <article v-for="row in rows" :key="row.id" class="workspace-record">
          <div class="workspace-record-head">
            <q-avatar size="48px">{{ row.name?.slice(0, 1) || '—' }}</q-avatar>
            <div>
              <h2>{{ row.name }}</h2>
              <p>{{ row.role || '—' }}</p>
              <small>{{ row.attribution || '—' }}</small>
            </div>
            <row-actions
              dark
              :actions="[{ name: 'edit', label: 'Editar', icon: 'edit' }]"
              @select="$emit('edit', row)"
            />
          </div>
          <dl>
            <div>
              <dt>Publicações</dt>
              <dd>{{ row.publicationsCount ?? 'Indisponível' }}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{{ row.status || '—' }}</dd>
            </div>
          </dl>
          <q-expansion-item v-for="field in authorFields" :key="field.key" :label="field.label"
            ><p class="workspace-preview">
              {{ row[field.key] || 'Não informado' }}
            </p></q-expansion-item
          >
        </article>
      </div>
      <p v-if="available && !rows.length" class="workspace-empty">
        Nenhum redator encontrado.
      </p></template
    ><template v-else
      ><div class="workspace-metrics">
        <div v-for="label in partnerMetrics" :key="label" class="workspace-metric">
          <small>{{ label }}</small
          ><strong>Indisponível</strong>
        </div>
      </div>
      <q-table
        dark
        flat
        dense
        :rows="rows"
        :columns="partnerColumns"
        row-key="id"
        hide-pagination
        :pagination="{ rowsPerPage: 0 }"
        :no-data-label="available ? 'Nenhum parceiro encontrado.' : 'Consulta indisponível.'"
        ><template #body-cell-name="p"
          ><q-td :props="p"
            ><q-btn flat no-caps :label="p.row.name" @click="selected = p.row" /></q-td></template
        ><template #body-cell-actions="p"
          ><q-td :props="p"
            ><row-actions
              dark
              :actions="[
                { name: 'open', label: 'Abrir', icon: 'visibility' },
                { name: 'edit', label: 'Editar', icon: 'edit' },
              ]"
              @select="
                $event === 'open' ? (selected = p.row) : $emit('edit', p.row)
              " /></q-td></template></q-table></template
    ><partner-details :partner="selected" @close="selected = null" @edit="editSelected" />
  </section>
</template>
<script setup>
import { ref } from 'vue'
import RowActions from 'src/components/Entity/RowActions.vue'
import PartnerDetails from './PartnerDetails.vue'
import { columns, dateLabel } from 'src/services/financeService'
defineProps({
  kind: { type: String, required: true },
  rows: { type: Array, default: () => [] },
  available: Boolean,
})
const emit = defineEmits(['edit'])
function editSelected() {
  const row = selected.value
  selected.value = null
  emit('edit', row)
}
const selected = ref(null)
const authorFields = [
  { key: 'economicView', label: 'Visão econômica' },
  { key: 'politicalView', label: 'Visão política' },
  { key: 'philosophy', label: 'Filosofia de vida' },
]
const partnerMetrics = [
  'Parceiros Ativos',
  'Produtos Cadastrados',
  'Tabelas Vigentes',
  'Tabelas Vencendo',
  'Maior Comissão',
  'Melhor Conversão',
]
const partnerColumns = columns([
  ['name', 'Parceiro'],
  ['type', 'Tipo'],
  ['products', 'Serviços', (r) => (r.products || []).join(', ') || '—'],
  [
    'commission',
    'Comissão Vigente',
    (r) => (r.commission == null ? 'Indisponível' : r.commission + '%'),
  ],
  ['status', 'Status'],
  ['updatedAtUtc', 'Última Atualização', (r) => dateLabel(r.updatedAtUtc)],
  ['actions', ''],
])
</script>
<style scoped>
.workspace-record-head > div {
  min-width: 0;
  flex: 1;
}
.workspace-record-head .q-avatar {
  flex: none;
}
</style>
